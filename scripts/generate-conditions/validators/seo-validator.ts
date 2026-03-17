/**
 * SEO Content Validator
 *
 * Validates content for SEO best practices including meta tags,
 * keyword optimization, schema markup, and readability.
 */

import type { ConditionPageContent, FAQ } from '../templates/base-template';

export interface SEOValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
}

export interface SEOIssue {
  category: 'critical' | 'warning' | 'info';
  field: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SEOSuggestion {
  field: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

// SEO Configuration
const SEO_CONFIG = {
  metaTitle: {
    minLength: 30,
    maxLength: 60,
    optimalLength: { min: 50, max: 60 },
  },
  metaDescription: {
    minLength: 120,
    maxLength: 160,
    optimalLength: { min: 140, max: 155 },
  },
  h1: {
    minLength: 20,
    maxLength: 70,
  },
  content: {
    minWords: 1500,
    optimalWords: { min: 2000, max: 3500 },
    maxWords: 5000,
  },
  faq: {
    minCount: 15,
    optimalCount: 20,
    maxCount: 30,
    minAnswerLength: 50,
    optimalAnswerLength: 100,
  },
  keywordDensity: {
    min: 0.5, // 0.5%
    max: 2.5, // 2.5%
    optimal: { min: 1.0, max: 2.0 },
  },
  headings: {
    minH2: 5,
    optimalH2: 10,
  },
  internalLinks: {
    min: 3,
    optimal: 8,
  },
};

/**
 * Validate SEO aspects of content
 */
export function validateSEO(content: Partial<ConditionPageContent>): SEOValidationResult {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  // Validate meta title
  const titleResult = validateMetaTitle(content.metaTitle);
  issues.push(...titleResult.issues);
  suggestions.push(...titleResult.suggestions);

  // Validate meta description
  const descResult = validateMetaDescription(content.metaDescription);
  issues.push(...descResult.issues);
  suggestions.push(...descResult.suggestions);

  // Validate H1 title
  const h1Result = validateH1(content.h1Title);
  issues.push(...h1Result.issues);
  suggestions.push(...h1Result.suggestions);

  // Validate content length
  const contentResult = validateContentLength(content);
  issues.push(...contentResult.issues);
  suggestions.push(...contentResult.suggestions);

  // Validate FAQs
  const faqResult = validateFAQs(content.faqs);
  issues.push(...faqResult.issues);
  suggestions.push(...faqResult.suggestions);

  // Validate keyword usage
  const keywordResult = validateKeywords(content);
  issues.push(...keywordResult.issues);
  suggestions.push(...keywordResult.suggestions);

  // Validate schema markup
  const schemaResult = validateSchemaMarkup(content);
  issues.push(...schemaResult.issues);
  suggestions.push(...schemaResult.suggestions);

  // Validate internal links
  const linksResult = validateInternalLinks(content);
  issues.push(...linksResult.issues);
  suggestions.push(...linksResult.suggestions);

  // Calculate score
  const criticalIssues = issues.filter(i => i.category === 'critical').length;
  const warningIssues = issues.filter(i => i.category === 'warning').length;
  const infoIssues = issues.filter(i => i.category === 'info').length;

  let score = 100;
  score -= criticalIssues * 15;
  score -= warningIssues * 5;
  score -= infoIssues * 1;
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: criticalIssues === 0,
    score: Math.round(score),
    issues,
    suggestions,
  };
}

/**
 * Validate meta title
 */
function validateMetaTitle(title: string | undefined): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  if (!title) {
    issues.push({
      category: 'critical',
      field: 'metaTitle',
      message: 'Meta title is missing',
      impact: 'high',
    });
    return { issues, suggestions };
  }

  const length = title.length;

  if (length < SEO_CONFIG.metaTitle.minLength) {
    issues.push({
      category: 'warning',
      field: 'metaTitle',
      message: `Meta title too short (${length} chars). Minimum: ${SEO_CONFIG.metaTitle.minLength}`,
      impact: 'medium',
    });
  } else if (length > SEO_CONFIG.metaTitle.maxLength) {
    issues.push({
      category: 'warning',
      field: 'metaTitle',
      message: `Meta title too long (${length} chars). Maximum: ${SEO_CONFIG.metaTitle.maxLength}`,
      impact: 'medium',
    });
  } else if (length < SEO_CONFIG.metaTitle.optimalLength.min) {
    suggestions.push({
      field: 'metaTitle',
      suggestion: `Consider lengthening title to ${SEO_CONFIG.metaTitle.optimalLength.min}-${SEO_CONFIG.metaTitle.optimalLength.max} chars for optimal SEO`,
      priority: 'low',
    });
  }

  // Check for power words
  const powerWords = ['best', 'guide', 'expert', 'complete', 'ultimate', 'treatment'];
  const hasPowerWord = powerWords.some(word => title.toLowerCase().includes(word));
  if (!hasPowerWord) {
    suggestions.push({
      field: 'metaTitle',
      suggestion: 'Consider adding a power word (best, guide, expert) to improve CTR',
      priority: 'low',
    });
  }

