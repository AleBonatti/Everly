'use client';

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import Input from './Input';

export interface IconPickerProps {
  value?: string | null;
  onChange: (icon: string) => void;
  label?: string;
}

// Popular icons to show by default
const POPULAR_ICONS = [
  'Film', 'Utensils', 'Book', 'MapPin', 'Music', 'Gamepad2', 'Plane',
  'ShoppingBag', 'Heart', 'Package', 'Star', 'Home', 'Briefcase',
  'Calendar', 'Camera', 'Coffee', 'Lightbulb', 'Palette', 'Smartphone',
  'Trophy', 'Zap', 'Target', 'TrendingUp', 'Users', 'Gift', 'Laptop',
  'Code', 'Wrench', 'Scissors', 'Pencil', 'Bookmark', 'Flag',
];

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, label }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get the icon component dynamically
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
  };

  const SelectedIcon = value ? getIconComponent(value) : null;

  // Filter icons based on search
  const filteredIcons = search
    ? POPULAR_ICONS.filter((icon) =>
        icon.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_ICONS;

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      {/* Selected icon display / trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-lg border px-4',
          'bg-white text-neutral-900 transition-colors',
          'hover:border-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20',
          'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
          'dark:hover:border-neutral-600 dark:focus:border-primary-500',
          isOpen ? 'border-primary-600 ring-2 ring-primary-600/20' : 'border-neutral-300'
        )}
      >
        <div className="flex items-center gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              <span className="text-sm">{value}</span>
            </>
          ) : (
            <span className="text-sm text-neutral-500">Select an icon...</span>
          )}
        </div>
        <LucideIcons.ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setSearch('');
            }}
          />

          {/* Dropdown content */}
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            {/* Search input */}
            <div className="mb-3">
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </div>

            {/* Icon grid */}
            <div className="max-h-64 overflow-y-auto">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-6 gap-2">
                  {filteredIcons.map((iconName) => {
                    const IconComponent = getIconComponent(iconName);
                    if (!IconComponent) return null;

                    const isSelected = value === iconName;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleIconSelect(iconName)}
                        className={cn(
                          'flex items-center justify-center rounded-lg p-3 transition-all',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                          isSelected
                            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'text-neutral-600 dark:text-neutral-400'
                        )}
                        title={iconName}
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No icons found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

IconPicker.displayName = 'IconPicker';

export default IconPicker;
