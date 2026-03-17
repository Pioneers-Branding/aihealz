import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import crypto from 'crypto';

/**
 * POST /api/admin/impersonate
 *
 * Creates a valid provider session for admin impersonation.
 * This allows admins to access the provider dashboard without knowing doctor credentials.
 *
 * Requires admin authentication.
 */
export async function POST(request: NextRequest) {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.authenticated) {
        return NextResponse.json(
            { error: 'Admin authentication required' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { doctorId } = body;

        if (!doctorId) {
            return NextResponse.json(
                { error: 'doctorId is required' },
                { status: 400 }
            );
        }

        const id = parseInt(doctorId, 10);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid doctorId' },
                { status: 400 }
            );
        }

        // Verify doctor exists
        const doctor = await prisma.doctorProvider.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                contactInfo: true,
            },
        });

        if (!doctor) {
            return NextResponse.json(
                { error: 'Doctor not found' },
                { status: 404 }
            );
        }

        // Generate secure session token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours for impersonation

        // Create or update session in database
        await prisma.$executeRaw`
            INSERT INTO provider_sessions (doctor_id, token_hash, expires_at, created_at)
            VALUES (${id}, ${tokenHash}, ${expiresAt}, NOW())
            ON CONFLICT (doctor_id) DO UPDATE SET token_hash = ${tokenHash}, expires_at = ${expiresAt}
        `;

        // Extract email from contactInfo
        const contactInfo = doctor.contactInfo as { email?: string } | null;
        const email = contactInfo?.email || 'admin@impersonate.local';

        return NextResponse.json({
            success: true,
            session: {
                doctorId: String(doctor.id),
                doctorName: doctor.name,
                email,
                token,
                expiresAt: expiresAt.getTime(),
                impersonated: true,
            },
        });
    } catch (error: unknown) {
        console.error('Impersonate error:', error);
        return NextResponse.json(
            { error: 'Failed to create impersonation session' },
            { status: 500 }
        );
    }
}
