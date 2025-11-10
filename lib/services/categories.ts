/**
 * Categories Service
 *
 * Provides read operations for categories with Supabase integration.
 * Handles data transformation between database and domain types.
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Database types
type DbCategory = Database['public']['Tables']['categories']['Row'];

// Domain types
export interface Category {
  id: string;
  name: string;
  type: 'default' | 'custom';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform database category to domain category
 */
function transformDbCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    type: dbCategory.type,
    displayOrder: dbCategory.display_order || 0,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  };
}

/**
 * List all global categories (shared across all users)
 * Ordered by display_order for custom ordering
 */
export async function listCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data.map(transformDbCategory);
}

/**
 * Get a single global category by ID
 */
export async function getCategory(id: string): Promise<Category | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch category: ${error.message}`);
  }

  return transformDbCategory(data);
}
