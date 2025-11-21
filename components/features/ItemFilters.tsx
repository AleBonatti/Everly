'use client';

import React from 'react';
import { Plus, AlertCircle, ArrowUp, Circle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import MultiSelectCategoryFilter from '@/components/ui/MultiSelectCategoryFilter';
import Badge from '@/components/ui/Badge';

export interface ItemFiltersProps {
  categories: { value: string; label: string }[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  hideDone: boolean;
  onHideDoneChange: (checked: boolean) => void;
  selectedPriorities: string[];
  onPriorityChange: (priorities: string[]) => void;
  onAddClick: () => void;
}

const ItemFilters: React.FC<ItemFiltersProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  hideDone,
  onHideDoneChange,
  selectedPriorities,
  onPriorityChange,
  onAddClick,
}) => {
  const priorityIcons = {
    high: AlertCircle,
    medium: ArrowUp,
    low: Circle,
  };

  const priorityVariants = {
    high: 'danger' as const,
    medium: 'warning' as const,
    low: 'success' as const,
  };

  const handlePriorityToggle = (priority: string) => {
    onPriorityChange(
      selectedPriorities.includes(priority)
        ? selectedPriorities.filter((p) => p !== priority)
        : [...selectedPriorities, priority]
    );
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Top row: Category filter, Toggle, and Add button */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="space-x-1">
            {(['high', 'medium', 'low'] as const).map((priority) => (
              <Badge
                key={priority}
                size="sm"
                text={priority.charAt(0).toUpperCase() + priority.slice(1)}
                variant={priorityVariants[priority]}
                icon={priorityIcons[priority]}
                selected={selectedPriorities.includes(priority)}
                onClick={() => handlePriorityToggle(priority)}
                className="cursor-pointer hover:opacity-80"
              />
            ))}
            {selectedPriorities.length > 0 && (
              <button
                type="button"
                onClick={() => onPriorityChange([])}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-500"
              >
                Clear
              </button>
            )}
          </div>
          <Toggle
            label="Hide done items"
            checked={hideDone}
            onChange={(e) => onHideDoneChange(e.target.checked)}
          />
        </div>
        <div className="flex gap-2">
          <MultiSelectCategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            label=""
            onChange={onCategoryChange}
          />
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={onAddClick}
          ></Button>
        </div>
      </div>
    </div>
  );
};

ItemFilters.displayName = 'ItemFilters';

export default ItemFilters;
