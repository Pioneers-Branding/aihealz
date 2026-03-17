import prisma from '@/lib/db';
import { resolveGeoChain, getDeepestGeo, getAncestorIds } from '@/lib/geo-resolver';
import { buildCacheKey, getCachedPage, setCachedPage } from '@/lib/redis';
import type { GeoChain } from '@/lib/geo-resolver';

/**
 * Content Engine — "Golden Record" Stitcher
 *
 * The core of aihealz's programmatic SEO. Takes URL parameters and resolves
 * three data sources into one unified page payload:
 *
 * 1. Static Global Data (Golden Record) — Hard medical facts
 * 2. Local Context Data — Regional insights, localized descriptions
 * 3. Provider Data — Top 2 Free + Top 13 Premium doctors for this location
 */

export interface PageData {
    // ─── Golden Record (Static) ──────────────────────
    condition: {
        id: number;
        slug: string;
        scientificName: string;
        commonName: string;
        description: string | null;
        symptoms: string[];
        treatments: string[];
        faqs: Array<{ q: string; a: string }>;
        specialistType: string;
        severityLevel: string | null;
        icdCode: string | null;
        bodySystem: string | null;
    };

    // ─── Local Context (Dynamic per locale) ──────────
    localContent: {
        title: string;
        description: string;
        localizedAdvice: string | null;
        localFactors: unknown;
        consultationTips: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        status: string;
    } | null;

    // ─── Provider Data (Dynamic per location) ────────
    doctors: {
        premium: DoctorCard[];
        free: DoctorCard[];
    };

    // ─── E-E-A-T Reviewer ───────────────────────────
    reviewer: {
        name: string;
        slug: string;
        licenseNumber: string | null;
        licensingBody: string | null;
        qualifications: string[];
        reviewDate: Date;
    } | null;

    // ─── Automated Content (Generated from ConditionPageContent) ───
    automatedContent: {
        // Hero Section
        h1Title: string | null;
        heroOverview: string | null;
        keyStats: { prevalence?: string; demographics?: string; avgAge?: string; globalCases?: string } | null;

        // Section 1: Overview
        definition: string | null;
        typesClassification: Array<{ type: string; description: string }> | null;

        // Section 2: Symptoms
        primarySymptoms: string[] | null;
        earlyWarningSigns: string[] | null;
        emergencySigns: string[] | null;

        // Section 3: Causes & Risk Factors
        causes: Array<{ cause: string; description: string }> | null;
        riskFactors: Array<{ factor: string; category: string; description: string }> | null;
        affectedDemographics: string[] | null;

        // Section 4: Diagnosis
        diagnosisOverview: string | null;
        diagnosticTests: Array<{ test: string; purpose: string; whatToExpect?: string }> | null;

        // Section 5: Treatments
        treatmentOverview: string | null;
        medicalTreatments: Array<{ name: string; description: string; effectiveness?: string }> | null;
        surgicalOptions: Array<{ name: string; description: string; successRate?: string }> | null;
        alternativeTreatments: Array<{ name: string; description: string }> | null;
        linkedTreatmentSlugs: string[] | null;

        // Section 6: Doctors
        specialistType: string | null;
        whySeeSpecialist: string | null;
        doctorSelectionGuide: string | null;

        // Section 7: Hospitals
        hospitalCriteria: string[] | null;
        keyFacilities: string[] | null;

        // Section 8: Costs
        costBreakdown: Array<{ treatment: string; minCost: number; maxCost: number; currency: string }> | null;
        insuranceGuide: string | null;
        financialAssistance: string | null;

        // Section 9: Prevention & Lifestyle
        preventionStrategies: string[] | null;
        lifestyleModifications: string[] | null;
        dietRecommendations: { recommended: string[]; avoid: string[] } | null;
        exerciseGuidelines: string | null;

        // Section 10: Living With
        dailyManagement: string[] | null;
        prognosis: string | null;
        recoveryTimeline: string | null;
        complications: string[] | null;
        supportResources: Array<{ name: string; url?: string; description?: string }> | null;

        // Section 11: Related Conditions
        confusedWithConditions: Array<{ slug: string; name: string; keyDifference: string }> | null;
        coOccurringConditions: Array<{ slug: string; name: string }> | null;
        relatedConditions: Array<{ slug: string; name: string; relevance?: string }> | null;

        // Section 12: FAQs
        faqs: Array<{ question: string; answer: string; schemaEligible?: boolean }> | null;

        // Simple Names & Regional Tags (for searchability)
        simpleName: string | null;
        regionalNames: Array<{ name: string; region: string; language: string }> | null;
        searchTags: string[] | null;
        symptomKeywords: string[] | null;

        // SEO Meta
        metaTitle: string | null;
        metaDescription: string | null;
        keywords: string[] | null;

        // EEAT Signals
        sources: Array<{ title: string; url?: string; accessedDate?: string }> | null;
        lastReviewed: Date | null;

        // Schema Markup
        schemaMedicalCondition: unknown | null;
        schemaFaqPage: unknown | null;

        // Quality
        qualityScore: number | null;
        wordCount: number | null;
    } | null;

