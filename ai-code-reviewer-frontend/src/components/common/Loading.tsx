import React from 'react';
import { BirdMark } from '@/components/brand/BirdMark';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-cream-200 border-t-coral-500`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <div className="page-enter text-center">
        <BirdMark size={56} animate />
        <p className="mt-4 font-display text-lg text-ink-600">Codebird is looking…</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cream-200 ${className}`} />;
}
