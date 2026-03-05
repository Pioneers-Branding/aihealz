/**
 * Medical Content Validator
 *
 * Validates medical content for accuracy, safety, and compliance
 * with medical content guidelines.
 */

import type { ConditionPageContent, MedicalConditionInput } from '../templates/base-template';

export interface MedicalValidationResult {
  isValid: boolean;
  score: number; // 0-1
  warnings: ValidationWarning[];
  errors: ValidationError[];
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium';
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Potentially dangerous medical claims that should be avoided
const DANGEROUS_CLAIMS = [
  /cure[\s-]?all/i,
  /guaranteed[\s]+(cure|recovery|result)/i,
  /100%[\s]+(effective|success|cure)/i,
  /miracle[\s]+(cure|treatment|drug)/i,
  /instant[\s]+(cure|relief|recovery)/i,
  /no[\s]+side[\s]+effects/i,
  /completely[\s]+safe/i,
  /replaces?[\s]+(doctor|medical[\s]+care)/i,
  /don'?t[\s]+see[\s]+a[\s]+doctor/i,
  /stop[\s]+taking[\s]+medication/i,
];

// Required disclaimer patterns
const REQUIRED_DISCLAIMERS = [
  /consult.*doctor|consult.*physician|consult.*healthcare/i,
  /medical[\s]+advice|professional[\s]+advice/i,
  /individual[\s]+results|results[\s]+may[\s]+vary/i,
];

// Medical terminology that should be accurate
const ANATOMICAL_TERMS = new Map([
  ['heart', ['cardiac', 'cardiovascular', 'coronary', 'myocardial']],
  ['brain', ['cerebral', 'neurological', 'cranial', 'encephalic']],
  ['liver', ['hepatic', 'hepato']],
  ['kidney', ['renal', 'nephro']],
  ['lung', ['pulmonary', 'respiratory', 'bronchial']],
  ['stomach', ['gastric', 'gastro']],
  ['skin', ['dermal', 'cutaneous', 'epidermal']],
  ['bone', ['skeletal', 'osteo', 'osseous']],
  ['joint', ['articular', 'arthro']],
  ['blood', ['hematologic', 'hemato', 'vascular']],
]);

/**
 * Validate medical content
 */
export function validateMedicalContent(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput
): MedicalValidationResult {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];

  // Check for dangerous claims
  const dangerousClaimsResult = checkDangerousClaims(content);
  errors.push(...dangerousClaimsResult.errors);
  warnings.push(...dangerousClaimsResult.warnings);

  // Check medical terminology accuracy
  const terminologyResult = checkMedicalTerminology(content, condition);
  warnings.push(...terminologyResult.warnings);

  // Check symptom validity
  const symptomResult = validateSymptoms(content);
  warnings.push(...symptomResult.warnings);
  errors.push(...symptomResult.errors);

  // Check treatment appropriateness
  const treatmentResult = validateTreatments(content, condition);
  warnings.push(...treatmentResult.warnings);
  errors.push(...treatmentResult.errors);

  // Check for required disclaimers
  const disclaimerResult = checkDisclaimers(content);
  warnings.push(...disclaimerResult.warnings);

  // Check emergency information
  const emergencyResult = validateEmergencyInfo(content);
  warnings.push(...emergencyResult.warnings);

  // Calculate score
  const errorPenalty = errors.length * 0.15;
  const warningPenalty = warnings.reduce((sum, w) => {
    return sum + (w.severity === 'medium' ? 0.05 : 0.02);
  }, 0);
  const score = Math.max(0, 1 - errorPenalty - warningPenalty);

  return {
    isValid: errors.length === 0,
    score: Math.round(score * 100) / 100,
    warnings,
    errors,
  };
}

/**
 * Check for dangerous medical claims
 */
