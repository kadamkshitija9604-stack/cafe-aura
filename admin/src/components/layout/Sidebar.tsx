'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasPermission } from '@/lib/permissions/rbac';
import { RoleBadge } from '@/components/ui/Badge';
import { Role, ROLE_DEFINITIONS } from '@/types/rbac';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  UtensilsCrossed,
  Layers,
  Users,
  UserCog,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Coffee,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, logout, isDemoMode, setDemoRole } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: 'dashboard:view' as const,
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: ShoppingBag,
      permission: 'orders:view' as const,
    },
    {
      label: 'Menu Items',
      href: '/menu',
      icon: UtensilsCrossed,
      permission: 'menu:view' as const,
    },
    {
      label: 'Categories',
      href: '/categories',
      icon: Layers,
      permission: 'categories:view' as const,
    },
    {
      label: 'Inventory & Stock',
      href: '/inventory',
      icon: Boxes,
      permission: 'inventory:view' as const,
    },
    {
      label: 'Staff Directory',
      href: '/staff',
      icon: Users,
      permission: 'staff:view' as const,
    },
    {
      label: 'User Accounts',
      href: '/users',
      icon: UserCog,
      permission: 'users:view' as const,
    },
    {
      label: 'Roles & RBAC',
      href: '/roles',
      icon: ShieldCheck,
      permission: 'roles:view' as const,
    },
    {
      label: 'Audit Logs',
      href: '/audit-logs',
      icon: History,
      permission: 'audit:view' as const,
    },
    {
      label: 'Cafe Settings',
      href: '/settings',
      icon: Settings,
      permission: 'settings:view' as const,
    },
  ];

  const filteredNav = navItems.filter((item) =>
    hasPermission(role, item.permission)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-espresso-950 border-r border-aura-800/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-aura-800/60">
          <a href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-caramel-600 to-caramel-400 flex items-center justify-center text-espresso-950 font-bold shadow-md shadow-caramel-500/20">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-aura-50 tracking-tight text-base leading-none">
                Cafe Aura
              </h1>
              <span className="text-[10px] font-semibold tracking-widest text-caramel-400 uppercase">
                Admin Panel
              </span>
            </div>
          </a>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-aura-400 hover:text-aura-50 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-aura-400/80">
            Operations & Catalog
          </div>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-caramel-500/15 text-caramel-300 font-semibold border border-caramel-500/30"
                    : "text-aura-300 hover:text-aura-50 hover:bg-aura-900/40"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-caramel-400" : "text-aura-400 group-hover:text-aura-200"
                  )}
                />
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Demo Role Switcher */}
        {isDemoMode && (
          <div className="px-4 py-3 mx-3 mb-3 bg-espresso-900/90 rounded-xl border border-aura-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-caramel-400">
                Live RBAC Role Switcher
              </span>
            </div>
            <select
              value={role}
              onChange={(e) => setDemoRole(e.target.value as Role)}
              className="w-full text-xs bg-espresso-950 border border-aura-700/60 rounded-lg px-2 py-1.5 text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
            >
              {Object.keys(ROLE_DEFINITIONS).map((r) => (
                <option key={r} value={r}>
                  {ROLE_DEFINITIONS[r as Role].name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Card & Logout */}
        <div className="p-3 border-t border-aura-800/60 bg-espresso-900/30">
          <div className="flex items-center justify-between p-2 rounded-xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-aura-800 border border-aura-700 flex items-center justify-center text-xs font-bold text-aura-200 shrink-0">
                {user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.displayName?.[0] || 'A'
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-aura-100 truncate">
                  {user?.displayName || 'Admin User'}
                </p>
                <div className="mt-0.5">
                  <RoleBadge role={role} />
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1.5 text-aura-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
