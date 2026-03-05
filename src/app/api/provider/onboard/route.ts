import { NextRequest, NextResponse } from 'next/server';
import { processOnboardingStep, getOnboarding, OnboardingData } from '@/lib/provider/onboarding';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';

/**
 * Parse and validate a numeric ID from string or number input.
 */
function parseNumericId(val: unknown, fieldName: string): number {
    if (typeof val === 'number' && val > 0 && val <= 2147483647 && Number.isInteger(val)) return val;
    if (typeof val === 'string') {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > 0 && num <= 2147483647) return num;
    }
    throw new Error(`Invalid ${fieldName}`);
}

/**
 * Provider Onboarding API
 *
 * POST /api/provider/onboard — Process an onboarding step
 * GET  /api/provider/onboard?doctorId=123 — Get onboarding status
 */

export async function POST(request: NextRequest) {
    // Rate limit onboarding requests
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`onboard:${clientId}`, RATE_LIMITS.form);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait before trying again.' },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const body = await request.json();

        // Validate required fields
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const doctorId = parseNumericId(body.doctorId, 'doctorId');
        const step = parseNumericId(body.step, 'step');

        if (step < 1 || step > 10) {
            return NextResponse.json({ error: 'Step must be between 1 and 10' }, { status: 400 });
        }

        // Build onboarding data with validated fields
        const onboardingData: OnboardingData = {
            doctorId,
            step,
            profile: body.profile,
            license: body.license,
            bio: body.bio,
            conditions: body.conditions,
            planSlug: body.planSlug,
        };

        const result = await processOnboardingStep(onboardingData);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Onboarding error:', error);
        const message = error instanceof Error ? error.message : 'Onboarding failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const doctorIdParam = request.nextUrl.searchParams.get('doctorId');
    if (!doctorIdParam) {
        return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    // Validate doctorId is a valid positive integer
    const doctorId = parseInt(doctorIdParam, 10);
    if (isNaN(doctorId) || doctorId <= 0 || doctorId > 2147483647) {
        return NextResponse.json({ error: 'Invalid doctorId' }, { status: 400 });
    }

    try {
        const onboarding = await getOnboarding(doctorId);
        return NextResponse.json({ onboarding });
    } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
        return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }
}
