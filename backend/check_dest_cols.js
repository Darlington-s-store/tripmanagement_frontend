import pool from './src/config/database.js';

async function check() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'destinations'
    `);
    console.log('Columns in destinations table:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    process.exit();
  }
}

check();
