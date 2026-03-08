import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } :
    process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;

export async function initializeDatabase() {
  let retries = 5;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      try {
        console.log('Database connected successfully');
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err.message.includes('Control plane request failed') && retries > 1) {
        console.log(`⚠️  Neon control plane error during startup, retrying... (${retries - 1} left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      console.error('Database connection failed:', err);
      throw err;
    }
  }
}
