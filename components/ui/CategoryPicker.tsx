'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CategoryPickerProps {
  categories: Array<{ value: string; label: string; color?: string }>;
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showAll?: boolean;
  allLabel?: string;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  value,
  onChange,
  label,
  error,
  required,
  disabled,
  showAll = false,
  allLabel = 'All',
}) => {
  const pickerId = `category-picker-${Math.random().toString(36).substring(2, 11)}`;
  const hasError = !!error;

  const allCategories = showAll
    ? [{ value: '', label: allLabel }, ...categories]
    : categories;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={pickerId}
          className={cn(
            'text-sm font-medium text-slate-700',
            disabled && 'opacity-50'
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? pickerId : undefined}
        aria-invalid={hasError}
        aria-describedby={error ? `${pickerId}-error` : undefined}
        className="flex flex-wrap gap-2"
      >
        {allCategories.map((category) => {
          const isSelected = value === category.value;
          return (
            <button
              key={category.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => !disabled && onChange(category.value)}
              disabled={disabled}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'bg-sky-500 text-white shadow-sm'
                  : hasError
                    ? 'border-2 border-red-500 bg-white text-red-700 hover:bg-red-50'
                    : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p
          id={`${pickerId}-error`}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

CategoryPicker.displayName = 'CategoryPicker';

export default CategoryPicker;
