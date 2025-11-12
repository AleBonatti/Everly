/**
 * useAdminCategories Hook
 *
 * Manages admin category data with optimistic updates
 */

import { useState, useEffect, useCallback } from 'react'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type AdminCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/lib/services/admin-categories'

export function useAdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      console.error('Error loading categories:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Create new category
  const createNewCategory = useCallback(async (input: CreateCategoryInput) => {
    try {
      const newCategory = await createCategory(input)

      // Optimistic update
      setCategories((prev) => [...prev, newCategory])

      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
      throw err
    }
  }, [])

  // Update category
  const updateExistingCategory = useCallback(async (categoryId: string, input: UpdateCategoryInput) => {
    // Store previous state for rollback
    const previousCategories = categories

    try {
      // Optimistic update
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? { ...category, ...input, updatedAt: new Date().toISOString() }
            : category
        )
      )

      const updatedCategory = await updateCategory(categoryId, input)

      // Update with server response
      setCategories((prev) =>
        prev.map((category) => (category.id === categoryId ? updatedCategory : category))
      )

      return updatedCategory
    } catch (err) {
      // Rollback on error
      setCategories(previousCategories)
      setError(err instanceof Error ? err.message : 'Failed to update category')
      throw err
    }
  }, [categories])

  // Delete category
  const removeCategory = useCallback(async (categoryId: string) => {
    // Store previous state for rollback
    const previousCategories = categories

    try {
      // Optimistic update
      setCategories((prev) => prev.filter((category) => category.id !== categoryId))

      await deleteCategory(categoryId)
    } catch (err) {
      // Rollback on error
      setCategories(previousCategories)
      setError(err instanceof Error ? err.message : 'Failed to delete category')
      throw err
    }
  }, [categories])

  return {
    categories,
    isLoading,
    error,
    loadCategories,
    createNewCategory,
    updateCategory: updateExistingCategory,
    removeCategory,
  }
}
