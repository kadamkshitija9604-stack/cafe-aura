import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { enforcePermission } from '@/lib/permissions/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || 'general';

    const rows = await query<{ value: any }>('SELECT value FROM cafe_settings WHERE key = $1', [key]);
    const value = rows.length > 0 ? rows[0].value : null;

    return apiSuccess(value);
  } catch (error: any) {
    console.error('API Error /api/settings GET:', error);
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await enforcePermission(req, 'settings:edit', {
      action: 'SETTINGS_UPDATED',
      resourceType: 'settings',
      details: 'Updated cafe system configuration',
    });
    if (!authResult.authorized) return authResult.response;

    const body = await req.json();
    const { key, value } = body;
    if (!key || value === undefined) {
      return apiError('Setting key and value required', 400);
    }

    await query(
      `INSERT INTO cafe_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );

    return apiSuccess({ key, updated: true });
  } catch (error: any) {
    console.error('API Error /api/settings PUT:', error);
    return apiError(error.message, 500);
  }
}
