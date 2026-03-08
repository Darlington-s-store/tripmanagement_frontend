import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkAdmin() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, email, full_name, role FROM users WHERE role = 'admin'");
        console.log('Admin users:', res.rows);
    } catch (err) {
        console.error('Error checking admin:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkAdmin();
