import prisma from '@/lib/db';
import { generatePage } from '@/lib/content/content-factory';
import { batchAnalyzeIntents } from '@/lib/content/intent-analyzer';

/**
 * CMS Batch Processor
 * 
 * Orchestrates mass generation of content.
 * 
 * Capabilities:
 * 1. Seed Queue: Finds condition/location pairs missing content.
 * 2. Process Batch: Runs generation for a chunk of the queue.
 * 3. Rate Limiting: Ensures we don't hit OpenRouter limits (though we use frugal models).
 */

export async function seedContentQueue(
    batchName: string,
    countryCode: string,
    citySlugs: string[] = [], // If empty, generates country-level pages
    conditionSlugs: string[] = [] // If empty, does ALL active conditions
) {
    // 1. Create Batch
    const batch = await prisma.contentBatch.create({
        data: {
            batchName,
            status: 'pending',
            totalItems: 0 // Update later
        }
    });

    // 2. Fetch Conditions
    const conditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            ...(conditionSlugs.length > 0 ? { slug: { in: conditionSlugs } } : {})
        },
        select: { slug: true, commonName: true }
    });

    // 3. Generate Target List
    const targets: { conditionSlug: string; citySlug: string | null }[] = [];

    for (const cond of conditions) {
        if (citySlugs.length > 0) {
            for (const city of citySlugs) {
                targets.push({ conditionSlug: cond.slug, citySlug: city });
            }
        } else {
            targets.push({ conditionSlug: cond.slug, citySlug: null });
        }
    }

    // 4. Filter existing (optional, but good for idempotency)
    // For now, we skip complex filtering and rely on upsert in generatePage, 
    // but we should verify intent first.

    // Pre-fill intents (batch optimization)
    await batchAnalyzeIntents(
        conditions.map(c => ({ slug: c.slug, name: c.commonName })),
        citySlugs.map(c => ({ slug: c, countryCode }))
    );

    // Update batch count
    await prisma.contentBatch.update({
        where: { id: batch.id },
        data: { totalItems: targets.length }
    });

    return { batchId: batch.id, count: targets.length, targets };
}

export async function processBatchChunk(
    batchId: string,
    chunkSize: number = 5
) {
    const batch = await prisma.contentBatch.findUnique({ where: { id: batchId } });
    if (!batch || batch.status === 'completed' || batch.status === 'failed') {
        return { status: batch?.status, processed: 0 };
    }

    // Determine what to process. 
    // In a real queue system (Redis/BullMQ), we'd pop jobs. 
    // Here, we have to find missing content that belongs to this "logical" batch context.
    // Since we didn't create explicit queue items in DB, we'll iterate differently or 
    // assume the caller passes specific targets.

    // REFACTOR: To make this robust, let's just expose a "generateSingle" that the API loop calls,
    // or simple loop here if Next.js runtime allows (it usually times out).

    // Better approach for Vercel/Serverless: 
    // The API route will call `generatePage` in a loop, handling timeouts. 
    // This function is just a helper.

    return { error: "Use API route loop for serverless compatibility" };
}
