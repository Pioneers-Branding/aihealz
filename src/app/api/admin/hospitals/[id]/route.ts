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
    const hospitalId = parseInt(id);

    if (isNaN(hospitalId)) {
        return NextResponse.json({ error: 'Invalid hospital ID' }, { status: 400 });
    }

    try {
        const hospital = await prisma.hospital.findUnique({
            where: { id: hospitalId },
            include: {
                geography: true,
                specialties: {
                    orderBy: { displayOrder: 'asc' },
                },
                departments: {
                    orderBy: { displayOrder: 'asc' },
                },
                doctors: {
                    where: { isActive: true },
                    orderBy: { isTopDoctor: 'desc' },
                    take: 20,
                },
                reviews: {
                    where: { isVisible: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                enquiries: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                insuranceTies: {
                    where: { isActive: true },
                    include: {
                        insurer: {
                            select: { id: true, name: true, logo: true },
                        },
                    },
                },
            },
        });

        if (!hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        // Get stats
        const stats = await Promise.all([
            prisma.hospitalReview.aggregate({
                where: { hospitalId, isVisible: true },
                _avg: { rating: true },
                _count: true,
            }),
            prisma.hospitalEnquiry.count({
                where: { hospitalId, status: 'new' },
            }),
            prisma.hospitalDoctor.count({
                where: { hospitalId, isActive: true },
            }),
        ]);

        return NextResponse.json({
            ...hospital,
            stats: {
                avgRating: Number(stats[0]._avg.rating || 0).toFixed(1),
                reviewCount: stats[0]._count,
                pendingEnquiries: stats[1],
                activeDoctors: stats[2],
            },
        });
    } catch (error) {
        console.error('Failed to fetch hospital:', error);
        return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const { id } = await params;
    const hospitalId = parseInt(id);

    if (isNaN(hospitalId)) {
        return NextResponse.json({ error: 'Invalid hospital ID' }, { status: 400 });
    }

    try {
        const data = await req.json();

        // Remove id from update data if present
        delete data.id;
        delete data.createdAt;

        const hospital = await prisma.hospital.update({
            where: { id: hospitalId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(hospital);
    } catch (error) {
        console.error('Failed to update hospital:', error);
        return NextResponse.json({ error: 'Failed to update hospital' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const { id } = await params;
    const hospitalId = parseInt(id);

    if (isNaN(hospitalId)) {
        return NextResponse.json({ error: 'Invalid hospital ID' }, { status: 400 });
    }

    try {
        // Soft delete by setting isActive to false
        await prisma.hospital.update({
            where: { id: hospitalId },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete hospital:', error);
        return NextResponse.json({ error: 'Failed to delete hospital' }, { status: 500 });
    }
}
