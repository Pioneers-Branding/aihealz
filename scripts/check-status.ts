import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });
async function main() {
  const stats = await p.conditionPageContent.groupBy({
    by: ['status'],
    where: { languageCode: 'en' },
    _count: true,
  });
  console.log('Content by status:', JSON.stringify(stats, null, 2));

  // Check a sample condition page load
  const sample = await p.conditionPageContent.findFirst({
    where: {
      condition: { specialistType: 'Cardiologist' },
      languageCode: 'en',
    },
    select: { id: true, conditionId: true, status: true, h1Title: true, wordCount: true },
  });
  console.log('\nSample:', JSON.stringify(sample, null, 2));
}
main().catch(console.error).finally(async () => { await p.$disconnect(); pool.end(); });
