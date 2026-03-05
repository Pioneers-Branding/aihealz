/**
 * Base Template for Condition Page Content Generation
 *
 * This module provides the foundational types, interfaces, and shared structures
 * used across all 47 specialty templates for generating 50k+ condition pages.
 */

// ============================================================================
// CORE TYPES & INTERFACES
// ============================================================================

export interface KeyStats {
  prevalence?: string;
  globalCases?: string;
  demographics?: string;
  avgAge?: string;
  genderRatio?: string;
  annualIncidence?: string;
}

export interface TypeClassification {
  type: string;
  description: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface Cause {
  cause: string;
  description: string;
  category: 'primary' | 'secondary' | 'contributing';
}

export interface RiskFactor {
  factor: string;
  category: 'medical' | 'lifestyle' | 'genetic' | 'environmental' | 'demographic';
  description: string;
  modifiable: boolean;
}

export interface DiagnosticTest {
  test: string;
  purpose: string;
  whatToExpect: string;
  costRange?: { min: number; max: number; currency: string };
}

export interface Treatment {
  name: string;
  description: string;
  effectiveness: 'high' | 'moderate' | 'low' | 'variable';
  type: 'medication' | 'procedure' | 'surgery' | 'therapy' | 'lifestyle' | 'alternative';
  recoveryTime?: string;
  costRange?: { min: number; max: number; currency: string };
}

export interface CostBreakdown {
  treatment: string;
  minCost: number;
  maxCost: number;
  avgCost: number;
  currency: string;
}

export interface RelatedCondition {
  slug: string;
  name: string;
  relationship: 'often_confused' | 'co_occurring' | 'related';
  keyDifference?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  schemaEligible: boolean;
  category: 'general' | 'symptoms' | 'treatment' | 'cost' | 'doctor' | 'lifestyle' | 'prognosis';
}

export interface Source {
  title: string;
  url: string;
  accessedDate: string;
  type: 'medical_journal' | 'health_org' | 'government' | 'research';
}

export interface SupportResource {
  name: string;
  type: 'support_group' | 'helpline' | 'website' | 'organization';
  description: string;
  url?: string;
  phone?: string;
}

// ============================================================================
// SPECIALTY TEMPLATE INTERFACE
// ============================================================================

export interface SpecialtyTemplate {
  specialty: string;
  specialistTitle: string;
  specialistTitlePlural: string;
  bodySystem: string;

  // Common patterns for this specialty
  commonSymptomPatterns: string[];
  commonTreatmentTypes: {
    type: Treatment['type'];
    examples: string[];
  }[];
  commonRiskFactors: RiskFactor[];
  commonDiagnosticTests: DiagnosticTest[];

  // FAQ templates specific to this specialty
  faqTemplates: string[];

  // Linked treatment slugs for treatment cards
  linkedTreatmentSlugs: string[];

  // Cost ranges for this specialty
  costRanges: {
    [key: string]: { min: number; max: number; currency: string };
  };

  // Emergency indicators for this specialty
  emergencyIndicators: string[];

  // Lifestyle recommendations common to this specialty
  lifestyleRecommendations: string[];

  // Diet patterns common to this specialty
  dietPatterns: {
    recommended: string[];
    avoid: string[];
  };
}

// ============================================================================
// CONDITION PAGE CONTENT STRUCTURE
// ============================================================================

export interface ConditionPageContent {
  // Meta
  conditionId: number;
  conditionSlug: string;
  languageCode: string;

  // Hero Section
  h1Title: string;
  heroOverview: string;
  keyStats: KeyStats;

  // Section 1: Overview
  definition: string;
  typesClassification: TypeClassification[];

  // Section 2: Symptoms
  primarySymptoms: string[];
  earlyWarningSigns: string[];
  emergencySigns: string[];

  // Section 3: Causes & Risk Factors
  causes: Cause[];
  riskFactors: RiskFactor[];
  affectedDemographics: string[];

  // Section 4: Diagnosis
  diagnosisOverview: string;
  diagnosticTests: DiagnosticTest[];

  // Section 5: Treatments
  treatmentOverview: string;
  medicalTreatments: Treatment[];
  surgicalOptions: Treatment[];
  alternativeTreatments: Treatment[];
  linkedTreatmentSlugs: string[];

  // Section 6: Doctors
  specialistType: string;
  whySeeSpecialist: string;
  doctorSelectionGuide: string;

