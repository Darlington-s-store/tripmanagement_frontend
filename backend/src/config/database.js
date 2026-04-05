import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } :
    process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Optimized settings for Neon Serverless
  max: 20,                          // Slightly higher max for pool
  idleTimeoutMillis: 60000,         // Keep idle connections longer (1 min)
  connectionTimeoutMillis: 30000,   // Wait longer for cold starts (30s)
  maxUses: 7500,                    // Refresh connections to avoid memory leaks
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle client:', err.message);
});

export default pool;

export async function initializeDatabase() {
  let retries = 10;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      try {
        console.log('✅ Database connected successfully');
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      const isTransient = 
        err.message?.includes('Control plane request failed') || 
        err.message?.includes('Connection terminated unexpectedly') ||
        err.code === 'ECONNRESET' || 
        err.code === 'ENOTFOUND' ||
        err.code === 'ETIMEDOUT';

      if (isTransient && retries > 1) {
        console.log(`⚠️  Database connection issue (${err.code || err.message}), retrying in 3s... (${retries - 1} left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      console.error('❌ Database connection failed:', err);
      throw err;
    }
  }
}
