'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  selected?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, text, variant = 'default', size = 'md', icon: Icon, selected = false, ...props }, ref) => {
    const variants = {
      default: {
        base: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        selected: 'bg-neutral-200 text-neutral-800 ring-2 ring-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:ring-neutral-600',
      },
      primary: {
        base: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400',
        selected: 'bg-primary-100 text-primary-800 ring-2 ring-primary-300 dark:bg-primary-900 dark:text-primary-300 dark:ring-primary-700',
      },
      accent: {
        base: 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-400',
        selected: 'bg-accent-100 text-accent-800 ring-2 ring-accent-300 dark:bg-accent-900 dark:text-accent-300 dark:ring-accent-700',
      },
      success: {
        base: 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400',
        selected: 'bg-success-100 text-success-800 ring-2 ring-success-300 dark:bg-success-900 dark:text-success-300 dark:ring-success-700',
      },
      danger: {
        base: 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-400',
        selected: 'bg-danger-100 text-danger-800 ring-2 ring-danger-300 dark:bg-danger-900 dark:text-danger-300 dark:ring-danger-700',
      },
      neutral: {
        base: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
        selected: 'bg-neutral-200 text-neutral-800 ring-2 ring-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:ring-neutral-600',
      },
    };

    const sizes = {
      sm: {
        badge: 'px-2 py-0.5 text-xs',
        icon: 'h-2.5 w-2.5',
      },
      md: {
        badge: 'px-3 py-1 text-xs',
        icon: 'h-3 w-3',
      },
      lg: {
        badge: 'px-4 py-1.5 text-sm',
        icon: 'h-3.5 w-3.5',
      },
    };

    const variantClasses = selected ? variants[variant].selected : variants[variant].base;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium transition-all',
          variantClasses,
          sizes[size].badge,
          className
        )}
        {...props}
      >
        {Icon && <Icon className={sizes[size].icon} />}
        {text}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
