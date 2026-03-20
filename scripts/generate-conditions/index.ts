/**
 * Condition Page Content Generator
 *
 * Main orchestrator for generating comprehensive SEO-optimized content
 * for 50k+ condition pages across 47 medical specialties.
 *
 * Usage:
 *   npx tsx scripts/generate-conditions --specialty=Cardiology
 *   npx tsx scripts/generate-conditions --all --concurrency=5
 *   npx tsx scripts/generate-conditions --conditions=diabetes,hypertension
 *   npx tsx scripts/generate-conditions --resume
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  type MedicalConditionInput,
  type ConditionPageContent,
  type GenerationContext,
  calculateWordCount,
  calculateQualityScore,
  determineStatus,
  generateMetaTitle,
  generateMetaDescription,
  generateCanonicalUrl,
  VERSION,
} from './templates/base-template';
import { getSpecialtyTemplate, normalizeSpecialty } from './templates';
import { generateSymptoms } from './generators/symptoms-generator';
import { generateTreatments } from './generators/treatment-generator';
import { generateFAQs } from './generators/faq-generator';
import { generateSchemas } from './generators/schema-generator';
import { generateCosts } from './generators/cost-generator';

// Initialize Prisma with pg adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export interface GenerationOptions {
  specialty?: string;
  conditions?: string[];
  all?: boolean;
  concurrency?: number;
  resume?: boolean;
  dryRun?: boolean;
  language?: string;
}

export interface GenerationResult {
  success: boolean;
  conditionSlug: string;
  wordCount: number;
  qualityScore: number;
  status: 'draft' | 'review' | 'published';
  error?: string;
}

export interface GenerationProgress {
  totalConditions: number;
  processed: number;
  successful: number;
  failed: number;
  lastProcessedSlug?: string;
  lastProcessedAt?: string;
  errors: { slug: string; error: string }[];
}

/**
 * Generate content for a single condition
 */
