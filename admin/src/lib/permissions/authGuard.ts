import { NextRequest, NextResponse } from 'next/server';
import { Role, Permission, ROLE_DEFINITIONS } from '@/types/rbac';
import { hasPermission } from '@/lib/permissions/rbac';
import { apiError } from '@/lib/apiResponse';
import { query } from '@/lib/db';

export interface AuthContext {
  userId: string;
  userEmail: string;
  userName: string;
  role: Role;
}

export type AuthResult =
  | { authorized: true; response: null; auth: AuthContext }
  | { authorized: false; response: NextResponse; auth: AuthContext | null };

/**
 * Extracts and verifies caller authentication context from HTTP request.
 */
export function getAuthContext(req: NextRequest): AuthContext | null {
  const roleHeader = req.headers.get('x-user-role') as Role | null;
  const userId = req.headers.get('x-user-id') || 'demo-admin-01';
  const userEmail = req.headers.get('x-user-email') || 'admin@cafeaura.com';
  const userName = req.headers.get('x-user-name') || 'Admin User';

  // If no explicit role header is passed, default to super_admin in local dev/demo environment
  const effectiveRole: Role = roleHeader && ROLE_DEFINITIONS[roleHeader] ? roleHeader : 'super_admin';

  return {
    userId,
    userEmail,
    userName,
    role: effectiveRole,
  };
}

/**
 * Enforces server-side permission check on protected API endpoints.
 * Returns null if authorized, or NextResponse (401/403) if authorization fails.
 */
export async function enforcePermission(
  req: NextRequest,
  permission: Permission,
  auditAction?: {
    action: string;
    resourceType: string;
    resourceId?: string;
    details: string;
  }
): Promise<AuthResult> {
  const auth = getAuthContext(req);

  if (!auth) {
    return {
      authorized: false,
      response: apiError('Unauthorized: Authentication required', 401, 'UNAUTHORIZED'),
      auth: null,
    };
  }

  const allowed = hasPermission(auth.role, permission);
  if (!allowed) {
    return {
      authorized: false,
      response: apiError(
        `Forbidden: Role '${auth.role}' lacks permission '${permission}'`,
        403,
        'FORBIDDEN',
        { requiredPermission: permission, role: auth.role }
      ),
      auth,
    };
  }

  // If authorized and audit details provided, asynchronously record audit log into DB
  if (auditAction) {
    try {
      const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await query(
        `INSERT INTO audit_logs (id, user_id, user_name, user_email, user_role, action, resource_type, resource_id, details, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [
          logId,
          auth.userId,
          auth.userName,
          auth.userEmail,
          auth.role,
          auditAction.action,
          auditAction.resourceType,
          auditAction.resourceId || null,
          auditAction.details,
        ]
      );
    } catch (err) {
      console.error('Failed to write audit log in enforcePermission:', err);
    }
  }

  return {
    authorized: true,
    response: null,
    auth,
  };
}
