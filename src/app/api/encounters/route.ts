import { NextRequest, NextResponse } from 'next/server';
import { createEncounter, respondToEncounter, sendChatMessage, getChatHistory } from '@/lib/vault/encounter-pipeline';

/**
 * Encounter & Chat API
 *
 * POST /api/encounters — Create encounter or send message
 * GET  /api/encounters?id=xxx — Get chat history
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...params } = body;

        switch (action) {
            case 'create': {
                const result = await createEncounter({
                    sessionHash: params.sessionHash,
                    doctorId: parseInt(params.doctorId, 10),
                    analysisId: params.analysisId,
                    vaultId: params.vaultId,
                    conditionSlug: params.conditionSlug,
                    geographyId: params.geographyId ? parseInt(params.geographyId, 10) : undefined,
                    enquiryType: params.enquiryType || 'opinion',
                    urgency: params.urgency || 'routine',
                    patientLanguage: params.patientLanguage || 'en',
                });
                return NextResponse.json(result);
            }

            case 'respond': {
                const result = await respondToEncounter(
                    params.encounterId,
                    parseInt(params.doctorId, 10),
                    params.response,
                    params.notes
                );
                return NextResponse.json(result);
            }

            case 'message': {
                const msg = await sendChatMessage(
                    params.encounterId,
                    params.senderType,
                    params.senderId,
                    params.content,
                    params.language || 'en'
                );
                return NextResponse.json(msg);
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Operation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const encounterId = request.nextUrl.searchParams.get('id');
    if (!encounterId) {
        return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const messages = await getChatHistory(encounterId);
    return NextResponse.json({ messages });
}
