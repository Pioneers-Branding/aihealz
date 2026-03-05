import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// In-memory storage for SEO settings (in production, use database)
let seoSettings = {
    schemas: {
        organization: true,
        medicalWebPage: true,
        breadcrumbs: true,
        faq: true,
    },
    metaTemplates: {
        condition: 'Best [Condition] Doctors in [City] | Symptoms & Treatments',
        treatment: '[Treatment] Cost & Top Hospitals in [City]',
        doctor: 'Dr. [Name] - [Specialty] in [City] | Reviews & Appointment',
        city: 'Top Doctors & Hospitals in [City] | Healthcare Guide',
    },
    indexingApi: {
        googleKeyJson: '',
        bingApiKey: '',
        verified: false,
    },
    canonicalRules: {
        trailingSlash: false,
        wwwRedirect: true,
        httpsOnly: true,
    },
};

export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    // Return settings without sensitive API keys
    return NextResponse.json({
        settings: {
            ...seoSettings,
            indexingApi: {
                ...seoSettings.indexingApi,
                googleKeyJson: seoSettings.indexingApi.googleKeyJson ? '********' : '',
                bingApiKey: seoSettings.indexingApi.bingApiKey ? '********' : '',
            },
        },
    });
}

export async function POST(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const body = await req.json();

        // Update settings
        if (body.schemas) {
            seoSettings.schemas = { ...seoSettings.schemas, ...body.schemas };
        }
        if (body.metaTemplates) {
            seoSettings.metaTemplates = { ...seoSettings.metaTemplates, ...body.metaTemplates };
        }
        if (body.canonicalRules) {
            seoSettings.canonicalRules = { ...seoSettings.canonicalRules, ...body.canonicalRules };
        }
        if (body.indexingApi) {
            // Only update API keys if they're not masked
            if (body.indexingApi.googleKeyJson && body.indexingApi.googleKeyJson !== '********') {
                seoSettings.indexingApi.googleKeyJson = body.indexingApi.googleKeyJson;
                seoSettings.indexingApi.verified = false;
            }
            if (body.indexingApi.bingApiKey && body.indexingApi.bingApiKey !== '********') {
                seoSettings.indexingApi.bingApiKey = body.indexingApi.bingApiKey;
                seoSettings.indexingApi.verified = false;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save SEO settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
