import prisma from '@/lib/db';
import { translate } from '@/lib/cms/translation-bridge';

/**
 * On-demand condition page content translator.
 * Translates English content to target language and saves as new ConditionPageContent row.
 * Uses the translation-bridge (Sarvam for Indian langs, DeepSeek for global).
 * Each text field is translated individually and cached — subsequent pages reuse cached translations.
 */

// Track in-progress translations to avoid duplicate work
const IN_PROGRESS = new Set<string>();

/**
 * Translate a condition's page content from English to target language.
 * Returns true if translation was created, false if skipped/failed.
 */
export async function translateConditionContent(
    conditionId: number,
    targetLang: string
): Promise<boolean> {
    const key = `${conditionId}:${targetLang}`;

    // Skip if already in progress or target is English
    if (targetLang === 'en' || IN_PROGRESS.has(key)) return false;

    // Check if translation already exists
    const existing = await prisma.conditionPageContent.findUnique({
        where: { conditionId_languageCode: { conditionId, languageCode: targetLang } },
    });
    if (existing) return false;

    IN_PROGRESS.add(key);

    try {
        // Get English content
        const enContent = await prisma.conditionPageContent.findUnique({
            where: { conditionId_languageCode: { conditionId, languageCode: 'en' } },
        });
        if (!enContent) return false;

        // Translate all text fields
        const [
            h1Title, heroOverview, definition, diagnosisOverview,
            treatmentOverview, whySeeSpecialist, doctorSelectionGuide,
            insuranceGuide, financialAssistance, exerciseGuidelines,
            prognosis, recoveryTimeline, metaTitle, metaDescription,
            simpleName,
        ] = await Promise.all([
            translateText(enContent.h1Title, targetLang),
            translateText(enContent.heroOverview, targetLang),
            translateText(enContent.definition, targetLang),
            translateText(enContent.diagnosisOverview, targetLang),
            translateText(enContent.treatmentOverview, targetLang),
            translateText(enContent.whySeeSpecialist, targetLang),
            translateText(enContent.doctorSelectionGuide, targetLang),
            translateText(enContent.insuranceGuide, targetLang),
            translateText(enContent.financialAssistance, targetLang),
            translateText(enContent.exerciseGuidelines, targetLang),
            translateText(enContent.prognosis, targetLang),
            translateText(enContent.recoveryTimeline, targetLang),
            translateText(enContent.metaTitle, targetLang),
            translateText(enContent.metaDescription, targetLang),
            translateText(enContent.simpleName, targetLang),
        ]);

        // Translate JSON array fields
        const [
            primarySymptoms, earlyWarningSigns, emergencySigns,
            affectedDemographics, hospitalCriteria, keyFacilities,
            preventionStrategies, lifestyleModifications,
            dailyManagement, complications, searchTags,
        ] = await Promise.all([
            translateStringArray(enContent.primarySymptoms as string[] | null, targetLang),
            translateStringArray(enContent.earlyWarningSigns as string[] | null, targetLang),
            translateStringArray(enContent.emergencySigns as string[] | null, targetLang),
            translateStringArray(enContent.affectedDemographics as string[] | null, targetLang),
            translateStringArray(enContent.hospitalCriteria as string[] | null, targetLang),
            translateStringArray(enContent.keyFacilities as string[] | null, targetLang),
            translateStringArray(enContent.preventionStrategies as string[] | null, targetLang),
            translateStringArray(enContent.lifestyleModifications as string[] | null, targetLang),
            translateStringArray(enContent.dailyManagement as string[] | null, targetLang),
            translateStringArray(enContent.complications as string[] | null, targetLang),
            translateStringArray(enContent.searchTags as string[] | null, targetLang),
        ]);

        // Translate complex JSON fields
        const [
            faqs, causes, riskFactors, diagnosticTests,
            medicalTreatments, surgicalOptions, alternativeTreatments,
            typesClassification, dietRecommendations,
        ] = await Promise.all([
            translateFaqs(enContent.faqs as Array<{ question: string; answer: string }> | null, targetLang),
            translateObjectArray(enContent.causes as Array<{ cause: string; description: string }> | null, ['cause', 'description'], targetLang),
            translateObjectArray(enContent.riskFactors as Array<{ factor: string; category: string; description: string }> | null, ['factor', 'description'], targetLang),
            translateObjectArray(enContent.diagnosticTests as Array<{ test: string; purpose: string; whatToExpect?: string }> | null, ['test', 'purpose', 'whatToExpect'], targetLang),
            translateObjectArray(enContent.medicalTreatments as Array<{ name: string; description: string }> | null, ['name', 'description'], targetLang),
            translateObjectArray(enContent.surgicalOptions as Array<{ name: string; description: string }> | null, ['name', 'description'], targetLang),
            translateObjectArray(enContent.alternativeTreatments as Array<{ name: string; description: string }> | null, ['name', 'description'], targetLang),
            translateObjectArray(enContent.typesClassification as Array<{ type: string; description: string }> | null, ['type', 'description'], targetLang),
            translateDietRecommendations(enContent.dietRecommendations as { recommended: string[]; avoid: string[] } | null, targetLang),
        ]);

        // Build data object — use explicit undefined for null JSON fields (Prisma requirement)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {
            conditionId,
            languageCode: targetLang,
            // Translated text fields
            h1Title, heroOverview, definition, diagnosisOverview,
            treatmentOverview, whySeeSpecialist, doctorSelectionGuide,
            insuranceGuide, financialAssistance, exerciseGuidelines,
            prognosis, recoveryTimeline, metaTitle, metaDescription, simpleName,
            // Translated JSON fields
            primarySymptoms, earlyWarningSigns, emergencySigns,
            affectedDemographics, hospitalCriteria, keyFacilities,
            preventionStrategies, lifestyleModifications,
            dailyManagement, complications, searchTags,
            faqs, causes, riskFactors, diagnosticTests,
            medicalTreatments, surgicalOptions, alternativeTreatments,
            typesClassification, dietRecommendations,
            // Copy non-translatable fields as-is
            specialistType: enContent.specialistType,
            costBreakdown: enContent.costBreakdown,
            linkedTreatmentSlugs: enContent.linkedTreatmentSlugs,
            keyStats: enContent.keyStats,
            confusedWithConditions: enContent.confusedWithConditions,
            coOccurringConditions: enContent.coOccurringConditions,
            relatedConditions: enContent.relatedConditions,
            supportResources: enContent.supportResources,
            regionalNames: enContent.regionalNames,
            symptomKeywords: enContent.symptomKeywords,
            keywords: enContent.keywords,
            sources: enContent.sources,
            schemaMedicalCondition: enContent.schemaMedicalCondition,
            schemaFaqPage: enContent.schemaFaqPage,
            schemaBreadcrumb: enContent.schemaBreadcrumb,
            schemaHowTo: enContent.schemaHowTo,
            qualityScore: enContent.qualityScore,
            wordCount: enContent.wordCount,
            generationVersion: `translated-${enContent.generationVersion || 'v1'}`,
            status: 'review',
        };

        // Remove null values (Prisma JSON fields don't accept null, only undefined)
        for (const key of Object.keys(data)) {
            if (data[key] === null) delete data[key];
        }

        await prisma.conditionPageContent.create({ data });

        console.log(`[translate] Created ${targetLang} content for condition ${conditionId}`);
        return true;
    } catch (error) {
        console.error(`[translate] Failed for condition ${conditionId} → ${targetLang}:`, error);
        return false;
    } finally {
        IN_PROGRESS.delete(key);
    }
}

