/**
 * Admin API - Users Management
 *
 * GET /api/admin/users - List all users with their roles (admin only)
 * POST /api/admin/users - Create a new user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, userRoles } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/auth'

/**
 * GET /api/admin/users
 * List all users with their roles (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Fetch all user roles from database
    const db = getDb()
    const roles = await db
      .select()
      .from(userRoles)
      .orderBy(userRoles.createdAt)

    // For each user, try to get email and full_name from Supabase Auth using admin client
    const adminClient = createAdminClient()
    const usersWithEmails = await Promise.all(
      roles.map(async (role) => {
        try {
          const { data } = await adminClient.auth.admin.getUserById(role.userId)
          return {
            ...role,
            email: data.user?.email,
            fullName: data.user?.user_metadata?.full_name,
          }
        } catch (error) {
          // If we can't get user details, just return role data
          console.error(`Failed to fetch user details for ${role.userId}:`, error)
          return role
        }
      })
    )

    return NextResponse.json({
      users: usersWithEmails,
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

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { email, password, fullName, role = 'user' } = body as {
      email: string
      password: string
      fullName?: string
      role?: UserRole
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth using admin client with service role key
    const adminClient = createAdminClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName || '',
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user in auth' },
        { status: 400 }
      )
    }

    // Create or update user role in database
    // Note: The trigger on auth.users should auto-create with 'user' role
    // We use upsert to set the correct role if different from default
    const db = getDb()
    const [userRole] = await db
      .insert(userRoles)
      .values({
        userId: authData.user.id,
        role: role,
      })
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: {
          role: role,
          updatedAt: sql`NOW()`,
        },
      })
      .returning()

    return NextResponse.json(
      {
        user: {
          ...userRole,
          email: authData.user.email,
          fullName: authData.user.user_metadata?.full_name,
        },
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error creating user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
