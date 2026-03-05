import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
    const count = await prisma.medicalCondition.count();
    console.log(`\n\n=== TOTAL CONDITIONS IN DB: ${count} ===\n\n`);
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
