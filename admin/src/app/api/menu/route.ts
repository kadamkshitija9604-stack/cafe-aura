import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MenuItem } from '@/types/menu';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { enforcePermission } from '@/lib/permissions/authGuard';

export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        m.id,
        m.name,
        m.slug,
        m.description,
        m.price::float as price,
        m.discount_price::float as "discountPrice",
        m.category_id as "categoryId",
        c.name as "categoryName",
        m.is_available as "isAvailable",
        m.is_featured as "isFeatured",
        m.prep_time_minutes as "prepTimeMinutes",
        m.allergens,
        m.image_url as "imageUrl",
        m.display_order as "displayOrder",
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM menu_items m
      LEFT JOIN categories c ON c.id = m.category_id
      ORDER BY m.display_order ASC, m.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('API Error /api/menu GET:', error);
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await enforcePermission(req, 'menu:create', {
      action: 'MENU_ITEM_CREATED',
      resourceType: 'menu_item',
      details: 'Created new menu item',
    });
    if (!authResult.authorized) return authResult.response;

    const body = await req.json();
    const id = body.id || `item-${Date.now()}`;
    const {
      name,
      slug,
      description,
      price,
      discountPrice,
      categoryId,
      isAvailable = true,
      isFeatured = false,
      prepTimeMinutes = 5,
      allergens = [],
      imageUrl,
      displayOrder = 0,
    } = body;

    if (!name || price === undefined) {
      return apiError('Name and Price are required', 400);
    }

    const rows = await query<MenuItem>(`
      INSERT INTO menu_items (
        id, name, slug, description, price, discount_price, category_id,
        is_available, is_featured, prep_time_minutes, allergens, image_url, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, name, slug, description, price::float, discount_price::float as "discountPrice",
        category_id as "categoryId", is_available as "isAvailable", is_featured as "isFeatured",
        prep_time_minutes as "prepTimeMinutes", allergens, image_url as "imageUrl",
        display_order as "displayOrder", created_at as "createdAt", updated_at as "updatedAt"
    `, [
      id,
      name,
      slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      price,
      discountPrice || null,
      categoryId || null,
      isAvailable,
      isFeatured,
      prepTimeMinutes,
      allergens,
      imageUrl,
      displayOrder
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/menu POST:', error);
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await enforcePermission(req, 'menu:edit', {
      action: 'MENU_ITEM_UPDATED',
      resourceType: 'menu_item',
      details: 'Updated menu item profile or pricing',
    });
    if (!authResult.authorized) return authResult.response;

    const body = await req.json();
    const {
      id,
      name,
      slug,
      description,
      price,
      discountPrice,
      categoryId,
      isAvailable,
      isFeatured,
      prepTimeMinutes,
      allergens,
      imageUrl,
      displayOrder,
    } = body;

    if (!id) {
      return apiError('Menu Item ID required', 400);
    }

    const rows = await query<MenuItem>(`
      UPDATE menu_items
      SET 
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        discount_price = $6,
        category_id = COALESCE($7, category_id),
        is_available = COALESCE($8, is_available),
        is_featured = COALESCE($9, is_featured),
        prep_time_minutes = COALESCE($10, prep_time_minutes),
        allergens = COALESCE($11, allergens),
        image_url = COALESCE($12, image_url),
        display_order = COALESCE($13, display_order),
        updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id, name, slug, description, price::float, discount_price::float as "discountPrice",
        category_id as "categoryId", is_available as "isAvailable", is_featured as "isFeatured",
        prep_time_minutes as "prepTimeMinutes", allergens, image_url as "imageUrl",
        display_order as "displayOrder", created_at as "createdAt", updated_at as "updatedAt"
    `, [
      id,
      name,
      slug,
      description,
      price,
      discountPrice === undefined ? null : discountPrice,
      categoryId,
      isAvailable,
      isFeatured,
      prepTimeMinutes,
      allergens,
      imageUrl,
      displayOrder
    ]);

    if (rows.length === 0) {
      return apiError('Menu item not found', 404);
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('API Error /api/menu PUT:', error);
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('Menu Item ID required', 400);
    }

    const authResult = await enforcePermission(req, 'menu:delete', {
      action: 'MENU_ITEM_DELETED',
      resourceType: 'menu_item',
      resourceId: id,
      details: `Deleted menu item ${id}`,
    });
    if (!authResult.authorized) return authResult.response;

    await query('DELETE FROM menu_items WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error /api/menu DELETE:', error);
    return apiError(error.message, 500);
  }
}
