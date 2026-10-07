'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ShoppingBag, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '@/types/notification';
import Link from 'next/link';
import { getAuthHeaders } from '@/lib/apiClient';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_status_changed':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-aura-400 hover:text-aura-50 hover:bg-aura-900/60 transition-colors border border-transparent hover:border-aura-800"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-caramel-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-aura-800 shadow-2xl shadow-aura-900/40 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-aura-800 bg-aura-900/40">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-aura-50">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-caramel-500/10 text-caramel-500 border border-caramel-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-aura-400 hover:text-caramel-500 flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-aura-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-aura-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-aura-400" />
                <p className="text-xs">No notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.deepLink || '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3.5 transition-colors hover:bg-aura-900/50 ${
                    !notif.isRead ? 'bg-amber-50/60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-aura-900/60 border border-aura-800 mt-0.5 shrink-0">
                      {getEventIcon(notif.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-aura-50 truncate">{notif.title}</p>
                      <p className="text-xs text-aura-300 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-aura-400 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-caramel-500 mt-2 shrink-0" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
