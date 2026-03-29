import pool from './src/config/database.js';

async function checkBookings() {
    try {
        const res = await pool.query(`
      SELECT b.id, b.booking_type, b.status, u.email, u.full_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
        console.log('--- Current Bookings ---');
        console.table(res.rows);

        const reviews = await pool.query('SELECT * FROM reviews');
        console.log('--- Current Reviews ---');
        console.table(reviews.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkBookings();
