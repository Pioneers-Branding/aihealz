import prisma from '@/lib/db';

/**
 * Subscription Engine
 *
 * Manages the freemium model:
 * - Condition locking (Free=2, Premium=15, Enterprise=1000)
 * - Dynamic pricing by country
 * - Plan upgrades/downgrades
 * - Lead credit management
 * - Stripe Connect billing
 */

export interface PlanInfo {
    id: number;
    name: string;
    slug: string;
    tier: string;
    maxConditions: number;
    maxLeadCredits: number;
    features: {
        aiBio: boolean;
        leadScoring: boolean;
        telelink: boolean;
        priorityListing: boolean;
        analytics: boolean;
    };
    price: number;
    currency: string;
    interval: string;
}

/**
 * Get available plans with regional pricing for a country.
 */
export async function getPlansForCountry(countryCode: string): Promise<PlanInfo[]> {
    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        include: {
            regionalPricing: {
                where: { countryCode, isActive: true },
            },
        },
        orderBy: { basePriceUsd: 'asc' },
    });

    return plans.map((plan) => {
        const regional = plan.regionalPricing[0];
        return {
            id: plan.id,
            name: plan.planName,
            slug: plan.planSlug,
            tier: plan.tier,
            maxConditions: plan.maxConditions,
            maxLeadCredits: plan.maxLeadCredits,
            features: {
                aiBio: plan.hasAiBio,
                leadScoring: plan.hasLeadScoring,
                telelink: plan.hasTelelink,
                priorityListing: plan.hasPriorityListing,
                analytics: plan.hasAnalytics,
            },
            price: regional ? Number(regional.price) : Number(plan.basePriceUsd),
            currency: regional ? regional.currency : 'USD',
            interval: plan.billingInterval,
        };
    });
}

/**
 * Check if a doctor can add more conditions.
 * Returns { allowed, current, max, upgradeRequired }
 */
export async function checkConditionLimit(doctorId: number): Promise<{
    allowed: boolean;
    current: number;
    max: number;
    upgradeRequired: boolean;
    suggestedPlan: string | null;
}> {
    const subscription = await prisma.providerSubscription.findUnique({
        where: { doctorId },
        include: { plan: true },
    });

    const currentCount = await prisma.doctorSpecialty.count({
        where: { doctorId },
    });

    const max = subscription?.plan?.maxConditions || 2; // Default to free tier
    const allowed = currentCount < max;

    let suggestedPlan: string | null = null;
    if (!allowed) {
        const currentTier = subscription?.plan?.tier || 'free';
        suggestedPlan = currentTier === 'free' ? 'premium' : 'enterprise';
    }

    return {
        allowed,
        current: currentCount,
        max,
        upgradeRequired: !allowed,
        suggestedPlan,
    };
}

/**
 * Add a condition to a doctor's specialties (with limit enforcement).
 */
export async function addCondition(
    doctorId: number,
    conditionId: number,
    isPrimary: boolean = false
): Promise<{ success: boolean; error?: string; upgradeRequired?: boolean }> {
    const limit = await checkConditionLimit(doctorId);

    if (!limit.allowed) {
        return {
            success: false,
            error: `You've reached your ${limit.max}-condition limit. Upgrade to ${limit.suggestedPlan} to add more.`,
            upgradeRequired: true,
        };
    }

    try {
        await prisma.doctorSpecialty.create({
            data: { doctorId, conditionId, isPrimary },
        });

        // Update subscription usage counter
        if (limit.current >= 0) {
            await prisma.providerSubscription.updateMany({
                where: { doctorId },
                data: { conditionsUsed: limit.current + 1 },
            });
        }

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to add condition';
        return { success: false, error: message };
    }
}

/**
 * Spend lead credits to reveal patient contact.
 */
export async function spendLeadCredit(
    doctorId: number,
    leadLogId: string,
    creditsRequired: number = 1
): Promise<{ success: boolean; error?: string; remainingCredits?: number }> {
    const subscription = await prisma.providerSubscription.findUnique({
        where: { doctorId },
    });

    if (!subscription) {
        return { success: false, error: 'No active subscription found' };
    }

    const availableCredits = subscription.leadCreditsTotal - subscription.leadCreditsUsed;

    if (availableCredits < creditsRequired) {
        return {
            success: false,
            error: `Insufficient credits. You have ${availableCredits} of ${creditsRequired} needed.`,
        };
    }

    // Deduct credits
    await prisma.providerSubscription.update({
        where: { doctorId },
        data: { leadCreditsUsed: { increment: creditsRequired } },
    });

    // Mark lead as revealed
    await prisma.leadLog.update({
        where: { id: leadLogId },
        data: {
            contactRevealed: true,
            creditsSpent: creditsRequired,
        },
    });

    // Log credit transaction
    await prisma.leadCredit.create({
        data: {
            doctorId,
            transactionType: 'spend',
            amount: -creditsRequired,
            balanceAfter: availableCredits - creditsRequired,
            leadLogId,
            description: `Contact reveal for lead ${leadLogId.substring(0, 8)}`,
        },
    });

    return {
        success: true,
        remainingCredits: availableCredits - creditsRequired,
    };
}

/**
 * Create a Stripe Checkout session for plan upgrade.
 */
export async function createCheckoutSession(
    doctorId: number,
    planSlug: string,
    countryCode: string
): Promise<{ url: string | null; error?: string }> {
    const stripe = await getStripe();
    if (!stripe) return { url: null, error: 'Stripe not configured' };

    const plan = await prisma.subscriptionPlan.findUnique({
        where: { planSlug },
        include: {
            regionalPricing: { where: { countryCode } },
        },
    });

    if (!plan) return { url: null, error: 'Plan not found' };

    const doctor = await prisma.doctorProvider.findUnique({
        where: { id: doctorId },
        select: { name: true, slug: true, contactInfo: true },
    });

    const priceId = plan.regionalPricing[0]?.stripePriceId || plan.stripePriceId;
    if (!priceId) return { url: null, error: 'Stripe price not configured for this region' };

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?cancelled=true`,
        metadata: {
            doctorId: String(doctorId),
            planSlug,
            countryCode,
        },
        automatic_tax: { enabled: true },
    });

    return { url: session.url };
}

/**
 * Get the Stripe SDK instance (lazy-loaded).
 */
async function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;

    // Dynamic import to avoid loading Stripe if not needed
    const Stripe = (await import('stripe')).default;
    return new Stripe(key, { apiVersion: '2026-01-28.clover' });
}