export async function generateConditionContent(
  condition: MedicalConditionInput,
  language: string = 'en',
  location?: { country: string; city?: string }
): Promise<ConditionPageContent> {
  // Get specialty template
  if (!condition.specialistType) {
    throw new Error(`Condition ${condition.slug} is missing specialistType`);
  }

  const normalizedSpecialty = normalizeSpecialty(condition.specialistType);
  const specialty = await getSpecialtyTemplate(normalizedSpecialty, language);

  if (!specialty) {
    throw new Error(`No template found for specialty: ${condition.specialistType} (normalized: ${normalizedSpecialty})`);
  }

  if (!specialty.specialistTitle || !specialty.bodySystem) {
    throw new Error(`Template for ${normalizedSpecialty} is missing required properties`);
  }

  // Create generation context
  const context: GenerationContext = {
    condition,
    specialty,
    location,
    language,
  };

  // Generate all sections
  const symptoms = generateSymptoms(context);
  const treatments = generateTreatments(context);
  const faqs = generateFAQs(context);
  const costs = generateCosts(context);

  // Build content object
  const content: Partial<ConditionPageContent> = {
    conditionId: condition.id,
    conditionSlug: condition.slug,
    languageCode: language,

    // Hero Section
    h1Title: generateH1Title(condition, location),
    heroOverview: generateHeroOverview(condition, specialty),
    keyStats: generateKeyStats(condition),

    // Section 1: Overview
    definition: generateDefinition(condition, specialty),
    typesClassification: generateTypesClassification(condition),

    // Section 2: Symptoms
    primarySymptoms: symptoms.primarySymptoms,
    earlyWarningSigns: symptoms.earlyWarningSigns,
    emergencySigns: symptoms.emergencySigns,

    // Section 3: Causes & Risk Factors
    causes: generateCauses(condition, specialty),
    riskFactors: specialty.commonRiskFactors.slice(0, 10),
    affectedDemographics: generateAffectedDemographics(condition),

    // Section 4: Diagnosis
    diagnosisOverview: generateDiagnosisOverview(condition, specialty),
    diagnosticTests: specialty.commonDiagnosticTests.slice(0, 8),

    // Section 5: Treatments
    treatmentOverview: treatments.treatmentOverview,
    medicalTreatments: treatments.medicalTreatments,
    surgicalOptions: treatments.surgicalOptions,
    alternativeTreatments: treatments.alternativeTreatments,
    linkedTreatmentSlugs: treatments.linkedTreatmentSlugs,

    // Section 6: Doctors
    specialistType: specialty.specialistTitle,
    whySeeSpecialist: generateWhySeeSpecialist(condition, specialty),
    doctorSelectionGuide: generateDoctorSelectionGuide(specialty),

    // Section 7: Hospitals
    hospitalCriteria: generateHospitalCriteria(specialty),
    keyFacilities: generateKeyFacilities(specialty),

    // Section 8: Costs
    costBreakdown: costs.costBreakdown,
    insuranceGuide: costs.insuranceGuide,
    financialAssistance: costs.financialAssistance,

    // Section 9: Prevention & Lifestyle
    preventionStrategies: generatePreventionStrategies(condition, specialty),
    lifestyleModifications: specialty.lifestyleRecommendations.slice(0, 10),
    dietRecommendations: specialty.dietPatterns.recommended.slice(0, 8),
    exerciseGuidelines: generateExerciseGuidelines(condition, specialty),

    // Section 10: Living With
    dailyManagement: generateDailyManagement(condition, specialty),
    prognosis: generatePrognosis(condition),
    recoveryTimeline: generateRecoveryTimeline(condition),
    complications: generateComplications(condition, specialty),
    supportResources: generateSupportResources(condition),

    // Section 11: Related Conditions
    confusedWithConditions: [],
    coOccurringConditions: [],
    relatedConditions: [],

    // Section 12: FAQs
    faqs: faqs.faqs,

    // SEO Meta
    metaTitle: generateMetaTitle(condition.commonName, specialty.specialistTitle, location?.city),
    metaDescription: generateMetaDescription(condition.commonName, specialty.specialistTitle, location?.city),
    canonicalUrl: generateCanonicalUrl(condition.slug),
    keywords: generateKeywords(condition, specialty, location),

    // EEAT
    sources: generateSources(condition),

    // Status
    generationVersion: VERSION,
  };

  // Calculate quality metrics
  content.wordCount = calculateWordCount(content);
  content.qualityScore = calculateQualityScore(content);
  content.status = determineStatus(content.qualityScore);

  // Generate schema markup
  const schemas = generateSchemas(content, condition);
  content.schemaMedicalCondition = schemas.schemaMedicalCondition;
  content.schemaFaqPage = schemas.schemaFaqPage;
  content.schemaBreadcrumb = schemas.schemaBreadcrumb;
  content.schemaHowTo = schemas.schemaHowTo;

  return content as ConditionPageContent;
}

/**
 * Save generated content to database
 */
