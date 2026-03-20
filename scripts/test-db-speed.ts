import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });

async function main() {
  const t0 = Date.now();

  // Test 1: Simple connect
  await pool.query('SELECT 1');
  console.log(`DB connect: ${Date.now() - t0}ms`);

  // Test 2: Count
  const t1 = Date.now();
  const r1 = await pool.query('SELECT count(*) FROM condition_page_content');
  console.log(`Count query: ${Date.now() - t1}ms (${r1.rows[0].count} rows)`);

  // Test 3: Specific condition
  const t2 = Date.now();
  const r2 = await pool.query('SELECT id, language_code FROM condition_page_content WHERE condition_id = 9435');
  console.log(`Condition query: ${Date.now() - t2}ms (${r2.rows.length} rows)`);

  // Test 4: Geography
  const t3 = Date.now();
  const r3 = await pool.query("SELECT id, name, level FROM geographies WHERE slug = 'india' AND is_active = true");
  console.log(`Geo query: ${Date.now() - t3}ms (${r3.rows.length} rows)`);

  // Test 5: Medical condition
  const t4 = Date.now();
  const r4 = await pool.query("SELECT id, common_name FROM medical_conditions WHERE slug = 'abdominal-aortic-aneurysm-without-rupture-i714'");
  console.log(`Condition lookup: ${Date.now() - t4}ms (${r4.rows.length} rows)`);

  // Test 6: All parallel
  const t5 = Date.now();
  await Promise.all([
    pool.query('SELECT id FROM condition_page_content WHERE condition_id = 9435 AND language_code = $1', ['en']),
    pool.query("SELECT id FROM geographies WHERE slug = 'india' AND is_active = true"),
    pool.query("SELECT id FROM medical_conditions WHERE slug = 'abdominal-aortic-aneurysm-without-rupture-i714'"),
    pool.query("SELECT id FROM treatment_costs WHERE condition_slug = 'abdominal-aortic-aneurysm-without-rupture-i714' LIMIT 1"),
  ]);
  console.log(`4 parallel queries: ${Date.now() - t5}ms`);

  console.log(`\nTotal: ${Date.now() - t0}ms`);
  await pool.end();
}

main().catch(console.error);
