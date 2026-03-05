import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { searchHospitals, searchDiagnosticLabs, generateSlug } from '@/lib/google-places';

/**
 * POST /api/admin/populate-real-data
 *
 * Fetches real hospitals and diagnostic labs from Google Places API
 * and populates the database.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type = 'hospitals', limit = 10 } = body;

        // Get cities from geographies
        const cities = await prisma.geography.findMany({
            where: {
                level: 'city',
                isActive: true,
            },
            include: {
                parent: {
                    include: {
                        parent: true, // country
                    },
                },
            },
            take: limit,
        });

        const results: { city: string; added: number; errors: string[] }[] = [];

        for (const city of cities) {
            const cityName = city.name;
            const countryName = city.parent?.parent?.name || 'India';
            const errors: string[] = [];
            let added = 0;

            try {
                if (type === 'hospitals' || type === 'all') {
                    const hospitalData = await searchHospitals(cityName, countryName);

                    for (const place of hospitalData.places) {
                        try {
                            // Check if hospital already exists
                            const existing = await prisma.hospital.findFirst({
                                where: {
                                    OR: [
                                        { googlePlaceId: place.placeId },
                                        { slug: generateSlug(place.name, cityName) },
                                    ],
                                },
                            });

                            if (existing) continue;

                            await prisma.hospital.create({
                                data: {
                                    name: place.name,
                                    slug: generateSlug(place.name, cityName),
                                    address: place.address,
                                    latitude: place.latitude,
                                    longitude: place.longitude,
                                    rating: place.rating,
                                    reviewCount: place.reviewCount,
                                    phone: place.phoneNumber,
                                    website: place.website,
                                    coverImage: place.photos[0] || null,
                                    images: place.photos,
                                    googlePlaceId: place.placeId,
                                    geographyId: city.id,
                                    isActive: true,
                                    isVerified: true, // Google data is reliable
                                    hospitalType: 'general',
                                    bedCount: null,
                                    accreditations: [],
                                    specialties: [],
                                    amenities: [],
                                    emergencyServices: true,
                                },
                            });
                            added++;
                        } catch (err: any) {
                            errors.push(`Hospital ${place.name}: ${err.message}`);
                        }
                    }
                }

                if (type === 'labs' || type === 'all') {
                    const labData = await searchDiagnosticLabs(cityName, countryName);

                    for (const place of labData.places) {
                        try {
                            // Check if lab already exists
                            const existing = await prisma.diagnosticProvider.findFirst({
                                where: {
                                    OR: [
                                        { googlePlaceId: place.placeId },
                                        { slug: generateSlug(place.name, cityName) },
                                    ],
                                },
                            });

                            if (existing) continue;

                            await prisma.diagnosticProvider.create({
                                data: {
                                    name: place.name,
                                    slug: generateSlug(place.name, cityName),
                                    address: place.address,
                                    latitude: place.latitude,
                                    longitude: place.longitude,
                                    rating: place.rating,
                                    reviewCount: place.reviewCount,
                                    phone: place.phoneNumber,
                                    website: place.website,
                                    coverImage: place.photos[0] || null,
                                    images: place.photos,
                                    googlePlaceId: place.placeId,
                                    geographyId: city.id,
                                    isActive: true,
                                    isVerified: true,
                                    providerType: 'lab',
                                    accreditations: [],
                                    homeCollectionAvailable: false,
                                },
                            });
                            added++;
                        } catch (err: any) {
                            errors.push(`Lab ${place.name}: ${err.message}`);
                        }
                    }
                }
            } catch (err: any) {
                errors.push(`City error: ${err.message}`);
            }

            results.push({ city: cityName, added, errors });
        }

        const totalAdded = results.reduce((sum, r) => sum + r.added, 0);

        return NextResponse.json({
            success: true,
            message: `Added ${totalAdded} ${type} across ${cities.length} cities`,
            results,
        });
    } catch (error: any) {
        console.error('Populate data error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/populate-real-data
 *
 * Returns current data counts
 */
export async function GET() {
    const [hospitals, labs, doctors, cities] = await Promise.all([
        prisma.hospital.count(),
        prisma.diagnosticProvider.count(),
        prisma.doctorProvider.count(),
        prisma.geography.count({ where: { level: 'city', isActive: true } }),
    ]);

    return NextResponse.json({
        hospitals,
        labs,
        doctors,
        cities,
        message: hospitals === 0 && labs === 0
            ? 'Database is empty. Run POST to populate with real data.'
            : `Database has ${hospitals} hospitals, ${labs} labs, ${doctors} doctors`,
    });
}
