/**
 * Admin API - User Role Management
 *
 * PATCH /api/admin/users/[id]/role - Update a user's role (admin only)
 * GET /api/admin/users/[id]/role - Get a user's role (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, userRoles } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import { USER_ROLES, type UserRole } from '@/types/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/users/[id]/role
 * Get a user's role (admin only)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params

    // Require admin role
    await requireAdmin(request)

    // Fetch user role from database
    const db = getDb()
    const [userRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1)

    if (!userRole) {
      // User exists but no role record - return default
      return NextResponse.json({
        userId,
        role: USER_ROLES.USER,
        message: 'No role record found, returning default role',
      })
    }

    return NextResponse.json(userRole)
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching user role:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users/[id]/role
 * Update a user's role (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params

    // Require admin role
    const authContext = await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { role, fullName } = body as { role?: UserRole; fullName?: string }

    // Validate role if provided
    if (role && !Object.values(USER_ROLES).includes(role)) {
      return NextResponse.json(
        {
          error: 'Invalid role',
          validRoles: Object.values(USER_ROLES),
        },
        { status: 400 }
      )
    }

    // Prevent admins from demoting themselves
    if (role && userId === authContext.user.id && role === USER_ROLES.USER) {
      return NextResponse.json(
        { error: 'Cannot demote yourself. Ask another admin to change your role.' },
        { status: 403 }
      )
    }

    // Update user metadata in Supabase Auth if fullName is provided
    if (fullName !== undefined) {
      const adminClient = createAdminClient()
      const { error: authError } = await adminClient.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            full_name: fullName,
          },
        }
      )

      if (authError) {
        return NextResponse.json(
          { error: authError.message || 'Failed to update user metadata' },
          { status: 400 }
        )
      }
    }

    // Update user role in database if provided
    let updatedUserRole
    if (role) {
      const db = getDb()
      const [result] = await db
        .insert(userRoles)
        .values({
          userId,
          role,
        })
        .onConflictDoUpdate({
          target: userRoles.userId,
          set: {
            role,
            updatedAt: sql`NOW()`,
          },
        })
        .returning()
      updatedUserRole = result
    } else {
      // If only updating fullName, fetch the current role
      const db = getDb()
      const [result] = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, userId))
        .limit(1)
      updatedUserRole = result
    }

    return NextResponse.json({
      ...updatedUserRole,
      fullName: fullName !== undefined ? fullName : undefined,
      message: 'User updated successfully',
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
