import pool from './src/config/database.js';

async function migrate() {
  try {
    console.log('Migrating attractions table...');
    await pool.query(`
      ALTER TABLE attractions 
      ADD COLUMN IF NOT EXISTS full_description TEXT,
      ADD COLUMN IF NOT EXISTS travel_tips TEXT,
      ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
