/**
 * Categories Service
 *
 * Provides read operations for categories with server-side API integration.
 * Uses fetch API to communicate with Next.js API routes.
 */

// Domain types
export interface Category {
  id: string
  name: string
  icon?: string | null
  type: 'default' | 'custom'
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Transform API response to domain category
 */
function transformApiCategory(apiCategory: any): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    icon: apiCategory.icon || null,
    type: apiCategory.type,
    displayOrder: apiCategory.display_order || apiCategory.displayOrder || 0,
    createdAt: apiCategory.created_at || apiCategory.createdAt,
    updatedAt: apiCategory.updated_at || apiCategory.updatedAt,
  }
}

/**
 * List all global categories (shared across all users)
 * Ordered by display_order for custom ordering
 */
export async function listCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories', {
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
  return data.map(transformApiCategory)
}

/**
 * Get a single global category by ID
 */
export async function getCategory(id: string): Promise<Category | null> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch category' }))
    throw new Error(error.error || 'Failed to fetch category')
  }

  const data = await response.json()
  return transformApiCategory(data)
}
