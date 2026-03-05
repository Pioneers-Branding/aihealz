
import { PrismaClient } from '@prisma/client';

async function main() {
    console.log('Attempting to instantiate PrismaClient...');
    try {
        const prisma = new PrismaClient({});
        console.log('Success!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Failure:', e);
    }
}

main();
