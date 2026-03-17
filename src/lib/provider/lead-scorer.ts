import prisma from '@/lib/db';

/**
 * AI Lead Scorer
 *
 * Scores patient leads based on intent signals:
 * - High: Has uploaded report + seeking specific specialist + urgent
 * - Medium: Browsing condition pages + in local area
 * - Low: General browsing
 *
 * Premium doctors get first access to high-intent leads.
 */

export interface LeadScore {
    intentLevel: 'high' | 'medium' | 'low';
    intentScore: number; // 0.0 - 1.0
    scoringFactors: Record<string, boolean | string | null>;
}

/**
 * Score a lead based on available signals.
 */
export function scoreLead(signals: {
    hasReport: boolean;
    reportType?: string;
    urgencyLevel?: string;
    seekingSpecialist: boolean;
    hasMultipleVisits: boolean;
    isInLocalArea: boolean;
    conditionSeverity?: string;
}): LeadScore {
    let score = 0;
    const factors: Record<string, boolean | string | null> = {};

    // Has uploaded a medical report (+0.30)
    if (signals.hasReport) {
        score += 0.30;
        factors.has_report = true;

        // Imaging reports indicate higher intent (+0.05)
        if (signals.reportType === 'imaging') {
            score += 0.05;
            factors.report_type = 'imaging';
        }
    } else {
        factors.has_report = false;
    }

    // Urgency level
    if (signals.urgencyLevel === 'emergency') {
        score += 0.25;
        factors.urgency = 'emergency';
    } else if (signals.urgencyLevel === 'urgent') {
        score += 0.15;
        factors.urgency = 'urgent';
    } else {
        factors.urgency = signals.urgencyLevel || null;
    }

    // Actively seeking a specialist (+0.20)
    if (signals.seekingSpecialist) {
        score += 0.20;
        factors.seeking_specialist = true;
    }

    // In the doctor's local area (+0.10)
    if (signals.isInLocalArea) {
        score += 0.10;
        factors.in_local_area = true;
    }

    // Repeat visitor (+0.10)
    if (signals.hasMultipleVisits) {
        score += 0.10;
        factors.repeat_visitor = true;
    }

    // Condition severity
    if (signals.conditionSeverity === 'critical' || signals.conditionSeverity === 'high') {
        score += 0.05;
        factors.condition_severity = signals.conditionSeverity;
    }

    // Normalize to 0-1
    score = Math.min(score, 1.0);

    // Determine intent level
    let intentLevel: 'high' | 'medium' | 'low';
    if (score >= 0.65) {
        intentLevel = 'high';
    } else if (score >= 0.35) {
        intentLevel = 'medium';
    } else {
        intentLevel = 'low';
    }

    return {
        intentLevel,
        intentScore: Math.round(score * 100) / 100,
        scoringFactors: factors,
    };
}

/**
 * Create a lead log entry and distribute to matched doctors.
 */
export async function distributeLeadToDoctors(
    analysisId: string,
    sessionHash: string,
    conditionSlug: string,
    specialtyType: string,
    geoId: number | null,
    signals: Parameters<typeof scoreLead>[0]
): Promise<void> {
    const score = scoreLead(signals);

    // Find matching doctors, prioritized by tier
    const doctors = await prisma.doctorProvider.findMany({
        where: {
            isVerified: true,
            ...(geoId ? { geographyId: geoId } : {}),
            specialties: {
                some: {
                    condition: { slug: conditionSlug },
                },
            },
        },
        select: { id: true, subscriptionTier: true },
        orderBy: [
            { subscriptionTier: 'desc' }, // enterprise > premium > free
            { rating: 'desc' },
        ],
        take: 20,
    });

    // Create lead logs per doctor
    for (const doctor of doctors) {
        // High-intent leads only go to premium/enterprise first
        if (score.intentLevel === 'high' && doctor.subscriptionTier === 'free') {
            continue; // Skip free-tier doctors for high-intent leads
        }

        await prisma.leadLog.create({
            data: {
                doctorId: doctor.id,
                analysisId,
                sessionHash,
                conditionSlug,
                specialtyMatched: specialtyType,
                geographyId: geoId,
                intentLevel: score.intentLevel,
                intentScore: score.intentScore,
                scoringFactors: score.scoringFactors,
            },
        });
    }
}

/**
 * Get lead dashboard data for a doctor.
 */
export async function getDoctorLeads(doctorId: number, options: {
    page?: number;
    limit?: number;
    intentFilter?: string;
    unviewedOnly?: boolean;
} = {}) {
    const { page = 1, limit = 20, intentFilter, unviewedOnly } = options;

    const where: Record<string, unknown> = {
        doctorId,
        ...(intentFilter ? { intentLevel: intentFilter } : {}),
        ...(unviewedOnly ? { isViewed: false } : {}),
    };

    const [leads, total, unviewed] = await Promise.all([
        prisma.leadLog.findMany({
            where,
            orderBy: [{ intentLevel: 'asc' }, { createdAt: 'desc' }], // high intent first
            skip: (page - 1) * limit,
            take: limit,
            include: {
                analysis: {
                    select: {
                        plainEnglish: true,
                        urgencyLevel: true,
                        specialtyRequired: true,
                        confidenceScore: true,
                    },
                },
                geography: { select: { name: true, slug: true } },
            },
        }),
        prisma.leadLog.count({ where }),
        prisma.leadLog.count({ where: { doctorId, isViewed: false } }),
    ]);

    return {
        leads: leads.map((l) => ({
            id: l.id,
            intentLevel: l.intentLevel,
            intentScore: l.intentScore ? Number(l.intentScore) : null,
            conditionSlug: l.conditionSlug,
            specialtyMatched: l.specialtyMatched,
            geography: l.geography?.name || null,
            summary: l.analysis?.plainEnglish || null,
            urgency: l.analysis?.urgencyLevel || null,
            isViewed: l.isViewed,
            contactRevealed: l.contactRevealed,
            createdAt: l.createdAt,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        unviewedCount: unviewed,
    };
}
