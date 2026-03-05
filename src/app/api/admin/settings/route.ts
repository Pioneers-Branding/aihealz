import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const featureSettingSchema = z.object({
    key: z.string().min(1).max(100),
    enabled: z.boolean(),
    description: z.string().max(500).optional(),
});

const updateSettingsSchema = z.object({
    features: z.array(featureSettingSchema),
});

const genericSettingSchema = z.object({
    key: z.string().min(1).max(100),
    value: z.unknown(),
    category: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
});

/**
 * GET /api/admin/settings
 * Retrieve all platform settings
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const publicOnly = searchParams.get('public') === 'true';

        // Build query filter
        const where: { category?: string; isPublic?: boolean } = {};
        if (category) where.category = category;
        if (publicOnly) where.isPublic = true;

        const settings = await prisma.platformSetting.findMany({
            where,
            orderBy: [{ category: 'asc' }, { key: 'asc' }],
        });

        // Group settings by category for easier frontend consumption
        const grouped = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push({
                key: setting.key,
                value: setting.value,
                description: setting.description,
                isPublic: setting.isPublic,
                updatedAt: setting.updatedAt,
            });
            return acc;
        }, {} as Record<string, Array<{ key: string; value: unknown; description: string | null; isPublic: boolean; updatedAt: Date }>>);

        // Also return flat features array for backward compatibility
        const featureSettings = settings
            .filter(s => s.category === 'features')
            .map(s => ({
                key: s.key,
                enabled: (s.value as { enabled?: boolean })?.enabled ?? false,
            }));

        return NextResponse.json({
            features: featureSettings.length > 0 ? featureSettings : getDefaultFeatures(),
            settings: grouped,
            total: settings.length,
        });

    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/settings
 * Update feature toggles (backward compatible)
 */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = updateSettingsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request body', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { features } = validation.data;

        // Upsert each feature setting
        const operations = features.map(feature =>
            prisma.platformSetting.upsert({
                where: { key: feature.key },
                create: {
                    key: feature.key,
                    value: { enabled: feature.enabled },
                    category: 'features',
                    description: feature.description || `Feature toggle: ${feature.key}`,
                    isPublic: false,
                },
                update: {
                    value: { enabled: feature.enabled },
                    description: feature.description,
                    updatedAt: new Date(),
                },
            })
        );

        await prisma.$transaction(operations);

        console.log('[Settings Update]', {
            featuresUpdated: features.length,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Settings saved successfully',
            updated: features.length,
        });

    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/settings
 * Create or update a single setting (for more complex settings)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = genericSettingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request body', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { key, value, category, description, isPublic } = validation.data;

        const setting = await prisma.platformSetting.upsert({
            where: { key },
            create: {
                key,
                value: value as object,
                category,
                description,
                isPublic: isPublic ?? false,
            },
            update: {
                value: value as object,
                category,
                description,
                isPublic: isPublic ?? false,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            setting: {
                key: setting.key,
                value: setting.value,
                category: setting.category,
                updatedAt: setting.updatedAt,
            },
        });

    } catch (error) {
        console.error('Setting create/update error:', error);
        return NextResponse.json(
            { error: 'Failed to save setting' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/settings?key=xxx
 * Delete a setting
 */
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json(
                { error: 'Setting key is required' },
                { status: 400 }
            );
        }

        await prisma.platformSetting.delete({
            where: { key },
        });

        return NextResponse.json({
            success: true,
            message: `Setting '${key}' deleted`,
        });

    } catch (error) {
        console.error('Setting delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete setting' },
            { status: 500 }
        );
    }
}

/**
 * Default features when none exist in database
 */
function getDefaultFeatures() {
    return [
        { key: 'symptom_checker', enabled: true },
        { key: 'patient_vault', enabled: false },
        { key: 'stripe_payments', enabled: true },
        { key: 'teleconsultation', enabled: false },
        { key: 'ai_diagnosis', enabled: true },
        { key: 'medical_travel', enabled: true },
        { key: 'lab_booking', enabled: true },
        { key: 'doctor_verification', enabled: true },
    ];
}
