import pool from './src/config/database.js';

async function fixSchema() {
  try {
    console.log('Fixing schema...');
    
    // Add missing columns to attractions
    await pool.query(`
      ALTER TABLE attractions 
      ADD COLUMN IF NOT EXISTS destination_id UUID,
      ADD COLUMN IF NOT EXISTS location_data JSONB,
      ADD COLUMN IF NOT EXISTS location_map TEXT,
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);
    console.log('Attractions table updated.');

    // Add foreign key if possible (we might need to clean data first, so just the column for now)
    
    // Ensure destinations table has all needed columns
    await pool.query(`
      ALTER TABLE destinations
      ADD COLUMN IF NOT EXISTS location_map TEXT;
    `);
    console.log('Destinations table updated.');

    console.log('Schema fix completed successfully.');
  } catch (err) {
    console.error('Schema fix failed:', err);
  } finally {
    await pool.end();
  }
}

fixSchema();
