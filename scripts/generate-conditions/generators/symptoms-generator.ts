/**
 * Symptoms Generator
 *
 * Generates comprehensive symptom content for condition pages including
 * primary symptoms, early warning signs, and emergency indicators.
 */

import type {
  MedicalConditionInput,
  SpecialtyTemplate,
  GenerationContext,
} from '../templates/base-template';

export interface SymptomsOutput {
  primarySymptoms: string[];
  earlyWarningSigns: string[];
  emergencySigns: string[];
}

/**
 * Generate symptom sections for a condition
 */
export function generateSymptoms(context: GenerationContext): SymptomsOutput {
  const { condition, specialty } = context;

  // Start with symptoms from the condition record
  const conditionSymptoms = Array.isArray(condition.symptoms)
    ? condition.symptoms
    : [];

  // Merge with specialty-specific patterns
  const primarySymptoms = generatePrimarySymptoms(conditionSymptoms, specialty);
  const earlyWarningSigns = generateEarlyWarningSigns(conditionSymptoms, specialty, condition);
  const emergencySigns = generateEmergencySigns(specialty, condition);

  return {
    primarySymptoms,
    earlyWarningSigns,
    emergencySigns,
  };
}

/**
 * Generate primary symptoms list
 */
function generatePrimarySymptoms(
  conditionSymptoms: string[],
  specialty: SpecialtyTemplate
): string[] {
  const symptoms = new Set<string>();

  // Add condition-specific symptoms first
  conditionSymptoms.forEach(symptom => {
    if (symptom && symptom.trim()) {
      symptoms.add(normalizeSymptom(symptom));
    }
  });

  // If we have fewer than 5 symptoms, add relevant specialty symptoms
  if (symptoms.size < 5 && specialty.commonSymptomPatterns.length > 0) {
    const relevantSpecialtySymptoms = findRelevantSymptoms(
      conditionSymptoms,
      specialty.commonSymptomPatterns
    );

    relevantSpecialtySymptoms.forEach(symptom => {
      if (symptoms.size < 10) {
        symptoms.add(symptom);
      }
    });
  }

  return Array.from(symptoms).slice(0, 12);
}

/**
 * Generate early warning signs
 */
function generateEarlyWarningSigns(
  conditionSymptoms: string[],
  specialty: SpecialtyTemplate,
  condition: MedicalConditionInput
): string[] {
  const earlySignsPatterns = [
    'Mild or intermittent {symptom}',
    'Occasional {symptom} that comes and goes',
    'Subtle changes in {area}',
    'Early fatigue or tiredness',
    'Slight discomfort that progresses',
    'Initial mild symptoms that may be overlooked',
  ];

  const earlySigns: string[] = [];

  // Create early warning versions of primary symptoms
  conditionSymptoms.slice(0, 3).forEach(symptom => {
    if (symptom && typeof symptom === 'string') {
      earlySigns.push(`Mild or occasional ${symptom.toLowerCase()}`);
    }
  });

  // Add condition-type-specific early signs
  const severityLevel = condition.severityLevel?.toLowerCase();

  if (severityLevel === 'severe' || severityLevel === 'critical') {
    earlySigns.push(
      'Gradual onset of symptoms over days or weeks',
      'Symptoms that seem to be getting worse',
      'Persistent symptoms despite home remedies'
    );
  }

  // Add specialty-specific early signs
  switch (specialty.specialty) {
    case 'Cardiology':
      earlySigns.push(
        'Unusual fatigue during normal activities',
        'Shortness of breath with minimal exertion',
        'Mild chest discomfort that resolves quickly'
      );
      break;
    case 'Neurology':
      earlySigns.push(
        'Brief episodes of confusion or forgetfulness',
        'Occasional numbness or tingling',
        'Mild headaches that are more frequent than usual'
      );
      break;
    case 'Gastroenterology':
      earlySigns.push(
        'Changes in appetite or eating habits',
        'Mild digestive discomfort after meals',
        'Subtle changes in bowel habits'
      );
      break;
    case 'Orthopedics':
      earlySigns.push(
        'Stiffness that improves with movement',
        'Mild pain that responds to rest',
        'Slight decrease in range of motion'
      );
      break;
    case 'Dermatology':
      earlySigns.push(
        'Minor skin changes or discoloration',
        'Occasional itching or irritation',
        'Small patches that spread slowly'
      );
      break;
  }

  return Array.from(new Set(earlySigns)).slice(0, 8);
}

