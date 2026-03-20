import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkWordCount() {
    const content = await prisma.conditionPageContent.findFirst({
        where: {
            condition: { slug: 'abdominal-aortic-aneurysm-ruptured-i713' },
            languageCode: 'en'
        }
    });

    if (!content) {
        console.log('No content found for i713');
        return;
    }

    let totalWords = 0;
    const fields = [
        'heroOverview', 'definition', 'diagnosisOverview', 'treatmentOverview',
        'whySeeSpecialist', 'doctorSelectionGuide', 'insuranceGuide',
        'financialAssistance', 'exerciseGuidelines', 'prognosis', 'recoveryTimeline'
    ];

    fields.forEach(field => {
        const text = (content as any)[field];
        if (text) totalWords += text.trim().split(/\s+/).length;
    });

    const arrayFields = [
        'primarySymptoms', 'earlyWarningSigns', 'emergencySigns', 'preventionStrategies',
        'lifestyleModifications', 'dailyManagement', 'complications', 'searchTags', 'keywords'
    ];

    arrayFields.forEach(field => {
        const arr = (content as any)[field];
        if (Array.isArray(arr)) {
            arr.forEach(item => { if (item) totalWords += item.trim().split(/\s+/).length; });
        }
    });

    const multiFields = [
        { key: 'typesClassification', fields: ['type', 'description'] },
        { key: 'causes', fields: ['cause', 'description'] },
        { key: 'riskFactors', fields: ['factor', 'category', 'description'] },
        { key: 'diagnosticTests', fields: ['test', 'purpose', 'whatToExpect'] },
        { key: 'medicalTreatments', fields: ['name', 'description'] },
        { key: 'surgicalOptions', fields: ['name', 'description'] },
        { key: 'faqs', fields: ['question', 'answer'] }
    ];

    multiFields.forEach(({ key, fields }) => {
        const arr = (content as any)[key];
        if (Array.isArray(arr)) {
            arr.forEach(item => {
                fields.forEach(f => {
                    const text = item[f];
                    if (text) totalWords += text.trim().split(/\s+/).length;
                });
            });
        }
    });

    console.log(`Current word count for i713: ${totalWords}`);
}

checkWordCount()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
