/**
 * Admin API - Individual User Management
 *
 * DELETE /api/admin/users/[id] - Delete a user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, userRoles } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'
import { createAdminClient } from '@/lib/supabase/admin'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params

    // Require admin role
    const authContext = await requireAdmin(request)

    // Prevent admin from deleting themselves
    if (userId === authContext.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 403 }
      )
    }

    // Delete from Supabase Auth using admin client
    const adminClient = createAdminClient()
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to delete user from auth' },
        { status: 400 }
      )
    }

    // Delete user role from database (cascade will handle this if FK is set)
    const db = getDb()
    await db
      .delete(userRoles)
      .where(eq(userRoles.userId, userId))

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