// ── Helper Functions ──────────────────────────────────────────

async function translateText(text: string | null, targetLang: string): Promise<string | null> {
    if (!text || text.trim().length === 0) return text;
    const result = await translate(text, targetLang, 'en', 'medical');
    return result.translatedText;
}

async function translateStringArray(arr: string[] | null, targetLang: string): Promise<string[] | null> {
    if (!arr || arr.length === 0) return arr;
    // Batch: join with separator, translate once, split back (cheaper than N calls)
    const separator = ' ||| ';
    const joined = arr.join(separator);
    const result = await translate(joined, targetLang, 'en', 'medical');
    return result.translatedText.split(separator).map(s => s.trim());
}

async function translateFaqs(
    faqs: Array<{ question: string; answer: string }> | null,
    targetLang: string
): Promise<Array<{ question: string; answer: string }> | null> {
    if (!faqs || faqs.length === 0) return faqs;
    const translated: Array<{ question: string; answer: string }> = [];
    for (const faq of faqs) {
        const [q, a] = await Promise.all([
            translateText(faq.question, targetLang),
            translateText(faq.answer, targetLang),
        ]);
        translated.push({ question: q || faq.question, answer: a || faq.answer });
    }
    return translated;
}

async function translateObjectArray(
    arr: Array<Record<string, unknown>> | null,
    fieldsToTranslate: string[],
    targetLang: string
): Promise<Array<Record<string, unknown>> | null> {
    if (!arr || arr.length === 0) return arr;
    const translated: Array<Record<string, unknown>> = [];
    for (const item of arr) {
        const newItem = { ...item };
        for (const field of fieldsToTranslate) {
            if (typeof newItem[field] === 'string' && (newItem[field] as string).trim()) {
                const result = await translate(newItem[field] as string, targetLang, 'en', 'medical');
                newItem[field] = result.translatedText;
            }
        }
        translated.push(newItem);
    }
    return translated;
}

async function translateDietRecommendations(
    diet: { recommended: string[]; avoid: string[] } | null,
    targetLang: string
): Promise<{ recommended: string[]; avoid: string[] } | null> {
    if (!diet) return diet;
    const [recommended, avoid] = await Promise.all([
        translateStringArray(diet.recommended, targetLang),
        translateStringArray(diet.avoid, targetLang),
    ]);
    return {
        recommended: recommended || diet.recommended,
        avoid: avoid || diet.avoid,
    };
}
