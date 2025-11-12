'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'success' | 'neutral';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'neutral',
  trend,
  className,
}) => {
  const variants = {
    primary: {
      bg: 'bg-primary-50',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      textColor: 'text-primary-900',
    },
    accent: {
      bg: 'bg-accent-50',
      iconBg: 'bg-accent-100',
      iconColor: 'text-accent-600',
      textColor: 'text-accent-900',
    },
    success: {
      bg: 'bg-success-50',
      iconBg: 'bg-success-100',
      iconColor: 'text-success-600',
      textColor: 'text-success-900',
    },
    neutral: {
      bg: 'bg-white',
      iconBg: 'bg-neutral-100',
      iconColor: 'text-neutral-600',
      textColor: 'text-neutral-900',
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 p-6 shadow-sm transition-all hover:shadow-md',
        variantStyles.bg,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p
              className={cn(
                'text-3xl font-bold',
                variantStyles.textColor
              )}
            >
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'rounded-lg p-3',
            variantStyles.iconBg
          )}
        >
          <Icon className={cn('h-6 w-6', variantStyles.iconColor)} />
        </div>
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';

export default StatCard;
