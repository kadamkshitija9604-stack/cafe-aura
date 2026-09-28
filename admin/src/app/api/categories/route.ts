import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MenuCategory } from '@/types/menu';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { enforcePermission } from '@/lib/permissions/authGuard';

export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.display_order as "displayOrder",
        c.is_active as "isActive",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        COUNT(m.id)::int as "itemCount"
      FROM categories c
      LEFT JOIN menu_items m ON m.category_id = c.id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('API Error /api/categories GET:', error);
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await enforcePermission(req, 'categories:create', {
      action: 'CATEGORY_CREATED',
      resourceType: 'category',
      details: 'Created new menu category',
    });
    if (!authResult.authorized) return authResult.response;

    const body = await req.json();
    const id = body.id || `cat-${Date.now()}`;
    const { name, slug, description, displayOrder = 0, isActive = true } = body;

    if (!name) return apiError('Category name is required', 400);

    const rows = await query<MenuCategory>(`
      INSERT INTO categories (id, name, slug, description, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        name,
        slug,
        description,
        display_order as "displayOrder",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [id, name, slug || name.toLowerCase().replace(/\s+/g, '-'), description, displayOrder, isActive]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/categories POST:', error);
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await enforcePermission(req, 'categories:edit', {
      action: 'CATEGORY_UPDATED',
      resourceType: 'category',
      details: 'Updated menu category details',
    });
    if (!authResult.authorized) return authResult.response;

    const body = await req.json();
    const { id, name, slug, description, displayOrder, isActive } = body;

    if (!id) {
      return apiError('Category ID required', 400);
    }

    const rows = await query<MenuCategory>(`
      UPDATE categories
      SET 
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        display_order = COALESCE($5, display_order),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id,
        name,
        slug,
        description,
        display_order as "displayOrder",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [id, name, slug, description, displayOrder, isActive]);

    if (rows.length === 0) {
      return apiError('Category not found', 404);
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('API Error /api/categories PUT:', error);
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('Category ID required', 400);
    }

    const authResult = await enforcePermission(req, 'categories:delete', {
      action: 'CATEGORY_DELETED',
      resourceType: 'category',
      resourceId: id,
      details: `Deleted menu category ${id}`,
    });
    if (!authResult.authorized) return authResult.response;

    // Check if items are using this category
    const countRes = await query('SELECT COUNT(*)::int as count FROM menu_items WHERE category_id = $1', [id]);
    if (countRes[0]?.count > 0) {
      return apiError(`Cannot delete category: ${countRes[0].count} menu item(s) are assigned to it.`, 400);
    }

    await query('DELETE FROM categories WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error /api/categories DELETE:', error);
    return apiError(error.message, 500);
  }
}
