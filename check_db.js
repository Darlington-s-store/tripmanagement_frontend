import pool from './backend/src/config/database.js';

async function check() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables in database:', res.rows.map(r => r.table_name).join(', '));
    } catch (e) {
        console.error('Error checking tables:', e);
    } finally {
        client.release();
        process.exit();
    }
}

check();
