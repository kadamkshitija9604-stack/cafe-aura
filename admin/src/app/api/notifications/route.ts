import { NextRequest } from 'next/server';
import { getNotifications, markNotificationsAsRead } from '@/lib/services/notificationService';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { getAuthContext } from '@/lib/permissions/authGuard';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const role = auth?.role || 'all';

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const data = await getNotifications(role, limit);
    return apiSuccess(data);
  } catch (error: any) {
    console.error('API Error /api/notifications GET:', error);
    return apiError(error.message, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = body.id || undefined;

    const result = await markNotificationsAsRead(id);
    return apiSuccess(result);
  } catch (error: any) {
    console.error('API Error /api/notifications PATCH:', error);
    return apiError(error.message, 500);
  }
}
