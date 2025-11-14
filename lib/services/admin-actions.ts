/**
 * Admin Actions Service
 *
 * Provides admin CRUD operations for action management.
 * Uses fetch API to communicate with Next.js API routes.
 */

// Domain types
export interface AdminAction {
  id: string
  name: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateActionInput {
  name: string
  displayOrder?: number
}

export interface UpdateActionInput {
  name?: string
  displayOrder?: number
}

/**
 * Transform API response to domain action
 */
function transformApiAction(apiAction: any): AdminAction {
  return {
    id: apiAction.id,
    name: apiAction.name,
    displayOrder: apiAction.displayOrder || apiAction.display_order || 0,
    createdAt: apiAction.createdAt || apiAction.created_at,
    updatedAt: apiAction.updatedAt || apiAction.updated_at,
  }
}

/**
 * List all actions (admin only)
 */
export async function listActions(): Promise<AdminAction[]> {
  const response = await fetch('/api/admin/actions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch actions' }))
    throw new Error(error.error || 'Failed to fetch actions')
  }

  const data = await response.json()

  // The API might return { actions: [...] } or just [...]
  const actions = data.actions || data

  return actions.map(transformApiAction)
}

/**
 * Get a single action (admin only)
 */
export async function getAction(actionId: string): Promise<AdminAction> {
  const response = await fetch(`/api/admin/actions/${actionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch action' }))
    throw new Error(error.error || 'Failed to fetch action')
  }

  const data = await response.json()
  return transformApiAction(data)
}

/**
 * Create a new action (admin only)
 */
export async function createAction(input: CreateActionInput): Promise<AdminAction> {
  const response = await fetch('/api/admin/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create action' }))
    throw new Error(error.error || 'Failed to create action')
  }

  const data = await response.json()
  return transformApiAction(data.action || data)
}

/**
 * Update an action (admin only)
 */
export async function updateAction(
  actionId: string,
  input: UpdateActionInput
): Promise<AdminAction> {
  const response = await fetch(`/api/admin/actions/${actionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update action' }))
    throw new Error(error.error || 'Failed to update action')
  }

  const data = await response.json()
  return transformApiAction(data.action || data)
}

/**
 * Delete an action (admin only)
 */
export async function deleteAction(actionId: string): Promise<void> {
  const response = await fetch(`/api/admin/actions/${actionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete action' }))
    throw new Error(error.error || 'Failed to delete action')
  }
}

/**
 * Batch reorder actions (admin only)
 */
export async function reorderActions(
  items: Array<{ id: string; displayOrder: number }>
): Promise<void> {
  const response = await fetch('/api/admin/actions/reorder', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to reorder actions' }))
    throw new Error(error.error || 'Failed to reorder actions')
  }
}
