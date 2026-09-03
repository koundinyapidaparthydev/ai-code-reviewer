import React, { ReactNode } from 'react';
import { CodebirdLogo } from '@/components/brand/CodebirdLogo';
import { BirdMark } from '@/components/brand/BirdMark';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cream-50 text-ink-800">
      <div className="pointer-events-none absolute inset-0 auth-wash" />
      <div className="pointer-events-none absolute -right-16 top-10 opacity-[0.07]">
        <BirdMark size={420} />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] page-enter">
          <div className="mb-8 flex justify-center">
            <CodebirdLogo href="/login" size="lg" animate />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
