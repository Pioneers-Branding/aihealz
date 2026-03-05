import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Technical/ICD-heavy patterns that patients wouldn't search for
const technicalPatterns = [
  /unspecified/i,
  /not elsewhere classified/i,
  /other specified/i,
  /w\/o mention/i,
  /w\/ mention/i,
  /\bunsp\b/i,
  /\both\b.*\bspec/i,
  /sequelae of/i,
  /encounter for/i,
  /personal history of/i,
  /status post/i,
  /\bnos\b/i,
  /\bnec\b/i,
  /without complication/i,
  /with complication/i,
  /\binitial encounter\b/i,
  /\bsubsequent encounter\b/i,
  /due to/i,
  /secondary to/i,
  /in diseases classified elsewhere/i,
  /following.*procedure/i,
  /postprocedural/i,
  /intraoperative/i,
  /acc pnctr/i,
  /\bextrm\b/i,
  /\blat\b/i,
  /\brt\b/i,
  /\blt\b/i,
  /\bbi\b/i,
  /\bunilat\b/i,
  /\bbilat\b/i,
];

// Common conditions that are highly searched (priority for translation)
const highPriorityConditions = [
  // Cardiovascular
  'hypertension', 'high blood pressure', 'heart attack', 'myocardial infarction',
  'heart failure', 'atrial fibrillation', 'coronary artery disease', 'stroke',
  'angina', 'arrhythmia', 'deep vein thrombosis', 'pulmonary embolism',

  // Respiratory
  'asthma', 'copd', 'pneumonia', 'bronchitis', 'tuberculosis', 'lung cancer',
  'sleep apnea', 'emphysema', 'pulmonary fibrosis',

  // Neurological
  'migraine', 'epilepsy', 'alzheimer', 'parkinson', 'multiple sclerosis',
  'neuropathy', 'meningitis', 'brain tumor', 'concussion', 'vertigo',

  // Gastrointestinal
  'acid reflux', 'gerd', 'ulcer', 'ibs', 'irritable bowel', 'crohn',
  'ulcerative colitis', 'hepatitis', 'cirrhosis', 'pancreatitis', 'gallstones',
  'appendicitis', 'hemorrhoids', 'celiac',

  // Endocrine
  'diabetes', 'thyroid', 'hypothyroidism', 'hyperthyroidism', 'obesity',
  'pcos', 'polycystic ovary', 'addison', 'cushing',

  // Musculoskeletal
  'arthritis', 'osteoarthritis', 'rheumatoid arthritis', 'osteoporosis',
  'back pain', 'sciatica', 'herniated disc', 'scoliosis', 'fibromyalgia',
  'gout', 'carpal tunnel', 'tendinitis', 'fracture',

  // Dermatological
  'acne', 'eczema', 'psoriasis', 'dermatitis', 'rosacea', 'vitiligo',
  'skin cancer', 'melanoma', 'hives', 'fungal infection',

  // Mental Health
  'depression', 'anxiety', 'bipolar', 'schizophrenia', 'ptsd', 'ocd',
  'adhd', 'autism', 'eating disorder', 'insomnia',

  // Cancer
  'breast cancer', 'lung cancer', 'prostate cancer', 'colon cancer',
  'leukemia', 'lymphoma', 'ovarian cancer', 'pancreatic cancer',
  'liver cancer', 'kidney cancer', 'bladder cancer', 'thyroid cancer',

  // Kidney/Urological
  'kidney disease', 'kidney failure', 'kidney stone', 'uti',
  'urinary tract infection', 'prostate', 'incontinence', 'cystitis',

  // Eye
  'cataract', 'glaucoma', 'macular degeneration', 'diabetic retinopathy',
  'conjunctivitis', 'dry eye',

  // ENT
  'sinusitis', 'tonsillitis', 'ear infection', 'hearing loss', 'tinnitus',

  // Infectious
  'covid', 'influenza', 'flu', 'hiv', 'aids', 'malaria', 'dengue',
  'typhoid', 'cholera', 'herpes', 'shingles',

  // Women's Health
  'endometriosis', 'fibroids', 'menopause', 'pcos', 'ovarian cyst',
  'breast cancer', 'cervical cancer',

  // Common conditions
  'allergy', 'anemia', 'fever', 'infection', 'inflammation',
];

