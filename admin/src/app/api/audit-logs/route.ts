import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AuditLog } from '@/types/audit';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { enforcePermission, getAuthContext } from '@/lib/permissions/authGuard';

export async function GET(req: NextRequest) {
  try {
    const authResult = await enforcePermission(req, 'audit:view');
    if (!authResult.authorized) return authResult.response;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const rows = await query<AuditLog>(`
      SELECT 
        id,
        user_id as "userId",
        user_name as "userName",
        user_email as "userEmail",
        user_role as "userRole",
        action,
        resource_type as "resourceType",
        resource_id as "resourceId",
        details,
        timestamp
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('API Error /api/audit-logs GET:', error);
    return apiError('Failed to fetch audit logs', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized: Authentication required to log actions', 401);
    }

    const body = await req.json();
    const id = body.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const { action, resourceType, resourceId, details } = body;

    if (!action || !resourceType) {
      return apiError('Action and resourceType are required', 400);
    }

    const rows = await query<AuditLog>(`
      INSERT INTO audit_logs (
        id, user_id, user_name, user_email, user_role,
        action, resource_type, resource_id, details, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING 
        id,
        user_id as "userId",
        user_name as "userName",
        user_email as "userEmail",
        user_role as "userRole",
        action,
        resource_type as "resourceType",
        resource_id as "resourceId",
        details,
        timestamp
    `, [
      id,
      auth.userId,
      auth.userName,
      auth.userEmail,
      auth.role,
      action,
      resourceType,
      resourceId || null,
      details || ''
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/audit-logs POST:', error);
    return apiError('Failed to record audit log', 500);
  }
}
