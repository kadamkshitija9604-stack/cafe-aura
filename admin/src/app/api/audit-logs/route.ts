import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AuditLog } from '@/types/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `log-${Date.now()}`;
    const {
      userId,
      userName,
      userEmail,
      userRole,
      action,
      resourceType,
      resourceId,
      details,
    } = body;

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
      userId || 'system',
      userName || 'System User',
      userEmail || 'admin@cafeaura.com',
      userRole || 'super_admin',
      action,
      resourceType,
      resourceId || null,
      details
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/audit-logs POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