async function main() {
  console.log('=== Analyzing Medical Conditions Database ===\n');

  // Get all conditions
  const conditions = await prisma.medicalCondition.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      commonName: true,
      scientificName: true,
      specialistType: true,
      severityLevel: true,
      icdCode: true,
    },
    orderBy: { commonName: 'asc' }
  });

  console.log('Total active conditions:', conditions.length);

  // 1. Find exact duplicates by commonName
  const nameMap = new Map<string, typeof conditions>();
  conditions.forEach(c => {
    const key = c.commonName.toLowerCase().trim();
    if (!nameMap.has(key)) {
      nameMap.set(key, []);
    }
    nameMap.get(key)!.push(c);
  });

  const duplicates = Array.from(nameMap.entries())
    .filter(([_, arr]) => arr.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  const duplicateIds: number[] = [];
  duplicates.forEach(([_, arr]) => {
    // Keep the first one, mark rest for removal
    arr.slice(1).forEach(c => duplicateIds.push(c.id));
  });

  console.log('\n--- DUPLICATES ---');
  console.log('Duplicate condition names:', duplicates.length);
  console.log('Total duplicate records to remove:', duplicateIds.length);
  console.log('\nTop 20 duplicates:');
  duplicates.slice(0, 20).forEach(([name, arr]) => {
    console.log(`  "${name.substring(0, 50)}": ${arr.length} entries`);
  });

  // 2. Identify technical/irrelevant conditions
  const technicalConditions = conditions.filter(c =>
    technicalPatterns.some(p => p.test(c.commonName)) ||
    c.commonName.length > 80 ||
    (c.commonName.match(/[A-Z]{3,}/g) || []).length > 2
  );

  const technicalIds = technicalConditions.map(c => c.id);

  console.log('\n--- TECHNICAL/IRRELEVANT CONDITIONS ---');
  console.log('Technical conditions to remove:', technicalConditions.length);
  console.log('\nSample technical conditions:');
  technicalConditions.slice(0, 30).forEach(c => {
    console.log(`  - ${c.commonName.substring(0, 70)}`);
  });

  // 3. Identify main searchable conditions for translation
  const mainConditions = conditions.filter(c => {
    const nameLower = c.commonName.toLowerCase();

    // Must not be technical
    if (technicalPatterns.some(p => p.test(c.commonName))) return false;

    // Must not be too long
    if (c.commonName.length > 60) return false;

    // Must not have too many abbreviations
    if ((c.commonName.match(/[A-Z]{3,}/g) || []).length > 1) return false;

    // Bonus: matches high priority keywords
    const isHighPriority = highPriorityConditions.some(kw =>
      nameLower.includes(kw.toLowerCase())
    );

    return true;
  });

  // Separate high priority (for translation) from others
  const forTranslation = mainConditions.filter(c => {
    const nameLower = c.commonName.toLowerCase();
    return highPriorityConditions.some(kw => nameLower.includes(kw.toLowerCase()));
  });

  const forGenerationOnly = mainConditions.filter(c => {
    const nameLower = c.commonName.toLowerCase();
    return !highPriorityConditions.some(kw => nameLower.includes(kw.toLowerCase()));
  });

  console.log('\n--- CATEGORIZATION SUMMARY ---');
  console.log('Main searchable conditions:', mainConditions.length);
  console.log('  - High priority (for translation):', forTranslation.length);
  console.log('  - Standard (English only):', forGenerationOnly.length);

  console.log('\n--- HIGH PRIORITY CONDITIONS (for translation) ---');
  console.log('Sample (first 50):');
  forTranslation.slice(0, 50).forEach(c => {
    console.log(`  - ${c.commonName} [${c.specialistType}]`);
  });

  // 4. Summary stats by specialty
  const bySpecialty = new Map<string, number>();
  mainConditions.forEach(c => {
    const spec = c.specialistType || 'Unknown';
    bySpecialty.set(spec, (bySpecialty.get(spec) || 0) + 1);
  });

  console.log('\n--- BY SPECIALTY (main conditions) ---');
  Array.from(bySpecialty.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([spec, count]) => {
      console.log(`  ${spec}: ${count}`);
    });

  // 5. Save lists to files
  const output = {
    summary: {
      totalConditions: conditions.length,
      duplicatesToRemove: duplicateIds.length,
      technicalToRemove: technicalIds.length,
      mainSearchable: mainConditions.length,
      forTranslation: forTranslation.length,
      forEnglishOnly: forGenerationOnly.length,
    },
    duplicateIds,
    technicalIds,
    forTranslation: forTranslation.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.commonName,
      specialist: c.specialistType,
    })),
    forGenerationOnly: forGenerationOnly.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.commonName,
      specialist: c.specialistType,
    })),
  };

  fs.writeFileSync(
    'scripts/generate-conditions/condition-analysis.json',
    JSON.stringify(output, null, 2)
  );

  console.log('\n=== Analysis saved to condition-analysis.json ===');
  console.log('\nRecommended actions:');
  console.log(`  1. Remove ${duplicateIds.length} duplicate records`);
  console.log(`  2. Remove/archive ${technicalIds.length} technical conditions`);
  console.log(`  3. Generate content for ${mainConditions.length} main conditions`);
  console.log(`  4. Translate ${forTranslation.length} high-priority conditions`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
