#!/usr/bin/env npx tsx
/**
 * Content Translation Pipeline
 *
 * Translates all conditions and treatments into regional languages.
 * Each geography gets content in its native language:
 * - Delhi → Hindi
 * - Chennai → Tamil
 * - Mumbai → Marathi
 * - Kolkata → Bengali
 * etc.
 *
 * Run: npx tsx scripts/translate-content.ts [--conditions|--treatments] [--limit=N] [--lang=xx]
 */

import { config } from 'dotenv';
import { PrismaClient, ContentStatus, GeoLevel } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════════════════════
// GEO-LANGUAGE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Indian State/City → Primary Language Mapping
 * This determines which language to use for each geography
 */
const INDIA_GEO_LANGUAGE: Record<string, string> = {
    // States
    'andhra-pradesh': 'te',
    'arunachal-pradesh': 'en',
    'assam': 'as',
    'bihar': 'hi',
    'chhattisgarh': 'hi',
    'goa': 'en', // Konkani speakers but English widely used
    'gujarat': 'gu',
    'haryana': 'hi',
    'himachal-pradesh': 'hi',
    'jharkhand': 'hi',
    'karnataka': 'kn',
    'kerala': 'ml',
    'madhya-pradesh': 'hi',
    'maharashtra': 'mr',
    'manipur': 'mni',
    'meghalaya': 'en',
    'mizoram': 'en',
    'nagaland': 'en',
    'odisha': 'or',
    'punjab': 'pa',
    'rajasthan': 'hi',
    'sikkim': 'ne',
    'tamil-nadu': 'ta',
    'telangana': 'te',
    'tripura': 'bn',
    'uttar-pradesh': 'hi',
    'uttarakhand': 'hi',
    'west-bengal': 'bn',
    'delhi': 'hi',
    'chandigarh': 'hi',
    'puducherry': 'ta',
    'jammu-kashmir': 'ur',
    'ladakh': 'en',

    // Major Cities (override if different from state)
    'mumbai': 'mr',
    'pune': 'mr',
    'nagpur': 'mr',
    'thane': 'mr',
    'delhi': 'hi',
    'new-delhi': 'hi',
    'noida': 'hi',
    'gurgaon': 'hi',
    'gurugram': 'hi',
    'faridabad': 'hi',
    'ghaziabad': 'hi',
    'lucknow': 'hi',
    'kanpur': 'hi',
    'varanasi': 'hi',
    'agra': 'hi',
    'jaipur': 'hi',
    'jodhpur': 'hi',
    'udaipur': 'hi',
    'chennai': 'ta',
    'coimbatore': 'ta',
    'madurai': 'ta',
    'bangalore': 'kn',
    'bengaluru': 'kn',
    'mysore': 'kn',
    'mysuru': 'kn',
    'hyderabad': 'te',
    'secunderabad': 'te',
    'visakhapatnam': 'te',
    'vijayawada': 'te',
    'kolkata': 'bn',
    'howrah': 'bn',
    'ahmedabad': 'gu',
    'surat': 'gu',
    'vadodara': 'gu',
    'rajkot': 'gu',
    'kochi': 'ml',
    'thiruvananthapuram': 'ml',
    'kozhikode': 'ml',
    'thrissur': 'ml',
    'bhopal': 'hi',
    'indore': 'hi',
    'chandigarh': 'pa',
    'amritsar': 'pa',
    'ludhiana': 'pa',
    'jalandhar': 'pa',
    'patna': 'hi',
    'ranchi': 'hi',
    'bhubaneswar': 'or',
    'cuttack': 'or',
    'guwahati': 'as',
};

/**
 * Country → Default Language Mapping
 */
const COUNTRY_LANGUAGE: Record<string, string> = {
    'india': 'en', // English as default, but geo-specific overrides
    'usa': 'en',
    'uk': 'en',
    'uae': 'ar',
    'saudi-arabia': 'ar',
    'egypt': 'ar',
    'qatar': 'ar',
    'kuwait': 'ar',
    'oman': 'ar',
    'bahrain': 'ar',
    'germany': 'de',
    'france': 'fr',
    'spain': 'es',
    'mexico': 'es',
    'argentina': 'es',
    'colombia': 'es',
    'chile': 'es',
    'peru': 'es',
    'brazil': 'pt',
    'portugal': 'pt',
    'japan': 'ja',
    'south-korea': 'ko',
    'thailand': 'th',
    'vietnam': 'vi',
    'indonesia': 'id',
    'malaysia': 'ms',
    'turkey': 'tr',
    'russia': 'ru',
    'pakistan': 'ur',
    'bangladesh': 'bn',
    'nepal': 'ne',
    'sri-lanka': 'si',
    'nigeria': 'en',
    'kenya': 'sw',
    'south-africa': 'en',
    'ghana': 'en',
    'tanzania': 'sw',
    'ethiopia': 'am',
    'morocco': 'ar',
    'italy': 'it',
    'netherlands': 'nl',
    'poland': 'pl',
    'sweden': 'sv',
    'switzerland': 'de',
    'austria': 'de',
    'belgium': 'nl',
    'greece': 'el',
    'israel': 'he',
    'singapore': 'en',
    'philippines': 'en',
    'australia': 'en',
    'canada': 'en',
    'new-zealand': 'en',
    'ireland': 'en',
};

