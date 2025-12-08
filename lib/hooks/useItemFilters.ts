import { useState, useMemo } from 'react';
import type { Item } from '@/lib/services/items';

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'alpha-asc'
  | 'alpha-desc';

export function useItemFilters(allItems: Item[]) {
  const [hideDone, setHideDone] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Filter and sort items based on current settings
  const filteredItems = useMemo(() => {
    // First, filter items
    const filtered = allItems.filter((item) => {
      if (hideDone && item.status === 'done') return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(item.categoryId)
      )
        return false;
      if (selectedPriorities.length > 0) {
        if (!item.priority || !selectedPriorities.includes(item.priority)) {
          return false;
        }
      }
      return true;
    });

    // Then, sort items
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [allItems, hideDone, selectedCategories, selectedPriorities, sortBy]);

  return {
    // Filter state
    hideDone,
    selectedCategories,
    selectedPriorities,
    sortBy,

    // Filter setters
    setHideDone,
    setSelectedCategories,
    setSelectedPriorities,
    setSortBy,

    // Filtered results
    filteredItems,
  };
}