function checkDangerousClaims(
  content: Partial<ConditionPageContent>
): { warnings: ValidationWarning[]; errors: ValidationError[] } {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];

  const textFields = [
    { name: 'heroOverview', value: content.heroOverview },
    { name: 'definition', value: content.definition },
    { name: 'treatmentOverview', value: content.treatmentOverview },
    { name: 'prognosis', value: content.prognosis },
    { name: 'insuranceGuide', value: content.insuranceGuide },
  ];

  for (const field of textFields) {
    if (!field.value) continue;

    for (const pattern of DANGEROUS_CLAIMS) {
      if (pattern.test(field.value)) {
        errors.push({
          field: field.name,
          message: `Contains potentially dangerous claim: "${field.value.match(pattern)?.[0]}"`,
          code: 'DANGEROUS_CLAIM',
        });
      }
    }
  }

  // Check FAQ answers
  if (content.faqs) {
    for (const faq of content.faqs) {
      for (const pattern of DANGEROUS_CLAIMS) {
        if (pattern.test(faq.answer)) {
          errors.push({
            field: 'faqs',
            message: `FAQ answer contains dangerous claim: "${faq.question}"`,
            code: 'DANGEROUS_FAQ_CLAIM',
          });
        }
      }
    }
  }

  return { warnings, errors };
}

/**
 * Check medical terminology accuracy
 */
function checkMedicalTerminology(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput
): { warnings: ValidationWarning[] } {
  const warnings: ValidationWarning[] = [];

  // Check if body system terminology is consistent
  if (condition.bodySystem) {
    const bodySystemLower = condition.bodySystem.toLowerCase();
    const relatedTerms = ANATOMICAL_TERMS.get(bodySystemLower);

    if (relatedTerms && content.definition) {
      const definitionLower = content.definition.toLowerCase();
      const hasRelatedTerm = relatedTerms.some(term =>
        definitionLower.includes(term.toLowerCase())
      );

      if (!hasRelatedTerm && !definitionLower.includes(bodySystemLower)) {
        warnings.push({
          field: 'definition',
          message: `Definition may not adequately reference body system: ${condition.bodySystem}`,
          severity: 'low',
        });
      }
    }
  }

  // Check specialist type consistency
  if (content.specialistType && condition.specialistType) {
    const contentSpecialist = content.specialistType.toLowerCase();
    const conditionSpecialist = condition.specialistType.toLowerCase();

    if (!contentSpecialist.includes(conditionSpecialist) &&
        !conditionSpecialist.includes(contentSpecialist)) {
      warnings.push({
        field: 'specialistType',
        message: `Specialist type "${content.specialistType}" may not match condition specialist "${condition.specialistType}"`,
        severity: 'medium',
      });
    }
  }

  return { warnings };
}

/**
 * Validate symptoms
 */
function validateSymptoms(
  content: Partial<ConditionPageContent>
): { warnings: ValidationWarning[]; errors: ValidationError[] } {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];

  // Check primary symptoms exist
  if (!content.primarySymptoms || content.primarySymptoms.length === 0) {
    errors.push({
      field: 'primarySymptoms',
      message: 'No primary symptoms defined',
      code: 'MISSING_SYMPTOMS',
    });
  } else if (content.primarySymptoms.length < 3) {
    warnings.push({
      field: 'primarySymptoms',
      message: `Only ${content.primarySymptoms.length} symptoms listed (recommend 5+)`,
      severity: 'medium',
    });
  }

  // Check emergency signs
  if (!content.emergencySigns || content.emergencySigns.length === 0) {
    warnings.push({
      field: 'emergencySigns',
      message: 'No emergency signs defined',
      severity: 'medium',
    });
  }

  // Check for vague symptoms
  const vagueTerms = ['maybe', 'sometimes', 'could be', 'might'];
  if (content.primarySymptoms) {
    for (const symptom of content.primarySymptoms) {
      const symptomLower = symptom.toLowerCase();
      if (vagueTerms.some(term => symptomLower.includes(term))) {
        warnings.push({
          field: 'primarySymptoms',
          message: `Symptom contains vague language: "${symptom}"`,
          severity: 'low',
        });
      }
    }
  }

  return { warnings, errors };
}

/**
 * Validate treatments
 */