/**
 * Language Display Names for metadata
 */
const LANGUAGE_NAMES: Record<string, { en: string; native: string }> = {
    'en': { en: 'English', native: 'English' },
    'hi': { en: 'Hindi', native: 'हिन्दी' },
    'ta': { en: 'Tamil', native: 'தமிழ்' },
    'te': { en: 'Telugu', native: 'తెలుగు' },
    'kn': { en: 'Kannada', native: 'ಕನ್ನಡ' },
    'ml': { en: 'Malayalam', native: 'മലയാളം' },
    'mr': { en: 'Marathi', native: 'मराठी' },
    'bn': { en: 'Bengali', native: 'বাংলা' },
    'gu': { en: 'Gujarati', native: 'ગુજરાતી' },
    'pa': { en: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    'or': { en: 'Odia', native: 'ଓଡ଼ିଆ' },
    'as': { en: 'Assamese', native: 'অসমীয়া' },
    'ur': { en: 'Urdu', native: 'اردو' },
    'ne': { en: 'Nepali', native: 'नेपाली' },
    'ar': { en: 'Arabic', native: 'العربية' },
    'es': { en: 'Spanish', native: 'Español' },
    'pt': { en: 'Portuguese', native: 'Português' },
    'fr': { en: 'French', native: 'Français' },
    'de': { en: 'German', native: 'Deutsch' },
    'it': { en: 'Italian', native: 'Italiano' },
    'nl': { en: 'Dutch', native: 'Nederlands' },
    'ru': { en: 'Russian', native: 'Русский' },
    'ja': { en: 'Japanese', native: '日本語' },
    'ko': { en: 'Korean', native: '한국어' },
    'th': { en: 'Thai', native: 'ไทย' },
    'vi': { en: 'Vietnamese', native: 'Tiếng Việt' },
    'id': { en: 'Indonesian', native: 'Bahasa Indonesia' },
    'ms': { en: 'Malay', native: 'Bahasa Melayu' },
    'tr': { en: 'Turkish', native: 'Türkçe' },
    'pl': { en: 'Polish', native: 'Polski' },
    'sv': { en: 'Swedish', native: 'Svenska' },
    'el': { en: 'Greek', native: 'Ελληνικά' },
    'he': { en: 'Hebrew', native: 'עברית' },
    'sw': { en: 'Swahili', native: 'Kiswahili' },
    'am': { en: 'Amharic', native: 'አማርኛ' },
    'si': { en: 'Sinhala', native: 'සිංහල' },
    'mni': { en: 'Meitei', native: 'মৈতৈলোন্' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

interface TranslationResult {
    title: string;
    description: string;
    localizedAdvice: string;
    consultationTips: string;
    metaTitle: string;
    metaDescription: string;
}

/**
 * Translate content using OpenRouter (DeepSeek)
 */
async function translateContent(
    content: {
        conditionName: string;
        description: string;
        symptoms: string[];
        treatments: string[];
    },
    targetLang: string,
    geoName: string,
    countryName: string
): Promise<TranslationResult> {
    const langName = LANGUAGE_NAMES[targetLang]?.en || targetLang;
    const nativeName = LANGUAGE_NAMES[targetLang]?.native || targetLang;

    const systemPrompt = `You are a medical content translator. Translate medical content to ${langName} (${nativeName}).

IMPORTANT RULES:
1. Translate ALL text to ${langName}, not English
2. Use proper medical terminology in ${langName}
3. Keep the content medically accurate
4. Make it culturally appropriate for ${geoName}, ${countryName}
5. Use formal/respectful language appropriate for medical content
6. DO NOT use English words unless there's no equivalent in ${langName}

Respond ONLY with valid JSON, no markdown or explanation.`;

    const userPrompt = `Translate this medical condition information to ${langName} for patients in ${geoName}, ${countryName}:

CONDITION: ${content.conditionName}

DESCRIPTION (English):
${content.description}

SYMPTOMS: ${content.symptoms.join(', ')}

TREATMENTS: ${content.treatments.join(', ')}

Provide a JSON response with these fields (all in ${langName}):
{
  "title": "Translated condition name - Treatment in ${geoName}",
  "description": "Full translated description (3-4 paragraphs, 200+ words)",
  "localizedAdvice": "Specific advice for patients in ${geoName} (local hospitals, climate considerations, local dietary advice)",
  "consultationTips": "What to tell your doctor, questions to ask",
  "metaTitle": "SEO title under 60 chars in ${langName}",
  "metaDescription": "SEO description under 155 chars in ${langName}"
}`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://aihealz.com',
                'X-Title': 'aihealz Content Translation',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.3,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '{}';

        // Parse JSON response
        const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(cleaned);

        return {
            title: result.title || content.conditionName,
            description: result.description || content.description,
            localizedAdvice: result.localizedAdvice || '',
            consultationTips: result.consultationTips || '',
            metaTitle: (result.metaTitle || '').slice(0, 160),
            metaDescription: (result.metaDescription || '').slice(0, 300),
        };
    } catch (error) {
        console.error(`Translation error for ${content.conditionName} to ${targetLang}:`, error);
        // Return English fallback
        return {
            title: `${content.conditionName} Treatment in ${geoName}`,
            description: content.description,
            localizedAdvice: '',
            consultationTips: '',
            metaTitle: `${content.conditionName} Treatment - ${geoName}`.slice(0, 160),
            metaDescription: content.description.slice(0, 300),
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

interface ProcessingStats {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
}

/**
 * Get the appropriate language for a geography
 */
function getLanguageForGeo(geoSlug: string, countrySlug: string): string {
    // First check specific geo mapping (for Indian cities/states)
    if (INDIA_GEO_LANGUAGE[geoSlug]) {
        return INDIA_GEO_LANGUAGE[geoSlug];
    }
    // Fall back to country default
    return COUNTRY_LANGUAGE[countrySlug] || 'en';
}

/**
 * Process conditions for translation
 */
async function translateConditions(
    options: {
        limit?: number;
        targetLang?: string;
        geoId?: number;
        skipExisting?: boolean;
    } = {}
): Promise<ProcessingStats> {
    const stats: ProcessingStats = {
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
    };

    console.log('\n📋 Fetching conditions to translate...');

    // Get all active conditions
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: {
            id: true,
            slug: true,
            commonName: true,
            description: true,
            symptoms: true,
            treatments: true,
        },
        take: options.limit || 10000,
        orderBy: { commonName: 'asc' },
    });

    console.log(`Found ${conditions.length} conditions`);

    // Get all active geographies (cities and states)
    const geographies = await prisma.geography.findMany({
        where: {
            isActive: true,
            level: { in: ['city', 'state'] as GeoLevel[] },
        },
        select: {
            id: true,
            slug: true,
            name: true,
            level: true,
            supportedLanguages: true,
            parent: {
                select: {
                    slug: true,
                    parent: {
                        select: { slug: true },
                    },
                },
            },
        },
    });

    console.log(`Found ${geographies.length} geographies`);

    // Filter geographies if specific geoId provided
    const targetGeos = options.geoId
        ? geographies.filter(g => g.id === options.geoId)
        : geographies;

    // Process each condition × geography combination
    for (const condition of conditions) {
        for (const geo of targetGeos) {
            // Determine country slug
            const countrySlug = geo.parent?.parent?.slug || geo.parent?.slug || 'india';

            // Get target language for this geo
            const targetLang = options.targetLang || getLanguageForGeo(geo.slug, countrySlug);

            // Skip English (already have base content)
            if (targetLang === 'en') {
                stats.skipped++;
                continue;
            }

            // Check if translation already exists
            if (options.skipExisting) {
                const existing = await prisma.localizedContent.findFirst({
                    where: {
                        conditionId: condition.id,
                        languageCode: targetLang,
                        geographyId: geo.id,
                    },
                });

                if (existing) {
                    stats.skipped++;
                    continue;
                }
            }

            try {
                console.log(`\n📝 Translating: ${condition.commonName} → ${targetLang} (${geo.name})`);

                // Translate content
                const translated = await translateContent(
                    {
                        conditionName: condition.commonName,
                        description: condition.description || '',
                        symptoms: condition.symptoms || [],
                        treatments: condition.treatments || [],
                    },
                    targetLang,
                    geo.name,
                    countrySlug === 'india' ? 'India' : countrySlug
                );

                // Upsert localized content
                await prisma.localizedContent.upsert({
                    where: {
                        conditionId_languageCode_geographyId: {
                            conditionId: condition.id,
                            languageCode: targetLang,
                            geographyId: geo.id,
                        },
                    },
                    update: {
                        title: translated.title,
                        description: translated.description,
                        localizedAdvice: translated.localizedAdvice,
                        consultationTips: translated.consultationTips,
                        metaTitle: translated.metaTitle,
                        metaDescription: translated.metaDescription,
                        status: 'ai_draft' as ContentStatus,
                        aiModelUsed: 'deepseek/deepseek-chat',
                        wordCount: translated.description.split(/\s+/).length,
                        updatedAt: new Date(),
                    },
                    create: {
                        conditionId: condition.id,
                        languageCode: targetLang,
                        geographyId: geo.id,
                        title: translated.title,
                        description: translated.description,
                        localizedAdvice: translated.localizedAdvice,
                        consultationTips: translated.consultationTips,
                        metaTitle: translated.metaTitle,
                        metaDescription: translated.metaDescription,
                        status: 'ai_draft' as ContentStatus,
                        aiModelUsed: 'deepseek/deepseek-chat',
                        wordCount: translated.description.split(/\s+/).length,
                    },
                });

                stats.created++;
                stats.processed++;

                // Rate limiting - 1 request per second
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`❌ Error translating ${condition.commonName} to ${targetLang}:`, error);
                stats.errors++;
            }
        }
    }

    return stats;
}

/**
 * Generate all language variants for a single condition
 * Creates pages for each language spoken in each geography
 */
async function generateConditionVariants(
    conditionSlug: string,
    options: { skipExisting?: boolean } = {}
): Promise<ProcessingStats> {
    const stats: ProcessingStats = {
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
    };

    // Get the condition
    const condition = await prisma.medicalCondition.findUnique({
        where: { slug: conditionSlug },
        select: {
            id: true,
            slug: true,
            commonName: true,
            description: true,
            symptoms: true,
            treatments: true,
        },
    });

    if (!condition) {
        console.error(`Condition not found: ${conditionSlug}`);
        return stats;
    }

    // Get major Indian geographies
    const geographies = await prisma.geography.findMany({
        where: {
            isActive: true,
            level: { in: ['city', 'state'] as GeoLevel[] },
        },
        select: {
            id: true,
            slug: true,
            name: true,
            level: true,
            supportedLanguages: true,
        },
        orderBy: { population: 'desc' },
        take: 100, // Top 100 cities
    });

    console.log(`\n🔄 Generating variants for: ${condition.commonName}`);
    console.log(`   Target geographies: ${geographies.length}`);

    for (const geo of geographies) {
        const targetLang = getLanguageForGeo(geo.slug, 'india');

        if (targetLang === 'en') {
            stats.skipped++;
            continue;
        }

        // Check if already exists
        if (options.skipExisting) {
            const existing = await prisma.localizedContent.findFirst({
                where: {
                    conditionId: condition.id,
                    languageCode: targetLang,
                    geographyId: geo.id,
                },
            });

            if (existing) {
                stats.skipped++;
                continue;
            }
        }

        try {
            console.log(`   → ${targetLang} for ${geo.name}...`);

            const translated = await translateContent(
                {
                    conditionName: condition.commonName,
                    description: condition.description || '',
                    symptoms: condition.symptoms || [],
                    causes: condition.causes || [],
                    treatments: condition.treatments || [],
                },
                targetLang,
                geo.name,
                'India'
            );

            await prisma.localizedContent.upsert({
                where: {
                    conditionId_languageCode_geographyId: {
                        conditionId: condition.id,
                        languageCode: targetLang,
                        geographyId: geo.id,
                    },
                },
                update: {
                    title: translated.title,
                    description: translated.description,
                    localizedAdvice: translated.localizedAdvice,
                    consultationTips: translated.consultationTips,
                    metaTitle: translated.metaTitle,
                    metaDescription: translated.metaDescription,
                    status: 'ai_draft' as ContentStatus,
                    aiModelUsed: 'deepseek/deepseek-chat',
                    wordCount: translated.description.split(/\s+/).length,
                },
                create: {
                    conditionId: condition.id,
                    languageCode: targetLang,
                    geographyId: geo.id,
                    title: translated.title,
                    description: translated.description,
                    localizedAdvice: translated.localizedAdvice,
                    consultationTips: translated.consultationTips,
                    metaTitle: translated.metaTitle,
                    metaDescription: translated.metaDescription,
                    status: 'ai_draft' as ContentStatus,
                    aiModelUsed: 'deepseek/deepseek-chat',
                    wordCount: translated.description.split(/\s+/).length,
                },
            });

            stats.created++;
            stats.processed++;

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`   ❌ Error: ${error}`);
            stats.errors++;
        }
    }

    return stats;
}

/**
 * Batch process: Generate national-level translations
 * One translation per language (not per city), for use as base content
 */
async function generateNationalTranslations(
    options: {
        limit?: number;
        languages?: string[];
    } = {}
): Promise<ProcessingStats> {
    const stats: ProcessingStats = {
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
    };

    // Target languages (major Indian languages)
    const targetLanguages = options.languages || [
        'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'or'
    ];

    console.log(`\n🌐 Generating national translations for: ${targetLanguages.join(', ')}`);

    // Get conditions
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: {
            id: true,
            slug: true,
            commonName: true,
            description: true,
            symptoms: true,
            treatments: true,
        },
        take: options.limit || 1000,
        orderBy: { commonName: 'asc' },
    });

    console.log(`Processing ${conditions.length} conditions...`);

    for (const condition of conditions) {
        for (const lang of targetLanguages) {
            // Check if national-level translation exists (geographyId = null)
            const existing = await prisma.localizedContent.findFirst({
                where: {
                    conditionId: condition.id,
                    languageCode: lang,
                    geographyId: null,
                },
            });

            if (existing) {
                stats.skipped++;
                continue;
            }

            try {
                console.log(`📝 ${condition.commonName} → ${lang}`);

                const translated = await translateContent(
                    {
                        conditionName: condition.commonName,
                        description: condition.description || '',
                        symptoms: condition.symptoms || [],
                        treatments: condition.treatments || [],
                    },
                    lang,
                    'India',
                    'India'
                );

                await prisma.localizedContent.create({
                    data: {
                        conditionId: condition.id,
                        languageCode: lang,
                        geographyId: null, // National level
                        title: translated.title,
                        description: translated.description,
                        localizedAdvice: translated.localizedAdvice,
                        consultationTips: translated.consultationTips,
                        metaTitle: translated.metaTitle,
                        metaDescription: translated.metaDescription,
                        status: 'ai_draft' as ContentStatus,
                        aiModelUsed: 'deepseek/deepseek-chat',
                        wordCount: translated.description.split(/\s+/).length,
                    },
                });

                stats.created++;
                stats.processed++;

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1200));

            } catch (error) {
                console.error(`❌ Error: ${error}`);
                stats.errors++;
            }
        }
    }

    return stats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    console.log('🌍 Content Translation Pipeline\n');
    console.log('='.repeat(60));

    const args = process.argv.slice(2);
    const mode = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'national';
    const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '10');
    const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1];
    const condition = args.find(a => a.startsWith('--condition='))?.split('=')[1];

    console.log(`Mode: ${mode}`);
    console.log(`Limit: ${limit}`);
    if (lang) console.log(`Language: ${lang}`);
    if (condition) console.log(`Condition: ${condition}`);
    console.log('');

    let stats: ProcessingStats;

    try {
        switch (mode) {
            case 'national':
                // Generate national-level translations (one per language)
                stats = await generateNationalTranslations({
                    limit,
                    languages: lang ? [lang] : undefined,
                });
                break;

            case 'condition':
                // Generate all variants for a specific condition
                if (!condition) {
                    console.error('❌ Please provide --condition=slug');
                    process.exit(1);
                }
                stats = await generateConditionVariants(condition, { skipExisting: true });
                break;

            case 'geo':
                // Generate geo-specific translations
                stats = await translateConditions({
                    limit,
                    targetLang: lang,
                    skipExisting: true,
                });
                break;

            default:
                console.error(`❌ Unknown mode: ${mode}`);
                console.log('Available modes: national, condition, geo');
                process.exit(1);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Translation complete!\n');
        console.log('📊 Stats:');
        console.log(`   Processed: ${stats.processed}`);
        console.log(`   Created: ${stats.created}`);
        console.log(`   Updated: ${stats.updated}`);
        console.log(`   Skipped: ${stats.skipped}`);
        console.log(`   Errors: ${stats.errors}`);

        // Show total in database
        const totalContent = await prisma.localizedContent.count();
        console.log(`\n📦 Total localized content: ${totalContent}`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
