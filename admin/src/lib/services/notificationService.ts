import { query } from '@/lib/db';
import { NotificationItem, CreateNotificationInput } from '@/types/notification';

/**
 * Creates and stores a notification event in the database.
 */
export async function createNotification(input: CreateNotificationInput): Promise<NotificationItem> {
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const { eventType, title, message, recipientRole = 'all', deepLink = '/dashboard', metadata = {} } = input;

  const rows = await query<NotificationItem>(
    `INSERT INTO notifications (id, event_type, title, message, recipient_role, is_read, deep_link, metadata)
     VALUES ($1, $2, $3, $4, $5, FALSE, $6, $7)
     RETURNING 
       id, 
       event_type as "eventType", 
       title, 
       message, 
       recipient_role as "recipientRole", 
       is_read as "isRead", 
       deep_link as "deepLink", 
       metadata, 
       created_at as "createdAt"`,
    [id, eventType, title, message, recipientRole, deepLink, JSON.stringify(metadata)]
  );

  return rows[0];
}

/**
 * Retrieves notifications for a given role (or 'all') with unread count.
 */
export async function getNotifications(role = 'all', limit = 20): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const rows = await query<NotificationItem>(
    `SELECT 
       id, 
       event_type as "eventType", 
       title, 
       message, 
       recipient_role as "recipientRole", 
       is_read as "isRead", 
       deep_link as "deepLink", 
       metadata, 
       created_at as "createdAt"
     FROM notifications
     WHERE recipient_role = 'all' OR recipient_role = $1 OR $1 = 'super_admin' OR $1 = 'admin'
     ORDER BY created_at DESC
     LIMIT $2`,
    [role, limit]
  );

  const countRes = await query<{ count: number }>(
    `SELECT COUNT(*)::int as count 
     FROM notifications 
     WHERE is_read = FALSE AND (recipient_role = 'all' OR recipient_role = $1 OR $1 = 'super_admin' OR $1 = 'admin')`,
    [role]
  );

  return {
    notifications: rows,
    unreadCount: countRes[0]?.count || 0,
  };
}

/**
 * Marks a specific notification or all notifications as read.
 */
export async function markNotificationsAsRead(id?: string): Promise<{ success: boolean; affected: number }> {
  if (id) {
    await query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
  } else {
    await query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
  }
  return { success: true, affected: 1 };
}
