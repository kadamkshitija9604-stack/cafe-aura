'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { userService } from '@/lib/services/userService';
import { auditService } from '@/lib/services/auditService';
import { canManageRole } from '@/lib/permissions/rbac';
import { AdminUser, UserStatus } from '@/types/user';
import { Role, ROLE_DEFINITIONS } from '@/types/rbac';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, RoleBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/cn';
import { Shield, UserCheck, UserX, KeyRound, AlertTriangle } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, role: currentRole } = useAuth();
  const { success, error, warning } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Role Assignment Modal
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('viewer');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      error('Error', 'Failed to load admin users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRoleModal = (u: AdminUser) => {
    if (!canManageRole(currentRole, u.role) && currentUser?.uid !== u.uid) {
      warning('Permission Denied', 'You cannot modify a user whose role is equal or higher than yours.');
      return;
    }
    setTargetUser(u);
    setSelectedRole(u.role);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    if (!canManageRole(currentRole, selectedRole)) {
      error('Security Guard', 'You cannot elevate a user to a role higher than your own.');
      return;
    }

    try {
      setIsSaving(true);
      await userService.updateUserRole(targetUser.uid, selectedRole);
      await auditService.logAction({
        userId: currentUser?.uid || 'admin',
        userName: currentUser?.displayName || 'Admin',
        userEmail: currentUser?.email || '',
        userRole: currentRole,
        action: 'USER_ROLE_CHANGE',
        resourceType: 'user',
        resourceId: targetUser.uid,
        details: `Changed role for ${targetUser.email} from ${targetUser.role} to ${selectedRole}`,
      });

      success('Role Assigned', `Updated ${targetUser.displayName}'s role to ${ROLE_DEFINITIONS[selectedRole].name}.`);
      setTargetUser(null);
      await loadData();
    } catch (err) {
      error('Error', 'Failed to update user role.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUserStatus = async (u: AdminUser) => {
    if (u.uid === currentUser?.uid) {
      warning('Action Prevented', 'You cannot disable your own administrator account.');
      return;
    }

    const newStatus: UserStatus = u.status === 'active' ? 'disabled' : 'active';
    try {
      await userService.updateUserStatus(u.uid, newStatus);
      await auditService.logAction({
        userId: currentUser?.uid || 'admin',
        userName: currentUser?.displayName || 'Admin',
        userEmail: currentUser?.email || '',
        userRole: currentRole,
        action: 'USER_STATUS_CHANGE',
        resourceType: 'user',
        resourceId: u.uid,
        details: `Set status for ${u.email} to ${newStatus}`,
      });

      success('Account Status Changed', `User account is now ${newStatus}.`);
      await loadData();
    } catch (err) {
      error('Error', 'Failed to update account status.');
    }
  };

  return (
    <AdminLayout requiredPermission="users:view">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
            Admin User Accounts ({users.length})
          </h1>
          <p className="text-xs text-aura-300 mt-1">
            Manage authenticated administrators, OAuth providers, and access privileges
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-espresso-950/80 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Auth Provider</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Last Login</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-800/50 text-xs">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-aura-900/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-aura-800 border border-aura-700 flex items-center justify-center font-bold text-aura-200 shrink-0">
                          {u.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.photoURL}
                              alt={u.displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            u.displayName[0]
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-aura-50 flex items-center gap-2">
                            {u.displayName}
                            {u.uid === currentUser?.uid && (
                              <span className="text-[10px] bg-caramel-500/20 text-caramel-300 px-1.5 py-0.2 rounded">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-aura-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-espresso-950 border border-aura-800 text-[11px] text-aura-200">
                        {u.providerId === 'google.com' ? 'Google OAuth' : 'Email/Password'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="px-5 py-3.5 text-aura-300 text-[11px]">
                      {formatDate(u.lastLoginAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <RoleGuard permission="users:manage_roles">
                          <button
                            onClick={() => openRoleModal(u)}
                            className="p-1.5 rounded-lg text-aura-300 hover:text-aura-50 hover:bg-aura-800/50 transition-colors"
                            title="Assign Role"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                        </RoleGuard>

                        <RoleGuard permission="users:status">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            disabled={u.uid === currentUser?.uid}
                            className="p-1.5 rounded-lg text-aura-400 hover:text-aura-100 hover:bg-aura-800/50 transition-colors disabled:opacity-30"
                            title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                          >
                            {u.status === 'active' ? (
                              <UserX className="w-4 h-4 text-red-400" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                        </RoleGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Change Role Modal */}
        <Modal
          isOpen={!!targetUser}
          onClose={() => setTargetUser(null)}
          title="Assign Administrator Role"
          description={`Select the permission tier for ${targetUser?.displayName}.`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveRole} className="space-y-4">
            <div className="p-3 bg-espresso-950 rounded-xl border border-aura-800 text-xs">
              <p className="text-aura-400">User Account:</p>
              <p className="font-semibold text-aura-100">{targetUser?.displayName} ({targetUser?.email})</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                Target Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
              >
                {Object.keys(ROLE_DEFINITIONS).map((r) => {
                  const def = ROLE_DEFINITIONS[r as Role];
                  const disabled = !canManageRole(currentRole, r as Role);
                  return (
                    <option key={r} value={r} disabled={disabled}>
                      {def.name} {disabled ? '(Requires Higher Privilege)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-caramel-500/10 border border-caramel-500/30 text-xs text-caramel-300">
              <b>Role Description:</b> {ROLE_DEFINITIONS[selectedRole]?.description}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-aura-800/60">
              <Button type="button" variant="outline" onClick={() => setTargetUser(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Update Role
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
