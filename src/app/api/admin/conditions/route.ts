import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// GET - List all conditions
export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const conditions = await prisma.medicalCondition.findMany({
            orderBy: { commonName: 'asc' },
            include: {
                _count: {
                    select: {
                        localizedContent: true,
                        doctorSpecialties: true,
                    }
                }
            }
        });

        return NextResponse.json({ conditions });
    } catch (error) {
        console.error('Failed to fetch conditions:', error);
        return NextResponse.json({ error: 'Failed to fetch conditions' }, { status: 500 });
    }
}

// POST - Create a new condition
export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const body = await request.json();

        const {
            commonName,
            scientificName,
            slug,
            description,
            specialistType,
            bodySystem,
            severityLevel,
            icdCode,
            symptoms,
            treatments,
            faqs,
            isActive,
        } = body;

        // Validate required fields
        if (!commonName || !scientificName || !slug || !specialistType) {
            return NextResponse.json(
                { error: 'Missing required fields: commonName, scientificName, slug, specialistType' },
                { status: 400 }
            );
        }

        // Check for duplicate slug
        const existing = await prisma.medicalCondition.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A condition with this slug already exists' },
                { status: 409 }
            );
        }

        const condition = await prisma.medicalCondition.create({
            data: {
                commonName,
                scientificName,
                slug,
                description: description || null,
                specialistType,
                bodySystem: bodySystem || null,
                severityLevel: severityLevel || null,
                icdCode: icdCode || null,
                symptoms: symptoms || [],
                treatments: treatments || [],
                faqs: faqs || [],
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ condition }, { status: 201 });
    } catch (error) {
        console.error('Failed to create condition:', error);
        return NextResponse.json({ error: 'Failed to create condition' }, { status: 500 });
    }
}
