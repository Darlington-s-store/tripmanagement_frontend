import pool from './src/config/database.js';

async function checkTrips() {
    try {
        const result = await pool.query('SELECT id, destination, user_id FROM trips');
        console.log('Trips:', JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkTrips();
