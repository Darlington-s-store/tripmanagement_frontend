import pool from './src/config/database.js';

async function completeBookings() {
    try {
        const res = await pool.query(`
      UPDATE bookings 
      SET status = 'completed' 
      WHERE status = 'confirmed' 
      AND user_id IN (SELECT id FROM users WHERE email = 'asomanirawlingsjunior5333@gmail.com')
      RETURNING id, booking_type, status
    `);
        console.log('--- Updated Bookings to Completed ---');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

completeBookings();