function validateTreatments(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput
): { warnings: ValidationWarning[]; errors: ValidationError[] } {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];

  // Check treatment overview exists
  if (!content.treatmentOverview || content.treatmentOverview.length < 100) {
    warnings.push({
      field: 'treatmentOverview',
      message: 'Treatment overview is missing or too short',
      severity: 'medium',
    });
  }

  // Check medical treatments exist
  if (!content.medicalTreatments || content.medicalTreatments.length === 0) {
    warnings.push({
      field: 'medicalTreatments',
      message: 'No medical treatments defined',
      severity: 'medium',
    });
  }

  // Validate treatment descriptions
  const allTreatments = [
    ...(content.medicalTreatments || []),
    ...(content.surgicalOptions || []),
    ...(content.alternativeTreatments || []),
  ];

  for (const treatment of allTreatments) {
    if (!treatment.description || treatment.description.length < 20) {
      warnings.push({
        field: 'treatments',
        message: `Treatment "${treatment.name}" has insufficient description`,
        severity: 'low',
      });
    }

    // Check for unrealistic effectiveness claims
    if (treatment.effectiveness === 'high' && treatment.type === 'alternative') {
      warnings.push({
        field: 'treatments',
        message: `Alternative treatment "${treatment.name}" marked as highly effective - verify claim`,
        severity: 'medium',
      });
    }
  }

  return { warnings, errors };
}

/**
 * Check for required disclaimers
 */
function checkDisclaimers(
  content: Partial<ConditionPageContent>
): { warnings: ValidationWarning[] } {
  const warnings: ValidationWarning[] = [];

  // Combine all text content
  const allText = [
    content.heroOverview,
    content.definition,
    content.treatmentOverview,
    content.whySeeSpecialist,
    content.prognosis,
  ].filter(Boolean).join(' ');

  // Check for at least one disclaimer pattern
  const hasDisclaimer = REQUIRED_DISCLAIMERS.some(pattern => pattern.test(allText));

  if (!hasDisclaimer) {
    warnings.push({
      field: 'general',
      message: 'Content may lack medical disclaimer or consultation recommendation',
      severity: 'medium',
    });
  }

  return { warnings };
}

/**
 * Validate emergency information
 */
function validateEmergencyInfo(
  content: Partial<ConditionPageContent>
): { warnings: ValidationWarning[] } {
  const warnings: ValidationWarning[] = [];

  // Check emergency signs are present and meaningful
  if (content.emergencySigns && content.emergencySigns.length > 0) {
    const emergencyKeywords = ['emergency', 'immediate', 'urgent', 'severe', '911', 'hospital'];

    const hasEmergencyGuidance = content.emergencySigns.some(sign =>
      emergencyKeywords.some(kw => sign.toLowerCase().includes(kw))
    );

    if (!hasEmergencyGuidance) {
      warnings.push({
        field: 'emergencySigns',
        message: 'Emergency signs may not clearly indicate when to seek immediate care',
        severity: 'low',
      });
    }
  }

  return { warnings };
}

/**
 * Check for potential medical misinformation
 */
export function checkMisinformation(content: string): string[] {
  const flags: string[] = [];

  // Common medical misinformation patterns
  const misinformationPatterns = [
    { pattern: /vaccines?\s+(cause|causes)\s+autism/i, flag: 'Vaccine misinformation' },
    { pattern: /5g\s+(causes?|spreads?)\s+(cancer|disease|virus)/i, flag: '5G health misinformation' },
    { pattern: /essential\s+oils?\s+(cure|treats?)\s+cancer/i, flag: 'Unproven cancer cure claim' },
    { pattern: /homeopathy\s+(cures?|treats?)\s+cancer/i, flag: 'Unproven cancer treatment claim' },
    { pattern: /bleach\s+(cures?|treats?)/i, flag: 'Dangerous treatment suggestion' },
  ];

  for (const { pattern, flag } of misinformationPatterns) {
    if (pattern.test(content)) {
      flags.push(flag);
    }
  }

  return flags;
}

export default {
  validateMedicalContent,
  checkMisinformation,
};
