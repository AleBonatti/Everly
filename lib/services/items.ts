/**
 * Items Service
 *
 * Provides CRUD operations for items with Supabase integration.
 * Handles data transformation between database and domain types.
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

// Database types
type DbItem = Database['public']['Tables']['items']['Row']
type DbItemInsert = Database['public']['Tables']['items']['Insert']
type DbItemUpdate = Database['public']['Tables']['items']['Update']

// Domain types
export interface Item {
  id: string
  userId: string
  categoryId: string
  title: string
  description?: string | null
  status: 'todo' | 'done'
  priority?: 'low' | 'medium' | 'high' | null
  url?: string | null
  location?: string | null
  note?: string | null
  targetDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateItemInput {
  categoryId: string
  title: string
  description?: string | null
  status?: 'todo' | 'done'
  priority?: 'low' | 'medium' | 'high' | null
  url?: string | null
  location?: string | null
  note?: string | null
  targetDate?: string | null
}

export interface UpdateItemInput {
  title?: string
  description?: string | null
  status?: 'todo' | 'done'
  priority?: 'low' | 'medium' | 'high' | null
  url?: string | null
  location?: string | null
  note?: string | null
  targetDate?: string | null
}

export interface ListItemsOptions {
  categoryId?: string
  status?: 'todo' | 'done'
  includeAll?: boolean
}

/**
 * Transform database item to domain item
 */
function transformDbItem(dbItem: DbItem): Item {
  return {
    id: dbItem.id,
    userId: dbItem.user_id,
    categoryId: dbItem.category_id,
    title: dbItem.title,
    description: dbItem.description,
    status: dbItem.status,
    priority: dbItem.priority,
    url: dbItem.url,
    location: dbItem.location,
    note: dbItem.note,
    targetDate: dbItem.target_date,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
  }
}

/**
 * List all items for the current user with optional filtering
 */
export async function listItems(options: ListItemsOptions = {}): Promise<Item[]> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Build query
  let query = supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Apply filters
  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch items: ${error.message}`)
  }

  return data.map(transformDbItem)
}

/**
 * Get a single item by ID
 */
export async function getItem(id: string): Promise<Item | null> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch item: ${error.message}`)
  }

  return transformDbItem(data)
}

/**
 * Create a new item
 */
export async function createItem(input: CreateItemInput): Promise<Item> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Prepare insert data
  const insertData: DbItemInsert = {
    user_id: user.id,
    category_id: input.categoryId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: input.status || 'todo',
    priority: input.priority || null,
    url: input.url?.trim() || null,
    location: input.location?.trim() || null,
    note: input.note?.trim() || null,
    target_date: input.targetDate || null,
  }

  const { data, error } = await supabase
    .from('items')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create item: ${error.message}`)
  }

  return transformDbItem(data)
}

/**
 * Update an existing item
 */
export async function updateItem(id: string, input: UpdateItemInput): Promise<Item> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Prepare update data
  const updateData: DbItemUpdate = {}

  if (input.title !== undefined) {
    updateData.title = input.title.trim()
  }
  if (input.description !== undefined) {
    updateData.description = input.description?.trim() || null
  }
  if (input.status !== undefined) {
    updateData.status = input.status
  }
  if (input.priority !== undefined) {
    updateData.priority = input.priority
  }
  if (input.url !== undefined) {
    updateData.url = input.url?.trim() || null
  }
  if (input.location !== undefined) {
    updateData.location = input.location?.trim() || null
  }
  if (input.note !== undefined) {
    updateData.note = input.note?.trim() || null
  }
  if (input.targetDate !== undefined) {
    updateData.target_date = input.targetDate
  }

  const { data, error } = await supabase
    .from('items')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update item: ${error.message}`)
  }

  return transformDbItem(data)
}

/**
 * Delete an item
 */
export async function deleteItem(id: string): Promise<void> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to delete item: ${error.message}`)
  }
}

/**
 * Toggle item status between 'todo' and 'done'
 */
export async function toggleItemStatus(id: string): Promise<Item> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // First get the current item to determine new status
  const currentItem = await getItem(id)
  if (!currentItem) {
    throw new Error('Item not found')
  }

  const newStatus = currentItem.status === 'todo' ? 'done' : 'todo'

  return updateItem(id, { status: newStatus })
}
