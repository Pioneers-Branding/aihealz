import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Patterns that indicate technical/non-patient-facing conditions
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
  /\binit\b$/i,
  /\binit for/i,
  /\bsubs for/i,
  /\bsequela\b$/i,
  /due to/i,
  /secondary to/i,
  /in diseases classified elsewhere/i,
  /following.*procedure/i,
  /postprocedural/i,
  /intraoperative/i,
  /acc pnctr/i,
  /\bextrm\b/i,
  /\blat\b$/i,
  /\brt\b$/i,
  /\blt\b$/i,
  /\bbi\b$/i,
  /\bunilat\b/i,
  /\bbilat\b/i,
  /7th[A-Z]$/,
  /\b\d+-part\b/i,
  /\bfx\b/i,  // abbreviation for fracture
  /\bhumer\b/i,
  /\bfemr\b/i,
  /\btib\b/i,
  /\bfib\b/i,
  /\bdisp\b/i,
  /\bnondisp\b/i,
  /\bsurg nk\b/i,
  /\bw delay heal\b/i,
  /\bw routn heal\b/i,
  /\bw malunion\b/i,
  /\bw nonunion\b/i,
  /\bopn fx\b/i,
  /\bclos fx\b/i,
  /\bdx imaging\b/i,
  /abnormal findings/i,
  /abnormal level/i,
  /abnormal results/i,
  /abnormal cytological/i,
  /abnormal immunological/i,
  /abnormal microbiological/i,
  /in cerebrospinal fluid/i,
  /body fluids and substances/i,
  /\beye\b$/i,  // "left eye", "right eye" variants
  /\bleg\b$/i,
  /\barm\b$/i,
  /\bhand\b$/i,
  /\bfoot\b$/i,
  /\bleft\b.*\bright\b/i,
  /\bbilateral\b/i,
  /\bunilateral\b/i,
  /\bleft eye\b/i,
  /\bright eye\b/i,
  /\bleft leg\b/i,
  /\bright leg\b/i,
  /\bleft arm\b/i,
  /\bright arm\b/i,
  /intractable/i,
  /not intractable/i,
];

