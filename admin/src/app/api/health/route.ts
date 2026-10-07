import { checkDbConnection } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/apiResponse';

export async function GET() {
  const dbStatus = await checkDbConnection();

  if (dbStatus.ok) {
    return apiSuccess({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } else {
    return apiError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE');
  }
}
