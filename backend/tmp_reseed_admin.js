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
            const fullName = 'System Administrator';

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            await client.query('DELETE FROM users WHERE email = $1', [email]);
            await client.query(
                'INSERT INTO users (email, password_hash, full_name, role, status) VALUES ($1, $2, $3, $4, $5)',
                [email, hashed, fullName, 'admin', 'active']
            );
            console.log('Admin user deleted and recreated successfully.');
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
