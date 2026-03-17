import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { GeoLevel } from '@prisma/client';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// Helper to serialize BigInt and Decimal for JSON
function serializeLocation(location: Record<string, unknown>) {
    return {
        ...location,
        population: location.population?.toString() || null,
        latitude: location.latitude?.toString() || null,
        longitude: location.longitude?.toString() || null,
    };
}

// GET - List all locations
export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const locations = await prisma.geography.findMany({
            orderBy: [{ level: 'asc' }, { name: 'asc' }],
            include: {
                parent: {
                    select: { id: true, name: true, slug: true }
                },
                _count: {
                    select: {
                        children: true,
                        doctors: true,
                        localizedContent: true,
                    }
                }
            }
        });

        // Serialize BigInt/Decimal fields for JSON
        const serializedLocations = locations.map(loc => serializeLocation(loc as unknown as Record<string, unknown>));

        return NextResponse.json({ locations: serializedLocations });
    } catch (error) {
        console.error('Failed to fetch locations:', error);
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
}

// POST - Create a new location
export async function POST(request: NextRequest) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const body = await request.json();

        const {
            name,
            slug,
            level,
            parentId,
            latitude,
            longitude,
            supportedLanguages,
            population,
            timezone,
            isoCode,
            localeConfig,
            isActive,
        } = body;

        // Validate required fields
        if (!name || !slug || !level) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug, level' },
                { status: 400 }
            );
        }

        // Validate level
        const validLevels: GeoLevel[] = ['continent', 'country', 'state', 'city', 'locality'];
        if (!validLevels.includes(level)) {
            return NextResponse.json(
                { error: 'Invalid level. Must be one of: continent, country, state, city, locality' },
                { status: 400 }
            );
        }

        // Check for duplicate slug at same level and parent
        const existing = await prisma.geography.findFirst({
            where: {
                slug,
                level,
                parentId: parentId || null,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A location with this slug already exists at this level' },
                { status: 409 }
            );
        }

        // Validate and convert population to BigInt safely
        let populationBigInt: bigint | null = null;
        if (population !== undefined && population !== null && population !== '') {
            try {
                populationBigInt = BigInt(population);
                if (populationBigInt < 0) {
                    return NextResponse.json({ error: 'Population cannot be negative' }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: 'Invalid population value' }, { status: 400 });
            }
        }

        const location = await prisma.geography.create({
            data: {
                name,
                slug,
                level: level as GeoLevel,
                parentId: parentId || null,
                latitude: latitude || null,
                longitude: longitude || null,
                supportedLanguages: supportedLanguages || ['en'],
                population: populationBigInt,
                timezone: timezone || null,
                isoCode: isoCode || null,
                localeConfig: localeConfig || {},
                isActive: isActive ?? true,
            },
        });

        // Convert BigInt to string for JSON serialization
        return NextResponse.json({
            location: {
                ...location,
                population: location.population?.toString() || null,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create location:', error);
        return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
    }
}
