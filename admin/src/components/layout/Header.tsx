'use client';

import React from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 bg-espresso-950/80 backdrop-blur-md border-b border-aura-800/60 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-xl text-aura-300 hover:text-aura-50 hover:bg-aura-900/60 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Notification Center */}
        <NotificationBell />

        {/* Link to public website */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-aura-300 hover:text-aura-50 bg-aura-900/50 hover:bg-aura-800/60 border border-aura-700/50 px-3 py-1.5 rounded-xl transition-all"
        >
          <span className="hidden md:inline">View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
}

