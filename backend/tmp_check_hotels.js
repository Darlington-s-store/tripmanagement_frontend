import pool from './src/config/database.js';

async function checkHotels() {
    try {
        const result = await pool.query('SELECT name, location, region FROM hotels');
        console.log('Current Hotels:', JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkHotels();
