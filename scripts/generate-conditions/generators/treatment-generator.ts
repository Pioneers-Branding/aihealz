/**
 * Treatment Generator
 *
 * Generates comprehensive treatment content for condition pages including
 * medical treatments, surgical options, and alternative treatments.
 */

import type {
  MedicalConditionInput,
  SpecialtyTemplate,
  GenerationContext,
  Treatment,
  CostBreakdown,
} from '../templates/base-template';

export interface TreatmentOutput {
  treatmentOverview: string;
  medicalTreatments: Treatment[];
  surgicalOptions: Treatment[];
  alternativeTreatments: Treatment[];
  linkedTreatmentSlugs: string[];
  costBreakdown: CostBreakdown[];
}

/**
 * Generate treatment sections for a condition
 */
export function generateTreatments(context: GenerationContext): TreatmentOutput {
  const { condition, specialty } = context;

  const treatmentOverview = generateTreatmentOverview(condition, specialty);
  const medicalTreatments = generateMedicalTreatments(condition, specialty);
  const surgicalOptions = generateSurgicalOptions(condition, specialty);
  const alternativeTreatments = generateAlternativeTreatments(condition, specialty);
  const linkedTreatmentSlugs = generateLinkedSlugs(specialty, condition);
  const costBreakdown = generateCostBreakdown(specialty, condition);

  return {
    treatmentOverview,
    medicalTreatments,
    surgicalOptions,
    alternativeTreatments,
    linkedTreatmentSlugs,
    costBreakdown,
  };
}

/**
 * Generate treatment overview text
 */
function generateTreatmentOverview(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): string {
  const conditionName = condition.commonName;
  const specialistTitle = specialty.specialistTitle;
  const severity = condition.severityLevel?.toLowerCase() || 'moderate';

  let overview = `Treatment for ${conditionName} depends on the severity of the condition, underlying causes, and individual patient factors. `;

  switch (severity) {
    case 'mild':
      overview += `Many mild cases of ${conditionName} can be managed with lifestyle modifications and over-the-counter treatments. However, it's important to consult a ${specialistTitle} for proper diagnosis and to rule out more serious conditions.`;
      break;
    case 'moderate':
      overview += `Treatment typically involves a combination of medications and lifestyle changes. A ${specialistTitle} will develop a personalized treatment plan based on your specific symptoms and medical history.`;
      break;
    case 'severe':
    case 'critical':
      overview += `Severe cases often require aggressive medical intervention, which may include prescription medications, procedures, or surgery. Early treatment by an experienced ${specialistTitle} is crucial for optimal outcomes.`;
      break;
    default:
      overview += `A ${specialistTitle} will evaluate your condition and recommend the most appropriate treatment approach, which may include medications, procedures, or lifestyle modifications.`;
  }

  overview += ` The goal of treatment is to relieve symptoms, address underlying causes, prevent complications, and improve quality of life.`;

  return overview;
}

/**
 * Generate medical treatments list
 */
function generateMedicalTreatments(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): Treatment[] {
  const treatments: Treatment[] = [];

  // Get medication examples from specialty template
  const medicationTypes = specialty.commonTreatmentTypes.find(t => t.type === 'medication');

  if (medicationTypes) {
    medicationTypes.examples.slice(0, 6).forEach((med, index) => {
      treatments.push({
        name: med,
        description: generateMedicationDescription(med, condition.commonName),
        effectiveness: index < 3 ? 'high' : 'moderate',
        type: 'medication',
      });
    });
  }

  // Add condition-specific treatments if available
  if (Array.isArray(condition.treatments)) {
    condition.treatments
      .filter(t => typeof t === 'string' && !isSurgicalTreatment(t))
      .slice(0, 4)
      .forEach(treatment => {
        if (!treatments.find(t => t.name.toLowerCase() === treatment.toLowerCase())) {
          treatments.push({
            name: treatment,
            description: generateGenericTreatmentDescription(treatment, condition.commonName),
            effectiveness: 'moderate',
            type: 'medication',
          });
        }
      });
  }

  return treatments.slice(0, 8);
}

/**
 * Generate surgical options list
 */
