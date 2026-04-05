import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function run() {
    try {
        const client = await pool.connect();
        try {
            const email = 'admin@tripease.com';
            const password = 'AdminPassword123!';

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashed, email]);
            console.log('Admin user password_hash updated successfully.');
        } finally {
            client.release();
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
