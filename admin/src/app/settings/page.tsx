'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { settingsService } from '@/lib/services/settingsService';
import { auditService } from '@/lib/services/auditService';
import { CafeSettings, WebsiteSettings, OpeningHourDay } from '@/types/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Store, Globe, Clock, Save, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, role } = useAuth();
  const { success, error } = useToast();

  const [cafeSettings, setCafeSettings] = useState<CafeSettings | null>(null);
  const [webSettings, setWebSettings] = useState<WebsiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'cafe' | 'hours' | 'website'>('cafe');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [cSet, wSet] = await Promise.all([
          settingsService.getCafeSettings(),
          settingsService.getWebsiteSettings(),
        ]);
        setCafeSettings(cSet);
        setWebSettings(wSet);
      } catch (err) {
        error('Error', 'Failed to load settings.');
      }
    }
    loadSettings();
  }, []);

  const handleSaveCafeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeSettings) return;

    try {
      setIsSaving(true);
      await settingsService.updateCafeSettings(cafeSettings);
      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'SETTINGS_UPDATE',
        resourceType: 'settings',
        details: `Updated Cafe Aura business profile and opening hours`,
      });
      success('Settings Saved', 'Cafe information updated successfully.');
    } catch (err: any) {
      error('Error', err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webSettings) return;

    try {
      setIsSaving(true);
      await settingsService.updateWebsiteSettings(webSettings);
      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'SETTINGS_UPDATE',
        resourceType: 'settings',
        details: `Updated website announcement banner and operational toggles`,
      });
      success('Website Settings Saved', 'Website configurations updated.');
    } catch (err: any) {
      error('Error', err.message || 'Failed to save website settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateHour = (index: number, field: keyof OpeningHourDay, value: any) => {
    if (!cafeSettings) return;
    const updated = [...cafeSettings.openingHours];
    updated[index] = { ...updated[index], [field]: value };
    setCafeSettings({ ...cafeSettings, openingHours: updated });
  };

  if (!cafeSettings || !webSettings) {
    return (
      <AdminLayout requiredPermission="settings:view">
        <div className="py-20 text-center text-aura-400">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout requiredPermission="settings:view">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
            Cafe & Website Settings
          </h1>
          <p className="text-xs text-aura-300 mt-1">
            Configure business information, weekly opening schedule, and website banners
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-aura-800/80 gap-6">
          <button
            onClick={() => setActiveTab('cafe')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cafe'
                ? 'border-caramel-500 text-caramel-400'
                : 'border-transparent text-aura-400 hover:text-aura-200'
            }`}
          >
            <Store className="w-4 h-4" />
            Cafe Profile
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'hours'
                ? 'border-caramel-500 text-caramel-400'
                : 'border-transparent text-aura-400 hover:text-aura-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Opening Hours
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'website'
                ? 'border-caramel-500 text-caramel-400'
                : 'border-transparent text-aura-400 hover:text-aura-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Website Controls
          </button>
        </div>

        {/* Tab 1: Cafe Profile */}
        {activeTab === 'cafe' && (
          <form onSubmit={handleSaveCafeSettings} className="space-y-6 max-w-3xl">
            <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-aura-50">General Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cafe Name"
                  value={cafeSettings.cafeName}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, cafeName: e.target.value })}
                  required
                />
                <Input
                  label="Tagline / Slogan"
                  value={cafeSettings.tagline}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, tagline: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Email"
                  type="email"
                  value={cafeSettings.email}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, email: e.target.value })}
                  required
                />
                <Input
                  label="Contact Phone"
                  value={cafeSettings.phone}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, phone: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Physical Address"
                value={cafeSettings.address}
                onChange={(e) => setCafeSettings({ ...cafeSettings, address: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Currency Code"
                  value={cafeSettings.currency}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, currency: e.target.value })}
                />
                <Input
                  label="Currency Symbol"
                  value={cafeSettings.currencySymbol}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, currencySymbol: e.target.value })}
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.1"
                  value={cafeSettings.taxRatePercent}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, taxRatePercent: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="pt-2">
                <ImageUploader
                  value={cafeSettings.logoUrl}
                  onChange={(url) => setCafeSettings({ ...cafeSettings, logoUrl: url })}
                  folder="branding"
                  label="Cafe Logo"
                />
              </div>
            </div>

            <RoleGuard permission="settings:edit">
              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving} icon={<Save className="w-4 h-4" />}>
                  Save Cafe Profile
                </Button>
              </div>
            </RoleGuard>
          </form>
        )}

        {/* Tab 2: Opening Hours */}
        {activeTab === 'hours' && (
          <form onSubmit={handleSaveCafeSettings} className="space-y-6 max-w-3xl">
            <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-aura-50">Weekly Operating Schedule</h3>
              <p className="text-xs text-aura-300">
                Opening hours are shown dynamically across the public website and reservation engine.
              </p>

              <div className="space-y-3 pt-2">
                {cafeSettings.openingHours.map((schedule, idx) => (
                  <div
                    key={schedule.day}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-espresso-950/60 border border-aura-800/60 gap-3"
                  >
                    <span className="text-sm font-semibold text-aura-100 w-32">
                      {schedule.day}
                    </span>

                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={schedule.openTime}
                        onChange={(e) => updateHour(idx, 'openTime', e.target.value)}
                        disabled={schedule.isClosed}
                        className="bg-espresso-900 border border-aura-700/60 rounded-lg px-2 py-1 text-xs text-aura-100 disabled:opacity-40"
                      />
                      <span className="text-xs text-aura-400">to</span>
                      <input
                        type="time"
                        value={schedule.closeTime}
                        onChange={(e) => updateHour(idx, 'closeTime', e.target.value)}
                        disabled={schedule.isClosed}
                        className="bg-espresso-900 border border-aura-700/60 rounded-lg px-2 py-1 text-xs text-aura-100 disabled:opacity-40"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-aura-300">
                      <input
                        type="checkbox"
                        checked={schedule.isClosed}
                        onChange={(e) => updateHour(idx, 'isClosed', e.target.checked)}
                        className="rounded border-aura-700 text-red-500 focus:ring-0"
                      />
                      <span>Closed</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <RoleGuard permission="settings:edit">
              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving} icon={<Save className="w-4 h-4" />}>
                  Save Schedule
                </Button>
              </div>
            </RoleGuard>
          </form>
        )}

        {/* Tab 3: Website Controls */}
        {activeTab === 'website' && (
          <form onSubmit={handleSaveWebsiteSettings} className="space-y-6 max-w-3xl">
            <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-aura-50">Website Header Announcement Banner</h3>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-aura-100 font-semibold">
                  <input
                    type="checkbox"
                    checked={webSettings.bannerEnabled}
                    onChange={(e) => setWebSettings({ ...webSettings, bannerEnabled: e.target.checked })}
                    className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                  />
                  <span>Enable Global Promotional Banner</span>
                </label>
              </div>

              {webSettings.bannerEnabled && (
                <div className="space-y-3 pt-2">
                  <Input
                    label="Banner Announcement Text"
                    value={webSettings.bannerText}
                    onChange={(e) => setWebSettings({ ...webSettings, bannerText: e.target.value })}
                    placeholder="✨ Try our Seasonal Salted Caramel Maple Cortado!"
                  />
                  <Input
                    label="Banner Target Link"
                    value={webSettings.bannerLink || ''}
                    onChange={(e) => setWebSettings({ ...webSettings, bannerLink: e.target.value })}
                    placeholder="#menu"
                  />
                </div>
              )}
            </div>

            <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-aura-50">Operational Toggles</h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-espresso-950/60 border border-aura-800/60 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-aura-100">Accept Online Orders</p>
                    <p className="text-[11px] text-aura-400">Allow customers to place digital pickup & delivery orders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={webSettings.orderOnlineEnabled}
                    onChange={(e) => setWebSettings({ ...webSettings, orderOnlineEnabled: e.target.checked })}
                    className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-espresso-950/60 border border-aura-800/60 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-aura-100">Table Reservation System</p>
                    <p className="text-[11px] text-aura-400">Accept guest table reservations online</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={webSettings.tableReservationEnabled}
                    onChange={(e) => setWebSettings({ ...webSettings, tableReservationEnabled: e.target.checked })}
                    className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                  />
                </label>
              </div>
            </div>

            <RoleGuard permission="settings:edit">
              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving} icon={<Save className="w-4 h-4" />}>
                  Save Website Controls
                </Button>
              </div>
            </RoleGuard>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
