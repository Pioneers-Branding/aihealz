import prisma from '@/lib/db';

/**
 * Media Engine — AI-Generated Anatomical Renders
 *
 * Uses Pollinations.ai (free, no API key needed).
 * Style: Clinical Blue + Slate Grey, minimalist 3D, white background.
 *
 * Triggered when a new condition is added.
 */

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
const STYLE_PRESETS: Record<string, string> = {
    'clinical-blue': '3D medical render, clinical blue and slate grey palette, minimalist, clean white background, 8k resolution, anatomical accuracy, professional medical illustration style',
    'diagram': 'clean medical diagram, labeled anatomy, white background, medical textbook style, high contrast, vector illustration',
    'icon': 'minimalist medical icon, flat design, single color, clean lines, 64x64',
};

/**
 * Generate a medical render for a condition.
 */
export async function generateConditionRender(
    conditionSlug: string,
    conditionName: string,
    bodySystem?: string,
    style: string = 'clinical-blue'
): Promise<{ url: string; assetId: string } | null> {
    // Check if asset already exists
    const existing = await prisma.mediaAsset.findFirst({
        where: { conditionSlug, assetType: 'render', isActive: true },
    });

    if (existing) return { url: existing.cdnUrl || existing.sourceUrl || '', assetId: existing.id };

    const styleGuide = STYLE_PRESETS[style] || STYLE_PRESETS['clinical-blue'];
    const prompt = `${styleGuide}, showing ${conditionName}${bodySystem ? `, ${bodySystem} system` : ''}, medical educational content`;

    // Pollinations.ai — free, no key needed
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `${POLLINATIONS_BASE}/${encodedPrompt}?width=1024&height=768&model=flux&nologo=true`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        const checkRes = await fetch(imageUrl, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutId);
        if (!checkRes.ok) return null;

        const asset = await prisma.mediaAsset.create({
            data: {
                conditionSlug,
                entityType: 'condition',
                assetType: 'render',
                promptUsed: prompt,
                generationApi: 'pollinations',
                sourceUrl: imageUrl,
                cdnUrl: imageUrl, // In production, download and store on your CDN
                width: 1024,
                height: 768,
                altText: `3D medical illustration of ${conditionName}`,
                stylePreset: style,
            },
        });

        return { url: imageUrl, assetId: asset.id };
    } catch (error) {
        console.error('Image generation failed:', error);
        return null;
    }
}

/**
 * Batch generate renders for all conditions missing images.
 */
export async function batchGenerateRenders(limit: number = 50) {
    // Find conditions without renders
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: { id: true, commonName: true, slug: true, specialistType: true },
        take: limit,
    });

    let generated = 0;

    for (const condition of conditions) {
        const hasRender = await prisma.mediaAsset.findFirst({
            where: { conditionSlug: condition.slug, assetType: 'render', isActive: true },
        });

        if (hasRender) continue;

        const result = await generateConditionRender(
            condition.slug,
            condition.commonName,
            condition.specialistType || undefined
        );

        if (result) generated++;

        // Rate limit
        await new Promise((r) => setTimeout(r, 2000));
    }

    console.log(`[OK] Generated ${generated} new renders`);
    return { generated };
}

/**
 * Get render URL for a condition (with fallback).
 */
export async function getConditionImage(conditionSlug: string): Promise<string | null> {
    const asset = await prisma.mediaAsset.findFirst({
        where: { conditionSlug, assetType: 'render', isActive: true },
        select: { cdnUrl: true, sourceUrl: true },
    });

    return asset?.cdnUrl || asset?.sourceUrl || null;
}
