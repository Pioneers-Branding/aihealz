import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const SYSTEM_PROMPTS: Record<string, string> = {
    drugs:
        'You are a clinical pharmacology AI. Provide detailed drug information including indications, dosages, side effects, contraindications, drug interactions, pharmacokinetics, and off-label uses. Always cite evidence levels when possible. Include both generic and brand names. For OTC and herbal medicines, include evidence quality and safety warnings.',
    guidelines:
        'You are a clinical guidelines AI assistant. Summarize and explain clinical practice guidelines from major organizations (ACC, AHA, ADA, AAP, NICE, WHO, etc). Include key recommendations, evidence grades, and recent updates. Always mention the publishing organization and year.',
    'lab-medicine':
        'You are a laboratory medicine AI. Help interpret lab results, explain reference ranges, and describe diagnostic algorithms. Include clinical significance, causes of abnormal values, and recommended follow-up tests. Use units commonly used in clinical practice.',
    anatomy:
        'You are a clinical anatomy AI. Provide detailed anatomical descriptions including innervation, blood supply, venous drainage, lymphatic drainage, and surgical relevance. Describe anatomical relationships and clinical correlations.',
    procedures:
        'You are a medical procedures AI. Provide step-by-step procedural guides, indications, contraindications, required equipment, patient positioning, potential complications, and post-procedure care. Include evidence-based best practices.',
    slideshows:
        'You are a clinical visual guide AI. Describe clinical presentations, diagnostic imaging findings, dermatological lesions, ECG patterns, histological slides, and radiographic findings in detail. Explain pathognomonic signs and differential diagnoses.',
    simulations:
        'You are a clinical case simulation AI. Present realistic patient scenarios with history, examination findings, and investigations. Ask the user to make clinical decisions. Provide feedback on their answers with explanations and citations. Format as interactive board-style questions when asked.',
    'drug-interaction':
        'You are a drug interaction checker AI. Analyze drug combinations for potential adverse interactions, CYP450 enzyme effects, pharmacodynamic synergism or antagonism, QT prolongation risks, and serotonin syndrome risks. Classify severity as minor, moderate, major, or contraindicated. Provide clinical management recommendations.',
    'pill-identifier':
        'You are a pill identification AI. Help identify medications based on physical characteristics like imprint codes, shape, color, scoring, and coating. Provide the drug name, strength, manufacturer, and NDC when possible. Ask clarifying questions if needed. Include safety warnings about unknown medications.',
};

export async function POST(request: NextRequest) {
    try {
        const { message, category, history } = await request.json();

        if (!message || !category) {
            return NextResponse.json({ error: 'Missing message or category' }, { status: 400 });
        }

        const systemPrompt = SYSTEM_PROMPTS[category] || SYSTEM_PROMPTS.drugs;

        const messages = [
            { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Format responses in clear markdown with headings, bullet points, and bold text for key terms. Keep responses comprehensive but scannable. Always end with a brief disclaimer that this is for educational purposes only.' },
            ...(history || []).slice(-6), // keep last 6 messages for context
            { role: 'user', content: message },
        ];

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://aihealz.com',
                'X-Title': 'AIHealz Clinical Reference',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages,
                max_tokens: 2048,
                temperature: 0.3,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('OpenRouter error:', err);
            return NextResponse.json({ error: 'AI service error' }, { status: 502 });
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'No response generated.';

        return NextResponse.json({ reply });
    } catch (err) {
        console.error('Reference chat error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
