import { NextRequest, NextResponse } from 'next/server';
import { translateConditionContent } from '@/lib/translate-condition-content';

/**
 * POST /api/translate-condition
 * Triggers on-demand translation of condition content.
 * Called from the client when a non-English page falls back to English.
 */
export async function POST(req: NextRequest) {
    try {
        const { conditionId, targetLang } = await req.json();

        if (!conditionId || !targetLang || targetLang === 'en') {
            return NextResponse.json({ ok: false, reason: 'invalid params' }, { status: 400 });
        }

        // Run translation (this may take 10-30 seconds for a full page)
        const created = await translateConditionContent(conditionId, targetLang);

        return NextResponse.json({ ok: true, created });
    } catch (error) {
        console.error('[api/translate-condition]', error);
        return NextResponse.json({ ok: false, error: 'translation failed' }, { status: 500 });
    }
}
