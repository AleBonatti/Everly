'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface QuickAddWidgetProps {
  onAdd: (data: { title: string; categoryId: string }) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
}

export default function QuickAddWidget({
  onAdd,
  categories,
}: QuickAddWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;

    try {
      setIsSubmitting(true);
      await onAdd({ title: title.trim(), categoryId });

      // Reset form
      setTitle('');
      setCategoryId('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setCategoryId('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-6">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400 dark:hover:border-primary-500 dark:hover:bg-primary-950 dark:hover:text-primary-400"
            >
              <Plus className="h-4 w-4" />
              Quick Add Item
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="What do you want to add?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    required
                    fullWidth
                  />
                </div>
                <div className="w-48">
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    options={[
                      { value: '', label: 'Category...' },
                      ...categories,
                    ]}
                    required
                    fullWidth
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!title.trim() || !categoryId || isSubmitting}
                  loading={isSubmitting}
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
