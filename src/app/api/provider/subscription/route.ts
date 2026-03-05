import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getPlansForCountry, checkConditionLimit, addCondition, spendLeadCredit, createCheckoutSession } from '@/lib/provider/subscription-engine';

/**
 * Provider Subscription API
 *
 * GET  /api/provider/subscription?doctorId=123 — Get current subscription + plans
 * POST /api/provider/subscription — Direct upgrade (for subscription page)
 * PUT  /api/provider/subscription — Update subscription (add condition, spend credit, upgrade)
 */

// Plan configuration
type TierType = 'free' | 'premium' | 'enterprise';
const PLAN_CONFIG: Record<string, { tier: TierType; leadCredits: number; conditions: number }> = {
    free: { tier: 'free', leadCredits: 5, conditions: 2 },
    premium: { tier: 'premium', leadCredits: 50, conditions: 15 },
    enterprise: { tier: 'enterprise', leadCredits: 500, conditions: 1000 },
};

export async function GET(request: NextRequest) {
    const doctorId = request.nextUrl.searchParams.get('doctorId');
    if (!doctorId) {
        return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const id = parseInt(doctorId, 10);
    const countryCode = request.headers.get('x-aihealz-country-code') || 'US';

    const [subscription, conditionLimit, plans] = await Promise.all([
        prisma.providerSubscription.findUnique({
            where: { doctorId: id },
            include: { plan: true },
        }),
        checkConditionLimit(id),
        getPlansForCountry(countryCode),
    ]);

    return NextResponse.json({
        subscription: subscription ? {
            planName: subscription.plan.planName,
            tier: subscription.plan.tier,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialEndsAt: subscription.trialEndsAt,
            conditionsUsed: subscription.conditionsUsed,
            leadCreditsUsed: subscription.leadCreditsUsed,
            leadCreditsTotal: subscription.leadCreditsTotal,
        } : null,
        conditions: conditionLimit,
        availablePlans: plans,
    });
}

/**
 * POST - Direct upgrade (used by subscribe page)
 *
 * In production, this would verify Razorpay payment before upgrading.
 * For now, it directly upgrades the subscription.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { doctorId, planId: planSlug } = body; // planSlug is like 'premium', 'enterprise'

        if (!doctorId || !planSlug) {
            return NextResponse.json(
                { error: 'doctorId and planId required' },
                { status: 400 }
            );
        }

        const config = PLAN_CONFIG[planSlug];
        if (!config) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Get the actual plan ID from database
        const plan = await prisma.subscriptionPlan.findFirst({
            where: { planSlug },
            select: { id: true, maxLeadCredits: true, tier: true },
        });

        if (!plan) {
            return NextResponse.json(
                { error: 'Plan not found in database' },
                { status: 400 }
            );
        }

        // Update doctor's subscription tier
        await prisma.doctorProvider.update({
            where: { id: doctorId },
            data: { subscriptionTier: config.tier },
        });

        // Update or create subscription record
        const existingSub = await prisma.providerSubscription.findUnique({
            where: { doctorId },
        });

        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        if (existingSub) {
            await prisma.providerSubscription.update({
                where: { doctorId },
                data: {
                    planId: plan.id,
                    status: 'active',
                    leadCreditsTotal: plan.maxLeadCredits || config.leadCredits,
                    leadCreditsUsed: 0, // Reset on upgrade
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: periodEnd,
                },
            });
        } else {
            await prisma.providerSubscription.create({
                data: {
                    doctorId,
                    planId: plan.id,
                    status: 'active',
                    conditionsUsed: 0,
                    leadCreditsUsed: 0,
                    leadCreditsTotal: plan.maxLeadCredits || config.leadCredits,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: periodEnd,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: `Upgraded to ${planSlug} plan`,
            subscription: {
                planId: plan.id,
                planSlug,
                tier: config.tier,
                leadCreditsTotal: plan.maxLeadCredits || config.leadCredits,
                periodEnd: periodEnd.toISOString(),
            },
        });

    } catch (error) {
        console.error('Subscription upgrade error:', error);
        return NextResponse.json(
            { error: 'Failed to upgrade subscription' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, doctorId, ...params } = body;

        if (!action || !doctorId) {
            return NextResponse.json(
                { error: 'action and doctorId are required' },
                { status: 400 }
            );
        }

        const id = parseInt(doctorId, 10);

        switch (action) {
            case 'add_condition': {
                const result = await addCondition(id, params.conditionId, params.isPrimary);
                return NextResponse.json(result, { status: result.success ? 200 : 403 });
            }

            case 'spend_credit': {
                const result = await spendLeadCredit(id, params.leadLogId);
                return NextResponse.json(result, { status: result.success ? 200 : 403 });
            }

            case 'upgrade': {
                const countryCode = request.headers.get('x-aihealz-country-code') || 'US';
                const result = await createCheckoutSession(id, params.planSlug, countryCode);
                return NextResponse.json(result);
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Subscription update failed' }, { status: 500 });
    }
}
