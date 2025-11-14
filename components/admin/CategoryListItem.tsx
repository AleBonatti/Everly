'use client';

/**
 * CategoryListItem Component
 *
 * A card-based list item for displaying categories in the admin panel.
 * Supports drag-and-drop sorting via @dnd-kit.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { getIconComponent } from '@/lib/utils/icon-utils';
import Button from '@/components/ui/Button';
import type { AdminCategory } from '@/lib/services/admin-categories';

export interface CategoryListItemProps {
  category: AdminCategory;
  onEdit: (category: AdminCategory) => void;
  onDelete: (categoryId: string) => void;
  isDeleting: boolean;
  deleteConfirm: string | null;
  onDeleteConfirm: (categoryId: string | null) => void;
}

export function CategoryListItem({
  category,
  onEdit,
  onDelete,
  isDeleting,
  deleteConfirm,
  onDeleteConfirm,
}: CategoryListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const CategoryIcon = getIconComponent(category.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-lg border border-neutral-200 bg-white p-4 shadow-sm
        transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900
        ${isDragging ? 'z-50 shadow-2xl ring-2 ring-primary-500' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Drag handle */}
        <button
          className="cursor-grab touch-none text-neutral-400 hover:text-neutral-600 active:cursor-grabbing dark:text-neutral-600 dark:hover:text-neutral-400"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
          {CategoryIcon ? (
            <CategoryIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          ) : (
            <div className="h-6 w-6 rounded bg-primary-200 dark:bg-primary-800" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {category.name}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                category.type === 'default'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {category.type}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(category.createdAt).toLocaleDateString()}
            </span>
            {/* <span className="text-xs">
              Order: {category.displayOrder}
            </span> */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => onEdit(category)}
          >
            Edit
          </Button>

          {category.type !== 'default' && (
            <>
              {deleteConfirm === category.id ? (
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(category.id)}
                    loading={isDeleting}
                    disabled={isDeleting}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteConfirm(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => onDeleteConfirm(category.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
