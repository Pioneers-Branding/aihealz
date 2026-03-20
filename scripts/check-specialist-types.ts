import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

async function main() {
  // Check what specialist types exist for conditions with cardiology-related pages
  const types = await p.medicalCondition.groupBy({
    by: ['specialistType'],
    _count: true,
    orderBy: { _count: { specialistType: 'desc' } },
    take: 20,
  });
  console.log('Top specialist types:');
  for (const t of types) {
    console.log(`  ${t.specialistType}: ${t._count} conditions`);
  }

  // Check the bodySystem for cardiology
  const cardio = await p.medicalCondition.count({
    where: { bodySystem: 'Heart & Cardiovascular' }
  });
  console.log(`\nHeart & Cardiovascular bodySystem: ${cardio}`);

  // Check conditions in the page content with icdCode starting with I (cardiovascular)
  const icd = await p.medicalCondition.findMany({
    where: { icdCode: { startsWith: 'I' }, isActive: true },
    select: { specialistType: true },
    take: 5,
  });
  console.log('\nSample ICD-I conditions specialist types:', icd.map(i => i.specialistType));

  // How many condition pages have status 'review' for the body system
  const reviewPages = await p.conditionPageContent.count({
    where: {
      languageCode: 'en',
      status: 'review',
      condition: { bodySystem: 'Heart & Cardiovascular' },
    },
  });
  console.log(`\nCardio pages in 'review' status: ${reviewPages}`);
}

main().catch(console.error).finally(async () => { await p.$disconnect(); pool.end(); });
