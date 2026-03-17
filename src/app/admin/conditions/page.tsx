import prisma from '@/lib/db';
import Link from 'next/link';
import ConditionsTable from './ConditionsTable';

async function getStats() {
    const [total, activeCount, contentCount, specialtyBreakdown] = await Promise.all([
        prisma.medicalCondition.count(),
        prisma.medicalCondition.count({ where: { isActive: true } }),
        prisma.localizedContent.count(),
        prisma.medicalCondition.groupBy({
            by: ['specialistType'],
            _count: { _all: true },
            orderBy: { _count: { specialistType: 'desc' } },
        }),
    ]);

    const specialties = specialtyBreakdown.map(s => s.specialistType).sort();

    return { total, activeCount, contentCount, specialties, specialtyCount: specialtyBreakdown.length };
}

export default async function ConditionsPage() {
    const { total, activeCount, contentCount, specialties, specialtyCount } = await getStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Medical Conditions</h1>
                    <p className="text-slate-500 mt-1">Manage all medical conditions in the system</p>
                </div>
                <Link
                    href="/admin/conditions/new"
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    Add Condition
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">Total Conditions</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-green-600">{activeCount.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">Active</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-400">{(total - activeCount).toLocaleString()}</div>
                    <div className="text-sm text-slate-500">Inactive</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-blue-600">{contentCount.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">Content Pages</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-purple-600">{specialtyCount}</div>
                    <div className="text-sm text-slate-500">Specialties</div>
                </div>
            </div>

            {/* Table (fetches its own data via API) */}
            <ConditionsTable specialties={specialties} />
        </div>
    );
}
