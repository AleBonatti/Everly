/**
 * Admin API - Individual Category Management
 *
 * GET /api/admin/categories/[id] - Get a category (admin only)
 * PATCH /api/admin/categories/[id] - Update a category (admin only)
 * DELETE /api/admin/categories/[id] - Delete a category (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, categories } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/categories/[id]
 * Get a category (admin only)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: categoryId } = await context.params

    // Require admin role
    await requireAdmin(request)

    // Fetch category from database
    const db = getDb()
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/categories/[id]
 * Update a category (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: categoryId } = await context.params

    // Require admin role
    await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { name, type, displayOrder } = body as {
      name?: string
      type?: 'default' | 'custom'
      displayOrder?: number
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: sql`NOW()`,
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: 'Category name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (type !== undefined) {
      if (type !== 'default' && type !== 'custom') {
        return NextResponse.json(
          { error: 'Invalid category type' },
          { status: 400 }
        )
      }
      updateData.type = type
    }

    if (displayOrder !== undefined) {
      updateData.displayOrder = displayOrder
    }

    // Update category in database
    const db = getDb()
    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, categoryId))
      .returning()

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      category: updatedCategory,
      message: 'Category updated successfully',
    })
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

    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: categoryId } = await context.params

    // Require admin role
    await requireAdmin(request)

    // Check if category exists and get its type
    const db = getDb()
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Prevent deleting default categories
    if (category.type === 'default') {
      return NextResponse.json(
        { error: 'Cannot delete default categories' },
        { status: 403 }
      )
    }

    // Delete category from database
    await db
      .delete(categories)
      .where(eq(categories.id, categoryId))

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
