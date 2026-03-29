import pool from './src/config/database.js';

async function check() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT name, region FROM attractions LIMIT 5');
    console.log('Sample attractions:');
    res.rows.forEach(row => console.log(`- ${row.name} (Region: ${row.region})`));
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    process.exit();
  }
}

check();
