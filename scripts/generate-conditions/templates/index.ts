/**
 * Specialty Templates Index
 *
 * Central export for all 47 specialty templates.
 * Templates are loaded on-demand to minimize memory usage.
 */

import type { SpecialtyTemplate } from './base-template';

// Re-export base template utilities
export * from './base-template';

// Top 5 Priority Specialties (fully implemented)
export { cardiologyTemplate } from './cardiology';
export { orthopedicsTemplate } from './orthopedics';
export { gastroenterologyTemplate } from './gastroenterology';
export { dermatologyTemplate } from './dermatology';
export { neurologyTemplate } from './neurology';

// Additional fully implemented specialties
export { pulmonologyTemplate } from './pulmonology';
export { endocrinologyTemplate } from './endocrinology';
export { oncologyTemplate } from './oncology';

// Additional specialty templates
export { additionalSpecialtyTemplates } from './additional-specialties';

// Specialty template registry
const templateRegistry: Map<string, () => Promise<SpecialtyTemplate>> = new Map();

// Register top 5 templates
templateRegistry.set('Cardiology', async () => (await import('./cardiology')).cardiologyTemplate);
templateRegistry.set('Orthopedics', async () => (await import('./orthopedics')).orthopedicsTemplate);
templateRegistry.set('Gastroenterology', async () => (await import('./gastroenterology')).gastroenterologyTemplate);
templateRegistry.set('Dermatology', async () => (await import('./dermatology')).dermatologyTemplate);
templateRegistry.set('Neurology', async () => (await import('./neurology')).neurologyTemplate);

// Register additional full templates
templateRegistry.set('Pulmonology', async () => (await import('./pulmonology')).pulmonologyTemplate);
templateRegistry.set('Endocrinology', async () => (await import('./endocrinology')).endocrinologyTemplate);
templateRegistry.set('Oncology', async () => (await import('./oncology')).oncologyTemplate);

// Register templates from additional-specialties
templateRegistry.set('Nephrology', async () => (await import('./additional-specialties')).nephrologyTemplate);
templateRegistry.set('Urology', async () => (await import('./additional-specialties')).urologyTemplate);
templateRegistry.set('Ophthalmology', async () => (await import('./additional-specialties')).ophthalmologyTemplate);
templateRegistry.set('ENT', async () => (await import('./additional-specialties')).entTemplate);
templateRegistry.set('Psychiatry', async () => (await import('./additional-specialties')).psychiatryTemplate);
templateRegistry.set('Rheumatology', async () => (await import('./additional-specialties')).rheumatologyTemplate);
templateRegistry.set('Pediatrics', async () => (await import('./additional-specialties')).pediatricsTemplate);
templateRegistry.set('Obstetrics & Gynecology', async () => (await import('./additional-specialties')).obgynTemplate);
templateRegistry.set('General Medicine', async () => (await import('./additional-specialties')).generalMedicineTemplate);
templateRegistry.set('Internal Medicine', async () => (await import('./additional-specialties')).internalMedicineTemplate);
templateRegistry.set('Family Medicine', async () => (await import('./additional-specialties')).familyMedicineTemplate);
templateRegistry.set('Emergency Medicine', async () => (await import('./additional-specialties')).emergencyMedicineTemplate);
templateRegistry.set('Genetics', async () => (await import('./additional-specialties')).geneticsTemplate);
templateRegistry.set('Neonatology', async () => (await import('./additional-specialties')).neonatologyTemplate);
templateRegistry.set('Infectious Disease', async () => (await import('./additional-specialties')).infectiousDiseaseTemplate);
templateRegistry.set('Hematology', async () => (await import('./additional-specialties')).hematologyTemplate);
templateRegistry.set('Allergy & Immunology', async () => (await import('./additional-specialties')).allergyImmunologyTemplate);

