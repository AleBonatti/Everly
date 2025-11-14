/**
 * Admin API - Batch Category Reordering
 *
 * PATCH /api/admin/categories/reorder - Batch update display order (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, categories } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

/**
 * PATCH /api/admin/categories/reorder
 * Batch update display order for multiple categories (admin only)
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

    // Update all categories in a single transaction
    const db = getDb()

    // Use a transaction to ensure all updates succeed or none do
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(categories)
          .set({
            displayOrder: item.displayOrder,
            updatedAt: sql`NOW()`,
          })
          .where(eq(categories.id, item.id))
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully reordered ${items.length} categories`,
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error reordering categories:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}
