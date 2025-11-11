/**
 * Client-Side Auth Utilities
 *
 * Provides helper functions for checking user roles on the client side.
 * Fetches role from database via API to ensure accuracy.
 */

import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/auth';
import { USER_ROLES } from '@/types/auth';

/**
 * Get the current user's role with hybrid approach
 * 1. First tries JWT app_metadata (fast, no DB query)
 * 2. Falls back to database via API if JWT doesn't have role yet
 * Returns 'user' if no role is found or if not authenticated
 */
export async function getUserRole(): Promise<UserRole> {
  try {
    // Check if user is authenticated first
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return USER_ROLES.USER;
    }

    // Try to get role from JWT first (fast path)
    const roleFromJWT = user.app_metadata?.user_role as UserRole | undefined;
    if (roleFromJWT && Object.values(USER_ROLES).includes(roleFromJWT)) {
      return roleFromJWT;
    }

    // Fallback: Fetch role from database via API (for users who haven't re-logged in)
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      return USER_ROLES.USER;
    }

    const data = await response.json();
    return data.user?.role || USER_ROLES.USER;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return USER_ROLES.USER;
  }
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === USER_ROLES.ADMIN;
}

/**
 * Get the current user's information including role from database
 */
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
