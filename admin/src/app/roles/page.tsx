'use client';

import React, { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ROLE_DEFINITIONS, Role, Permission } from '@/types/rbac';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@/components/ui/Input';
import { RoleBadge } from '@/components/ui/Badge';
import {
  Crown,
  ShieldCheck,
  Briefcase,
  UtensilsCrossed,
  UserCheck,
  Users,
  Eye,
  Check,
  X,
  Search,
  Sparkles,
  Shield,
  Layers,
  Lock,
  SlidersHorizontal
} from 'lucide-react';

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
    group: 'Orders & Fulfillment',
    items: [
      { id: 'orders:view', name: 'View Orders', description: 'Access live order queue and history' },
      { id: 'orders:create', name: 'Create Order', description: 'Manually place customer or phone orders' },
      { id: 'orders:edit', name: 'Update Order Status', description: 'Advance preparation, fulfillment & kitchen states' },
      { id: 'orders:cancel', name: 'Cancel / Refund Orders', description: 'Void tickets and process customer cancellations' },
    ],
  },
  {
    group: 'Inventory & Stock Control',
    items: [
      { id: 'inventory:view', name: 'View Inventory', description: 'Monitor stock levels, units and low-stock alerts' },
      { id: 'inventory:edit', name: 'Adjust Stock / Log Wastage', description: 'Record deliveries, adjustments & usage logs' },
      { id: 'inventory:delete', name: 'Delete Inventory Records', description: 'Remove raw material and supplier SKUs' },
    ],
  },
  {
    group: 'Staff & Team Directory',
    items: [
      { id: 'staff:view', name: 'View Staff Directory', description: 'Browse employee list and shift schedules' },
      { id: 'staff:create', name: 'Add Staff Member', description: 'Register new café employees' },
      { id: 'staff:edit', name: 'Edit Staff Profile', description: 'Update positions, shifts, and departments' },
      { id: 'staff:delete', name: 'Remove Staff', description: 'Delete staff records from registry' },
      { id: 'staff:view_sensitive', name: 'View Sensitive Info', description: 'Access emergency contacts and personal notes' },
    ],
  },
  {
    group: 'Users & RBAC Security',
    items: [
      { id: 'users:view', name: 'View User Accounts', description: 'Inspect admin users and login providers' },
      { id: 'users:manage_roles', name: 'Assign User Roles', description: 'Change user privilege levels' },
      { id: 'users:status', name: 'Account Status', description: 'Enable or disable administrator accounts' },
      { id: 'roles:view', name: 'View Roles Matrix', description: 'Inspect RBAC permission definitions' },
      { id: 'roles:manage', name: 'Manage Roles', description: 'Configure granular permission rules' },
    ],
  },
  {
    group: 'Settings & Audit Trail',
    items: [
      { id: 'settings:view', name: 'View Settings', description: 'Inspect café hours and website banners' },
      { id: 'settings:edit', name: 'Modify Settings', description: 'Update hours, contact info, and site banners' },
      { id: 'audit:view', name: 'View Audit Logs', description: 'Inspect administrative audit trails' },
    ],
  },
];

const ROLES_META: Record<
  Role,
  {
    level: string;
    tagline: string;
    icon: React.ElementType;
    badgeStyle: string;
    barColor: string;
    features: string[];
  }
