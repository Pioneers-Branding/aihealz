import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const { slug } = await context.params;

        const hospital = await prisma.hospital.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                city: true,
                state: true,
            },
        });

        if (!hospital) {
            return NextResponse.json(
                { error: 'Hospital not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(hospital);
    } catch (error) {
        console.error('Hospital fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hospital info' },
            { status: 500 }
        );
    }
}
