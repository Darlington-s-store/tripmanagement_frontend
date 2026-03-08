import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function resetAdminPassword() {
    const client = await pool.connect();
    try {
        const password = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const res = await client.query(
            "UPDATE users SET password_hash = $1 WHERE email = 'admin@tripease.com' AND role = 'admin' RETURNING id",
            [hash]
        );

        if (res.rows.length > 0) {
            console.log('Admin password reset successfully to: Admin@123');
        } else {
            console.log('Admin user not found.');
        }
    } catch (err) {
        console.error('Error resetting admin password:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

resetAdminPassword();
