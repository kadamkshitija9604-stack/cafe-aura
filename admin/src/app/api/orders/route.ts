import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders, getOrderAnalytics } from '@/lib/services/orderService';
import { createOrderSchema } from '@/lib/validations/order.schema';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { enforcePermission } from '@/lib/permissions/authGuard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAnalytics = searchParams.get('analytics') === 'true';

    if (isAnalytics) {
      const analytics = await getOrderAnalytics();
      return apiSuccess(analytics);
    }

    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getOrders({ status, search, limit, offset });
    return apiSuccess(result.orders, 200, { total: result.totalCount, limit, offset });
  } catch (error: any) {
    console.error('API Error /api/orders GET:', error);
    return apiError(error.message || 'Failed to fetch orders', 500, 'FETCH_ORDERS_FAILED');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod input validation
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        'Validation failed for order payload',
        400,
        'VALIDATION_ERROR',
        parsed.error.flatten().fieldErrors
      );
    }

    // 2. Create order
    const order = await createOrder(parsed.data);

    return apiSuccess(order, 201);
  } catch (error: any) {
    console.error('API Error /api/orders POST:', error);
    return apiError(error.message || 'Failed to create order', 500, 'CREATE_ORDER_FAILED');
  }
}
