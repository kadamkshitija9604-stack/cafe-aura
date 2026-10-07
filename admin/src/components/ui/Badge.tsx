import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Role, ROLE_DEFINITIONS } from '@/types/rbac';
import { EmploymentStatus } from '@/types/staff';

export function RoleBadge({ role }: { role: Role }) {
  const def = ROLE_DEFINITIONS[role] || { name: role, badgeColor: 'bg-stone-100 text-stone-800 border-stone-300' };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm", def.badgeColor)}>
      {def.name}
    </span>
  );
}

export function StatusBadge({ status }: { status: EmploymentStatus | 'active' | 'inactive' | 'disabled' | 'available' | 'unavailable' | 'pending' }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    available: { label: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    on_leave: { label: 'On Leave', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    inactive: { label: 'Inactive', color: 'bg-stone-100 text-stone-600 border-stone-200' },
    unavailable: { label: 'Sold Out', color: 'bg-red-50 text-red-600 border-red-200' },
    disabled: { label: 'Disabled', color: 'bg-red-50 text-red-600 border-red-200' },
    pending: { label: 'Pending', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  const item = map[status] || { label: status, color: 'bg-stone-100 text-stone-600 border-stone-200' };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm", item.color)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}

export function TagBadge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'gold' | 'green' }) {
  const variants = {
    default: 'bg-aura-900 text-aura-300 border-aura-800',
    gold: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border", variants[variant])}>
      {children}
    </span>
  );
}
