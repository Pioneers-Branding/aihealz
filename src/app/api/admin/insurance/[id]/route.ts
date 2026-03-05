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
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
        return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    try {
        const provider = await prisma.insuranceProvider.findUnique({
            where: { id: providerId },
            include: {
                plans: {
                    where: { isActive: true },
                    orderBy: { premiumStartsAt: 'asc' },
                },
                hospitalTies: {
                    where: { isActive: true },
                    include: {
                        hospital: {
                            select: { id: true, name: true, city: true, logo: true },
                        },
                    },
                    take: 20,
                },
                tpaAssociations: {
                    where: { isActive: true },
                    include: {
                        tpa: {
                            select: { id: true, name: true, logo: true },
                        },
                    },
                },
                claims: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!provider) {
            return NextResponse.json({ error: 'Insurance provider not found' }, { status: 404 });
        }

        // Get stats
        const stats = await Promise.all([
            prisma.insuranceClaim.aggregate({
                where: { insurerId: providerId },
                _count: true,
                _sum: { claimAmount: true, approvedAmount: true },
            }),
            prisma.hospitalInsuranceTie.count({
                where: { insurerId: providerId, isActive: true },
            }),
            prisma.insurancePlan.count({
                where: { providerId: providerId, isActive: true },
            }),
        ]);

        return NextResponse.json({
            ...provider,
            stats: {
                totalClaims: stats[0]._count,
                totalClaimAmount: Number(stats[0]._sum.claimAmount || 0),
                totalApprovedAmount: Number(stats[0]._sum.approvedAmount || 0),
                networkHospitals: stats[1],
                activePlans: stats[2],
            },
        });
    } catch (error) {
        console.error('Failed to fetch insurance provider:', error);
        return NextResponse.json({ error: 'Failed to fetch insurance provider' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const { id } = await params;
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
        return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    try {
        const data = await req.json();

        // Remove id from update data if present
        delete data.id;
        delete data.createdAt;

        const provider = await prisma.insuranceProvider.update({
            where: { id: providerId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(provider);
    } catch (error) {
        console.error('Failed to update insurance provider:', error);
        return NextResponse.json({ error: 'Failed to update insurance provider' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const { id } = await params;
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
        return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    try {
        // Soft delete by setting isActive to false
        await prisma.insuranceProvider.update({
            where: { id: providerId },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete insurance provider:', error);
        return NextResponse.json({ error: 'Failed to delete insurance provider' }, { status: 500 });
    }
}
