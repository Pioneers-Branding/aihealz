import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const conditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            specialistType: {
                contains: 'Neurolog',
                mode: 'insensitive'
            }
        },
        select: { slug: true, commonName: true }
    });
    console.log(`Found ${conditions.length} Neurological conditions.`);
    for (const c of conditions.slice(0, 5)) {
        console.log(`- ${c.slug}: ${c.commonName}`);
    }
}
main().finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