export async function saveConditionContent(
  content: ConditionPageContent
): Promise<void> {
  await prisma.conditionPageContent.upsert({
    where: {
      conditionId_languageCode: {
        conditionId: content.conditionId,
        languageCode: content.languageCode,
      },
    },
    create: {
      conditionId: content.conditionId,
      languageCode: content.languageCode,
      h1Title: content.h1Title,
      heroOverview: content.heroOverview,
      keyStats: content.keyStats,
      definition: content.definition,
      typesClassification: content.typesClassification,
      primarySymptoms: content.primarySymptoms,
      earlyWarningSigns: content.earlyWarningSigns,
      emergencySigns: content.emergencySigns,
      causes: content.causes,
      riskFactors: content.riskFactors,
      affectedDemographics: content.affectedDemographics,
      diagnosisOverview: content.diagnosisOverview,
      diagnosticTests: content.diagnosticTests,
      treatmentOverview: content.treatmentOverview,
      medicalTreatments: content.medicalTreatments,
      surgicalOptions: content.surgicalOptions,
      alternativeTreatments: content.alternativeTreatments,
      linkedTreatmentSlugs: content.linkedTreatmentSlugs,
      specialistType: content.specialistType,
      whySeeSpecialist: content.whySeeSpecialist,
      doctorSelectionGuide: content.doctorSelectionGuide,
      hospitalCriteria: content.hospitalCriteria,
      keyFacilities: content.keyFacilities,
      costBreakdown: content.costBreakdown,
      insuranceGuide: content.insuranceGuide,
      financialAssistance: content.financialAssistance,
      preventionStrategies: content.preventionStrategies,
      lifestyleModifications: content.lifestyleModifications,
      dietRecommendations: content.dietRecommendations,
      exerciseGuidelines: content.exerciseGuidelines,
      dailyManagement: content.dailyManagement,
      prognosis: content.prognosis,
      recoveryTimeline: content.recoveryTimeline,
      complications: content.complications,
      supportResources: content.supportResources,
      confusedWithConditions: content.confusedWithConditions,
      coOccurringConditions: content.coOccurringConditions,
      relatedConditions: content.relatedConditions,
      faqs: content.faqs,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
      canonicalUrl: content.canonicalUrl,
      keywords: content.keywords,
      sources: content.sources,
      schemaMedicalCondition: content.schemaMedicalCondition,
      schemaFaqPage: content.schemaFaqPage,
      schemaBreadcrumb: content.schemaBreadcrumb,
      schemaHowTo: content.schemaHowTo,
      status: content.status,
      qualityScore: content.qualityScore,
      wordCount: content.wordCount,
      generationVersion: content.generationVersion,
    },
    update: {
      h1Title: content.h1Title,
      heroOverview: content.heroOverview,
      keyStats: content.keyStats,
      definition: content.definition,
      typesClassification: content.typesClassification,
      primarySymptoms: content.primarySymptoms,
      earlyWarningSigns: content.earlyWarningSigns,
      emergencySigns: content.emergencySigns,
      causes: content.causes,
      riskFactors: content.riskFactors,
      affectedDemographics: content.affectedDemographics,
      diagnosisOverview: content.diagnosisOverview,
      diagnosticTests: content.diagnosticTests,
      treatmentOverview: content.treatmentOverview,
      medicalTreatments: content.medicalTreatments,
      surgicalOptions: content.surgicalOptions,
      alternativeTreatments: content.alternativeTreatments,
      linkedTreatmentSlugs: content.linkedTreatmentSlugs,
      specialistType: content.specialistType,
      whySeeSpecialist: content.whySeeSpecialist,
      doctorSelectionGuide: content.doctorSelectionGuide,
      hospitalCriteria: content.hospitalCriteria,
      keyFacilities: content.keyFacilities,
      costBreakdown: content.costBreakdown,
      insuranceGuide: content.insuranceGuide,
      financialAssistance: content.financialAssistance,
      preventionStrategies: content.preventionStrategies,
      lifestyleModifications: content.lifestyleModifications,
      dietRecommendations: content.dietRecommendations,
      exerciseGuidelines: content.exerciseGuidelines,
      dailyManagement: content.dailyManagement,
      prognosis: content.prognosis,
      recoveryTimeline: content.recoveryTimeline,
      complications: content.complications,
      supportResources: content.supportResources,
      confusedWithConditions: content.confusedWithConditions,
      coOccurringConditions: content.coOccurringConditions,
      relatedConditions: content.relatedConditions,
      faqs: content.faqs,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
      canonicalUrl: content.canonicalUrl,
      keywords: content.keywords,
      sources: content.sources,
      schemaMedicalCondition: content.schemaMedicalCondition,
      schemaFaqPage: content.schemaFaqPage,
      schemaBreadcrumb: content.schemaBreadcrumb,
      schemaHowTo: content.schemaHowTo,
      status: content.status,
      qualityScore: content.qualityScore,
      wordCount: content.wordCount,
      generationVersion: content.generationVersion,
      updatedAt: new Date(),
    },
  });
}

