import pool from './src/config/database.js';

async function checkUser() {
    try {
        const result = await pool.query('SELECT id, full_name FROM users WHERE id = $1', ['66c9a386-b7cb-402a-8849-d539b85fcd27']);
        console.log('Users:', JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkUser();
