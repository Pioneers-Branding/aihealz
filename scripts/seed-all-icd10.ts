import 'dotenv/config';
import prisma from '@/lib/db';
import https from 'https';
import readline from 'readline';

// Fallback logic from icd10-seeder.ts
function mapChapterToSpecialty(code: string): string {
    const chapter = code.charAt(0);
    const map: Record<string, string> = {
        A: 'Infectious Disease', B: 'Infectious Disease',
        C: 'Oncology', D: 'Hematology',
        E: 'Endocrinology', F: 'Psychiatry',
        G: 'Neurology', H: 'Ophthalmology',
        I: 'Cardiology', J: 'Pulmonology',
        K: 'Gastroenterology', L: 'Dermatology',
        M: 'Orthopedics', N: 'Urology',
        O: 'Obstetrics', P: 'Neonatology',
        Q: 'Genetics', R: 'General Medicine',
        S: 'Orthopedics', T: 'Emergency Medicine',
    };
    return map[chapter] || 'General Medicine';
}

function mapChapterToBodySystem(code: string): string {
    const chapter = code.charAt(0);
    const map: Record<string, string> = {
        A: 'Immune System', B: 'Immune System',
        C: 'Multiple Systems', D: 'Blood & Lymphatic',
        E: 'Endocrine System', F: 'Mental Health',
        G: 'Head & Brain', H: 'Eyes & Ears',
        I: 'Heart & Cardiovascular', J: 'Lungs & Respiratory',
        K: 'Digestive System', L: 'Skin & Dermatology',
        M: 'Spine & Joints', N: 'Urinary System',
        O: "Women's Health", P: "Children's Health",
    };
    return map[chapter] || 'Multiple Systems';
}

const URL = 'https://raw.githubusercontent.com/k4m1113/ICD-10-CSV/master/codes.csv';
const BATCH_SIZE = 5000;

async function main() {
    console.log('Downloading and streaming ICD-10 database...');

    return new Promise((resolve, reject) => {
        https.get(URL, async (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch CSV: ${res.statusCode}`));
                return;
            }

            const rl = readline.createInterface({
                input: res,
                crlfDelay: Infinity
            });

            let batch: any[] = [];
            let totalProcessed = 0;
            let existingSlugs = new Set();

            const flushBatch = async () => {
                if (batch.length === 0) return;
                try {
                    // Remove duplicates within the batch
                    const uniqueBatch = [];
                    for (const item of batch) {
                        if (!existingSlugs.has(item.slug)) {
                            existingSlugs.add(item.slug);
                            uniqueBatch.push(item);
                        }
                    }
                    if (uniqueBatch.length > 0) {
                        await prisma.medicalCondition.createMany({
                            data: uniqueBatch,
                            skipDuplicates: true
                        });
                    }
                    totalProcessed += uniqueBatch.length;
                    console.log(`Inserted batch. Total conditions seeded: ${totalProcessed}`);
                } catch (e) {
                    console.error('Error inserting batch:', e);
                }
                batch = [];
            };

            for await (const line of rl) {
                // Simple CSV parser for this specific format
                // Expected format: A00,0,A000,"Cholera due to...","Cholera...","Cholera"
                // Regex to split by comma outside quotes
                const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if (parts.length < 5) continue;

                const rawCode = parts[2].trim();
                const rawDesc = parts[3].replace(/^"|"$/g, '').trim();
                // create a decimal formatted code
                const icdCode = rawCode.length > 3 ? `${rawCode.substring(0, 3)}.${rawCode.substring(3)}` : rawCode;

                // very basic slugification
                let slug = rawDesc.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                // Append raw code to ensure unique slugs for highly specific identical descriptions
                slug = `${slug}-${rawCode.toLowerCase()}`;

                if (!slug || slug.length > 80) slug = slug.substring(0, 80);

                batch.push({
                    slug,
                    scientificName: rawDesc,
                    commonName: rawDesc,
                    specialistType: mapChapterToSpecialty(rawCode),
                    bodySystem: mapChapterToBodySystem(rawCode),
                    icdCode: icdCode,
                    severityLevel: 'moderate',
                    isActive: true, // We make them all active for testing
                    symptoms: [],
                    treatments: [],
                    description: ''
                });

                if (batch.length >= BATCH_SIZE) {
                    // Pause streaming while inserting
                    rl.pause();
                    await flushBatch();
                    rl.resume();
                }
            }

            await flushBatch();
            console.log(`✅ Fully seeded ${totalProcessed} medical conditions from ICD-10 dataset!`);
            resolve(true);
        }).on('error', reject);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
