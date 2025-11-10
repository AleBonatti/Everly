/**
 * useCategories Hook
 *
 * Custom React hook for fetching categories from Supabase.
 * Provides loading states and error handling.
 */

'use client'

import { useState, useEffect } from 'react'
import { listCategories, type Category } from '@/lib/services/categories'

export interface UseCategoriesResult {
  categories: Category[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching the list of categories
 */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listCategories()
      setCategories(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories'
      setError(errorMessage)
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
  }
}
