import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

async function main() {
  // Simulate the exact query the page uses
  const conditions = await p.medicalCondition.findMany({
    where: {
      isActive: true,
      specialistType: { contains: 'cardio', mode: 'insensitive' },
    },
    select: { id: true, commonName: true, slug: true, icdCode: true, specialistType: true },
    orderBy: { commonName: 'asc' },
  });

  console.log(`Total results: ${conditions.length}`);

  // Find duplicate commonNames
  const nameCount = new Map<string, number>();
  for (const c of conditions) {
    const name = c.commonName.toLowerCase();
    nameCount.set(name, (nameCount.get(name) || 0) + 1);
  }

  const dupes = [...nameCount.entries()].filter(([, count]) => count > 1);
  console.log(`\nDuplicate names: ${dupes.length}`);
  for (const [name, count] of dupes.slice(0, 30)) {
    const items = conditions.filter(c => c.commonName.toLowerCase() === name);
    console.log(`\n  "${name}" — ${count} copies:`);
    for (const item of items) {
      console.log(`    ID: ${item.id}, slug: ${item.slug}, ICD: ${item.icdCode}, type: ${item.specialistType}`);
    }
  }

  // Count unique vs total
  const uniqueNames = new Set(conditions.map(c => c.commonName.toLowerCase()));
  console.log(`\nTotal: ${conditions.length}, Unique names: ${uniqueNames.size}, Duplicates: ${conditions.length - uniqueNames.size}`);
}

main().catch(console.error).finally(async () => { await p.$disconnect(); pool.end(); });
