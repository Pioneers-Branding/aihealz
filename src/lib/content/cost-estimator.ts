import prisma from '@/lib/db';
import { translate } from '@/lib/cms/translation-bridge';

/**
 * Cost Estimator
 * 
 * Uses AI (or stored data) to estimate treatment costs for a condition in a city.
 * Returns: { min, max, avg, currency, treatmentName }
 */

const OPENROUTER_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_BASE = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';

export async function getTreatmentCost(
    conditionSlug: string,
    conditionName: string,
    citySlug: string,
    countryCode: string
) {
    // 1. Check DB
    const stored = await prisma.treatmentCost.findFirst({
        where: {
            conditionSlug,
            citySlug,
            countryCode
        }
    });

    if (stored) return stored;

    // 2. Generate via AI
    try {
        const prompt = `Estimate the typical cost range for treating "${conditionName}" in ${citySlug}, ${countryCode}.
Return valid JSON ONLY:
{
  "treatmentName": "Specific Procedure Name (e.g. MRI, Surgery)",
  "currency": "Currency Code (e.g. INR, USD, KES)",
  "min": 1000,
  "max": 5000,
  "avg": 3000
}
Use local market rates. Be conservative.`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for LLM

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
                temperature: 0.1,
            }),
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error('AI estimation failed');

        const data = await res.json();
        const content = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(content);

        // Store estimate
        const newCost = await prisma.treatmentCost.create({
            data: {
                conditionSlug,
                citySlug,
                countryCode,
                treatmentName: parsed.treatmentName,
                currency: parsed.currency,
                minCost: parsed.min,
                maxCost: parsed.max,
                avgCost: parsed.avg,
                dataSource: 'ai_estimate',
                confidence: 0.85
            }
        });

        return newCost;

    } catch (e) {
        console.error('Cost estimation error:', e);
        return null;
    }
}
