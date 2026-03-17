import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { generateConditionContent, saveConditionContent } from './index';
import type { MedicalConditionInput } from './templates/base-template';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== Generating Missing Content ===\n');

  // Find conditions without content
  const missingConditions = await prisma.medicalCondition.findMany({
    where: {
      isActive: true,
      pageContent: { none: {} }
    },
    orderBy: { commonName: 'asc' }
  });

  console.log(`Found ${missingConditions.length} conditions without content\n`);

  let success = 0;
  let failed = 0;

  for (const condition of missingConditions) {
    const input: MedicalConditionInput = {
      id: condition.id,
      slug: condition.slug,
      scientificName: condition.scientificName,
      commonName: condition.commonName,
      description: condition.description,
      symptoms: condition.symptoms as string[],
      treatments: condition.treatments as string[],
      faqs: condition.faqs as { question: string; answer: string }[],
      specialistType: condition.specialistType,
      severityLevel: condition.severityLevel,
      icdCode: condition.icdCode,
      bodySystem: condition.bodySystem,
    };

    try {
      const content = await generateConditionContent(input);
      await saveConditionContent(content);
      console.log(`  ✓ ${condition.slug} - ${content.wordCount} words`);
      success++;
    } catch (err: any) {
      console.log(`  ✗ ${condition.slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
