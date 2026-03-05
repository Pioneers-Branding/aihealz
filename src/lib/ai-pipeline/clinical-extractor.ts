import prisma from '@/lib/db';

/**
 * Clinical Extractor — LLM-based Structured Entity Extraction
 *
 * Takes sanitized medical report text and extracts structured clinical data
 * using the active system prompt from the Prompt Lab.
 *
 * Extraction output:
 * - Primary indicators with severity ratings
 * - Required specialist type
 * - Mapped condition slug
 * - Urgency level
 * - Confidence score
 */

export interface ClinicalIndicator {
    name: string;
    value: string;
    normalRange: string;
    severity: 'normal' | 'borderline' | 'high' | 'critical';
}

export interface ClinicalExtraction {
    primaryIndicators: ClinicalIndicator[];
    specialtyRequired: string;
    conditionSlug: string;
    urgencyLevel: 'routine' | 'urgent' | 'emergency';
    confidenceScore: number;
    plainEnglish: string;
    questionsToAsk: string[];
    lifestyleFactors: string[];
}

// Default system prompt (fallback if Prompt Lab is empty)
const DEFAULT_SYSTEM_PROMPT = `You are a medical report analysis assistant for aihealz.com. You are NOT a doctor. You provide INFORMATIONAL summaries only, NEVER diagnoses.

TASK: Analyze the provided medical report text and extract structured data.

COMMON LAB VALUE FORMATS TO RECOGNIZE:
- Standard format: "Hemoglobin: 12.5 g/dL" or "HB 12.5 g/dL"
- Tabular format: "Hemoglobin | 12.5 | g/dL | 13.5-17.5"
- Range format: "WBC: 8500 /cumm (4000-11000)"
- Flagged values: "Glucose: 180 mg/dL (H)" where H=High, L=Low
- Multiline tables with headers like "Test | Result | Unit | Reference Range"
- Scientific notation: "RBC 4.5 x 10^6/uL"

PARSING RULES FOR LAB VALUES:
1. Extract the test name, numeric value, and unit separately
2. Include the reference range if present
3. For flagged values (H/L), map to severity: H->high, L->borderline/high depending on context
4. Common tests to look for: CBC (RBC, WBC, Hemoglobin, Hematocrit, Platelets, MCV, MCH, MCHC),
   Lipid Panel (Cholesterol, HDL, LDL, Triglycerides), Metabolic Panel (Glucose, BUN, Creatinine,
   Sodium, Potassium, Chloride, CO2), Liver Panel (ALT, AST, ALP, Bilirubin, Albumin),
   Thyroid (TSH, T3, T4), HbA1c, Vitamin D, B12, Iron studies, etc.

OUTPUT FORMAT (JSON only, no markdown wrapping):
{
  "primary_indicators": [
    {"name": "indicator name", "value": "measured value with unit", "normal_range": "expected range", "severity": "normal|borderline|high|critical"}
  ],
  "specialty_required": "specialist type",
  "condition_slug": "mapped-condition-slug",
  "urgency_level": "routine|urgent|emergency",
  "confidence_score": 0.85,
  "plain_english": "2-3 sentence summary in simple language",
  "questions_to_ask": ["question 1", "question 2", "question 3"],
  "lifestyle_factors": ["factor 1", "factor 2", "factor 3"]
}

SEVERITY GUIDELINES:
- normal: Value within reference range
- borderline: Slightly outside range (within 10-15%)
- high: Notably outside range (needs attention but not urgent)
- critical: Severely abnormal (may need prompt medical attention)

RULES:
1. NEVER provide a diagnosis. Use "may indicate..." or "your doctor should evaluate..."
2. Map findings to medical specialties accurately.
3. Set urgency to "emergency" ONLY for immediately life-threatening values (e.g., extremely low hemoglobin <7, blood glucose <50 or >500, potassium <2.5 or >6.5).
4. Confidence: 1.0 = clear data with all values parsed, 0.5 = partial/some values unclear, <0.5 = insufficient data to analyze.
5. Questions should be specific to findings.
6. Lifestyle factors should be actionable and culturally sensitive.
7. Always include units in the value field (e.g., "12.5 g/dL" not just "12.5").`;

