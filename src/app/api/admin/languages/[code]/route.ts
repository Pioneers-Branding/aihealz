import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
    params: Promise<{ code: string }>;
}

// GET - Get a single language
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { code } = await params;

        const language = await prisma.language.findUnique({
            where: { code },
            include: {
                _count: {
                    select: {
                        localizedContent: true,
                        uiTranslations: true,
                        sitemapEntries: true,
                    }
                }
            }
        });

        if (!language) {
            return NextResponse.json({ error: 'Language not found' }, { status: 404 });
        }

        return NextResponse.json({ language });
    } catch (error) {
        console.error('Failed to fetch language:', error);
        return NextResponse.json({ error: 'Failed to fetch language' }, { status: 500 });
    }
}

// PUT - Update a language
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { code } = await params;
        const body = await request.json();

        const { name, nativeName, isActive } = body;

        // Check if language exists
        const existing = await prisma.language.findUnique({
            where: { code },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Language not found' }, { status: 404 });
        }

        const language = await prisma.language.update({
            where: { code },
            data: {
                ...(name && { name }),
                ...(nativeName !== undefined && { nativeName }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ language });
    } catch (error) {
        console.error('Failed to update language:', error);
        return NextResponse.json({ error: 'Failed to update language' }, { status: 500 });
    }
}

// PATCH - Partial update (whitelisted fields only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { code } = await params;
        const body = await request.json();

        // Whitelist allowed fields for PATCH updates
        const allowedFields = ['isActive', 'name', 'nativeName'] as const;
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

        const language = await prisma.language.update({
            where: { code },
            data: updateData,
        });

        return NextResponse.json({ language });
    } catch (error) {
        console.error('Failed to update language:', error);
        return NextResponse.json({ error: 'Failed to update language' }, { status: 500 });
    }
}

// DELETE - Delete a language
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { code } = await params;

        // Check if language exists
        const existing = await prisma.language.findUnique({
            where: { code },
            include: {
                _count: {
                    select: {
                        localizedContent: true,
                        uiTranslations: true,
                    }
                }
            }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Language not found' }, { status: 404 });
        }

        // Warn if there's content
        if (existing._count.localizedContent > 0 || existing._count.uiTranslations > 0) {
            // Cascade delete will handle related records
        }

        await prisma.language.delete({
            where: { code },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete language:', error);
        return NextResponse.json({ error: 'Failed to delete language' }, { status: 500 });
    }
}
