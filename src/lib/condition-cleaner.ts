/**
 * Condition Data Cleaner
 *
 * Cleans up ICD-10 short descriptions and filters out non-condition entries
 * to improve data quality in the conditions directory.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ICD-10 ABBREVIATION EXPANSIONS
// ═══════════════════════════════════════════════════════════════════════════

const ICD_ABBREVIATIONS: Record<string, string> = {
    // Common abbreviations
    'ac': 'acute',
    'chr': 'chronic',
    'unsp': 'unspecified',
    'nec': 'not elsewhere classified',
    'nos': 'not otherwise specified',
    'w/': 'with',
    'w/o': 'without',
    'fx': 'fracture',
    'dx': 'diagnosis',
    'hx': 'history',
    'sx': 'symptoms',
    'tx': 'treatment',
    'rx': 'prescription',
    'pt': 'patient',
    'abd': 'abdominal',
    'abn': 'abnormal',
    'acc': 'accidental',
    'ant': 'anterior',
    'bilat': 'bilateral',
    'ca': 'cancer',
    'cns': 'central nervous system',
    'comp': 'complicated',
    'cong': 'congenital',
    'dist': 'distal',
    'dz': 'disease',
    'extrm': 'extremity',
    'genit': 'genital',
    'hem': 'hemorrhage',
    'inf': 'infection',
    'inj': 'injury',
    'intl': 'initial',
    'lac': 'laceration',
    'lt': 'left',
    'rt': 'right',
    'mal': 'malignant',
    'malig': 'malignant',
    'msk': 'musculoskeletal',
    'musc': 'muscle',
    'neopl': 'neoplasm',
    'oth': 'other',
    'pnctr': 'puncture',
    'periph': 'peripheral',
    'postop': 'postoperative',
    'preop': 'preoperative',
    'proc': 'procedure',
    'prox': 'proximal',
    'subcu': 'subcutaneous',
    'subseq': 'subsequent',
    'surg': 'surgical',
    'sys': 'system',
    'thombos': 'thrombosis',
    'emblsm': 'embolism',
    'circ': 'circulatory',
    'dermatologic': 'dermatological',
    'org': 'organ',
    'bi': 'bilateral',
    'encntr': 'encounter',
    'expos': 'exposure',
    'compl': 'complication',
    'seque': 'sequela',
};

// ═══════════════════════════════════════════════════════════════════════════
// NON-CONDITION PATTERNS (to filter out)
// ═══════════════════════════════════════════════════════════════════════════

const NON_CONDITION_PATTERNS = [
    // Programs and services
    /screening program/i,
    /prevention program/i,
    /control program/i,
    /immunization schedule/i,
    /vaccination schedule/i,
    /health program/i,
    /surveillance/i,
    /health screening/i,
    /health promotion/i,

    // Administrative/procedural
    /encounter for/i,
    /examination for/i,
    /supervision of/i,
    /counseling for/i,
    /observation for/i,
    /screening for/i,
    /^contact with/i,
    /^exposure to/i,

    // Gestational milestones (not conditions)
    /^\d+ weeks gestation/i,
    /weeks of gestation/i,
    /gestational week/i,

    // General categories (too vague)
    /^other specified/i,
    /^unspecified/i,
    /^other diseases of/i,
    /^other disorders of/i,

    // Services/specialties (not conditions)
    /^disaster medicine$/i,
    /^maternal and child health$/i,
    /^communicable disease control$/i,
    /^epidemiological/i,
    /^environmental health$/i,
    /^occupational health$/i,
    /^travel medicine$/i,
    /^sports medicine$/i,
];

// ═══════════════════════════════════════════════════════════════════════════
// BADLY FORMATTED NAME PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

const POORLY_FORMATTED_PATTERNS = [
    // Truncated ICD codes (excessive abbreviations)
    /^[A-Z][a-z]{1,2}\s+[a-z]{2,4}\s+and\s+[a-z]{2,6}\s+unsp/i,  // "Ac emblsm and thombos unsp..."
    /\b[a-z]{2,4}\s+[a-z]{2,4}\s+[a-z]{2,4}\s+[a-z]{2,4}\b/i,     // Multiple 2-4 char words in a row

    // Too short or cryptic
    /^.{1,15}$/,  // Names less than 15 characters are often cryptic

    // All caps (raw codes)
    /^[A-Z0-9\s]+$/,
];

// ═══════════════════════════════════════════════════════════════════════════
// SEVERITY OVERRIDES
// ═══════════════════════════════════════════════════════════════════════════

interface SeverityOverride {
    pattern: RegExp;
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
}

const SEVERITY_OVERRIDES: SeverityOverride[] = [
    // Critical conditions
    { pattern: /cardiac arrest/i, severity: 'critical' },
    { pattern: /respiratory failure/i, severity: 'critical' },
    { pattern: /septic shock/i, severity: 'critical' },
    { pattern: /stroke/i, severity: 'critical' },
    { pattern: /heart attack|myocardial infarction/i, severity: 'critical' },
    { pattern: /anaphylaxis/i, severity: 'critical' },
    { pattern: /pulmonary embolism/i, severity: 'critical' },
    { pattern: /meningitis/i, severity: 'severe' },

    // Severe conditions
    { pattern: /cancer|carcinoma|malignant/i, severity: 'severe' },
    { pattern: /fracture/i, severity: 'moderate' },
    { pattern: /diabetes mellitus/i, severity: 'moderate' },

    // Mild/informational
    { pattern: /common cold/i, severity: 'mild' },
    { pattern: /minor/i, severity: 'mild' },
    { pattern: /mild/i, severity: 'mild' },
    { pattern: /bruise|contusion/i, severity: 'mild' },
    { pattern: /pregnancy.*weeks/i, severity: 'mild' },  // Pregnancy milestones
];

// ═══════════════════════════════════════════════════════════════════════════
// CLEANING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Expand ICD-10 abbreviations in a condition name
 */
