const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_g1tB0YQyOSTE@ep-fancy-union-aig7gc3g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  await client.connect();
  try {
    const query = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP,
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS two_factor_code TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_ip TEXT,
      ADD COLUMN IF NOT EXISTS last_user_agent TEXT,
      ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_password_expiry TIMESTAMP;
    `;
    await client.query(query);
    console.log("Successfully added missing columns to users table.");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
