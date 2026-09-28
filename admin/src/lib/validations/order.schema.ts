import { z } from 'zod';

export const orderItemSchema = z.object({
  menuItemId: z.string().optional().nullable(),
  itemName: z.string().min(1, 'Item name is required'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  customerPhone: z.string().min(7, 'Phone number must be at least 7 digits'),
  orderType: z.enum(['dine_in', 'takeaway', 'delivery']),
  deliveryAddress: z.string().optional().nullable(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'online']).default('cash'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled']),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
  notes: z.string().max(500).optional(),
});
