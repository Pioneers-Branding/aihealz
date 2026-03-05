/**
 * Cost Generator
 *
 * Generates cost estimates and financial guidance for condition pages
 * including treatment costs, insurance information, and financial assistance.
 */

import type {
  MedicalConditionInput,
  SpecialtyTemplate,
  GenerationContext,
  CostBreakdown,
} from '../templates/base-template';

export interface CostOutput {
  costBreakdown: CostBreakdown[];
  insuranceGuide: string;
  financialAssistance: string;
}

// Currency exchange rates (approximate, for estimation)
const CURRENCY_MULTIPLIERS: Record<string, number> = {
  INR: 1,
  USD: 83,
  AED: 23,
  GBP: 105,
  EUR: 90,
  SGD: 62,
  MYR: 18,
  THB: 2.4,
};

// City cost modifiers (relative to average)
const CITY_COST_MODIFIERS: Record<string, number> = {
  mumbai: 1.3,
  delhi: 1.2,
  bangalore: 1.15,
  chennai: 1.1,
  hyderabad: 1.05,
  kolkata: 1.0,
  pune: 1.1,
  ahmedabad: 0.95,
  jaipur: 0.9,
  lucknow: 0.85,
  chandigarh: 1.0,
  kochi: 0.95,
  goa: 1.1,
  default: 1.0,
};

// Hospital tier modifiers
const HOSPITAL_TIER_MODIFIERS = {
  premium: 1.5,      // Corporate hospitals (Apollo, Fortis, Max)
  standard: 1.0,     // Mid-tier private hospitals
  basic: 0.6,        // Basic private hospitals
  government: 0.3,   // Government hospitals
};

/**
 * Generate cost section for a condition
 */
export function generateCosts(
  context: GenerationContext,
  targetCurrency: string = 'INR'
): CostOutput {
  const { condition, specialty, location } = context;

  const costBreakdown = generateCostBreakdown(specialty, condition, location, targetCurrency);
  const insuranceGuide = generateInsuranceGuide(condition, specialty);
  const financialAssistance = generateFinancialAssistance(condition, location);

  return {
    costBreakdown,
    insuranceGuide,
    financialAssistance,
  };
}

/**
 * Generate detailed cost breakdown
 */
function generateCostBreakdown(
  specialty: SpecialtyTemplate,
  condition: MedicalConditionInput,
  location?: { country: string; city?: string },
  targetCurrency: string = 'INR'
): CostBreakdown[] {
  const costs: CostBreakdown[] = [];
  const cityModifier = getCityModifier(location?.city);
  const currencyMultiplier = CURRENCY_MULTIPLIERS[targetCurrency] || 1;

  // Get base costs from specialty template
  for (const [treatmentKey, range] of Object.entries(specialty.costRanges)) {
    const baseCurrency = range.currency;
    const baseMin = range.min;
    const baseMax = range.max;

    // Convert to target currency if different
    let minCost = baseMin;
    let maxCost = baseMax;

    if (baseCurrency !== targetCurrency) {
      const fromMultiplier = CURRENCY_MULTIPLIERS[baseCurrency] || 1;
      const toMultiplier = currencyMultiplier;
      minCost = Math.round((baseMin / fromMultiplier) * toMultiplier);
      maxCost = Math.round((baseMax / fromMultiplier) * toMultiplier);
    }

    // Apply city modifier
    minCost = Math.round(minCost * cityModifier);
    maxCost = Math.round(maxCost * cityModifier);

    costs.push({
      treatment: formatTreatmentName(treatmentKey),
      minCost,
      maxCost,
      avgCost: Math.round((minCost + maxCost) / 2),
      currency: targetCurrency,
    });
  }

  // Add standard costs if not present
  const standardCosts = ensureStandardCosts(costs, specialty, cityModifier, targetCurrency);

  return [...costs, ...standardCosts].slice(0, 12);
}

/**
 * Ensure standard cost items are present
 */