    // ─── Treatment Cost (Phase 9) ────────────────────
    treatmentCost: {
        min: number;
        max: number;
        avg: number;
        currency: string;
        treatmentName: string;
    } | null;

    // ─── Visuals (Phase 9) ───────────────────────────
    featureImage: string | null;

    // ─── Meta ────────────────────────────────────────
    geoChain: GeoChain;
    language: string;
    availableLanguages: string[];
    isFallbackContent: boolean;
}

interface DoctorCard {
    id: number;
    slug: string;
    name: string;
    bio: string | null;
    qualifications: string[];
    experienceYears: number | null;
    rating: number | null;
    reviewCount: number;
    consultationFee: number | null;
    feeCurrency: string;
    profileImage: string | null;
    subscriptionTier: string;
    isVerified: boolean;
    isPrimarySpecialist: boolean;
}

/**
 * Main stitching function — resolves all data for a condition page.
 *
 * @param lang      - Language code (e.g. 'hi')
 * @param condSlug  - Condition slug (e.g. 'back-pain')
 * @param geoSlugs  - Geography path (e.g. ['india', 'delhi', 'saket'])
 */
export async function stitchPageData(
    lang: string,
    condSlug: string,
    geoSlugs: string[]
): Promise<PageData | null> {
    // ─── 1. Resolve Golden Record ──────────────────────
    const condition = await prisma.medicalCondition.findUnique({
        where: { slug: condSlug, isActive: true },
        select: {
            id: true, slug: true, scientificName: true, commonName: true,
            description: true, symptoms: true, treatments: true, faqs: true,
            specialistType: true, severityLevel: true, icdCode: true, bodySystem: true,
        },
    });

    if (!condition) return null;

    // ─── 2. Resolve Geography Chain ────────────────────
    const geoChain = await resolveGeoChain(geoSlugs);
    const deepestGeo = getDeepestGeo(geoChain);

    // ─── 3. Resolve Localized Content (with fallback) ─
    const { localContent, isFallbackContent } = await resolveLocalContent(
        condition.id, lang, deepestGeo?.id ?? null, geoChain
    );

    // ─── 3.5 Resolve Automated Content from ConditionPageContent ──────
    // Content is stored per condition+language (medical facts are location-independent)
    // Location-specific data (doctors, hospitals) is fetched dynamically
    let automatedContent: PageData['automatedContent'] = null;

    // Try to find content in requested language first
    let pageContent = await prisma.conditionPageContent.findFirst({
        where: {
            conditionId: condition.id,
            languageCode: lang,
            status: 'published'
        }
    });

    // Fallback to English if no content in requested language
    if (!pageContent && lang !== 'en') {
        pageContent = await prisma.conditionPageContent.findFirst({
            where: {
                conditionId: condition.id,
                languageCode: 'en',
                status: 'published'
            }
        });
    }

    // If no published content, try draft content (for development)
    if (!pageContent) {
        pageContent = await prisma.conditionPageContent.findFirst({
            where: {
                conditionId: condition.id,
                languageCode: lang
            }
        });

        // Fallback to English draft
        if (!pageContent && lang !== 'en') {
            pageContent = await prisma.conditionPageContent.findFirst({
                where: {
                    conditionId: condition.id,
                    languageCode: 'en'
                }
            });
        }
    }

    if (pageContent) {
        automatedContent = {
            // Hero Section
            h1Title: pageContent.h1Title,
            heroOverview: pageContent.heroOverview,
            keyStats: pageContent.keyStats as PageData['automatedContent'] extends { keyStats: infer T } ? T : null,

            // Section 1: Overview
            definition: pageContent.definition,
            typesClassification: pageContent.typesClassification as Array<{ type: string; description: string }> | null,

            // Section 2: Symptoms
            primarySymptoms: pageContent.primarySymptoms as string[] | null,
            earlyWarningSigns: pageContent.earlyWarningSigns as string[] | null,
            emergencySigns: pageContent.emergencySigns as string[] | null,

            // Section 3: Causes & Risk Factors
            causes: pageContent.causes as Array<{ cause: string; description: string }> | null,
            riskFactors: pageContent.riskFactors as Array<{ factor: string; category: string; description: string }> | null,
            affectedDemographics: pageContent.affectedDemographics as string[] | null,

            // Section 4: Diagnosis
            diagnosisOverview: pageContent.diagnosisOverview,
            diagnosticTests: pageContent.diagnosticTests as Array<{ test: string; purpose: string; whatToExpect?: string }> | null,

            // Section 5: Treatments
            treatmentOverview: pageContent.treatmentOverview,
            medicalTreatments: pageContent.medicalTreatments as Array<{ name: string; description: string; effectiveness?: string }> | null,
            surgicalOptions: pageContent.surgicalOptions as Array<{ name: string; description: string; successRate?: string }> | null,
            alternativeTreatments: pageContent.alternativeTreatments as Array<{ name: string; description: string }> | null,
            linkedTreatmentSlugs: pageContent.linkedTreatmentSlugs as string[] | null,

            // Section 6: Doctors
            specialistType: pageContent.specialistType,
            whySeeSpecialist: pageContent.whySeeSpecialist,
            doctorSelectionGuide: pageContent.doctorSelectionGuide,

            // Section 7: Hospitals
            hospitalCriteria: pageContent.hospitalCriteria as string[] | null,
            keyFacilities: pageContent.keyFacilities as string[] | null,

            // Section 8: Costs
            costBreakdown: pageContent.costBreakdown as Array<{ treatment: string; minCost: number; maxCost: number; currency: string }> | null,
            insuranceGuide: pageContent.insuranceGuide,
            financialAssistance: pageContent.financialAssistance,

            // Section 9: Prevention & Lifestyle
            preventionStrategies: pageContent.preventionStrategies as string[] | null,
            lifestyleModifications: pageContent.lifestyleModifications as string[] | null,
            dietRecommendations: pageContent.dietRecommendations as { recommended: string[]; avoid: string[] } | null,
            exerciseGuidelines: pageContent.exerciseGuidelines,

            // Section 10: Living With
            dailyManagement: pageContent.dailyManagement as string[] | null,
            prognosis: pageContent.prognosis,
            recoveryTimeline: pageContent.recoveryTimeline,
            complications: pageContent.complications as string[] | null,
            supportResources: pageContent.supportResources as Array<{ name: string; url?: string; description?: string }> | null,

            // Section 11: Related Conditions
            confusedWithConditions: pageContent.confusedWithConditions as Array<{ slug: string; name: string; keyDifference: string }> | null,
            coOccurringConditions: pageContent.coOccurringConditions as Array<{ slug: string; name: string }> | null,
            relatedConditions: pageContent.relatedConditions as Array<{ slug: string; name: string; relevance?: string }> | null,

            // Section 12: FAQs
            faqs: pageContent.faqs as Array<{ question: string; answer: string; schemaEligible?: boolean }> | null,

            // Simple Names & Regional Tags
            simpleName: pageContent.simpleName,
            regionalNames: pageContent.regionalNames as Array<{ name: string; region: string; language: string }> | null,
            searchTags: pageContent.searchTags as string[] | null,
            symptomKeywords: pageContent.symptomKeywords as string[] | null,

            // SEO Meta
            metaTitle: pageContent.metaTitle,
            metaDescription: pageContent.metaDescription,
            keywords: pageContent.keywords as string[] | null,

            // EEAT Signals
            sources: pageContent.sources as Array<{ title: string; url?: string; accessedDate?: string }> | null,
            lastReviewed: pageContent.lastReviewed,

            // Schema Markup
            schemaMedicalCondition: pageContent.schemaMedicalCondition,
            schemaFaqPage: pageContent.schemaFaqPage,

            // Quality
            qualityScore: pageContent.qualityScore ? Number(pageContent.qualityScore) : null,
            wordCount: pageContent.wordCount,
        };
    }

    // ─── 3.6 Resolve Treatment Costs (Phase 9) ────────
    let treatmentCost: {
        min: number;
        max: number;
        avg: number;
        currency: string;
        treatmentName: string;
    } | null = null;

    // Map country slug to country code
    // Use unified country config
    const { SLUG_TO_CODE } = await import('./countries');
    const countryCode = (SLUG_TO_CODE[geoChain.country?.slug || ''] || geoChain.country?.slug || 'IN').toLowerCase();

    // Try city-level first, then country-level
    let costRaw: Awaited<ReturnType<typeof prisma.treatmentCost.findFirst>> = null;
    if (geoChain.city?.slug) {
        costRaw = await prisma.treatmentCost.findFirst({
            where: {
                conditionSlug: condSlug,
                countryCode,
                citySlug: geoChain.city.slug,
            }
        });
    }

    // Fallback to country-level (citySlug is null)
    if (!costRaw) {
        costRaw = await prisma.treatmentCost.findFirst({
            where: {
                conditionSlug: condSlug,
                countryCode,
                citySlug: null,
            }
        });
    }

    // Final fallback: any cost for this condition in this country
    if (!costRaw) {
        costRaw = await prisma.treatmentCost.findFirst({
            where: {
                conditionSlug: condSlug,
                countryCode,
            }
        });
    }

    if (costRaw) {
        treatmentCost = {
            min: Number(costRaw.minCost),
            max: Number(costRaw.maxCost),
            avg: Number(costRaw.avgCost),
            currency: costRaw.currency,
            treatmentName: costRaw.treatmentName
        };
    }

    // ─── 3.7 Resolve Feature Image (Phase 9) ──────────
    let featureImage: string | null = null;
    const mediaAsset = await prisma.mediaAsset.findFirst({
        where: {
            conditionSlug: condSlug,
            entityType: 'condition',
            assetType: 'render',
            isActive: true
        },
        orderBy: { createdAt: 'desc' }
    });
    if (mediaAsset) {
        featureImage = mediaAsset.cdnUrl || mediaAsset.sourceUrl || null;
    }

    // ─── 4. Determine available languages ─────────────
    const availableLanguages = deepestGeo?.supportedLanguages || ['en'];

    // ─── 5. Fetch Provider Data (Top 2 Free + Top 13 Premium)
    const doctors = await fetchDoctorsForPage(condition.id, deepestGeo?.id ?? null, geoChain);

    // ─── 6. Fetch E-E-A-T Reviewer ────────────────────
    const reviewer = await fetchReviewer(condition.id, deepestGeo?.id ?? null, geoChain);

    return {
        condition: {
            ...condition,
            symptoms: (condition.symptoms as string[]) || [],
            treatments: (condition.treatments as string[]) || [],
            faqs: (condition.faqs as Array<{ q: string; a: string }>) || [],
        },
        localContent,
        automatedContent,
        treatmentCost,
        featureImage,
        doctors,
        reviewer,
        geoChain,
        language: lang,
        availableLanguages,
        isFallbackContent,
    };
}

