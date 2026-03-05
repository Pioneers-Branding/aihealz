import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
    const conditions = await prisma.medicalCondition.findMany({
        select: { id: true, slug: true, commonName: true, scientificName: true, specialistType: true },
        where: { isActive: true }
    });

    const output = [];
    output.push(`Total Active Conditions: ${conditions.length}`);

    let technicalConditions = [];
    for (const c of conditions) {
        // If the commonName equals the scientificName and is long, it's likely too technical
        if (c.commonName === c.scientificName && c.scientificName && c.scientificName.length > 8) {
            technicalConditions.push(c);
        }
    }

    // Also find conditions with complex words
    const technicalWords = ['oma', 'itis', 'osis', 'opathy', 'algia', 'emia', 'dys', 'hyper', 'hypo', 'syndrome'];
    for (const c of conditions) {
        if (!technicalConditions.includes(c)) {
            const lowerName = c.commonName.toLowerCase();
            if (technicalWords.some(w => lowerName.includes(w)) && c.commonName.split(' ').length <= 2) {
                technicalConditions.push(c);
            }
        }
    }

    output.push(`\nFound ${technicalConditions.length} conditions that might need simplified names.`);
    technicalConditions.slice(0, 30).forEach(c => {
        output.push(`- ${c.commonName} (slug: ${c.slug}, specialty: ${c.specialistType})`);
    });

    // Count remaining pages to be added. 
    // Probably referring to LocalizedContent for 'en' taking the role of "condition treatment pages".
    const contentPieces = await prisma.localizedContent.findMany({
        select: { conditionId: true, status: true }
    });

    const conditionsWithContent = new Set(contentPieces.map(c => c.conditionId));
    output.push(`\nConditions with Localized Content: ${conditionsWithContent.size}`);
    output.push(`Conditions MISSING Content (Remaining pages to be added): ${conditions.length - conditionsWithContent.size}`);

    console.log(output.join('\n'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
