'use client'

/**
 * Multi-Select Category Filter Component
 *
 * A searchable dropdown that allows users to select multiple categories.
 * Selected categories are displayed as removable tags.
 */

import React, { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Category {
  value: string
  label: string
}

export interface MultiSelectCategoryFilterProps {
  categories: Category[]
  selectedCategories: string[]
  onChange: (selectedCategories: string[]) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

const MultiSelectCategoryFilter: React.FC<MultiSelectCategoryFilterProps> = ({
  categories,
  selectedCategories,
  onChange,
  label = 'Filter by categories',
  placeholder = 'Search categories...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected category objects
  const selectedCategoryObjects = categories.filter((cat) =>
    selectedCategories.includes(cat.value)
  )

  // Toggle category selection
  const toggleCategory = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      onChange(selectedCategories.filter((id) => id !== categoryValue))
    } else {
      onChange([...selectedCategories, categoryValue])
    }
  }

  // Remove category
  const removeCategory = (categoryValue: string) => {
    onChange(selectedCategories.filter((id) => id !== categoryValue))
  }

  // Clear all selections
  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className={cn('text-sm font-medium text-slate-700 dark:text-neutral-300', disabled && 'opacity-50')}>
          {label}
        </label>
      )}

      {/* Selected tags */}
      {selectedCategoryObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategoryObjects.map((category) => (
            <div
              key={category.value}
              className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
            >
              <span>{category.label}</span>
              <button
                type="button"
                onClick={() => removeCategory(category.value)}
                disabled={disabled}
                className={cn(
                  'rounded-full p-0.5 transition-colors hover:bg-sky-200 dark:hover:bg-sky-900/50',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
                aria-label={`Remove ${category.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {selectedCategoryObjects.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-left text-sm transition-colors dark:bg-neutral-900 dark:border-neutral-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-primary-500',
            'hover:border-slate-400 dark:hover:border-neutral-600',
            disabled && 'cursor-not-allowed opacity-50',
            isOpen && 'border-sky-500 ring-2 ring-sky-500'
          )}
        >
          <span className="text-slate-600 dark:text-neutral-400">
            {selectedCategories.length === 0
              ? 'Select categories...'
              : `${selectedCategories.length} selected`}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')}
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
            {/* Search input */}
            <div className="border-b border-slate-200 p-2 dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Category list */}
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredCategories.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-neutral-400">
                  No categories found
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.value)
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => toggleCategory(category.value)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                        'hover:bg-slate-50 dark:hover:bg-neutral-800',
                        isSelected && 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border-2',
                          isSelected
                            ? 'border-sky-500 bg-sky-500'
                            : 'border-slate-300 bg-white dark:border-neutral-600 dark:bg-neutral-800'
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="flex-1">{category.label}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

MultiSelectCategoryFilter.displayName = 'MultiSelectCategoryFilter'

export default MultiSelectCategoryFilter