  // Section 7: Hospitals
  hospitalCriteria: string[];
  keyFacilities: string[];

  // Section 8: Costs
  costBreakdown: CostBreakdown[];
  insuranceGuide: string;
  financialAssistance: string;

  // Section 9: Prevention & Lifestyle
  preventionStrategies: string[];
  lifestyleModifications: string[];
  dietRecommendations: string[];
  exerciseGuidelines: string;

  // Section 10: Living With
  dailyManagement: string[];
  prognosis: string;
  recoveryTimeline: string;
  complications: string[];
  supportResources: SupportResource[];

  // Section 11: Related Conditions
  confusedWithConditions: RelatedCondition[];
  coOccurringConditions: RelatedCondition[];
  relatedConditions: RelatedCondition[];

  // Section 12: FAQs
  faqs: FAQ[];

  // SEO Meta
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];

  // EEAT
  reviewedByDoctorId?: number;
  lastReviewed?: Date;
  sources: Source[];

  // Schema Markup
  schemaMedicalCondition: object;
  schemaFaqPage: object;
  schemaBreadcrumb: object;
  schemaHowTo?: object;

  // Quality
  status: 'draft' | 'review' | 'published';
  qualityScore: number;
  wordCount: number;
  generationVersion: string;
}

// ============================================================================
// CONDITION INPUT FROM DATABASE
// ============================================================================

export interface MedicalConditionInput {
  id: number;
  slug: string;
  scientificName: string;
  commonName: string;
  description: string | null;
  symptoms: string[];
  treatments: string[];
  faqs: { question: string; answer: string }[];
  specialistType: string;
  severityLevel: string | null;
  icdCode: string | null;
  bodySystem: string | null;
}

// ============================================================================
// GENERATION CONTEXT
// ============================================================================

export interface GenerationContext {
  condition: MedicalConditionInput;
  specialty: SpecialtyTemplate;
  location?: {
    country: string;
    city?: string;
  };
  language: string;
}

// ============================================================================
// BASE FAQ TEMPLATES (Universal)
// ============================================================================

export const BASE_FAQ_TEMPLATES: { template: string; category: FAQ['category'] }[] = [
  { template: 'What is {condition}?', category: 'general' },
  { template: 'What are the first signs of {condition}?', category: 'symptoms' },
  { template: 'What causes {condition}?', category: 'general' },
  { template: 'How is {condition} diagnosed?', category: 'general' },
  { template: 'What is the best treatment for {condition}?', category: 'treatment' },
  { template: 'Can {condition} be cured?', category: 'prognosis' },
  { template: 'How much does {condition} treatment cost?', category: 'cost' },
  { template: 'Which doctor should I consult for {condition}?', category: 'doctor' },
  { template: 'Which hospital is best for {condition} treatment?', category: 'doctor' },
  { template: 'Is {condition} covered by insurance?', category: 'cost' },
  { template: 'How long does {condition} treatment take?', category: 'treatment' },
  { template: 'What are the side effects of {condition} treatment?', category: 'treatment' },
  { template: 'Can {condition} be prevented?', category: 'lifestyle' },
  { template: 'Is {condition} hereditary?', category: 'general' },
  { template: 'What foods should I avoid with {condition}?', category: 'lifestyle' },
  { template: 'Can I live a normal life with {condition}?', category: 'prognosis' },
  { template: 'What are the complications of untreated {condition}?', category: 'prognosis' },
  { template: 'How do I know if my {condition} is getting worse?', category: 'symptoms' },
  { template: 'What lifestyle changes help with {condition}?', category: 'lifestyle' },
  { template: 'When should I see a doctor for {condition}?', category: 'doctor' },
];

// ============================================================================
// QUALITY SCORING CRITERIA
// ============================================================================

export interface QualityScoreCriteria {
  wordCount: { min: number; max: number; weight: number };
  sectionCompleteness: { required: string[]; weight: number };
  faqCount: { min: number; weight: number };
  keywordDensity: { min: number; max: number; weight: number };
  metaOptimized: { titleMaxLength: number; descMaxLength: number; weight: number };
  linksPresent: { weight: number };
  eatSignals: { weight: number };
}

