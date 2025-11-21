'use client';

import React from 'react';
import { Check, Circle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/lib/utils/icon-utils';
import Badge from './Badge';

export interface ListItemProps {
  id: string;
  title: string;
  action?: string | null;
  category: string;
  categoryIcon?: string | null;
  done: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | null;
  imageUrl?: string | null;
  onClick: (id: string) => void;
  onToggleDone: (id: string, done: boolean) => void;
  className?: string;
}

const ListItem: React.FC<ListItemProps> = ({
  id,
  title,
  action,
  category,
  categoryIcon,
  done,
  description,
  priority,
  imageUrl,
  onClick,
  onToggleDone,
  className,
}) => {
  // Priority configuration with filled circle icons
  const priorityConfig = {
    high: {
      label: 'High',
      color: '#ef4444', // red
      variant: 'danger' as const,
    },
    medium: {
      label: 'Medium',
      color: '#eab308', // yellow
      variant: 'accent' as const,
    },
    low: {
      label: 'Low',
      color: '#22c55e', // green
      variant: 'secondary' as const,
    },
  };

  const priorityStyle = priority ? priorityConfig[priority] : null;

  return (
    <div
      onClick={() => onClick(id)}
      className={cn(
        'group relative rounded-xl bg-white overflow-hidden transition-all hover:-translate-y-0.5 cursor-pointer dark:bg-neutral-900',
        done && 'opacity-70',
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(id);
        }
      }}
    >
      {/* Image Section - Upper half with max 200px height */}
      <div
        className="relative w-full rounded-t-xl dark:bg-neutral-800"
        style={{ height: '200px' }}
      >
        {imageUrl ? (
          <div className="absolute inset-2 overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              style={{ objectPosition: 'center' }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
          </div>
        )}
        {/* Priority badge in top right corner (white) - Above image */}
        {priority && priorityStyle && (
          <div className="absolute top-4 right-3 z-10">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-xs text-primary font-normal dark:bg-neutral-100">
              <Circle
                className="h-3 w-3"
                fill={priorityStyle.color}
                stroke={priorityStyle.color}
              />
              <span>{priorityStyle.label}</span>
            </div>
          </div>
        )}
        {/* Done toggle button in top left - Above image */}
        <div className="absolute top-3 left-3 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone(id, !done);
            }}
            className={cn(
              'rounded-full p-1 transition-colors bg-transparent backdrop-blur-sm dark:bg-neutral-900/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              done
                ? 'text-green-500 hover:text-success-700'
                : 'text-neutral-300 hover:text-neutral-500'
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
      </div>

      {/* Content Section - Below image */}
      <div className="flex flex-col p-3" style={{ minHeight: '160px' }}>
        {/* Title with optional action */}
        <div className="grow px-3">
          {action && (
            <span className="text-sm font-normal text-accent dark:text-accent-400">
              {action}
            </span>
          )}
          <h3
            className={cn(
              'text-base font-medium text-primary dark:text-neutral-100'
            )}
          >
            <span className={cn(done && 'line-through')}>{title}</span>
          </h3>

          {/* Description (if exists) */}
          {description && (
            <p className="mt-3 line-clamp-2 text-xs text-secondary dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>

        {/* Category badge in bottom right corner (black) */}
        <div className="flex justify-end mt-3">
          {(() => {
            const CategoryIcon = getIconComponent(categoryIcon);
            const IconComponent = CategoryIcon || Package;
            return (
              <Badge
                text={category}
                variant="primary"
                icon={IconComponent}
                size="sm"
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
};

ListItem.displayName = 'ListItem';

export default ListItem;
