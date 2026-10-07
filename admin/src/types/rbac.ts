export type Role =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'menu_manager'
  | 'staff_manager'
  | 'staff'
  | 'viewer';

export type Permission =
  // Dashboard & Analytics
  | 'dashboard:view'
  | 'analytics:view'
  // Menu
  | 'menu:view'
  | 'menu:create'
  | 'menu:edit'
  | 'menu:delete'
  | 'menu:toggle_status'
  // Categories
  | 'categories:view'
  | 'categories:create'
  | 'categories:edit'
  | 'categories:delete'
  // Orders
  | 'orders:view'
  | 'orders:create'
  | 'orders:edit'
  | 'orders:cancel'
  // Inventory
  | 'inventory:view'
  | 'inventory:edit'
  | 'inventory:delete'
  // Notifications
  | 'notifications:view'
  | 'notifications:manage'
  // Staff
  | 'staff:view'
  | 'staff:create'
  | 'staff:edit'
  | 'staff:delete'
  | 'staff:view_sensitive'
  // Users & Roles
  | 'users:view'
  | 'users:manage_roles'
  | 'users:status'
  | 'roles:view'
  | 'roles:manage'
  // Settings
  | 'settings:view'
  | 'settings:edit'
  // Audit Logs
  | 'audit:view';

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  badgeColor: string;
  permissions: Permission[];
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Complete unrestricted access to all modules, orders, inventory, users, permissions, and settings.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    permissions: [
      'dashboard:view', 'analytics:view',
      'menu:view', 'menu:create', 'menu:edit', 'menu:delete', 'menu:toggle_status',
      'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
      'orders:view', 'orders:create', 'orders:edit', 'orders:cancel',
      'inventory:view', 'inventory:edit', 'inventory:delete',
      'notifications:view', 'notifications:manage',
      'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:view_sensitive',
      'users:view', 'users:manage_roles', 'users:status',
      'roles:view', 'roles:manage',
      'settings:view', 'settings:edit',
      'audit:view'
    ],
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Full operational control over menu, orders, inventory, staff, categories, and cafe settings.',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    permissions: [
      'dashboard:view', 'analytics:view',
      'menu:view', 'menu:create', 'menu:edit', 'menu:delete', 'menu:toggle_status',
      'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
      'orders:view', 'orders:create', 'orders:edit', 'orders:cancel',
      'inventory:view', 'inventory:edit', 'inventory:delete',
      'notifications:view', 'notifications:manage',
      'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:view_sensitive',
      'users:view',
      'roles:view',
      'settings:view', 'settings:edit',
      'audit:view'
    ],
  },
  manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Oversees daily operations, incoming orders, stock replenishment, and staff directory.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    permissions: [
      'dashboard:view', 'analytics:view',
      'menu:view', 'menu:create', 'menu:edit', 'menu:toggle_status',
      'categories:view', 'categories:create', 'categories:edit',
      'orders:view', 'orders:create', 'orders:edit',
      'inventory:view', 'inventory:edit',
      'notifications:view', 'notifications:manage',
      'staff:view', 'staff:create', 'staff:edit',
      'settings:view',
      'audit:view'
    ],
  },
  menu_manager: {
    id: 'menu_manager',
    name: 'Menu Manager',
    description: 'Dedicated to adding, pricing, updating, and categorizing menu items & inventory tracking.',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    permissions: [
      'dashboard:view',
      'menu:view', 'menu:create', 'menu:edit', 'menu:delete', 'menu:toggle_status',
      'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
      'inventory:view', 'inventory:edit',
      'notifications:view'
    ],
  },
  staff_manager: {
    id: 'staff_manager',
    name: 'Staff Manager',
    description: 'Manages staff profiles, schedules, shifts, and team status.',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    permissions: [
      'dashboard:view',
      'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:view_sensitive',
      'notifications:view'
    ],
  },
  staff: {
    id: 'staff',
    name: 'Staff',
    description: 'Operational view to process incoming orders, view recipes, and check stock levels.',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    permissions: [
      'dashboard:view',
      'orders:view', 'orders:edit',
      'menu:view',
      'categories:view',
      'inventory:view',
      'staff:view',
      'notifications:view'
    ],
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboard statistics and public menu directory.',
    badgeColor: 'bg-stone-100 text-stone-600 border-stone-200',
    permissions: [
      'dashboard:view',
      'menu:view',
      'categories:view',
      'orders:view'
    ],
  },
};
