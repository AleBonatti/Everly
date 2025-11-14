/**
 * useAdminActions Hook
 *
 * Manages admin action data with optimistic updates
 */

import { useState, useEffect, useCallback } from 'react'
import {
  listActions,
  createAction,
  updateAction,
  deleteAction,
  reorderActions,
  type AdminAction,
  type CreateActionInput,
  type UpdateActionInput,
} from '@/lib/services/admin-actions'

export function useAdminActions() {
  const [actions, setActions] = useState<AdminAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load actions
  const loadActions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listActions()
      setActions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load actions')
      console.error('Error loading actions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadActions()
  }, [loadActions])

  // Create new action
  const createNewAction = useCallback(async (input: CreateActionInput) => {
    try {
      const newAction = await createAction(input)

      // Optimistic update
      setActions((prev) => [...prev, newAction])

      return newAction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create action')
      throw err
    }
  }, [])

  // Update action
  const updateExistingAction = useCallback(async (actionId: string, input: UpdateActionInput) => {
    // Store previous state for rollback
    const previousActions = actions

    try {
      // Optimistic update
      setActions((prev) =>
        prev.map((action) =>
          action.id === actionId
            ? { ...action, ...input, updatedAt: new Date().toISOString() }
            : action
        )
      )

      const updatedAction = await updateAction(actionId, input)

      // Update with server response
      setActions((prev) =>
        prev.map((action) => (action.id === actionId ? updatedAction : action))
      )

      return updatedAction
    } catch (err) {
      // Rollback on error
      setActions(previousActions)
      setError(err instanceof Error ? err.message : 'Failed to update action')
      throw err
    }
  }, [actions])

  // Delete action
  const removeAction = useCallback(async (actionId: string) => {
    // Store previous state for rollback
    const previousActions = actions

    try {
      // Optimistic update
      setActions((prev) => prev.filter((action) => action.id !== actionId))

      await deleteAction(actionId)
    } catch (err) {
      // Rollback on error
      setActions(previousActions)
      setError(err instanceof Error ? err.message : 'Failed to delete action')
      throw err
    }
  }, [actions])

  // Reorder actions (batch update)
  const reorderActionsList = useCallback(async (reorderedActions: AdminAction[]) => {
    // Store previous state for rollback
    const previousActions = actions

    try {
      // Optimistic update - immediately update the UI
      setActions(reorderedActions)

      // Prepare batch update payload
      const items = reorderedActions.map((action, index) => ({
        id: action.id,
        displayOrder: index,
      }))

      // Call batch API
      await reorderActions(items)
    } catch (err) {
      // Rollback on error
      setActions(previousActions)
      setError(err instanceof Error ? err.message : 'Failed to reorder actions')
      throw err
    }
  }, [actions])

  return {
    actions,
    isLoading,
    error,
    loadActions,
    createNewAction,
    updateAction: updateExistingAction,
    removeAction,
    reorderActions: reorderActionsList,
  }
}
