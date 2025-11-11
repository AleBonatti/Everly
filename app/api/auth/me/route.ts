/**
 * Auth API - Current User Info
 *
 * GET /api/auth/me - Get current user's info including role from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb, userRoles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { USER_ROLES } from '@/types/auth';
import type { UserRole } from '@/types/auth';

/**
 * GET /api/auth/me
 * Get current user's information including role from database
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from Supabase Auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user role from database
    const db = getDb();
    const [userRoleRecord] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
      .limit(1);

    // Default to 'user' role if not found
    const role: UserRole = userRoleRecord?.role || USER_ROLES.USER;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    );
  }
}
