/**
 * Schema Generator
 *
 * Generates comprehensive JSON-LD schema markup for condition pages
 * including MedicalCondition, FAQPage, BreadcrumbList, and HowTo schemas.
 */

import type {
  MedicalConditionInput,
  ConditionPageContent,
  FAQ,
} from '../templates/base-template';

export interface SchemaOutput {
  schemaMedicalCondition: object;
  schemaFaqPage: object;
  schemaBreadcrumb: object;
  schemaHowTo: object | null;
}

/**
 * Generate all schema markup for a condition page
 */
export function generateSchemas(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput,
  countryCode: string = 'in',
  language: string = 'en'
): SchemaOutput {
  return {
    schemaMedicalCondition: generateMedicalConditionSchema(content, condition),
    schemaFaqPage: generateFaqPageSchema(content.faqs || []),
    schemaBreadcrumb: generateBreadcrumbSchema(condition, content.specialistType || condition.specialistType, countryCode, language),
    schemaHowTo: content.treatmentOverview ? generateHowToSchema(content, condition) : null,
  };
}

/**
 * Generate MedicalCondition schema (Schema.org)
 */
function generateMedicalConditionSchema(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput
): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.commonName,
    url: `https://healz.ai/in/en/${condition.slug}`,
    description: content.definition || condition.description,
  };

  // Add alternate name if different from common name
  if (condition.scientificName && condition.scientificName !== condition.commonName) {
    schema.alternateName = condition.scientificName;
  }

  // Add ICD code
  if (condition.icdCode) {
    schema.code = {
      '@type': 'MedicalCode',
      code: condition.icdCode,
      codingSystem: 'ICD-10',
    };
  }

  // Add associated anatomy
  if (condition.bodySystem) {
    schema.associatedAnatomy = {
      '@type': 'AnatomicalStructure',
      name: condition.bodySystem,
    };
  }

  // Add symptoms
  if (content.primarySymptoms && content.primarySymptoms.length > 0) {
    schema.signOrSymptom = content.primarySymptoms.slice(0, 10).map(symptom => ({
      '@type': 'MedicalSymptom',
      name: symptom,
    }));
  }

  // Add causes
  if (content.causes && content.causes.length > 0) {
    schema.cause = content.causes.slice(0, 5).map(c => ({
      '@type': 'MedicalCause',
      name: c.cause,
    }));
  }

  // Add risk factors
  if (content.riskFactors && content.riskFactors.length > 0) {
    schema.riskFactor = content.riskFactors.slice(0, 8).map(rf => ({
      '@type': 'MedicalRiskFactor',
      name: rf.factor,
    }));
  }

  // Add treatments
  const treatments = [
    ...(content.medicalTreatments || []),
    ...(content.surgicalOptions || []),
  ];
  if (treatments.length > 0) {
    schema.possibleTreatment = treatments.slice(0, 8).map(t => ({
      '@type': 'MedicalTherapy',
      name: t.name,
      description: t.description,
    }));
  }

  // Add diagnostic tests
  if (content.diagnosticTests && content.diagnosticTests.length > 0) {
    schema.typicalTest = content.diagnosticTests.slice(0, 5).map(dt => ({
      '@type': 'MedicalTest',
      name: dt.test,
      usedToDiagnose: condition.commonName,
    }));
  }

  // Add relevant specialty
  if (content.specialistType) {
    schema.relevantSpecialty = {
      '@type': 'MedicalSpecialty',
      name: content.specialistType,
    };
  }

  // Add medical audience
  schema.audience = {
    '@type': 'MedicalAudience',
    audienceType: 'patients',
  };

  // Add publication info for EEAT
  schema.mainEntityOfPage = {
    '@type': 'WebPage',
    '@id': `https://healz.ai/in/en/${condition.slug}`,
  };

  return schema;
}

/**
 * Generate FAQPage schema
 */
function generateFaqPageSchema(faqs: FAQ[]): object {
  const eligibleFaqs = faqs.filter(faq => faq.schemaEligible).slice(0, 20);

  if (eligibleFaqs.length === 0) {
    return {};
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: eligibleFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 */
function generateBreadcrumbSchema(
  condition: MedicalConditionInput,
  specialistType: string,
  countryCode: string,
  language: string
): object {
  const baseUrl = `https://healz.ai/${countryCode}/${language}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Conditions',
        item: `${baseUrl}/conditions`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: specialistType,
        item: `${baseUrl}/conditions?specialty=${encodeURIComponent(specialistType)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: condition.commonName,
        item: `${baseUrl}/${condition.slug}`,
      },
    ],
  };
}

