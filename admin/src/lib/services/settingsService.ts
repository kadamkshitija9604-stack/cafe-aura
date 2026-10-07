import { CafeSettings, WebsiteSettings } from '@/types/settings';
import { INITIAL_CAFE_SETTINGS, INITIAL_WEBSITE_SETTINGS } from '@/lib/utils/mockData';
import { getAuthHeaders } from '@/lib/apiClient';

export const settingsService = {
  async getCafeSettings(): Promise<CafeSettings> {
    try {
      const res = await fetch('/api/settings?key=general', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cafe_aura_settings');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return INITIAL_CAFE_SETTINGS;
  },

  async updateCafeSettings(settings: CafeSettings): Promise<void> {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key: 'general', value: settings }),
      });
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.setItem('cafe_aura_settings', JSON.stringify(settings));
    }
  },

  async getWebsiteSettings(): Promise<WebsiteSettings> {
    try {
      const res = await fetch('/api/settings?key=website', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cafe_aura_web_settings');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return INITIAL_WEBSITE_SETTINGS;
  },

  async updateWebsiteSettings(settings: WebsiteSettings): Promise<void> {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key: 'website', value: settings }),
      });
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.setItem('cafe_aura_web_settings', JSON.stringify(settings));
    }
  },
};
