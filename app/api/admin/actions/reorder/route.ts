/**
 * Admin API - Batch Action Reordering
 *
 * PATCH /api/admin/actions/reorder - Batch update display order (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, actions } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

/**
 * PATCH /api/admin/actions/reorder
 * Batch update display order for multiple actions (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { items } = body as {
      items: Array<{ id: string; displayOrder: number }>
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid items array' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || typeof item.displayOrder !== 'number') {
        return NextResponse.json(
          { error: 'Each item must have id and displayOrder' },
          { status: 400 }
        )
      }
    }

    // Update all actions in a single transaction
    const db = getDb()

    // Use a transaction to ensure all updates succeed or none do
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(actions)
          .set({
            displayOrder: item.displayOrder,
            updatedAt: sql`NOW()`,
          })
          .where(eq(actions.id, item.id))
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully reordered ${items.length} actions`,
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error reordering actions:', error)
    return NextResponse.json(
      { error: 'Failed to reorder actions' },
      { status: 500 }
    )
  }
}
