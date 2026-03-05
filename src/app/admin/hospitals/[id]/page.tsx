'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { StarIcon, DoctorIcon, ClipboardIcon, BedSolidIcon } from '@/components/ui/icons';

interface Hospital {
    id: number;
    slug: string;
    name: string;
    hospitalType: string;
    description?: string;
    tagline?: string;
    logo?: string;
    coverImage?: string;
    images: string[];
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    phone?: string;
    emergencyPhone?: string;
    email?: string;
    website?: string;
    bedCount?: number;
    icuBeds?: number;
    operationTheaters?: number;
    emergencyBeds?: number;
    accreditations: string[];
    isVerified: boolean;
    isActive: boolean;
    rating?: number;
    stats: {
        avgRating: string;
        reviewCount: number;
        pendingEnquiries: number;
        activeDoctors: number;
    };
    specialties: Array<{
        id: number;
        specialty: string;
        isCenter: boolean;
    }>;
    departments: Array<{
        id: number;
        name: string;
    }>;
    doctors: Array<{
        id: number;
        name: string;
        designation?: string;
        specialty?: string;
        isTopDoctor: boolean;
    }>;
    reviews: Array<{
        id: number;
        reviewerName: string;
        rating: number;
        title?: string;
        review?: string;
        createdAt: string;
    }>;
    enquiries: Array<{
        id: string;
        patientName: string;
        patientPhone: string;
        status: string;
        createdAt: string;
    }>;
    insuranceTies: Array<{
        insurer: {
            id: number;
            name: string;
            logo?: string;
        };
        isCashless: boolean;
    }>;
}