// Additional specialties - will be implemented progressively
// All these map to existing templates via normalizeSpecialty()
const additionalSpecialties = [
  'Pulmonology',
  'Endocrinology',
  'Nephrology',
  'Urology',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Oncology',
  'Hematology',
  'Rheumatology',
  'Infectious Disease',
  'Infectious Diseases',
  'General Surgery',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Geriatrics',
  'Allergy & Immunology',
  'Pain Medicine',
  'Physical Medicine',
  'Plastic Surgery',
  'Vascular Surgery',
  'Cardiothoracic Surgery',
  'Cardiothoracic & Vascular Surgery',
  'Neurosurgery',
  'Dental',
  'Maxillofacial Surgery',
  'Maxillofacial & Oral Surgery',
  'Podiatry',
  'Sports Medicine',
  'Emergency Medicine',
  'Critical Care',
  'Palliative Care',
  'Sleep Medicine',
  'Reproductive Medicine',
  'Bariatric Medicine',
  'Sexual Health',
  'Cosmetic Dermatology',
  'Clinical Genetics',
  'Genetics',
  'Nuclear Medicine',
  'Radiology',
  'Pathology',
  'Family Medicine',
  'Internal Medicine',
  'General Medicine',
  'Neonatology',
  'Ayurveda',
  'Homeopathy',
  'Physical Medicine & Rehabilitation',
  'Pain Medicine & Palliative Care',
  'Preventive & Public Health',
  'Tropical Medicine',
  'Occupational Medicine',
  'Plastic & Reconstructive Surgery',
];

/**
 * Get a specialty template by name
 */
export async function getSpecialtyTemplate(specialty: string, language: string = 'en'): Promise<SpecialtyTemplate | null> {
  // Try localized template first
  if (language !== 'en') {
    const normalizedSpecialty = normalizeSpecialty(specialty);
    if (normalizedSpecialty === 'Cardiology') {
      if (language === 'hi') return (await import('./cardiology_hi')).cardiologyTemplateHi;
      if (language === 'es') return (await import('./cardiology_es')).cardiologyTemplateEs;
      if (language === 'ta') return (await import('./cardiology_ta')).cardiologyTemplateTa;
      if (language === 'te') return (await import('./cardiology_te')).cardiologyTemplateTe;
    }
  }

  // First try direct lookup
  const loader = templateRegistry.get(specialty);
  if (loader) {
    return await loader();
  }

  // Try normalized specialty name
  const normalizedSpecialty = normalizeSpecialty(specialty);
  if (normalizedSpecialty !== specialty) {
    const normalizedLoader = templateRegistry.get(normalizedSpecialty);
    if (normalizedLoader) {
      return await normalizedLoader();
    }
  }

  // Check if it's a known specialty without a template yet
  if (additionalSpecialties.includes(specialty) || additionalSpecialties.includes(normalizedSpecialty)) {
    // Try to use a related template from normalization
    if (normalizedSpecialty !== specialty && templateRegistry.has(normalizedSpecialty)) {
      const relatedLoader = templateRegistry.get(normalizedSpecialty);
      if (relatedLoader) {
        return await relatedLoader();
      }
    }
    console.warn(`Template for ${specialty} not yet implemented. Using base template.`);
    return createBaseTemplate(specialty);
  }

  // Fall back to General Medicine for unknown specialties
  console.warn(`Unknown specialty: ${specialty}. Falling back to General Medicine template.`);
  const gmLoader = templateRegistry.get('General Medicine');
  if (gmLoader) {
    const gmTemplate = await gmLoader();
    return { ...gmTemplate, specialty, specialistTitle: `${specialty} Specialist`, specialistTitlePlural: `${specialty} Specialists` };
  }

  return createBaseTemplate(specialty);
}

/**
 * Create a basic template for specialties without full implementation
 */
function createBaseTemplate(specialty: string): SpecialtyTemplate {
  return {
    specialty,
    specialistTitle: specialty.includes('Surgery') ? `${specialty.replace(' Surgery', '')} Surgeon` : `${specialty} Specialist`,
    specialistTitlePlural: specialty.includes('Surgery') ? `${specialty.replace(' Surgery', '')} Surgeons` : `${specialty} Specialists`,
    bodySystem: 'Various',

    commonSymptomPatterns: [],
    commonTreatmentTypes: [],
    commonRiskFactors: [],
    commonDiagnosticTests: [],
    faqTemplates: [],
    linkedTreatmentSlugs: [],
    costRanges: {
      consultation: { min: 500, max: 2000, currency: 'INR' },
    },
    emergencyIndicators: [],
    lifestyleRecommendations: [],
    dietPatterns: {
      recommended: [],
      avoid: [],
    },
  };
}

