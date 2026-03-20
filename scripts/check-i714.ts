import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkI714() {
    const c = await prisma.conditionPageContent.findFirst({
        where: {
            condition: { slug: 'abdominal-aortic-aneurysm-without-rupture-i714' },
            languageCode: 'en'
        }
    });

    if (c) {
        console.log('Word count in DB:', c.wordCount);
        console.log('Definition Snippet:', c.definition?.substring(0, 500) + '...');
        console.log('Hero Overview Snippet:', c.heroOverview?.substring(0, 500) + '...');
    } else {
        console.log('No content found for i714');
    }
}

checkI714()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
