'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Enquiry {
    id: number;
    companyName: string;
    companyType: string;
    contactName: string;
    email: string;
    phone: string | null;
    website: string | null;
    adBudget: string | null;
    targetRegions: string[];
    targetConditions: string[];
    message: string | null;
    status: string;
    assignedTo: string | null;
    notes: string | null;
    createdAt: string;
    contactedAt: string | null;
    advertiser: {
        id: number;
        companyName: string;
        slug: string;
    } | null;
}

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'closed', label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const COMPANY_TYPES: Record<string, string> = {
    clinic: 'Clinic',
    hospital: 'Hospital',
    diagnostic: 'Diagnostic Lab',
    pharmacy: 'Pharmacy',
    pharma: 'Pharmaceutical',
    medtech: 'MedTech',
    insurance: 'Insurance',
    wellness: 'Wellness',
    other: 'Other',
};

export default function EnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchEnquiries = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`/api/ads/enquiry?${params.toString()}`);
            const data = await res.json();
            setEnquiries(data.enquiries || []);
        } catch (error) {
            console.error('Failed to fetch enquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, [statusFilter]);

    const updateEnquiryStatus = async (id: number, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/ads/enquiry/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setEnquiries((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
                );
                if (selectedEnquiry?.id === id) {
                    setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusColor = (status: string) => {
        return STATUS_OPTIONS.find((s) => s.value === status)?.color || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ad Enquiries</h1>
                    <p className="text-slate-500 mt-1">Manage incoming advertising enquiries</p>
                </div>
                <Link
                    href="/admin/advertising"
                    className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">All</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <div className="text-sm text-slate-500">
                    {enquiries.length} enquir{enquiries.length === 1 ? 'y' : 'ies'}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Enquiries List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading...</div>
                    ) : enquiries.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No enquiries found
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {enquiries.map((enquiry) => (
                                <div
                                    key={enquiry.id}
                                    onClick={() => setSelectedEnquiry(enquiry)}
                                    className={`px-6 py-4 cursor-pointer transition-colors ${
                                        selectedEnquiry?.id === enquiry.id
                                            ? 'bg-teal-50 border-l-4 border-teal-500'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold text-slate-900">{enquiry.companyName}</div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(enquiry.status)}`}>
                                            {enquiry.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-1">
                                        <span>{COMPANY_TYPES[enquiry.companyType] || enquiry.companyType}</span>
                                        <span>•</span>
                                        <span>{enquiry.contactName}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="text-slate-400">{enquiry.email}</span>
                                        {enquiry.adBudget && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-teal-600 font-medium">{enquiry.adBudget}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2">
                                        {new Date(enquiry.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    {selectedEnquiry ? (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Enquiry Details</h2>
                                <button
                                    onClick={() => setSelectedEnquiry(null)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Company</div>
                                    <div className="font-semibold text-slate-900">{selectedEnquiry.companyName}</div>
                                    <div className="text-sm text-slate-500">{COMPANY_TYPES[selectedEnquiry.companyType] || selectedEnquiry.companyType}</div>
                                </div>

                                <div>
                                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Contact</div>
                                    <div className="text-slate-900">{selectedEnquiry.contactName}</div>
                                    <a href={`mailto:${selectedEnquiry.email}`} className="text-sm text-teal-600 hover:underline">{selectedEnquiry.email}</a>
                                    {selectedEnquiry.phone && (
                                        <div className="text-sm text-slate-500">{selectedEnquiry.phone}</div>
                                    )}
                                </div>

                                {selectedEnquiry.website && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Website</div>
                                        <a href={selectedEnquiry.website} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
                                            {selectedEnquiry.website}
                                        </a>
                                    </div>
                                )}

                                {selectedEnquiry.adBudget && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Budget</div>
                                        <div className="text-slate-900 font-medium">{selectedEnquiry.adBudget}</div>
                                    </div>
                                )}

                                {selectedEnquiry.targetRegions.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Target Regions</div>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedEnquiry.targetRegions.map((r) => (
                                                <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedEnquiry.message && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Message</div>
                                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedEnquiry.message}</div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100">
                                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Update Status</div>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTIONS.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => updateEnquiryStatus(selectedEnquiry.id, s.value)}
                                                disabled={updatingStatus || selectedEnquiry.status === s.value}
                                                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                                                    selectedEnquiry.status === s.value
                                                        ? s.color + ' ring-2 ring-offset-1 ring-current'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                } disabled:opacity-50`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedEnquiry.status === 'qualified' && !selectedEnquiry.advertiser && (
                                    <div className="pt-4">
                                        <Link
                                            href={`/admin/advertising/advertisers/new?from_enquiry=${selectedEnquiry.id}`}
                                            className="w-full block text-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                                        >
                                            Convert to Advertiser
                                        </Link>
                                    </div>
                                )}

                                {selectedEnquiry.advertiser && (
                                    <div className="pt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                                        <div className="text-xs font-medium text-green-700 mb-1">Converted</div>
                                        <Link
                                            href={`/admin/advertising/advertisers/${selectedEnquiry.advertiser.id}`}
                                            className="text-sm text-green-600 hover:underline font-medium"
                                        >
                                            View {selectedEnquiry.advertiser.companyName}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Select an enquiry to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
