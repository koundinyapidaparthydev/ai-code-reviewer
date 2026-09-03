import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageFade({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('page-enter', className)}>{children}</div>;
}
