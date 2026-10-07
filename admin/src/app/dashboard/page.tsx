'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { menuService } from '@/lib/services/menuService';
import { staffService } from '@/lib/services/staffService';
import { auditService } from '@/lib/services/auditService';
import { MenuItem, MenuCategory } from '@/types/menu';
import { StaffMember } from '@/types/staff';
import { AuditLog } from '@/types/audit';
import { formatCurrency, formatDate } from '@/lib/utils/cn';
import { getAuthHeaders } from '@/lib/apiClient';
import { StatusBadge, RoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UtensilsCrossed,
  ShoppingBag,
  Boxes,
  Users,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Coffee,
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [orderAnalytics, setOrderAnalytics] = useState<{
    todayRevenue: number;
    activeOrdersCount: number;
    completedTodayCount: number;
    totalOrdersCount: number;
  }>({ todayRevenue: 0, activeOrdersCount: 0, completedTodayCount: 0, totalOrdersCount: 0 });
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [items, cats, staffList, logs] = await Promise.all([
          menuService.getMenuItems(),
          menuService.getCategories(),
          staffService.getStaff(),
          auditService.getLogs(6),
        ]);
        setMenuItems(items);
        setCategories(cats);
        setStaff(staffList);
        setAuditLogs(logs);

        // Fetch live order analytics
        const orderRes = await fetch('/api/orders?analytics=true', {
          headers: getAuthHeaders(),
        });
        if (orderRes.ok) {
          const json = await orderRes.json();
          if (json?.data) setOrderAnalytics(json.data);
        }

        // Fetch low stock count
        const invRes = await fetch('/api/inventory?lowStockOnly=true', {
          headers: getAuthHeaders(),
        });
        if (invRes.ok) {
          const json = await invRes.json();
          if (json?.data) setLowStockCount(json.data.length || 0);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const availableCount = menuItems.filter((i) => i.isAvailable).length;
  const unavailableCount = menuItems.length - availableCount;
  const activeStaffCount = staff.filter((s) => s.status === 'active').length;

  return (
    <AdminLayout requiredPermission="dashboard:view">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-aura-900/80 via-espresso-900 to-aura-950 p-6 sm:p-8 border border-aura-800/80 overflow-hidden shadow-xl">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <Coffee className="w-80 h-80 text-caramel-500" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-caramel-500/15 border border-caramel-500/30 text-caramel-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cafe Aura Enterprise Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-aura-50">
              Welcome back, {user?.displayName || 'Administrator'}
            </h1>
            <p className="text-sm text-aura-300 mt-2 leading-relaxed">
              Real-time monitoring across orders, kitchen fulfillment, inventory stock levels, and team operations.
            </p>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Today's Revenue */}
          <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-aura-400">
                Today&apos;s Revenue
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-display text-emerald-400">
                ₹{Number(orderAnalytics.todayRevenue).toFixed(2)}
              </div>
              <div className="flex items-center gap-2 text-xs mt-2 text-aura-300 font-medium">
                <span className="text-aura-200">{orderAnalytics.completedTodayCount} orders completed today</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Orders */}
          <a
            href="/orders"
            className="bg-espresso-900/80 border border-aura-800/80 hover:border-caramel-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-colors block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-aura-300">
                Active Orders
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-display text-aura-50">
                {orderAnalytics.activeOrdersCount}
              </div>
              <div className="text-xs mt-2 text-amber-600 font-bold">
                In preparation & ready →
              </div>
            </div>
          </a>

          {/* Card 3: Low Stock Alerts */}
          <a
            href="/inventory"
            className="bg-espresso-900/80 border border-aura-800/80 hover:border-rose-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-colors block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-aura-300">
                Low Stock Alerts
              </span>
              <div className={`p-2.5 rounded-xl border ${
                lowStockCount > 0
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 animate-pulse'
                  : 'bg-espresso-950 text-aura-300 border-aura-800'
              }`}>
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-bold font-display ${lowStockCount > 0 ? 'text-rose-400' : 'text-aura-50'}`}>
                {lowStockCount}
              </div>
              <div className="text-xs mt-2 text-aura-400">
                {lowStockCount > 0 ? 'Items below minimum threshold →' : 'All stock levels healthy'}
              </div>
            </div>
          </a>

          {/* Card 4: Menu Items & Staff */}
          <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-aura-400">
                Menu & Team
              </span>
              <div className="p-2.5 rounded-xl bg-caramel-500/15 text-caramel-400 border border-caramel-500/30">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-display text-aura-50">
                {menuItems.length} Dishes • {activeStaffCount} Staff
              </div>
              <div className="flex items-center gap-3 text-xs mt-2 text-aura-300">
                <span className="text-emerald-400">● {availableCount} available</span>
                <span className="text-cyan-400">● {categories.length} categories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-5 shadow-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-aura-400 mb-3">
            Quick Operations
          </h3>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <a href="/orders">
              <Button size="sm" icon={<ShoppingBag className="w-4 h-4" />}>
                View Live Orders
              </Button>
            </a>
            <a href="/inventory">
              <Button size="sm" variant="secondary" icon={<Boxes className="w-4 h-4" />}>
                Manage Stock
              </Button>
            </a>
            <RoleGuard permission="menu:create">
              <a href="/menu">
                <Button size="sm" variant="secondary" icon={<PlusCircle className="w-4 h-4" />}>
                  Add Dish
                </Button>
              </a>
            </RoleGuard>
            <RoleGuard permission="categories:create">
              <a href="/categories">
                <Button size="sm" variant="outline">
                  Categories
                </Button>
              </a>
            </RoleGuard>
            <RoleGuard permission="staff:create">
              <a href="/staff">
                <Button size="sm" variant="outline">
                  Staff Directory
                </Button>
              </a>
            </RoleGuard>
          </div>
        </div>

        {/* Dual Column: Recently Added Items & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Added Items */}
          <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-aura-50">
                  Featured Menu Items
                </h3>
                <a
                  href="/menu"
                  className="text-xs text-caramel-400 hover:text-caramel-300 flex items-center gap-1 font-medium"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-3">
                {menuItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-espresso-950/60 border border-aura-800/60 hover:border-aura-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-aura-900 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-aura-100 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-aura-400">
                          {item.categoryName || 'General'} • {item.prepTimeMinutes} mins
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-caramel-400">
                        ₹{Number(item.discountPrice || item.price).toFixed(2)}
                      </p>
                      <StatusBadge status={item.isAvailable ? 'available' : 'unavailable'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed from Audit Log */}
          <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-aura-50">
                  Recent Administrative Actions
                </h3>
                <a
                  href="/audit-logs"
                  className="text-xs text-caramel-400 hover:text-caramel-300 flex items-center gap-1 font-medium"
                >
                  Audit Trail <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-espresso-950/60 border border-aura-800/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-aura-200">
                        {log.userName}
                      </span>
                      <span className="text-[10px] text-aura-400">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-aura-300 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
