import prisma from './src/lib/db';
async function main() {
    const indias = await prisma.geography.findMany({ where: { slug: 'india' }});
    console.log("India entries:", JSON.stringify(indias, null, 2));
    if (indias.length > 1) {
        console.log("Deleting duplicate:", indias[1].id);
        await prisma.geography.delete({ where: { id: indias[1].id }});
        console.log("Deleted");
    }
}
main().catch(console.error).finally(() => process.exit(0));
