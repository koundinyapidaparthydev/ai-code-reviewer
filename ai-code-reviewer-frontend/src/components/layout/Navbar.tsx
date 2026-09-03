'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useState } from 'react';
import { CodebirdLogo } from '@/components/brand/CodebirdLogo';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-0 z-30 w-full border-b border-ink-100/80 bg-cream-50/90 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center gap-3">
            <CodebirdLogo href="/dashboard" size="md" />
            <span className="hidden rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-800 sm:inline">
              Sandbox
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl p-2 text-ink-500 transition-colors hover:bg-cream-100 hover:text-ink-800"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[10px] text-cream-50">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 max-h-96 w-80 overflow-y-auto rounded-paper border border-ink-100 bg-cream-50 py-2 shadow-lift">
                  <div className="border-b border-ink-100 px-4 py-2">
                    <h3 className="text-sm font-semibold text-ink-800">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-ink-400">
                      Nothing new from Codebird
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`cursor-pointer px-4 py-3 hover:bg-cream-100 ${
                          !notification.read ? 'bg-coral-50' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }}
                      >
                        <p className="text-sm font-medium text-ink-800">{notification.title}</p>
                        <p className="mt-1 text-xs text-ink-500">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl p-2 text-ink-500 transition-colors hover:bg-cream-100 hover:text-ink-800"
              >
                <User size={20} />
                <span className="hidden text-sm font-medium text-ink-700 sm:block">
                  {user?.name || 'User'}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-paper border border-ink-100 bg-cream-50 py-2 shadow-lift">
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-ink-700 hover:bg-cream-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-coral-600 hover:bg-cream-100"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
