import { MenuItem, MenuCategory } from '@/types/menu';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '@/lib/utils/mockData';
import { getAuthHeaders } from '@/lib/apiClient';

const CATEGORIES_KEY = 'cafe_aura_categories';
const MENU_KEY = 'cafe_aura_menu_items';

function getLocalCategories(): MenuCategory[] {
  if (typeof window === 'undefined') return INITIAL_CATEGORIES;
  const saved = localStorage.getItem(CATEGORIES_KEY);
  if (!saved) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try { return JSON.parse(saved); } catch { return INITIAL_CATEGORIES; }
}

function saveLocalCategories(data: MenuCategory[]) {
  if (typeof window !== 'undefined') localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data));
}

function getLocalMenuItems(): MenuItem[] {
  if (typeof window === 'undefined') return INITIAL_MENU_ITEMS;
  const saved = localStorage.getItem(MENU_KEY);
  if (!saved) {
    localStorage.setItem(MENU_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
    return INITIAL_MENU_ITEMS;
  }
  try { return JSON.parse(saved); } catch { return INITIAL_MENU_ITEMS; }
}

function saveLocalMenuItems(data: MenuItem[]) {
  if (typeof window !== 'undefined') localStorage.setItem(MENU_KEY, JSON.stringify(data));
}

export const menuService = {
  // --- CATEGORIES ---
  async getCategories(): Promise<MenuCategory[]> {
    try {
      const res = await fetch('/api/categories', {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalCategories(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed for categories, falling back to local:', e);
    }
    return getLocalCategories();
  },

  async createCategory(category: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuCategory> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(category),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API category create error:', e);
    }

    // Fallback
    const newCat: MenuCategory = {
      ...category,
      id: `cat-${Date.now()}`,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getLocalCategories();
    saveLocalCategories([...current, newCat]);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<MenuCategory>): Promise<void> {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API category update error:', e);
    }

    const current = getLocalCategories();
    const updated = current.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    saveLocalCategories(updated);
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete category' };
      }
      const current = getLocalCategories();
      saveLocalCategories(current.filter(c => c.id !== id));
      return { success: true };
    } catch (e: any) {
      console.warn('API category delete error:', e);
      return { success: false, error: e.message };
    }
  },

  // --- MENU ITEMS ---
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const res = await fetch('/api/menu', {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalMenuItems(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed for menu items, falling back to local:', e);
    }
    return getLocalMenuItems();
  },

  async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API menu create error:', e);
    }

    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getLocalMenuItems();
    saveLocalMenuItems([...current, newItem]);
    return newItem;
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API menu update error:', e);
    }

    const current = getLocalMenuItems();
    const updated = current.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i);
    saveLocalMenuItems(updated);
  },

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/menu?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const current = getLocalMenuItems();
        saveLocalMenuItems(current.filter(i => i.id !== id));
        return;
      }
    } catch (e) {
      console.warn('API menu delete error:', e);
    }

    const current = getLocalMenuItems();
    saveLocalMenuItems(current.filter(i => i.id !== id));
  },

  async duplicateMenuItem(item: MenuItem): Promise<MenuItem> {
    const duplicateData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> = {
      ...item,
      name: `${item.name} (Copy)`,
      displayOrder: (item.displayOrder || 0) + 1,
    };
    return this.createMenuItem(duplicateData);
  }
};
