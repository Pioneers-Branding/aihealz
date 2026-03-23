import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

function getBaseKey(name: string): string {
    return name
        .toLowerCase()
        .replace(/\b(left|right|bilateral|unspecified|unsp)\b/gi, '')
        .replace(/\b(proximal|distal|prox|dist)\b/gi, '')
        .replace(/\b(of r |of l |, bi|, l |, r )\b/gi, ' ')
        .replace(/\b(upper|lower|up|low)\s*(extremity|extrm|extrem)\b/gi, 'extremity')
        .replace(/\b(femoral|popliteal|tibial|iliac|axillary|subclavian|jugular)\s*(vein)?\b/gi, '')
        .replace(/[,()]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

async function main() {
    // Get ALL active conditions (not just cardiology — dedup globally)
    const allConditions = await p.medicalCondition.findMany({
        where: { isActive: true },
        select: { id: true, commonName: true, slug: true, icdCode: true, specialistType: true },
        orderBy: { commonName: 'asc' },
    });

    console.log(`Total active conditions: ${allConditions.length}`);

    // Group by base key
    const groups = new Map<string, typeof allConditions>();
    for (const c of allConditions) {
        const key = getBaseKey(c.commonName);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(c);
    }

    // Find groups with duplicates and pick the "best" one to keep
    const toDeactivate: number[] = [];
    let dupeGroupCount = 0;

    for (const [key, group] of groups) {
        if (group.length <= 1) continue;
        dupeGroupCount++;

        // Keep the one with the shortest/cleanest name (most general)
        // Prefer names without "left", "right", "bilateral", "unsp"
        const sorted = [...group].sort((a, b) => {
            const aHasLaterality = /\b(left|right|bilateral|unsp|unspecified)\b/i.test(a.commonName);
            const bHasLaterality = /\b(left|right|bilateral|unsp|unspecified)\b/i.test(b.commonName);
            if (aHasLaterality && !bHasLaterality) return 1;
            if (!aHasLaterality && bHasLaterality) return -1;
            return a.commonName.length - b.commonName.length; // shorter = more general
        });

        const keep = sorted[0];
        const remove = sorted.slice(1);

        if (dupeGroupCount <= 10) {
            console.log(`\n  Group: "${key}"`);
            console.log(`    Keep: "${keep.commonName}" (${keep.slug})`);
            for (const r of remove) {
                console.log(`    Remove: "${r.commonName}" (${r.slug})`);
            }
        }

        toDeactivate.push(...remove.map(r => r.id));
    }

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`Duplicate groups: ${dupeGroupCount}`);
    console.log(`Conditions to deactivate: ${toDeactivate.length}`);
    console.log(`Will remain active: ${allConditions.length - toDeactivate.length}`);
    console.log(`${'═'.repeat(50)}`);

    if (toDeactivate.length === 0) {
        console.log('\nNo duplicates to remove.');
        return;
    }

    // Deactivate duplicates in batches
    console.log('\nDeactivating duplicates...');
    const batchSize = 500;
    let deactivated = 0;
    for (let i = 0; i < toDeactivate.length; i += batchSize) {
        const batch = toDeactivate.slice(i, i + batchSize);
        const result = await p.medicalCondition.updateMany({
            where: { id: { in: batch } },
            data: { isActive: false },
        });
        deactivated += result.count;
        console.log(`  Batch ${Math.floor(i / batchSize) + 1}: deactivated ${result.count}`);
    }

    console.log(`\n✅ Total deactivated: ${deactivated}`);

    // Verify final count
    const remaining = await p.medicalCondition.count({ where: { isActive: true } });
    console.log(`📊 Remaining active conditions: ${remaining}`);
}

main()
    .catch(console.error)
    .finally(async () => { await p.$disconnect(); pool.end(); });
