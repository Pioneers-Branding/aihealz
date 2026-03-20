import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

async function main() {
  // Get all cardiology conditions
  const conditions = await p.medicalCondition.findMany({
    where: {
      specialistType: { in: ['Cardiologist', 'Cardiology'] },
      isActive: true,
    },
    select: { id: true, slug: true, commonName: true, specialistType: true },
    orderBy: { commonName: 'asc' },
  });

  console.log(`Total cardiology conditions: ${conditions.length}\n`);

  // Check which ones already have ConditionPageContent in English
  const existingContent = await p.conditionPageContent.findMany({
    where: {
      conditionId: { in: conditions.map(c => c.id) },
      languageCode: 'en',
    },
    select: { conditionId: true, status: true, wordCount: true },
  });

  const contentMap = new Map(existingContent.map(c => [c.conditionId, c]));

  let withContent = 0;
  let withoutContent = 0;

  for (const c of conditions) {
    const content = contentMap.get(c.id);
    const status = content ? `✅ ${content.status} (${content.wordCount || 0} words)` : '❌ No content';
    console.log(`${c.id} | ${c.slug} | ${status}`);
    if (content) withContent++; else withoutContent++;
  }

  console.log(`\nWith content: ${withContent}`);
  console.log(`Without content: ${withoutContent}`);
}

main()
  .catch(console.error)
  .finally(async () => { await p.$disconnect(); await pool.end(); });
