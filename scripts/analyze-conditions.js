const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const conditions = await prisma.medicalCondition.findMany({
        select: { slug: true, commonName: true, medicalName: true, specialistType: true },
        where: { isActive: true }
    });

    const output = [];
    output.push(`Total Active Conditions: ${conditions.length}`);

    let technicalCount = 0;
    for (const c of conditions) {
        if (c.commonName === c.medicalName && c.medicalName && c.medicalName.length > 10) {
            if (technicalCount < 20) {
                output.push(`Technical: ${c.commonName} (slug: ${c.slug}, specialty: ${c.specialistType})`);
            }
            technicalCount++;
        }
    }
    output.push(`Found ${technicalCount} conditions and they might need simplified names.`);

    const treatments = await prisma.treatment.count();
    output.push(`Total Treatments in database: ${treatments}`);

    const conditionsWithTreatments = await prisma.medicalCondition.count({
        where: { isActive: true, treatments: { some: {} } }
    });
    output.push(`Active Conditions with at least one treatment: ${conditionsWithTreatments}`);
    output.push(`Conditions WITHOUT treatments: ${conditions.length - conditionsWithTreatments}`);

    console.log(output.join('\n'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
