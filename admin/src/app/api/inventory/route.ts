import { NextRequest } from 'next/server';
import {
  getInventoryItems,
  createInventoryItem,
  adjustStock,
  getInventoryLedger,
} from '@/lib/services/inventoryService';
import {
  createInventorySchema,
  stockAdjustmentSchema,
} from '@/lib/validations/inventory.schema';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { enforcePermission } from '@/lib/permissions/authGuard';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isLedger = searchParams.get('ledger') === 'true';

    if (isLedger) {
      const inventoryId = searchParams.get('inventoryId') || undefined;
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const ledger = await getInventoryLedger(inventoryId, limit);
      return apiSuccess(ledger);
    }

    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';

    const items = await getInventoryItems({ category, search, lowStockOnly });
    return apiSuccess(items);
  } catch (error: any) {
    console.error('API Error /api/inventory GET:', error);
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. RBAC Guard: 'inventory:edit'
    const authResult = await enforcePermission(req, 'inventory:edit', {
      action: 'INVENTORY_ITEM_CREATED',
      resourceType: 'inventory',
      details: 'Created new inventory catalog item',
    });
    if (!authResult.authorized) return authResult.response;

    const body = await req.json();
    const parsed = createInventorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Validation failed for inventory item', 400, 'VALIDATION_ERROR', parsed.error.flatten().fieldErrors);
    }

    const item = await createInventoryItem(parsed.data);
    return apiSuccess(item, 201);
  } catch (error: any) {
    console.error('API Error /api/inventory POST:', error);
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    // 1. RBAC Guard: 'inventory:edit'
    const authResult = await enforcePermission(req, 'inventory:edit', {
      action: 'INVENTORY_STOCK_ADJUSTED',
      resourceType: 'inventory',
      details: 'Adjusted inventory stock level and created ledger entry',
    });
    if (!authResult.authorized) return authResult.response;

    const body = await req.json();

    // Check if this is a stock adjustment or item profile edit
    if (body.quantityChange !== undefined) {
      const parsed = stockAdjustmentSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('Invalid stock adjustment payload', 400, 'VALIDATION_ERROR', parsed.error.flatten().fieldErrors);
      }

      const result = await adjustStock({
        ...parsed.data,
        createdBy: authResult.auth?.userName || 'Admin',
      });
      return apiSuccess(result);
    } else {
      // General item edit
      const { id, itemName, sku, category, unit, minThreshold, costPerUnit } = body;
      if (!id) return apiError('Inventory ID required', 400);

      const rows = await query<any>(`
        UPDATE inventory
        SET 
          item_name = COALESCE($2, item_name),
          sku = COALESCE($3, sku),
          category = COALESCE($4, category),
          unit = COALESCE($5, unit),
          min_threshold = COALESCE($6, min_threshold),
          cost_per_unit = COALESCE($7, cost_per_unit),
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id, item_name as "itemName", sku, category, unit,
          current_stock::float as "currentStock", min_threshold::float as "minThreshold",
          cost_per_unit::float as "costPerUnit", (current_stock <= min_threshold) as "isLowStock",
          created_at as "createdAt", updated_at as "updatedAt"
      `, [id, itemName, sku, category, unit, minThreshold, costPerUnit]);

      if (rows.length === 0) return apiError('Inventory item not found', 404);
      return apiSuccess(rows[0]);
    }
  } catch (error: any) {
    console.error('API Error /api/inventory PUT:', error);
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Inventory ID required', 400);

    const authResult = await enforcePermission(req, 'inventory:delete', {
      action: 'INVENTORY_ITEM_DELETED',
      resourceType: 'inventory',
      resourceId: id,
      details: `Deleted inventory item ${id}`,
    });
    if (!authResult.authorized) return authResult.response;

    await query('DELETE FROM inventory WHERE id = $1', [id]);
    return apiSuccess({ deleted: true });
  } catch (error: any) {
    console.error('API Error /api/inventory DELETE:', error);
    return apiError(error.message, 500);
  }
}
