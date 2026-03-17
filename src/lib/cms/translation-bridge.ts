import prisma from '@/lib/db';
import crypto from 'crypto';

/**
 * Translation Bridge — Multi-Provider, Cache-First
 *
 * Strategy:
 * 1. Check translation_cache (pay once, serve forever)
 * 2. Indian Languages → Sarvam AI (low cost, high accuracy)
 * 3. Global Languages → OpenRouter/DeepSeek-V3
 * 4. Store result in cache
 */

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const OPENROUTER_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_BASE = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';

const INDIAN_LANGUAGES = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'];
const SARVAM_LANG_MAP: Record<string, string> = {
    hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN',
    mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
};

interface TranslationResult {
    translatedText: string;
    api: string;
    model?: string;
    fromCache: boolean;
    cost: number;
}

/**
 * Translate text with cache-first strategy.
 */
export async function translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'en',
    category: string = 'medical'
): Promise<TranslationResult> {
    if (sourceLang === targetLang) {
        return { translatedText: text, api: 'none', fromCache: true, cost: 0 };
    }

    const textHash = crypto.createHash('sha256').update(text).digest('hex');

    // 1. Check cache
    const cached = await prisma.translationCache.findUnique({
        where: { sourceTextHash_targetLanguage: { sourceTextHash: textHash, targetLanguage: targetLang } },
    });

    if (cached) {
        return {
            translatedText: cached.translatedText,
            api: cached.translationApi,
            model: cached.modelUsed || undefined,
            fromCache: true,
            cost: 0,
        };
    }

    // 2. Route to appropriate API
    let result: TranslationResult;

    if (INDIAN_LANGUAGES.includes(targetLang) && SARVAM_API_KEY) {
        result = await translateWithSarvam(text, targetLang, sourceLang);
    } else {
        result = await translateWithOpenRouter(text, targetLang, sourceLang);
    }

    // 3. Store in cache
    await prisma.translationCache.create({
        data: {
            sourceTextHash: textHash,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            sourceText: text,
            translatedText: result.translatedText,
            translationApi: result.api,
            modelUsed: result.model || null,
            costUsd: result.cost,
            category,
        },
    });

    return result;
}

/**
 * Batch translate multiple texts.
 */
export async function translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang: string = 'en',
    category: string = 'medical'
): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];

    for (const text of texts) {
        const result = await translate(text, targetLang, sourceLang, category);
        results.push(result);
        // Small delay between requests
        if (!result.fromCache) await new Promise((r) => setTimeout(r, 200));
    }

    return results;
}

// ── Sarvam AI (Indian Languages) ────────────────────────────

async function translateWithSarvam(
    text: string,
    targetLang: string,
    sourceLang: string
): Promise<TranslationResult> {
    try {
        const res = await fetch('https://api.sarvam.ai/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'API-Subscription-Key': SARVAM_API_KEY,
            },
            body: JSON.stringify({
                input: text,
                source_language_code: sourceLang === 'en' ? 'en-IN' : sourceLang,
                target_language_code: SARVAM_LANG_MAP[targetLang] || targetLang,
                mode: 'formal',
                enable_preprocessing: true,
            }),
        });

        if (!res.ok) throw new Error(`Sarvam error: ${res.status}`);
        const data = await res.json();

        return {
            translatedText: data.translated_text || text,
            api: 'sarvam',
            model: 'sarvam-translate-v1',
            fromCache: false,
            cost: 0.0001, // ~$0.0001 per request
        };
    } catch (error) {
        console.error('Sarvam translation failed, falling back to OpenRouter:', error);
        return translateWithOpenRouter(text, targetLang, sourceLang);
    }
}

// ── OpenRouter / DeepSeek (Global Languages) ────────────────

async function translateWithOpenRouter(
    text: string,
    targetLang: string,
    sourceLang: string
): Promise<TranslationResult> {
    const langNames: Record<string, string> = {
        en: 'English', es: 'Spanish', fr: 'French', de: 'German',
        ar: 'Arabic', ru: 'Russian', pt: 'Portuguese', sw: 'Swahili',
        hi: 'Hindi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali',
        ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
    };

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
                        content: `You are a medical translator. Translate from ${langNames[sourceLang] || sourceLang} to ${langNames[targetLang] || targetLang}. Preserve medical terminology. Output ONLY the translation.`,
                    },
                    { role: 'user', content: text },
                ],
                temperature: 0.2,
                max_tokens: 2000,
            }),
        });

        if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
        const data = await res.json();
        const translated = data.choices?.[0]?.message?.content || text;
        const tokens = data.usage?.total_tokens || 0;

        return {
            translatedText: translated.trim(),
            api: 'openrouter',
            model: 'deepseek/deepseek-chat',
            fromCache: false,
            cost: tokens * 0.000001, // ~$1/M tokens
        };
    } catch {
        return { translatedText: text, api: 'failed', fromCache: false, cost: 0 };
    }
}

/**
 * Get translation cache stats for CMS.
 */
export async function getTranslationStats() {
    const total = await prisma.translationCache.count();
    const unaudited = await prisma.translationCache.count({ where: { isAudited: false } });
    const byApi = await prisma.translationCache.groupBy({
        by: ['translationApi'],
        _count: { id: true },
    });
    const byLang = await prisma.translationCache.groupBy({
        by: ['targetLanguage'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
    });
    const totalCost = await prisma.translationCache.aggregate({
        _sum: { costUsd: true },
    });

    return {
        total,
        unaudited,
        byApi: Object.fromEntries(byApi.map((a) => [a.translationApi, a._count.id])),
        byLanguage: byLang.map((l) => ({ lang: l.targetLanguage, count: l._count.id })),
        totalCostUsd: totalCost._sum.costUsd ? Number(totalCost._sum.costUsd) : 0,
    };
}
