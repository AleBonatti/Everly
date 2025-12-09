/**
 * String similarity utilities for duplicate detection
 * Feature: 001-ai-assistant
 *
 * Provides fuzzy matching capabilities for finding similar items
 */

import type { Item } from '@/lib/services/items'

/**
 * Calculate Levenshtein distance between two strings
 * Returns the number of single-character edits required to change one string into the other
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses normalized Levenshtein distance
 * 1.0 = identical, 0.0 = completely different
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0

  const normalized1 = str1.toLowerCase().trim()
  const normalized2 = str2.toLowerCase().trim()

  if (normalized1 === normalized2) return 1.0

  const maxLen = Math.max(normalized1.length, normalized2.length)
  if (maxLen === 0) return 1.0

  const distance = levenshteinDistance(normalized1, normalized2)
  return 1 - distance / maxLen
}

/**
 * Find the best matching item from a list based on title similarity
 * Returns null if no match above threshold (default 0.7)
 */
export function findBestMatch(
  query: string,
  items: Item[],
  threshold: number = 0.7
): Item | null {
  if (!items.length) return null

  let bestMatch: Item | null = null
  let bestScore = 0

  for (const item of items) {
    const score = calculateSimilarity(query, item.title)
    if (score > bestScore && score >= threshold) {
      bestScore = score
      bestMatch = item
    }
  }

  return bestMatch
}

/**
 * Find all items that are similar to a given title
 * Returns array of items above the similarity threshold (default 0.8 for duplicates)
 */
export function findSimilarItems(
  title: string,
  items: Item[],
  threshold: number = 0.8
): Item[] {
  if (!items.length) return []

  const similarItems: Item[] = []

  for (const item of items) {
    const score = calculateSimilarity(title, item.title)
    if (score >= threshold) {
      similarItems.push(item)
    }
  }

  return similarItems
}

/**
 * Check if two titles are likely duplicates
 * Uses a higher threshold (0.85) for duplicate detection
 */
export function areLikelyDuplicates(title1: string, title2: string): boolean {
  return calculateSimilarity(title1, title2) >= 0.85
}
