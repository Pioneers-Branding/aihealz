import prisma from '@/lib/db';
import { AdPlacement, AdStatus } from '@prisma/client';

export interface AdToServe {
    campaignId: number;
    creativeId: number;
    advertiserId: number;
    headline: string | null;
    description: string | null;
    ctaText: string | null;
    destinationUrl: string;
    imageUrl: string | null;
    imageAlt: string | null;
    logoUrl: string | null;
    width: number | null;
    height: number | null;
    adType: string;
    companyName: string;
}

export interface AdSelectionParams {
    placement: AdPlacement;
    countryCode?: string | null;
    citySlug?: string | null;
    conditionSlug?: string | null;
    specialtyType?: string | null;
    languageCode?: string;
    sessionHash: string;
}

/**
 * Select an ad to serve based on targeting parameters
 */
export async function selectAd(params: AdSelectionParams): Promise<AdToServe | null> {
    const {
        placement,
        countryCode,
        citySlug,
        conditionSlug,
        specialtyType,
        languageCode = 'en',
    } = params;

    try {
        // Find active campaigns with placements matching this slot
        const placements = await prisma.adPlacementConfig.findMany({
            where: {
                placement,
                campaign: {
                    status: AdStatus.active,
                    startDate: { lte: new Date() },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: new Date() } },
                    ],
                },
                creative: {
                    isActive: true,
                },
            },
            include: {
                campaign: {
                    include: {
                        advertiser: {
                            select: {
                                id: true,
                                companyName: true,
                            },
                        },
                    },
                },
                creative: true,
            },
            orderBy: {
                priority: 'asc',
            },
        });

        if (placements.length === 0) {
            return null;
        }

        // Filter by targeting
        const eligiblePlacements = placements.filter((p) => {
            const campaign = p.campaign;

            // Check geo targeting
            if (campaign.targetCountries.length > 0 && countryCode) {
                if (!campaign.targetCountries.includes(countryCode)) {
                    return false;
                }
            }

            if (campaign.targetCities.length > 0 && citySlug) {
                if (!campaign.targetCities.includes(citySlug)) {
                    return false;
                }
            }

            // Check condition targeting
            if (campaign.targetConditions.length > 0 && conditionSlug) {
                if (!campaign.targetConditions.includes(conditionSlug)) {
                    return false;
                }
            }

            // Check specialty targeting
            if (campaign.targetSpecialties.length > 0 && specialtyType) {
                if (!campaign.targetSpecialties.includes(specialtyType)) {
                    return false;
                }
            }

            // Check language targeting
            if (campaign.targetLanguages.length > 0) {
                if (!campaign.targetLanguages.includes(languageCode)) {
                    return false;
                }
            }

            // Check budget (rough check - daily budget exceeded)
            // Note: In production, this should check actual daily spend from metrics
            if (campaign.dailyBudget) {
                const dailyBudget = Number(campaign.dailyBudget);
                const totalBudget = Number(campaign.totalBudget);
                const spentAmount = Number(campaign.spentAmount);

                if (spentAmount >= totalBudget) {
                    return false;
                }
            }

            return true;
        });

        if (eligiblePlacements.length === 0) {
            return null;
        }

        // Sort by priority and select the best one
        // In a more sophisticated system, this would use bid amount and CTR prediction
        const selected = eligiblePlacements[0];

        return {
            campaignId: selected.campaignId,
            creativeId: selected.creativeId,
            advertiserId: selected.campaign.advertiserId,
            headline: selected.creative.headline,
            description: selected.creative.description,
            ctaText: selected.creative.ctaText,
            destinationUrl: selected.creative.destinationUrl,
            imageUrl: selected.creative.imageUrl,
            imageAlt: selected.creative.imageAlt,
            logoUrl: selected.creative.logoUrl,
            width: selected.creative.width,
            height: selected.creative.height,
            adType: selected.creative.adType,
            companyName: selected.campaign.advertiser.companyName,
        };
    } catch (error) {
        console.error('Ad selection error:', error);
        return null;
    }
}

/**
 * Generate a session hash for tracking
 */
export function generateSessionHash(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
