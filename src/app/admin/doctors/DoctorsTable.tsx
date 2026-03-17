"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/confirm-modal';

interface ContactInfo {
    email?: string;
    phone?: string;
    address?: string;
}

interface Doctor {
    id: number;
    slug: string;
    name: string;
    contactInfo: ContactInfo | null;
    qualifications: string[];
    experienceYears: number | null;
    consultationFee: number | null;
    rating: number | null;
    badgeScore: number | null;
    isVerified: boolean;
    subscriptionTier: string;
    availableOnline: boolean;
    createdAt: string; // ISO string
    geography: { name: string; slug: string } | null;
    _count: {
        specialties: number;
        leadLogs: number;
    };
}

interface DoctorsTableProps {
    doctors: Doctor[];
}

export default function DoctorsTable({ doctors }: DoctorsTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'premium' | 'test_data'>('all');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; doctorId: number | null; doctorName: string }>({
        isOpen: false,
        doctorId: null,
        doctorName: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Helper to check test data - moved up so it can be used in filter
    const checkTestData = (doctor: Doctor): { isTest: boolean; reasons: string[] } => {
        const reasons: string[] = [];
        const contactInfo = doctor.contactInfo as ContactInfo | null;

        // Check for test email domains
        const testEmailDomains = ['example.com', 'test.com', 'fake.com', 'placeholder.com', 'sample.com'];
        if (contactInfo?.email) {
            const emailDomain = contactInfo.email.split('@')[1]?.toLowerCase();
            if (emailDomain && testEmailDomains.includes(emailDomain)) {
                reasons.push('Test email');
            }
        }

        // Check for implausible experience (> 40 years is suspicious for most doctors)
        if (doctor.experienceYears && doctor.experienceYears > 40) {
            reasons.push(`${doctor.experienceYears}yr exp.`);
        }

        // Check for placeholder names
        const testNamePatterns = ['test doctor', 'sample doctor', 'demo doctor', 'john doe', 'jane doe'];
        if (testNamePatterns.some(p => doctor.name.toLowerCase().includes(p))) {
            reasons.push('Test name');
        }

        // Check for placeholder phone numbers
        if (contactInfo?.phone) {
            const cleanPhone = contactInfo.phone.replace(/\D/g, '');
            if (/^555\d{7}$/.test(cleanPhone) || /1234567890/.test(cleanPhone) || /9876543210/.test(cleanPhone)) {
                reasons.push('Fake phone');
            }
        }

        return { isTest: reasons.length > 0, reasons };
    };

    const filteredDoctors = doctors.filter(doctor => {
        const contactInfo = doctor.contactInfo as ContactInfo | null;
        const matchesSearch =
            doctor.name.toLowerCase().includes(search.toLowerCase()) ||
            contactInfo?.email?.toLowerCase().includes(search.toLowerCase()) ||
            doctor.geography?.name.toLowerCase().includes(search.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'verified') return matchesSearch && doctor.isVerified;
        if (filter === 'unverified') return matchesSearch && !doctor.isVerified;
        if (filter === 'premium') return matchesSearch && (doctor.subscriptionTier === 'premium' || doctor.subscriptionTier === 'enterprise');
        if (filter === 'test_data') return matchesSearch && checkTestData(doctor).isTest;
        return matchesSearch;
    });

    const openDeleteModal = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, doctorId: id, doctorName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.doctorId) return;
        const id = deleteModal.doctorId;
        setDeleteModal({ isOpen: false, doctorId: null, doctorName: '' });

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/doctors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                setErrorMessage(data.error || 'Failed to delete');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch {
            setErrorMessage('Failed to delete doctor');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setDeleting(null);
        }
    };

    const toggleVerified = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/doctors/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: !currentStatus }),
            });
            if (res.ok) {
                router.refresh();
            }
        } catch {
            setErrorMessage('Failed to update verification status');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const getTierBadge = (tier: string) => {
        const badges: Record<string, string> = {
            free: 'bg-slate-100 text-slate-700',
            basic: 'bg-blue-100 text-blue-700',
            premium: 'bg-purple-100 text-purple-700',
            enterprise: 'bg-amber-100 text-amber-700',
        };
        return badges[tier] || badges.free;
    };


    const [impersonating, setImpersonating] = useState<number | null>(null);

    const handleImpersonate = async (doctorId: number) => {
        setImpersonating(doctorId);
        try {
            // Call admin API to create a valid provider session
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrorMessage(data.error || 'Failed to impersonate');
                setTimeout(() => setErrorMessage(null), 3000);
                return;
            }

            const data = await res.json();

            // Store admin session to restore later
            localStorage.setItem('admin_impersonating', 'true');
            localStorage.setItem('admin_original_session', localStorage.getItem('admin_session') || '');

            // Store the valid provider session from the API
            localStorage.setItem('provider_doctor_id', data.session.doctorId);
            localStorage.setItem('provider_session', JSON.stringify(data.session));

            // Redirect to provider dashboard
            window.open('/provider/dashboard', '_blank');
        } catch {
            setErrorMessage('Failed to impersonate doctor');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setImpersonating(null);
        }
    };

    return (
        <>
        <ConfirmModal
            isOpen={deleteModal.isOpen}
            title="Delete Doctor Profile"
            message={`Are you sure you want to delete "${deleteModal.doctorName}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmVariant="danger"
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal({ isOpen: false, doctorId: null, doctorName: '' })}
        />
        {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errorMessage}
            </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search doctors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                    <option value="all">All Doctors</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified</option>
                    <option value="premium">Premium/Enterprise</option>
                    <option value="test_data">Test/Placeholder Data</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Doctor</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Specialties</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Location</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Tier</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Leads</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDoctors.map((doctor) => {
                            const contactInfo = doctor.contactInfo as ContactInfo | null;
                            const testCheck = checkTestData(doctor);
                            return (
                            <tr key={doctor.id} className={`hover:bg-slate-50 ${testCheck.isTest ? 'bg-orange-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900">{doctor.name}</span>
                                            {testCheck.isTest && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded" title={testCheck.reasons.join(', ')}>
                                                    TEST DATA
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-sm ${testCheck.reasons.includes('Test email') ? 'text-orange-600' : 'text-slate-500'}`}>
                                            {contactInfo?.email || 'No email'}
                                        </div>
                                        {doctor.experienceYears && (
                                            <div className={`text-xs ${doctor.experienceYears > 40 ? 'text-orange-600 font-medium' : 'text-slate-400'}`}>
                                                {doctor.experienceYears} years exp.{doctor.experienceYears > 40 ? ' (!)' : ''}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm text-slate-700">{doctor._count.specialties} conditions</div>
                                    {doctor.availableOnline && (
                                        <span className="text-xs text-green-600">Online Available</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {doctor.geography?.name || '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleVerified(doctor.id, doctor.isVerified)}
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            doctor.isVerified
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        }`}
                                    >
                                        {doctor.isVerified ? 'Verified' : 'Unverified'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierBadge(doctor.subscriptionTier)}`}>
                                        {doctor.subscriptionTier}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {doctor._count.leadLogs}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleImpersonate(doctor.id)}
                                            disabled={impersonating === doctor.id}
                                            className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                                            title="Login as this doctor"
                                        >
                                            {impersonating === doctor.id ? '...' : 'Impersonate'}
                                        </button>
                                        <Link
                                            href={`/admin/doctors/${doctor.id}`}
                                            className="px-3 py-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(doctor.id, doctor.name)}
                                            disabled={deleting === doctor.id}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                        >
                                            {deleting === doctor.id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>

            {filteredDoctors.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No doctors found matching your criteria.
                </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 text-sm text-slate-500">
                Showing {filteredDoctors.length} of {doctors.length} doctors
            </div>
        </div>
        </>
    );
}
