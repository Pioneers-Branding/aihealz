import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  const rows = await p.conditionPageContent.findMany({
    where: { conditionId: 9435 },
    select: { id: true, languageCode: true, status: true }
  });
  console.log('Languages for i714:', JSON.stringify(rows));
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await p.$disconnect(); await pool.end(); });
