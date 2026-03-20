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
 *
 * OPTIMIZED: All independent queries run in parallel via Promise.all
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

// ─── In-Memory Page Cache (avoids DB entirely on repeat visits) ───
const PAGE_CACHE = new Map<string, { data: PageData; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Main stitching function — resolves all data for a condition page.
 * OPTIMIZED: Parallel queries + in-memory cache.
 */
export async function stitchPageData(
    lang: string,
    condSlug: string,
    geoSlugs: string[]
): Promise<PageData | null> {
    // ─── Check in-memory cache first ─────────────────
    const cacheKey = `${lang}:${condSlug}:${geoSlugs.join(':')}`;
    const cached = PAGE_CACHE.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }

    // ─── Phase 1: Condition + GeoChain (must resolve first) ──
    const [condition, geoChain] = await Promise.all([
        prisma.medicalCondition.findUnique({
            where: { slug: condSlug, isActive: true },
            select: {
                id: true, slug: true, scientificName: true, commonName: true,
                description: true, symptoms: true, treatments: true, faqs: true,
                specialistType: true, severityLevel: true, icdCode: true, bodySystem: true,
            },
        }),
        resolveGeoChain(geoSlugs),
    ]);

    if (!condition) return null;

    const deepestGeo = getDeepestGeo(geoChain);
    const { SLUG_TO_CODE } = await import('./countries');
    const countryCode = (SLUG_TO_CODE[geoChain.country?.slug || ''] || geoChain.country?.slug || 'IN').toLowerCase();

    // ─── Phase 2: All independent queries in parallel ────────
    const [
        { localContent, isFallbackContent },
        pageContent,
        costRaw,
        mediaAsset,
        doctors,
        reviewer,
    ] = await Promise.all([
        resolveLocalContent(condition.id, lang, deepestGeo?.id ?? null, geoChain),
        resolvePageContent(condition.id, lang),
        resolveTreatmentCost(condSlug, countryCode, geoChain.city?.slug ?? null),
        prisma.mediaAsset.findFirst({
            where: {
                conditionSlug: condSlug,
                entityType: 'condition',
                assetType: 'render',
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        }),
        fetchDoctorsForPage(condition.id, deepestGeo?.id ?? null, geoChain),
        fetchReviewer(condition.id, deepestGeo?.id ?? null, geoChain),
    ]);

    // ─── Build automatedContent from pageContent ─────────────
    let automatedContent: PageData['automatedContent'] = null;
    if (pageContent) {
        automatedContent = {
            h1Title: pageContent.h1Title,
            heroOverview: pageContent.heroOverview,
            keyStats: pageContent.keyStats as PageData['automatedContent'] extends { keyStats: infer T } ? T : null,
            definition: pageContent.definition,
            typesClassification: pageContent.typesClassification as Array<{ type: string; description: string }> | null,
            primarySymptoms: pageContent.primarySymptoms as string[] | null,
            earlyWarningSigns: pageContent.earlyWarningSigns as string[] | null,
            emergencySigns: pageContent.emergencySigns as string[] | null,
            causes: pageContent.causes as Array<{ cause: string; description: string }> | null,
            riskFactors: pageContent.riskFactors as Array<{ factor: string; category: string; description: string }> | null,
            affectedDemographics: pageContent.affectedDemographics as string[] | null,
            diagnosisOverview: pageContent.diagnosisOverview,
            diagnosticTests: pageContent.diagnosticTests as Array<{ test: string; purpose: string; whatToExpect?: string }> | null,
            treatmentOverview: pageContent.treatmentOverview,
            medicalTreatments: pageContent.medicalTreatments as Array<{ name: string; description: string; effectiveness?: string }> | null,
            surgicalOptions: pageContent.surgicalOptions as Array<{ name: string; description: string; successRate?: string }> | null,
            alternativeTreatments: pageContent.alternativeTreatments as Array<{ name: string; description: string }> | null,
            linkedTreatmentSlugs: pageContent.linkedTreatmentSlugs as string[] | null,
            specialistType: pageContent.specialistType,
            whySeeSpecialist: pageContent.whySeeSpecialist,
            doctorSelectionGuide: pageContent.doctorSelectionGuide,
            hospitalCriteria: pageContent.hospitalCriteria as string[] | null,
            keyFacilities: pageContent.keyFacilities as string[] | null,
            costBreakdown: pageContent.costBreakdown as Array<{ treatment: string; minCost: number; maxCost: number; currency: string }> | null,
            insuranceGuide: pageContent.insuranceGuide,
            financialAssistance: pageContent.financialAssistance,
            preventionStrategies: pageContent.preventionStrategies as string[] | null,
            lifestyleModifications: pageContent.lifestyleModifications as string[] | null,
            dietRecommendations: pageContent.dietRecommendations as { recommended: string[]; avoid: string[] } | null,
            exerciseGuidelines: pageContent.exerciseGuidelines,
            dailyManagement: pageContent.dailyManagement as string[] | null,
            prognosis: pageContent.prognosis,
            recoveryTimeline: pageContent.recoveryTimeline,
            complications: pageContent.complications as string[] | null,
            supportResources: pageContent.supportResources as Array<{ name: string; url?: string; description?: string }> | null,
            confusedWithConditions: pageContent.confusedWithConditions as Array<{ slug: string; name: string; keyDifference: string }> | null,
            coOccurringConditions: pageContent.coOccurringConditions as Array<{ slug: string; name: string }> | null,
            relatedConditions: pageContent.relatedConditions as Array<{ slug: string; name: string; relevance?: string }> | null,
            faqs: pageContent.faqs as Array<{ question: string; answer: string; schemaEligible?: boolean }> | null,
            simpleName: pageContent.simpleName,
            regionalNames: pageContent.regionalNames as Array<{ name: string; region: string; language: string }> | null,
            searchTags: pageContent.searchTags as string[] | null,
            symptomKeywords: pageContent.symptomKeywords as string[] | null,
            metaTitle: pageContent.metaTitle,
            metaDescription: pageContent.metaDescription,
            keywords: pageContent.keywords as string[] | null,
            sources: pageContent.sources as Array<{ title: string; url?: string; accessedDate?: string }> | null,
            lastReviewed: pageContent.lastReviewed,
            schemaMedicalCondition: pageContent.schemaMedicalCondition,
            schemaFaqPage: pageContent.schemaFaqPage,
            qualityScore: pageContent.qualityScore ? Number(pageContent.qualityScore) : null,
            wordCount: pageContent.wordCount,
        };
    }

    // ─── Build treatment cost ────────────────────────────────
    let treatmentCost: PageData['treatmentCost'] = null;
    if (costRaw) {
        treatmentCost = {
            min: Number(costRaw.minCost),
            max: Number(costRaw.maxCost),
            avg: Number(costRaw.avgCost),
            currency: costRaw.currency,
            treatmentName: costRaw.treatmentName,
        };
    }

    const availableLanguages = deepestGeo?.supportedLanguages || ['en'];
    const featureImage = mediaAsset ? (mediaAsset.cdnUrl || mediaAsset.sourceUrl || null) : null;

    const result: PageData = {
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
        geoChain,
        language: lang,
        availableLanguages,
        isFallbackContent: !pageContent,
        doctors,
        reviewer
    };

    // ─── Store in cache ──────────────────────────────────────
    PAGE_CACHE.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });

    // Evict stale entries periodically (keep cache under 500 entries)
    if (PAGE_CACHE.size > 500) {
        const now = Date.now();
        for (const [key, val] of PAGE_CACHE) {
            if (val.expires < now) PAGE_CACHE.delete(key);
        }
    }

    return result;
}

