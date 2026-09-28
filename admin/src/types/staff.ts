import { Role } from './rbac';

export type EmploymentStatus = 'active' | 'inactive' | 'on_leave';
export type Department = 'Barista & Coffee' | 'Kitchen & Bakery' | 'Service & Front' | 'Management' | 'Logistics';
export type ShiftType = 'Morning (6AM - 2PM)' | 'Evening (2PM - 10PM)' | 'Full Day' | 'Flexible';

export interface StaffMember {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  position: string;
  department: Department;
  role: Role;
  shift: ShiftType;
  status: EmploymentStatus;
  joiningDate: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
