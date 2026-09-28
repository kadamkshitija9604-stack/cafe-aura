import { query, getDbPool } from '@/lib/db';
import {
  InventoryItem,
  InventoryLedgerEntry,
  CreateInventoryInput,
  StockAdjustmentInput,
} from '@/types/inventory';
import { createNotification } from '@/lib/services/notificationService';

export async function getInventoryItems(options?: {
  category?: string;
  search?: string;
  lowStockOnly?: boolean;
}): Promise<InventoryItem[]> {
  const { category, search, lowStockOnly } = options || {};
  let whereClauses: string[] = [];
  let params: any[] = [];
  let paramIdx = 1;

  if (category && category !== 'all') {
    whereClauses.push(`category = $${paramIdx++}`);
    params.push(category);
  }

  if (search) {
    whereClauses.push(`(item_name ILIKE $${paramIdx} OR sku ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }

  if (lowStockOnly) {
    whereClauses.push(`current_stock <= min_threshold`);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const rows = await query<any>(`
    SELECT 
      id,
      item_name as "itemName",
      sku,
      category,
      unit,
      current_stock::float as "currentStock",
      min_threshold::float as "minThreshold",
      cost_per_unit::float as "costPerUnit",
      (current_stock <= min_threshold) as "isLowStock",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM inventory
    ${whereStr}
    ORDER BY (current_stock <= min_threshold) DESC, item_name ASC
  `, params);

  return rows;
}

export async function createInventoryItem(input: CreateInventoryInput): Promise<InventoryItem> {
  const id = `inv-${Date.now()}`;
  const { itemName, sku, category, unit, currentStock, minThreshold, costPerUnit } = input;

  const rows = await query<any>(`
    INSERT INTO inventory (id, item_name, sku, category, unit, current_stock, min_threshold, cost_per_unit)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      id,
      item_name as "itemName",
      sku,
      category,
      unit,
      current_stock::float as "currentStock",
      min_threshold::float as "minThreshold",
      cost_per_unit::float as "costPerUnit",
      (current_stock <= min_threshold) as "isLowStock",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [id, itemName, sku.toUpperCase(), category, unit, currentStock, minThreshold, costPerUnit]);

  // Initial stock ledger entry
  if (currentStock > 0) {
    const ledgerId = `led-${Date.now()}`;
    await query(`
      INSERT INTO inventory_ledger (id, inventory_id, change_type, quantity_change, previous_stock, new_stock, notes)
      VALUES ($1, $2, 'restock', $3, 0, $3, 'Initial inventory setup')
    `, [ledgerId, id, currentStock]);
  }

  return rows[0];
}

export async function adjustStock(input: StockAdjustmentInput): Promise<{ item: InventoryItem; ledger: InventoryLedgerEntry }> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch current item with row lock
    const currentRes = await client.query(
      'SELECT id, item_name, sku, current_stock, min_threshold, unit FROM inventory WHERE id = $1 FOR UPDATE',
      [input.inventoryId]
    );

    if (currentRes.rows.length === 0) {
      throw new Error(`Inventory item '${input.inventoryId}' not found`);
    }

    const currentItem = currentRes.rows[0];
    const prevStock = parseFloat(currentItem.current_stock);
    const newStock = Math.max(0, prevStock + input.quantityChange);

    // 2. Update stock
    const updateRes = await client.query(`
      UPDATE inventory
      SET current_stock = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id,
        item_name as "itemName",
        sku,
        category,
        unit,
        current_stock::float as "currentStock",
        min_threshold::float as "minThreshold",
        cost_per_unit::float as "costPerUnit",
        (current_stock <= min_threshold) as "isLowStock",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [newStock, input.inventoryId]);

    // 3. Write immutable ledger entry
    const ledgerId = `led-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const ledgerRes = await client.query(`
      INSERT INTO inventory_ledger (
        id, inventory_id, change_type, quantity_change, previous_stock,
        new_stock, reference_type, reference_id, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id,
        inventory_id as "inventoryId",
        change_type as "changeType",
        quantity_change::float as "quantityChange",
        previous_stock::float as "previousStock",
        new_stock::float as "newStock",
        reference_type as "referenceType",
        reference_id as "referenceId",
        notes,
        created_by as "createdBy",
        created_at as "createdAt"
    `, [
      ledgerId,
      input.inventoryId,
      input.changeType,
      input.quantityChange,
      prevStock,
      newStock,
      input.referenceType || 'manual_adjustment',
      input.referenceId || null,
      input.notes || '',
      input.createdBy || 'Admin'
    ]);

    await client.query('COMMIT');

    // 4. Trigger low stock alert if threshold crossed
    const threshold = parseFloat(currentItem.min_threshold);
    if (newStock <= threshold && prevStock > threshold) {
      createNotification({
        eventType: 'low_stock',
        title: `Low Stock Alert: ${currentItem.item_name}`,
        message: `Current stock has reached ${newStock} ${currentItem.unit} (threshold: ${threshold} ${currentItem.unit}).`,
        recipientRole: 'manager',
        deepLink: '/inventory',
        metadata: { inventoryId: input.inventoryId, sku: currentItem.sku, currentStock: newStock, threshold }
      }).catch(err => console.error('Notification dispatch error:', err));
    }

    return {
      item: updateRes.rows[0],
      ledger: ledgerRes.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getInventoryLedger(inventoryId?: string, limit = 50): Promise<InventoryLedgerEntry[]> {
  const whereClause = inventoryId ? 'WHERE l.inventory_id = $1' : '';
  const params = inventoryId ? [inventoryId, limit] : [limit];
  const limitParam = inventoryId ? '$2' : '$1';

  const rows = await query<any>(`
    SELECT 
      l.id,
      l.inventory_id as "inventoryId",
      l.change_type as "changeType",
      l.quantity_change::float as "quantityChange",
      l.previous_stock::float as "previousStock",
      l.new_stock::float as "newStock",
      l.reference_type as "referenceType",
      l.reference_id as "referenceId",
      l.notes,
      l.created_by as "createdBy",
      l.created_at as "createdAt",
      i.item_name as "itemName",
      i.sku
    FROM inventory_ledger l
    LEFT JOIN inventory i ON i.id = l.inventory_id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT ${limitParam}
  `, params);

  return rows;
}
