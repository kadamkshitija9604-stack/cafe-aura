import { AdminUser, UserStatus } from '@/types/user';
import { Role } from '@/types/rbac';
import { INITIAL_USERS } from '@/lib/utils/mockData';

const USERS_KEY = 'cafe_aura_users';

function getLocalUsers(): AdminUser[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  const saved = localStorage.getItem(USERS_KEY);
  if (!saved) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try { return JSON.parse(saved); } catch { return INITIAL_USERS; }
}

function saveLocalUsers(data: AdminUser[]) {
  if (typeof window !== 'undefined') localStorage.setItem(USERS_KEY, JSON.stringify(data));
}

export const userService = {
  async getUsers(): Promise<AdminUser[]> {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        saveLocalUsers(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed for users, falling back to local:', e);
    }
    return getLocalUsers();
  },

  async updateUserRole(uid: string, role: Role): Promise<void> {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: uid, role }),
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API user update role error:', e);
    }

    const current = getLocalUsers();
    saveLocalUsers(current.map(u => u.uid === uid ? { ...u, role } : u));
  },

  async updateUserStatus(uid: string, status: UserStatus): Promise<void> {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: uid, status }),
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API user update status error:', e);
    }

    const current = getLocalUsers();
    saveLocalUsers(current.map(u => u.uid === uid ? { ...u, status, disabled: status === 'disabled' } : u));
  }
};
