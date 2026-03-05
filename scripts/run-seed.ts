import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const sql = fs.readFileSync('db/migrations/003_seed.sql', 'utf-8');
    console.log('Executing 003_seed.sql...');
    try {
        await pool.query(sql);
        console.log('Seed executed successfully!');
    } catch (e) {
        console.error('Seed error:', e);
    } finally {
        await pool.end();
    }
}
main();