/**
 * Generate HowTo schema for treatment steps
 */
function generateHowToSchema(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput
): object {
  const steps: { name: string; text: string }[] = [];

  // Step 1: Recognition
  steps.push({
    name: 'Recognize the symptoms',
    text: `Identify common symptoms of ${condition.commonName} including ${(content.primarySymptoms || []).slice(0, 3).join(', ') || 'various symptoms'}. Early recognition leads to better outcomes.`,
  });

  // Step 2: Seek medical help
  steps.push({
    name: 'Consult a specialist',
    text: `Schedule an appointment with a ${content.specialistType || 'specialist'} for proper diagnosis. Bring your medical history and list of symptoms.`,
  });

  // Step 3: Get diagnosed
  steps.push({
    name: 'Undergo diagnostic tests',
    text: `Your doctor may recommend ${(content.diagnosticTests || []).slice(0, 2).map(t => t.test).join(' or ') || 'diagnostic tests'} to confirm the diagnosis.`,
  });

  // Step 4: Follow treatment
  steps.push({
    name: 'Follow the treatment plan',
    text: `Adhere to the prescribed treatment, which may include medications, procedures, or lifestyle changes. ${content.treatmentOverview ? content.treatmentOverview.split('.')[0] + '.' : ''}`,
  });

  // Step 5: Monitor progress
  steps.push({
    name: 'Monitor your condition',
    text: 'Attend follow-up appointments, track your symptoms, and report any changes to your healthcare provider.',
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Get Treatment for ${condition.commonName}`,
    description: `Step-by-step guide for seeking and receiving treatment for ${condition.commonName}.`,
    step: steps.map((s, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * Generate MedicalWebPage schema for EEAT
 */
export function generateMedicalWebPageSchema(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput,
  reviewer?: { name: string; credentials: string; licenseNumber?: string }
): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: content.h1Title || `${condition.commonName} Treatment Guide`,
    url: `https://healz.ai/in/en/${condition.slug}`,
    description: content.metaDescription || content.heroOverview,
    lastReviewed: content.lastReviewed?.toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: content.languageCode || 'en',
  };

  // Add medical audience
  schema.audience = {
    '@type': 'MedicalAudience',
    audienceType: 'patients',
  };

  // Add specialty
  if (content.specialistType) {
    schema.specialty = content.specialistType;
  }

  // Add reviewer for EEAT signals
  if (reviewer) {
    schema.reviewedBy = {
      '@type': 'Person',
      name: reviewer.name,
      jobTitle: reviewer.credentials,
    };
  }

  // Add publisher
  schema.publisher = {
    '@type': 'Organization',
    name: 'Healz.ai',
    url: 'https://healz.ai',
    logo: {
      '@type': 'ImageObject',
      url: 'https://healz.ai/logo.png',
    },
  };

  return schema;
}

/**
 * Generate Article schema for enhanced SERP features
 */
export function generateArticleSchema(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.h1Title || `${condition.commonName} Treatment Guide`,
    description: content.metaDescription,
    articleBody: content.definition,
    articleSection: 'Medical Conditions',
    wordCount: content.wordCount,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Healz.ai Medical Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Healz.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://healz.ai/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://healz.ai/in/en/${condition.slug}`,
    },
  };
}

/**
 * Combine all schemas into a single graph
 */
export function combineSchemas(schemas: object[]): object {
  const validSchemas = schemas.filter(s => s && Object.keys(s).length > 0);

  if (validSchemas.length === 0) {
    return {};
  }

  if (validSchemas.length === 1) {
    return validSchemas[0];
  }

  return {
    '@context': 'https://schema.org',
    '@graph': validSchemas.map(schema => {
      const { '@context': _, ...rest } = schema as any;
      return rest;
    }),
  };
}

export default {
  generateSchemas,
  generateMedicalConditionSchema,
  generateFaqPageSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateMedicalWebPageSchema,
  generateArticleSchema,
  combineSchemas,
};
