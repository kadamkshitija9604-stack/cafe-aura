'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { RoleBadge } from '@/components/ui/Badge';
import { Menu, ExternalLink, Sparkles } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of Cafe Aura operations & KPIs' },
  '/orders': { title: 'Order Management', subtitle: 'Live customer orders, lifecycle tracking & fulfillment' },
  '/menu': { title: 'Menu Management', subtitle: 'Create, update and organize café dishes & beverages' },
  '/categories': { title: 'Categories', subtitle: 'Manage menu groups and display order' },
  '/inventory': { title: 'Inventory & Stock', subtitle: 'Track ingredients, packaging, thresholds & ledger audit trail' },
  '/staff': { title: 'Staff Directory', subtitle: 'Manage employees, schedules, shifts & emergency contacts' },
  '/users': { title: 'User Accounts', subtitle: 'Manage administrator accounts and authentication providers' },
  '/roles': { title: 'Roles & Permissions', subtitle: 'Inspect granular RBAC permissions across all roles' },
  '/audit-logs': { title: 'Audit Trail', subtitle: 'Review all administrator actions and system events' },
  '/settings': { title: 'Settings', subtitle: 'Configure cafe branding, opening hours & website banners' },
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { user, role, isDemoMode } = useAuth();

  const pageInfo = PAGE_TITLES[pathname] || {
    title: 'Cafe Aura Admin',
    subtitle: 'Management Console',
  };

  return (
    <header className="h-16 bg-espresso-950/80 backdrop-blur-md border-b border-aura-800/60 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-aura-300 hover:text-aura-50 hover:bg-aura-900/60 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-aura-50 leading-tight">
            {pageInfo.title}
          </h2>
          <p className="text-xs text-aura-400 hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {isDemoMode && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-caramel-500/10 border border-caramel-500/30 text-caramel-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-caramel-400" />
            <span>Interactive Demo Mode</span>
          </div>
        )}

        {/* Live Notification Center */}
        <NotificationBell />

        <div className="flex items-center gap-2">
          <RoleBadge role={role} />
        </div>

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
