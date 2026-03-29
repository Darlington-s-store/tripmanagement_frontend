require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
    const b = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings'");
    console.log("Bookings:", b.rows);
    const r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews'");
    console.log("Reviews:", r.rows);
    const h = await pool.query("SELECT * FROM reviews LIMIT 1");
    console.log("Review Sample:", h.rows);
    await pool.end();
}
checkSchema();
