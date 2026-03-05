import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// In-memory storage for navigation (in production, use database)
let navigationItems = [
    { id: '1', label: 'Conditions', path: '/conditions', isMega: true, isActive: true, order: 1 },
    { id: '2', label: 'Treatments', path: '/treatments', isMega: true, isActive: true, order: 2 },
    { id: '3', label: 'Find Doctors', path: '/doctors', isMega: false, isActive: true, order: 3 },
    { id: '4', label: 'AI Remedies', path: '/remedies', isMega: false, isActive: true, order: 4 },
    { id: '5', label: 'Health Tools', path: '/tools', isMega: true, isActive: true, order: 5 },
    { id: '6', label: 'Symptom Checker', path: '/symptoms', isMega: false, isActive: true, order: 6 },
];

export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    return NextResponse.json({ items: navigationItems });
}

export async function POST(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const body = await req.json();
        const { items } = body;

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Items must be an array' }, { status: 400 });
        }

        // Validate items
        for (const item of items) {
            if (!item.label || !item.path) {
                return NextResponse.json({ error: 'Each item must have label and path' }, { status: 400 });
            }
        }

        // Update navigation
        navigationItems = items.map((item, index) => ({
            id: item.id || `nav-${Date.now()}-${index}`,
            label: item.label,
            path: item.path,
            isMega: item.isMega || false,
            isActive: item.isActive ?? true,
            order: item.order || index + 1,
        }));

        return NextResponse.json({ success: true, items: navigationItems });
    } catch (error) {
        console.error('Failed to save navigation:', error);
        return NextResponse.json({ error: 'Failed to save navigation' }, { status: 500 });
    }
}
