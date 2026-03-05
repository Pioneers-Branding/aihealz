import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
    console.log('Fetching active conditions...');
    const conditions = await prisma.medicalCondition.findMany({
        select: { id: true, slug: true, commonName: true, scientificName: true },
        where: { isActive: true }
    });

    console.log(`Found ${conditions.length} active conditions. Starting name simplification...`);

    let updateCount = 0;
    const BATCH_SIZE = 1000;
    const updates: any[] = [];

    for (const c of conditions) {
        let newName = c.commonName;

        // Common ICD-10 Jargon Replacements
        newName = newName.replace(/, unspecified site/gi, '');
        newName = newName.replace(/, unspecified/gi, '');
        newName = newName.replace(/unspecified/gi, '');
        newName = newName.replace(/due to.*$/gi, ''); // Removes "due to [bacteria]"
        newName = newName.replace(/\(.*?\)/g, ''); // Removes parenthetical notes like (acute)
        newName = newName.replace(/, other/gi, '');
        newName = newName.replace(/other specified/gi, '');
        newName = newName.replace(/not elsewhere classified/gi, '');
        newName = newName.replace(/in diseases classified elsewhere/gi, '');
        newName = newName.replace(/without complication/gi, '');
        newName = newName.replace(/with \w+ complication/gi, '');
        newName = newName.replace(/,\s+$/g, ''); // remove trailing comma

        // Clean up extra whitespace and capitalize
        newName = newName.trim();
        if (newName.length > 0) {
            newName = newName.charAt(0).toUpperCase() + newName.slice(1);
        }

        // In case there was a complete removal (unlikely but possible), fallback to original
        if (!newName) {
            newName = c.commonName;
        }

        if (newName !== c.commonName) {
            updates.push(prisma.medicalCondition.update({
                where: { id: c.id },
                data: { commonName: newName }
            }));
            updateCount++;
        }
    }

    console.log(`Prepared ${updateCount} condition name updates. Executing in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        try {
            await prisma.$transaction(batch);
            console.log(`Successfully updated batch ${i / BATCH_SIZE + 1} / ${Math.ceil(updates.length / BATCH_SIZE)}`);
        } catch (e) {
            console.error(`Error updating batch ${i / BATCH_SIZE + 1}:`, e);
        }
    }

    console.log('Simplification complete!\n');

    // Verify
    const sample = await prisma.medicalCondition.findMany({
        select: { commonName: true, scientificName: true },
        take: 10,
        orderBy: { commonName: 'asc' }
    });
    console.log("Sample of names after conversion:");
    console.log(JSON.stringify(sample, null, 2));

}

main().catch(console.error).finally(() => prisma.$disconnect());
