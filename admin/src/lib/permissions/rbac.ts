import { Role, Permission, ROLE_DEFINITIONS } from '@/types/rbac';

/**
 * Checks if a given role possesses the required permission.
 */
export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const roleDef = ROLE_DEFINITIONS[role];
  if (!roleDef) return false;
  return roleDef.permissions.includes(permission);
}

/**
 * Checks if a given role has at least ONE of the listed permissions.
 */
export function hasAnyPermission(role: Role | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Checks if a given role has ALL of the listed permissions.
 */
export function hasAllPermissions(role: Role | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Security hierarchy rank for comparing role elevations.
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
  manager: 60,
  menu_manager: 40,
  staff_manager: 40,
  staff: 20,
  viewer: 10,
};

export function canManageRole(currentUserRole: Role, targetRole: Role): boolean {
  if (currentUserRole === 'super_admin') return true;
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
}
