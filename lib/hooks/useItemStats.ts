import { useMemo } from 'react';
import type { Item } from '@/lib/services/items';

export interface ItemStats {
  total: number;
  done: number;
  todo: number;
  byCategory: Record<string, number>;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  completionRate: number;
}

export function useItemStats(items: Item[]): ItemStats {
  return useMemo(() => {
    const total = items.length;
    const done = items.filter((item) => item.status === 'done').length;
    const todo = items.filter((item) => item.status === 'todo').length;

    // Count items by category
    const byCategory: Record<string, number> = {};
    items.forEach((item) => {
      if (!byCategory[item.categoryId]) {
        byCategory[item.categoryId] = 0;
      }
      byCategory[item.categoryId]++;
    });

    // Count items by priority
    const byPriority = {
      high: items.filter((item) => item.priority === 'high').length,
      medium: items.filter((item) => item.priority === 'medium').length,
      low: items.filter((item) => item.priority === 'low').length,
    };

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      todo,
      byCategory,
      byPriority,
      completionRate,
    };
  }, [items]);
}
