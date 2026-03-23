import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });
}

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            return NextResponse.json({
                success: true,
                plan: session.metadata?.planId || 'premium',
                customerEmail: session.customer_email,
            });
        }

        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify checkout session';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
