import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AdminUser } from '@/types/user';

export async function GET() {
  try {
    const rows = await query<AdminUser>(`
      SELECT 
        id as uid,
        email,
        display_name as "displayName",
        photo_url as "photoURL",
        role,
        status,
        provider_id as "providerId",
        created_at as "createdAt",
        last_login_at as "lastLoginAt"
      FROM users
      ORDER BY created_at ASC
    `);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('API Error /api/users GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.uid || body.id || `user-${Date.now()}`;
    const { email, displayName, photoURL, role = 'admin', status = 'active', providerId = 'password' } = body;

    const rows = await query<AdminUser>(`
      INSERT INTO users (id, email, display_name, photo_url, role, status, provider_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        photo_url = EXCLUDED.photo_url,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        last_login_at = NOW()
      RETURNING 
        id as uid,
        email,
        display_name as "displayName",
        photo_url as "photoURL",
        role,
        status,
        provider_id as "providerId",
        created_at as "createdAt",
        last_login_at as "lastLoginAt"
    `, [id, email, displayName, photoURL || null, role, status, providerId]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/users POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.uid || body.id;
    const { role, status, displayName, photoURL } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const rows = await query<AdminUser>(`
      UPDATE users
      SET 
        role = COALESCE($2, role),
        status = COALESCE($3, status),
        display_name = COALESCE($4, display_name),
        photo_url = COALESCE($5, photo_url),
        last_login_at = NOW()
      WHERE id = $1
      RETURNING 
        id as uid,
        email,
        display_name as "displayName",
        photo_url as "photoURL",
        role,
        status,
        provider_id as "providerId",
        created_at as "createdAt",
        last_login_at as "lastLoginAt"
    `, [id, role, status, displayName, photoURL]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('API Error /api/users PUT:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
