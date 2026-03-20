import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-02-25.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCanceled(subscription);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaid(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error(`[Stripe Webhook] Error processing ${event.type}:`, error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const doctorId = session.metadata?.doctorId;
    const tier = session.metadata?.tier as 'premium' | 'enterprise';

    if (!doctorId || !tier) {
        console.error('[Stripe] Missing doctorId or tier in checkout session metadata');
        return;
    }

    // Find the subscription plan for this tier
    const plan = await prisma.subscriptionPlan.findFirst({
        where: { tier, isActive: true },
    });

    if (!plan) {
        console.error(`[Stripe] No active plan found for tier: ${tier}`);
        return;
    }

    // Update doctor's subscription tier
    await prisma.doctorProvider.update({
        where: { id: parseInt(doctorId) },
        data: {
            subscriptionTier: tier,
        },
    });

    // Create or update subscription record
    await prisma.providerSubscription.upsert({
        where: { doctorId: parseInt(doctorId) },
        create: {
            doctorId: parseInt(doctorId),
            planId: plan.id,
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        update: {
            planId: plan.id,
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            status: 'active',
            currentPeriodStart: new Date(),
        },
    });

    console.log(`[Stripe] Checkout complete for doctor ${doctorId}, tier: ${tier}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    // Find the subscription in our database
    const providerSub = await prisma.providerSubscription.findFirst({
        where: { stripeCustomerId: customerId },
    });

    if (!providerSub) {
        console.log(`[Stripe] No subscription found for customer ${customerId}`);
        return;
    }

    // Map Stripe status to our status
    const status = mapStripeStatus(subscription.status);

    // Get period dates from subscription items if available
    const subscriptionData = subscription as unknown as Record<string, unknown>;
    const periodStart = subscriptionData.current_period_start as number | undefined;
    const periodEnd = subscriptionData.current_period_end as number | undefined;

    await prisma.providerSubscription.update({
        where: { id: providerSub.id },
        data: {
            status: status as 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired',
            ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
            ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
        },
    });

    console.log(`[Stripe] Subscription updated for doctor ${providerSub.doctorId}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    const providerSub = await prisma.providerSubscription.findFirst({
        where: { stripeCustomerId: customerId },
    });

    if (!providerSub) {
        console.log(`[Stripe] No subscription found for customer ${customerId}`);
        return;
    }

    // Update subscription status
    await prisma.providerSubscription.update({
        where: { id: providerSub.id },
        data: {
            status: 'cancelled',
            cancelledAt: new Date(),
        },
    });

    // Downgrade doctor to free tier
    await prisma.doctorProvider.update({
        where: { id: providerSub.doctorId },
        data: {
            subscriptionTier: 'free',
        },
    });

    console.log(`[Stripe] Subscription canceled for doctor ${providerSub.doctorId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    const providerSub = await prisma.providerSubscription.findFirst({
        where: { stripeCustomerId: customerId },
        include: { plan: true },
    });

    if (!providerSub) {
        return;
    }

    // Reset monthly lead credits on subscription
    await prisma.providerSubscription.update({
        where: { id: providerSub.id },
        data: {
            leadCreditsUsed: 0,
            leadCreditsTotal: providerSub.plan.maxLeadCredits,
        },
    });

    console.log(`[Stripe] Invoice paid, credits reset for doctor ${providerSub.doctorId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    const providerSub = await prisma.providerSubscription.findFirst({
        where: { stripeCustomerId: customerId },
        include: { doctor: true },
    });

    if (!providerSub) {
        return;
    }

    // Update subscription status
    await prisma.providerSubscription.update({
        where: { id: providerSub.id },
        data: {
            status: 'past_due',
        },
    });

    // Get failure details
    const amount = invoice.amount_due ? invoice.amount_due / 100 : null;
    const currency = invoice.currency?.toUpperCase() || 'USD';
    const failureMessage = invoice.last_finalization_error?.message ||
                           'Payment could not be processed';

    // Create payment notification record
    const notification = await prisma.paymentNotification.create({
        data: {
            providerId: providerSub.doctorId,
            eventType: 'payment_failed',
            stripeEventId: invoice.id,
            amount: amount,
            currency: currency,
            errorMessage: failureMessage,
            metadata: {
                invoiceId: invoice.id,
                subscriptionId: (invoice as unknown as { subscription?: string }).subscription || null,
                attemptCount: invoice.attempt_count,
                nextPaymentAttempt: invoice.next_payment_attempt,
            },
        },
    });

    // Send email notification if doctor has email
    if (providerSub.doctor.email) {
        try {
            await sendPaymentFailureEmail({
                to: providerSub.doctor.email,
                doctorName: providerSub.doctor.name,
                amount: amount,
                currency: currency,
                errorMessage: failureMessage,
            });

            // Mark notification as sent
            await prisma.paymentNotification.update({
                where: { id: notification.id },
                data: {
                    emailSent: true,
                    emailSentAt: new Date(),
                },
            });

            console.log(`[Stripe] Payment failure email sent to ${providerSub.doctor.email}`);
        } catch (emailError) {
            console.error(`[Stripe] Failed to send payment failure email:`, emailError);
        }
    }

    console.log(`[Stripe] Payment failed for doctor ${providerSub.doctorId}, notification created: ${notification.id}`);
}

/**
 * Send payment failure notification email
 * Uses a simple email template - can be replaced with a transactional email service
 */
async function sendPaymentFailureEmail(params: {
    to: string;
    doctorName: string;
    amount: number | null;
    currency: string;
    errorMessage: string;
}) {
    // If Resend API key is configured, use it
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        console.log('[Email] RESEND_API_KEY not configured, skipping email send');
        return;
    }

    const amountStr = params.amount
        ? `${params.currency} ${params.amount.toFixed(2)}`
        : 'your subscription payment';

    const emailBody = `
Dear ${params.doctorName},

We were unable to process your payment of ${amountStr} for your AIHealz subscription.

Reason: ${params.errorMessage}

To avoid any interruption to your premium services, please update your payment method:

1. Log in to your AIHealz provider dashboard
2. Go to Settings > Subscription
3. Update your payment information

If you need assistance, please contact our support team at support@aihealz.com

Best regards,
The AIHealz Team
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'AIHealz <noreply@aihealz.com>',
            to: params.to,
            subject: 'Action Required: Payment Failed for Your AIHealz Subscription',
            text: emailBody,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
    switch (status) {
        case 'active':
            return 'active';
        case 'past_due':
            return 'past_due';
        case 'canceled':
            return 'cancelled';
        case 'unpaid':
            return 'past_due';
        case 'trialing':
            return 'trial';
        case 'incomplete':
        case 'incomplete_expired':
            return 'expired';
        case 'paused':
            return 'expired';
        default:
            return 'active';
    }
}
