import { Role } from './rbac';

export type UserStatus = 'active' | 'disabled' | 'pending';
export type AuthProvider = 'password' | 'google.com';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  status: UserStatus;
  providerId: AuthProvider;
  phoneNumber?: string;
  createdAt: string;
  lastLoginAt: string;
  disabled?: boolean;
}