function generateSurgicalOptions(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): Treatment[] {
  const surgicalOptions: Treatment[] = [];

  // Get surgical and procedure examples from specialty template
  const surgeryTypes = specialty.commonTreatmentTypes.find(t => t.type === 'surgery');
  const procedureTypes = specialty.commonTreatmentTypes.find(t => t.type === 'procedure');

  // Add relevant surgeries
  if (surgeryTypes) {
    surgeryTypes.examples.slice(0, 3).forEach(surgery => {
      surgicalOptions.push({
        name: surgery,
        description: generateSurgeryDescription(surgery, condition.commonName),
        effectiveness: 'high',
        type: 'surgery',
        recoveryTime: estimateRecoveryTime(surgery),
      });
    });
  }

  // Add relevant procedures
  if (procedureTypes) {
    procedureTypes.examples.slice(0, 3).forEach(procedure => {
      surgicalOptions.push({
        name: procedure,
        description: generateProcedureDescription(procedure, condition.commonName),
        effectiveness: 'high',
        type: 'procedure',
        recoveryTime: estimateRecoveryTime(procedure),
      });
    });
  }

  // Add condition-specific surgical treatments
  if (Array.isArray(condition.treatments)) {
    condition.treatments
      .filter(t => typeof t === 'string' && isSurgicalTreatment(t))
      .slice(0, 2)
      .forEach(treatment => {
        if (!surgicalOptions.find(s => s.name.toLowerCase() === treatment.toLowerCase())) {
          surgicalOptions.push({
            name: treatment,
            description: generateSurgeryDescription(treatment, condition.commonName),
            effectiveness: 'high',
            type: 'surgery',
            recoveryTime: estimateRecoveryTime(treatment),
          });
        }
      });
  }

  return surgicalOptions.slice(0, 6);
}

/**
 * Generate alternative treatments list
 */
function generateAlternativeTreatments(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): Treatment[] {
  const alternatives: Treatment[] = [];

  // Get lifestyle treatments from specialty template
  const lifestyleTypes = specialty.commonTreatmentTypes.find(t => t.type === 'lifestyle');
  const therapyTypes = specialty.commonTreatmentTypes.find(t => t.type === 'therapy');

  // Add lifestyle modifications
  if (lifestyleTypes) {
    lifestyleTypes.examples.slice(0, 4).forEach(lifestyle => {
      alternatives.push({
        name: lifestyle,
        description: `${lifestyle} can help manage symptoms and improve overall outcomes for ${condition.commonName}.`,
        effectiveness: 'moderate',
        type: 'lifestyle',
      });
    });
  }

  // Add therapy options
  if (therapyTypes) {
    therapyTypes.examples.slice(0, 3).forEach(therapy => {
      alternatives.push({
        name: therapy,
        description: `${therapy} may be recommended as part of a comprehensive treatment plan for ${condition.commonName}.`,
        effectiveness: 'moderate',
        type: 'therapy',
      });
    });
  }

  // Add general complementary treatments
  const complementaryTreatments: Treatment[] = [
    {
      name: 'Yoga and meditation',
      description: 'Mind-body practices that can help reduce stress and improve overall well-being.',
      effectiveness: 'variable',
      type: 'alternative',
    },
    {
      name: 'Dietary modifications',
      description: 'Specific dietary changes may help manage symptoms and support recovery.',
      effectiveness: 'variable',
      type: 'lifestyle',
    },
    {
      name: 'Acupuncture',
      description: 'Traditional Chinese medicine technique that may provide symptomatic relief.',
      effectiveness: 'variable',
      type: 'alternative',
    },
  ];

  alternatives.push(...complementaryTreatments.slice(0, 2));

  return alternatives.slice(0, 8);
}

/**
 * Generate linked treatment slugs for treatment cards
 */
function generateLinkedSlugs(
  specialty: SpecialtyTemplate,
  condition: MedicalConditionInput
): string[] {
  const slugs = new Set<string>();

  // Add specialty-linked slugs
  specialty.linkedTreatmentSlugs.forEach(slug => slugs.add(slug));

  // Generate slugs from condition treatments
  if (Array.isArray(condition.treatments)) {
    condition.treatments.forEach(treatment => {
      if (typeof treatment === 'string') {
        const slug = treatment
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        if (slug.length > 3) {
          slugs.add(slug);
        }
      }
    });
  }

  return Array.from(slugs).slice(0, 10);
}