  return { issues, suggestions };
}

/**
 * Validate meta description
 */
function validateMetaDescription(description: string | undefined): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  if (!description) {
    issues.push({
      category: 'critical',
      field: 'metaDescription',
      message: 'Meta description is missing',
      impact: 'high',
    });
    return { issues, suggestions };
  }

  const length = description.length;

  if (length < SEO_CONFIG.metaDescription.minLength) {
    issues.push({
      category: 'warning',
      field: 'metaDescription',
      message: `Meta description too short (${length} chars). Minimum: ${SEO_CONFIG.metaDescription.minLength}`,
      impact: 'medium',
    });
  } else if (length > SEO_CONFIG.metaDescription.maxLength) {
    issues.push({
      category: 'warning',
      field: 'metaDescription',
      message: `Meta description too long (${length} chars). May be truncated in SERPs`,
      impact: 'medium',
    });
  }

  // Check for call to action
  const ctaPatterns = ['learn more', 'find out', 'discover', 'get', 'start', 'book', 'consult'];
  const hasCTA = ctaPatterns.some(cta => description.toLowerCase().includes(cta));
  if (!hasCTA) {
    suggestions.push({
      field: 'metaDescription',
      suggestion: 'Consider adding a call-to-action to improve click-through rate',
      priority: 'medium',
    });
  }

  return { issues, suggestions };
}

/**
 * Validate H1 title
 */
function validateH1(h1: string | undefined): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  if (!h1) {
    issues.push({
      category: 'critical',
      field: 'h1Title',
      message: 'H1 title is missing',
      impact: 'high',
    });
    return { issues, suggestions };
  }

  const length = h1.length;

  if (length < SEO_CONFIG.h1.minLength) {
    issues.push({
      category: 'warning',
      field: 'h1Title',
      message: `H1 title too short (${length} chars)`,
      impact: 'medium',
    });
  } else if (length > SEO_CONFIG.h1.maxLength) {
    issues.push({
      category: 'info',
      field: 'h1Title',
      message: `H1 title quite long (${length} chars). Consider shortening for readability`,
      impact: 'low',
    });
  }

  return { issues, suggestions };
}

/**
 * Validate content length
 */
function validateContentLength(content: Partial<ConditionPageContent>): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  const wordCount = content.wordCount || 0;

  if (wordCount < SEO_CONFIG.content.minWords) {
    issues.push({
      category: 'warning',
      field: 'content',
      message: `Content too short (${wordCount} words). Minimum recommended: ${SEO_CONFIG.content.minWords}`,
      impact: 'high',
    });
  } else if (wordCount > SEO_CONFIG.content.maxWords) {
    suggestions.push({
      field: 'content',
      suggestion: `Content is quite long (${wordCount} words). Consider if all content adds value`,
      priority: 'low',
    });
  } else if (wordCount < SEO_CONFIG.content.optimalWords.min) {
    suggestions.push({
      field: 'content',
      suggestion: `Content could be expanded (${wordCount} words). Optimal: ${SEO_CONFIG.content.optimalWords.min}-${SEO_CONFIG.content.optimalWords.max}`,
      priority: 'medium',
    });
  }

  return { issues, suggestions };
}

/**
 * Validate FAQs
 */
function validateFAQs(faqs: FAQ[] | undefined): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  if (!faqs || faqs.length === 0) {
    issues.push({
      category: 'critical',
      field: 'faqs',
      message: 'No FAQs defined. FAQs are important for featured snippets',
      impact: 'high',
    });
    return { issues, suggestions };
  }

  if (faqs.length < SEO_CONFIG.faq.minCount) {
    issues.push({
      category: 'warning',
      field: 'faqs',
      message: `Only ${faqs.length} FAQs. Recommend at least ${SEO_CONFIG.faq.minCount}`,
      impact: 'medium',
    });
  } else if (faqs.length < SEO_CONFIG.faq.optimalCount) {
    suggestions.push({
      field: 'faqs',
      suggestion: `Consider adding more FAQs (currently ${faqs.length}, optimal: ${SEO_CONFIG.faq.optimalCount})`,
      priority: 'low',
    });
  }

  // Check schema eligibility
  const schemaEligible = faqs.filter(f => f.schemaEligible).length;
  if (schemaEligible < faqs.length) {
    suggestions.push({
      field: 'faqs',
      suggestion: `${faqs.length - schemaEligible} FAQs are not schema eligible. Consider optimizing`,
      priority: 'medium',
    });
  }

  // Check answer lengths
  const shortAnswers = faqs.filter(f => f.answer.length < SEO_CONFIG.faq.minAnswerLength);
  if (shortAnswers.length > 0) {
    issues.push({
      category: 'info',
      field: 'faqs',
      message: `${shortAnswers.length} FAQ answers are too short for featured snippets`,
      impact: 'low',
    });
  }

  return { issues, suggestions };
}

