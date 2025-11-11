/**
 * Admin Users Service
 *
 * Provides admin CRUD operations for user management.
 * Uses fetch API to communicate with Next.js API routes.
 */

import type { UserRole } from '@/types/auth'

// Domain types
export interface AdminUser {
  id: string
  email?: string
  fullName?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  email: string
  password: string
  fullName?: string
  role?: UserRole
}

export interface UpdateUserInput {
  fullName?: string
  role?: UserRole
}

/**
 * Transform API response to domain user
 */
function transformApiUser(apiUser: any): AdminUser {
  return {
    id: apiUser.userId || apiUser.user_id || apiUser.id,
    email: apiUser.email,
    fullName: apiUser.fullName || apiUser.full_name,
    role: apiUser.role,
    createdAt: apiUser.createdAt || apiUser.created_at,
    updatedAt: apiUser.updatedAt || apiUser.updated_at,
  }
}

/**
 * List all users with their roles (admin only)
 */
export async function listUsers(): Promise<AdminUser[]> {
  const response = await fetch('/api/admin/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch users' }))
    throw new Error(error.error || 'Failed to fetch users')
  }

  const data = await response.json()

  // The API might return { users: [...] } or just [...]
  const users = data.users || data

  return users.map(transformApiUser)
}

/**
 * Get a single user's role (admin only)
 */
export async function getUserRole(userId: string): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch user' }))
    throw new Error(error.error || 'Failed to fetch user')
  }

  const data = await response.json()
  return transformApiUser(data)
}

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(
  userId: string,
  input: UpdateUserInput
): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update user role' }))
    throw new Error(error.error || 'Failed to update user role')
  }

  const data = await response.json()
  return transformApiUser(data)
}

/**
 * Create a new user (admin only)
 * This will call the signup endpoint with admin privileges
 */
export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create user' }))
    throw new Error(error.error || 'Failed to create user')
  }

  const data = await response.json()
  return transformApiUser(data.user || data)
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete user' }))
    throw new Error(error.error || 'Failed to delete user')
  }
}
