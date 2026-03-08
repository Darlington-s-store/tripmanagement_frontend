import pool from './src/config/database.js';

async function checkHotelPrices() {
    try {
        const result = await pool.query('SELECT name, price_per_night FROM hotels');
        console.log('Hotel Prices:', JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkHotelPrices();
