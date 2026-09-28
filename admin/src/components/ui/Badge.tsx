import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Role, ROLE_DEFINITIONS } from '@/types/rbac';
import { EmploymentStatus } from '@/types/staff';

export function RoleBadge({ role }: { role: Role }) {
  const def = ROLE_DEFINITIONS[role] || { name: role, badgeColor: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", def.badgeColor)}>
      {def.name}
    </span>
  );
}

export function StatusBadge({ status }: { status: EmploymentStatus | 'active' | 'inactive' | 'disabled' | 'available' | 'unavailable' | 'pending' }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    available: { label: 'Available', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    on_leave: { label: 'On Leave', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    inactive: { label: 'Inactive', color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
    unavailable: { label: 'Sold Out', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
    disabled: { label: 'Disabled', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
    pending: { label: 'Pending', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  };

  const item = map[status] || { label: status, color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", item.color)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}

export function TagBadge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'gold' | 'green' }) {
  const variants = {
    default: 'bg-aura-800/40 text-aura-300 border-aura-700/50',
    gold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border", variants[variant])}>
      {children}
    </span>
  );
}
