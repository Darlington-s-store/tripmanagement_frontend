import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } :
        process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
    console.log('🔄 Starting database migrations...');

    try {
        const files = fs.readdirSync(__dirname)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            console.log(`🏃 Running migration: ${file}`);
            const migrationSql = fs.readFileSync(path.join(__dirname, file), 'utf8');
            let retries = 3;
            while (retries > 0) {
                try {
                    await pool.query(migrationSql);
                    console.log(`✅ Completed ${file}`);
                    break;
                } catch (err) {
                    if (err.message.includes('Control plane request failed') && retries > 1) {
                        console.log(`⚠️  Neon control plane error, retrying... (${retries - 1} left)`);
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                    if (file === '001_init_schema.sql' && (err.message.includes('Control plane request failed') || err.message.includes('already exists'))) {
                        console.log(`⚠️  Skipping ${file} - tables likely already exist or persistent pooler error`);
                        break;
                    }
                    throw err;
                }
            }
        }

        console.log('🎉 All migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
