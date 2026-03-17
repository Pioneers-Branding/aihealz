import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Connecting to:', connectionString);
    
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('Attempting groupBy on medicalCondition...');
        const rawSpecialties = await prisma.medicalCondition.groupBy({
            by: ['specialistType'],
            where: { isActive: true },
            _count: { _all: true },
        });
        console.log('Success!', rawSpecialties);
    } catch (e: any) {
        console.error('Failure Code:', e.code);
        console.error('Failure Message:', e.message);
        if (e.meta) console.error('Meta:', e.meta);
    } finally {
        await prisma.$disconnect();
    }
}

main();
