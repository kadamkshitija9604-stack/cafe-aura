export type AuditAction =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET'
  | 'MENU_CREATE'
  | 'MENU_UPDATE'
  | 'MENU_DELETE'
  | 'MENU_STATUS_TOGGLE'
  | 'CATEGORY_CREATE'
  | 'CATEGORY_UPDATE'
  | 'CATEGORY_DELETE'
  | 'STAFF_CREATE'
  | 'STAFF_UPDATE'
  | 'STAFF_DELETE'
  | 'STAFF_STATUS_CHANGE'
  | 'USER_ROLE_CHANGE'
  | 'USER_STATUS_CHANGE'
  | 'SETTINGS_UPDATE';

export type ResourceType = 'auth' | 'menu' | 'category' | 'staff' | 'user' | 'settings' | 'role';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}
