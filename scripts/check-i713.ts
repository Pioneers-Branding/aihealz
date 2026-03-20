import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const cond = await prisma.medicalCondition.findUnique({
        where: { slug: 'abdominal-aortic-aneurysm-ruptured-i713' }
    });
    if (!cond) return;

    const enEntry = await prisma.conditionPageContent.findFirst({
        where: { conditionId: cond.id, languageCode: 'en' }
    });
    
    if (enEntry) {
        console.log('DB Content Word Count (EN):', enEntry.wordCount);
        console.log('DB Content length (heroOverview):', enEntry.heroOverview?.length);
    }
    
    await prisma.$disconnect();
}

main();
