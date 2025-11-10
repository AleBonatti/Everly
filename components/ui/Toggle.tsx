'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      size = 'md',
      id,
      disabled,
      required,
      checked,
      ...props
    },
    ref
  ) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substring(2, 11)}`
    const hasError = !!error

    const sizes = {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'peer-checked:translate-x-4',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'peer-checked:translate-x-5',
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translate: 'peer-checked:translate-x-7',
      },
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="relative inline-block">
            <input
              ref={ref}
              id={toggleId}
              type="checkbox"
              checked={checked}
              className="peer sr-only"
              disabled={disabled}
              required={required}
              aria-invalid={hasError}
              aria-describedby={
                error
                  ? `${toggleId}-error`
                  : helperText
                    ? `${toggleId}-helper`
                    : undefined
              }
              {...props}
            />
            <label
              htmlFor={toggleId}
              className={cn(
                'flex cursor-pointer items-center rounded-full transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                hasError
                  ? 'bg-red-200 peer-checked:bg-red-600'
                  : 'bg-slate-200 peer-checked:bg-sky-500',
                sizes[size].track,
                className
              )}
            >
              <span
                className={cn(
                  'block rounded-full bg-white shadow-sm transition-transform',
                  'ml-0.5',
                  sizes[size].thumb,
                  sizes[size].translate
                )}
              />
            </label>
          </div>
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'cursor-pointer text-sm font-medium text-slate-700',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
              {required && (
                <span className="ml-1 text-red-500" aria-label="required">
                  *
                </span>
              )}
            </label>
          )}
        </div>
        {error && (
          <p
            id={`${toggleId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${toggleId}-helper`}
            className="text-sm text-slate-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'

export default Toggle
