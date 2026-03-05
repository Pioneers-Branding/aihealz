import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages, condition } = await req.json();

        const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
        const apiBase = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';

        if (!apiKey) {
            return NextResponse.json({ error: 'Missing API Key setting' }, { status: 500 });
        }

        const systemMessage = {
            role: 'system',
            content: `You are the AI Care Bot for AIHealz. You provide safe OVER-THE-COUNTER (OTC) medications and HOME REMEDIES for users experiencing minor symptoms or asking about specific conditions. 
            If the user asks about ${condition ? `the condition '${condition}'` : 'a symptom'}, give them 3 actionable home remedies and 2 safe OTC options with dosages.
            CRITICAL: ALWAYS include a disclaimer that you are an AI and they should see a doctor if symptoms are severe or persist.
            Keep your responses concise, friendly, and formatted nicely in Markdown.`
        };

        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        let response: Response;
        try {
            response = await fetch(`${apiBase}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: process.env.AI_MODEL || 'meta-llama/llama-3-8b-instruct',
                    messages: [systemMessage, ...messages],
                    temperature: 0.3,
                    max_tokens: 1000
                }),
                signal: controller.signal,
            });
        } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json({
                    error: 'Request timed out. Please try again.'
                }, { status: 504 });
            }
            throw fetchError;
        }
        clearTimeout(timeoutId);

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: data.error?.message || 'LLM error' }, { status: 500 });
        }

        return NextResponse.json({
            reply: data.choices[0].message.content,
            role: 'assistant'
        });

    } catch (error) {
        console.error('Bot API error:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
