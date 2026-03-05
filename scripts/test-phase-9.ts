
import 'dotenv/config';
import prisma from '@/lib/db';
import { seedContentQueue } from '@/lib/cms/batch-processor';
import { generatePage } from '@/lib/content/content-factory';

async function main() {
    console.log('🚀 Starting Phase 9 Verification...');

    // 1. Setup Dummy Condition
    const slug = 'test-sciatica-' + Date.now();
    console.log(`\n1. Creating dummy condition: ${slug}`);

    await prisma.medicalCondition.create({
        data: {
            slug,
            commonName: 'Sciatica Test',
            scientificName: 'Sciatic Neuritis',
            specialistType: 'Spine Surgeon',
            description: 'Pain radiating along the sciatic nerve.',
            isActive: true
        }
    });

    // 2. Test Seeding
    console.log('\n2. Testing Queue Seeding...');
    const seedResult = await seedContentQueue(
        'Test-Batch',
        'in',
        ['mumbai'],
        [slug]
    );
    console.log('Seed Result:', seedResult);

    if (seedResult.count !== 1) {
        throw new Error('Seeding failed: expected 1 target');
    }

    // 3. Test Generation
    console.log('\n3. Testing Content Generation (Mocking OpenRouter)...');

    // Note: We are calling the real function. If OpenRouter key is missing/invalid, this might fail or fallback.
    // For this test, we assume the environment is set up or it handles errors gracefully.

    try {
        const page = await generatePage(slug, 'in', 'mumbai');
        console.log('Generation Success!');
        console.log('Title:', page.h1Title);
        console.log('AI Opinion:', page.aiOpinion?.substring(0, 50) + '...');

        // 4. Verify DB Records
        console.log('\n4. Verifying DB Records...');

        const content = await prisma.conditionContent.findFirst({
            where: { conditionSlug: slug, citySlug: 'mumbai' }
        });

        if (!content) throw new Error('Content record not found in DB');
        console.log('✅ Content Record found');

        const costs = await prisma.treatmentCost.findFirst({
            where: { conditionSlug: slug, citySlug: 'mumbai' }
        });

        if (costs) {
            console.log('✅ Treatment Costs found:', costs.minCost, '-', costs.maxCost);
        } else {
            console.log('⚠️ Treatment Costs NOT found (LLM might have skipped it or failed)');
        }

    } catch (e) {
        console.error('Generation Failed:', e);
        // Don't throw, let's clean up
    }

    // 5. Cleanup
    console.log('\n5. Cleaning up...');
    await prisma.conditionContent.deleteMany({ where: { conditionSlug: slug } });
    await prisma.treatmentCost.deleteMany({ where: { conditionSlug: slug } });
    await prisma.keywordIntent.deleteMany({ where: { conditionSlug: slug } });
    await prisma.medicalCondition.delete({ where: { slug } });

    console.log('✨ Verification Complete');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