/**
 * Resolve page content with language fallback.
 * Single query with OR conditions instead of 4 sequential queries.
 */
async function resolvePageContent(conditionId: number, lang: string) {
    // Fetch all candidates in one query (both languages, both statuses)
    const candidates = await prisma.conditionPageContent.findMany({
        where: {
            conditionId,
            languageCode: { in: lang === 'en' ? ['en'] : [lang, 'en'] },
        },
        orderBy: { updatedAt: 'desc' },
    });

    // Priority: requested lang + published > en + published > requested lang + any > en + any
    return (
        candidates.find(c => c.languageCode === lang && c.status === 'published') ||
        (lang !== 'en' ? candidates.find(c => c.languageCode === 'en' && c.status === 'published') : null) ||
        candidates.find(c => c.languageCode === lang) ||
        (lang !== 'en' ? candidates.find(c => c.languageCode === 'en') : null) ||
        null
    );
}

/**
 * Resolve treatment cost with city → country → any fallback.
 * Single query with OR conditions instead of 3 sequential queries.
 */
async function resolveTreatmentCost(condSlug: string, countryCode: string, citySlug: string | null) {
    const candidates = await prisma.treatmentCost.findMany({
        where: {
            conditionSlug: condSlug,
            countryCode,
        },
        take: 10,
    });

    // Priority: exact city > country-level (null city) > any
    return (
        (citySlug ? candidates.find(c => c.citySlug === citySlug) : null) ||
        candidates.find(c => c.citySlug === null) ||
        candidates[0] ||
        null
    );
}

