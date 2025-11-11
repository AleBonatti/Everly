/**
 * Authentication and Authorization Middleware
 *
 * Provides reusable functions for protecting API routes with authentication
 * and role-based authorization checks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb, userRoles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { UserRole, AuthContext } from '@/types/auth';
import { USER_ROLES } from '@/types/auth';

/**
 * Authenticate request and extract user info with role (hybrid approach)
 * 1. First tries JWT app_metadata (fast, no DB query)
 * 2. Falls back to database if JWT doesn't have role yet
 * Returns null if authentication fails
 */
export async function authenticate(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Try to get role from JWT first (fast path)
    const roleFromJWT = user.app_metadata?.user_role as UserRole | undefined;
    let role: UserRole;

    if (roleFromJWT && Object.values(USER_ROLES).includes(roleFromJWT)) {
      // Use role from JWT if available
      role = roleFromJWT;
    } else {
      // Fallback: Fetch role from database (for users who haven't re-logged in)
      const db = getDb();
      const [userRoleRecord] = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, user.id))
        .limit(1);

      // Default to 'user' role if not found
      role = userRoleRecord?.role || USER_ROLES.USER;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Require authentication
 * Throws error if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const context = await authenticate(request);

  if (!context) {
    throw new AuthError('Unauthorized', 401);
  }

  return context;
}

/**
 * Require specific role(s)
 * Throws error if user doesn't have required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthContext> {
  const context = await requireAuth(request);

  if (!allowedRoles.includes(context.user.role)) {
    throw new AuthError(
      `Forbidden: Required role(s): ${allowedRoles.join(', ')}`,
      403
    );
  }

  return context;
}

/**
 * Require admin role
 * Convenience function for admin-only routes
 */
export async function requireAdmin(request: NextRequest): Promise<AuthContext> {
  return requireRole(request, [USER_ROLES.ADMIN]);
}

/**
 * Custom error class for auth errors
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Create unauthorized response (401)
 */
export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create forbidden response (403)
 */
export function forbidden(
  message = 'Forbidden: Insufficient permissions'
): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Handle auth errors and return appropriate response
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    if (error.statusCode === 401) {
      return unauthorized(error.message);
    }
    if (error.statusCode === 403) {
      return forbidden(error.message);
    }
  }

  console.error('Unexpected error in auth middleware:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
