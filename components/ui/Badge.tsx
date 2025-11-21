'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  selected?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      text,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      selected = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'text-white';
    const selectedClasses = 'ring-1 ring-accent';

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

    const getBackgroundColor = () => {
      if (variant === 'primary') return 'rgb(var(--primary))';
      if (variant === 'secondary') return 'rgb(var(--secondary))';
      if (variant === 'accent') return 'rgb(var(--accent))';
      if (variant === 'success') return 'rgb(var(--success))';
      if (variant === 'danger') return 'rgb(var(--danger))';
      return 'rgb(var(--primary))';
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium transition-all',
          baseClasses,
          selected && selectedClasses,
          sizes[size].badge,
          className
        )}
        style={{ backgroundColor: getBackgroundColor() }}
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
