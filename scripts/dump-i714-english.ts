import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  const c = await p.conditionPageContent.findFirst({
    where: { condition: { slug: 'abdominal-aortic-aneurysm-without-rupture-i714' }, languageCode: 'en' }
  });
  if (c) {
    fs.writeFileSync('scripts/i714-english.json', JSON.stringify({
      conditionId: c.conditionId,
      h1Title: c.h1Title,
      heroOverview: c.heroOverview,
      definition: c.definition,
      diagnosisOverview: c.diagnosisOverview,
      treatmentOverview: c.treatmentOverview,
      prognosis: c.prognosis,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      whySeeSpecialist: c.whySeeSpecialist,
      primarySymptoms: c.primarySymptoms,
      earlyWarningSigns: c.earlyWarningSigns,
      preventionStrategies: c.preventionStrategies,
      complications: c.complications,
      faqs: c.faqs,
      // Keep as-is (structured data)
      keyStats: c.keyStats,
      typesClassification: c.typesClassification,
      emergencySigns: c.emergencySigns,
      causes: c.causes,
      riskFactors: c.riskFactors,
      diagnosticTests: c.diagnosticTests,
      medicalTreatments: c.medicalTreatments,
      surgicalOptions: c.surgicalOptions,
      lifestyleModifications: c.lifestyleModifications,
      dietRecommendations: c.dietRecommendations,
      hospitalCriteria: c.hospitalCriteria,
      keywords: c.keywords,
      specialistType: c.specialistType,
      wordCount: c.wordCount,
    }, null, 2));
    console.log('Dumped to scripts/i714-english.json');
  }
  await p.$disconnect(); pool.end();
}
main();
