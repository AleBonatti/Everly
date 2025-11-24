'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { ItemMetadata } from '@/lib/services/items';

export interface AIEnrichmentProps {
  itemId: string;
  title: string;
  categoryId?: string;
  location?: string;
  onEnriched: (data: { imageUrl?: string; metadata?: ItemMetadata }) => void;
}

export default function AIEnrichment({
  itemId,
  title,
  categoryId,
  location,
  onEnriched,
}: AIEnrichmentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEnrich = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/ai/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          categoryId,
          location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to enrich item');
      }

      const data = await response.json();

      // Prepare update payload - only include fields that have values
      const updatePayload: { imageUrl?: string | null; metadata?: string } = {};

      if (data.imageUrl !== undefined) {
        updatePayload.imageUrl = data.imageUrl;
      }

      if (data.metadata && Object.keys(data.metadata).length > 0) {
        updatePayload.metadata = JSON.stringify(data.metadata);
      }

      // Update the item with enriched data
      const updateResponse = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update item with enriched data');
      }

      setSuccess(true);
      onEnriched({
        imageUrl: data.imageUrl,
        metadata: data.metadata,
      });

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to enrich item:', err);
      setError(err instanceof Error ? err.message : 'Failed to enrich item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="accent"
        icon={
          loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : success ? (
            <Check className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )
        }
        onClick={handleEnrich}
        disabled={loading}
      >
        {loading ? 'Enriching...' : success ? 'Enriched!' : 'Enrich with AI'}
      </Button>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-950">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger-600 dark:text-danger-400 mt-0.5" />
          <p className="text-sm text-danger-700 dark:text-danger-300">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
