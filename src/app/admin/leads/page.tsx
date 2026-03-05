import prisma from '@/lib/db';
import LeadsTable from './LeadsTable';

async function getLeads() {
    const leads = await prisma.leadLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        include: {
            doctor: {
                select: { id: true, name: true, slug: true }
            },
            geography: {
                select: { id: true, name: true, slug: true }
            },
        }
    });
    return leads;
}

async function getStats() {
    const [total, high, medium, low, viewed, contacted] = await Promise.all([
        prisma.leadLog.count(),
        prisma.leadLog.count({ where: { intentLevel: 'high' } }),
        prisma.leadLog.count({ where: { intentLevel: 'medium' } }),
        prisma.leadLog.count({ where: { intentLevel: 'low' } }),
        prisma.leadLog.count({ where: { isViewed: true } }),
        prisma.leadLog.count({ where: { isContacted: true } }),
    ]);

    return { total, high, medium, low, viewed, contacted };
}

export default async function LeadsPage() {
    const [leads, stats] = await Promise.all([getLeads(), getStats()]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Lead Management</h1>
                <p className="text-slate-500 mt-1">Track and manage patient enquiry leads</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total Leads</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-red-600">{stats.high}</div>
                    <div className="text-sm text-slate-500">High Intent</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-amber-600">{stats.medium}</div>
                    <div className="text-sm text-slate-500">Medium Intent</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-600">{stats.low}</div>
                    <div className="text-sm text-slate-500">Low Intent</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.viewed}</div>
                    <div className="text-sm text-slate-500">Viewed</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-green-600">{stats.contacted}</div>
                    <div className="text-sm text-slate-500">Contacted</div>
                </div>
            </div>

            {/* Table */}
            <LeadsTable leads={leads} />
        </div>
    );
}
