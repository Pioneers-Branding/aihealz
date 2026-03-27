/**
 * Local type definitions for the advertising module.
 * These types mirror what will eventually be Prisma-generated enums
 * once the AdCampaign / AdCreative / AdImpression models are added to schema.prisma.
 */

export const AdPlacement = {
    condition_sidebar: 'condition_sidebar',
    condition_inline: 'condition_inline',
    homepage_hero: 'homepage_hero',
    homepage_featured: 'homepage_featured',
    search_results_top: 'search_results_top',
    search_results_inline: 'search_results_inline',
    doctor_profile_sidebar: 'doctor_profile_sidebar',
    treatment_page_sidebar: 'treatment_page_sidebar',
    global_header_banner: 'global_header_banner',
    global_footer_banner: 'global_footer_banner',
} as const;

export type AdPlacement = (typeof AdPlacement)[keyof typeof AdPlacement];

export const AdStatus = {
    draft: 'draft',
    pending_review: 'pending_review',
    active: 'active',
    paused: 'paused',
    cancelled: 'cancelled',
    completed: 'completed',
} as const;

export type AdStatus = (typeof AdStatus)[keyof typeof AdStatus];

export const AdType = {
    banner: 'banner',
    native: 'native',
    video: 'video',
    sponsored_card: 'sponsored_card',
    text_link: 'text_link',
} as const;

export type AdType = (typeof AdType)[keyof typeof AdType];
