import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * CMS: Prompt Lab
 *
 * GET  /api/admin/prompt-lab — List all prompts
 * POST /api/admin/prompt-lab — Test a prompt against sample input
 * PUT  /api/admin/prompt-lab — Activate a specific prompt version
 */

export async function GET() {
    const prompts = await prisma.promptLabEntry.findMany({
        orderBy: [{ promptType: 'asc' }, { updatedAt: 'desc' }],
        select: {
            id: true,
            promptName: true,
            promptType: true,
            systemPrompt: true,
            sampleInput: true,
            expectedOutput: true,
            actualOutput: true,
            modelUsed: true,
            tokenCount: true,
            latencyMs: true,
            score: true,
            isActive: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json({ prompts });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { promptName, promptType, systemPrompt, sampleInput, createdBy } = body;

        if (!promptName || !promptType || !systemPrompt) {
            return NextResponse.json(
                { error: 'promptName, promptType, and systemPrompt are required' },
                { status: 400 }
            );
        }

        // If sample input provided, test the prompt
        let actualOutput: string | null = null;
        let tokenCount: number | null = null;
        let latencyMs: number | null = null;
        let modelUsed = process.env.AI_MODEL || 'gpt-4o-mini';

        if (sampleInput) {
            const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
            const apiBase = process.env.AI_API_BASE || 'https://api.openai.com/v1';

            if (apiKey) {
                const start = Date.now();
                const response = await fetch(`${apiBase}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: modelUsed,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: sampleInput },
                        ],
                        temperature: 0.2,
                        max_tokens: 2000,
                    }),
                });

                latencyMs = Date.now() - start;

                if (response.ok) {
                    const data = await response.json();
                    actualOutput = data.choices?.[0]?.message?.content || null;
                    tokenCount = data.usage?.total_tokens || null;
                    modelUsed = data.model || modelUsed;
                }
            }
        }

        const entry = await prisma.promptLabEntry.create({
            data: {
                promptName,
                promptType,
                systemPrompt,
                sampleInput: sampleInput || null,
                actualOutput: actualOutput ? JSON.parse(actualOutput) : null,
                modelUsed,
                tokenCount,
                latencyMs,
                createdBy: createdBy || 'admin',
            },
        });

        return NextResponse.json({ success: true, entry });
    } catch (error) {
        console.error('Prompt lab error:', error);
        return NextResponse.json({ error: 'Failed to test prompt' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, promptType } = body;

        if (!id || !promptType) {
            return NextResponse.json(
                { error: 'id and promptType are required' },
                { status: 400 }
            );
        }

        // Deactivate all prompts of this type
        await prisma.promptLabEntry.updateMany({
            where: { promptType, isActive: true },
            data: { isActive: false },
        });

        // Activate the selected prompt
        await prisma.promptLabEntry.update({
            where: { id },
            data: { isActive: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Prompt activation error:', error);
        return NextResponse.json({ error: 'Failed to activate prompt' }, { status: 500 });
    }
}
