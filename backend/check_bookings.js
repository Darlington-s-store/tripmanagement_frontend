import pool from './src/config/database.js';

async function check() {
    const res = await pool.query("SELECT * FROM bookings LIMIT 1");
    console.log("Columns in bookings:", Object.keys(res.rows[0] || {}));
    process.exit();
}
check();