/**
 * Resolve localized content with a fallback chain.
 * Uses IN query + in-memory filtering instead of N sequential queries.
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
        geographyId: true,
    };

    // Build all possible geo IDs for fallback
    const geoFallbackIds: (number | null)[] = [];
    if (geoId) {
        const ancestors = await getAncestorIds(geoId);
        geoFallbackIds.push(...ancestors);
    }
    geoFallbackIds.push(null); // global fallback

    // Fetch ALL candidates for this condition in both languages at once
    const langCodes = lang === 'en' ? ['en'] : [lang, 'en'];
    const nonNullGeoIds = geoFallbackIds.filter((id): id is number => id !== null);
    const candidates = await prisma.localizedContent.findMany({
        where: {
            conditionId,
            languageCode: { in: langCodes },
            OR: [
                ...(nonNullGeoIds.length > 0 ? [{ geographyId: { in: nonNullGeoIds } }] : []),
                { geographyId: null },
            ],
            status: 'published',
        },
        select,
        orderBy: { updatedAt: 'desc' },
    });

    // Priority: requested lang at deepest geo → ... → requested lang at null → en at deepest → ... → en at null
    for (const targetLang of [lang, ...(lang !== 'en' ? ['en'] : [])]) {
        for (const fallbackGeoId of geoFallbackIds) {
            const match = candidates.find(c => c.languageCode === targetLang && c.geographyId === fallbackGeoId);
            if (match) {
                return {
                    localContent: match,
                    isFallbackContent: targetLang !== lang || fallbackGeoId !== geoId,
                };
            }
        }
    }

    return { localContent: null, isFallbackContent: true };
}

/**
 * Fetch doctors for a condition page.
 * Single query covering all geo levels.
 */
async function fetchDoctorsForPage(
    conditionId: number,
    geoId: number | null,
    geoChain: GeoChain
): Promise<PageData['doctors']> {
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
            { subscriptionTier: 'desc' },
            { rating: 'desc' },
            { reviewCount: 'desc' },
        ],
        take: 20,
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
 * Single query with IN clause instead of N sequential queries.
 */
async function fetchReviewer(
    conditionId: number,
    geoId: number | null,
    geoChain: GeoChain
): Promise<PageData['reviewer']> {
    const geoFallbackIds: (number | null)[] = [];
    if (geoId) geoFallbackIds.push(geoId);
    if (geoChain.city) geoFallbackIds.push(geoChain.city.id);
    if (geoChain.state) geoFallbackIds.push(geoChain.state.id);
    if (geoChain.country) geoFallbackIds.push(geoChain.country.id);
    geoFallbackIds.push(null);

    // Single query: fetch all candidate reviewers
    const nonNullReviewerGeoIds = geoFallbackIds.filter((id): id is number => id !== null);
    const candidates = await prisma.conditionReviewer.findMany({
        where: {
            conditionId,
            OR: [
                ...(nonNullReviewerGeoIds.length > 0 ? [{ geographyId: { in: nonNullReviewerGeoIds } }] : []),
                { geographyId: null },
            ],
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

    // Find closest geo match
    for (const fallbackGeoId of geoFallbackIds) {
        const match = candidates.find(c => c.geographyId === fallbackGeoId);
        if (match) {
            return {
                name: match.doctor.name,
                slug: match.doctor.slug,
                licenseNumber: match.doctor.licenseNumber,
                licensingBody: match.doctor.licensingBody,
                qualifications: match.doctor.qualifications,
                reviewDate: match.reviewDate,
            };
        }
    }

    return null;
}
