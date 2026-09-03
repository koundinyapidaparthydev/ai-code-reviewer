import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';
import { reviewStatusLabel } from '@/lib/reviewCopy';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-ink-100 text-ink-700',
    success: 'bg-sage-100 text-sage-700',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-coral-100 text-coral-700',
    info: 'bg-cream-200 text-ink-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
  friendly?: boolean;
}

export function StatusBadge({ status, className, friendly = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        getStatusColor(status),
        className
      )}
    >
      {friendly ? reviewStatusLabel(status) : status}
    </span>
  );
}
