"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Verification {
    id: string;
    doctor: {
        id: number;
        name: string;
        slug: string;
        qualifications: string[];
        profileImage: string | null;
    };
    registryType: string;
    licenseNumber: string;
    countryCode: string;
    status: 'pending' | 'verified' | 'rejected' | 'inconclusive';
    verifiedName: string | null;
    verifiedSpecialty: string | null;
    matchConfidence: number | null;
    apiResponse: Record<string, unknown> | null;
    createdAt: string;
}

type StatusFilter = 'pending' | 'inconclusive' | 'verified' | 'rejected';

export default function VerificationPage() {
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchVerifications = useCallback(async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            // Add timeout to prevent infinite loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const res = await fetch(`/api/admin/verification-queue?status=${statusFilter}`, {
                signal: controller.signal,
                credentials: 'include',
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const error = await res.json().catch(() => ({ error: 'Failed to load' }));
                setErrorMessage(error.error || 'Failed to load verifications');
                setVerifications([]);
            } else {
                const data = await res.json();
                setVerifications(data.verifications || []);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                setErrorMessage('Request timed out. Please try again.');
            } else {
                console.error('Failed to fetch verifications:', error);
                setErrorMessage('Failed to load verifications. Please try again.');
            }
            setVerifications([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchVerifications();
    }, [fetchVerifications]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const res = await fetch('/api/admin/verification-queue', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    action,
                    reviewedBy: 'admin',
                    reviewNotes,
                    rejectionReason: action === 'reject' ? rejectionReason : undefined,
                }),
            });

            if (res.ok) {
                setVerifications((prev) => prev.filter((v) => v.id !== id));
                setShowModal(false);
                setReviewNotes('');
                setRejectionReason('');
                setSelectedId(null);
            } else {
                const error = await res.json();
                setErrorMessage(`Failed: ${error.error}`);
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error('Action failed:', error);
            setErrorMessage('Action failed. Please try again.');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setActionLoading(null);
        }
    };

    const openModal = (id: string, action: 'approve' | 'reject') => {
        setSelectedId(id);
        setModalAction(action);
        setShowModal(true);
    };

    const selectedVerification = verifications.find((v) => v.id === selectedId);

    const statusCounts = {
        pending: verifications.length,
    };

    const getConfidenceColor = (confidence: number | null) => {
        if (!confidence) return 'text-slate-500';
        if (confidence >= 0.9) return 'text-emerald-600';
        if (confidence >= 0.7) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getConfidenceLabel = (confidence: number | null) => {
        if (!confidence) return 'N/A';
        if (confidence >= 0.9) return 'High';
        if (confidence >= 0.7) return 'Medium';
        return 'Low';
    };

    return (
        <div className="space-y-6">
            {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verification Queue
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Review and verify doctor license credentials.
                    </p>
                </div>
                <button
                    onClick={fetchVerifications}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
                {(['pending', 'inconclusive', 'verified', 'rejected'] as StatusFilter[]).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            statusFilter === status
                                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="text-sm font-medium text-amber-700">Pending</div>
                    <div className="text-2xl font-bold text-amber-800">{verifications.length}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-sm font-medium text-blue-700">Auto-Verified Today</div>
                    <div className="text-2xl font-bold text-blue-800">0</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="text-sm font-medium text-emerald-700">Manual Approvals</div>
                    <div className="text-2xl font-bold text-emerald-800">0</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                    <div className="text-sm font-medium text-rose-700">Rejected</div>
                    <div className="text-2xl font-bold text-rose-800">0</div>
                </div>
            </div>

            {/* Verification Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-slate-500">Loading verifications...</p>
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">All caught up!</h3>
                        <p className="text-slate-500">No {statusFilter} verifications in the queue.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-4 font-bold text-slate-700">Doctor</th>
                                <th className="text-left p-4 font-bold text-slate-700">License Info</th>
                                <th className="text-left p-4 font-bold text-slate-700">Registry Match</th>
                                <th className="text-left p-4 font-bold text-slate-700">Confidence</th>
                                <th className="text-left p-4 font-bold text-slate-700">Submitted</th>
                                <th className="text-right p-4 font-bold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {verifications.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                                {v.doctor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <Link
                                                    href={`/admin/doctors/${v.doctor.id}`}
                                                    className="font-medium text-slate-900 hover:text-teal-600"
                                                >
                                                    {v.doctor.name}
                                                </Link>
                                                <p className="text-xs text-slate-500">
                                                    {v.doctor.qualifications?.join(', ') || 'No qualifications'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded inline-block mb-1">
                                            {v.licenseNumber}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {v.registryType} ({v.countryCode})
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        {v.verifiedName ? (
                                            <div>
                                                <p className="font-medium text-slate-900">{v.verifiedName}</p>
                                                <p className="text-xs text-slate-500">{v.verifiedSpecialty || 'N/A'}</p>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">No match data</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-bold ${getConfidenceColor(v.matchConfidence)}`}>
                                            {v.matchConfidence ? `${Math.round(v.matchConfidence * 100)}%` : 'N/A'}
                                        </span>
                                        <p className="text-xs text-slate-500">
                                            {getConfidenceLabel(v.matchConfidence)}
                                        </p>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(v.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(v.id, 'approve')}
                                                disabled={actionLoading === v.id}
                                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openModal(v.id, 'reject')}
                                                disabled={actionLoading === v.id}
                                                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => setSelectedId(selectedId === v.id ? null : v.id)}
                                                className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirmation Modal */}
            {showModal && selectedVerification && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {modalAction === 'approve' ? 'Approve Verification' : 'Reject Verification'}
                        </h3>

                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium text-slate-900">{selectedVerification.doctor.name}</p>
                            <p className="text-sm text-slate-500">License: {selectedVerification.licenseNumber}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Review Notes (Optional)
                            </label>
                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                rows={2}
                                placeholder="Add any notes about this review..."
                            />
                        </div>

                        {modalAction === 'reject' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Rejection Reason *
                                </label>
                                <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="invalid_license">Invalid License Number</option>
                                    <option value="expired_license">Expired License</option>
                                    <option value="name_mismatch">Name Mismatch</option>
                                    <option value="unverifiable">Unable to Verify</option>
                                    <option value="fraudulent">Suspected Fraud</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setReviewNotes('');
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(selectedVerification.id, modalAction)}
                                disabled={modalAction === 'reject' && !rejectionReason}
                                className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
                                    modalAction === 'approve'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            >
                                {actionLoading ? 'Processing...' : modalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
