import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const body = await req.json();
        const { googleKeyJson, bingApiKey } = body;

        let verified = false;
        const errors: string[] = [];

        // Verify Google Indexing API key
        if (googleKeyJson) {
            try {
                const keyData = JSON.parse(googleKeyJson);
                if (keyData.type === 'service_account' && keyData.project_id && keyData.private_key) {
                    verified = true;
                } else {
                    errors.push('Invalid Google service account key format');
                }
            } catch {
                errors.push('Invalid JSON format for Google key');
            }
        }

        // Verify Bing API key (basic format check)
        if (bingApiKey) {
            if (bingApiKey.length >= 32) {
                verified = true;
            } else {
                errors.push('Bing API key appears to be invalid');
            }
        }

        if (!googleKeyJson && !bingApiKey) {
            return NextResponse.json({ verified: false, error: 'No credentials provided' });
        }

        return NextResponse.json({
            verified,
            error: errors.length > 0 ? errors.join('; ') : undefined,
        });
    } catch (error) {
        console.error('Verification failed:', error);
        return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 500 });
    }
}
