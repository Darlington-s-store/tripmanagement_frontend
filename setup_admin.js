import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'backend', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function createAdmin() {
    const email = 'admin@tripease.com';
    const password = 'AdminPassword123!';
    const fullName = 'System Administrator';

    try {
        // Check if exists
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log('Admin account already exists. Updating password and role...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                "UPDATE users SET password_hash = $1, role = 'admin' WHERE email = $2",
                [hashedPassword, email]
            );
        } else {
            console.log('Creating new admin account...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, 'admin')",
                [email, hashedPassword, fullName]
            );
        }
        console.log('\n✅ Admin Account Ready!');
        console.log('-------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-------------------------');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await pool.end();
    }
}

createAdmin();
