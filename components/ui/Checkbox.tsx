'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      disabled,
      required,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 11)}`
    const hasError = !!error

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              checked={checked}
              className={cn(
                'peer h-5 w-5 cursor-pointer appearance-none rounded border-2 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                hasError
                  ? 'border-red-500 checked:border-red-600 checked:bg-red-600'
                  : 'border-slate-300 checked:border-sky-500 checked:bg-sky-500 hover:border-slate-400',
                className
              )}
              disabled={disabled}
              required={required}
              aria-invalid={hasError}
              aria-describedby={
                error
                  ? `${checkboxId}-error`
                  : helperText
                    ? `${checkboxId}-helper`
                    : undefined
              }
              {...props}
            />
            <Check
              className={cn(
                'pointer-events-none absolute left-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100',
                disabled && 'opacity-50'
              )}
              aria-hidden="true"
            />
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'cursor-pointer text-sm font-medium leading-5 text-slate-700',
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
            id={`${checkboxId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${checkboxId}-helper`}
            className="text-sm text-slate-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
