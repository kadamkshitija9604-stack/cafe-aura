import { StaffMember } from '@/types/staff';
import { INITIAL_STAFF } from '@/lib/utils/mockData';

const STAFF_KEY = 'cafe_aura_staff';

function getLocalStaff(): StaffMember[] {
  if (typeof window === 'undefined') return INITIAL_STAFF;
  const saved = localStorage.getItem(STAFF_KEY);
  if (!saved) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF));
    return INITIAL_STAFF;
  }
  try { return JSON.parse(saved); } catch { return INITIAL_STAFF; }
}

function saveLocalStaff(data: StaffMember[]) {
  if (typeof window !== 'undefined') localStorage.setItem(STAFF_KEY, JSON.stringify(data));
}

export const staffService = {
  async getStaff(): Promise<StaffMember[]> {
    try {
      const res = await fetch('/api/staff', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        saveLocalStaff(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed for staff, falling back to local:', e);
    }
    return getLocalStaff();
  },

  async createStaff(staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffMember> {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API staff create error:', e);
    }

    const newStaff: StaffMember = {
      ...staff,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getLocalStaff();
    saveLocalStaff([newStaff, ...current]);
    return newStaff;
  },

  async updateStaff(id: string, updates: Partial<StaffMember>): Promise<void> {
    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API staff update error:', e);
    }

    const current = getLocalStaff();
    const updated = current.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s);
    saveLocalStaff(updated);
  },

  async deleteStaff(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/staff?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const current = getLocalStaff();
        saveLocalStaff(current.filter(s => s.id !== id));
        return;
      }
    } catch (e) {
      console.warn('API staff delete error:', e);
    }

    const current = getLocalStaff();
    saveLocalStaff(current.filter(s => s.id !== id));
  }
};
