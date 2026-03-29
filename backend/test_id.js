import pool from './src/config/database.js';

async function check() {
  try {
    const id = 'd4071567-8e7d-49a6-b4bd-aaaedc96f94d';
    const res = await pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
    console.log('User found:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