export function expandAbbreviations(name: string): string {
    let result = name;

    // Replace abbreviations (word boundaries)
    for (const [abbr, full] of Object.entries(ICD_ABBREVIATIONS)) {
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
        result = result.replace(regex, full);
    }

    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim();

    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    return result;
}

/**
 * Check if a name represents a non-condition entry
 */
export function isNonCondition(name: string): boolean {
    return NON_CONDITION_PATTERNS.some(pattern => pattern.test(name));
}

/**
 * Check if a name is poorly formatted (too cryptic)
 */
export function isPoorlyFormatted(name: string): boolean {
    // Check for excessive abbreviations (more than 3 words under 5 chars each)
    const words = name.split(/\s+/);
    const shortWords = words.filter(w => w.length <= 4 && /^[a-z]+$/i.test(w));
    if (shortWords.length >= 4 && shortWords.length / words.length > 0.5) {
        return true;
    }

    // Check for truncated appearance
    if (name.endsWith(',') || name.endsWith('-')) {
        return true;
    }

    return false;
}

/**
 * Get severity override if applicable
 */
export function getSeverityOverride(name: string): 'mild' | 'moderate' | 'severe' | 'critical' | null {
    for (const override of SEVERITY_OVERRIDES) {
        if (override.pattern.test(name)) {
            return override.severity;
        }
    }
    return null;
}

/**
 * Clean a condition name for display
 */
export function cleanConditionName(name: string): string {
    let cleaned = name;

    // Remove encounter types
    cleaned = cleaned.replace(/,?\s*(initial encounter|subsequent encounter|sequela)$/i, '');

    // Remove trailing punctuation
    cleaned = cleaned.replace(/[,\-;:]+\s*$/, '');

    // Expand abbreviations
    cleaned = expandAbbreviations(cleaned);

    // Title case significant words
    cleaned = cleaned.replace(/\b\w/g, c => c.toUpperCase());

    // Lowercase common words
    cleaned = cleaned.replace(/\b(And|Or|Of|The|In|On|At|To|For|With|Without|A|An)\b/g,
        match => match.toLowerCase());

    // Ensure first letter is uppercase
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    return cleaned.trim();
}

/**
 * Process conditions for the directory - filters and cleans
 */
export interface CleanedCondition {
    slug: string;
    name: string;
    originalName: string;
    specialty: string;
    severityLevel: string | null;
    bodySystem: string | null;
    isClean: boolean;
}

export function processConditionsForDirectory(
    conditions: {
        slug: string;
        commonName: string;
        specialistType: string;
        severityLevel: string | null;
        bodySystem: string | null;
    }[]
): CleanedCondition[] {
    return conditions
        // Filter out non-conditions
        .filter(c => !isNonCondition(c.commonName))
        // Map to cleaned structure
        .map(c => ({
            slug: c.slug,
            name: cleanConditionName(c.commonName),
            originalName: c.commonName,
            specialty: c.specialistType,
            severityLevel: c.severityLevel,
            bodySystem: c.bodySystem,
            isClean: !isPoorlyFormatted(c.commonName),
        }))
        // Prioritize clean names
        .sort((a, b) => {
            // Clean names first
            if (a.isClean && !b.isClean) return -1;
            if (!a.isClean && b.isClean) return 1;
            // Then alphabetically
            return a.name.localeCompare(b.name);
        });
}

/**
 * Deduplicate conditions by base name
 */
export function deduplicateConditions(conditions: CleanedCondition[]): CleanedCondition[] {
    const seen = new Map<string, CleanedCondition>();

    for (const condition of conditions) {
        // Create a normalized key for deduplication
        const key = condition.name
            .toLowerCase()
            .replace(/\b(left|right|bilateral|unspecified|initial|subsequent|sequela)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Keep the first (cleanest) version
        if (!seen.has(key)) {
            seen.set(key, condition);
        } else {
            // Prefer the one with a cleaner name
            const existing = seen.get(key)!;
            if (!existing.isClean && condition.isClean) {
                seen.set(key, condition);
            }
        }
    }

    return Array.from(seen.values());
}
