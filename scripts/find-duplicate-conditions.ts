import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

async function main() {
  // Find duplicate commonNames
  const dupes = await p.$queryRaw<{common_name: string, cnt: string}[]>`
    SELECT common_name, COUNT(*) as cnt
    FROM medical_conditions
    WHERE is_active = true
    GROUP BY common_name
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 30
  `;
  console.log(`Duplicate condition names: ${dupes.length}\n`);
  for (const d of dupes) {
    console.log(`  "${d.common_name}" — ${d.cnt} copies`);
  }

  // Also check duplicate slugs
  const slugDupes = await p.$queryRaw<{slug: string, cnt: string}[]>`
    SELECT slug, COUNT(*) as cnt
    FROM medical_conditions
    WHERE is_active = true
    GROUP BY slug
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 10
  `;
  console.log(`\nDuplicate slugs: ${slugDupes.length}`);
  for (const d of slugDupes) {
    console.log(`  "${d.slug}" — ${d.cnt} copies`);
  }

  // Check duplicate ConditionPageContent for same condition
  const contentDupes = await p.$queryRaw<{condition_id: number, language_code: string, cnt: string}[]>`
    SELECT condition_id, language_code, COUNT(*) as cnt
    FROM condition_page_content
    GROUP BY condition_id, language_code
    HAVING COUNT(*) > 1
    LIMIT 20
  `;
  console.log(`\nDuplicate page content rows: ${contentDupes.length}`);
  for (const d of contentDupes) {
    console.log(`  condition_id=${d.condition_id}, lang=${d.language_code} — ${d.cnt} copies`);
  }

  // Total conditions in cardiology
  const total = await p.medicalCondition.count({
    where: { specialistType: { in: ['Cardiology', 'Cardiologist'] }, isActive: true }
  });
  console.log(`\nTotal active cardiology conditions: ${total}`);
}

main().catch(console.error).finally(async () => { await p.$disconnect(); pool.end(); });
