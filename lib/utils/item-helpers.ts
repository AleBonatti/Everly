import type { Category } from '@/lib/services/categories';
import type { Action } from '@/lib/services/actions';

/**
 * Get the label for a category by its ID
 */
export function getCategoryLabel(
  categoryId: string,
  categories: Category[]
): string {
  const category = categories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

/**
 * Get the icon for a category by its ID
 */
export function getCategoryIcon(
  categoryId: string,
  categories: Category[]
): string | null {
  const category = categories.find((c) => c.id === categoryId);
  return category?.icon || null;
}

/**
 * Get the label for an action by its ID
 */
export function getActionLabel(
  actionId: string | null | undefined,
  actions: Action[]
): string | null {
  if (!actionId) return null;
  const action = actions.find((a) => a.id === actionId);
  return action?.name || null;
}