/**
 * Generate emergency signs
 */
function generateEmergencySigns(
  specialty: SpecialtyTemplate,
  condition: MedicalConditionInput
): string[] {
  const emergencySigns: string[] = [];

  // Add specialty-specific emergency indicators
  if (specialty.emergencyIndicators.length > 0) {
    // Select relevant emergency indicators
    emergencySigns.push(...specialty.emergencyIndicators.slice(0, 5));
  }

  // Add universal emergency signs based on severity
  const severityLevel = condition.severityLevel?.toLowerCase();

  if (severityLevel === 'critical' || severityLevel === 'emergency') {
    emergencySigns.push(
      'Sudden severe symptoms requiring immediate attention',
      'Loss of consciousness or unresponsiveness',
      'Severe difficulty breathing',
      'Signs of shock (pale, cold, clammy skin)'
    );
  }

  // Add general emergency signs if list is short
  if (emergencySigns.length < 5) {
    emergencySigns.push(
      'Symptoms rapidly worsening',
      'High fever with other severe symptoms',
      'Severe pain that is unbearable',
      'Confusion or altered mental state'
    );
  }

  return Array.from(new Set(emergencySigns)).slice(0, 8);
}

/**
 * Find symptoms from specialty patterns that relate to condition symptoms
 */
function findRelevantSymptoms(
  conditionSymptoms: string[],
  specialtySymptoms: string[]
): string[] {
  // Simple keyword matching to find related symptoms
  const keywords = conditionSymptoms
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Score specialty symptoms by relevance
  const scored = specialtySymptoms.map(symptom => {
    const symptomLower = symptom.toLowerCase();
    let score = 0;

    keywords.forEach(keyword => {
      if (symptomLower.includes(keyword)) {
        score += 1;
      }
    });

    // Boost score for body system matches
    const bodySystemKeywords = ['pain', 'discomfort', 'swelling', 'weakness', 'fatigue'];
    bodySystemKeywords.forEach(bsk => {
      if (symptomLower.includes(bsk)) {
        score += 0.5;
      }
    });

    return { symptom, score };
  });

  // Sort by score and return top matches
  return scored
    .sort((a, b) => b.score - a.score)
    .filter(s => s.score > 0)
    .map(s => s.symptom);
}

/**
 * Normalize symptom text for consistency
 */
function normalizeSymptom(symptom: string): string {
  if (!symptom || typeof symptom !== 'string') {
    return '';
  }
  return symptom
    .trim()
    .replace(/^\s*[-•*]\s*/, '') // Remove bullet points
    .replace(/^\d+\.\s*/, '') // Remove numbering
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^[a-z]/, c => c.toUpperCase()); // Capitalize first letter
}

/**
 * Generate symptom severity indicators
 */
export function classifySymptomSeverity(
  symptom: string
): 'mild' | 'moderate' | 'severe' {
  const severeKeywords = [
    'severe', 'intense', 'unbearable', 'extreme', 'sudden',
    'emergency', 'acute', 'uncontrollable', 'debilitating'
  ];

  const moderateKeywords = [
    'persistent', 'recurring', 'chronic', 'progressive',
    'worsening', 'frequent', 'noticeable'
  ];

  const symptomLower = symptom.toLowerCase();

  if (severeKeywords.some(kw => symptomLower.includes(kw))) {
    return 'severe';
  }

  if (moderateKeywords.some(kw => symptomLower.includes(kw))) {
    return 'moderate';
  }

  return 'mild';
}

export default {
  generateSymptoms,
  classifySymptomSeverity,
};
