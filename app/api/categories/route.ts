/**
 * Categories API Routes
 *
 * GET /api/categories - List all categories
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, categories } from '@/lib/db'
import { asc } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/categories
 * List all global categories ordered by display_order
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

    // Fetch categories from database
    const db = getDb()
    const result = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
