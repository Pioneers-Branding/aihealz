import prisma from '@/lib/db';
import { AdPlacement } from '@/lib/ads/ad-types';

export interface ImpressionData {
    campaignId: number;
    sessionHash: string;
    placement: AdPlacement;
    pageUrl: string;
    countryCode?: string | null;
    citySlug?: string | null;
    conditionSlug?: string | null;
    languageCode?: string | null;
}

export interface ClickData {
    campaignId: number;
    impressionId?: string;
    sessionHash: string;
    placement: AdPlacement;
    pageUrl: string;
    destinationUrl: string;
    countryCode?: string | null;
    citySlug?: string | null;
}

/**
 * Record an ad impression
 */
export async function trackImpression(data: ImpressionData): Promise<string | null> {
    try {
        const impression = await prisma.adImpression.create({
            data: {
                campaignId: data.campaignId,
                sessionHash: data.sessionHash,
                placement: data.placement,
                pageUrl: data.pageUrl,
                countryCode: data.countryCode || null,
                citySlug: data.citySlug || null,
                conditionSlug: data.conditionSlug || null,
                languageCode: data.languageCode || null,
            },
        });

        // Update campaign spent amount based on CPM
        // In production, this would be done via a background job
        await updateCampaignSpend(data.campaignId, 'impression');

        return impression.id;
    } catch (error) {
        console.error('Failed to track impression:', error);
        return null;
    }
}

/**
 * Record an ad click
 */
export async function trackClick(data: ClickData): Promise<string | null> {
    try {
        const click = await prisma.adClick.create({
            data: {
                campaignId: data.campaignId,
                impressionId: data.impressionId || null,
                sessionHash: data.sessionHash,
                placement: data.placement,
                pageUrl: data.pageUrl,
                destinationUrl: data.destinationUrl,
                countryCode: data.countryCode || null,
                citySlug: data.citySlug || null,
            },
        });

        // Update campaign spent amount based on CPC
        await updateCampaignSpend(data.campaignId, 'click');

        return click.id;
    } catch (error) {
        console.error('Failed to track click:', error);
        return null;
    }
}

/**
 * Update campaign spend based on billing model
 */
async function updateCampaignSpend(campaignId: number, eventType: 'impression' | 'click'): Promise<void> {
    try {
        const campaign = await prisma.adCampaign.findUnique({
            where: { id: campaignId },
            select: {
                billingModel: true,
                bidAmount: true,
                spentAmount: true,
                totalBudget: true,
            },
        });

        if (!campaign || !campaign.bidAmount) return;

        let costToAdd = 0;

        if (eventType === 'impression' && campaign.billingModel === 'cpm') {
            // CPM: cost per 1000 impressions
            costToAdd = Number(campaign.bidAmount) / 1000;
        } else if (eventType === 'click' && campaign.billingModel === 'cpc') {
            // CPC: cost per click
            costToAdd = Number(campaign.bidAmount);
        }

        if (costToAdd > 0) {
            const newSpent = Number(campaign.spentAmount) + costToAdd;

            await prisma.adCampaign.update({
                where: { id: campaignId },
                data: {
                    spentAmount: newSpent,
                    // Auto-pause if budget exhausted
                    status: newSpent >= Number(campaign.totalBudget) ? 'completed' : undefined,
                },
            });
        }
    } catch (error) {
        console.error('Failed to update campaign spend:', error);
    }
}

/**
 * Check if a user has seen an ad recently (to prevent impression spam)
 */
export async function hasRecentImpression(
    sessionHash: string,
    campaignId: number,
    withinMinutes: number = 5
): Promise<boolean> {
    try {
        const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);

        const count = await prisma.adImpression.count({
            where: {
                sessionHash,
                campaignId,
                createdAt: { gte: cutoff },
            },
        });

        return count > 0;
    } catch (error) {
        console.error('Failed to check recent impression:', error);
        return false;
    }
}
