/**
 * User Service
 *
 * Provides user profile and authentication operations with Supabase.
 */

import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  createdAt: string
}

export interface UpdateProfileInput {
  fullName?: string
  email?: string
}

export interface UpdatePasswordInput {
  newPassword: string
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || '',
    avatarUrl: user.user_metadata?.avatar_url || null,
    createdAt: user.created_at,
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const supabase = createClient()

  const updates: {
    email?: string
    data?: { full_name?: string }
  } = {}

  if (input.email) {
    updates.email = input.email
  }

  if (input.fullName !== undefined) {
    updates.data = {
      full_name: input.fullName,
    }
  }

  const { data, error } = await supabase.auth.updateUser(updates)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  if (!data.user) {
    throw new Error('Failed to update profile')
  }

  return {
    id: data.user.id,
    email: data.user.email || '',
    fullName: data.user.user_metadata?.full_name || '',
    avatarUrl: data.user.user_metadata?.avatar_url || null,
    createdAt: data.user.created_at,
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(input: UpdatePasswordInput): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: input.newPassword,
  })

  if (error) {
    throw new Error(`Failed to update password: ${error.message}`)
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(): Promise<void> {
  const supabase = createClient()

  // Note: Supabase doesn't have a direct deleteUser method from client
  // This would typically need to be done via an admin API or Edge Function
  // For now, we'll sign out the user
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Failed to delete account: ${error.message}`)
  }
}
