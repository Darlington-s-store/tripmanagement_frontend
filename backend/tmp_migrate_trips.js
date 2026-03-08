import pool from './src/config/database.js';

async function migrateTrips() {
    try {
        await pool.query(`
      ALTER TABLE trips 
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false
    `);
        console.log('Migrated trips table');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

migrateTrips();
