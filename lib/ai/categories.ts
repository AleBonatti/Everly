/**
 * Category utilities for AI Assistant
 * Feature: 001-ai-assistant
 *
 * Provides server-side category fetching for AI tools
 */

import { getDb, categories } from '@/lib/db'
import { asc } from 'drizzle-orm'

export interface CategoryForAI {
  id: string
  name: string
}

/**
 * Fetch all available categories for the AI system prompt
 * Returns simplified category list for the AI to choose from
 */
export async function getAvailableCategories(): Promise<CategoryForAI[]> {
  const db = getDb()

  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.displayOrder))

  return result
}

/**
 * Format categories for system prompt inclusion
 * Generates a human-readable list for the AI
 */
export function formatCategoriesForPrompt(cats: CategoryForAI[]): string {
  return cats.map(cat => `- ${cat.name} (ID: ${cat.id})`).join('\n')
}

/**
 * Validate if a category ID exists
 */
export async function isValidCategoryId(categoryId: string): Promise<boolean> {
  const cats = await getAvailableCategories()
  return cats.some(cat => cat.id === categoryId)
}
