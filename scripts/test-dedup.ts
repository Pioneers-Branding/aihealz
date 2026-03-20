import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

function deduplicateConditions(conditions: any[]): any[] {
    const seen = new Map<string, any>();
    for (const c of conditions) {
        const baseKey = c.commonName
            .toLowerCase()
            .replace(/\b(left|right|bilateral|unspecified|unsp)\b/gi, '')
            .replace(/\b(proximal|distal|prox|dist)\b/gi, '')
            .replace(/\b(of r |of l |, bi|, l |, r )\b/gi, ' ')
            .replace(/\b(upper|lower|up|low)\s*(extremity|extrm|extrem)\b/gi, 'extremity')
            .replace(/\b(femoral|popliteal|tibial|iliac|axillary|subclavian|jugular)\s*(vein)?\b/gi, '')
            .replace(/[,()]/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
        if (!seen.has(baseKey)) seen.set(baseKey, c);
    }
    return [...seen.values()].sort((a: any, b: any) => a.commonName.localeCompare(b.commonName));
}

async function main() {
    const raw = await p.medicalCondition.findMany({
        where: { isActive: true, specialistType: { contains: 'cardio', mode: 'insensitive' } },
        select: { id: true, commonName: true, slug: true, description: true, icdCode: true },
        orderBy: { commonName: 'asc' },
    });

    const deduped = deduplicateConditions(raw);
    console.log(`Before: ${raw.length} conditions`);
    console.log(`After:  ${deduped.length} conditions`);
    console.log(`Removed: ${raw.length - deduped.length} duplicates (${((raw.length - deduped.length) / raw.length * 100).toFixed(1)}%)\n`);

    console.log('First 30 deduplicated conditions:');
    for (const c of deduped.slice(0, 30)) {
        console.log(`  ${c.commonName}`);
    }
}

main().catch(console.error).finally(async () => { await p.$disconnect(); pool.end(); });