/**
 * Validate keyword usage
 */
function validateKeywords(content: Partial<ConditionPageContent>): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  if (!content.keywords || content.keywords.length === 0) {
    issues.push({
      category: 'warning',
      field: 'keywords',
      message: 'No keywords defined',
      impact: 'medium',
    });
    return { issues, suggestions };
  }

  // Check keyword presence in title and description
  const primaryKeyword = content.keywords[0]?.toLowerCase();
  if (primaryKeyword) {
    if (content.metaTitle && !content.metaTitle.toLowerCase().includes(primaryKeyword)) {
      issues.push({
        category: 'warning',
        field: 'metaTitle',
        message: 'Primary keyword not found in meta title',
        impact: 'medium',
      });
    }

    if (content.metaDescription && !content.metaDescription.toLowerCase().includes(primaryKeyword)) {
      suggestions.push({
        field: 'metaDescription',
        suggestion: 'Consider including primary keyword in meta description',
        priority: 'medium',
      });
    }

    if (content.h1Title && !content.h1Title.toLowerCase().includes(primaryKeyword)) {
      issues.push({
        category: 'info',
        field: 'h1Title',
        message: 'Primary keyword not found in H1',
        impact: 'low',
      });
    }
  }

  return { issues, suggestions };
}

/**
 * Validate schema markup
 */
function validateSchemaMarkup(content: Partial<ConditionPageContent>): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  // Check MedicalCondition schema
  if (!content.schemaMedicalCondition || Object.keys(content.schemaMedicalCondition).length === 0) {
    issues.push({
      category: 'critical',
      field: 'schemaMedicalCondition',
      message: 'MedicalCondition schema markup is missing',
      impact: 'high',
    });
  }

  // Check FAQPage schema
  if (!content.schemaFaqPage || Object.keys(content.schemaFaqPage).length === 0) {
    issues.push({
      category: 'warning',
      field: 'schemaFaqPage',
      message: 'FAQPage schema markup is missing',
      impact: 'medium',
    });
  }

  // Check BreadcrumbList schema
  if (!content.schemaBreadcrumb || Object.keys(content.schemaBreadcrumb).length === 0) {
    suggestions.push({
      field: 'schemaBreadcrumb',
      suggestion: 'Consider adding BreadcrumbList schema for better navigation in SERPs',
      priority: 'low',
    });
  }

  return { issues, suggestions };
}

/**
 * Validate internal links
 */
function validateInternalLinks(content: Partial<ConditionPageContent>): {
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
} {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];

  const linkedTreatments = content.linkedTreatmentSlugs?.length || 0;
  const relatedConditions = content.relatedConditions?.length || 0;
  const totalInternalLinks = linkedTreatments + relatedConditions;

  if (totalInternalLinks < SEO_CONFIG.internalLinks.min) {
    issues.push({
      category: 'warning',
      field: 'internalLinks',
      message: `Only ${totalInternalLinks} internal links. Minimum recommended: ${SEO_CONFIG.internalLinks.min}`,
      impact: 'medium',
    });
  } else if (totalInternalLinks < SEO_CONFIG.internalLinks.optimal) {
    suggestions.push({
      field: 'internalLinks',
      suggestion: `Consider adding more internal links (currently ${totalInternalLinks}, optimal: ${SEO_CONFIG.internalLinks.optimal})`,
      priority: 'medium',
    });
  }

  return { issues, suggestions };
}

/**
 * Calculate readability score (Flesch-Kincaid approximation)
 */
export function calculateReadability(text: string): {
  score: number;
  grade: string;
  recommendation: string;
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) {
    return {
      score: 0,
      grade: 'N/A',
      recommendation: 'Unable to calculate readability',
    };
  }

  // Flesch Reading Ease formula
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  const normalizedScore = Math.max(0, Math.min(100, score));

  let grade: string;
  let recommendation: string;

  if (normalizedScore >= 80) {
    grade = 'Easy (6th grade)';
    recommendation = 'Content is very easy to read. Good for general audience.';
  } else if (normalizedScore >= 60) {
    grade = 'Standard (8th-9th grade)';
    recommendation = 'Content is at a comfortable reading level. Ideal for most users.';
  } else if (normalizedScore >= 40) {
    grade = 'Fairly Difficult (10th-12th grade)';
    recommendation = 'Consider simplifying some complex sentences for broader accessibility.';
  } else {
    grade = 'Difficult (College level)';
    recommendation = 'Content may be too complex. Consider breaking down technical terms.';
  }

  return {
    score: Math.round(normalizedScore),
    grade,
    recommendation,
  };
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Subtract silent e
  if (word.endsWith('e')) count--;

  // Handle special endings
  if (word.endsWith('le') && word.length > 2 && !/[aeiou]/.test(word[word.length - 3])) {
    count++;
  }

  return Math.max(1, count);
}

export default {
  validateSEO,
  calculateReadability,
};