/**
 * Fetch conditions from database
 */
export async function fetchConditions(
  options: GenerationOptions
): Promise<MedicalConditionInput[]> {
  const where: any = { isActive: true };

  if (options.specialty) {
    where.specialistType = options.specialty;
  }

  if (options.conditions && options.conditions.length > 0) {
    where.slug = { in: options.conditions };
  }

  const conditions = await prisma.medicalCondition.findMany({
    where,
    orderBy: [{ specialistType: 'asc' }, { commonName: 'asc' }],
  });

  return conditions.map(c => ({
    id: c.id,
    slug: c.slug,
    scientificName: c.scientificName,
    commonName: c.commonName,
    description: c.description,
    symptoms: c.symptoms as string[],
    treatments: c.treatments as string[],
    faqs: c.faqs as { question: string; answer: string }[],
    specialistType: c.specialistType,
    severityLevel: c.severityLevel,
    icdCode: c.icdCode,
    bodySystem: c.bodySystem,
  }));
}

// ============================================================================
// CONTENT GENERATION HELPERS
// ============================================================================

function generateH1Title(
  condition: MedicalConditionInput,
  location?: { country: string; city?: string }
): string {
  const locationPart = location?.city ? ` in ${formatLocationName(location.city)}` : '';
  return `${condition.commonName} Treatment${locationPart} - Expert Care Guide`;
}

function generateHeroOverview(
  condition: MedicalConditionInput,
  specialty: any
): string {
  const description = condition.description || `${condition.commonName} is a condition affecting the ${condition.bodySystem || 'body'}`;
  return `${description}. Our comprehensive guide covers symptoms, causes, diagnosis, and treatment options. Find expert ${specialty.specialistTitlePlural.toLowerCase()} and hospitals for the best care.`;
}

function generateKeyStats(condition: MedicalConditionInput): any {
  return {
    prevalence: 'Varies by region and demographics',
    demographics: 'Affects people of various ages',
    bodySystem: condition.bodySystem || 'Various',
    severity: condition.severityLevel || 'Moderate',
    icdCode: condition.icdCode || 'N/A',
  };
}

function generateDefinition(condition: MedicalConditionInput, specialty: any): string {
  const base = condition.description ||
    `${condition.commonName} is a medical condition affecting the ${condition.bodySystem || specialty.bodySystem}.`;

  return `${base} It typically requires evaluation and treatment by a ${specialty.specialistTitle.toLowerCase()}. ${
    condition.scientificName !== condition.commonName
      ? `The medical term for this condition is ${condition.scientificName}.`
      : ''
  }`;
}

function generateTypesClassification(condition: MedicalConditionInput): any[] {
  // Would be enhanced with actual classification data
  return [
    {
      type: 'Acute',
      description: `Sudden onset of ${condition.commonName.toLowerCase()} with severe symptoms`,
      severity: 'moderate',
    },
    {
      type: 'Chronic',
      description: `Long-term ${condition.commonName.toLowerCase()} requiring ongoing management`,
      severity: 'mild',
    },
  ];
}

function generateCauses(condition: MedicalConditionInput, specialty: any): any[] {
  const causes = [];

  // Add specialty-specific risk factors as potential causes
  const riskFactorCauses = specialty.commonRiskFactors
    .filter((rf: any) => rf.category === 'medical' || rf.category === 'genetic')
    .slice(0, 4)
    .map((rf: any) => ({
      cause: rf.factor,
      description: rf.description,
      category: 'primary',
    }));

  causes.push(...riskFactorCauses);

  // Add lifestyle causes
  const lifestyleCauses = specialty.commonRiskFactors
    .filter((rf: any) => rf.category === 'lifestyle')
    .slice(0, 3)
    .map((rf: any) => ({
      cause: rf.factor,
      description: rf.description,
      category: 'contributing',
    }));

  causes.push(...lifestyleCauses);

  return causes;
}

