/**
 * LocalStorage utilities for optimistic UI and offline caching
 * Namespace: futurelist:*
 */

const STORAGE_PREFIX = 'futurelist:';

export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Get item from LocalStorage with type safety
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!item) return null;

    const parsed: StorageItem<T> = JSON.parse(item);

    // Check expiration
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Set item in LocalStorage with optional expiration
 */
export function setItem<T>(
  key: string,
  data: T,
  expiresInDays?: number
): void {
  if (typeof window === 'undefined') return;

  try {
    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: expiresInDays
        ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000
        : undefined,
    };

    window.localStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(item)
    );
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

/**
 * Remove item from LocalStorage
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

/**
 * Clear all FutureList data from LocalStorage
 */
export function clearAll(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get all keys with the FutureList prefix
 */
export function getAllKeys(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ''));
  } catch (error) {
    console.error('Error getting keys from localStorage:', error);
    return [];
  }
}

// Specific storage keys
export const STORAGE_KEYS = {
  ITEMS: 'items',
  CATEGORIES: 'categories',
  FILTERS: 'filters',
  USER: 'user',
} as const;