export default function HospitalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'reviews' | 'enquiries' | 'insurance'>('overview');

    useEffect(() => {
        fetchHospital();
    }, [params.id]);

    const fetchHospital = async () => {
        try {
            const res = await fetch(`/api/admin/hospitals/${params.id}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setHospital(data);
            }
        } catch (error) {
            console.error('Failed to fetch hospital:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!hospital) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/hospitals/${hospital.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: !hospital.isVerified }),
                credentials: 'include',
            });
            if (res.ok) {
                setHospital({ ...hospital, isVerified: !hospital.isVerified });
            }
        } catch (error) {
            console.error('Failed to update hospital:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        if (!hospital) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/hospitals/${hospital.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !hospital.isActive }),
                credentials: 'include',
            });
            if (res.ok) {
                setHospital({ ...hospital, isActive: !hospital.isActive });
            }
        } catch (error) {
            console.error('Failed to update hospital:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Hospital not found</p>
                <Link href="/admin/hospitals" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
                    Back to Hospitals
                </Link>
            </div>
        );
    }

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
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Link href="/admin/hospitals" className="mt-1 text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex items-center gap-4">
                        {hospital.logo ? (
                            <img src={hospital.logo} alt={hospital.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                        ) : (
                            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center text-2xl font-bold text-teal-600">
                                {hospital.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{hospital.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                    {hospitalTypeLabels[hospital.hospitalType] || hospital.hospitalType}
                                </span>
                                {hospital.isVerified && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Verified
                                    </span>
                                )}
                                {!hospital.isActive && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {hospital.city}{hospital.state && `, ${hospital.state}`}{hospital.country && `, ${hospital.country}`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            localStorage.setItem('admin_impersonating', 'true');
                            localStorage.setItem('admin_original_session', localStorage.getItem('admin_session') || '');
                            localStorage.setItem('provider_hospital_id', hospital.id.toString());
                            localStorage.setItem('provider_session', JSON.stringify({ hospitalId: hospital.id, impersonated: true }));
                            window.open('/provider/hospital/dashboard', '_blank');
                        }}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Impersonate
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            hospital.isVerified
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {hospital.isVerified ? 'Remove Verification' : 'Verify Hospital'}
                    </button>
                    <button
                        onClick={handleToggleActive}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            hospital.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                    >
                        {hospital.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                        href={`/hospitals/${hospital.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Site
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                        <StarIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{hospital.stats.avgRating}</div>
                    <div className="text-xs text-slate-500">
                        Rating <span className="text-slate-400 ml-1">({hospital.stats.reviewCount} reviews)</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
                        <DoctorIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{hospital.stats.activeDoctors}</div>
                    <div className="text-xs text-slate-500">Active Doctors</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <ClipboardIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{hospital.stats.pendingEnquiries}</div>
                    <div className="text-xs text-slate-500">Pending Enquiries</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <BedSolidIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{hospital.bedCount || 'N/A'}</div>
                    <div className="text-xs text-slate-500">Bed Count</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-6">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'doctors', label: `Doctors (${hospital.doctors.length})` },
                        { key: 'reviews', label: `Reviews (${hospital.reviews.length})` },
                        { key: 'enquiries', label: `Enquiries (${hospital.enquiries.length})` },
                        { key: 'insurance', label: `Insurance (${hospital.insuranceTies.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-teal-600 text-teal-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Details */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Hospital Details</h3>
                        <dl className="space-y-3 text-sm">
                            {hospital.description && (
                                <div>
                                    <dt className="text-slate-500">Description</dt>
                                    <dd className="text-slate-900 mt-1">{hospital.description}</dd>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-slate-500">Address</dt>
                                    <dd className="text-slate-900">{hospital.address || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Pincode</dt>
                                    <dd className="text-slate-900">{hospital.pincode || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Phone</dt>
                                    <dd className="text-slate-900">{hospital.phone || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Emergency</dt>
                                    <dd className="text-slate-900">{hospital.emergencyPhone || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Email</dt>
                                    <dd className="text-slate-900">{hospital.email || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Website</dt>
                                    <dd className="text-slate-900">
                                        {hospital.website ? (
                                            <a href={hospital.website} target="_blank" rel="noopener" className="text-teal-600 hover:underline">
                                                {hospital.website}
                                            </a>
                                        ) : '-'}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </div>

                    {/* Infrastructure */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Infrastructure</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-slate-500">Total Beds</div>
                                <div className="text-xl font-bold text-slate-900">{hospital.bedCount || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-slate-500">ICU Beds</div>
                                <div className="text-xl font-bold text-slate-900">{hospital.icuBeds || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-slate-500">Operation Theaters</div>
                                <div className="text-xl font-bold text-slate-900">{hospital.operationTheaters || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-slate-500">Emergency Beds</div>
                                <div className="text-xl font-bold text-slate-900">{hospital.emergencyBeds || '-'}</div>
                            </div>
                        </div>
                        {hospital.accreditations.length > 0 && (
                            <div className="mt-4">
                                <div className="text-sm text-slate-500 mb-2">Accreditations</div>
                                <div className="flex flex-wrap gap-2">
                                    {hospital.accreditations.map((acc) => (
                                        <span key={acc} className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                                            {acc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Specialties */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Specialties</h3>
                        {hospital.specialties.length > 0 ? (
                            <div className="space-y-2">
                                {hospital.specialties.map((spec) => (
                                    <div key={spec.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                        <span className="text-sm text-slate-900">{spec.specialty}</span>
                                        {spec.isCenter && (
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                                Center of Excellence
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No specialties added</p>
                        )}
                    </div>

                    {/* Departments */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Departments</h3>
                        {hospital.departments.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {hospital.departments.map((dept) => (
                                    <span key={dept.id} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                                        {dept.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No departments added</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'doctors' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {hospital.doctors.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {hospital.doctors.map((doctor) => (
                                <div key={doctor.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                                            {doctor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{doctor.name}</div>
                                            <div className="text-xs text-slate-500">
                                                {doctor.designation || doctor.specialty || 'No designation'}
                                            </div>
                                        </div>
                                    </div>
                                    {doctor.isTopDoctor && (
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                            Top Doctor
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No doctors added to this hospital</div>
                    )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    {hospital.reviews.length > 0 ? (
                        hospital.reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900">{review.reviewerName}</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.title && <div className="font-medium text-slate-800 mt-2">{review.title}</div>}
                                {review.review && <p className="text-sm text-slate-600 mt-1">{review.review}</p>}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                            No reviews yet
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'enquiries' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {hospital.enquiries.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {hospital.enquiries.map((enquiry) => (
                                <div key={enquiry.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div>
                                        <div className="font-medium text-slate-900">{enquiry.patientName}</div>
                                        <div className="text-xs text-slate-500">{enquiry.patientPhone}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            enquiry.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                            enquiry.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                                            enquiry.status === 'converted' ? 'bg-green-100 text-green-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {enquiry.status}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(enquiry.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No enquiries received</div>
                    )}
                </div>
            )}

            {activeTab === 'insurance' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {hospital.insuranceTies.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {hospital.insuranceTies.map((tie, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        {tie.insurer.logo ? (
                                            <img src={tie.insurer.logo} alt={tie.insurer.name} className="w-10 h-10 rounded object-contain" />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-500 font-medium">
                                                {tie.insurer.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="font-medium text-slate-900">{tie.insurer.name}</div>
                                    </div>
                                    {tie.isCashless && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                            Cashless
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No insurance tie-ups</div>
                    )}
                </div>
            )}
        </div>
    );
}
