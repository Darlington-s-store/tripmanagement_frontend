import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function seedAdmin() {
    const email = 'admin@tripease.com';
    const password = 'AdminPassword123!';
    const fullName = 'System Administrator';

    try {
        const client = await pool.connect();
        try {
            const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            if (check.rows.length > 0) {
                console.log('Admin user already exists.');
                // Update role to admin if it's not
                if (check.rows[0].role !== 'admin') {
                    await client.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
                    console.log('Updated user role to admin.');
                }
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            await client.query(
                'INSERT INTO users (email, password_hash, full_name, role, status) VALUES ($1, $2, $3, $4, $5)',
                [email, hashed, fullName, 'admin', 'active']
            );
            console.log('Admin user created successfully.');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await pool.end();
    }
}

seedAdmin();
