/**
 * Admin API - Users List
 *
 * GET /api/admin/users - List all users with their roles (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, userRoles } from '@/lib/db'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/users
 * List all users with their roles (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Get all users from Supabase Auth
    const supabase = await createClient()

    // Note: listUsers requires service role, but we're using the authenticated user's client
    // For a production app, you might want to create a service role client here
    // For now, we'll just return user_roles from our database

    // Fetch all user roles from database
    const db = getDb()
    const roles = await db
      .select()
      .from(userRoles)
      .orderBy(userRoles.createdAt)

    // TODO: In production, join with auth.users to get email/name
    // This requires either:
    // 1. Service role access to auth.users table
    // 2. Or storing user info in your own users table

    return NextResponse.json({
      users: roles,
      message: 'User roles retrieved successfully',
      note: 'To get full user details (email, name), you need to either use Supabase Admin API or store user info in your database',
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
