import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';

// Rate limit: 5 booking requests per minute
const BOOK_RATE_LIMIT = { maxRequests: 5, windowMs: 60 * 1000 };

export async function POST(req: NextRequest) {
    // Apply rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`book-doctor:${clientId}`, BOOK_RATE_LIMIT);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429, headers: rateLimitHeaders(rateLimit) }
        );
    }

    try {
        const body = await req.json();
        const {
            patientName,
            phone,
            preferredDate,
        } = body;

        // Validate required fields
        if (!patientName || !phone || !preferredDate) {
            return NextResponse.json(
                { error: 'Name, phone, and preferred date are required' },
                { status: 400 }
            );
        }

        // Basic phone validation
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return NextResponse.json(
                { error: 'Please enter a valid phone number' },
                { status: 400 }
            );
        }

        // In production, this would:
        // 1. Store in database
        // 2. Send email/SMS notification to doctor
        // 3. Trigger CRM workflow
        // For now, just log and return success
        console.log('Doctor appointment request:', {
            ...body,
            timestamp: new Date().toISOString(),
            clientId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json(
            { error: 'Failed to process request. Please try again.' },
            { status: 500 }
        );
    }
}
