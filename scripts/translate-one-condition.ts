import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const OPENROUTER_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_BASE = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';

const INDIAN_LANGUAGES = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];
const SARVAM_LANG_MAP: Record<string, string> = {
    hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN',
    mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
};

const LANG_NAMES: Record<string, string> = {
    hi: 'Hindi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi',
    gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi',
    es: 'Spanish', fr: 'French', de: 'German', ar: 'Arabic',
    ja: 'Japanese', ko: 'Korean', zh: 'Chinese', pt: 'Portuguese',
    ru: 'Russian', th: 'Thai', vi: 'Vietnamese', id: 'Indonesian', ms: 'Malay',
};

// All target languages to translate into
const TARGET_LANGUAGES = Object.keys(LANG_NAMES);

// Condition slug to translate
const CONDITION_SLUG = process.argv[2] || 'abdominal-aortic-aneurysm-without-rupture-i714';

let totalCost = 0;
let cacheHits = 0;
let apiCalls = 0;

// ── Translation functions ──────────────────────────────

async function translate(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    const textHash = crypto.createHash('sha256').update(text).digest('hex');

    // Check cache first
    const cached = await prisma.translationCache.findUnique({
        where: { sourceTextHash_targetLanguage: { sourceTextHash: textHash, targetLanguage: targetLang } },
    });

    if (cached) {
        cacheHits++;
        return cached.translatedText;
    }

    let translatedText: string;
    let api: string;
    let model: string;
    let cost: number;

    if (INDIAN_LANGUAGES.includes(targetLang) && SARVAM_API_KEY) {
        // Use Sarvam for Indian languages
        try {
            const res = await fetch('https://api.sarvam.ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'API-Subscription-Key': SARVAM_API_KEY },
                body: JSON.stringify({
                    input: text,
                    source_language_code: 'en-IN',
                    target_language_code: SARVAM_LANG_MAP[targetLang] || targetLang,
                    mode: 'formal',
                    enable_preprocessing: true,
                }),
            });
            if (!res.ok) throw new Error(`Sarvam ${res.status}`);
            const data = await res.json();
            translatedText = data.translated_text || text;
            api = 'sarvam';
            model = 'sarvam-translate-v1';
            cost = 0.0001;
        } catch (e) {
            console.warn(`  Sarvam failed for ${targetLang}, falling back to OpenRouter`);
            return translateWithOpenRouter(text, targetLang, textHash);
        }
    } else {
        return translateWithOpenRouter(text, targetLang, textHash);
    }

    // Store in cache
    await prisma.translationCache.create({
        data: {
            sourceTextHash: textHash,
            sourceLanguage: 'en',
            targetLanguage: targetLang,
            sourceText: text,
            translatedText,
            translationApi: api,
            modelUsed: model,
            costUsd: cost,
            category: 'medical',
        },
    });

    totalCost += cost;
    apiCalls++;
    return translatedText;
}

async function translateWithOpenRouter(text: string, targetLang: string, textHash: string): Promise<string> {
    try {
        const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `You are a medical translator. Translate from English to ${LANG_NAMES[targetLang] || targetLang}. Preserve medical terminology. Output ONLY the translation.`,
                    },
                    { role: 'user', content: text },
                ],
                temperature: 0.2,
                max_tokens: 2000,
            }),
        });

        if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
        const data = await res.json();
        const translatedText = (data.choices?.[0]?.message?.content || text).trim();
        const tokens = data.usage?.total_tokens || 0;
        const cost = tokens * 0.000001;

        await prisma.translationCache.create({
            data: {
                sourceTextHash: textHash,
                sourceLanguage: 'en',
                targetLanguage: targetLang,
                sourceText: text,
                translatedText,
                translationApi: 'openrouter',
                modelUsed: 'deepseek/deepseek-chat',
                costUsd: cost,
                category: 'medical',
            },
        });

        totalCost += cost;
        apiCalls++;
        return translatedText;
    } catch {
        console.warn(`  OpenRouter failed for ${targetLang}, keeping English`);
        return text;
    }
}

// ── Main translation logic ──────────────────────────────

