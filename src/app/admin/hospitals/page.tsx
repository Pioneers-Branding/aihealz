import prisma from '@/lib/db';
import Link from 'next/link';
import { HospitalIcon, CheckIcon, BedIcon, ClipboardIcon } from '@/components/ui/icons';

export default async function HospitalsAdminPage() {
    const [hospitals, stats] = await Promise.all([
        prisma.hospital.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                geography: {
                    select: { name: true },
                },
                _count: {
                    select: {
                        doctors: true,
                        reviews: true,
                        enquiries: true,
                        specialties: true,
                        insuranceTies: true,
                    },
                },
            },
        }),
        Promise.all([
            prisma.hospital.count(),
            prisma.hospital.count({ where: { isVerified: true } }),
            prisma.hospital.count({ where: { isActive: true } }),
            prisma.hospital.aggregate({ _avg: { bedCount: true } }),
            prisma.hospitalEnquiry.count({ where: { status: 'new' } }),
        ]),
    ]);

    const [totalCount, verifiedCount, activeCount, avgBeds, pendingEnquiries] = stats;

    const hospitalTypeLabels: Record<string, string> = {
        government: 'Government',
        private: 'Private',
        public_private_partnership: 'PPP',
        charitable: 'Charitable',
        trust: 'Trust',
        corporate_chain: 'Corporate Chain',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Hospital Management
                    </h1>
                    <p className="text-slate-500 mt-1">Manage hospital profiles, reviews, and enquiries</p>
                </div>
                <Link
                    href="/admin/hospitals/new"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Hospital
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <HospitalIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalCount.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Total Hospitals</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{verifiedCount.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Verified</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{activeCount.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Active</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BedIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{Math.round(avgBeds._avg.bedCount || 0).toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Avg. Beds</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <ClipboardIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{pendingEnquiries.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Pending Enquiries</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search hospitals..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="">All Types</option>
                        <option value="government">Government</option>
                        <option value="private">Private</option>
                        <option value="corporate_chain">Corporate Chain</option>
                        <option value="charitable">Charitable</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="">All Cities</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Chennai">Chennai</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="">Verification Status</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                </div>
            </div>

            {/* Hospitals Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {hospitals.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div className="text-slate-500 mb-4">No hospitals added yet</div>
                        <Link
                            href="/admin/hospitals/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                            Add First Hospital
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Beds</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctors</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reviews</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Insurance</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {hospitals.map((hospital) => (
                                    <tr key={hospital.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                {hospital.logo ? (
                                                    <img
                                                        src={hospital.logo}
                                                        alt={hospital.name}
                                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold">
                                                        {hospital.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <Link href={`/admin/hospitals/${hospital.id}`} className="font-medium text-slate-900 hover:text-teal-600">
                                                        {hospital.name}
                                                    </Link>
                                                    <div className="text-xs text-slate-500">/{hospital.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                                {hospitalTypeLabels[hospital.hospitalType] || hospital.hospitalType}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-600">
                                            {hospital.city || hospital.geography?.name || '-'}
                                            {hospital.state && <span className="text-slate-400">, {hospital.state}</span>}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {hospital.bedCount || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {hospital._count.doctors}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {hospital.overallRating && (
                                                    <>
                                                        <span className="text-amber-500">★</span>
                                                        <span className="text-sm font-medium">{Number(hospital.overallRating).toFixed(1)}</span>
                                                    </>
                                                )}
                                                <span className="text-xs text-slate-400">({hospital._count.reviews})</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {hospital._count.insuranceTies}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {hospital.isVerified && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                        Verified
                                                    </span>
                                                )}
                                                {!hospital.isActive && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                                        Inactive
                                                    </span>
                                                )}
                                                {hospital.isActive && !hospital.isVerified && (
                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/hospitals/${hospital.slug}`}
                                                    target="_blank"
                                                    className="text-slate-400 hover:text-slate-600"
                                                    title="View on site"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/admin/hospitals/${hospital.id}`}
                                                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                                                >
                                                    Manage
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Accreditation Legend */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium text-slate-700 mb-3">Common Accreditations</h3>
                <div className="flex flex-wrap gap-2">
                    {['NABH', 'JCI', 'NABL', 'ISO 9001', 'ISO 14001', 'Green OT'].map((acc) => (
                        <span key={acc} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600">
                            {acc}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
