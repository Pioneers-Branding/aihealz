import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { translate } from '@/lib/cms/translation-bridge';

/**
 * POST /api/admin/translate-content
 *
 * Translates condition page content into different languages
 * ONLY for regions where that language is spoken
 *
 * Uses Sarvam AI for Indian languages, OpenRouter for others
 */

// Language to region mapping (which geographies support which languages)
const LANGUAGE_REGIONS: Record<string, string[]> = {
    // Indian Languages - mapped to state slugs
    'hi': ['delhi', 'uttar-pradesh', 'bihar', 'madhya-pradesh', 'rajasthan', 'jharkhand', 'chhattisgarh', 'haryana', 'uttarakhand', 'himachal-pradesh'],
    'ta': ['tamil-nadu'],
    'te': ['andhra-pradesh', 'telangana'],
    'kn': ['karnataka'],
    'ml': ['kerala'],
    'mr': ['maharashtra', 'goa'],
    'gu': ['gujarat'],
    'bn': ['west-bengal'],
    'pa': ['punjab'],
    'or': ['odisha'],
    // Global languages - for specific countries
    'es': ['mexico', 'spain', 'argentina', 'colombia'],
    'fr': ['france', 'canada'],
    'de': ['germany', 'austria', 'switzerland'],
    'ar': ['uae', 'saudi-arabia', 'egypt'],
    'ja': ['japan'],
    'ko': ['south-korea'],
    'zh': ['china', 'singapore', 'taiwan'],
    'th': ['thailand'],
    'vi': ['vietnam'],
    'id': ['indonesia'],
    'ms': ['malaysia'],
    'ru': ['russia'],
    'pt': ['brazil', 'portugal'],
};

const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_REGIONS);

