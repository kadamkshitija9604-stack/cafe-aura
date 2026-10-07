'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { staffService } from '@/lib/services/staffService';
import { auditService } from '@/lib/services/auditService';
import { hasPermission } from '@/lib/permissions/rbac';
import { StaffMember, Department, ShiftType, EmploymentStatus } from '@/types/staff';
import { Role, ROLE_DEFINITIONS } from '@/types/rbac';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge, RoleBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/cn';
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Shield,
  Clock,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Barista & Coffee',
  'Kitchen & Bakery',
  'Service & Front',
  'Management',
  'Logistics',
];

const SHIFTS: ShiftType[] = [
  'Morning (6AM - 2PM)',
  'Evening (2PM - 10PM)',
  'Full Day',
  'Flexible',
];

export default function StaffPage() {
  const { user, role } = useAuth();
  const { success, error } = useToast();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState<Department>('Barista & Coffee');
  const [assignedRole, setAssignedRole] = useState<Role>('staff');
  const [shift, setShift] = useState<ShiftType>('Morning (6AM - 2PM)');
  const [status, setStatus] = useState<EmploymentStatus>('active');
  const [joiningDate, setJoiningDate] = useState('2025-01-01');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');

  const canViewSensitive = hasPermission(role, 'staff:view_sensitive');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await staffService.getStaff();
      setStaffList(data);
    } catch (err) {
      error('Error', 'Failed to load staff list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setEmployeeId(`AUR-00${staffList.length + 1}`);
    setFullName('');
    setEmail('');
    setPhone('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setPosition('Specialty Barista');
    setDepartment('Barista & Coffee');
    setAssignedRole('staff');
    setShift('Morning (6AM - 2PM)');
    setStatus('active');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setEmergencyName('');
    setEmergencyRelationship('');
    setEmergencyPhone('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEmployeeId(staff.employeeId);
    setFullName(staff.fullName);
    setEmail(staff.email);
    setPhone(staff.phone);
    setPhotoUrl(staff.photoUrl || '');
    setPosition(staff.position);
    setDepartment(staff.department);
    setAssignedRole(staff.role);
    setShift(staff.shift);
    setStatus(staff.status);
    setJoiningDate(staff.joiningDate);
    setEmergencyName(staff.emergencyContact?.name || '');
    setEmergencyRelationship(staff.emergencyContact?.relationship || '');
    setEmergencyPhone(staff.emergencyContact?.phone || '');
    setNotes(staff.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !employeeId || !position) {
      error('Validation Error', 'Please complete all required fields.');
      return;
    }

    const payload = {
      employeeId,
      fullName,
      email,
      phone,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      position,
      department,
      role: assignedRole,
      shift,
      status,
      joiningDate,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRelationship,
        phone: emergencyPhone,
      },
      notes,
    };

    try {
      setIsSaving(true);
      if (editingStaff) {
        await staffService.updateStaff(editingStaff.id, payload);
        await auditService.logAction({
          userId: user?.uid || 'admin',
          userName: user?.displayName || 'Admin',
          userEmail: user?.email || '',
          userRole: role,
          action: 'STAFF_UPDATE',
          resourceType: 'staff',
          resourceId: editingStaff.id,
          details: `Updated staff profile for ${fullName} (${position})`,
        });
        success('Staff Updated', `${fullName}'s profile has been updated.`);
      } else {
        const created = await staffService.createStaff(payload);
        await auditService.logAction({
          userId: user?.uid || 'admin',
          userName: user?.displayName || 'Admin',
          userEmail: user?.email || '',
          userRole: role,
          action: 'STAFF_CREATE',
          resourceType: 'staff',
          resourceId: created.id,
          details: `Added new staff member ${fullName} (${position})`,
        });
        success('Staff Added', `${fullName} added to the staff directory.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      error('Save Failed', err.message || 'Could not save staff record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await staffService.deleteStaff(deleteTarget.id);
      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'STAFF_DELETE',
        resourceType: 'staff',
        resourceId: deleteTarget.id,
        details: `Deleted staff record for ${deleteTarget.fullName}`,
      });
      success('Staff Removed', `${deleteTarget.fullName} has been removed.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      error('Error', 'Failed to remove staff.');
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'all' || s.department === selectedDept;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staffList, searchQuery, selectedDept, selectedStatus]);

  return (
    <AdminLayout requiredPermission="staff:view">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
              Staff Directory ({staffList.length})
            </h1>
            <p className="text-xs text-aura-300 mt-1">
              Manage café baristas, chefs, floor managers, and team assignments
            </p>
          </div>

          <RoleGuard permission="staff:create">
            <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
              Add Staff Member
            </Button>
          </RoleGuard>
        </div>

        {/* Filters */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search staff by name, employee ID, position or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-espresso-950 border border-aura-800 rounded-xl px-3 py-2 text-xs text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-espresso-950 border border-aura-800 rounded-xl px-3 py-2 text-xs text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-espresso-950/80 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Department & Role</th>
                  <th className="px-5 py-3.5">Shift Schedule</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Emergency Contact</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-800/50 text-xs">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-aura-400">
                      No staff members found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-aura-900/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-aura-50 flex items-center gap-2">
                            {staff.fullName}
                            <span className="font-mono text-[10px] text-caramel-400 bg-caramel-500/10 px-1.5 py-0.5 rounded">
                              {staff.employeeId}
                            </span>
                          </p>
                          <p className="text-[11px] text-aura-400">{staff.position}</p>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-medium text-aura-200">{staff.department}</p>
                        <div className="mt-1">
                          <RoleBadge role={staff.role} />
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-aura-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-aura-400" />
                          <span>{staff.shift}</span>
                        </div>
                        <span className="text-[10px] text-aura-400 block mt-0.5">
                          Joined {staff.joiningDate}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={staff.status} />
                      </td>

                      <td className="px-5 py-3.5">
                        {canViewSensitive ? (
                          staff.emergencyContact?.name ? (
                            <div>
                              <p className="text-aura-200 font-medium">
                                {staff.emergencyContact.name} ({staff.emergencyContact.relationship})
                              </p>
                              <p className="text-aura-400 text-[11px]">
                                {staff.emergencyContact.phone}
                              </p>
                            </div>
                          ) : (
                            <span className="text-aura-500 italic">None provided</span>
                          )
                        ) : (
                          <span className="text-aura-500 italic flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Restricted
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <RoleGuard permission="staff:edit">
                            <button
                              onClick={() => openEditModal(staff)}
                              className="p-1.5 rounded-lg text-aura-300 hover:text-aura-50 hover:bg-aura-800/50 transition-colors"
                              title="Edit staff"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </RoleGuard>

                          <RoleGuard permission="staff:delete">
                            <button
                              onClick={() => setDeleteTarget(staff)}
                              className="p-1.5 rounded-lg text-aura-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete staff"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </RoleGuard>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Staff Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingStaff ? 'Edit Staff Profile' : 'Add Staff Member'}
          description="Register team members, assign schedules, and configure emergency contacts."
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                required
              />

              <Input
                label="Employee ID *"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="AUR-005"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@cafeaura.com"
                required
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Position Title *"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Head Barista"
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                  Admin System Role
                </label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value as Role)}
                  className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
                >
                  {Object.keys(ROLE_DEFINITIONS).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_DEFINITIONS[r as Role].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                  Shift Schedule
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as ShiftType)}
                  className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                  Employment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                  className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <Input
                label="Joining Date"
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>

            {/* Emergency Contact */}
            <div className="p-4 rounded-xl bg-espresso-950/60 border border-aura-800/60 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-caramel-400">
                Emergency Contact (Restricted Access)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Relative Name"
                />
                <Input
                  label="Relationship"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  placeholder="Spouse / Parent"
                />
                <Input
                  label="Phone Number"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                Staff Notes / Certifications
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Q-grader coffee certification, allergy training..."
                className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-aura-800/60">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {editingStaff ? 'Save Staff Profile' : 'Add Staff Member'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Remove Staff Member"
          message={`Are you sure you want to remove ${deleteTarget?.fullName} (${deleteTarget?.employeeId}) from the staff registry?`}
          confirmText="Remove Staff"
        />
      </div>
    </AdminLayout>
  );
}
