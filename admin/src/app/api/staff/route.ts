import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { StaffMember } from '@/types/staff';

export async function GET() {
  try {
    const rows = await query<StaffMember>(`
      SELECT 
        id,
        full_name as "fullName",
        email,
        role,
        phone,
        status,
        joined_date as "joinedDate",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM staff
      ORDER BY created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('API Error /api/staff GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `staff-${Date.now()}`;
    const { fullName, email, role = 'Barista', phone = '', status = 'active', joinedDate } = body;

    const rows = await query<StaffMember>(`
      INSERT INTO staff (id, full_name, email, role, phone, status, joined_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        full_name as "fullName",
        email,
        role,
        phone,
        status,
        joined_date as "joinedDate",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [id, fullName, email, role, phone, status, joinedDate || new Date().toISOString().split('T')[0]]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/staff POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, fullName, email, role, phone, status, joinedDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });
    }

    const rows = await query<StaffMember>(`
      UPDATE staff
      SET 
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        role = COALESCE($4, role),
        phone = COALESCE($5, phone),
        status = COALESCE($6, status),
        joined_date = COALESCE($7, joined_date),
        updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id,
        full_name as "fullName",
        email,
        role,
        phone,
        status,
        joined_date as "joinedDate",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [id, fullName, email, role, phone, status, joinedDate]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('API Error /api/staff PUT:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });
    }

    await query('DELETE FROM staff WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error /api/staff DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
