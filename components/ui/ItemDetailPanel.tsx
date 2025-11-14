'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  ArrowUp,
  Circle,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/lib/utils/icon-utils';
import Badge from './Badge';
import Button from './Button';

export interface ItemDetailPanelProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    action?: string | null;
    category: string;
    categoryIcon?: string | null;
    done: boolean;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | null;
    url?: string | null;
    location?: string | null;
    note?: string | null;
    targetDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  onEdit: () => void;
  onDelete: () => void;
}

const ItemDetailPanel: React.FC<ItemDetailPanelProps> = ({
  open,
  onClose,
  item,
  onEdit,
  onDelete,
}) => {
  if (!item) return null;

  // Priority configuration
  const priorityConfig = {
    high: {
      icon: AlertCircle,
      badge: 'danger',
      label: 'High',
    },
    medium: {
      icon: ArrowUp,
      badge: 'accent',
      label: 'Medium',
    },
    low: {
      icon: Circle,
      badge: 'neutral',
      label: 'Low',
    },
  } as const;

  const priorityStyle = item.priority ? priorityConfig[item.priority] : null;
  const PriorityIcon = priorityStyle?.icon;

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/95">
              <div className="flex items-center justify-between p-6">
                <h2
                  id="panel-title"
                  className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
                >
                  Item Details
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-700 hover:rotate-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                  aria-label="Close panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Category icon and name */}
              <div className="flex items-center gap-3">
                {(() => {
                  const CategoryIcon = getIconComponent(item.categoryIcon);
                  const IconComponent = CategoryIcon || Package;
                  return (
                    <div className="flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-2 dark:bg-primary-900/20">
                      <IconComponent className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      <span className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                        {item.category}
                      </span>
                    </div>
                  );
                })()}
                {item.priority && priorityStyle && (
                  <Badge
                    text={priorityStyle.label}
                    variant={priorityStyle.badge as any}
                    icon={PriorityIcon}
                  />
                )}
                {item.done && <Badge text="Completed" variant="success" />}
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.action && (
                    <span className="text-lg font-normal text-accent-600 dark:text-accent-400 mr-2">
                      {item.action}
                    </span>
                  )}
                  <span className={cn(item.done && 'line-through')}>
                    {item.title}
                  </span>
                </h3>
              </div>

              {/* Description */}
              {item.description && (
                <div>
                  <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    Description
                  </label>
                  <p className="text-base text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              )}

              {/* URL */}
              {item.url && (
                <div>
                  <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    <LinkIcon className="inline h-4 w-4 mr-1" />
                    URL
                  </label>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {/* Location */}
              {item.location && (
                <div>
                  <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location
                  </label>
                  <p className="text-base text-neutral-700 dark:text-neutral-300">
                    {item.location}
                  </p>
                </div>
              )}

              {/* Target Date */}
              {item.targetDate && (
                <div>
                  <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Target Date
                  </label>
                  <p className="text-base text-neutral-700 dark:text-neutral-300">
                    {formatDate(item.targetDate)}
                  </p>
                </div>
              )}

              {/* Note */}
              {item.note && (
                <div>
                  <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Notes
                  </label>
                  <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                    <p className="text-base text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                      {item.note}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata: Created and Updated dates */}
              {(item.createdAt || item.updatedAt) && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
                  {item.createdAt && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Created on {formatDate(item.createdAt)}
                    </p>
                  )}
                  {item.updatedAt && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Last updated on {formatDate(item.updatedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer with actions */}
            <div className="sticky bottom-0 border-t border-neutral-200 bg-white/95 backdrop-blur-sm p-6 dark:border-neutral-800 dark:bg-neutral-900/95">
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  icon={<Edit2 className="h-4 w-4" />}
                  onClick={onEdit}
                  className="flex-1"
                >
                  Edit Item
                </Button>
                <Button
                  variant="danger"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={onDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

ItemDetailPanel.displayName = 'ItemDetailPanel';

export default ItemDetailPanel;
