import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function inspectDetailedFields() {
    const c = await prisma.conditionPageContent.findFirst({
        where: {
            condition: { slug: 'abdominal-aortic-aneurysm-ruptured-i713' },
            languageCode: 'en'
        }
    });

    if (c) {
        console.log('Causes length:', (c.causes as any[])?.length);
        console.log('Risk Factors length:', (c.riskFactors as any[])?.length);
        console.log('Diagnostic Tests length:', (c.diagnosticTests as any[])?.length);
        console.log('Medical Treatments length:', (c.medicalTreatments as any[])?.length);
        console.log('Surgical Options length:', (c.surgicalOptions as any[])?.length);
        console.log('FAQs length:', (c.faqs as any[])?.length);
    }
}

inspectDetailedFields()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