function ensureStandardCosts(
  existingCosts: CostBreakdown[],
  specialty: SpecialtyTemplate,
  cityModifier: number,
  currency: string
): CostBreakdown[] {
  const standardItems: Record<string, { min: number; max: number }> = {
    'Consultation': { min: 500, max: 2000 },
    'Follow-up Visit': { min: 300, max: 1000 },
    'Basic Blood Tests': { min: 500, max: 2000 },
    'Comprehensive Health Panel': { min: 2000, max: 8000 },
  };

  const additionalCosts: CostBreakdown[] = [];
  const existingNames = existingCosts.map(c => c.treatment.toLowerCase());

  for (const [name, range] of Object.entries(standardItems)) {
    if (!existingNames.includes(name.toLowerCase())) {
      const minCost = Math.round(range.min * cityModifier);
      const maxCost = Math.round(range.max * cityModifier);

      additionalCosts.push({
        treatment: name,
        minCost,
        maxCost,
        avgCost: Math.round((minCost + maxCost) / 2),
        currency,
      });
    }
  }

  return additionalCosts;
}

/**
 * Generate insurance coverage guide
 */
function generateInsuranceGuide(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): string {
  const conditionName = condition.commonName;
  const severity = condition.severityLevel?.toLowerCase() || 'moderate';

  let guide = `## Insurance Coverage for ${conditionName}\n\n`;

  // General coverage information
  guide += `Most comprehensive health insurance plans in India cover treatment for ${conditionName}. Coverage typically includes:\n\n`;
  guide += `- **Hospitalization expenses**: Room rent, nursing charges, ICU costs\n`;
  guide += `- **Doctor and specialist fees**: ${specialty.specialistTitle} consultations\n`;
  guide += `- **Diagnostic tests**: Laboratory and imaging studies\n`;
  guide += `- **Medications**: In-hospital and sometimes outpatient prescriptions\n`;
  guide += `- **Surgical procedures**: If medically required\n\n`;

  // Pre-existing condition considerations
  guide += `### Pre-existing Condition Considerations\n\n`;

  if (severity === 'chronic' || severity === 'severe') {
    guide += `${conditionName} may be considered a pre-existing condition if diagnosed before purchasing insurance. Most policies have a waiting period of 2-4 years for pre-existing conditions. Some insurers offer plans with shorter waiting periods at higher premiums.\n\n`;
  } else {
    guide += `If ${conditionName} is newly diagnosed after your policy inception, it should be covered under your standard policy terms. Always declare any prior symptoms or treatments during policy application.\n\n`;
  }

  // Tips for coverage
  guide += `### Tips for Maximum Coverage\n\n`;
  guide += `1. **Review your policy document** for specific coverage limits and exclusions\n`;
  guide += `2. **Get pre-authorization** for planned procedures to ensure smooth claims\n`;
  guide += `3. **Choose network hospitals** for cashless claim benefits\n`;
  guide += `4. **Keep all medical documents** organized for claim processing\n`;
  guide += `5. **Understand sub-limits** that may apply to room rent or specific treatments\n\n`;

  // Popular insurers
  guide += `### Insurance Providers with Good Coverage\n\n`;
  guide += `- ICICI Lombard Health Insurance\n`;
  guide += `- HDFC ERGO Health Insurance\n`;
  guide += `- Star Health Insurance\n`;
  guide += `- Bajaj Allianz Health Insurance\n`;
  guide += `- Max Bupa Health Insurance\n`;

  return guide;
}

/**
 * Generate financial assistance information
 */
