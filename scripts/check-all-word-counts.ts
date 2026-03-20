import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkMultipleWordCounts() {
    const contents = await prisma.conditionPageContent.findMany({
        where: {
            languageCode: 'en'
        },
        include: {
            condition: true
        }
    });

    if (contents.length === 0) {
        console.log('No content found in English.');
        return;
    }

    for (const content of contents) {
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
            'typesClassification', 'causes', 'riskFactors', 'diagnosticTests', 'medicalTreatments', 'surgicalOptions', 'faqs'
        ];

        multiFields.forEach(key => {
            const arr = (content as any)[key];
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    Object.values(item).forEach(val => {
                        if (typeof val === 'string') totalWords += val.trim().split(/\s+/).length;
                    });
                });
            }
        });

        console.log(`Condition: ${content.condition.slug} - Word Count: ${totalWords}`);
    }
}

checkMultipleWordCounts()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