/**
 * Resolve localized content with a fallback chain:
 * 1. Exact match: condition + language + geography
 * 2. City-level: condition + language + city (if current is locality)
 * 3. State-level: condition + language + state
 * 4. Country-level: condition + language + country
 * 5. Global: condition + language + null geography
 * 6. English fallback: repeat 1-5 with 'en'
 */
async function resolveLocalContent(
    conditionId: number,
    lang: string,
    geoId: number | null,
    geoChain: GeoChain
): Promise<{ localContent: PageData['localContent']; isFallbackContent: boolean }> {
    const select = {
        title: true, description: true, localizedAdvice: true,
        localFactors: true, consultationTips: true, metaTitle: true,
        metaDescription: true, status: true, languageCode: true,
    };

    // Build fallback geo IDs: deepest → ... → country → null
    const geoFallbackIds: (number | null)[] = [];
    if (geoId) {
        const ancestors = await getAncestorIds(geoId);
        geoFallbackIds.push(...ancestors);
    }
    geoFallbackIds.push(null); // global fallback

    // Try each geography level
    for (const fallbackGeoId of geoFallbackIds) {
        const content = await prisma.localizedContent.findFirst({
            where: {
                conditionId,
                languageCode: lang,
                geographyId: fallbackGeoId,
                status: 'published',
            },
            select,
            orderBy: { updatedAt: 'desc' },
        });

        if (content) {
            return {
                localContent: content,
                isFallbackContent: fallbackGeoId !== geoId,
            };
        }
    }

    // Ultimate fallback: any published English content for this condition
    const enContent = await prisma.localizedContent.findFirst({
        where: {
            conditionId,
            languageCode: 'en',
            status: 'published',
        },
        select,
        orderBy: { updatedAt: 'desc' },
    });

    return {
        localContent: enContent,
        isFallbackContent: true,
    };
}

