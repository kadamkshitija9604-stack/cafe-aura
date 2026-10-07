import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      pool = new Pool({
        connectionString,
        ssl: false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      pool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'cafe aura',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }

  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.slice(0, 60), duration, rows: res.rowCount });
    }
    return res.rows;
  } catch (error: any) {
    console.error('Database query execution failure:', error.message || 'Unknown database error');
    throw new Error('Database operation failed');
  }
}

export async function checkDbConnection(): Promise<{ ok: boolean; database?: string; error?: string }> {
  try {
    const rows = await query('SELECT current_database() as db_name, NOW() as current_time');
    return { ok: true, database: rows[0]?.db_name };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
