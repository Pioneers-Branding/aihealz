/**
 * Generators Index
 *
 * Central export for all content generators.
 */

export { generateSymptoms, classifySymptomSeverity } from './symptoms-generator';
export type { SymptomsOutput } from './symptoms-generator';

export { generateTreatments } from './treatment-generator';
export type { TreatmentOutput } from './treatment-generator';

export { generateFAQs } from './faq-generator';
export type { FAQOutput } from './faq-generator';

export {
  generateSchemas,
  generateMedicalWebPageSchema,
  generateArticleSchema,
  combineSchemas,
} from './schema-generator';
export type { SchemaOutput } from './schema-generator';

export {
  generateCosts,
  estimateTreatmentCost,
  generateCostComparison,
} from './cost-generator';
export type { CostOutput } from './cost-generator';
