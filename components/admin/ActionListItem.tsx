'use client';

/**
 * ActionListItem Component
 *
 * A card-based list item for displaying actions in the admin panel.
 * Supports drag-and-drop sorting via @dnd-kit.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Calendar, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { AdminAction } from '@/lib/services/admin-actions';

export interface ActionListItemProps {
  action: AdminAction;
  onEdit: (action: AdminAction) => void;
  onDelete: (actionId: string) => void;
  isDeleting: boolean;
  deleteConfirm: string | null;
  onDeleteConfirm: (actionId: string | null) => void;
}

export function ActionListItem({
  action,
  onEdit,
  onDelete,
  isDeleting,
  deleteConfirm,
  onDeleteConfirm,
}: ActionListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
          <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {action.name}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(action.createdAt).toLocaleDateString()}
            </span>
            {/* <span className="text-xs">
              Order: {action.displayOrder}
            </span> */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => onEdit(action)}
          >
            Edit
          </Button>

          {deleteConfirm === action.id ? (
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(action.id)}
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
              onClick={() => onDeleteConfirm(action.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
