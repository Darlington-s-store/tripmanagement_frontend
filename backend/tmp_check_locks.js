import pool from './src/config/database.js';

async function checkLocks() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
      SELECT 
        pid, 
        now() - query_start AS duration, 
        query, 
        state 
      FROM pg_stat_activity 
      WHERE state != 'idle' 
        AND query NOT LIKE '%pg_stat_activity%';
    `);
        console.log('Active queries:', JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        process.exit();
    }
}

checkLocks();
