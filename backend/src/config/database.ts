import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export interface DatabaseStatus {
  connected: boolean;
  message: string;
  timestamp: string;
}

export async function checkDatabaseConnection(): Promise<DatabaseStatus> {
  const timestamp = new Date().toISOString();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return {
        connected: true,
        message: 'PostgreSQL connection successful',
        timestamp,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return {
      connected: false,
      message,
      timestamp,
    };
  }
}

