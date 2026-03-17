import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generatePage } from '@/lib/content/content-factory';
import { seedContentQueue } from '@/lib/cms/batch-processor';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * API: /api/admin/content-generator
 *
 * Query Params:
 * - action: 'seed' | 'process'
 * - batchId: (for process)
 * - limit: (for process, default 5)
 * - country: (for seed)
 * - cities: (comma sep, for seed)
 * - conditions: (comma sep, for seed)
 *
 * Requires admin authentication.
 */

export async function POST(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { action, batchId, limit = 5, country, cities, conditions } = await req.json();

        // ─── ACTION: SEED ─────────────────────────────────────────
        if (action === 'seed') {
            const cityList = cities ? cities.split(',').map((s: string) => s.trim()) : [];
            const conditionList = conditions ? conditions.split(',').map((s: string) => s.trim()) : [];

            const result = await seedContentQueue(
                `Batch-${new Date().toISOString()}`,
                country || 'in',
                cityList,
                conditionList
            );

            return NextResponse.json(result);
        }

        // ─── ACTION: PROCESS ──────────────────────────────────────
        if (action === 'process') {
            // In a real app with queues, we'd pop from Redis.
            // Here, we'll find items in `condition_content` that are missing or stale?
            // actually, the seed function didn't create rows.

            // Let's implement a simpler "Just Do It" mode for the prototype.
            // User provides: conditionSlug, country, city
            // We generate usage.

            if (!conditions || !country) {
                return NextResponse.json({ error: "Missing params for direct process" }, { status: 400 });
            }

            const conditionSlug = conditions; // Single for now in this simple loop
            const citySlug = cities ? cities.split(',')[0] : undefined;

            const page = await generatePage(conditionSlug, country, citySlug);

            return NextResponse.json({
                success: true,
                pageId: page.id,
                title: page.h1Title,
                url: `/${country}/en/${conditionSlug}/${citySlug ? citySlug : ''}`
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: unknown) {
        console.error('Content Gen API Error:', error);
        const message = error instanceof Error ? error.message : 'Content generation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
