import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
    });
}

export async function POST(req: Request) {
    try {
        const { planId, priceId, doctorEmail } = await req.json();

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        // Define pricing line items based on plan
        let lineItem;
        if (planId === 'premium') {
            lineItem = {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Premium Doctor Profile',
                        description: 'Enhanced visibility, priority ranking, and 50 lead credits per month.',
                    },
                    unit_amount: 1900, // $19.00 in cents
                    recurring: {
                        interval: 'month' as const,
                    }
                },
                quantity: 1,
            };
        } else if (planId === 'enterprise') {
            lineItem = {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Enterprise Doctor Profile',
                        description: 'Top-tier ranking, 1000 conditions, and 500 lead credits per month.',
                    },
                    unit_amount: 5900, // $59.00 in cents
                    recurring: {
                        interval: 'month' as const,
                    }
                },
                quantity: 1,
            };
        } else {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [lineItem],
            mode: 'subscription',
            customer_email: doctorEmail || undefined,
            metadata: {
                planId,
            },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/doctors/join?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/for-doctors/pricing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error('Stripe Checkout Error:', error);
        const message = error instanceof Error ? error.message : 'Checkout failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
