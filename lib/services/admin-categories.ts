/**
 * Admin Categories Service
 *
 * Provides admin CRUD operations for category management.
 * Uses fetch API to communicate with Next.js API routes.
 */

// Domain types
export interface AdminCategory {
  id: string
  name: string
  icon?: string | null
  type: 'default' | 'custom'
  contentType?: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
  icon?: string | null
  type: 'default' | 'custom'
  contentType?: string
  displayOrder?: number
}

export interface UpdateCategoryInput {
  name?: string
  icon?: string | null
  type?: 'default' | 'custom'
  contentType?: string
  displayOrder?: number
}

/**
 * Transform API response to domain category
 */
function transformApiCategory(apiCategory: any): AdminCategory {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    icon: apiCategory.icon || null,
    type: apiCategory.type,
    contentType: apiCategory.contentType || apiCategory.content_type || 'generic',
    displayOrder: apiCategory.displayOrder || apiCategory.display_order || 0,
    createdAt: apiCategory.createdAt || apiCategory.created_at,
    updatedAt: apiCategory.updatedAt || apiCategory.updated_at,
  }
}

/**
 * List all categories (admin only)
 */
export async function listCategories(): Promise<AdminCategory[]> {
  const response = await fetch('/api/admin/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch categories' }))
    throw new Error(error.error || 'Failed to fetch categories')
  }

  const data = await response.json()

  // The API might return { categories: [...] } or just [...]
  const categories = data.categories || data

  return categories.map(transformApiCategory)
}

/**
 * Get a single category (admin only)
 */
export async function getCategory(categoryId: string): Promise<AdminCategory> {
  const response = await fetch(`/api/admin/categories/${categoryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch category' }))
    throw new Error(error.error || 'Failed to fetch category')
  }

  const data = await response.json()
  return transformApiCategory(data)
}

/**
 * Create a new category (admin only)
 */
export async function createCategory(input: CreateCategoryInput): Promise<AdminCategory> {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create category' }))
    throw new Error(error.error || 'Failed to create category')
  }

  const data = await response.json()
  return transformApiCategory(data.category || data)
}

/**
 * Update a category (admin only)
 */
export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput
): Promise<AdminCategory> {
  const response = await fetch(`/api/admin/categories/${categoryId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update category' }))
    throw new Error(error.error || 'Failed to update category')
  }

  const data = await response.json()
  return transformApiCategory(data.category || data)
}

/**
 * Delete a category (admin only)
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const response = await fetch(`/api/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete category' }))
    throw new Error(error.error || 'Failed to delete category')
  }
}

/**
 * Batch reorder categories (admin only)
 */
export async function reorderCategories(
  items: Array<{ id: string; displayOrder: number }>
): Promise<void> {
  const response = await fetch('/api/admin/categories/reorder', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to reorder categories' }))
    throw new Error(error.error || 'Failed to reorder categories')
  }
}