> = {
  super_admin: {
    level: 'Tier 1 • Root',
    tagline: 'Unrestricted master authority',
    icon: Crown,
    badgeStyle: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    barColor: 'bg-purple-500',
    features: ['Full System Override', 'RBAC & User Access', 'Audit & Config'],
  },
  admin: {
    level: 'Tier 2 • Executive',
    tagline: 'Operational command & safety',
    icon: ShieldCheck,
    badgeStyle: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    barColor: 'bg-blue-500',
    features: ['Orders & Inventory', 'Staff & Directory', 'Store Settings'],
  },
  manager: {
    level: 'Tier 3 • Operations',
    tagline: 'Floor & inventory supervision',
    icon: Briefcase,
    badgeStyle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    barColor: 'bg-emerald-500',
    features: ['Daily Operations', 'Menu Updates', 'Staff Scheduling'],
  },
  menu_manager: {
    level: 'Tier 4 • Catalog',
    tagline: 'Dishes, drinks & pricing',
    icon: UtensilsCrossed,
    badgeStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    barColor: 'bg-amber-500',
    features: ['Menu Catalog', 'Category Ordering', 'Recipe Pricing'],
  },
  staff_manager: {
    level: 'Tier 5 • People',
    tagline: 'Team roster & attendance',
    icon: UserCheck,
    badgeStyle: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    barColor: 'bg-cyan-500',
    features: ['Staff Profiles', 'Shift Roster', 'Emergency Contacts'],
  },
  staff: {
    level: 'Tier 6 • Floor Staff',
    tagline: 'Order counter & kitchen line',
    icon: Users,
    badgeStyle: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    barColor: 'bg-orange-500',
    features: ['Take Orders', 'Update Order Status', 'View Item Recipes'],
  },
  viewer: {
    level: 'Tier 7 • Read Only',
    tagline: 'Dashboard & analytics observer',
    icon: Eye,
    badgeStyle: 'bg-stone-100 text-stone-800 border-stone-300',
    barColor: 'bg-stone-500',
    features: ['Read-only Metrics', 'Browse Catalog', 'View Reports'],
  },
};

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
  const { role: currentSessionRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'matrix' | 'roles'>('matrix');

  const totalPossiblePermissions = ROLE_DEFINITIONS.super_admin.permissions.length;

  const filteredGroups = useMemo(() => {
    let groups = PERMISSION_GROUPS;
    if (selectedCategory !== 'all') {
      groups = groups.filter((g) => g.group === selectedCategory);
    }
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups
      .map((group) => {
        const filteredItems = group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        );
        return { ...group, items: filteredItems };
      })
      .filter((g) => g.items.length > 0);
  }, [searchQuery, selectedCategory]);

  const displayedRoles = useMemo(() => {
    if (selectedRole === 'all') return ROLES_LIST;
    return ROLES_LIST.filter((r) => r === selectedRole);
  }, [selectedRole]);

  return (
    <AdminLayout requiredPermission="roles:view">
      <div className="space-y-6">
        {/* Header matching Staff Directory */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
              Roles & Permissions ({ROLES_LIST.length})
            </h1>
            <p className="text-xs text-aura-300 mt-1">
              Manage security privilege tiers, staff access scopes, and granular authorization rules
            </p>
          </div>
        </div>

        {/* Filters and Controls matching Staff Directory */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search permissions by name, key, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-espresso-950 border border-aura-800 rounded-xl px-3 py-2 text-xs text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {PERMISSION_GROUPS.map((g) => (
                <option key={g.group} value={g.group}>
                  {g.group}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role | 'all')}
              className="bg-espresso-950 border border-aura-800 rounded-xl px-3 py-2 text-xs text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
            >
              <option value="all">All Roles (Full Matrix)</option>
              {ROLES_LIST.map((r) => (
                <option key={r} value={r}>
                  {ROLE_DEFINITIONS[r].name} ({ROLE_DEFINITIONS[r].permissions.length} perms)
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-xl bg-espresso-950 border border-aura-800 p-1">
              <button
                type="button"
                onClick={() => setActiveView('matrix')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeView === 'matrix'
                    ? 'bg-caramel-500 text-espresso-950 shadow-sm'
                    : 'text-aura-300 hover:text-aura-100'
                }`}
              >
                Permissions Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveView('roles')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeView === 'roles'
                    ? 'bg-caramel-500 text-espresso-950 shadow-sm'
                    : 'text-aura-300 hover:text-aura-100'
                }`}
              >
                Roles Directory
              </button>
            </div>
          </div>
        </div>

        {/* Main Content View */}
        {activeView === 'matrix' ? (
          /* Permissions Matrix Table matching Staff Table styling */
          <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-espresso-950/80 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                  <tr>
                    <th className="px-5 py-3.5 min-w-[280px]">Permission & Key</th>
                    {displayedRoles.map((r) => {
                      const isCurrentSession = currentSessionRole === r;
                      return (
                        <th key={r} className="px-4 py-3.5 text-center min-w-[110px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[11px] font-bold text-aura-200">{ROLE_DEFINITIONS[r].name}</span>
                            {isCurrentSession && (
                              <span className="text-[9px] font-bold text-caramel-400 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Session
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-aura-400">
                              {ROLE_DEFINITIONS[r].permissions.length} perms
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-800/50 text-xs">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={displayedRoles.length + 1} className="px-6 py-12 text-center text-aura-400">
                        No permissions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => (
                      <React.Fragment key={group.group}>
                        <tr className="bg-espresso-950/50 font-semibold text-caramel-400">
                          <td
                            colSpan={displayedRoles.length + 1}
                            className="px-5 py-2.5 uppercase tracking-wider text-[11px] border-y border-aura-800/60"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-caramel-400" />
                              <span>{group.group}</span>
                              <span className="text-[10px] font-normal font-mono text-aura-400 lowercase">
                                ({group.items.length} rules)
                              </span>
                            </div>
                          </td>
                        </tr>
                        {group.items.map((perm) => (
                          <tr key={perm.id} className="hover:bg-aura-900/20 transition-colors">
                            <td className="px-5 py-3.5">
                              <div>
                                <p className="font-semibold text-aura-100">{perm.name}</p>
                                <p className="text-[10px] font-mono text-caramel-400/90 mt-0.5">{perm.id}</p>
                                <p className="text-[11px] text-aura-400 mt-0.5">{perm.description}</p>
                              </div>
                            </td>
                            {displayedRoles.map((r) => {
                              const has = ROLE_DEFINITIONS[r].permissions.includes(perm.id);
                              return (
                                <td key={r} className="px-4 py-3.5 text-center">
                                  {has ? (
                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mx-auto shadow-sm">
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-aura-900/40 text-aura-600 mx-auto">
                                      <X className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Roles Directory Table matching Staff Directory table format */
          <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-espresso-950/80 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                  <tr>
                    <th className="px-5 py-3.5">Role & Level</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Scope & Capabilities</th>
                    <th className="px-5 py-3.5">Key Responsibilities</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-800/50 text-xs">
                  {displayedRoles.map((r) => {
                    const def = ROLE_DEFINITIONS[r];
                    const meta = ROLES_META[r];
                    const IconComp = meta.icon;
                    const count = def.permissions.length;
                    const percentage = Math.round((count / totalPossiblePermissions) * 100);
                    const isCurrentSession = currentSessionRole === r;

                    return (
                      <tr key={r} className="hover:bg-aura-900/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-espresso-950 border border-aura-800 flex items-center justify-center text-caramel-400 shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-aura-50 text-sm">{def.name}</p>
                                {isCurrentSession && (
                                  <span className="text-[9px] font-bold text-caramel-400 bg-caramel-500/10 px-1.5 py-0.5 rounded border border-caramel-500/20">
                                    Your Session
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-aura-400">{meta.level}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 max-w-xs">
                          <p className="font-medium text-aura-200">{meta.tagline}</p>
                          <p className="text-[11px] text-aura-400 mt-0.5">{def.description}</p>
                        </td>

                        <td className="px-5 py-3.5 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-aura-300 font-medium">Access Scope</span>
                            <span className="font-mono font-bold text-caramel-400">
                              {count}/{totalPossiblePermissions} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-espresso-950 rounded-full overflow-hidden border border-aura-800">
                            <div
                              className={`h-full rounded-full ${meta.barColor}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            {meta.features.map((feat) => (
                              <span
                                key={feat}
                                className="text-[10px] bg-espresso-950 border border-aura-800/80 text-aura-300 px-2 py-0.5 rounded-md font-medium"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRole(r);
                              setActiveView('matrix');
                            }}
                            className="inline-flex items-center gap-1 text-xs text-caramel-400 hover:text-caramel-300 font-medium bg-caramel-500/10 hover:bg-caramel-500/20 px-3 py-1.5 rounded-lg border border-caramel-500/30 transition-all"
                          >
                            <span>Inspect Matrix</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
