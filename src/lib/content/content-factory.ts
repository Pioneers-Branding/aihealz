import { generateConditionRender } from '@/lib/cms/media-engine';
import { getIntentKeyword } from './intent-analyzer';
import { getTreatmentCost } from './cost-estimator';
import { getSpecialistsForCondition } from './specialist-matcher';
import prisma from '@/lib/db';

/**
 * Content Factory — Frugal LLM Pipeline
 * 
 * Orchestrates the generation of a condition page:
 * 1. Visual: Checks/Generates Media.
 * 2. Intent: Gets Primary Keyword.
 * 3. Content: Calls OpenRouter (DeepSeek/Llama3).
 * 4. Data: Gets Costs & Specialists.
 * 5. Saves to `condition_content`.
 */

const OPENROUTER_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_BASE = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';

export async function generatePage(
    conditionSlug: string,
    countryCode: string,
    citySlug?: string,
    language: string = 'en'
) {
    // 1. Fetch Basic Info
    const condition = await prisma.medicalCondition.findUnique({
        where: { slug: conditionSlug }
    });
    if (!condition) throw new Error(`Condition ${conditionSlug} not found`);

    // 2. Keyword Intent
    const keyword = await getIntentKeyword(conditionSlug, condition.commonName, citySlug, countryCode);

    // 3. AI Content Generation
    const locationName = citySlug ? citySlug : countryCode;
    const prompt = `
    Generate content for a medical condition page.
    Condition: "${condition.commonName}"
    Location: "${locationName}"
    Primary Keyword: "${keyword}"
    Language: "${language}"

    Structure (JSON):
    {
      "h1_title": "Semantic H1 optimized for keyword",
      "meta_summary": "150 chars meta description",
      "llm_summary": "Concise summary for AI bots (hidden)",
      "ai_opinion": "Simplified, non-diagnostic overview (AI Second Opinion)",
      "local_insights": "How local climate/environment in ${locationName} affects this condition",
      "treatment_guide": "Standard protocols and what to expect during a visit",
      "recovery_tips": "Recovery advice",
      "faqs": [ {"question": "...", "answer": "..."} ]
    }
    
    Be authoritative, empathetic, and medically accurate.
  `;

    let contentData;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2, // Low temp for factual accuracy
                response_format: { type: 'json_object' }
            }),
        });
        clearTimeout(timeoutId);

        const json = await res.json();
        contentData = JSON.parse(json.choices[0].message.content);
    } catch (e) {
        console.error('Content Gen Error:', e);
        throw e;
    }

    // 4. Visuals (Side-effect: ensures image exists)
    await generateConditionRender(conditionSlug, condition.commonName);

    // 5. Cost Estimates (Side-effect: ensures estimate exists)
    if (citySlug) {
        await getTreatmentCost(conditionSlug, condition.commonName, citySlug, countryCode);
    }

    // 6. specialist data is dynamic, resolved at runtime usually, but we can verify sufficient supply here if needed.

    // 7. Save to DB
    const page = await prisma.conditionContent.upsert({
        where: {
            conditionSlug_countryCode_citySlug_language: {
                conditionSlug,
                countryCode,
                citySlug: citySlug || '',
                language
            }
        },
        update: {
            h1Title: contentData.h1_title,
            metaSummary: contentData.meta_summary,
            llmSummary: contentData.llm_summary,
            aiOpinion: contentData.ai_opinion,
            localInsights: contentData.local_insights,
            treatmentGuide: contentData.treatment_guide,
            recoveryTips: contentData.recovery_tips,
            faqSchema: contentData.faqs,
            needsRefresh: false,
            lastGenerated: new Date()
        },
        create: {
            conditionSlug,
            countryCode,
            citySlug: citySlug || '',
            language,
            h1Title: contentData.h1_title,
            metaSummary: contentData.meta_summary,
            llmSummary: contentData.llm_summary,
            aiOpinion: contentData.ai_opinion,
            localInsights: contentData.local_insights,
            treatmentGuide: contentData.treatment_guide,
            recoveryTips: contentData.recovery_tips,
            faqSchema: contentData.faqs,
        }
    });

    return page;
}

