import pool from './src/config/database.js';

async function describeTable() {
    try {
        const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'trips'
    `);
        console.log('Columns:', JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

describeTable();
