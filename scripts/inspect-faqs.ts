import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function inspectFAQs() {
    const c = await prisma.conditionPageContent.findFirst({
        where: {
            condition: { slug: 'abdominal-aortic-aneurysm-ruptured-i713' },
            languageCode: 'en'
        }
    });

    if (c) {
        console.log('FAQs:', JSON.stringify(c.faqs, null, 2));
    } else {
        console.log('No content found for i713');
    }
}

inspectFAQs()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
