import { z } from 'zod';

export const createInventorySchema = z.object({
  itemName: z.string().min(2, 'Item name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').toUpperCase(),
  category: z.enum(['ingredient', 'packaging', 'beverage_base', 'retail']),
  unit: z.enum(['kg', 'litres', 'units', 'grams']),
  currentStock: z.number().nonnegative('Stock cannot be negative'),
  minThreshold: z.number().nonnegative('Threshold cannot be negative'),
  costPerUnit: z.number().nonnegative('Cost per unit cannot be negative'),
});

export const stockAdjustmentSchema = z.object({
  inventoryId: z.string().min(1, 'Inventory ID is required'),
  changeType: z.enum(['restock', 'sale_usage', 'adjustment', 'wastage', 'return']),
  quantityChange: z.number().refine((v) => v !== 0, 'Quantity change cannot be zero'),
  notes: z.string().max(255).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});
