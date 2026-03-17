import 'dotenv/config';
import prisma from '../src/lib/db';
import { generatePageDeepSeek } from '../src/lib/content/content-factory';

const CONCURRENCY_LIMIT = 5; // DeepSeek allows better concurrency than Groq free tier.

async function main() {
    console.log("🚀 Starting SEO-Optimized Mass Content Generation Pipeline...");
    console.log(`Using CONCURRENCY_LIMIT = ${CONCURRENCY_LIMIT}`);

    const allConditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: { slug: true, commonName: true },
        orderBy: { id: 'asc' }
    });

    console.log(`Found ${allConditions.length} active conditions in DB.`);

    const generated = await prisma.conditionContent.findMany({
        where: { countryCode: 'in', language: 'en' },
        select: { conditionSlug: true }
    });

    const generatedSlugs = new Set(generated.map(g => g.conditionSlug));
    const remainingConditions = allConditions.filter(c => !generatedSlugs.has(c.slug));

    console.log(`Remaining conditions to generate: ${remainingConditions.length}`);

    if (remainingConditions.length === 0) {
        console.log("✅ All conditions have been generated! Exiting.");
        return;
    }

    let processedCount = 0;
    const errors: string[] = [];

    // Chunking processing for Promise.all concurrency
    for (let i = 0; i < remainingConditions.length; i += CONCURRENCY_LIMIT) {
        const chunk = remainingConditions.slice(i, i + CONCURRENCY_LIMIT);

        process.stdout.write(`Batch [${i + 1} to ${Math.min(i + CONCURRENCY_LIMIT, remainingConditions.length)}] / ${remainingConditions.length} `);

        const promises = chunk.map(async (cond) => {
            try {
                await generatePageDeepSeek(cond.slug, 'in', undefined, 'en');
                return { slug: cond.slug, success: true };
            } catch (e: any) {
                return { slug: cond.slug, success: false, error: e.message };
            }
        });

        const results = await Promise.all(promises);

        let chunkErrors = 0;
        results.forEach(res => {
            processedCount++;
            if (!res.success) {
                chunkErrors++;
                errors.push(`${res.slug}: ${res.error}`);
            }
        });

        if (chunkErrors > 0) {
            console.log(`❌ (${chunkErrors} errors)`);
        } else {
            console.log(`✅ Success`);
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n🎉 FINISHED. Processed ${processedCount} items.`);
    if (errors.length > 0) {
        console.log(`Encountered ${errors.length} errors. Sample:`, errors.slice(0, 10));
    }
}

main().catch(console.error);