export async function generatePageDeepSeek(
    conditionSlug: string,
    countryCode: string,
    citySlug?: string,
    language: string = 'en'
) {
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || 'sk-7ec6f4ecd72e4c2aa511923212c8ee46';

    // 1. Fetch Basic Info
    const condition = await prisma.medicalCondition.findUnique({
        where: { slug: conditionSlug }
    });
    if (!condition) throw new Error(`Condition ${conditionSlug} not found`);

    // 2. Keyword Intent
    const keyword = await getIntentKeyword(conditionSlug, condition.commonName, citySlug, countryCode);

    // 3. AI Content Generation
    const locationName = citySlug ? citySlug : countryCode;

    // Deep SEO Prompting Strategy
    const prompt = `
    You are an elite SEO Medical Copywriter. Generate content for a medical condition page.
    Condition: "${condition.commonName}"
    Location: "${locationName}"
    Primary SEO Keyword: "${keyword}"
    Language: "${language}"

    Structure (JSON only):
    {
      "h1_title": "Semantic H1 optimized for the primary keyword.",
      "meta_summary": "Extremely concise 150-160 character meta description designed to maximize CTR.",
      "llm_summary": "Concise hidden summary for AI bots.",
      "ai_opinion": "Authoritative, empathetic, and medically accurate overview.",
      "local_insights": "How the local climate or environment in ${locationName} affects ${condition.commonName}.",
      "treatment_guide": "Use H2 and H3 structures. Standard protocols and what to expect during a visit.",
      "recovery_tips": "Practical recovery advice using bullet points.",
      "faqs": [ 
          {"question": "Format as exactly what patients Google (e.g. 'Can I cure ${condition.commonName} at home?')", "answer": "Direct, helpful answer optimized for Google Featured Snippets."} 
      ]
    }
    
    Do not use markdown blocks, output pure JSON.
  `;

    let contentData;
    let retries = 3;
    while (retries > 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for DeepSeek

            const res = await fetch(`https://api.deepseek.com/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_KEY}`,
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    response_format: { type: 'json_object' }
                }),
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                console.error(`DeepSeek Error: ${res.status} ${res.statusText}`);
                retries--;
                await new Promise(r => setTimeout(r, 3000));
                if (retries === 0) throw new Error(`Fetch failed: ${res.statusText}`);
                continue;
            }

            const json = await res.json();
            contentData = JSON.parse(json.choices[0].message.content);
            break;
        } catch (e: any) {
            retries--;
            if (retries === 0) {
                console.error(`Skipping ${conditionSlug}:`, e.message);
                throw e;
            }
            await new Promise(r => setTimeout(r, 4000));
        }
    }

    if (!contentData) throw new Error(`Failed to generate content for ${conditionSlug}`);

    // Execute heavy logic locally avoiding API calls
    await generateConditionRender(conditionSlug, condition.commonName);
    if (citySlug) {
        await getTreatmentCost(conditionSlug, condition.commonName, citySlug, countryCode);
    }

    // 4. Save to DB
    const page = await prisma.conditionContent.upsert({
        where: {
            conditionSlug_countryCode_citySlug_language: {
                conditionSlug,
                countryCode,
                citySlug: citySlug || '',
                language
            }
        },
        update: {
            h1Title: contentData.h1_title,
            metaSummary: contentData.meta_summary,
            llmSummary: contentData.llm_summary,
            aiOpinion: contentData.ai_opinion,
            localInsights: contentData.local_insights,
            treatmentGuide: contentData.treatment_guide,
            recoveryTips: contentData.recovery_tips,
            faqSchema: contentData.faqs,
            needsRefresh: false,
            lastGenerated: new Date()
        },
        create: {
            conditionSlug,
            countryCode,
            citySlug: citySlug || '',
            language,
            h1Title: contentData.h1_title,
            metaSummary: contentData.meta_summary,
            llmSummary: contentData.llm_summary,
            aiOpinion: contentData.ai_opinion,
            localInsights: contentData.local_insights,
            treatmentGuide: contentData.treatment_guide,
            recoveryTips: contentData.recovery_tips,
            faqSchema: contentData.faqs,
        }
    });

    return page;
}