async function translateCondition() {
    console.log(`\n🔍 Finding English content for: ${CONDITION_SLUG}\n`);

    const englishContent = await prisma.conditionPageContent.findFirst({
        where: {
            condition: { slug: CONDITION_SLUG },
            languageCode: 'en',
        },
        include: { condition: { select: { id: true, slug: true, commonName: true } } },
    });

    if (!englishContent) {
        console.error('❌ No English content found for this condition!');
        process.exit(1);
    }

    console.log(`✅ Found: "${englishContent.condition.commonName}" (ID: ${englishContent.conditionId})`);
    console.log(`   Fields: h1=${!!englishContent.h1Title}, hero=${!!englishContent.heroOverview}, def=${!!englishContent.definition}`);
    console.log(`   Symptoms: ${(englishContent.primarySymptoms as string[] || []).length}, FAQs: ${(englishContent.faqs as any[] || []).length}`);
    console.log(`\n📝 Translating to ${TARGET_LANGUAGES.length} languages...\n`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const lang of TARGET_LANGUAGES) {
        // Check if already translated
        const existing = await prisma.conditionPageContent.findFirst({
            where: { conditionId: englishContent.conditionId, languageCode: lang },
        });

        if (existing) {
            console.log(`  ⏭  ${LANG_NAMES[lang]} (${lang}) — already exists, skipping`);
            skipCount++;
            continue;
        }

        console.log(`  🌐 ${LANG_NAMES[lang]} (${lang}) — translating...`);
        const start = Date.now();

        try {
            // Translate text fields
            const [h1Title, heroOverview, definition, diagnosisOverview, treatmentOverview, prognosis, metaTitle, metaDescription, whySeeSpecialist] = await Promise.all([
                englishContent.h1Title ? translate(englishContent.h1Title, lang) : null,
                englishContent.heroOverview ? translate(englishContent.heroOverview, lang) : null,
                englishContent.definition ? translate(englishContent.definition, lang) : null,
                englishContent.diagnosisOverview ? translate(englishContent.diagnosisOverview, lang) : null,
                englishContent.treatmentOverview ? translate(englishContent.treatmentOverview, lang) : null,
                englishContent.prognosis ? translate(englishContent.prognosis, lang) : null,
                englishContent.metaTitle ? translate(englishContent.metaTitle, lang) : null,
                englishContent.metaDescription ? translate(englishContent.metaDescription, lang) : null,
                englishContent.whySeeSpecialist ? translate(englishContent.whySeeSpecialist, lang) : null,
            ]);

            // Translate arrays
            const symptoms = (englishContent.primarySymptoms as string[] || []);
            const translatedSymptoms = await Promise.all(symptoms.map(s => translate(s, lang)));

            const warnings = (englishContent.earlyWarningSigns as string[] || []);
            const translatedWarnings = await Promise.all(warnings.map(w => translate(w, lang)));

            const prevention = (englishContent.preventionStrategies as string[] || []);
            const translatedPrevention = await Promise.all(prevention.map(p => translate(p, lang)));

            const complications = (englishContent.complications as string[] || []);
            const translatedComplications = await Promise.all(complications.map(c => translate(c, lang)));

            // Translate FAQs
            const faqs = (englishContent.faqs as Array<{ question: string; answer: string }> || []);
            const translatedFaqs = await Promise.all(
                faqs.map(async (faq) => ({
                    question: await translate(faq.question, lang),
                    answer: await translate(faq.answer, lang),
                }))
            );

            // Create the translated page content
            await prisma.conditionPageContent.create({
                data: {
                    conditionId: englishContent.conditionId,
                    languageCode: lang,
                    h1Title: h1Title?.substring(0, 200) || englishContent.h1Title || '',
                    heroOverview: heroOverview || englishContent.heroOverview || '',
                    definition: definition || englishContent.definition || '',
                    diagnosisOverview: diagnosisOverview || englishContent.diagnosisOverview || '',
                    treatmentOverview: treatmentOverview || englishContent.treatmentOverview || '',
                    prognosis: prognosis || englishContent.prognosis || '',
                    metaTitle: metaTitle?.substring(0, 60) || englishContent.metaTitle || '',
                    metaDescription: metaDescription?.substring(0, 160) || englishContent.metaDescription || '',
                    whySeeSpecialist: whySeeSpecialist || englishContent.whySeeSpecialist || '',
                    primarySymptoms: translatedSymptoms,
                    earlyWarningSigns: translatedWarnings,
                    preventionStrategies: translatedPrevention,
                    complications: translatedComplications,
                    faqs: translatedFaqs,
                    // Keep untranslated structured data as-is (English)
                    keyStats: englishContent.keyStats || undefined,
                    typesClassification: englishContent.typesClassification || undefined,
                    emergencySigns: englishContent.emergencySigns || undefined,
                    causes: englishContent.causes || undefined,
                    riskFactors: englishContent.riskFactors || undefined,
                    diagnosticTests: englishContent.diagnosticTests || undefined,
                    medicalTreatments: englishContent.medicalTreatments || undefined,
                    surgicalOptions: englishContent.surgicalOptions || undefined,
                    lifestyleModifications: englishContent.lifestyleModifications || undefined,
                    dietRecommendations: englishContent.dietRecommendations || undefined,
                    hospitalCriteria: englishContent.hospitalCriteria || undefined,
                    keywords: englishContent.keywords || undefined,
                    specialistType: englishContent.specialistType,
                    wordCount: englishContent.wordCount,
                    status: 'published',
                },
            });

            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            console.log(`     ✅ Done in ${elapsed}s (API calls: ${apiCalls}, cache hits: ${cacheHits})`);
            successCount++;

            // Rate limit between languages
            await new Promise(r => setTimeout(r, 500));

        } catch (error: any) {
            console.error(`     ❌ Failed: ${error.message}`);
            failCount++;
        }
    }

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📊 TRANSLATION COMPLETE`);
    console.log(`${'═'.repeat(50)}`);
    console.log(`  Condition: ${englishContent.condition.commonName}`);
    console.log(`  ✅ Translated: ${successCount} languages`);
    console.log(`  ⏭  Skipped: ${skipCount} (already existed)`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log(`  💰 Total cost: $${totalCost.toFixed(4)}`);
    console.log(`  🔄 API calls: ${apiCalls}`);
    console.log(`  📦 Cache hits: ${cacheHits}`);
    console.log(`${'═'.repeat(50)}\n`);
}

translateCondition()
    .catch(e => console.error('Fatal:', e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
