/**
 * useAdminUsers Hook
 *
 * Manages admin user data with optimistic updates
 */

import { useState, useEffect, useCallback } from 'react'
import {
  listUsers,
  createUser,
  updateUserRole,
  deleteUser,
  type AdminUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/services/admin-users'

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Create new user
  const createNewUser = useCallback(async (input: CreateUserInput) => {
    try {
      const newUser = await createUser(input)

      // Optimistic update
      setUsers((prev) => [...prev, newUser])

      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      throw err
    }
  }, [])

  // Update user role
  const updateUser = useCallback(async (userId: string, input: UpdateUserInput) => {
    // Store previous state for rollback
    const previousUsers = users

    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, ...input, updatedAt: new Date().toISOString() }
            : user
        )
      )

      const updatedUser = await updateUserRole(userId, input)

      // Update with server response
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      )

      return updatedUser
    } catch (err) {
      // Rollback on error
      setUsers(previousUsers)
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    }
  }, [users])

  // Delete user
  const removeUser = useCallback(async (userId: string) => {
    // Store previous state for rollback
    const previousUsers = users

    try {
      // Optimistic update
      setUsers((prev) => prev.filter((user) => user.id !== userId))

      await deleteUser(userId)
    } catch (err) {
      // Rollback on error
      setUsers(previousUsers)
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      throw err
    }
  }, [users])

  return {
    users,
    isLoading,
    error,
    loadUsers,
    createNewUser,
    updateUser,
    removeUser,
  }
}
