import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LeadDetails from './LeadDetails';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getLead(id: string) {
    const lead = await prisma.leadLog.findUnique({
        where: { id },
        include: {
            doctor: {
                include: {
                    geography: true,
                }
            },
            geography: true,
            analysis: true,
            leadCredits: {
                orderBy: { createdAt: 'desc' }
            },
            teleconsultations: {
                orderBy: { scheduledAt: 'desc' }
            },
        }
    });

    return lead;
}

export default async function LeadDetailPage({ params }: PageProps) {
    const { id } = await params;
    const lead = await getLead(id);

    if (!lead) {
        notFound();
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/admin/leads" className="hover:text-teal-600">Leads</Link>
                        <span>/</span>
                        <span>Lead Details</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Lead Details</h1>
                </div>
            </div>

            {/* Content */}
            <LeadDetails lead={lead} />
        </div>
    );
}
