'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const { role, user } = useAuth();

  return (
    <div className="min-h-screen bg-espresso-950 flex flex-col justify-center items-center p-4 text-aura-100 text-center">
      <div className="max-w-md w-full bg-espresso-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-aura-50">
            Access Restricted
          </h1>
          <p className="text-xs text-aura-300 mt-1.5 leading-relaxed">
            Your current account role does not have permission to view this resource.
          </p>
        </div>

        <div className="p-3 bg-espresso-950 rounded-xl border border-aura-800 text-xs text-aura-300 space-y-1">
          <p>Signed in as: <b className="text-aura-100">{user?.displayName || user?.email}</b></p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span>Role:</span>
            <RoleBadge role={role} />
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <a href="/dashboard">
            <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