function generateAffectedDemographics(condition: MedicalConditionInput): string[] {
  const severity = condition.severityLevel?.toLowerCase() || 'moderate';

  const demographics = [
    'Adults of all ages can be affected',
    'Risk may increase with age',
  ];

  if (severity === 'chronic') {
    demographics.push('May require lifelong management');
  }

  return demographics;
}

function generateDiagnosisOverview(condition: MedicalConditionInput, specialty: any): string {
  return `Diagnosing ${condition.commonName} typically involves a comprehensive evaluation by a ${specialty.specialistTitle.toLowerCase()}. The diagnostic process includes a thorough medical history review, physical examination, and appropriate diagnostic tests. Early and accurate diagnosis is crucial for effective treatment and better outcomes.`;
}

function generateWhySeeSpecialist(condition: MedicalConditionInput, specialty: any): string {
  return `A ${specialty.specialistTitle.toLowerCase()} has specialized training and expertise in treating conditions affecting the ${specialty.bodySystem.toLowerCase()}. For ${condition.commonName}, seeing a specialist ensures accurate diagnosis, access to the latest treatment options, and personalized care. Specialists can also monitor for complications and adjust treatment plans as needed.`;
}

function generateDoctorSelectionGuide(specialty: any): string {
  return `When choosing a ${specialty.specialistTitle.toLowerCase()} for your care, consider: experience with your specific condition, qualifications and board certifications, patient reviews and ratings, hospital affiliations, communication style, insurance acceptance, and availability of appointments. A good doctor-patient relationship is essential for effective treatment.`;
}

function generateHospitalCriteria(specialty: any): string[] {
  return [
    `Specialized ${specialty.specialty} department`,
    'Experienced specialist team',
    'Modern diagnostic equipment',
    'Comprehensive treatment facilities',
    'Good patient outcomes and reviews',
    'Insurance and cashless options',
    'Emergency care availability',
    'Accreditation (NABH, JCI)',
  ];
}

function generateKeyFacilities(specialty: any): string[] {
  return [
    'Advanced diagnostic imaging',
    'Modern operation theaters',
    'Intensive care units',
    'Rehabilitation services',
    'Pharmacy services',
    'Patient support services',
    'Follow-up care facilities',
  ];
}

function generatePreventionStrategies(condition: MedicalConditionInput, specialty: any): string[] {
  const strategies = specialty.lifestyleRecommendations.slice(0, 5);

  // Add condition-specific prevention
  strategies.push(
    'Regular health check-ups',
    'Early medical attention for symptoms',
    'Following prescribed preventive measures',
  );

  return strategies;
}

function generateExerciseGuidelines(condition: MedicalConditionInput, specialty: any): string {
  return `Exercise recommendations for ${condition.commonName} should be tailored to individual capabilities and condition severity. Generally, low-to-moderate intensity activities like walking, swimming, or cycling are beneficial. Always consult your ${specialty.specialistTitle.toLowerCase()} before starting any exercise program, especially if you have been inactive or have other health conditions.`;
}

function generateDailyManagement(condition: MedicalConditionInput, specialty: any): string[] {
  return [
    'Follow your prescribed treatment plan consistently',
    'Take medications as directed by your doctor',
    'Monitor and track your symptoms',
    'Maintain a healthy lifestyle',
    'Attend all follow-up appointments',
    'Know the warning signs that require immediate attention',
    'Stay informed about your condition',
    'Seek support when needed',
  ];
}

