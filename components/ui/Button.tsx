'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'icon';
  size?: 'circle' | 'sm' | 'md' | 'lg' | 'none';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'text-white shadow-sm hover:shadow-md hover:opacity-90',
      secondary: 'text-white shadow-sm hover:shadow-md hover:opacity-90',
      accent: 'text-white shadow-sm hover:shadow-md hover:opacity-90',
      outline:
        'bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800',
      ghost: 'hover:bg-neutral-200 dark:hover:bg-neutral-800',
      danger: 'text-white shadow-sm hover:shadow-md hover:opacity-90',
      icon: 'text-secondary hover:text-primary',
    };

    const sizes = {
      none: 'text-sm',
      circle: 'h-8 px-2 text-sm',
      sm: 'h-6 px-2 text-xs',
      md: 'h-8 px-4 text-sm',
      lg: 'h-10 px-6 text-lg',
    };

    const getBackgroundColor = () => {
      if (variant === 'primary') return 'rgb(var(--primary))';
      if (variant === 'secondary') return 'rgb(var(--secondary))';
      if (variant === 'accent') return 'rgb(var(--accent))';
      if (variant === 'danger') return 'rgb(var(--danger))';
      return undefined;
    };

    const getTextColor = () => {
      if (variant === 'outline') return 'rgb(var(--primary))';
      if (variant === 'ghost') return 'rgb(var(--secondary))';
      return undefined;
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={{
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
        }}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading" />
        ) : (
          <>
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
