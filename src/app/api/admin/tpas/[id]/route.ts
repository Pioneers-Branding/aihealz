import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const { id } = await params;
    const tpaId = parseInt(id);

    if (isNaN(tpaId)) {
        return NextResponse.json({ error: 'Invalid TPA ID' }, { status: 400 });
    }

    try {
        const tpa = await prisma.tpa.findUnique({
            where: { id: tpaId },
            include: {
                insuranceLinks: {
                    where: { isActive: true },
                    include: {
                        insurer: {
                            select: { id: true, name: true, logo: true },
                        },
                    },
                },
                hospitalLinks: {
                    where: { isActive: true },
                    take: 20,
                },
                geographyPresence: {
                    include: {
                        geography: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!tpa) {
            return NextResponse.json({ error: 'TPA not found' }, { status: 404 });
        }

        return NextResponse.json(tpa);
    } catch (error) {
        console.error('Failed to fetch TPA:', error);
        return NextResponse.json({ error: 'Failed to fetch TPA' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const { id } = await params;
    const tpaId = parseInt(id);

    if (isNaN(tpaId)) {
        return NextResponse.json({ error: 'Invalid TPA ID' }, { status: 400 });
    }

    try {
        const data = await req.json();

        // Remove id from update data if present
        delete data.id;
        delete data.createdAt;

        const tpa = await prisma.tpa.update({
            where: { id: tpaId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(tpa);
    } catch (error) {
        console.error('Failed to update TPA:', error);
        return NextResponse.json({ error: 'Failed to update TPA' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const { id } = await params;
    const tpaId = parseInt(id);

    if (isNaN(tpaId)) {
        return NextResponse.json({ error: 'Invalid TPA ID' }, { status: 400 });
    }

    try {
        // Soft delete by setting isActive to false
        await prisma.tpa.update({
            where: { id: tpaId },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete TPA:', error);
        return NextResponse.json({ error: 'Failed to delete TPA' }, { status: 500 });
    }
}
