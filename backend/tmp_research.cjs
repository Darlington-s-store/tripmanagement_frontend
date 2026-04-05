const { Pool } = require('pg');
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_g1tB0YQyOSTE@ep-fancy-union-aig7gc3g-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require', 
    ssl: true 
});

async function run() {
    try {
        const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = tablesRes.rows.map(t => t.table_name);
        console.log('Tables:', tables.join(', '));

        if (tables.includes('reviews')) {
            const reviewsCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews'");
            console.log('Reviews Columns:', reviewsCols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        }

        if (tables.includes('transports')) {
            const transportCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transports'");
            console.log('Transports Columns:', transportCols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        } else {
            console.log('Transports table does not exist.');
        }

    } catch (e) {
        console.error('Error during research:', e.message);
    } finally {
        await pool.end();
    }
}

run();
