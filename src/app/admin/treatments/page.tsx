import prisma from '@/lib/db';

export default async function AdminTreatmentsPage() {
    const specialties = await prisma.medicalCondition.groupBy({
        by: ['specialistType'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Treatments</h1>
                <p className="text-slate-500 mt-1">Manage treatment categories and procedures.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left p-4 font-bold text-slate-700">Specialty</th>
                            <th className="text-left p-4 font-bold text-slate-700">Conditions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specialties.map((s, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-900">{s.specialistType || 'Unknown'}</td>
                                <td className="p-4 text-slate-600">{s._count.id.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
