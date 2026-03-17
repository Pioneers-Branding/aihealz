import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    // Verify admin authentication - this route performs destructive operations
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();
    try {
        const indias = await prisma.geography.findMany({ where: { slug: 'india' } });
        let deletedIndiaId: number | null = null;
        if (indias.length > 1) {
            deletedIndiaId = indias[1].id;
            await prisma.geography.delete({ where: { id: indias[1].id } });
        }

        // Get treatments
        const conditions = await prisma.medicalCondition.findMany({
            where: { isActive: true },
            select: { treatments: true, specialistType: true }
        });

        const allTreatments = new Set<string>();
        for (const c of conditions) {
            if (Array.isArray(c.treatments)) {
                c.treatments.forEach((t: unknown) => {
                    if (typeof t === 'object' && t !== null && 'name' in t && typeof (t as { name: unknown }).name === 'string') {
                        allTreatments.add((t as { name: string }).name);
                    } else if (typeof t === 'string') {
                        allTreatments.add(t);
                    }
                });
            }
        }

        const uniqueTreatments = Array.from(allTreatments).map(t => ({
            name: t,
            // default categorization since we don't have types in strings
            type: 'medical',
            specialty: 'General'
        }));

        // Write to public
        const dir = path.join(process.cwd(), 'public', 'data');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, 'treatments.json'), JSON.stringify(uniqueTreatments, null, 2));

        return NextResponse.json({
            success: true,
            deletedIndiaId,
            treatmentsExtracted: uniqueTreatments.length
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
