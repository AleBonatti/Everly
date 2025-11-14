/**
 * useItems Hook
 *
 * Custom React hook for managing items state with Supabase persistence.
 * Provides CRUD operations with loading states and error handling.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  toggleItemStatus,
  type Item,
  type CreateItemInput,
  type UpdateItemInput,
  type ListItemsOptions,
} from '@/lib/services/items'

export interface UseItemsResult {
  items: Item[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createNewItem: (input: CreateItemInput) => Promise<Item>
  updateExistingItem: (id: string, input: UpdateItemInput) => Promise<Item>
  deleteExistingItem: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<Item>
}

/**
 * Hook for managing a list of items with filtering
 */
export function useItems(options: ListItemsOptions = {}): UseItemsResult {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Destructure options to use as stable dependencies
  const { categoryId, status, includeAll } = options

  // Fetch items from database
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listItems({ categoryId, status, includeAll })
      setItems(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items'
      setError(errorMessage)
      console.error('Error fetching items:', err)
    } finally {
      setLoading(false)
    }
  }, [categoryId, status, includeAll])

  // Initial fetch
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Create new item
  const createNewItem = useCallback(async (input: CreateItemInput): Promise<Item> => {
    try {
      setError(null)
      const newItem = await createItem(input)
      // Optimistically add to local state
      setItems(prev => [newItem, ...prev])
      return newItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Update existing item
  const updateExistingItem = useCallback(async (id: string, input: UpdateItemInput): Promise<Item> => {
    try {
      setError(null)
      const updatedItem = await updateItem(id, input)
      // Optimistically update local state
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Delete item
  const deleteExistingItem = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await deleteItem(id)
      // Optimistically remove from local state
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Toggle item status
  const toggleStatus = useCallback(async (id: string): Promise<Item> => {
    // Store previous state for rollback
    const previousItems = items

    try {
      setError(null)

      // Optimistic update - immediately toggle in UI
      setItems(prev => prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'done' ? 'todo' : 'done' }
          : item
      ))

      // Then sync with server
      const updatedItem = await toggleItemStatus(id)

      // Update with server response
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item))

      return updatedItem
    } catch (err) {
      // Rollback on error
      setItems(previousItems)
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle item status'
      setError(errorMessage)
      throw err
    }
  }, [items])

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    createNewItem,
    updateExistingItem,
    deleteExistingItem,
    toggleStatus,
  }
}

/**
 * Hook for managing a single item
 */
export function useItem(id: string | null) {
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setItem(null)
      setLoading(false)
      return
    }

    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getItem(id)
        setItem(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load item'
        setError(errorMessage)
        console.error('Error fetching item:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  return { item, loading, error }
}

/**
 * Hook for optimistic mutations without managing full list state
 * Useful when you just need CRUD operations without local state
 */
export function useItemMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (input: CreateItemInput): Promise<Item> => {
    try {
      setLoading(true)
      setError(null)
      const newItem = await createItem(input)
      return newItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (id: string, input: UpdateItemInput): Promise<Item> => {
    try {
      setLoading(true)
      setError(null)
      const updatedItem = await updateItem(id, input)
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await deleteItem(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const toggle = useCallback(async (id: string): Promise<Item> => {
    try {
      setLoading(true)
      setError(null)
      const updatedItem = await toggleItemStatus(id)
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle status'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    create,
    update,
    remove,
    toggle,
    loading,
    error,
  }
}
