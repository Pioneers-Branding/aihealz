import prisma from '@/lib/db';
import type { ClinicalExtraction } from './clinical-extractor';

/**
 * Doctor Matchmaking Algorithm
 *
 * Takes the AI-extracted specialty and the user's detected city to produce
 * a ranked list of doctors. The ranking system is the core of the revenue model:
 *
 * Rank 1: Premium/Enterprise doctors in the user's exact sub-locality
 * Rank 2: Premium/Enterprise doctors in the wider city
 * Rank 3: Verified Free doctors (limited, to incentivize upgrades)
 *
 * Falls back up the geo chain if insufficient matches are found.
 */

export interface MatchedDoctor {
    id: number;
    name: string;
    slug: string;
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
    matchRank: number;
    matchReason: string;
    avgWaitMinutes: number | null;
    distanceLabel: string | null;
}

export interface MatchResult {
    doctors: MatchedDoctor[];
    totalMatches: number;
    specialtySearched: string;
    geoSearched: string;
}

/**
 * Match doctors based on clinical extraction and geo context.
 */
export async function matchDoctors(
    extraction: ClinicalExtraction,
    countrySlug: string,
    citySlug: string | null,
    localitySlug?: string | null
): Promise<MatchResult> {
    const specialtyType = extraction.specialtyRequired;
    const conditionSlug = extraction.conditionSlug;

    // ── Resolve geography IDs (batch query to avoid N+1) ─────────────────────────
    const geoIds: { locality?: number; city?: number; state?: number; country?: number } = {};

    // Fetch all relevant geographies in a single query
    const slugsToFind = [countrySlug, citySlug, localitySlug].filter(Boolean) as string[];
    const geographies = await prisma.geography.findMany({
        where: {
            slug: { in: slugsToFind },
            isActive: true,
        },
        select: { id: true, slug: true, level: true, parentId: true },
    });

    // Map results to geoIds
    const geoBySlug = new Map(geographies.map(g => [g.slug, g]));

    // Set country
    const countryGeo = geoBySlug.get(countrySlug);
    if (countryGeo && countryGeo.level === 'country') {
        geoIds.country = countryGeo.id;
    }

    // Set city
    if (citySlug) {
        const cityGeo = geoBySlug.get(citySlug);
        if (cityGeo && (cityGeo.level === 'city' || cityGeo.level === 'state')) {
            geoIds.city = cityGeo.id;
            if (cityGeo.parentId) geoIds.state = cityGeo.parentId;
        }
    }

    // Set locality
    if (localitySlug) {
        const localityGeo = geoBySlug.get(localitySlug);
        if (localityGeo && localityGeo.level === 'locality') {
            geoIds.locality = localityGeo.id;
            if (localityGeo.parentId && !geoIds.city) {
                geoIds.city = localityGeo.parentId;
            }
        }
    }

    // ── Find condition ID ─────────────────────────────
    let conditionId: number | null = null;
    if (conditionSlug) {
        const condition = await prisma.medicalCondition.findUnique({
            where: { slug: conditionSlug },
            select: { id: true },
        });
        conditionId = condition?.id || null;
    }

    // If no condition match, search by specialist type in doctor specialties
    const allDoctors: MatchedDoctor[] = [];

    // ── Rank 1: Premium in sub-locality ───────────────
    if (geoIds.locality) {
        const localDocs = await findDoctorsInGeo(
            geoIds.locality, conditionId, specialtyType,
            ['premium', 'enterprise'], 5
        );
        allDoctors.push(
            ...localDocs.map((d) => ({
                ...d,
                matchRank: 1,
                matchReason: 'Premium specialist in your area',
                distanceLabel: 'Near you',
                avgWaitMinutes: null,
            }))
        );
    }

    // ── Rank 2: Premium in wider city ─────────────────
    if (geoIds.city) {
        const existingIds = allDoctors.map((d) => d.id);
        const cityDocs = await findDoctorsInGeo(
            geoIds.city, conditionId, specialtyType,
            ['premium', 'enterprise'], 10, existingIds
        );
        allDoctors.push(
            ...cityDocs.map((d) => ({
                ...d,
                matchRank: 2,
                matchReason: 'Premium specialist in your city',
                distanceLabel: 'In your city',
                avgWaitMinutes: null,
            }))
        );
    }

    // ── Rank 3: Free verified doctors ─────────────────
    const existingIds = allDoctors.map((d) => d.id);
    const geoSearchIds = Object.values(geoIds).filter((id): id is number => id !== undefined);

    const freeDocs = await findDoctorsInGeo(
        geoSearchIds[0] || null, conditionId, specialtyType,
        ['free'], 3, existingIds
    );
    allDoctors.push(
        ...freeDocs.map((d) => ({
            ...d,
            matchRank: 3,
            matchReason: 'Verified specialist',
            distanceLabel: null,
            avgWaitMinutes: null,
        }))
    );

    // ── Fetch average wait times (batch query to avoid N+1) ──────────────────────
    if (allDoctors.length > 0) {
        const doctorIds = allDoctors.map(d => d.id);
        const waitTimes = await prisma.waitingTimeReport.groupBy({
            by: ['doctorId'],
            where: { doctorId: { in: doctorIds } },
            _avg: { waitMinutes: true },
        });

        // Create a map for O(1) lookup
        const waitTimeMap = new Map(
            waitTimes.map(w => [w.doctorId, w._avg.waitMinutes])
        );

        // Apply wait times to doctors
        for (const doc of allDoctors) {
            const avgWait = waitTimeMap.get(doc.id);
            doc.avgWaitMinutes = avgWait ? Math.round(avgWait) : null;
        }
    }

    return {
        doctors: allDoctors,
        totalMatches: allDoctors.length,
        specialtySearched: specialtyType,
        geoSearched: citySlug || countrySlug,
    };
}

