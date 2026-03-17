import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - List all languages
export async function GET() {
    try {
        const languages = await prisma.language.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        localizedContent: true,
                        uiTranslations: true,
                    }
                }
            }
        });

        return NextResponse.json({ languages });
    } catch (error) {
        console.error('Failed to fetch languages:', error);
        return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
    }
}

// POST - Create a new language
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { code, name, nativeName, isActive } = body;

        // Validate required fields
        if (!code || !name) {
            return NextResponse.json(
                { error: 'Missing required fields: code, name' },
                { status: 400 }
            );
        }

        // Validate code format (2-5 characters)
        if (code.length < 2 || code.length > 5) {
            return NextResponse.json(
                { error: 'Language code must be 2-5 characters' },
                { status: 400 }
            );
        }

        // Check for duplicate code
        const existing = await prisma.language.findUnique({
            where: { code },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A language with this code already exists' },
                { status: 409 }
            );
        }

        const language = await prisma.language.create({
            data: {
                code: code.toLowerCase(),
                name,
                nativeName: nativeName || null,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ language }, { status: 201 });
    } catch (error) {
        console.error('Failed to create language:', error);
        return NextResponse.json({ error: 'Failed to create language' }, { status: 500 });
    }
}
