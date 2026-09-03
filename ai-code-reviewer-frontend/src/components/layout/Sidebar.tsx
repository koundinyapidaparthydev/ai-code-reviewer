'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck,
  GitBranch,
  Upload,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodebirdLogo } from '@/components/brand/CodebirdLogo';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Reviews',
    href: '/validations',
    icon: FileCheck,
  },
  {
    name: 'Repositories',
    href: '/repositories',
    icon: GitBranch,
  },
  {
    name: 'New review',
    href: '/manual-validation',
    icon: Upload,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex w-64 flex-col border-r border-ink-100 bg-cream-50/70 pb-4 pt-5">
        <div className="mb-6 px-5 md:hidden">
          <CodebirdLogo size="sm" />
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-coral-50 text-coral-700 shadow-sm'
                    : 'text-ink-600 hover:bg-cream-100 hover:text-ink-800'
                )}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-coral-600' : 'text-ink-400 group-hover:text-ink-600'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <p className="px-5 pt-4 text-xs leading-relaxed text-ink-400">
          A bird reviews your code.
        </p>
      </div>
    </aside>
  );
}
