'use client';

import React from 'react';
import { Edit2, Trash2, Check, Circle, AlertCircle, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from './Badge';

export interface ListItemProps {
  id: string;
  title: string;
  action?: string | null;
  category: string;
  categoryColor?: string;
  done: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string, done: boolean) => void;
  className?: string;
}

const ListItem: React.FC<ListItemProps> = ({
  id,
  title,
  action,
  category,
  categoryColor,
  done,
  description,
  priority,
  onEdit,
  onDelete,
  onToggleDone,
  className,
}) => {
  // Priority configuration
  const priorityConfig = {
    high: {
      icon: AlertCircle,
      badge: 'badge-danger',
      label: 'High',
      borderColor: 'border-l-4 border-l-danger-500 dark:border-l-danger-400',
    },
    medium: {
      icon: ArrowUp,
      badge: 'badge-accent',
      label: 'Medium',
      borderColor: 'border-l-4 border-l-accent-500 dark:border-l-accent-400',
    },
    low: {
      icon: Circle,
      badge: 'bg-neutral-100 text-neutral-600',
      label: 'Low',
      borderColor: 'border-l-4 border-l-neutral-300 dark:border-l-neutral-600',
    },
  };

  const priorityStyle = priority ? priorityConfig[priority] : null;
  const PriorityIcon = priorityStyle?.icon;

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-900',
        done && 'opacity-70',
        priorityStyle?.borderColor,
        className
      )}
    >
      {/* Top section: Category badge, priority badge, and done toggle */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            text={category}
            variant={categoryColor ? 'primary' : 'neutral'}
          />
          {priority && priorityStyle && (
            <Badge
              text={priorityStyle.label}
              variant={priority === 'high' ? 'danger' : priority === 'medium' ? 'accent' : 'neutral'}
              icon={PriorityIcon}
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggleDone(id, !done)}
          className={cn(
            'flex-0 rounded-full p-1 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            done
              ? 'text-success-600 hover:text-success-700'
              : 'text-neutral-400 hover:text-neutral-600'
          )}
          aria-label={done ? 'Mark as not done' : 'Mark as done'}
        >
          {done ? (
            <Check className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Circle className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Title with optional action */}
      <h3
        className={cn(
          'mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100',
          done && 'line-through'
        )}
      >
        {action && (
          <span className="mr-1.5 text-sm font-normal text-accent-600 dark:text-accent-400">
            {action}
          </span>
        )}
        {title}
      </h3>

      {/* Description (if exists) */}
      {description && (
        <p className="mb-3 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          )}
        >
          <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            'text-danger-600 hover:bg-danger-50 hover:text-danger-700 dark:text-danger-400 dark:hover:bg-danger-950 dark:hover:text-danger-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          )}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>
      </div>
    </div>
  );
};

ListItem.displayName = 'ListItem';

export default ListItem;
