import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function clearAllData() {
    const client = await pool.connect();
    try {
        console.log('Starting data cleanup...');
        
        // Disable foreign key checks is more complex in Postgres, 
        // better to delete in correct order or use TRUNCATE CASCADE
        
        await client.query('BEGIN');
        
        // Tables to truncate with CASCADE to handle foreign keys
        const tables = [
            'reviews',
            'payments',
            'bookings',
            'itineraries',
            'trips',
            'tour_guides',
            'hotel_rooms',
            'hotels',
            'activities',
            'providers',
            'notifications',
            'admin_logs',
            'disputes',
            'refunds'
        ];

        for (const table of tables) {
            console.log(`Truncating ${table}...`);
            await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
        }

        // Delete non-admin users
        console.log('Deleting non-admin users...');
        await client.query("DELETE FROM users WHERE role != 'admin'");
        
        await client.query('COMMIT');
        console.log('Cleanup successful!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during cleanup:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

clearAllData();
