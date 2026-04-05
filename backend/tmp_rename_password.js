import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function run() {
    try {
        await pool.query('ALTER TABLE users RENAME COLUMN password TO password_hash;');
        console.log('Renamed password to password_hash');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
