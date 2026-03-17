/**
 * Validators Index
 *
 * Central export for all content validators.
 */

export {
  validateMedicalContent,
  checkMisinformation,
} from './medical-validator';
export type { MedicalValidationResult, ValidationWarning, ValidationError } from './medical-validator';

export {
  validateSEO,
  calculateReadability,
} from './seo-validator';
export type { SEOValidationResult, SEOIssue, SEOSuggestion } from './seo-validator';

import { validateMedicalContent, type MedicalValidationResult } from './medical-validator';
import { validateSEO, type SEOValidationResult } from './seo-validator';
import type { ConditionPageContent, MedicalConditionInput } from '../templates/base-template';

export interface CombinedValidationResult {
  medical: MedicalValidationResult;
  seo: SEOValidationResult;
  overallScore: number;
  isPublishReady: boolean;
}

/**
 * Run all validators on content
 */
export function validateAll(
  content: Partial<ConditionPageContent>,
  condition: MedicalConditionInput
): CombinedValidationResult {
  const medical = validateMedicalContent(content, condition);
  const seo = validateSEO(content);

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (medical.score * 0.6 + (seo.score / 100) * 0.4) * 100
  ) / 100;

  // Publish ready if both validations pass and score is high enough
  const isPublishReady =
    medical.isValid &&
    seo.isValid &&
    overallScore >= 0.85;

  return {
    medical,
    seo,
    overallScore,
    isPublishReady,
  };
}
