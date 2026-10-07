import { NextRequest } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/services/orderService';
import { updateOrderStatusSchema } from '@/lib/validations/order.schema';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { enforcePermission } from '@/lib/permissions/authGuard';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await enforcePermission(req, 'orders:view');
    if (!authResult.authorized) return authResult.response;

    const order = await getOrderById(params.id);
    if (!order) {
      return apiError(`Order '${params.id}' not found`, 404, 'ORDER_NOT_FOUND');
    }
    return apiSuccess(order);
  } catch (error: any) {
    console.error(`API Error /api/orders/${params.id} GET:`, error);
    return apiError('Failed to fetch order', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. RBAC Check: require 'orders:edit'
    const authResult = await enforcePermission(req, 'orders:edit', {
      action: 'ORDER_STATUS_UPDATED',
      resourceType: 'order',
      resourceId: params.id,
      details: `Updated order status for ${params.id}`,
    });

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid status update payload', 400, 'VALIDATION_ERROR', parsed.error.flatten().fieldErrors);
    }

    const updated = await updateOrderStatus(params.id, parsed.data.status, {
      paymentStatus: parsed.data.paymentStatus,
      notes: parsed.data.notes,
    });

    return apiSuccess(updated);
  } catch (error: any) {
    console.error(`API Error /api/orders/${params.id} PATCH:`, error);
    return apiError(error.message || 'Failed to update order status', 400, 'STATUS_UPDATE_FAILED');
  }
}