/**
 * List all available specialties
 */
export function listAvailableSpecialties(): string[] {
  return Array.from(templateRegistry.keys()).concat(additionalSpecialties);
}

/**
 * Check if a specialty has a full template
 */
export function hasFullTemplate(specialty: string): boolean {
  return templateRegistry.has(specialty);
}

/**
 * Map specialist type from database to template name
 * Handles variations in naming conventions
 */
export function normalizeSpecialty(specialistType: string): string {
  const normalizations: Record<string, string> = {
    // Cardiology
    'Cardiologist': 'Cardiology',
    'Heart Specialist': 'Cardiology',
    'Cardiac Surgeon': 'Cardiology',
    // Orthopedics
    'Orthopedic Surgeon': 'Orthopedics',
    'Orthopedist': 'Orthopedics',
    'Bone Specialist': 'Orthopedics',
    // Gastroenterology
    'Gastroenterologist': 'Gastroenterology',
    'GI Specialist': 'Gastroenterology',
    'Digestive Specialist': 'Gastroenterology',
    // Dermatology
    'Dermatologist': 'Dermatology',
    'Skin Specialist': 'Dermatology',
    // Neurology
    'Neurologist': 'Neurology',
    'Brain Specialist': 'Neurology',
    'Nerve Specialist': 'Neurology',
    // Pulmonology
    'Pulmonologist': 'Pulmonology',
    'Lung Specialist': 'Pulmonology',
    'Respiratory Specialist': 'Pulmonology',
    // Endocrinology
    'Endocrinologist': 'Endocrinology',
    'Diabetes Specialist': 'Endocrinology',
    'Hormone Specialist': 'Endocrinology',
    // Nephrology
    'Nephrologist': 'Nephrology',
    'Kidney Specialist': 'Nephrology',
    // Urology
    'Urologist': 'Urology',
    // Ophthalmology
    'Ophthalmologist': 'Ophthalmology',
    'Eye Specialist': 'Ophthalmology',
    // ENT
    'ENT Specialist': 'ENT',
    'Otolaryngologist': 'ENT',
    'Ear Nose Throat': 'ENT',
    // Psychiatry
    'Psychiatrist': 'Psychiatry',
    'Mental Health Specialist': 'Psychiatry',
    // Oncology
    'Oncologist': 'Oncology',
    'Cancer Specialist': 'Oncology',
    // Hematology
    'Hematologist': 'Hematology',
    'Blood Specialist': 'Hematology',
    // Rheumatology
    'Rheumatologist': 'Rheumatology',
    // Pediatrics
    'Pediatrician': 'Pediatrics',
    'Child Specialist': 'Pediatrics',
    // Obstetrics & Gynecology
    'Gynecologist': 'Obstetrics & Gynecology',
    'Obstetrician': 'Obstetrics & Gynecology',
    'OB-GYN': 'Obstetrics & Gynecology',
    'Obstetrics': 'Obstetrics & Gynecology',
    // General/Internal Medicine
    'General Physician': 'General Medicine',
    'Internist': 'Internal Medicine',
    'General Medicine': 'General Medicine',
    'Internal Medicine': 'Internal Medicine',
    'General Practitioner': 'General Medicine',
    'Family Physician': 'Family Medicine',
    'Family Medicine': 'Family Medicine',
    // Emergency Medicine
    'Emergency Physician': 'Emergency Medicine',
    'Emergency Medicine': 'Emergency Medicine',
    'ER Doctor': 'Emergency Medicine',
    // Infectious Disease
    'Infectious Disease Specialist': 'Infectious Disease',
    'Infectious Disease': 'Infectious Disease',
    'ID Specialist': 'Infectious Disease',
    // Genetics
    'Geneticist': 'Genetics',
    'Genetics': 'Genetics',
    'Clinical Geneticist': 'Genetics',
    // Neonatology
    'Neonatologist': 'Neonatology',
    'Neonatology': 'Neonatology',
    // Allergy & Immunology
    'Allergist': 'Allergy & Immunology',
    'Immunologist': 'Allergy & Immunology',
    'Allergy & Immunology': 'Allergy & Immunology',
    'Allergy Specialist': 'Allergy & Immunology',
    // Cardiothoracic Surgery - map to Cardiology
    'Cardiothoracic & Vascular Surgery': 'Cardiology',
    'Cardiothoracic Surgeon': 'Cardiology',
    'Vascular Surgeon': 'Cardiology',
    // Other surgical specialties - map to closest specialty
    'Neurosurgery': 'Neurology',
    'Neurosurgeon': 'Neurology',
    'General Surgery': 'General Medicine',
    'General Surgeon': 'General Medicine',
    // Pain Management
    'Pain Specialist': 'General Medicine',
    // Other mappings
    'Tropical Medicine': 'Infectious Disease',
    'Occupational Medicine': 'General Medicine',
    'Physical Medicine & Rehabilitation': 'Orthopedics',
    'Sports Medicine': 'Orthopedics',
    'Podiatry': 'Orthopedics',
    'Maxillofacial & Oral Surgery': 'ENT',
    'Radiology': 'General Medicine',
    'Nuclear Medicine': 'General Medicine',
    'Preventive & Public Health': 'General Medicine',
    'Geriatrics': 'Internal Medicine',
    // Additional mappings for remaining specialties
    'Physiatrist': 'Orthopedics',
    'Rehabilitation Medicine': 'Orthopedics',
    'Pain Medicine & Palliative Care': 'Neurology',
    'Palliative Care': 'General Medicine',
    'Sleep Medicine': 'Pulmonology',
    'Reproductive Medicine': 'Obstetrics & Gynecology',
    'Bariatric Medicine': 'General Medicine',
    'Sexual Health': 'Urology',
    'Cosmetic Dermatology': 'Dermatology',
    'Clinical Genetics': 'Genetics',
    // Plastic Surgery
    'Reconstructive Surgery': 'Dermatology',
    // Additional surgery specialties
    'Surgical Gastroenterology': 'Gastroenterology',
    'Surgical Oncology': 'Oncology',
    'Hepatology': 'Gastroenterology',
    'Transplant Surgery': 'General Medicine',
    'Colorectal Surgery': 'Gastroenterology',
    // Additional medicine subspecialties
    'Interventional Cardiology': 'Cardiology',
    'Electrophysiology': 'Cardiology',
    'Clinical Immunology': 'Allergy & Immunology',
    'Medical Oncology': 'Oncology',
    'Radiation Oncology': 'Oncology',
    'Pediatric Cardiology': 'Cardiology',
    'Pediatric Neurology': 'Neurology',
    'Pediatric Surgery': 'Pediatrics',
    'Neuro-ophthalmology': 'Ophthalmology',
    'Oculoplastics': 'Ophthalmology',
    'Retina Specialist': 'Ophthalmology',
    'Glaucoma Specialist': 'Ophthalmology',
    // Catch-all for variations
    'Gynecology': 'Obstetrics & Gynecology',
    'Obstetrics And Gynecology': 'Obstetrics & Gynecology',
    'Ear, Nose & Throat': 'ENT',
    'Ear Nose Throat Specialist': 'ENT',
    'Chest Physician': 'Pulmonology',
    'TB & Chest Diseases': 'Pulmonology',
    'Diabetologist': 'Endocrinology',
    'Obesity Medicine': 'Endocrinology',
    'Nutritionist': 'General Medicine',
    'Dietitian': 'General Medicine',
    'Psychology': 'Psychiatry',
    'Psychologist': 'Psychiatry',
    'Counselor': 'Psychiatry',
  };

  return normalizations[specialistType] || specialistType;
}

export default {
  getSpecialtyTemplate,
  listAvailableSpecialties,
  hasFullTemplate,
  normalizeSpecialty,
};
