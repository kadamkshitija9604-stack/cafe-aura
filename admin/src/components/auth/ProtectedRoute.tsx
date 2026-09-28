'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Permission } from '@/types/rbac';
import { hasPermission } from '@/lib/permissions/rbac';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (requiredPermission && !hasPermission(role, requiredPermission)) {
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, role, requiredPermission, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-espresso-950 flex flex-col items-center justify-center text-aura-100">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-aura-500/20 border-t-aura-500 animate-spin" />
          <span className="absolute text-xl">☕</span>
        </div>
        <p className="text-aura-300 text-sm font-medium tracking-wide animate-pulse">
          Authenticating Cafe Aura Admin...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
