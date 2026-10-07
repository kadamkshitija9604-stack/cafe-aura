'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus, VALID_ORDER_TRANSITIONS } from '@/types/order';
import { getAuthHeaders } from '@/lib/apiClient';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-900 border-blue-300', icon: CheckCircle2 },
  processing: { label: 'In Kitchen', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: RefreshCw },
  ready: { label: 'Ready for Pickup', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-stone-200 text-stone-900 border-stone-400', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-900 border-rose-300', icon: XCircle },
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

      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
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
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: getAuthHeaders(),
      });
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
        headers: getAuthHeaders(),
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
    <AdminLayout requiredPermission="orders:view">
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-espresso-950 border border-caramel-500/80 text-caramel-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-sm font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-caramel-400" />
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50 flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-caramel-500" />
              Order Management
            </h1>
            <p className="text-xs text-aura-200 font-medium mt-1">
              Real-time customer orders, lifecycle tracking, and fulfillment operations.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-espresso-900 border border-aura-800 text-aura-50 hover:bg-espresso-800 transition-colors text-xs font-bold w-fit shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-caramel-500' : 'text-caramel-500'}`} />
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedStatus === tab.id
                    ? 'bg-caramel-500 text-white shadow-md shadow-caramel-500/25'
                    : 'bg-espresso-900 text-aura-200 hover:text-aura-50 hover:bg-espresso-800 border border-aura-800/90'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-aura-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-espresso-900 border border-aura-800 text-aura-50 text-xs font-medium placeholder-aura-400 focus:outline-none focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20 transition-all shadow-sm"
            />
          </form>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-espresso-900 border border-aura-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-aura-100">
              <thead className="bg-espresso-950 text-xs font-bold uppercase tracking-wider text-aura-100 border-b border-aura-800/80">
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
              <tbody className="divide-y divide-aura-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-aura-300 font-medium">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-caramel-500" />
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-aura-300 font-medium">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-aura-400" />
                      No orders match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const statusInfo = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={order.id} className="hover:bg-aura-900/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-caramel-600">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-aura-50">{order.customerName}</div>
                          <div className="text-xs text-aura-300 font-medium">{order.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2.5 py-1 rounded-lg text-xs bg-espresso-950 text-aura-100 border border-aura-700/80 font-semibold">
                            {order.orderType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-aura-50 font-mono">
                          ₹{Number(order.finalAmount).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {order.paymentStatus} ({order.paymentMethod})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${statusInfo.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-aura-200 font-medium">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openOrderDetails(order.id)}
                            className="px-3 py-1.5 rounded-lg bg-espresso-950 hover:bg-caramel-500 hover:text-white border border-aura-700 text-aura-50 text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors shadow-sm"
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
          <div className="fixed inset-0 bg-espresso-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-espresso-900 border border-aura-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-aura-800 flex items-center justify-between sticky top-0 bg-espresso-900/95 backdrop-blur z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-aura-50 font-mono">
                      {activeOrder.orderNumber}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_CONFIG[activeOrder.orderStatus]?.color}`}>
                      {STATUS_CONFIG[activeOrder.orderStatus]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-aura-300 font-medium mt-1">
                    Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-2 rounded-xl text-aura-300 hover:text-aura-50 hover:bg-espresso-800 transition-colors font-bold text-base"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Customer Card */}
                <div className="p-4 rounded-2xl bg-espresso-950 border border-aura-800/80 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aura-300">Customer Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-aura-50 font-bold">
                      <span>{activeOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-aura-200 text-xs font-medium">
                      <Phone className="w-3.5 h-3.5 text-caramel-500" />
                      {activeOrder.customerPhone}
                    </div>
                    {activeOrder.customerEmail && (
                      <div className="flex items-center gap-2 text-aura-200 text-xs font-medium">
                        <Mail className="w-3.5 h-3.5 text-caramel-500" />
                        {activeOrder.customerEmail}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-aura-200 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 text-caramel-500" />
                      <span className="capitalize">{activeOrder.orderType.replace('_', ' ')}</span>
                      {activeOrder.deliveryAddress && ` • ${activeOrder.deliveryAddress}`}
                    </div>
                  </div>
                  {activeOrder.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-medium">
                      <span className="font-bold">Customer Note:</span> {activeOrder.notes}
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aura-300">Ordered Items</h3>
                  <div className="divide-y divide-aura-800/60 border border-aura-800/80 rounded-2xl overflow-hidden bg-espresso-950/60">
                    {activeOrder.items?.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-espresso-900 border border-aura-800 text-caramel-600 font-bold text-xs flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <div>
                            <p className="font-bold text-aura-50">{item.itemName}</p>
                            <p className="text-xs text-aura-300 font-medium">₹{Number(item.unitPrice).toFixed(2)} each</p>
                          </div>
                        </div>
                        <span className="font-bold text-aura-50 font-mono">
                          ₹{Number(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="p-4 rounded-2xl bg-espresso-950 border border-aura-800/80 space-y-2 text-sm">
                  <div className="flex justify-between text-aura-200 text-xs font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-aura-50">₹{Number(activeOrder.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-aura-200 text-xs font-medium">
                    <span>Tax (5% GST)</span>
                    <span className="font-mono font-semibold text-aura-50">₹{Number(activeOrder.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-aura-50 font-bold text-base pt-2 border-t border-aura-800">
                    <span>Total Amount</span>
                    <span className="text-caramel-600 font-mono text-lg">₹{Number(activeOrder.finalAmount).toFixed(2)}</span>
                  </div>
                </div>

                {/* State Machine Transition Actions */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aura-300">
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
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                            isCancel
                              ? 'bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300'
                              : 'bg-caramel-500 hover:bg-caramel-600 text-white shadow-caramel-500/25'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          Transition to {next.toUpperCase()}
                        </button>
                      );
                    })}
                    {VALID_ORDER_TRANSITIONS[activeOrder.orderStatus]?.length === 0 && (
                      <p className="text-xs text-aura-300 italic font-medium">
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
    </AdminLayout>
  );
}
