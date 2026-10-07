import { query, getDbPool } from '@/lib/db';
import {
  Order,
  OrderItem,
  CreateOrderInput,
  OrderStatus,
  PaymentStatus,
  VALID_ORDER_TRANSITIONS,
} from '@/types/order';
import { createNotification } from '@/lib/services/notificationService';

/**
 * Generates an atomic sequential Order Number: AUR-YYYY-XXXX
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const countRes = await query<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [year]
  );
  const nextSeq = (countRes[0]?.count || 0) + 1;
  return `AUR-${year}-${String(nextSeq).padStart(4, '0')}`;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = await generateOrderNumber();

    // 1. Calculate and verify item pricing server-side from authoritative DB records
    let calculatedTotal = 0;
    const verifiedItems: {
      menuItemId: string | null;
      itemName: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of input.items) {
      let price = item.unitPrice;
      let matchedName = item.itemName.replace(/<[^>]*>?/gm, '').trim(); // Strip HTML tags
      let menuItemId: string | null = item.menuItemId || null;

      // Query database for authoritative price
      let itemRes;
      if (menuItemId) {
        itemRes = await client.query(
          'SELECT id, price, discount_price, name, is_available FROM menu_items WHERE id = $1',
          [menuItemId]
        );
      } else {
        itemRes = await client.query(
          'SELECT id, price, discount_price, name, is_available FROM menu_items WHERE LOWER(name) = LOWER($1)',
          [matchedName]
        );
      }

      if (itemRes && itemRes.rows.length > 0) {
        const row = itemRes.rows[0];
        if (!row.is_available) {
          throw new Error(`Item '${row.name}' is currently unavailable`);
        }
        price = parseFloat(row.discount_price || row.price);
        matchedName = row.name;
        menuItemId = row.id;
      } else if (price <= 0) {
        throw new Error(`Invalid price for item '${matchedName}'`);
      }

      const qty = Math.max(1, Math.min(50, Math.floor(item.quantity))); // Bound quantity between 1 and 50
      const subtotal = Math.round(price * qty * 100) / 100;
      calculatedTotal += subtotal;

      verifiedItems.push({
        menuItemId,
        itemName: matchedName,
        unitPrice: price,
        quantity: qty,
        subtotal,
      });
    }

    const taxAmount = Math.round(calculatedTotal * 0.05 * 100) / 100; // 5% GST/Tax
    const deliveryFee = input.orderType === 'delivery' ? 40.0 : 0.0;
    const finalAmount = Math.round((calculatedTotal + taxAmount + deliveryFee) * 100) / 100;

    // Sanitize string inputs
    const cleanCustomerName = input.customerName.replace(/<[^>]*>?/gm, '').trim();
    const cleanDeliveryAddress = input.deliveryAddress ? input.deliveryAddress.replace(/<[^>]*>?/gm, '').trim() : null;
    const cleanNotes = input.notes ? input.notes.replace(/<[^>]*>?/gm, '').trim() : null;

    // 2. Insert Order record
    const orderRes = await client.query(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        order_type, delivery_address, total_amount, discount_amount, tax_amount,
        final_amount, payment_status, payment_method, order_status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0.00, $9, $10, $11, $12, 'pending', $13)
      RETURNING 
        id, order_number as "orderNumber", customer_name as "customerName",
        customer_email as "customerEmail", customer_phone as "customerPhone",
        order_type as "orderType", delivery_address as "deliveryAddress",
        total_amount::float as "totalAmount", discount_amount::float as "discountAmount",
        tax_amount::float as "taxAmount", final_amount::float as "finalAmount",
        payment_status as "paymentStatus", payment_method as "paymentMethod",
        order_status as "orderStatus", notes, created_at as "createdAt", updated_at as "updatedAt"
    `, [
      orderId,
      orderNumber,
      cleanCustomerName,
      input.customerEmail ? input.customerEmail.trim() : null,
      input.customerPhone.trim(),
      input.orderType,
      cleanDeliveryAddress,
      calculatedTotal,
      taxAmount,
      finalAmount,
      input.paymentMethod === 'cash' ? 'pending' : 'paid',
      input.paymentMethod || 'cash',
      cleanNotes,
    ]);

    // 3. Insert Order Items
    const insertedItems: OrderItem[] = [];
    for (const it of verifiedItems) {
      const itemId = `item-ord-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const itemInsert = await client.query(`
        INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id, order_id as "orderId", menu_item_id as "menuItemId",
          item_name as "itemName", unit_price::float as "unitPrice",
          quantity, subtotal::float as subtotal
      `, [itemId, orderId, it.menuItemId, it.itemName, it.unitPrice, it.quantity, it.subtotal]);

      insertedItems.push(itemInsert.rows[0]);
    }

    await client.query('COMMIT');

    const createdOrder: Order = {
      ...orderRes.rows[0],
      items: insertedItems,
    };

    // 4. Dispatch notification
    createNotification({
      eventType: 'order_created',
      title: `New Order #${orderNumber}`,
      message: `${input.customerName} placed a ${input.orderType.replace('_', ' ')} order for ₹${finalAmount.toFixed(2)}.`,
      recipientRole: 'all',
      deepLink: `/orders?id=${orderId}`,
      metadata: { orderId, orderNumber, finalAmount, customerName: input.customerName },
    }).catch((err) => console.error('Notification error on order creation:', err));

    return createdOrder;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrders(options?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: Order[]; totalCount: number }> {
  const { status, search, limit = 50, offset = 0 } = options || {};

  let whereClauses: string[] = [];
  let params: any[] = [];
  let paramIdx = 1;

  if (status && status !== 'all') {
    whereClauses.push(`order_status = $${paramIdx++}`);
    params.push(status);
  }

  if (search) {
    whereClauses.push(`(order_number ILIKE $${paramIdx} OR customer_name ILIKE $${paramIdx} OR customer_phone ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRes = await query<{ count: number }>(`
    SELECT COUNT(*)::int as count FROM orders ${whereStr}
  `, params);

  const ordersRes = await query<any>(`
    SELECT 
      id,
      order_number as "orderNumber",
      customer_name as "customerName",
      customer_email as "customerEmail",
      customer_phone as "customerPhone",
      order_type as "orderType",
      delivery_address as "deliveryAddress",
      total_amount::float as "totalAmount",
      discount_amount::float as "discountAmount",
      tax_amount::float as "taxAmount",
      final_amount::float as "finalAmount",
      payment_status as "paymentStatus",
      payment_method as "paymentMethod",
      order_status as "orderStatus",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM orders
    ${whereStr}
    ORDER BY created_at DESC
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `, [...params, limit, offset]);

  return {
    orders: ordersRes,
    totalCount: countRes[0]?.count || 0,
  };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const orderRes = await query<any>(`
    SELECT 
      id,
      order_number as "orderNumber",
      customer_name as "customerName",
      customer_email as "customerEmail",
      customer_phone as "customerPhone",
      order_type as "orderType",
      delivery_address as "deliveryAddress",
      total_amount::float as "totalAmount",
      discount_amount::float as "discountAmount",
      tax_amount::float as "taxAmount",
      final_amount::float as "finalAmount",
      payment_status as "paymentStatus",
      payment_method as "paymentMethod",
      order_status as "orderStatus",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM orders
    WHERE id = $1
  `, [orderId]);

  if (orderRes.length === 0) return null;

  const itemsRes = await query<OrderItem>(`
    SELECT 
      id,
      order_id as "orderId",
      menu_item_id as "menuItemId",
      item_name as "itemName",
      unit_price::float as "unitPrice",
      quantity,
      subtotal::float as subtotal
    FROM order_items
    WHERE order_id = $1
    ORDER BY id ASC
  `, [orderId]);

  return {
    ...orderRes[0],
    items: itemsRes,
  };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  options?: { paymentStatus?: PaymentStatus; notes?: string }
): Promise<Order> {
  const current = await getOrderById(orderId);
  if (!current) {
    throw new Error(`Order '${orderId}' not found`);
  }

  // Validate state transition
  const allowed = VALID_ORDER_TRANSITIONS[current.orderStatus];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid order status transition from '${current.orderStatus}' to '${newStatus}'. Allowed: [${allowed.join(', ')}]`
    );
  }

  const paymentStatus = options?.paymentStatus || (newStatus === 'completed' ? 'paid' : current.paymentStatus);

  const updateRes = await query<any>(`
    UPDATE orders
    SET 
      order_status = $1,
      payment_status = $2,
      notes = COALESCE($3, notes),
      updated_at = NOW()
    WHERE id = $4
    RETURNING 
      id,
      order_number as "orderNumber",
      customer_name as "customerName",
      customer_email as "customerEmail",
      customer_phone as "customerPhone",
      order_type as "orderType",
      delivery_address as "deliveryAddress",
      total_amount::float as "totalAmount",
      discount_amount::float as "discountAmount",
      tax_amount::float as "taxAmount",
      final_amount::float as "finalAmount",
      payment_status as "paymentStatus",
      payment_method as "paymentMethod",
      order_status as "orderStatus",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [newStatus, paymentStatus, options?.notes || null, orderId]);

  // Dispatch status change notification
  createNotification({
    eventType: 'order_status_changed',
    title: `Order #${current.orderNumber} ${newStatus.toUpperCase()}`,
    message: `Order status for ${current.customerName} changed from ${current.orderStatus} to ${newStatus}.`,
    recipientRole: 'all',
    deepLink: `/orders?id=${orderId}`,
    metadata: { orderId, orderNumber: current.orderNumber, previousStatus: current.orderStatus, newStatus },
  }).catch((err) => console.error('Notification error on order status update:', err));

  return updateRes[0];
}

export async function getOrderAnalytics() {
  const todayRevenue = await query<{ revenue: number }>(`
    SELECT COALESCE(SUM(final_amount), 0)::float as revenue
    FROM orders
    WHERE created_at >= CURRENT_DATE AND order_status != 'cancelled'
  `);

  const activeOrders = await query<{ count: number }>(`
    SELECT COUNT(*)::int as count
    FROM orders
    WHERE order_status IN ('pending', 'confirmed', 'processing', 'ready')
  `);

  const completedToday = await query<{ count: number }>(`
    SELECT COUNT(*)::int as count
    FROM orders
    WHERE created_at >= CURRENT_DATE AND order_status = 'completed'
  `);

  const totalOrdersAllTime = await query<{ count: number }>(`
    SELECT COUNT(*)::int as count FROM orders
  `);

  return {
    todayRevenue: todayRevenue[0]?.revenue || 0,
    activeOrdersCount: activeOrders[0]?.count || 0,
    completedTodayCount: completedToday[0]?.count || 0,
    totalOrdersCount: totalOrdersAllTime[0]?.count || 0,
  };
}