// TRUE high-priority conditions - exact or near-exact matches for translation
const highPriorityExact = [
  // Cardiovascular - Core
  'Hypertension', 'High Blood Pressure', 'Heart Attack', 'Myocardial Infarction',
  'Heart Failure', 'Congestive Heart Failure', 'Atrial Fibrillation',
  'Coronary Artery Disease', 'Stroke', 'Angina', 'Arrhythmia',
  'Deep Vein Thrombosis', 'DVT', 'Pulmonary Embolism', 'Atherosclerosis',
  'Cardiomyopathy', 'Heart Murmur', 'Pericarditis', 'Endocarditis',
  'Aortic Aneurysm', 'Varicose Veins', 'Peripheral Artery Disease',

  // Respiratory
  'Asthma', 'COPD', 'Chronic Obstructive Pulmonary Disease', 'Pneumonia',
  'Bronchitis', 'Tuberculosis', 'TB', 'Lung Cancer', 'Sleep Apnea',
  'Emphysema', 'Pulmonary Fibrosis', 'Pleural Effusion', 'Bronchiectasis',
  'Respiratory Failure', 'Pulmonary Hypertension', 'Cystic Fibrosis',

  // Neurological
  'Migraine', 'Epilepsy', 'Seizure', 'Alzheimer Disease', 'Parkinson Disease',
  'Multiple Sclerosis', 'Neuropathy', 'Meningitis', 'Brain Tumor',
  'Concussion', 'Vertigo', 'Bell Palsy', 'Trigeminal Neuralgia',
  'Cerebral Palsy', 'ALS', 'Amyotrophic Lateral Sclerosis', 'Dementia',
  'Headache', 'Tension Headache', 'Cluster Headache', 'Sciatica',

  // Gastrointestinal
  'Acid Reflux', 'GERD', 'Gastroesophageal Reflux', 'Peptic Ulcer',
  'Gastric Ulcer', 'IBS', 'Irritable Bowel Syndrome', 'Crohn Disease',
  'Ulcerative Colitis', 'Hepatitis', 'Hepatitis A', 'Hepatitis B', 'Hepatitis C',
  'Cirrhosis', 'Liver Disease', 'Fatty Liver', 'Pancreatitis', 'Gallstones',
  'Cholecystitis', 'Appendicitis', 'Hemorrhoids', 'Celiac Disease',
  'Gastritis', 'Diverticulitis', 'Constipation', 'Diarrhea', 'Hernia',
  'Inguinal Hernia', 'Hiatal Hernia', 'Colon Cancer', 'Colorectal Cancer',

  // Endocrine & Metabolic
  'Diabetes', 'Type 1 Diabetes', 'Type 2 Diabetes', 'Diabetes Mellitus',
  'Hypothyroidism', 'Hyperthyroidism', 'Thyroid Disease', 'Goiter',
  'Thyroid Nodule', 'Thyroid Cancer', 'Obesity', 'Metabolic Syndrome',
  'PCOS', 'Polycystic Ovary Syndrome', 'Addison Disease', 'Cushing Syndrome',
  'Hypoglycemia', 'Hyperglycemia', 'Adrenal Insufficiency',

  // Musculoskeletal
  'Arthritis', 'Osteoarthritis', 'Rheumatoid Arthritis', 'Osteoporosis',
  'Back Pain', 'Lower Back Pain', 'Neck Pain', 'Herniated Disc', 'Scoliosis',
  'Fibromyalgia', 'Gout', 'Carpal Tunnel Syndrome', 'Tendinitis',
  'Bursitis', 'Rotator Cuff Injury', 'ACL Tear', 'Meniscus Tear',
  'Frozen Shoulder', 'Tennis Elbow', 'Plantar Fasciitis', 'Spinal Stenosis',
  'Spondylosis', 'Ankylosing Spondylitis', 'Lupus', 'Polymyalgia Rheumatica',

  // Dermatology
  'Acne', 'Acne Vulgaris', 'Eczema', 'Atopic Dermatitis', 'Psoriasis',
  'Dermatitis', 'Contact Dermatitis', 'Rosacea', 'Vitiligo', 'Skin Cancer',
  'Melanoma', 'Basal Cell Carcinoma', 'Squamous Cell Carcinoma',
  'Hives', 'Urticaria', 'Fungal Infection', 'Ringworm', 'Athletes Foot',
  'Seborrheic Dermatitis', 'Alopecia', 'Hair Loss', 'Warts', 'Moles',

  // Mental Health
  'Depression', 'Major Depression', 'Anxiety', 'Anxiety Disorder',
  'Generalized Anxiety Disorder', 'Panic Disorder', 'Bipolar Disorder',
  'Schizophrenia', 'PTSD', 'Post Traumatic Stress Disorder',
  'OCD', 'Obsessive Compulsive Disorder', 'ADHD', 'Attention Deficit Disorder',
  'Autism', 'Autism Spectrum Disorder', 'Eating Disorder', 'Anorexia',
  'Bulimia', 'Insomnia', 'Sleep Disorder', 'Substance Abuse', 'Alcoholism',

  // Cancer - Major types
  'Breast Cancer', 'Lung Cancer', 'Prostate Cancer', 'Colon Cancer',
  'Colorectal Cancer', 'Leukemia', 'Lymphoma', 'Hodgkin Lymphoma',
  'Non-Hodgkin Lymphoma', 'Ovarian Cancer', 'Pancreatic Cancer',
  'Liver Cancer', 'Kidney Cancer', 'Bladder Cancer', 'Thyroid Cancer',
  'Skin Cancer', 'Melanoma', 'Brain Cancer', 'Stomach Cancer',
  'Esophageal Cancer', 'Cervical Cancer', 'Uterine Cancer', 'Testicular Cancer',
  'Multiple Myeloma', 'Bone Cancer',

  // Kidney & Urological
  'Kidney Disease', 'Chronic Kidney Disease', 'Kidney Failure', 'Kidney Stone',
  'Nephrolithiasis', 'UTI', 'Urinary Tract Infection', 'Cystitis',
  'Prostate Enlargement', 'BPH', 'Benign Prostatic Hyperplasia',
  'Prostate Cancer', 'Incontinence', 'Urinary Incontinence',
  'Erectile Dysfunction', 'Kidney Infection', 'Pyelonephritis',

  // Eye Conditions
  'Cataract', 'Glaucoma', 'Macular Degeneration', 'Diabetic Retinopathy',
  'Conjunctivitis', 'Pink Eye', 'Dry Eye', 'Dry Eye Syndrome',
  'Retinal Detachment', 'Uveitis', 'Keratitis', 'Astigmatism',
  'Myopia', 'Hyperopia', 'Presbyopia', 'Strabismus',

  // ENT
  'Sinusitis', 'Sinus Infection', 'Tonsillitis', 'Ear Infection', 'Otitis Media',
  'Hearing Loss', 'Tinnitus', 'Vertigo', 'Laryngitis', 'Pharyngitis',
  'Strep Throat', 'Nasal Polyps', 'Deviated Septum', 'Sleep Apnea',
  'Rhinitis', 'Allergic Rhinitis', 'Hay Fever',

  // Infectious Diseases
  'COVID-19', 'Coronavirus', 'Influenza', 'Flu', 'HIV', 'AIDS',
  'Malaria', 'Dengue', 'Dengue Fever', 'Typhoid', 'Cholera',
  'Herpes', 'Shingles', 'Chickenpox', 'Measles', 'Mumps', 'Rubella',
  'Hepatitis', 'Tuberculosis', 'Pneumonia', 'Meningitis', 'Sepsis',
  'Lyme Disease', 'Rabies', 'Tetanus', 'Polio', 'Chikungunya',

  // Women's Health
  'Endometriosis', 'Uterine Fibroids', 'Fibroids', 'Menopause',
  'PCOS', 'Polycystic Ovary Syndrome', 'Ovarian Cyst', 'Cervical Cancer',
  'Breast Cancer', 'Mastitis', 'PMS', 'Premenstrual Syndrome',
  'Dysmenorrhea', 'Amenorrhea', 'Vaginitis', 'Pelvic Inflammatory Disease',
  'Ectopic Pregnancy', 'Miscarriage', 'Preeclampsia', 'Gestational Diabetes',

  // Blood & Immune
  'Anemia', 'Iron Deficiency Anemia', 'Sickle Cell Disease', 'Thalassemia',
  'Hemophilia', 'Thrombocytopenia', 'Leukemia', 'Lymphoma',
  'Allergy', 'Allergies', 'Food Allergy', 'Drug Allergy', 'Anaphylaxis',
  'Autoimmune Disease', 'Lupus', 'Rheumatoid Arthritis', 'Multiple Sclerosis',

  // Common Conditions
  'Fever', 'Cold', 'Common Cold', 'Cough', 'Sore Throat', 'Headache',
  'Fatigue', 'Chronic Fatigue', 'Pain', 'Chronic Pain', 'Inflammation',
  'Infection', 'Dehydration', 'Food Poisoning', 'Vitamin Deficiency',
];

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  console.log('=== Condition Cleanup & Prioritization ===\n');
  console.log(dryRun ? '*** DRY RUN - No changes will be made ***\n' : '*** EXECUTING CHANGES ***\n');

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

  // 1. Find duplicates - keep first, mark rest
  const nameMap = new Map<string, typeof conditions>();
  conditions.forEach(c => {
    const key = c.commonName.toLowerCase().trim();
    if (!nameMap.has(key)) {
      nameMap.set(key, []);
    }
    nameMap.get(key)!.push(c);
  });

  const duplicateIds: number[] = [];
  const duplicateInfo: { kept: any; removed: any[] }[] = [];

  Array.from(nameMap.entries())
    .filter(([_, arr]) => arr.length > 1)
    .forEach(([name, arr]) => {
      const kept = arr[0];
      const removed = arr.slice(1);
      removed.forEach(c => duplicateIds.push(c.id));
      duplicateInfo.push({ kept, removed });
    });

  console.log('\nDuplicates found:', duplicateInfo.length, 'groups,', duplicateIds.length, 'records to remove');

  // 2. Find technical conditions
  const technicalIds = conditions
    .filter(c => {
      // Skip if already marked as duplicate
      if (duplicateIds.includes(c.id)) return false;
      // Check technical patterns
      return technicalPatterns.some(p => p.test(c.commonName)) ||
        c.commonName.length > 80;
    })
    .map(c => c.id);

  console.log('Technical conditions to archive:', technicalIds.length);

  // 3. Identify main conditions (not duplicate, not technical)
  const allRemoveIds = new Set([...duplicateIds, ...technicalIds]);
  const mainConditions = conditions.filter(c => !allRemoveIds.has(c.id));

  console.log('Main conditions remaining:', mainConditions.length);

  // 4. Find high-priority conditions for translation (exact/close matches)
  const highPrioritySet = new Set(highPriorityExact.map(s => s.toLowerCase()));

  const forTranslation = mainConditions.filter(c => {
    const nameLower = c.commonName.toLowerCase().trim();
    // Exact match
    if (highPrioritySet.has(nameLower)) return true;
    // Close match (within 3 chars difference or contains exact term as whole word)
    for (const hp of highPriorityExact) {
      const hpLower = hp.toLowerCase();
      // Exact word match
      const regex = new RegExp(`\\b${hpLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(nameLower) && nameLower.length < hpLower.length + 15) {
        return true;
      }
    }
    return false;
  });

  console.log('High-priority for translation:', forTranslation.length);

  // 5. Show samples
  console.log('\n--- Sample HIGH-PRIORITY (for translation) ---');
  forTranslation.slice(0, 50).forEach(c => {
    console.log(`  - ${c.commonName}`);
  });

  // 6. Execute if not dry run
  if (!dryRun) {
    console.log('\n=== Executing Cleanup ===\n');

    // Deactivate duplicates
    if (duplicateIds.length > 0) {
      const result = await prisma.medicalCondition.updateMany({
        where: { id: { in: duplicateIds } },
        data: { isActive: false }
      });
      console.log(`Deactivated ${result.count} duplicate conditions`);
    }

    // Deactivate technical conditions
    if (technicalIds.length > 0) {
      const result = await prisma.medicalCondition.updateMany({
        where: { id: { in: technicalIds } },
        data: { isActive: false }
      });
      console.log(`Deactivated ${result.count} technical conditions`);
    }

    console.log('\nCleanup complete!');
  }

  // 7. Save translation list
  const translationList = forTranslation.map(c => ({
    id: c.id,
    slug: c.slug,
    name: c.commonName,
    specialist: c.specialistType,
  }));

  fs.writeFileSync(
    'scripts/generate-conditions/translation-priority-list.json',
    JSON.stringify({
      count: translationList.length,
      conditions: translationList,
    }, null, 2)
  );

  // 8. Save main conditions list for generation
  const generationList = mainConditions.map(c => ({
    id: c.id,
    slug: c.slug,
    name: c.commonName,
    specialist: c.specialistType,
    forTranslation: forTranslation.some(t => t.id === c.id),
  }));

  fs.writeFileSync(
    'scripts/generate-conditions/generation-list.json',
    JSON.stringify({
      total: generationList.length,
      forTranslation: forTranslation.length,
      englishOnly: generationList.length - forTranslation.length,
      conditions: generationList,
    }, null, 2)
  );

  console.log('\n=== Summary ===');
  console.log(`Total original conditions: ${conditions.length}`);
  console.log(`Duplicates removed: ${duplicateIds.length}`);
  console.log(`Technical archived: ${technicalIds.length}`);
  console.log(`Main conditions for generation: ${mainConditions.length}`);
  console.log(`High-priority for translation: ${forTranslation.length}`);
  console.log(`\nFiles saved:`);
  console.log(`  - translation-priority-list.json (${forTranslation.length} conditions)`);
  console.log(`  - generation-list.json (${mainConditions.length} conditions)`);

  if (dryRun) {
    console.log('\n*** To execute cleanup, run with --execute flag ***');
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