async function translateTextFields(
    content: any,
    targetLang: string
): Promise<any> {
    try {
        // Translate text fields
        const translations = await Promise.all([
            content.h1Title ? translate(content.h1Title, targetLang) : null,
            content.heroOverview ? translate(content.heroOverview, targetLang) : null,
            content.definition ? translate(content.definition, targetLang) : null,
            content.diagnosisOverview ? translate(content.diagnosisOverview, targetLang) : null,
            content.treatmentOverview ? translate(content.treatmentOverview, targetLang) : null,
            content.prognosis ? translate(content.prognosis, targetLang) : null,
            content.metaTitle ? translate(content.metaTitle, targetLang) : null,
            content.metaDescription ? translate(content.metaDescription, targetLang) : null,
            content.whySeeSpecialist ? translate(content.whySeeSpecialist, targetLang) : null,
        ]);

        // Translate arrays
        const symptoms = content.primarySymptoms as string[] || [];
        const translatedSymptoms = await Promise.all(
            symptoms.slice(0, 5).map(s => translate(s, targetLang))
        );

        const warnings = content.earlyWarningSigns as string[] || [];
        const translatedWarnings = await Promise.all(
            warnings.slice(0, 3).map(w => translate(w, targetLang))
        );

        const prevention = content.preventionStrategies as string[] || [];
        const translatedPrevention = await Promise.all(
            prevention.slice(0, 3).map(p => translate(p, targetLang))
        );

        const complications = content.complications as string[] || [];
        const translatedComplications = await Promise.all(
            complications.slice(0, 3).map(c => translate(c, targetLang))
        );

        // Translate FAQs
        const faqs = content.faqs as Array<{question: string; answer: string}> || [];
        const translatedFaqs = await Promise.all(
            faqs.slice(0, 5).map(async (faq) => ({
                question: (await translate(faq.question, targetLang)).translatedText,
                answer: (await translate(faq.answer, targetLang)).translatedText,
            }))
        );

        // Truncate to fit varchar limits per Prisma schema
        const truncate = (text: string | null | undefined, maxLen: number) =>
            text ? text.substring(0, maxLen) : '';

        return {
            h1Title: truncate(translations[0]?.translatedText || content.h1Title, 200),
            heroOverview: translations[1]?.translatedText || content.heroOverview || '',
            definition: translations[2]?.translatedText || content.definition || '',
            diagnosisOverview: translations[3]?.translatedText || content.diagnosisOverview || '',
            treatmentOverview: translations[4]?.translatedText || content.treatmentOverview || '',
            prognosis: translations[5]?.translatedText || content.prognosis || '',
            metaTitle: truncate(translations[6]?.translatedText || content.metaTitle, 60),
            metaDescription: truncate(translations[7]?.translatedText || content.metaDescription, 160),
            whySeeSpecialist: translations[8]?.translatedText || content.whySeeSpecialist || '',
            primarySymptoms: translatedSymptoms.map(t => t.translatedText),
            earlyWarningSigns: translatedWarnings.map(t => t.translatedText),
            preventionStrategies: translatedPrevention.map(t => t.translatedText),
            complications: translatedComplications.map(t => t.translatedText),
            faqs: translatedFaqs,
        };
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const {
            limit = 3,
            targetLanguage = 'hi',
        } = body;

        // Validate language
        if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
            return NextResponse.json(
                { error: `Unsupported language: ${targetLanguage}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` },
                { status: 400 }
            );
        }

        // Get regions where this language is spoken
        const regions = LANGUAGE_REGIONS[targetLanguage] || [];

        // Get English content that hasn't been translated to this language yet
        const existingTranslations = await prisma.conditionPageContent.findMany({
            where: { languageCode: targetLanguage },
            select: { conditionId: true },
        });
        const translatedIds = existingTranslations.map(t => t.conditionId);

        const englishContent = await prisma.conditionPageContent.findMany({
            where: {
                languageCode: 'en',
                status: 'published',
                conditionId: { notIn: translatedIds },
            },
            include: {
                condition: { select: { id: true, slug: true, commonName: true } },
            },
            take: limit,
            orderBy: { conditionId: 'asc' },
        });

        if (englishContent.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No content needs translation to ' + targetLanguage,
                translated: 0,
                regions,
            });
        }

        const results: { slug: string; status: string }[] = [];
        let translated = 0;
        let failed = 0;

        for (const content of englishContent) {
            const translatedFields = await translateTextFields(content, targetLanguage);

            if (!translatedFields) {
                results.push({ slug: content.condition.slug, status: 'failed' });
                failed++;
                continue;
            }

            // Create new ConditionPageContent entry for this language
            await prisma.conditionPageContent.create({
                data: {
                    conditionId: content.conditionId,
                    languageCode: targetLanguage,
                    h1Title: translatedFields.h1Title,
                    heroOverview: translatedFields.heroOverview,
                    definition: translatedFields.definition,
                    primarySymptoms: translatedFields.primarySymptoms,
                    earlyWarningSigns: translatedFields.earlyWarningSigns,
                    emergencySigns: content.emergencySigns || undefined,
                    causes: content.causes || undefined,
                    riskFactors: content.riskFactors || undefined,
                    diagnosisOverview: translatedFields.diagnosisOverview,
                    diagnosticTests: content.diagnosticTests || undefined,
                    treatmentOverview: translatedFields.treatmentOverview,
                    medicalTreatments: content.medicalTreatments || undefined,
                    surgicalOptions: content.surgicalOptions || undefined,
                    preventionStrategies: translatedFields.preventionStrategies,
                    lifestyleModifications: content.lifestyleModifications || undefined,
                    dietRecommendations: content.dietRecommendations || undefined,
                    prognosis: translatedFields.prognosis,
                    complications: translatedFields.complications,
                    faqs: translatedFields.faqs,
                    metaTitle: translatedFields.metaTitle,
                    metaDescription: translatedFields.metaDescription,
                    keywords: content.keywords || undefined,
                    specialistType: content.specialistType,
                    whySeeSpecialist: translatedFields.whySeeSpecialist,
                    status: 'published',
                },
            });

            results.push({ slug: content.condition.slug, status: 'translated' });
            translated++;

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Get stats
        const totalEnglish = await prisma.conditionPageContent.count({ where: { languageCode: 'en', status: 'published' } });
        const totalTranslated = await prisma.conditionPageContent.count({ where: { languageCode: targetLanguage } });

        return NextResponse.json({
            success: true,
            message: `Translated ${translated}, failed ${failed}`,
            results,
            targetLanguage,
            applicableRegions: regions,
            progress: {
                totalEnglishContent: totalEnglish,
                totalTranslated,
                percentComplete: totalEnglish > 0 ? ((totalTranslated / totalEnglish) * 100).toFixed(1) + '%' : '0%',
            },
        });
    } catch (error: any) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    const totalEnglish = await prisma.conditionPageContent.count({ where: { languageCode: 'en', status: 'published' } });

    const byLanguage = await prisma.conditionPageContent.groupBy({
        by: ['languageCode'],
        _count: true,
        where: { status: 'published' },
    });

    const translationCacheStats = await prisma.translationCache.aggregate({
        _count: true,
        _sum: { costUsd: true },
    });

    // Calculate estimated URLs based on region-language mapping
    const estimatedUrls: Record<string, number> = {};
    for (const [lang, regions] of Object.entries(LANGUAGE_REGIONS)) {
        const langContent = byLanguage.find(l => l.languageCode === lang)?._count || 0;
        // Each language applies to specific regions only
        estimatedUrls[lang] = langContent * regions.length * 50; // ~50 cities per region average
    }

    return NextResponse.json({
        totalEnglishContent: totalEnglish,
        contentByLanguage: byLanguage.map(l => ({
            language: l.languageCode,
            count: l._count,
            regions: LANGUAGE_REGIONS[l.languageCode] || ['global'],
            percentOfEnglish: totalEnglish > 0 ? ((l._count / totalEnglish) * 100).toFixed(1) + '%' : '0%',
        })),
        translationCache: {
            totalCached: translationCacheStats._count,
            totalCostUsd: translationCacheStats._sum.costUsd || 0,
        },
        languageRegionMapping: LANGUAGE_REGIONS,
        supportedLanguages: SUPPORTED_LANGUAGES,
    });
}
