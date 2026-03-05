import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get a single lead
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const lead = await prisma.leadLog.findUnique({
            where: { id },
            include: {
                doctor: true,
                geography: true,
                analysis: true,
                leadCredits: true,
                teleconsultations: true,
            }
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ lead });
    } catch (error) {
        console.error('Failed to fetch lead:', error);
        return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
    }
}

// PATCH - Update a lead
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Whitelist allowed fields for PATCH updates
        const allowedFields = [
            'isViewed', 'viewedAt', 'isContacted', 'contactedAt',
            'contactRevealed', 'outcome', 'outcomeNotes', 'intentLevel'
        ] as const;
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                // Convert date strings to Date objects
                if ((field === 'viewedAt' || field === 'contactedAt') && body[field]) {
                    updateData[field] = new Date(body[field]);
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update. Allowed: ' + allowedFields.join(', ') },
                { status: 400 }
            );
        }

        const lead = await prisma.leadLog.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ lead });
    } catch (error) {
        console.error('Failed to update lead:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}

// DELETE - Delete a lead
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await prisma.leadLog.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete lead:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
