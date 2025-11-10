/**
 * Item API Routes (Individual Item)
 *
 * GET /api/items/[id] - Get a single item
 * PATCH /api/items/[id] - Update an item
 * DELETE /api/items/[id] - Delete an item
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, items } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/items/[id]
 * Get a single item by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch item from database
    const db = getDb()
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.userId, user.id)))
      .limit(1)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/items/[id]
 * Update an item
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      description,
      status,
      priority,
      url,
      location,
      note,
      targetDate,
    } = body

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}

    if (title !== undefined) {
      updateData.title = title.trim()
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }
    if (status !== undefined) {
      updateData.status = status
    }
    if (priority !== undefined) {
      updateData.priority = priority
    }
    if (url !== undefined) {
      updateData.url = url?.trim() || null
    }
    if (location !== undefined) {
      updateData.location = location?.trim() || null
    }
    if (note !== undefined) {
      updateData.note = note?.trim() || null
    }
    if (targetDate !== undefined) {
      updateData.targetDate = targetDate
    }

    // Always update updatedAt
    updateData.updatedAt = new Date()

    // Update in database
    const db = getDb()
    const [updatedItem] = await db
      .update(items)
      .set(updateData)
      .where(and(eq(items.id, id), eq(items.userId, user.id)))
      .returning()

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/items/[id]
 * Delete an item
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete from database
    const db = getDb()
    const [deletedItem] = await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, user.id)))
      .returning()

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
