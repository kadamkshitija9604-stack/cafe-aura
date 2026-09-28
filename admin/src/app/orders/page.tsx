'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  Mail,
  Receipt,
  ArrowRight,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Order, OrderStatus, VALID_ORDER_TRANSITIONS } from '@/types/order';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: RefreshCw },
  ready: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/orders?limit=100';
      if (selectedStatus !== 'all') url += `&status=${selectedStatus}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const json = await res.json();
        setActiveOrder(json.data);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const handleStatusTransition = async (orderId: string, nextStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        const json = await res.json();
        showToast(`Order #${json.data.orderNumber} transitioned to ${nextStatus.toUpperCase()}`);
        setActiveOrder(json.data);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Status transition failed');
      }
    } catch (err) {
      console.error('Transition error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'In Kitchen' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 border border-amber-500/40 text-amber-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            Order Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time customer orders, lifecycle tracking, and fulfillment operations.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-sm font-medium w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Live
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedStatus === tab.id
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950/60 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-4 px-4">Order Number</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Placed At</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-100">{order.customerName}</div>
                        <div className="text-xs text-zinc-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2.5 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                          {order.orderType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-100">
                        ₹{Number(order.finalAmount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {order.paymentStatus} ({order.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openOrderDetails(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
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

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-zinc-100 font-mono">
                    {activeOrder.orderNumber}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[activeOrder.orderStatus]?.color}`}>
                    {STATUS_CONFIG[activeOrder.orderStatus]?.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Card */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <span className="font-semibold">{activeOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    {activeOrder.customerPhone}
                  </div>
                  {activeOrder.customerEmail && (
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      {activeOrder.customerEmail}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="capitalize">{activeOrder.orderType.replace('_', ' ')}</span>
                    {activeOrder.deliveryAddress && ` • ${activeOrder.deliveryAddress}`}
                  </div>
                </div>
                {activeOrder.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300">
                    <span className="font-bold">Customer Note:</span> {activeOrder.notes}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ordered Items</h3>
                <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-950/40">
                  {activeOrder.items?.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-zinc-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="font-medium text-zinc-200">{item.itemName}</p>
                          <p className="text-xs text-zinc-500">₹{Number(item.unitPrice).toFixed(2)} each</p>
                        </div>
                      </div>
                      <span className="font-semibold text-zinc-100">
                        ₹{Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>Subtotal</span>
                  <span>₹{Number(activeOrder.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>Tax (5% GST)</span>
                  <span>₹{Number(activeOrder.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-100 font-bold text-base pt-2 border-t border-zinc-800">
                  <span>Total Amount</span>
                  <span className="text-amber-400 font-mono">₹{Number(activeOrder.finalAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* State Machine Transition Actions */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Lifecycle Status Transitions
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {VALID_ORDER_TRANSITIONS[activeOrder.orderStatus]?.map((next) => {
                    const isCancel = next === 'cancelled';
                    return (
                      <button
                        key={next}
                        disabled={actionLoading}
                        onClick={() => handleStatusTransition(activeOrder.id, next)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                          isCancel
                            ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:brightness-110 shadow-lg shadow-amber-500/20'
                        }`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Transition to {next.toUpperCase()}
                      </button>
                    );
                  })}
                  {VALID_ORDER_TRANSITIONS[activeOrder.orderStatus]?.length === 0 && (
                    <p className="text-xs text-zinc-500 italic">
                      This order is in a terminal state ({activeOrder.orderStatus}). No further transitions allowed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
