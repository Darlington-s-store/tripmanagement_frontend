import pool from './src/config/database.js';

async function listTables() {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', result.rows.map(r => r.table_name));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

listTables();
