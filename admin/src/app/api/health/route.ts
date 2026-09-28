import { checkDbConnection, query } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/apiResponse';

export async function GET() {
  const start = Date.now();
  const dbStatus = await checkDbConnection();
  const dbLatency = Date.now() - start;

  if (dbStatus.ok) {
    const memoryUsage = process.memoryUsage();
    return apiSuccess({
      status: 'healthy',
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
      database: {
        status: 'connected',
        name: dbStatus.database,
        latencyMs: dbLatency,
      },
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
    });
  } else {
    return apiError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE', {
      dbError: dbStatus.error,
    });
  }
}
