import prisma from '@/lib/db';

/**
 * Intent Analyzer
 * 
 * Determines primary 'Intent Keyword' for condition/region pairs.
 * Uses Google Search Console API data if available, or heuristic fallback.
 * 
 * Flow:
 * 1. Check if GSC data exists for this condition+location.
 * 2. If yes, pick query with highest impressions/CTR mix.
 * 3. If no, generate heuristic pattern: "{Condition} treatment {City}" or "{Specialist} for {Condition} in {City}".
 */

export async function getIntentKeyword(
    conditionSlug: string,
    conditionName: string,
    city?: string,
    country?: string
): Promise<string> {
    // Try to find existing validated intent
    const existing = await prisma.keywordIntent.findFirst({
        where: {
            conditionSlug,
            citySlug: city || null,
            countryCode: country || 'US' // Default fallback
        }
    });

    if (existing) return existing.primaryKeyword;

    // Fallback Heuristics
    let keyword = `${conditionName} treatment`;
    if (city) {
        // Localized intent
        const templates = [
            `${conditionName} treatment in ${city}`,
            `Best doctor for ${conditionName} in ${city}`,
            `${conditionName} specialist ${city}`
        ];
        // Simple rotation or selection logic - could use LLM here too
        keyword = templates[0];
    } else if (country) {
        keyword = `${conditionName} treatment in ${country}`;
    }

    // Persist heuristic for now
    await prisma.keywordIntent.create({
        data: {
            conditionSlug,
            citySlug: city,
            countryCode: country || 'US',
            primaryKeyword: keyword,
            intentType: 'informational', // robust baseline
            isValidated: false
        }
    });

    return keyword;
}

/**
 * Batch analyze intents for a list of conditions and cities.
 */
export async function batchAnalyzeIntents(
    conditions: { slug: string; name: string }[],
    cities: { slug: string; countryCode: string }[]
) {
    let count = 0;
    for (const cond of conditions) {
        for (const city of cities) {
            await getIntentKeyword(cond.slug, cond.name, city.slug, city.countryCode);
            count++;
        }
    }
    return { processed: count };
}
