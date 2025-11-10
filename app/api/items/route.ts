/**
 * Items API Routes
 *
 * GET /api/items - List items with optional filters
 * POST /api/items - Create a new item
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, items } from '@/lib/db'
import { eq, and, desc } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/items
 * List all items for the current user with optional filtering
 * Query params: categoryId, status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status') as 'todo' | 'done' | null

    // Build where conditions
    const conditions = [eq(items.userId, user.id)]

    if (categoryId) {
      conditions.push(eq(items.categoryId, categoryId))
    }

    if (status) {
      conditions.push(eq(items.status, status))
    }

    // Fetch items from database
    const db = getDb()
    const result = await db
      .select()
      .from(items)
      .where(and(...conditions))
      .orderBy(desc(items.createdAt))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/items
 * Create a new item
 */
export async function POST(request: NextRequest) {
  try {
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
      categoryId,
      title,
      description,
      status = 'todo',
      priority,
      url,
      location,
      note,
      targetDate,
    } = body

    // Validate required fields
    if (!categoryId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, title' },
        { status: 400 }
      )
    }

    // Insert into database
    const db = getDb()
    const [newItem] = await db
      .insert(items)
      .values({
        userId: user.id,
        categoryId,
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority: priority || null,
        url: url?.trim() || null,
        location: location?.trim() || null,
        note: note?.trim() || null,
        targetDate: targetDate || null,
      })
      .returning()

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
