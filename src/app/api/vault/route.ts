import { NextRequest, NextResponse } from 'next/server';
import { createVaultFolder, getVaultFiles, addFileToVault, getSignedUrl } from '@/lib/vault/drive-bridge';

/**
 * Health Vault API
 *
 * GET  /api/vault?session=xxx — Get vault + files
 * POST /api/vault — Create vault / add file
 */

export async function GET(request: NextRequest) {
    const session = request.nextUrl.searchParams.get('session');
    if (!session) return NextResponse.json({ error: 'session required' }, { status: 400 });

    const vault = await getVaultFiles(session);
    return NextResponse.json({ vault });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, sessionHash, countryCode, ...params } = body;

        if (action === 'create_vault') {
            const result = await createVaultFolder(sessionHash, countryCode || 'US');
            return NextResponse.json(result);
        }

        if (action === 'add_file') {
            const fileId = await addFileToVault(params.vaultId, {
                fileName: params.fileName,
                fileType: params.fileType || 'other',
                mimeType: params.mimeType || 'application/pdf',
                fileSizeBytes: params.fileSizeBytes || 0,
                analysisId: params.analysisId,
            });
            return NextResponse.json({ fileId });
        }

        if (action === 'get_signed_url') {
            const url = await getSignedUrl(params.fileId);
            return NextResponse.json({ url });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Vault operation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
