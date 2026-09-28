export type NotificationEventType =
  | 'order_created'
  | 'order_status_changed'
  | 'low_stock'
  | 'user_action'
  | 'system';

export interface NotificationItem {
  id: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  recipientRole: string;
  isRead: boolean;
  deepLink?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateNotificationInput {
  eventType: NotificationEventType;
  title: string;
  message: string;
  recipientRole?: string;
  deepLink?: string;
  metadata?: Record<string, any>;
}
