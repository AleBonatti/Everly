/**
 * Items Service
 *
 * Provides CRUD operations for items with server-side API integration.
 * Uses fetch API to communicate with Next.js API routes.
 */

// Domain types
export interface ItemMetadata {
  year?: string
  creator?: string
  genre?: string
  rating?: string
  duration?: string
  [key: string]: string | undefined // Allow additional custom fields
}

export interface Item {
  id: string
  userId: string
  categoryId: string
  actionId?: string | null
  title: string
  description?: string | null
  status: 'todo' | 'done'
  priority?: 'low' | 'medium' | 'high' | null
  url?: string | null
  location?: string | null
  note?: string | null
  targetDate?: string | null
  imageUrl?: string | null
  metadata?: string | null // JSON string
  createdAt: string
  updatedAt: string
}

export interface CreateItemInput {
  categoryId: string
  actionId?: string | null
  title: string
  description?: string | null
  status?: 'todo' | 'done'
  priority?: 'low' | 'medium' | 'high' | null
  url?: string | null
  location?: string | null
  note?: string | null
  targetDate?: string | null
  imageUrl?: string | null
  metadata?: string | null
}

export interface UpdateItemInput {
  actionId?: string | null
  title?: string
  description?: string | null
  status?: 'todo' | 'done'
  priority?: 'low' | 'medium' | 'high' | null
  url?: string | null
  location?: string | null
  note?: string | null
  targetDate?: string | null
  imageUrl?: string | null
  metadata?: string | null
}

export interface ListItemsOptions {
  categoryId?: string
  status?: 'todo' | 'done'
  includeAll?: boolean
}

/**
 * Transform API response to domain item
 */
function transformApiItem(apiItem: any): Item {
  return {
    id: apiItem.id,
    userId: apiItem.user_id || apiItem.userId,
    categoryId: apiItem.category_id || apiItem.categoryId,
    actionId: apiItem.action_id || apiItem.actionId,
    title: apiItem.title,
    description: apiItem.description,
    status: apiItem.status,
    priority: apiItem.priority,
    url: apiItem.url,
    location: apiItem.location,
    note: apiItem.note,
    targetDate: apiItem.target_date || apiItem.targetDate,
    imageUrl: apiItem.image_url || apiItem.imageUrl,
    metadata: apiItem.metadata,
    createdAt: apiItem.created_at || apiItem.createdAt,
    updatedAt: apiItem.updated_at || apiItem.updatedAt,
  }
}

/**
 * List all items for the current user with optional filtering
 */
export async function listItems(options: ListItemsOptions = {}): Promise<Item[]> {
  const params = new URLSearchParams()

  if (options.categoryId) {
    params.append('categoryId', options.categoryId)
  }
  if (options.status) {
    params.append('status', options.status)
  }

  const url = `/api/items${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch items' }))
    throw new Error(error.error || 'Failed to fetch items')
  }

  const data = await response.json()
  return data.map(transformApiItem)
}

/**
 * Get a single item by ID
 */
export async function getItem(id: string): Promise<Item | null> {
  const response = await fetch(`/api/items/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch item' }))
    throw new Error(error.error || 'Failed to fetch item')
  }

  const data = await response.json()
  return transformApiItem(data)
}

/**
 * Create a new item
 */
export async function createItem(input: CreateItemInput): Promise<Item> {
  const response = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create item' }))
    throw new Error(error.error || 'Failed to create item')
  }

  const data = await response.json()
  return transformApiItem(data)
}

/**
 * Update an existing item
 */
export async function updateItem(id: string, input: UpdateItemInput): Promise<Item> {
  const response = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update item' }))
    throw new Error(error.error || 'Failed to update item')
  }

  const data = await response.json()
  return transformApiItem(data)
}

/**
 * Delete an item
 */
export async function deleteItem(id: string): Promise<void> {
  const response = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete item' }))
    throw new Error(error.error || 'Failed to delete item')
  }
}

/**
 * Toggle item status between 'todo' and 'done'
 */
export async function toggleItemStatus(id: string): Promise<Item> {
  // First get the current item to determine new status
  const currentItem = await getItem(id)
  if (!currentItem) {
    throw new Error('Item not found')
  }

  const newStatus = currentItem.status === 'todo' ? 'done' : 'todo'

  return updateItem(id, { status: newStatus })
}
