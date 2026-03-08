import pool from './src/config/database.js';

async function checkDatabase() {
    try {
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables:', tables.rows.map(r => r.table_name));

        const tripColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'trips'
    `);
        console.log('Trips columns:', tripColumns.rows.map(r => r.column_name));

        const itineraryColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'itineraries'
    `);
        console.log('Itineraries columns:', itineraryColumns.rows.map(r => r.column_name));

        const bookingColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
    `);
        console.log('Bookings columns:', bookingColumns.rows.map(r => r.column_name));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkDatabase();