/**
 * Fetch doctors for a condition page:
 * - Top 13 Premium doctors (revenue)
 * - Top 2 Free doctors (to show value of upgrading)
 * - Sorted by: subscription_tier DESC, rating DESC, review_count DESC
 *
 * Includes geo fallback: if < 2 doctors at locality, broaden to city, etc.
 */
async function fetchDoctorsForPage(
    conditionId: number,
    geoId: number | null,
    geoChain: GeoChain
): Promise<PageData['doctors']> {
    // Build geo search scope: locality → city → state → country
    const geoIds: number[] = [];
    if (geoChain.locality) geoIds.push(geoChain.locality.id);
    if (geoChain.city) geoIds.push(geoChain.city.id);
    if (geoChain.state) geoIds.push(geoChain.state.id);
    if (geoChain.country) geoIds.push(geoChain.country.id);

    const allDoctors = await prisma.doctorProvider.findMany({
        where: {
            specialties: { some: { conditionId } },
            geographyId: geoIds.length > 0 ? { in: geoIds } : undefined,
            isVerified: true,
        },
        select: {
            id: true, slug: true, name: true, bio: true, qualifications: true,
            experienceYears: true, rating: true, reviewCount: true,
            consultationFee: true, feeCurrency: true, profileImage: true,
            subscriptionTier: true, isVerified: true,
            specialties: {
                where: { conditionId },
                select: { isPrimary: true },
            },
        },
        orderBy: [
            { subscriptionTier: 'desc' }, // enterprise > premium > free
            { rating: 'desc' },
            { reviewCount: 'desc' },
        ],
        take: 20, // Fetch more than needed, then split
    });

    const premium: DoctorCard[] = [];
    const free: DoctorCard[] = [];

    for (const doc of allDoctors) {
        const card: DoctorCard = {
            id: doc.id,
            slug: doc.slug,
            name: doc.name,
            bio: doc.bio,
            qualifications: doc.qualifications,
            experienceYears: doc.experienceYears,
            rating: doc.rating ? Number(doc.rating) : null,
            reviewCount: doc.reviewCount,
            consultationFee: doc.consultationFee ? Number(doc.consultationFee) : null,
            feeCurrency: doc.feeCurrency,
            profileImage: doc.profileImage,
            subscriptionTier: doc.subscriptionTier,
            isVerified: doc.isVerified,
            isPrimarySpecialist: doc.specialties[0]?.isPrimary || false,
        };

        if (doc.subscriptionTier === 'premium' || doc.subscriptionTier === 'enterprise') {
            if (premium.length < 13) premium.push(card);
        } else {
            if (free.length < 2) free.push(card);
        }
    }

    return { premium, free };
}

