import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * CMS: Verification Queue
 *
 * GET /api/admin/verification-queue — List pending/inconclusive verifications
 * PUT /api/admin/verification-queue — Approve or reject a verification
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const status = searchParams.get('status') || 'pending';

        const verifications = await prisma.licenseVerification.findMany({
            where: { status: status as 'pending' | 'verified' | 'rejected' | 'inconclusive' },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                doctor: {
                    select: { id: true, name: true, slug: true, qualifications: true, profileImage: true },
                },
            },
        });

        return NextResponse.json({
            verifications: verifications.map((v) => ({
                id: v.id,
                doctor: v.doctor,
                registryType: v.registryType,
                licenseNumber: v.licenseNumber,
                countryCode: v.countryCode,
                status: v.status,
                verifiedName: v.verifiedName,
                verifiedSpecialty: v.verifiedSpecialty,
                matchConfidence: v.matchConfidence ? Number(v.matchConfidence) : null,
                apiResponse: v.apiResponse,
                createdAt: v.createdAt,
            })),
            total: verifications.length,
        });
    } catch (error) {
        console.error('Verification queue fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch verifications', verifications: [] }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, action, reviewedBy, reviewNotes, rejectionReason } = body;

        if (!id || !action) {
            return NextResponse.json({ error: 'id and action required' }, { status: 400 });
        }

        const verification = await prisma.licenseVerification.findUnique({
            where: { id },
        });
        if (!verification) {
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
        }

        if (action === 'approve') {
            await prisma.licenseVerification.update({
                where: { id },
                data: {
                    status: 'verified',
                    reviewedBy: reviewedBy || 'admin',
                    reviewedAt: new Date(),
                    reviewNotes,
                    verifiedAt: new Date(),
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            });

            await prisma.doctorProvider.update({
                where: { id: verification.doctorId },
                data: { isVerified: true, verificationDate: new Date() },
            });
        } else if (action === 'reject') {
            await prisma.licenseVerification.update({
                where: { id },
                data: {
                    status: 'rejected',
                    reviewedBy: reviewedBy || 'admin',
                    reviewedAt: new Date(),
                    reviewNotes,
                    rejectionReason,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verification queue error:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
