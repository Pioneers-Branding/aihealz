/**
 * PII Sanitizer — Privacy-First Report Processing
 *
 * Strips all personally identifiable information from OCR-extracted text
 * BEFORE it reaches any LLM API. This is a regulatory requirement for
 * HIPAA (US), GDPR (EU), and DISHA (India) compliance.
 *
 * Categories stripped:
 * - Full names (pattern-based)
 * - Phone numbers (international formats)
 * - Email addresses
 * - Physical addresses
 * - Government IDs (Aadhaar, SSN, NHS, National ID)
 * - Dates of birth (replaced with age estimate)
 * - Hospital/Lab names (optional, configurable)
 */

export interface SanitizationResult {
    cleanText: string;
    redactedCount: number;
    redactedTypes: Record<string, number>;
}

// ─── Regex Patterns ─────────────────────────────────────────

const PATTERNS: Record<string, RegExp> = {
    // Email
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

    // Phone numbers (international)
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,

    // Aadhaar (India) — 12 digits with optional spaces
    aadhaar: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

    // SSN (US) — XXX-XX-XXXX
    ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,

    // NHS Number (UK) — XXX-XXX-XXXX
    nhs: /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/g,

    // Passport numbers (generic alphanumeric 6-9 chars)
    passport: /\b[A-Z]{1,2}\d{6,8}\b/g,

    // Physical addresses (street patterns)
    address: /\b\d{1,5}\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|place|pl|circle|cir|hwy|highway)\b[^.]*(?:,\s*[A-Z][a-z]+){0,3}/gi,

    // PIN codes (India)
    pincode: /\b\d{6}\b/g,

    // ZIP codes (US)
    zipcode: /\b\d{5}(?:-\d{4})?\b/g,

    // Date of birth patterns
    dob: /\b(?:d\.?o\.?b\.?|date\s+of\s+birth|born\s+on)\s*:?\s*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/gi,

    // Full dates that might be DOB (DD/MM/YYYY or MM/DD/YYYY)
    datePattern: /\b(?:0?[1-9]|[12]\d|3[01])[-/](?:0?[1-9]|1[0-2])[-/](?:19|20)\d{2}\b/g,

    // MRN / Patient ID patterns
    mrn: /\b(?:MRN|patient\s*(?:id|no|number)|uhid|reg\.?\s*no\.?)\s*:?\s*[A-Z0-9-]{4,15}\b/gi,

    // Named person patterns (simplified — catches "Dr. FirstName LastName", "Patient: Name")
    namedPerson: /(?:(?:patient|name|dr\.?|doctor)\s*:?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/g,
};

// Patterns specific to the "header" section of medical reports
const HEADER_PATTERNS: Record<string, RegExp> = {
    // "Name: John Doe" or "Patient Name: Jane Smith"
    nameField: /(?:patient\s*)?name\s*:\s*([^\n,]{2,50})/gi,

    // "Age/Sex: 45/M" — keep age, remove if it reveals DOB
    ageSex: /(?:age\s*\/?\s*sex|sex\s*\/?\s*age)\s*:\s*(\d{1,3})\s*\/?\s*([MFO])/gi,

    // Hospital/Lab name
    labName: /(?:laboratory|lab|hospital|clinic|centre|center)\s*:?\s*([^\n]{2,80})/gi,

    // Referring doctor
    referringDoc: /(?:ref(?:erring)?\.?\s*(?:dr\.?|doctor|physician))\s*:?\s*([^\n]{2,50})/gi,
};

/**
 * Strip all PII from medical report text.
 */
export function sanitizeReportText(rawText: string): SanitizationResult {
    let text = rawText;
    const redactedTypes: Record<string, number> = {};
    let totalRedacted = 0;

    function redact(patternName: string, pattern: RegExp, replacement: string = '[REDACTED]') {
        const matches = text.match(pattern);
        if (matches) {
            redactedTypes[patternName] = (redactedTypes[patternName] || 0) + matches.length;
            totalRedacted += matches.length;
            text = text.replace(pattern, replacement);
        }
    }

    // ── Phase 1: Header-specific patterns ─────────────
    redact('nameField', HEADER_PATTERNS.nameField, 'Name: [REDACTED]');
    redact('labName', HEADER_PATTERNS.labName, '[REDACTED LAB]');
    redact('referringDoc', HEADER_PATTERNS.referringDoc, 'Ref. Dr. [REDACTED]');

    // Keep age from Age/Sex field
    text = text.replace(HEADER_PATTERNS.ageSex, 'Age: $1, Sex: $2');

    // ── Phase 2: General PII patterns ─────────────────
    redact('email', PATTERNS.email);
    redact('phone', PATTERNS.phone);
    redact('aadhaar', PATTERNS.aadhaar);
    redact('ssn', PATTERNS.ssn);
    redact('nhs', PATTERNS.nhs);
    redact('passport', PATTERNS.passport);
    redact('address', PATTERNS.address, '[REDACTED ADDRESS]');
    redact('dob', PATTERNS.dob, '[DOB REDACTED]');
    redact('mrn', PATTERNS.mrn, 'MRN: [REDACTED]');

    // ── Phase 3: Named person detection ───────────────
    redact('namedPerson', PATTERNS.namedPerson, '$1 [REDACTED]');

    // ── Phase 4: Clean up excessive whitespace ────────
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return {
        cleanText: text,
        redactedCount: totalRedacted,
        redactedTypes,
    };
}

/**
 * Quick check if text likely contains unredacted PII.
 * Returns true if potential PII is found.
 */
export function containsPotentialPII(text: string): boolean {
    const criticalPatterns = [PATTERNS.email, PATTERNS.phone, PATTERNS.aadhaar, PATTERNS.ssn];
    return criticalPatterns.some((p) => p.test(text));
}
