'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  History,
  CheckCircle2,
  RefreshCw,
  Package,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { InventoryItem, InventoryLedgerEntry, LedgerChangeType } from '@/types/inventory';

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
  const [adjustQuantity, setAdjustQuantity] = useState<string>('10');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      let url = `/api/inventory?lowStockOnly=${lowStockOnly}`;
      if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
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
      const res = await fetch('/api/inventory?ledger=true&limit=100');
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

    // If wastage or sale, quantity change is negative
    const actualChange = adjustType === 'restock' || adjustType === 'return' ? Math.abs(qty) : -Math.abs(qty);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: adjustItem.id,
          changeType: adjustType,
          quantityChange: actualChange,
          notes: adjustNotes,
        }),
      });

      if (res.ok) {
        const json = await res.json();
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 border border-amber-500/40 text-amber-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-amber-400" />
            Inventory & Stock Ledger
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track ingredients, packaging, stock thresholds, and transaction audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 inline mr-1.5" />
            Stock Items
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <History className="w-3.5 h-3.5 inline mr-1.5" />
            Ledger History
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['all', 'ingredient', 'packaging', 'beverage_base'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}

              <button
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  lowStockOnly
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Low Stock Only
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search item or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/60 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-4 px-4">Item Name</th>
                    <th className="py-4 px-4">SKU</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Current Stock</th>
                    <th className="py-4 px-4">Threshold</th>
                    <th className="py-4 px-4">Cost/Unit</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                        Loading inventory...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        No inventory items found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isLow = Number(item.currentStock) <= Number(item.minThreshold);
                      return (
                        <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-100">{item.itemName}</div>
                            {isLow && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">{item.sku}</td>
                          <td className="py-3.5 px-4 capitalize text-xs text-zinc-300">
                            {item.category.replace('_', ' ')}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-zinc-100">
                            <span className={isLow ? 'text-rose-400' : 'text-emerald-400'}>
                              {item.currentStock} {item.unit}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-400">
                            {item.minThreshold} {item.unit}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-300">
                            ₹{Number(item.costPerUnit).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setAdjustItem(item)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
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
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-4">Timestamp</th>
                  <th className="py-4 px-4">Item</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Change</th>
                  <th className="py-4 px-4">Balance</th>
                  <th className="py-4 px-4">Notes</th>
                  <th className="py-4 px-4">Author</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {ledger.map((entry) => {
                  const isPositive = Number(entry.quantityChange) > 0;
                  return (
                    <tr key={entry.id} className="hover:bg-zinc-800/40 transition-colors text-xs">
                      <td className="py-3.5 px-4 text-zinc-400 font-mono">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-200">
                        {entry.itemName || entry.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50 font-medium">
                          {entry.changeType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPositive ? '+' : ''}{entry.quantityChange}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 font-mono">
                        {entry.previousStock} → <span className="font-bold text-zinc-100">{entry.newStock}</span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 italic">
                        {entry.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        {entry.createdBy || 'Admin'}
                      </td>
                    </tr>
                  );
                })}
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
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Stock Adjustment</h3>
                <p className="text-xs text-zinc-400">{adjustItem.itemName} ({adjustItem.sku})</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Current Stock:</span>
              <span className="font-bold text-zinc-100 text-sm">
                {adjustItem.currentStock} {adjustItem.unit}
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">Adjustment Reason / Type</label>
              <select
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as LedgerChangeType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="restock">Restock (+ Supply Inflow)</option>
                <option value="sale_usage">Sale Usage (- Consumption)</option>
                <option value="adjustment">Manual Correction (Count Mismatch)</option>
                <option value="wastage">Wastage / Spoilage (- Loss)</option>
                <option value="return">Supplier Return</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">
                Quantity ({adjustItem.unit})
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">Audit Note / PO #</label>
              <input
                type="text"
                placeholder="e.g., Weekly supplier batch #924"
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? 'Recording...' : 'Commit Ledger Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
