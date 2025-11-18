'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface Suggestion {
  title: string;
  description: string;
  year?: string;
  creator?: string;
  imageUrl?: string;
}

export interface AISuggestionsProps {
  action: string;
  title: string;
  category?: string;
  categoryId?: string;
  onClose?: () => void;
}

export default function AISuggestions({
  action,
  title,
  category,
  categoryId,
  onClose,
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setShowSuggestions(true);

    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          title,
          category,
          categoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate suggestions'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
    onClose?.();
  };

  return (
    <div className="space-y-4">
      {/* Find Similar Button */}
      {!showSuggestions && (
        <Button
          variant="ghost"
          icon={<Sparkles className="h-4 w-4" />}
          onClick={fetchSuggestions}
          disabled={loading}
          className="w-full"
        >
          Find Similar
        </Button>
      )}

      {/* Suggestions Display */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Similar Suggestions
                </h3>
              </div>
              {!loading && (
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Close
                </Button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Generating personalized suggestions...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-950">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-600 dark:text-danger-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-danger-900 dark:text-danger-100">
                    Failed to generate suggestions
                  </p>
                  <p className="mt-1 text-sm text-danger-700 dark:text-danger-300">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Suggestions List */}
            {!loading && !error && suggestions.length > 0 && (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {suggestion.imageUrl && (
                      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                        <Image
                          src={suggestion.imageUrl}
                          alt={suggestion.title}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.parentElement?.classList.add(
                              'hidden'
                            );
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {suggestion.title}
                      </h4>
                      {(suggestion.year || suggestion.creator) && (
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                          {[suggestion.creator, suggestion.year]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {suggestion.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && suggestions.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  No suggestions available at the moment.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