/**
 * Generate cost breakdown
 */
function generateCostBreakdown(
  specialty: SpecialtyTemplate,
  condition: MedicalConditionInput
): CostBreakdown[] {
  const costs: CostBreakdown[] = [];

  // Add costs from specialty template
  Object.entries(specialty.costRanges).forEach(([treatment, range]) => {
    costs.push({
      treatment: formatTreatmentName(treatment),
      minCost: range.min,
      maxCost: range.max,
      avgCost: Math.round((range.min + range.max) / 2),
      currency: range.currency,
    });
  });

  return costs;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isSurgicalTreatment(treatment: string): boolean {
  const surgicalKeywords = [
    'surgery', 'surgical', 'operation', 'procedure',
    'removal', 'repair', 'replacement', 'transplant',
    'implant', 'resection', 'excision', '-ectomy', '-plasty', '-otomy'
  ];

  const treatmentLower = treatment.toLowerCase();
  return surgicalKeywords.some(kw => treatmentLower.includes(kw));
}

function generateMedicationDescription(medication: string, conditionName: string): string {
  const descriptions: Record<string, string> = {
    'Beta-blockers': `Beta-blockers help slow heart rate and reduce blood pressure, commonly prescribed for ${conditionName}.`,
    'ACE inhibitors': `ACE inhibitors relax blood vessels and reduce strain on the heart, effective in managing ${conditionName}.`,
    'Statins': `Statins lower cholesterol levels and reduce the risk of complications from ${conditionName}.`,
    'NSAIDs': `Non-steroidal anti-inflammatory drugs help reduce pain and inflammation associated with ${conditionName}.`,
    'Corticosteroids': `Corticosteroids reduce inflammation and suppress immune response in ${conditionName}.`,
    'Antibiotics': `Antibiotics are prescribed to treat or prevent bacterial infections related to ${conditionName}.`,
    'Antacids': `Antacids neutralize stomach acid and provide relief from symptoms of ${conditionName}.`,
    'Antihistamines': `Antihistamines block allergic reactions and reduce symptoms associated with ${conditionName}.`,
  };

  // Check for partial matches
  for (const [key, desc] of Object.entries(descriptions)) {
    if (medication.toLowerCase().includes(key.toLowerCase())) {
      return desc;
    }
  }

  return `${medication} is commonly prescribed to help manage symptoms and treat ${conditionName}.`;
}

function generateGenericTreatmentDescription(treatment: string, conditionName: string): string {
  return `${treatment} is a treatment option that may be recommended by your doctor for managing ${conditionName}. Effectiveness varies based on individual factors and disease severity.`;
}

function generateSurgeryDescription(surgery: string, conditionName: string): string {
  return `${surgery} is a surgical intervention that may be recommended for ${conditionName} when conservative treatments are not effective. The procedure aims to address the underlying cause and provide long-term relief.`;
}

function generateProcedureDescription(procedure: string, conditionName: string): string {
  return `${procedure} is a minimally invasive procedure that can help diagnose or treat ${conditionName}. It typically involves shorter recovery time compared to traditional surgery.`;
}

function estimateRecoveryTime(treatment: string): string {
  const treatmentLower = treatment.toLowerCase();

  if (treatmentLower.includes('transplant') || treatmentLower.includes('bypass')) {
    return '3-6 months';
  }
  if (treatmentLower.includes('replacement')) {
    return '6-12 weeks';
  }
  if (treatmentLower.includes('surgery') || treatmentLower.includes('-ectomy')) {
    return '2-6 weeks';
  }
  if (treatmentLower.includes('arthroscop') || treatmentLower.includes('minimally')) {
    return '1-4 weeks';
  }
  if (treatmentLower.includes('injection') || treatmentLower.includes('procedure')) {
    return '1-7 days';
  }

  return '2-4 weeks';
}

function formatTreatmentName(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export default {
  generateTreatments,
};