/**
 * Get the active system prompt from the Prompt Lab, or use default.
 */
async function getActivePrompt(promptType: string): Promise<string> {
    const entry = await prisma.promptLabEntry.findFirst({
        where: { promptType, isActive: true },
        select: { systemPrompt: true },
        orderBy: { updatedAt: 'desc' },
    });
    return entry?.systemPrompt || DEFAULT_SYSTEM_PROMPT;
}

/**
 * Extract clinical entities from sanitized report text using LLM.
 */
export async function extractClinicalEntities(
    sanitizedText: string,
    modelOverride?: string
): Promise<{ extraction: ClinicalExtraction; tokenCount: number; latencyMs: number }> {
    const startTime = Date.now();
    const systemPrompt = await getActivePrompt('clinical_extraction');
    const model = modelOverride || process.env.AI_MODEL || 'gpt-4o-mini';

    // Call the LLM API
    const response = await callLLM(systemPrompt, sanitizedText, model);

    const latencyMs = Date.now() - startTime;

    // Parse response
    const extraction = parseExtractionResponse(response.content);

    return {
        extraction,
        tokenCount: response.tokenCount,
        latencyMs,
    };
}

/**
 * Call the LLM API (OpenAI-compatible endpoint).
 * Supports OpenAI, OpenRouter, and any compatible API.
 */
async function callLLM(
    systemPrompt: string,
    userMessage: string,
    model: string
): Promise<{ content: string; tokenCount: number }> {
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    const apiBase = process.env.AI_API_BASE || 'https://api.openai.com/v1';

    if (!apiKey) {
        throw new Error('AI_API_KEY or OPENAI_API_KEY environment variable is required');
    }

    const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.2, // Low temperature for consistency
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const tokenCount = data.usage?.total_tokens || 0;

    return { content, tokenCount };
}

/**
 * Parse and validate the LLM's JSON response into a ClinicalExtraction.
 */
function parseExtractionResponse(rawContent: string): ClinicalExtraction {
    let parsed: Record<string, unknown>;

    try {
        parsed = JSON.parse(rawContent);
    } catch {
        // If JSON parsing fails, return a low-confidence result
        return {
            primaryIndicators: [],
            specialtyRequired: 'General Physician',
            conditionSlug: '',
            urgencyLevel: 'routine',
            confidenceScore: 0.1,
            plainEnglish: 'We were unable to fully parse this report. Please consult your doctor directly.',
            questionsToAsk: [
                'Can you help me understand what this report shows?',
                'Are there any values I should be concerned about?',
                'What follow-up tests might be needed?',
            ],
            lifestyleFactors: [],
        };
    }

    // Validate and normalize
    const indicators = Array.isArray(parsed.primary_indicators)
        ? parsed.primary_indicators.map((ind: Record<string, string>) => ({
            name: String(ind.name || ''),
            value: String(ind.value || ''),
            normalRange: String(ind.normal_range || ''),
            severity: (['normal', 'borderline', 'high', 'critical'].includes(ind.severity)
                ? ind.severity
                : 'normal') as ClinicalIndicator['severity'],
        }))
        : [];

    const urgency = (['routine', 'urgent', 'emergency'].includes(parsed.urgency_level as string)
        ? parsed.urgency_level
        : 'routine') as ClinicalExtraction['urgencyLevel'];

    const confidence = typeof parsed.confidence_score === 'number'
        ? Math.min(Math.max(parsed.confidence_score, 0), 1)
        : 0.5;

    return {
        primaryIndicators: indicators,
        specialtyRequired: String(parsed.specialty_required || 'General Physician'),
        conditionSlug: String(parsed.condition_slug || ''),
        urgencyLevel: urgency,
        confidenceScore: confidence,
        plainEnglish: String(parsed.plain_english || ''),
        questionsToAsk: Array.isArray(parsed.questions_to_ask)
            ? parsed.questions_to_ask.map(String).slice(0, 5)
            : [],
        lifestyleFactors: Array.isArray(parsed.lifestyle_factors)
            ? parsed.lifestyle_factors.map(String).slice(0, 5)
            : [],
    };
}
