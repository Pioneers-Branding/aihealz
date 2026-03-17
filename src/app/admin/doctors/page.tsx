import prisma from '@/lib/db';
import Link from 'next/link';
import DoctorsTable from './DoctorsTable';

async function getDoctors() {
    const doctors = await prisma.doctorProvider.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            geography: {
                select: { name: true, slug: true }
            },
            _count: {
                select: {
                    specialties: true,
                    leadLogs: true,
                }
            }
        }
    });
    return doctors;
}

export default async function DoctorsPage() {
    const doctors = await getDoctors();

    // Serialize doctors for client component - convert Decimal/BigInt to safe types
    const serializedDoctors = doctors.map(doctor => ({
        ...doctor,
        // Convert Decimal fields to numbers (or null)
        rating: doctor.rating ? parseFloat(doctor.rating.toString()) : null,
        consultationFee: doctor.consultationFee ? parseFloat(doctor.consultationFee.toString()) : null,
        badgeScore: doctor.badgeScore ? parseFloat(doctor.badgeScore.toString()) : null,
        // Normalize contactInfo from JsonValue
        contactInfo: (doctor.contactInfo && typeof doctor.contactInfo === 'object' && !Array.isArray(doctor.contactInfo))
            ? (doctor.contactInfo as { email?: string; phone?: string; address?: string })
            : null,
        // Convert Date objects to ISO strings for safe serialization
        createdAt: doctor.createdAt.toISOString(),
        updatedAt: doctor.updatedAt.toISOString(),
        verificationDate: doctor.verificationDate?.toISOString() || null,
        badgeUpdated: doctor.badgeUpdated?.toISOString() || null,
    }));

    const stats = {
        total: doctors.length,
        verified: doctors.filter(d => d.isVerified).length,
        premium: doctors.filter(d => d.subscriptionTier === 'premium' || d.subscriptionTier === 'enterprise').length,
        totalLeads: doctors.reduce((acc, d) => acc + d._count.leadLogs, 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Doctor Profiles</h1>
                    <p className="text-slate-500 mt-1">Manage healthcare providers in the network</p>
                </div>
                <Link
                    href="/admin/doctors/new"
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    Add Doctor
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total Doctors</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                    <div className="text-sm text-slate-500">Verified</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-purple-600">{stats.premium}</div>
                    <div className="text-sm text-slate-500">Premium/Enterprise</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalLeads}</div>
                    <div className="text-sm text-slate-500">Total Leads</div>
                </div>
            </div>

            {/* Table */}
            <DoctorsTable doctors={serializedDoctors} />
        </div>
    );
}
