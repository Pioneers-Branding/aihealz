import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });
async function main() {
  const r = await p.medicalCondition.findMany({
    where: { isActive: true, specialistType: { contains: 'cardio', mode: 'insensitive' } },
    select: { commonName: true, slug: true },
    orderBy: { commonName: 'asc' },
    take: 60,
  });
  for (const c of r) console.log(`${c.commonName} | ${c.slug}`);
  console.log(`\n... showing first 60 of ${r.length}`);
}
main().catch(console.error).finally(async () => { await p.$disconnect(); pool.end(); });
