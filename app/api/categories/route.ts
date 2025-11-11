/**
 * Categories API Routes
 *
 * GET /api/categories - List all categories
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, categories } from '@/lib/db'
import { asc } from 'drizzle-orm'
import { requireAuth, handleAuthError } from '@/lib/auth/middleware'

/**
 * GET /api/categories
 * List all global categories ordered by display_order
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication using new middleware
    await requireAuth(request)

    // Fetch categories from database
    const db = getDb()
    const result = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder))

    return NextResponse.json(result)
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
