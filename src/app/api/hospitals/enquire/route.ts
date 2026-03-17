import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';

// Rate limit: 5 enquiry requests per minute
const ENQUIRY_RATE_LIMIT = { maxRequests: 5, windowMs: 60 * 1000 };

export async function POST(req: NextRequest) {
    // Apply rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`hospital-enquiry:${clientId}`, ENQUIRY_RATE_LIMIT);

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
            email,
            country,
            patientType,
            enquiryType,
            condition,
            specialty,
            message,
            hasInsurance,
            insuranceProvider,
            hospitalSlug,
        } = body;

        // Validate required fields
        if (!patientName || !phone || !email) {
            return NextResponse.json(
                { error: 'Name, phone, and email are required' },
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

        // Find hospital
        const hospital = await prisma.hospital.findUnique({
            where: { slug: hospitalSlug },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json(
                { error: 'Hospital not found' },
                { status: 404 }
            );
        }

        // Create the enquiry
        await prisma.hospitalEnquiry.create({
            data: {
                hospitalId: hospital.id,
                patientName,
                patientPhone: cleanPhone,
                patientEmail: email,
                patientCountry: country || null,
                patientType: patientType === 'international' ? 'international' : 'domestic',
                enquiryType: enquiryType || null,
                condition: condition || null,
                specialty: specialty || null,
                message: message || null,
                hasInsurance: hasInsurance || false,
                insuranceProvider: insuranceProvider || null,
                status: 'new',
                sessionHash: clientId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Hospital enquiry error:', error);
        return NextResponse.json(
            { error: 'Failed to submit enquiry. Please try again.' },
            { status: 500 }
        );
    }
}
