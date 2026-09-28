'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Permission } from '@/types/rbac';

interface AdminLayoutProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
}

export function AdminLayout({ children, requiredPermission }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <div className="min-h-screen bg-espresso-950 text-aura-100 flex flex-col font-sans">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
          <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
