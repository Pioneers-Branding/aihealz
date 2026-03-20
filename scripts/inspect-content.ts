import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function inspectContent() {
    const c = await prisma.conditionPageContent.findFirst({
        where: {
            condition: { slug: 'abdominal-aortic-aneurysm-ruptured-i713' },
            languageCode: 'en'
        }
    });

    if (c) {
        console.log('Definition Snippet:', c.definition?.substring(0, 500) + '...');
        console.log('Hero Overview Snippet:', c.heroOverview?.substring(0, 500) + '...');
    } else {
        console.log('No content found for i713');
    }
}

inspectContent()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
