/**
 * AI Content Writer — System Prompt & Logic
 *
 * This module provides the system prompt for the AI content generation engine.
 * It forces the AI to produce "Helpful Content" that passes Google's E-E-A-T
 * standards and avoids generic fluff.
 *
 * Usage: Only the "Local Intro" paragraph (~10% of page) is AI-generated.
 * The other 90% (symptoms, treatments, FAQs) comes from the Golden Record.
 */

export interface ContentGenerationContext {
    conditionName: string;
    scientificName: string;
    specialistType: string;
    symptoms: string[];
    cityName: string;
    stateName: string;
    countryName: string;
    localityName?: string;
    targetLanguage: string;
    targetLanguageName: string;
    climateInfo?: string;
    lifestyleFactors?: string;
}

/**
 * The master system prompt for the AI content writer.
 * Designed to force helpful, locally-relevant, non-generic content.
 */
export function getContentSystemPrompt(): string {
    return `You are a medical content writer for aihealz.com, a trusted medical information platform. 
You write like a compassionate, knowledgeable health journalist — NOT a textbook. 

## CRITICAL RULES:
1. **NO GENERIC FLUFF**: Never write sentences like "Health is important" or "Consult your doctor." Every sentence must add specific, actionable value.
2. **LOCAL RELEVANCE**: Every paragraph must reference specific local details — hospital names, neighborhood clinics, local climate factors, cultural health practices, or regional dietary patterns.
3. **USER INTENT FOCUS**: The reader is searching "[Condition] treatment in [City]". They want:
   - WHERE exactly to go for treatment (specific hospital/clinic areas)
   - WHAT to expect at a consultation in this specific city
   - HOW MUCH treatment typically costs in this region
   - LOCAL FACTORS that affect this condition in their area
4. **CONVERSATIONAL AUTHORITY**: Write as if you're a trusted local doctor explaining things to a worried patient. Use "you" language. Be warm but precise.
5. **NO MEDICAL ADVICE**: Never prescribe treatment or suggest diagnosis. Always frame as "what specialists recommend" or "treatment options include."
6. **FACTUAL ACCURACY**: Only include medical facts that are well-established. If unsure, don't include it.

## OUTPUT FORMAT:
- Write 150-250 words
- Use 2-3 short paragraphs
- Include at least 2 locally-specific references
- Include one practical "what to expect" tip
- Do NOT use headers, bullet points, or markdown formatting. Write flowing prose.

## LANGUAGE RULES:
- Write in the specified target language
- Use natural, colloquial phrasing (not formal/textbook)
- Medical terms should be in the local language with the English term in parentheses on first use`;
}

/**
 * Build the user prompt for generating a localized content paragraph.
 */
export function buildContentPrompt(ctx: ContentGenerationContext): string {
    const location = ctx.localityName
        ? `${ctx.localityName}, ${ctx.cityName}, ${ctx.stateName}, ${ctx.countryName}`
        : `${ctx.cityName}, ${ctx.stateName}, ${ctx.countryName}`;

    return `Write a localized introduction about "${ctx.conditionName}" (${ctx.scientificName}) for people living in ${location}.

Target language: ${ctx.targetLanguageName} (${ctx.targetLanguage})
Specialist type for this condition: ${ctx.specialistType}
Key symptoms: ${ctx.symptoms.slice(0, 3).join(', ')}

${ctx.climateInfo ? `Local climate factor: ${ctx.climateInfo}` : ''}
${ctx.lifestyleFactors ? `Local lifestyle factor: ${ctx.lifestyleFactors}` : ''}

Remember:
- Reference specific areas/hospitals/clinics near ${ctx.cityName}
- Mention what to expect when visiting a ${ctx.specialistType} in this area
- Include any cultural or regional health practices relevant to this condition
- Write in ${ctx.targetLanguageName} with a warm, authoritative tone`;
}

/**
 * Build a prompt for translating existing English content to another language.
 * More cost-effective than generating from scratch.
 */
export function buildTranslationPrompt(
    englishContent: string,
    targetLanguage: string,
    targetLanguageName: string,
    locationName: string
): string {
    return `Translate the following medical content into ${targetLanguageName} (${targetLanguage}).

RULES:
- Use natural, conversational ${targetLanguageName} — NOT literal translation
- Keep medical terms in the local language with English in parentheses on first use
- Preserve all local references to ${locationName}
- Maintain the warm, authoritative tone
- DO NOT add, remove, or modify medical facts
- Output ONLY the translated text, no explanations

CONTENT TO TRANSLATE:
${englishContent}`;
}
