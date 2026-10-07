'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  Boxes,
  Search,
  ArrowUpDown,
  AlertTriangle,
  History,
  CheckCircle2,
  RefreshCw,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { InventoryItem, InventoryLedgerEntry, LedgerChangeType } from '@/types/inventory';
import { formatDate } from '@/lib/utils/cn';
import { getAuthHeaders } from '@/lib/apiClient';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [ledger, setLedger] = useState<InventoryLedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'ledger'>('inventory');

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<LedgerChangeType>('restock');
  const [adjustQuantity, setAdjustQuantity] = useState<string>('');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      let url = `/api/inventory?lowStockOnly=${lowStockOnly}`;
      if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/inventory?ledger=true&limit=100', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setLedger(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load ledger:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    } else {
      fetchLedger();
    }
  }, [activeTab, categoryFilter, lowStockOnly]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    const qty = parseFloat(adjustQuantity);
    if (isNaN(qty) || qty === 0) {
      alert('Please enter a valid non-zero quantity');
      return;
    }

    const actualChange = adjustType === 'restock' || adjustType === 'return' ? Math.abs(qty) : -Math.abs(qty);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          inventoryId: adjustItem.id,
          changeType: adjustType,
          quantityChange: actualChange,
          notes: adjustNotes,
        }),
      });

      if (res.ok) {
        showToast(`Stock updated for ${adjustItem.itemName} (${actualChange > 0 ? '+' : ''}${actualChange} ${adjustItem.unit})`);
        setAdjustItem(null);
        setAdjustNotes('');
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Stock adjustment failed');
      }
    } catch (err) {
      console.error('Adjustment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout requiredPermission="inventory:view">
      <div className="space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-espresso-950 border border-caramel-500/60 text-caramel-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-caramel-400" />
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50 flex items-center gap-2.5">
              <Boxes className="w-6 h-6 text-caramel-400" />
              Inventory & Stock Ledger
            </h1>
            <p className="text-xs sm:text-sm text-aura-300 mt-1">
              Track ingredients, packaging, stock thresholds, and transaction audit trails
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-espresso-950 border border-aura-800 p-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-caramel-500 text-espresso-950 shadow-sm font-bold'
                  : 'text-aura-300 hover:text-aura-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Stock Items
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-caramel-500 text-espresso-950 shadow-sm font-bold'
                  : 'text-aura-300 hover:text-aura-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Ledger History
            </button>
          </div>
        </div>

        {activeTab === 'inventory' ? (
          <>
            {/* Filters Bar */}
            <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search item name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['all', 'ingredient', 'packaging', 'beverage_base'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border ${
                      categoryFilter === cat
                        ? 'bg-caramel-500/20 text-caramel-300 border-caramel-500/50 font-bold'
                        : 'bg-espresso-950 text-aura-300 border-aura-800 hover:text-aura-100'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}

                <button
                  onClick={() => setLowStockOnly(!lowStockOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    lowStockOnly
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                      : 'bg-espresso-950 text-aura-300 border-aura-800 hover:text-aura-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Low Stock Only
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-espresso-950/80 text-[11px] font-semibold uppercase tracking-wider text-aura-400 border-b border-aura-800/80">
                    <tr>
                      <th className="py-3.5 px-5">Item Name</th>
                      <th className="py-3.5 px-5">SKU</th>
                      <th className="py-3.5 px-5">Category</th>
                      <th className="py-3.5 px-5">Current Stock</th>
                      <th className="py-3.5 px-5">Threshold</th>
                      <th className="py-3.5 px-5">Cost/Unit</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aura-800/50 text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-aura-300">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-caramel-400" />
                          Loading inventory records...
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-aura-400">
                          No inventory items found.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const isLow = Number(item.currentStock) <= Number(item.minThreshold);
                        return (
                          <tr key={item.id} className="hover:bg-aura-900/20 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="font-semibold text-aura-50 text-sm">{item.itemName}</div>
                              {isLow && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium mt-0.5">
                                  <AlertTriangle className="w-3 h-3" /> Low Stock Warning
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 font-mono text-xs text-aura-300 font-semibold">{item.sku}</td>
                            <td className="py-3.5 px-5 capitalize text-xs text-aura-200 font-medium">
                              {item.category.replace('_', ' ')}
                            </td>
                            <td className="py-3.5 px-5 font-bold text-sm">
                              <span className={isLow ? 'text-rose-400' : 'text-emerald-400'}>
                                {item.currentStock} {item.unit}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-xs text-aura-300 font-medium">
                              {item.minThreshold} {item.unit}
                            </td>
                            <td className="py-3.5 px-5 text-xs text-aura-100 font-mono font-semibold">
                              ₹{Number(item.costPerUnit).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                onClick={() => setAdjustItem(item)}
                                className="px-3 py-1.5 rounded-lg bg-caramel-500/15 hover:bg-caramel-500/25 text-caramel-400 border border-caramel-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                              >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                Adjust Stock
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Ledger Table */
          <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-espresso-950/80 text-[11px] font-semibold uppercase tracking-wider text-aura-400 border-b border-aura-800/80">
                  <tr>
                    <th className="py-3.5 px-5">Timestamp</th>
                    <th className="py-3.5 px-5">Item</th>
                    <th className="py-3.5 px-5">Type</th>
                    <th className="py-3.5 px-5">Change</th>
                    <th className="py-3.5 px-5">Balance</th>
                    <th className="py-3.5 px-5">Notes</th>
                    <th className="py-3.5 px-5">Author</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-800/50 text-xs">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-aura-400">
                        No ledger history recorded yet.
                      </td>
                    </tr>
                  ) : (
                    ledger.map((entry) => {
                      const isPositive = Number(entry.quantityChange) > 0;
                      return (
                        <tr key={entry.id} className="hover:bg-aura-900/20 transition-colors">
                          <td className="py-3.5 px-5 text-aura-300 font-mono text-[11px]">
                            {formatDate(entry.createdAt)}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-aura-100">
                            {entry.itemName || entry.sku}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="capitalize px-2 py-0.5 rounded bg-espresso-950 text-aura-200 border border-aura-800 font-medium text-[11px]">
                              {entry.changeType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-bold">
                            <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {isPositive ? '+' : ''}{entry.quantityChange}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-aura-200 font-mono">
                            {entry.previousStock} → <span className="font-bold text-aura-50">{entry.newStock}</span>
                          </td>
                          <td className="py-3.5 px-5 text-aura-300 italic">
                            {entry.notes || '—'}
                          </td>
                          <td className="py-3.5 px-5 text-aura-300">
                            {entry.createdBy || 'Admin'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {adjustItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleAdjustSubmit}
              className="bg-espresso-900 border border-aura-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-aura-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-aura-50">Stock Adjustment</h3>
                  <p className="text-xs text-aura-300 font-mono mt-0.5">{adjustItem.itemName} ({adjustItem.sku})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="text-aura-400 hover:text-aura-50 text-lg leading-none p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-espresso-950 border border-aura-800 flex items-center justify-between text-xs">
                <span className="text-aura-400 font-medium">Current Stock Level:</span>
                <span className="font-bold text-aura-50 text-sm">
                  {adjustItem.currentStock} {adjustItem.unit}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-200 block uppercase tracking-wider">
                  Adjustment Reason / Type
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as LedgerChangeType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-espresso-950 border border-aura-800 text-aura-100 text-xs focus:outline-none focus:border-caramel-500 cursor-pointer"
                >
                  <option value="restock">Restock (+ Supply Inflow)</option>
                  <option value="sale_usage">Sale Usage (- Consumption)</option>
                  <option value="adjustment">Manual Correction (Count Mismatch)</option>
                  <option value="wastage">Wastage / Spoilage (- Loss)</option>
                  <option value="return">Supplier Return</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-200 block uppercase tracking-wider">
                  Quantity ({adjustItem.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-espresso-950 border border-aura-800 text-aura-50 text-sm focus:outline-none focus:border-caramel-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-200 block uppercase tracking-wider">
                  Audit Note / PO #
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly supplier batch #924"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-espresso-950 border border-aura-800 text-aura-100 text-xs placeholder:text-aura-500 focus:outline-none focus:border-caramel-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 rounded-xl bg-espresso-950 text-aura-300 text-xs font-medium hover:text-aura-50 border border-aura-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-caramel-500 text-espresso-950 text-xs font-bold hover:bg-caramel-400 transition-all shadow-md"
                >
                  {isSubmitting ? 'Recording...' : 'Commit Ledger Entry'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