function generatePrognosis(condition: MedicalConditionInput): string {
  const severity = condition.severityLevel?.toLowerCase() || 'moderate';

  switch (severity) {
    case 'mild':
      return `${condition.commonName} typically has a good prognosis with appropriate treatment. Most patients can expect significant improvement or complete recovery with proper care and adherence to treatment plans.`;
    case 'moderate':
      return `With proper treatment and management, many patients with ${condition.commonName} can achieve good control of their symptoms and maintain quality of life. Outcomes depend on early diagnosis, treatment adherence, and individual factors.`;
    case 'severe':
    case 'critical':
      return `${condition.commonName} requires prompt and comprehensive treatment. With advanced medical care and proper management, outcomes can be favorable. Close monitoring and adherence to treatment plans are essential for the best possible outcomes.`;
    default:
      return `The prognosis for ${condition.commonName} varies depending on individual factors, severity, and response to treatment. Early diagnosis and proper treatment generally lead to better outcomes.`;
  }
}

function generateRecoveryTimeline(condition: MedicalConditionInput): string {
  const severity = condition.severityLevel?.toLowerCase() || 'moderate';

  switch (severity) {
    case 'mild':
      return 'Recovery from mild cases typically takes a few days to weeks with proper treatment.';
    case 'moderate':
      return 'Recovery may take several weeks to months depending on the treatment approach and individual response.';
    case 'severe':
    case 'critical':
      return 'Recovery from severe cases may require extended treatment and rehabilitation over several months. Individual recovery times vary significantly.';
    default:
      return 'Recovery time varies based on condition severity, treatment type, and individual factors. Your doctor can provide personalized timeline estimates.';
  }
}

function generateComplications(condition: MedicalConditionInput, specialty: any): string[] {
  return [
    'Progression of the condition if left untreated',
    'Development of related health issues',
    'Impact on quality of life',
    'Potential need for more aggressive treatment',
    'Risk of recurrence without proper management',
  ];
}

function generateSupportResources(condition: MedicalConditionInput): any[] {
  return [
    {
      name: 'Patient Support Groups',
      type: 'support_group',
      description: 'Connect with others managing similar conditions',
    },
    {
      name: 'Healthcare Helplines',
      type: 'helpline',
      description: '24/7 medical advice and support',
    },
    {
      name: 'Online Communities',
      type: 'website',
      description: 'Forums and resources for patients and caregivers',
    },
  ];
}

function generateKeywords(
  condition: MedicalConditionInput,
  specialty: any,
  location?: { country: string; city?: string }
): string[] {
  const keywords = [
    condition.commonName.toLowerCase(),
    `${condition.commonName.toLowerCase()} treatment`,
    `${condition.commonName.toLowerCase()} symptoms`,
    `${condition.commonName.toLowerCase()} causes`,
    `${condition.commonName.toLowerCase()} diagnosis`,
    `best ${specialty.specialistTitle.toLowerCase()} for ${condition.commonName.toLowerCase()}`,
    `${condition.commonName.toLowerCase()} specialist`,
  ];

  if (location?.city) {
    keywords.push(
      `${condition.commonName.toLowerCase()} treatment in ${location.city}`,
      `${condition.commonName.toLowerCase()} doctor in ${location.city}`,
    );
  }

  return keywords;
}

function generateSources(condition: MedicalConditionInput): any[] {
  return [
    {
      title: 'World Health Organization',
      url: 'https://www.who.int',
      accessedDate: new Date().toISOString().split('T')[0],
      type: 'health_org',
    },
    {
      title: 'National Health Portal India',
      url: 'https://www.nhp.gov.in',
      accessedDate: new Date().toISOString().split('T')[0],
      type: 'government',
    },
    {
      title: 'PubMed Medical Literature',
      url: 'https://pubmed.ncbi.nlm.nih.gov',
      accessedDate: new Date().toISOString().split('T')[0],
      type: 'medical_journal',
    },
  ];
}

function formatLocationName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export { prisma };
