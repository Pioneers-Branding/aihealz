import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

async function main() {
  // Get all cardiology condition IDs
  const conditions = await p.medicalCondition.findMany({
    where: { specialistType: 'Cardiologist', isActive: true },
    select: { id: true },
  });
  const conditionIds = conditions.map(c => c.id);
  console.log(`Found ${conditionIds.length} cardiology conditions`);

  // Bulk update to published
  const updated = await p.conditionPageContent.updateMany({
    where: {
      conditionId: { in: conditionIds },
      languageCode: 'en',
      status: { not: 'published' },
    },
    data: { status: 'published' },
  });
  console.log(`✅ Published ${updated.count} condition pages`);

  // Verify
  const total = await p.conditionPageContent.count({
    where: { conditionId: { in: conditionIds }, languageCode: 'en', status: 'published' },
  });
  console.log(`📊 Total published cardiology pages: ${total}`);
}

main()
  .catch(console.error)
  .finally(async () => { await p.$disconnect(); pool.end(); });
