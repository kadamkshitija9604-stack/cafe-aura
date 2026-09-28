export type InventoryCategory = 'ingredient' | 'packaging' | 'beverage_base' | 'retail';
export type InventoryUnit = 'kg' | 'litres' | 'units' | 'grams';
export type LedgerChangeType = 'restock' | 'sale_usage' | 'adjustment' | 'wastage' | 'return';

export interface InventoryItem {
  id: string;
  itemName: string;
  sku: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  createdAt?: string;
  updatedAt?: string;
  isLowStock?: boolean;
}

export interface InventoryLedgerEntry {
  id: string;
  inventoryId: string;
  changeType: LedgerChangeType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  itemName?: string;
  sku?: string;
}

export interface CreateInventoryInput {
  itemName: string;
  sku: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
}

export interface StockAdjustmentInput {
  inventoryId: string;
  changeType: LedgerChangeType;
  quantityChange: number;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
  createdBy?: string;
}
