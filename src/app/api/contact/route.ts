import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { z } from 'zod';
import prisma from '@/lib/db';
import { sendContactFormNotification } from '@/lib/email';

// Input validation schema with better email validation
const contactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).trim(),
    email: z.string().email('Invalid email address').max(200).toLowerCase().trim(),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000).trim(),
    source: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
    // Apply strict rate limiting to prevent spam
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`contact:${clientId}`, RATE_LIMITS.contact);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many submissions. Please wait before sending another message.' },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const body = await req.json();

        // Validate input with Zod
        const validation = contactSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, message, source } = validation.data;

        // Get client info for tracking
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                          req.headers.get('x-real-ip') ||
                          'unknown';
        const userAgent = req.headers.get('user-agent') || undefined;

        // Store submission in database
        const submission = await prisma.contactSubmission.create({
            data: {
                name,
                email,
                message,
                source: source || 'contact_form',
                ipAddress: ipAddress.substring(0, 45),
                userAgent: userAgent?.substring(0, 500),
            },
        });

        // Log for monitoring
        console.log('[Contact Form Submission]', {
            id: submission.id,
            name,
            email,
            messageLength: message.length,
            timestamp: submission.createdAt.toISOString(),
        });

        // Send email notification to support team (non-blocking)
        sendContactFormNotification(name, email, 'Contact Form Inquiry', message)
            .catch(err => console.error('[Contact Form] Email notification failed:', err));

        return NextResponse.json(
            {
                success: true,
                message: 'Your message has been received. We will get back to you within 24 hours.',
                submissionId: submission.id,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Contact form error:', error);

        return NextResponse.json(
            { error: 'Failed to submit message. Please try again or email us directly at support@aihealz.com' },
            { status: 500 }
        );
    }
}
