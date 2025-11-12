'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ListItemSkeletonProps {
  className?: string;
}

const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      {/* Top section: Category badge and done toggle */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="shimmer h-6 w-20 rounded-full" />
        <div className="shimmer h-7 w-7 rounded-full" />
      </div>

      {/* Title */}
      <div className="mb-2 space-y-2">
        <div className="shimmer h-5 w-3/4 rounded" />
      </div>

      {/* Description */}
      <div className="mb-3 space-y-2">
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-2/3 rounded" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="shimmer h-8 w-16 rounded-lg" />
        <div className="shimmer h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
};

ListItemSkeleton.displayName = 'ListItemSkeleton';

export default ListItemSkeleton;
