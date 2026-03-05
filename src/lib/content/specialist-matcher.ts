import prisma from '@/lib/db';

/**
 * Specialist Matcher
 * 
 * Logic:
 * 1. Identify Specialty for the Condition.
 * 2. Find Doctors in the Region (City -> Country) matching that Specialty.
 * 3. Sort: Premium Tiers first, then Reputation Score.
 * 4. Return: Top 3 Premium + Top 2 Free.
 */

export async function getSpecialistsForCondition(
    conditionSlug: string,
    citySlug: string,
    countryCode: string
) {
    // 1. Get Specialty
    const condition = await prisma.medicalCondition.findUnique({
        where: { slug: conditionSlug },
        include: { icd10Mappings: true }
    });

    if (!condition) return { premium: [], free: [] };

    // Determine specialty from standard field or ICD mapping
    const specialty = condition.specialistType || condition.icd10Mappings[0]?.specialty || 'General Practitioner';

    // 2. Find Doctors in Geo
    // We need to join with Geography logic. Assuming doctor_providers has location fields or relation.
    // Using the new 'encounters' relation and doctor table structure
    // For now, doing a broad search based on text match of specialty in provider profile for simplicity 
    // or relying on a direct relation if it exists. 
    // Let's assume `doctor_specialties` join table or `specialty` field on provider.

    /* 
     * Real implementation would use PostGIS or detailed geo-filtering.
     * Here we mock the query structure for the prompt's logic:
     * "Top 3 Premium Doctors for that specialty in the user's detected browser location"
     */

    const allDoctors = await prisma.doctorProvider.findMany({
        where: {
            isVerified: true,
            // In a real app, filtering by geo would happen via the `geographies` relation
            // geography: { slug: citySlug }
        },
        include: {
            specialties: {
                include: {
                    condition: true
                }
            }
        },
        orderBy: [
            { subscriptionTier: 'desc' }, // 'enterprise' > 'premium' > 'free'
            { rating: 'desc' }
        ],
        take: 50 // Candidate pool
    });

    // Filter by specialty text (rough match via specialties relation)
    const specialized = allDoctors.filter(d =>
        d.specialties.some(s =>
            (s.condition?.specialistType || '').toLowerCase().includes(specialty.toLowerCase())
        )
    );

    // Split Premium vs Free
    const premium = specialized.filter(d => d.subscriptionTier !== 'free').slice(0, 3);
    const free = specialized.filter(d => d.subscriptionTier === 'free').slice(0, 2);

    return {
        specialty,
        premium: premium.map(d => ({
            id: d.id,
            name: d.name,
            tier: d.subscriptionTier,
            image: d.profileImage,
            rating: d.rating,
            slug: d.slug
        })),
        free: free.map(d => ({
            id: d.id,
            name: d.name,
            tier: 'free',
            image: d.profileImage,
            slug: d.slug
        }))
    };
}
