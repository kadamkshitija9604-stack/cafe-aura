export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'online';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string | null;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string | null;
  paymentMethod?: PaymentMethod;
  notes?: string | null;
  items: {
    menuItemId?: string | null;
    itemName: string;
    unitPrice: number;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

// Allowed state transitions for Order Lifecycle state machine
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};
