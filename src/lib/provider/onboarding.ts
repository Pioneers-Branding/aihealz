import prisma from '@/lib/db';

/**
 * Multi-Step Provider Onboarding
 *
 * Step 1: Basic Profile & Clinic Geolocation
 * Step 2: License Verification (API cross-check)
 * Step 3: AI-Assisted Bio Builder
 * Step 4: Condition Selection
 * Step 5: Subscription Plan Selection
 */

export interface OnboardingData {
    doctorId: number;
    step: number;
    profile?: ProfileData;
    license?: LicenseData;
    bio?: BioData;
    conditions?: number[];
    planSlug?: string;
}

interface ProfileData {
    name: string;
    slug: string;
    qualifications: string[];
    experienceYears: number;
    contactInfo: Record<string, string>;
    geographyId: number;
}

interface LicenseData {
    licenseNumber: string;
    licensingBody: string;
    countryCode: string;
}

interface BioData {
    rawBio: string;
}

/**
 * Get or create onboarding record for a doctor.
 */
export async function getOnboarding(doctorId: number) {
    return prisma.onboardingStep.findFirst({
        where: { doctorId },
        orderBy: { startedAt: 'desc' },
    });
}

/**
 * Process an onboarding step.
 */
export async function processOnboardingStep(data: OnboardingData) {
    const { doctorId, step } = data;

    // Get or create onboarding record
    let onboarding = await prisma.onboardingStep.findFirst({
        where: { doctorId },
        orderBy: { startedAt: 'desc' },
    });

    if (!onboarding) {
        onboarding = await prisma.onboardingStep.create({
            data: {
                doctorId,
                status: 'in_progress',
                currentStep: 1,
            },
        });
    }

    switch (step) {
        case 1:
            return processProfileStep(doctorId, onboarding.id, data.profile!);
        case 2:
            return processLicenseStep(doctorId, onboarding.id, data.license!);
        case 3:
            return processBioStep(doctorId, onboarding.id, data.bio!);
        case 4:
            return processConditionsStep(doctorId, onboarding.id, data.conditions!);
        case 5:
            return processPlanStep(doctorId, onboarding.id, data.planSlug!);
        default:
            throw new Error(`Invalid onboarding step: ${step}`);
    }
}

async function processProfileStep(doctorId: number, onboardingId: string, profile: ProfileData) {
    await prisma.doctorProvider.update({
        where: { id: doctorId },
        data: {
            name: profile.name,
            slug: profile.slug,
            qualifications: profile.qualifications,
            experienceYears: profile.experienceYears,
            contactInfo: profile.contactInfo,
            geographyId: profile.geographyId,
        },
    });

    await prisma.onboardingStep.update({
        where: { id: onboardingId },
        data: { stepProfile: true, currentStep: 2 },
    });

    return { success: true, nextStep: 2 };
}

async function processLicenseStep(doctorId: number, onboardingId: string, license: LicenseData) {
    // Import verifier dynamically to avoid circular deps
    const { verifyLicense } = await import('./license-verifier');
    const result = await verifyLicense(doctorId, license.licenseNumber, license.licensingBody, license.countryCode);

    await prisma.doctorProvider.update({
        where: { id: doctorId },
        data: {
            licenseNumber: license.licenseNumber,
            licensingBody: license.licensingBody,
        },
    });

    await prisma.onboardingStep.update({
        where: { id: onboardingId },
        data: { stepLicense: true, currentStep: 3 },
    });

    return {
        success: true,
        nextStep: 3,
        verification: {
            status: result.status,
            confidence: result.matchConfidence,
        },
    };
}

async function processBioStep(doctorId: number, onboardingId: string, bio: BioData) {
    const enhancedBio = await enhanceBioWithAI(doctorId, bio.rawBio);

    await prisma.doctorProvider.update({
        where: { id: doctorId },
        data: { bio: enhancedBio },
    });

    await prisma.onboardingStep.update({
        where: { id: onboardingId },
        data: {
            stepBio: true,
            currentStep: 4,
            rawBioInput: bio.rawBio,
            aiEnhancedBio: enhancedBio,
        },
    });

    return { success: true, nextStep: 4, enhancedBio };
}

async function processConditionsStep(doctorId: number, onboardingId: string, conditionIds: number[]) {
    // Clear existing and re-add (within limit)
    await prisma.doctorSpecialty.deleteMany({ where: { doctorId } });

    for (let i = 0; i < conditionIds.length; i++) {
        await prisma.doctorSpecialty.create({
            data: {
                doctorId,
                conditionId: conditionIds[i],
                isPrimary: i === 0,
            },
        });
    }

    await prisma.onboardingStep.update({
        where: { id: onboardingId },
        data: {
            stepConditions: true,
            currentStep: 5,
            selectedConditions: conditionIds,
        },
    });

    return { success: true, nextStep: 5 };
}

async function processPlanStep(doctorId: number, onboardingId: string, planSlug: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { planSlug },
    });

    if (!plan) throw new Error(`Plan not found: ${planSlug}`);

    // Update doctor tier
    await prisma.doctorProvider.update({
        where: { id: doctorId },
        data: { subscriptionTier: plan.tier },
    });

    // Create subscription
    await prisma.providerSubscription.create({
        data: {
            doctorId,
            planId: plan.id,
            status: plan.tier === 'free' ? 'active' : 'trial',
            trialEndsAt: plan.tier !== 'free'
                ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                : null,
            leadCreditsTotal: plan.maxLeadCredits,
        },
    });

    // Mark onboarding complete
    await prisma.onboardingStep.update({
        where: { id: onboardingId },
        data: {
            stepSubscription: true,
            status: 'completed',
            completedAt: new Date(),
        },
    });

    return { success: true, completed: true };
}

/**
 * AI Bio Enhancer — beautifies a doctor's bio using LLM.
 */
async function enhanceBioWithAI(doctorId: number, rawBio: string): Promise<string> {
    const doctor = await prisma.doctorProvider.findUnique({
        where: { id: doctorId },
        select: { name: true, qualifications: true, experienceYears: true },
    });

    const systemPrompt = `You are an expert medical copywriter for aihealz.com. 
Enhance this doctor's biography to be professional, warm, and trust-building.

RULES:
1. Keep it under 200 words.
2. Use third person.
3. Highlight their expertise and experience.
4. Make it feel personal and approachable.
5. Include their qualifications naturally.
6. Never invent credentials or claims not in the input.
7. End with what patients can expect.

DOCTOR INFO:
Name: ${doctor?.name || 'Doctor'}
Qualifications: ${doctor?.qualifications?.join(', ') || 'N/A'}
Experience: ${doctor?.experienceYears || 'N/A'} years`;

    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    const apiBase = process.env.AI_API_BASE || 'https://api.openai.com/v1';

    if (!apiKey) return rawBio; // Return original if no API key

    try {
        const response = await fetch(`${apiBase}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.AI_MODEL || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: rawBio },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) return rawBio;
        const data = await response.json();
        return data.choices?.[0]?.message?.content || rawBio;
    } catch {
        return rawBio;
    }
}
