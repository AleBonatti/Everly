'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FocusTrap } from 'focus-trap-react';
import {
  X,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Link as LinkIcon,
  FileText,
  Circle,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/lib/utils/icon-utils';
import Badge from './Badge';
import Button from './Button';
import AISuggestions from '@/components/features/AISuggestions';
import AIEnrichment from '@/components/features/AIEnrichment';
import type { ItemMetadata } from '@/lib/services/items';

export interface ItemDetailPanelProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    action?: string | null;
    category: string;
    categoryId?: string;
    categoryIcon?: string | null;
    done: boolean;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | null;
    url?: string | null;
    location?: string | null;
    note?: string | null;
    targetDate?: string | null;
    imageUrl?: string | null;
    metadata?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh?: () => void;
}

const ItemDetailPanel: React.FC<ItemDetailPanelProps> = ({
  open,
  onClose,
  item,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  if (!item) return null;

  // Priority configuration
  const priorityConfig = {
    high: {
      label: 'High',
      color: '#ef4444', // red
    },
    medium: {
      label: 'Medium',
      color: '#eab308', // yellow
    },
    low: {
      label: 'Low',
      color: '#22c55e', // green
    },
  } as const;

  const priorityStyle = item.priority ? priorityConfig[item.priority] : null;

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
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40" /* bg-neutral-900/20 */
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <FocusTrap
            active={open}
            focusTrapOptions={{
              initialFocus: false,
              allowOutsideClick: true,
              clickOutsideDeactivates: true,
              returnFocusOnDeactivate: true,
            }}
          >
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="fixed right-6 top-6 bottom-6 z-50 w-full max-w-2xl flex flex-col rounded-2xl bg-white shadow-lg/30 dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="panel-title"
            >
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-right justify-end space-x-4 px-6 pt-6">
                  <Button
                    size="none"
                    variant="icon"
                    onClick={onEdit}
                    aria-label="Edit item"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    size="none"
                    variant="icon"
                    onClick={onDelete}
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  {/* Close button - absolute positioned */}
                  <Button
                    size="none"
                    variant="icon"
                    onClick={onClose}
                    aria-label="Close panel"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Image and Header Info side by side */}
                <div className="flex gap-6 px-6">
                  {/* Image - Left side */}
                  {item.imageUrl && (
                    <div className="max-h-[200px] shrink w-48 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 overflow-hidden rounded-lg">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}

                  {/* Title, Action, Category, Priority - Right side */}
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    {/* Title and Action */}
                    <h3 className="flex flex-col text-2xl font-normal text-primary dark:text-neutral-100">
                      {item.action && (
                        <span className="text-base text-accent dark:text-accent-400 mr-2">
                          {item.action}
                        </span>
                      )}
                      <span>{item.title}</span>
                      {item.done && (
                        <span className="text-xs text-secondary">
                          Completed
                        </span>
                      )}
                    </h3>

                    {/* Category and Badges */}
                    <div className="flex justify-between items-center gap-3 flex-wrap">
                      <Badge
                        text={item.category}
                        size="sm"
                        variant="primary"
                        icon={(() => {
                          const CategoryIcon = getIconComponent(
                            item.categoryIcon
                          );
                          return CategoryIcon || Package;
                        })()}
                      />
                      {item.priority && priorityStyle && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-primary dark:bg-neutral-100">
                          <Circle
                            className="h-3 w-3"
                            fill={priorityStyle.color}
                            stroke={priorityStyle.color}
                          />
                          <span>{priorityStyle.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                  {/* Description */}
                  {item.description && (
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-neutral-400 mb-2">
                        Description
                      </label>
                      <p className="text-sm text-primary dark:text-neutral-300 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  {item.metadata &&
                    (() => {
                      try {
                        const metadata: ItemMetadata = JSON.parse(
                          item.metadata
                        );
                        const hasMetadata = Object.values(metadata).some(
                          (v) => v && v.trim() !== ''
                        );

                        if (!hasMetadata) return null;

                        return (
                          <div>
                            <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                              Details
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {metadata.year && (
                                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Year
                                  </p>
                                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {metadata.year}
                                  </p>
                                </div>
                              )}
                              {metadata.creator && (
                                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Creator
                                  </p>
                                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {metadata.creator}
                                  </p>
                                </div>
                              )}
                              {metadata.genre && (
                                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Genre
                                  </p>
                                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {metadata.genre}
                                  </p>
                                </div>
                              )}
                              {metadata.rating && (
                                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Rating
                                  </p>
                                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {metadata.rating}
                                  </p>
                                </div>
                              )}
                              {metadata.duration && (
                                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Duration
                                  </p>
                                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {metadata.duration}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } catch (e) {
                        console.error('Failed to parse metadata:', e);
                        return null;
                      }
                    })()}

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
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
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
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
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
                      <div className="rounded-lg dark:bg-neutral-800">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                          {item.note}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Actions */}
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex gap-3">
                      <AIEnrichment
                        itemId={item.id}
                        title={item.title}
                        categoryId={item.categoryId}
                        location={item.location || undefined}
                        onEnriched={() => {
                          // Refresh the item data
                          onRefresh?.();
                        }}
                      />
                      {item.action && (
                        <AISuggestions
                          action={item.action}
                          title={item.title}
                          category={item.category}
                          categoryId={item.categoryId}
                          location={item.location || undefined}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed footer with dates */}
              {(item.createdAt || item.updatedAt) && (
                <div className=" px-6 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="space-y-1">
                    {item.createdAt && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Created on {formatDate(item.createdAt)}
                      </p>
                    )}
                    {item.updatedAt && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Last updated on {formatDate(item.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </>
  );
};

ItemDetailPanel.displayName = 'ItemDetailPanel';

export default ItemDetailPanel;