/**
 * Fetch the E-E-A-T reviewer for a condition page.
 * Fallback: exact geo → city → state → country → any reviewer for condition.
 */
async function fetchReviewer(
    conditionId: number,
    geoId: number | null,
    geoChain: GeoChain
): Promise<PageData['reviewer']> {
    const geoFallbackIds: (number | null | undefined)[] = [];
    if (geoId) geoFallbackIds.push(geoId);
    if (geoChain.city) geoFallbackIds.push(geoChain.city.id);
    if (geoChain.state) geoFallbackIds.push(geoChain.state.id);
    if (geoChain.country) geoFallbackIds.push(geoChain.country.id);
    geoFallbackIds.push(null);

    for (const fallbackGeoId of geoFallbackIds) {
        const reviewer = await prisma.conditionReviewer.findFirst({
            where: {
                conditionId,
                geographyId: fallbackGeoId,
                isPrimary: true,
            },
            include: {
                doctor: {
                    select: {
                        name: true, slug: true, licenseNumber: true,
                        licensingBody: true, qualifications: true,
                    },
                },
            },
            orderBy: { reviewDate: 'desc' },
        });

        if (reviewer) {
            return {
                name: reviewer.doctor.name,
                slug: reviewer.doctor.slug,
                licenseNumber: reviewer.doctor.licenseNumber,
                licensingBody: reviewer.doctor.licensingBody,
                qualifications: reviewer.doctor.qualifications,
                reviewDate: reviewer.reviewDate,
            };
        }
    }

    return null;
}
