'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary';
  text?: string;
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = 'md', variant = 'primary', text, ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    };

    const variants = {
      primary: 'text-sky-500',
      secondary: 'text-slate-400',
    };

    const textSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-3', className)}
        role="status"
        aria-live="polite"
        {...props}
      >
        <Loader2
          className={cn('animate-spin', sizes[size], variants[variant])}
          aria-hidden="true"
        />
        {text && (
          <span className={cn('font-medium text-slate-700', textSizes[size])}>
            {text}
          </span>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Loader.displayName = 'Loader';

export default Loader;