export const QUALITY_CRITERIA: QualityScoreCriteria = {
  wordCount: { min: 2000, max: 3500, weight: 0.15 },
  sectionCompleteness: {
    required: [
      'heroOverview', 'definition', 'primarySymptoms', 'causes',
      'diagnosisOverview', 'treatmentOverview', 'specialistType',
      'costBreakdown', 'preventionStrategies', 'prognosis', 'faqs'
    ],
    weight: 0.25
  },
  faqCount: { min: 20, weight: 0.15 },
  keywordDensity: { min: 0.01, max: 0.025, weight: 0.10 },
  metaOptimized: { titleMaxLength: 60, descMaxLength: 160, weight: 0.10 },
  linksPresent: { weight: 0.10 },
  eatSignals: { weight: 0.15 }
};

export const PUBLISH_THRESHOLD = 0.85;
export const REVIEW_THRESHOLD = 0.70;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Replace template placeholders with actual condition name
 */
export function interpolateTemplate(template: string, conditionName: string): string {
  return template.replace(/\{condition\}/g, conditionName);
}

/**
 * Calculate word count from content object
 */
export function calculateWordCount(content: Partial<ConditionPageContent>): number {
  let text = '';

  // Gather all text content
  const textFields = [
    content.heroOverview,
    content.definition,
    content.diagnosisOverview,
    content.treatmentOverview,
    content.whySeeSpecialist,
    content.doctorSelectionGuide,
    content.insuranceGuide,
    content.financialAssistance,
    content.exerciseGuidelines,
    content.prognosis,
    content.recoveryTimeline,
  ];

  textFields.forEach(field => {
    if (field) text += ' ' + field;
  });

  // Add array fields
  const arrayFields = [
    content.primarySymptoms,
    content.earlyWarningSigns,
    content.emergencySigns,
    content.preventionStrategies,
    content.lifestyleModifications,
    content.dietRecommendations,
    content.dailyManagement,
    content.complications,
    content.hospitalCriteria,
    content.keyFacilities,
    content.affectedDemographics,
  ];

  arrayFields.forEach(arr => {
    if (arr) text += ' ' + arr.join(' ');
  });

  // Add FAQ answers
  if (content.faqs) {
    content.faqs.forEach(faq => {
      text += ' ' + faq.question + ' ' + faq.answer;
    });
  }

  // Add treatment descriptions
  const treatmentArrays = [
    content.medicalTreatments,
    content.surgicalOptions,
    content.alternativeTreatments,
  ];

  treatmentArrays.forEach(treatments => {
    if (treatments) {
      treatments.forEach(t => {
        text += ' ' + t.name + ' ' + t.description;
      });
    }
  });

  // Count words
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Generate SEO-optimized meta title
 */
export function generateMetaTitle(
  conditionName: string,
  specialistType: string,
  location?: string
): string {
  const base = `${conditionName} Treatment`;
  const withSpecialist = `${base} | ${specialistType}`;

  if (location) {
    const withLocation = `${conditionName} Treatment in ${location}`;
    return withLocation.length <= 60 ? withLocation : base.slice(0, 57) + '...';
  }

  return withSpecialist.length <= 60 ? withSpecialist : base.slice(0, 57) + '...';
}

/**
 * Generate SEO-optimized meta description
 */
export function generateMetaDescription(
  conditionName: string,
  specialistType: string,
  location?: string
): string {
  const locationPart = location ? ` in ${location}` : '';
  const base = `Learn about ${conditionName} symptoms, causes, diagnosis, and treatment options${locationPart}. Find the best ${specialistType} and hospitals. Expert medical guidance.`;

  return base.length <= 160 ? base : base.slice(0, 157) + '...';
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(
  conditionSlug: string,
  countryCode: string = 'in',
  language: string = 'en'
): string {
  return `https://healz.ai/${countryCode}/${language}/${conditionSlug}`;
}

/**
 * Calculate quality score
 */
export function calculateQualityScore(content: Partial<ConditionPageContent>): number {
  let score = 0;

  // Word count scoring
  const wordCount = calculateWordCount(content);
  if (wordCount >= QUALITY_CRITERIA.wordCount.min && wordCount <= QUALITY_CRITERIA.wordCount.max) {
    score += QUALITY_CRITERIA.wordCount.weight;
  } else if (wordCount >= QUALITY_CRITERIA.wordCount.min * 0.8) {
    score += QUALITY_CRITERIA.wordCount.weight * 0.7;
  }

  // Section completeness scoring
  const requiredFields = QUALITY_CRITERIA.sectionCompleteness.required;
  const presentFields = requiredFields.filter(field => {
    const value = (content as any)[field];
    return value !== null && value !== undefined &&
           (typeof value === 'string' ? value.length > 0 : Array.isArray(value) ? value.length > 0 : true);
  });
  score += (presentFields.length / requiredFields.length) * QUALITY_CRITERIA.sectionCompleteness.weight;

  // FAQ count scoring
  if (content.faqs && content.faqs.length >= QUALITY_CRITERIA.faqCount.min) {
    score += QUALITY_CRITERIA.faqCount.weight;
  } else if (content.faqs) {
    score += (content.faqs.length / QUALITY_CRITERIA.faqCount.min) * QUALITY_CRITERIA.faqCount.weight;
  }

  // Meta optimization scoring
  if (content.metaTitle && content.metaTitle.length <= QUALITY_CRITERIA.metaOptimized.titleMaxLength &&
      content.metaDescription && content.metaDescription.length <= QUALITY_CRITERIA.metaOptimized.descMaxLength) {
    score += QUALITY_CRITERIA.metaOptimized.weight;
  }

  // Links present scoring
  if (content.linkedTreatmentSlugs && content.linkedTreatmentSlugs.length > 0) {
    score += QUALITY_CRITERIA.linksPresent.weight;
  }

  // EAT signals scoring
  if (content.sources && content.sources.length > 0) {
    score += QUALITY_CRITERIA.eatSignals.weight * 0.5;
  }
  if (content.reviewedByDoctorId) {
    score += QUALITY_CRITERIA.eatSignals.weight * 0.5;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Determine content status based on quality score
 */
export function determineStatus(qualityScore: number): 'draft' | 'review' | 'published' {
  if (qualityScore >= PUBLISH_THRESHOLD) return 'published';
  if (qualityScore >= REVIEW_THRESHOLD) return 'review';
  return 'draft';
}

// ============================================================================
// SCHEMA MARKUP GENERATORS
// ============================================================================

/**
 * Generate MedicalCondition schema
 */
export function generateMedicalConditionSchema(
  content: ConditionPageContent,
  condition: MedicalConditionInput
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.commonName,
    alternateName: condition.scientificName !== condition.commonName ? condition.scientificName : undefined,
    description: content.definition,
    code: condition.icdCode ? {
      '@type': 'MedicalCode',
      code: condition.icdCode,
      codingSystem: 'ICD-10'
    } : undefined,
    associatedAnatomy: condition.bodySystem ? {
      '@type': 'AnatomicalStructure',
      name: condition.bodySystem
    } : undefined,
    signOrSymptom: content.primarySymptoms?.map(symptom => ({
      '@type': 'MedicalSymptom',
      name: symptom
    })),
    cause: content.causes?.map(c => ({
      '@type': 'MedicalCause',
      name: c.cause
    })),
    riskFactor: content.riskFactors?.map(rf => ({
      '@type': 'MedicalRiskFactor',
      name: rf.factor
    })),
    possibleTreatment: [
      ...(content.medicalTreatments || []),
      ...(content.surgicalOptions || [])
    ].map(t => ({
      '@type': 'MedicalTherapy',
      name: t.name,
      description: t.description
    })),
    typicalTest: content.diagnosticTests?.map(dt => ({
      '@type': 'MedicalTest',
      name: dt.test,
      usedToDiagnose: condition.commonName
    })),
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: content.specialistType
    }
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFaqPageSchema(faqs: FAQ[]): object {
  const eligibleFaqs = faqs.filter(faq => faq.schemaEligible);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: eligibleFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate Breadcrumb schema
 */
export function generateBreadcrumbSchema(
  conditionName: string,
  conditionSlug: string,
  specialistType: string,
  countryCode: string = 'in',
  language: string = 'en'
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://healz.ai/${countryCode}/${language}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Conditions',
        item: `https://healz.ai/${countryCode}/${language}/conditions`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: specialistType,
        item: `https://healz.ai/${countryCode}/${language}/conditions?specialty=${encodeURIComponent(specialistType)}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: conditionName,
        item: `https://healz.ai/${countryCode}/${language}/${conditionSlug}`
      }
    ]
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export const VERSION = '1.0.0';