/**
 * Find doctors in a specific geography matching criteria.
 */
async function findDoctorsInGeo(
    geoId: number | null,
    conditionId: number | null,
    specialtyType: string,
    tiers: string[],
    limit: number,
    excludeIds: number[] = []
): Promise<Omit<MatchedDoctor, 'matchRank' | 'matchReason' | 'avgWaitMinutes' | 'distanceLabel'>[]> {
    // Build specialty matching criteria
    // Either match by specific condition OR by specialty type in condition's specialistType
    const specialtyFilter = conditionId
        ? { specialties: { some: { conditionId } } }
        : specialtyType
            ? {
                specialties: {
                    some: {
                        condition: {
                            OR: [
                                { specialistType: { contains: specialtyType, mode: 'insensitive' as const } },
                                { commonName: { contains: specialtyType, mode: 'insensitive' as const } },
                            ],
                        },
                    },
                },
            }
            : {};

    const doctors = await prisma.doctorProvider.findMany({
        where: {
            isVerified: true,
            subscriptionTier: { in: tiers as ('free' | 'premium' | 'enterprise')[] },
            ...(geoId ? { geographyId: geoId } : {}),
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
            ...specialtyFilter,
        },
        select: {
            id: true, slug: true, name: true, qualifications: true,
            experienceYears: true, rating: true, reviewCount: true,
            consultationFee: true, feeCurrency: true, profileImage: true,
            subscriptionTier: true, isVerified: true,
            specialties: conditionId
                ? { where: { conditionId }, select: { isPrimary: true } }
                : { select: { isPrimary: true }, take: 1 },
        },
        orderBy: [
            { rating: 'desc' },
            { reviewCount: 'desc' },
            { experienceYears: 'desc' },
        ],
        take: limit,
    });

    return doctors.map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        qualifications: d.qualifications,
        experienceYears: d.experienceYears,
        rating: d.rating ? Number(d.rating) : null,
        reviewCount: d.reviewCount,
        consultationFee: d.consultationFee ? Number(d.consultationFee) : null,
        feeCurrency: d.feeCurrency,
        profileImage: d.profileImage,
        subscriptionTier: d.subscriptionTier,
        isVerified: d.isVerified,
        isPrimarySpecialist: d.specialties[0]?.isPrimary || false,
    }));
}
