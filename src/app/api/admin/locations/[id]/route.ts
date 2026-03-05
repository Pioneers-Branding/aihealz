import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { GeoLevel } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Helper to serialize BigInt and Decimal fields
function serializeLocation(location: Record<string, unknown>) {
    return {
        ...location,
        population: location.population?.toString() || null,
        latitude: location.latitude?.toString() || null,
        longitude: location.longitude?.toString() || null,
    };
}

// GET - Get a single location
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const locationId = parseInt(id, 10);

        if (isNaN(locationId)) {
            return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
        }

        const location = await prisma.geography.findUnique({
            where: { id: locationId },
            include: {
                parent: true,
                children: {
                    select: { id: true, name: true, slug: true, level: true }
                },
                _count: {
                    select: {
                        doctors: true,
                        localizedContent: true,
                    }
                }
            }
        });

        if (!location) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        return NextResponse.json({ location: serializeLocation(location as unknown as Record<string, unknown>) });
    } catch (error) {
        console.error('Failed to fetch location:', error);
        return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
    }
}

// PUT - Update a location
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const locationId = parseInt(id, 10);

        if (isNaN(locationId)) {
            return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
        }

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

        // Check if location exists
        const existing = await prisma.geography.findUnique({
            where: { id: locationId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        // Check for slug conflict
        if (slug && (slug !== existing.slug || level !== existing.level || parentId !== existing.parentId)) {
            const slugConflict = await prisma.geography.findFirst({
                where: {
                    slug,
                    level: level || existing.level,
                    parentId: parentId !== undefined ? parentId : existing.parentId,
                    NOT: { id: locationId },
                },
            });
            if (slugConflict) {
                return NextResponse.json(
                    { error: 'A location with this slug already exists at this level' },
                    { status: 409 }
                );
            }
        }

        // Validate and convert population to BigInt safely
        let populationBigInt: bigint | null | undefined = undefined;
        if (population !== undefined) {
            if (population === null || population === '') {
                populationBigInt = null;
            } else {
                try {
                    populationBigInt = BigInt(population);
                    if (populationBigInt < 0) {
                        return NextResponse.json({ error: 'Population cannot be negative' }, { status: 400 });
                    }
                } catch {
                    return NextResponse.json({ error: 'Invalid population value' }, { status: 400 });
                }
            }
        }

        const location = await prisma.geography.update({
            where: { id: locationId },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(level && { level: level as GeoLevel }),
                ...(parentId !== undefined && { parentId }),
                ...(latitude !== undefined && { latitude }),
                ...(longitude !== undefined && { longitude }),
                ...(supportedLanguages !== undefined && { supportedLanguages }),
                ...(populationBigInt !== undefined && { population: populationBigInt }),
                ...(timezone !== undefined && { timezone }),
                ...(isoCode !== undefined && { isoCode }),
                ...(localeConfig !== undefined && { localeConfig }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ location: serializeLocation(location as unknown as Record<string, unknown>) });
    } catch (error) {
        console.error('Failed to update location:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}

// PATCH - Partial update (whitelisted fields only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const locationId = parseInt(id, 10);

        if (isNaN(locationId)) {
            return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
        }

        const body = await request.json();

        // Whitelist allowed fields for PATCH updates
        const allowedFields = ['isActive', 'supportedLanguages'] as const;
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update. Allowed: ' + allowedFields.join(', ') },
                { status: 400 }
            );
        }

        const location = await prisma.geography.update({
            where: { id: locationId },
            data: updateData,
        });

        return NextResponse.json({ location: serializeLocation(location as unknown as Record<string, unknown>) });
    } catch (error) {
        console.error('Failed to update location:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}

// DELETE - Delete a location
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const locationId = parseInt(id, 10);

        if (isNaN(locationId)) {
            return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
        }

        // Check if location exists
        const existing = await prisma.geography.findUnique({
            where: { id: locationId },
            include: {
                _count: {
                    select: {
                        children: true,
                        doctors: true,
                    }
                }
            }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        // Cascade delete will handle children due to schema settings
        await prisma.geography.delete({
            where: { id: locationId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete location:', error);
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }
}
