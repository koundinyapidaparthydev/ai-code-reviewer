import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BirdMark } from './BirdMark';

interface CodebirdLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  markOnly?: boolean;
  animate?: boolean;
}

const markSize = { sm: 28, md: 36, lg: 52 };
const wordSize = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-[1.85rem]',
};

export function CodebirdLogo({
  href = '/dashboard',
  size = 'md',
  className,
  markOnly = false,
  animate = false,
}: CodebirdLogoProps) {
  const inner = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BirdMark size={markSize[size]} animate={animate} />
      {!markOnly && (
        <span
          className={cn(
            'font-display font-semibold tracking-tight text-ink-800 leading-none',
            wordSize[size]
          )}
        >
          Code
          <span className="italic text-coral-600">bird</span>
        </span>
      )}
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="inline-flex items-center group" aria-label="Codebird home">
      {inner}
    </Link>
  );
}
