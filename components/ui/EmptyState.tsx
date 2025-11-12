'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-16 px-6 text-center',
        className
      )}
    >
      <div className="mb-6 animate-float rounded-full bg-linear-to-br from-primary-50 to-accent-50 p-6 shadow-lg">
        <Icon className="h-16 w-16 text-primary-600" aria-hidden="true" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-neutral-900">{title}</h3>
      {description && (
        <p className="mb-8 max-w-md text-base text-neutral-600 text-balance">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      )}
    </div>
  )
}

EmptyState.displayName = 'EmptyState'

export default EmptyState