function generateFinancialAssistance(
  condition: MedicalConditionInput,
  location?: { country: string; city?: string }
): string {
  const conditionName = condition.commonName;
  const countryCode = location?.country?.toLowerCase() || 'in';

  let assistance = `## Financial Assistance Options for ${conditionName} Treatment\n\n`;

  if (countryCode === 'in' || countryCode === 'india') {
    // Government schemes
    assistance += `### Government Health Schemes\n\n`;
    assistance += `**Ayushman Bharat (PM-JAY)**\n`;
    assistance += `- Covers up to ₹5 lakhs per family per year\n`;
    assistance += `- Available for economically weaker sections\n`;
    assistance += `- Check eligibility at mera.pmjay.gov.in\n\n`;

    assistance += `**State Health Insurance Schemes**\n`;
    assistance += `- Many states offer additional health coverage\n`;
    assistance += `- Check with your local health department\n\n`;

    assistance += `**CGHS (Central Government Health Scheme)**\n`;
    assistance += `- Available for central government employees\n`;
    assistance += `- Covers treatment at empaneled hospitals\n\n`;

    // Hospital assistance
    assistance += `### Hospital Financial Assistance\n\n`;
    assistance += `- **Charity wings**: Most large hospitals have charity departments\n`;
    assistance += `- **Payment plans**: EMI options available at many hospitals\n`;
    assistance += `- **Hospital welfare funds**: Apply for financial need assistance\n`;
    assistance += `- **CSR programs**: Some hospitals offer treatment under corporate social responsibility\n\n`;

    // NGOs and foundations
    assistance += `### NGOs and Patient Support Organizations\n\n`;
    assistance += `- **Indian Cancer Society** (for cancer-related conditions)\n`;
    assistance += `- **Give India** - Healthcare funding platform\n`;
    assistance += `- **Milaap** - Medical crowdfunding\n`;
    assistance += `- **Ketto** - Medical fundraising\n`;
    assistance += `- Disease-specific foundations may offer support\n\n`;

    // Tips
    assistance += `### Tips for Managing Treatment Costs\n\n`;
    assistance += `1. Get cost estimates from multiple hospitals\n`;
    assistance += `2. Ask about generic medication options\n`;
    assistance += `3. Check if clinical trials are available\n`;
    assistance += `4. Explore government hospital options\n`;
    assistance += `5. Start a medical fundraiser if needed\n`;
    assistance += `6. Maintain emergency health fund\n`;

  } else {
    // Generic international guidance
    assistance += `### Exploring Financial Assistance\n\n`;
    assistance += `- Check for government health programs in your region\n`;
    assistance += `- Explore hospital charity care programs\n`;
    assistance += `- Consider medical loan options\n`;
    assistance += `- Look for disease-specific foundations\n`;
    assistance += `- Research medical tourism options for cost savings\n`;
  }

  return assistance;
}

/**
 * Get city cost modifier
 */
function getCityModifier(citySlug?: string): number {
  if (!citySlug) return CITY_COST_MODIFIERS.default;

  const normalized = citySlug.toLowerCase().replace(/-/g, '');
  return CITY_COST_MODIFIERS[normalized] || CITY_COST_MODIFIERS.default;
}

/**
 * Format treatment name from camelCase
 */
function formatTreatmentName(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Estimate cost range for a treatment based on severity and type
 */
export function estimateTreatmentCost(
  treatmentName: string,
  treatmentType: 'medication' | 'procedure' | 'surgery' | 'therapy' | 'lifestyle' | 'alternative',
  severity: string = 'moderate',
  currency: string = 'INR'
): { min: number; max: number } {
  // Base cost ranges by treatment type (in INR)
  const baseCosts: Record<string, { min: number; max: number }> = {
    medication: { min: 500, max: 5000 },
    therapy: { min: 1000, max: 5000 },
    procedure: { min: 10000, max: 100000 },
    surgery: { min: 50000, max: 500000 },
    lifestyle: { min: 0, max: 2000 },
    alternative: { min: 500, max: 5000 },
  };

  // Severity multipliers
  const severityMultipliers: Record<string, number> = {
    mild: 0.7,
    moderate: 1.0,
    severe: 1.5,
    critical: 2.0,
  };

  const base = baseCosts[treatmentType] || baseCosts.therapy;
  const multiplier = severityMultipliers[severity.toLowerCase()] || 1.0;

  const minCost = Math.round(base.min * multiplier);
  const maxCost = Math.round(base.max * multiplier);

  // Convert to target currency if not INR
  if (currency !== 'INR') {
    const rate = CURRENCY_MULTIPLIERS[currency] || 1;
    return {
      min: Math.round(minCost / CURRENCY_MULTIPLIERS.INR * rate),
      max: Math.round(maxCost / CURRENCY_MULTIPLIERS.INR * rate),
    };
  }

  return { min: minCost, max: maxCost };
}

/**
 * Generate cost comparison table data
 */
export function generateCostComparison(
  costs: CostBreakdown[],
  hospitalTiers: (keyof typeof HOSPITAL_TIER_MODIFIERS)[] = ['premium', 'standard', 'government']
): Array<{ treatment: string; tiers: Record<string, { min: number; max: number }> }> {
  return costs.map(cost => ({
    treatment: cost.treatment,
    tiers: Object.fromEntries(
      hospitalTiers.map(tier => [
        tier,
        {
          min: Math.round(cost.minCost * HOSPITAL_TIER_MODIFIERS[tier]),
          max: Math.round(cost.maxCost * HOSPITAL_TIER_MODIFIERS[tier]),
        },
      ])
    ),
  }));
}

export default {
  generateCosts,
  estimateTreatmentCost,
  generateCostComparison,
};
