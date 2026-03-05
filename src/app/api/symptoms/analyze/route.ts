import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { symptoms: rawSymptoms, age, gender } = body as {
            symptoms: unknown;
            age?: string;
            gender?: string;
        };

        // Handle various input formats for symptoms
        let symptoms: string[] = [];

        if (Array.isArray(rawSymptoms)) {
            // Filter to only strings and non-empty values
            symptoms = rawSymptoms
                .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
                .map(s => s.trim());
        } else if (typeof rawSymptoms === 'string' && rawSymptoms.trim()) {
            symptoms = rawSymptoms.split(',').map(s => s.trim()).filter(Boolean);
        } else if (rawSymptoms && typeof rawSymptoms === 'object') {
            // Handle object with symptom names as keys (from some UIs)
            const values = Object.values(rawSymptoms);
            symptoms = values
                .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
                .map(s => s.trim());
        }

        if (symptoms.length === 0) {
            return NextResponse.json({ error: 'Please provide at least one symptom.' }, { status: 400 });
        }

        // ── Build the AI prompt ─────────────────────────
        const patientContext = [
            age ? `Age: ${age}` : null,
            gender ? `Gender: ${gender}` : null,
        ].filter(Boolean).join(', ');

        const systemPrompt = `You are a medical AI assistant. You analyze patient symptoms and suggest possible conditions along with safe over-the-counter and home remedies.
You MUST respond with ONLY a valid JSON array, no markdown, no explanation text outside the JSON.
Each object in the array must have these exact keys:
- "name": the medical condition name (string)
- "likelihood": percentage likelihood 1-100 (number)
- "explanation": brief 1-2 sentence explanation of why this symptom pattern matches (string)
- "tests": array of 2-3 recommended diagnostic tests to confirm (string array)
- "urgency": one of "low", "moderate", "high", "emergency" (string)
- "otc_remedies": array of 1-3 safe over-the-counter medicines with exact dosages (string array)
- "home_care": array of 1-3 natural or at-home lifestyle remedies to ease the specific symptoms (string array)

Return 5-8 conditions, sorted by likelihood descending.
IMPORTANT: Use common medical condition names that patients would understand. Only recommend OTC remedies for conditions that are safe to self-treat (give empty arrays for emergencies like stroke or heart attack).
Respond with ONLY the JSON array. No other text.`;

        const userPrompt = `Patient reports the following symptoms: ${symptoms.join(', ')}
${patientContext ? `Patient info: ${patientContext}` : ''}

Analyze these symptoms and provide the most likely medical conditions as a JSON array.`;

        // Check for API key
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY is not configured');
            return NextResponse.json({
                error: 'AI service is not configured. Please contact support.'
            }, { status: 503 });
        }

        // ── Call OpenRouter (DeepSeek) with timeout ──────
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        let aiResponse: Response;
        try {
            aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com',
                    'X-Title': 'aihealz Symptom Checker',
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
                signal: controller.signal,
            });
        } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json({
                    error: 'Analysis timed out. Please try again with fewer symptoms.'
                }, { status: 504 });
            }
            throw fetchError;
        }
        clearTimeout(timeoutId);

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            console.error('OpenRouter error:', errText);
            return NextResponse.json({ error: 'AI service temporarily unavailable. Please try again.' }, { status: 502 });
        }

        const aiData = await aiResponse.json();
        const rawContent = aiData.choices?.[0]?.message?.content || '[]';

        // ── Parse AI response ──────────────────────────
        let conditions: Array<{
            name: string;
            likelihood: number;
            explanation: string;
            tests: string[];
            urgency: string;
            slug?: string;
            url?: string;
        }>;

        try {
            // Strip markdown code fences if present
            const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            conditions = JSON.parse(cleaned);
        } catch {
            console.error('Failed to parse AI response:', rawContent);
            return NextResponse.json({ error: 'Failed to analyze symptoms. Please try again.' }, { status: 500 });
        }

        // ── Cross-reference with our database ──────────
        const allConditions = await prisma.medicalCondition.findMany({
            where: { isActive: true },
            select: { slug: true, commonName: true },
        });

        // Build a lookup map (lowercase name → slug)
        const nameToSlug = new Map<string, string>();
        for (const c of allConditions) {
            nameToSlug.set(c.commonName.toLowerCase(), c.slug);
        }

        // Try to match each AI condition to our database
        for (const cond of conditions) {
            const exactMatch = nameToSlug.get(cond.name.toLowerCase());
            if (exactMatch) {
                cond.slug = exactMatch;
                cond.url = `/india/en/${exactMatch}`;
            } else {
                // Fuzzy: check if any DB condition name contains the AI condition name or vice versa
                for (const [dbName, dbSlug] of nameToSlug) {
                    if (dbName.includes(cond.name.toLowerCase()) || cond.name.toLowerCase().includes(dbName)) {
                        cond.slug = dbSlug;
                        cond.url = `/india/en/${dbSlug}`;
                        break;
                    }
                }
            }
        }

        return NextResponse.json({
            symptoms,
            analysis: conditions,
            disclaimer: 'This is an AI-assisted preliminary analysis and is NOT a medical diagnosis. Always consult a qualified healthcare professional.',
            model: aiData.model || 'deepseek/deepseek-chat',
        });

    } catch (error: unknown) {
        console.error('Symptom analysis error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
