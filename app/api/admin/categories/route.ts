/**
 * Admin API - Categories Management
 *
 * GET /api/admin/categories - List all categories (admin only)
 * POST /api/admin/categories - Create a new category (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, categories } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

/**
 * GET /api/admin/categories
 * List all categories (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Fetch all categories from database
    const db = getDb()
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.displayOrder, categories.name)

    return NextResponse.json({
      categories: allCategories,
    })
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

/**
 * POST /api/admin/categories
 * Create a new category (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { name, type = 'custom', displayOrder = 0 } = body as {
      name: string
      type?: 'default' | 'custom'
      displayOrder?: number
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Create category in database
    const db = getDb()
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        type,
        displayOrder,
      })
      .returning()

    return NextResponse.json(
      {
        category: newCategory,
        message: 'Category created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      )
    }

    console.error('Error creating category:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
