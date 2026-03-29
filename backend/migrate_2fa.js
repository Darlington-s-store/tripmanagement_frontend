import pool from './src/config/database.js';

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_type TEXT DEFAULT 'email';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_code TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_expiry TIMESTAMP;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS last_user_agent TEXT;
        `);
        console.log('Migration successful: Added 2FA/OTP/IP columns');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
