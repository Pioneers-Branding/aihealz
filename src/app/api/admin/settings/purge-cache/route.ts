import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST() {
    try {
        // Delete all entries from translation cache
        const result = await prisma.translationCache.deleteMany({});

        console.log('[Cache Purge]', {
            deletedCount: result.count,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: `Cleared ${result.count} cached translations`,
            deletedCount: result.count,
        });

    } catch (error) {
        console.error('Cache purge error:', error);
        return NextResponse.json(
            { error: 'Failed to clear cache' },
            { status: 500 }
        );
    }
}
