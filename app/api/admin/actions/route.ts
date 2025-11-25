/**
 * Admin API - Actions Management
 *
 * GET /api/admin/actions - List all actions (admin only)
 * POST /api/admin/actions - Create a new action (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, actions } from '@/lib/db'
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

/**
 * GET /api/admin/actions
 * List all actions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Fetch all actions from database
    const db = getDb()
    const allActions = await db
      .select()
      .from(actions)
      .orderBy(actions.displayOrder, actions.name)

    return NextResponse.json({
      actions: allActions,
    })
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    console.error('Error fetching actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/actions
 * Create a new action (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request)

    // Parse request body
    const body = await request.json()
    const { name, displayOrder = 0 } = body as {
      name: string
      displayOrder?: number
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Create action in database
    const db = getDb()
    const [newAction] = await db
      .insert(actions)
      .values({
        name: name.trim(),
        displayOrder,
      })
      .returning()

    return NextResponse.json(
      {
        action: newAction,
        message: 'Action created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle auth errors (401, 403)
    if (error instanceof Error && (error.name === 'AuthError' || error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return handleAuthError(error)
    }

    // Check for unique constraint violation
    if (
      error instanceof Error &&
      (error.message.includes('unique') ||
        error.message.includes('duplicate key') ||
        (error as any).code === '23505')
    ) {
      return NextResponse.json(
        { error: 'An action with this name already exists' },
        { status: 409 }
      )
    }

    console.error('Error creating action:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create action'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
