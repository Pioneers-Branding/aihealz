import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

async function main() {
  // Get all Heart & Cardiovascular condition IDs
  const conditions = await p.medicalCondition.findMany({
    where: {
      OR: [
        { bodySystem: 'Heart & Cardiovascular' },
        { specialistType: { in: ['Cardiology', 'Cardiologist'] } },
      ],
      isActive: true,
    },
    select: { id: true },
  });
  const ids = conditions.map(c => c.id);
  console.log(`Found ${ids.length} cardiovascular conditions`);

  // Publish all their English content
  const updated = await p.conditionPageContent.updateMany({
    where: {
      conditionId: { in: ids },
      languageCode: 'en',
      status: { not: 'published' },
    },
    data: { status: 'published' },
  });
  console.log(`✅ Published ${updated.count} condition pages`);

  const total = await p.conditionPageContent.count({
    where: { conditionId: { in: ids }, languageCode: 'en', status: 'published' },
  });
  console.log(`📊 Total published cardiology pages: ${total} / ${ids.length}`);
}

main().catch(console.error).finally(async () => { await p.$disconnect(); pool.end(); });
