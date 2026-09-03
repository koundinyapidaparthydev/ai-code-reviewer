import React from 'react';
import { cn } from '@/lib/utils';

interface BirdMarkProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

/** Inline Codebird mark — a perched songbird, not an emoji. */
export function BirdMark({ size = 40, className, animate = false }: BirdMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animate && 'bird-bob', className)}
      role="img"
      aria-label="Codebird"
    >
      <ellipse cx="32" cy="56" rx="16" ry="3.2" fill="#1C1612" opacity="0.08" />
      <path
        d="M10 51.2c14.5 2.4 24.2-.6 38.8 1.6 5.2.8 11.4 2.2 13.2 2.6"
        stroke="#3D342B"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13.2 37.4c-5.2 3.2-8.6 10.4-6.4 13.6 6.4-1.2 11.2-4.2 14.6-8.8"
        fill="#C45A3E"
      />
      <path
        d="M20.5 28.5c-1.6 6.8 1.2 14.8 10.4 17.6 9.6 2.9 18.2-1.4 20.6-8.8 2.2-6.8-1.8-13.2-9.2-16.2-7.6-3.1-20.2-1.2-21.8 7.4Z"
        fill="#E07A5F"
      />
      <path
        d="M24.2 33.6c3.8 3.4 11.4 5.2 18.4.6.2 5.6-4.2 10.4-10.6 10.8-6.2.4-10.2-5.2-7.8-11.4Z"
        fill="#C45A3E"
      />
      <path
        d="M41.2 16.4c-5.4 1.2-8.2 6.6-6.6 12.2 1.6 5.6 7.4 8.4 12.8 6.8 5.2-1.6 7.8-7.2 6-12.4-1.8-5.4-7-7.8-12.2-6.6Z"
        fill="#1C1612"
      />
      <path
        d="M38.4 15.2c1.6-3.2 4.6-4.6 6.8-3.4 1.4.8 1.6 2.8.4 4.6"
        fill="#1C1612"
      />
      <circle cx="48.2" cy="22.6" r="1.85" fill="#FBF7F0" />
      <circle cx="48.7" cy="22.3" r="0.7" fill="#1C1612" />
      <path d="M53.4 25.2 61 27.1 53.2 29.4Z" fill="#D4A017" />
      <path
        d="M27.8 47.2 25.6 52.2M31.6 48.2 31.4 53M35.4 47.6 37.6 52.4"
        stroke="#1C1612"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}
