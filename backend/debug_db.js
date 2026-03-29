import pool from './src/config/database.js';

async function debug() {
  try {
    console.log('Testing connection...');
    const now = await pool.query('SELECT NOW()');
    console.log('Connection successful:', now.rows[0]);

    console.log('\nChecking tables...');
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));

    const checkTable = async (name) => {
      try {
        const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${name}'`);
        console.log(`\nColumns in ${name}:`, cols.rows);
      } catch (e) {
        console.log(`\nTable ${name} does not exist or error:`, e.message);
      }
    };

    await checkTable('notifications');
    await checkTable('attractions');
    await checkTable('trip_categories');
    await checkTable('destinations');
    await checkTable('reviews');

  } catch (err) {
    console.error('Debug failed:', err);
  } finally {
    await pool.end();
  }
}

debug();
