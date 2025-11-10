'use client';

import React from 'react';
import { Edit2, Trash2, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ListItemProps {
  id: string;
  title: string;
  category: string;
  categoryColor?: string;
  done: boolean;
  description?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string, done: boolean) => void;
  className?: string;
}

const ListItem: React.FC<ListItemProps> = ({
  id,
  title,
  category,
  categoryColor,
  done,
  description,
  onEdit,
  onDelete,
  onToggleDone,
  className,
}) => {
  return (
    <div
      className={cn(
        'group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md',
        done && 'opacity-75',
        className
      )}
    >
      {/* Top section: Category badge and done toggle */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
            categoryColor
              ? 'bg-sky-100 text-sky-700'
              : 'bg-slate-100 text-slate-700'
          )}
        >
          {category}
        </span>
        <button
          type="button"
          onClick={() => onToggleDone(id, !done)}
          className={cn(
            'flex-0 rounded-full p-1 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
            done
              ? 'text-green-600 hover:text-green-700'
              : 'text-slate-400 hover:text-slate-600'
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

      {/* Title */}
      <h3
        className={cn(
          'mb-2 text-base font-semibold text-slate-900',
          done && 'line-through'
        )}
      >
        {title}
      </h3>

      {/* Description (if exists) */}
      {description && (
        <p className="mb-3 line-clamp-2 text-sm text-slate-600">
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
            'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
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
            'text-red-600 hover:bg-red-50 hover:text-red-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
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
