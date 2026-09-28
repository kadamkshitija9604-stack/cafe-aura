'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { Permission, Role } from '@/types/rbac';
import { hasPermission, hasAnyPermission } from '@/lib/permissions/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  anyPermissions?: Permission[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  permission,
  anyPermissions,
  fallback = null,
}: RoleGuardProps) {
  const { role } = useAuth();

  if (permission && !hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && !hasAnyPermission(role, anyPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
