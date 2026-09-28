'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ROLE_DEFINITIONS, Role, Permission } from '@/types/rbac';
import { RoleBadge } from '@/components/ui/Badge';
import { ShieldCheck, Check, X, Shield, Lock } from 'lucide-react';

interface PermissionCategory {
  group: string;
  items: { id: Permission; name: string; description: string }[];
}

const PERMISSION_GROUPS: PermissionCategory[] = [
  {
    group: 'Dashboard & Analytics',
    items: [
      { id: 'dashboard:view', name: 'View Dashboard', description: 'Access dashboard summary cards and operations status' },
      { id: 'analytics:view', name: 'View Analytics', description: 'Inspect revenue, bestsellers and visitor analytics' },
    ],
  },
  {
    group: 'Menu Management',
    items: [
      { id: 'menu:view', name: 'View Menu Items', description: 'Browse and search menu items' },
      { id: 'menu:create', name: 'Create Menu Item', description: 'Add new dishes and beverages to the catalogue' },
      { id: 'menu:edit', name: 'Edit Menu Item', description: 'Modify prices, discounts, tags and ingredients' },
      { id: 'menu:delete', name: 'Delete Menu Item', description: 'Permanently remove dishes from the catalogue' },
      { id: 'menu:toggle_status', name: 'Toggle Availability', description: 'Mark items as In Stock or Sold Out instantly' },
    ],
  },
  {
    group: 'Category Organization',
    items: [
      { id: 'categories:view', name: 'View Categories', description: 'Browse menu categories' },
      { id: 'categories:create', name: 'Create Category', description: 'Add new menu sections' },
      { id: 'categories:edit', name: 'Edit Category', description: 'Change display order, names and icons' },
      { id: 'categories:delete', name: 'Delete Category', description: 'Remove unused categories' },
    ],
  },
  {
    group: 'Staff Management',
    items: [
      { id: 'staff:view', name: 'View Staff Directory', description: 'Browse employee list and shift schedules' },
      { id: 'staff:create', name: 'Add Staff Member', description: 'Register new café employees' },
      { id: 'staff:edit', name: 'Edit Staff Profile', description: 'Update positions, shifts, and departments' },
      { id: 'staff:delete', name: 'Remove Staff', description: 'Delete staff records from registry' },
      { id: 'staff:view_sensitive', name: 'View Sensitive Info', description: 'Access emergency contacts and personal notes' },
    ],
  },
  {
    group: 'Users & RBAC',
    items: [
      { id: 'users:view', name: 'View User Accounts', description: 'Inspect admin users and login providers' },
      { id: 'users:manage_roles', name: 'Assign User Roles', description: 'Change user privilege levels' },
      { id: 'users:status', name: 'Account Status', description: 'Enable or disable administrator accounts' },
      { id: 'roles:view', name: 'View Roles Matrix', description: 'Inspect RBAC permission definitions' },
      { id: 'roles:manage', name: 'Manage Roles', description: 'Configure granular permission rules' },
    ],
  },
  {
    group: 'Settings & Audit',
    items: [
      { id: 'settings:view', name: 'View Settings', description: 'Inspect café hours and website banners' },
      { id: 'settings:edit', name: 'Modify Settings', description: 'Update hours, contact info, and site banners' },
      { id: 'audit:view', name: 'View Audit Logs', description: 'Inspect administrative audit trails' },
    ],
  },
];

const ROLES_LIST: Role[] = [
  'super_admin',
  'admin',
  'manager',
  'menu_manager',
  'staff_manager',
  'staff',
  'viewer',
];

export default function RolesPage() {
  return (
    <AdminLayout requiredPermission="roles:view">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
            Roles & Permissions Matrix
          </h1>
          <p className="text-xs text-aura-300 mt-1">
            Visual inspection of granular role-based access control (RBAC) across all 7 privilege tiers
          </p>
        </div>

        {/* Roles Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ROLES_LIST.map((r) => {
            const def = ROLE_DEFINITIONS[r];
            return (
              <div
                key={r}
                className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <RoleBadge role={r} />
                    <span className="text-[11px] text-aura-400 font-mono">
                      {def.permissions.length} perms
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-aura-50">{def.name}</h3>
                  <p className="text-xs text-aura-300 mt-1 leading-relaxed">
                    {def.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full RBAC Matrix Table */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-aura-800/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-aura-50">
              Granular Permission Matrix
            </h3>
            <span className="text-xs text-aura-400">
              Enforced on both Frontend & Backend
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-espresso-950 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                <tr>
                  <th className="px-5 py-3.5 w-1/3">Permission</th>
                  {ROLES_LIST.map((r) => (
                    <th key={r} className="px-3 py-3.5 text-center">
                      <span className="text-[10px] font-bold">
                        {ROLE_DEFINITIONS[r].name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-800/50">
                {PERMISSION_GROUPS.map((group) => (
                  <React.Fragment key={group.group}>
                    <tr className="bg-aura-950/60 font-bold text-caramel-400 text-xs">
                      <td colSpan={8} className="px-5 py-2.5 tracking-wider uppercase">
                        {group.group}
                      </td>
                    </tr>
                    {group.items.map((perm) => (
                      <tr key={perm.id} className="hover:bg-aura-900/20 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-aura-100">{perm.name}</p>
                          <p className="text-[10px] text-aura-400">{perm.description}</p>
                        </td>

                        {ROLES_LIST.map((r) => {
                          const has = ROLE_DEFINITIONS[r].permissions.includes(perm.id);
                          return (
                            <td key={r} className="px-3 py-3 text-center">
                              {has ? (
                                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mx-auto">
                                  <Check className="w-3 h-3" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-aura-900/40 text-aura-600 mx-auto">
                                  <X className="w-3 h-3" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
