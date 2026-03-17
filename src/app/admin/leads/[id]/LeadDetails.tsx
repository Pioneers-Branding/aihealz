"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lead {
    id: string;
    doctorId: number;
    sessionHash: string | null;
    conditionSlug: string | null;
    specialtyMatched: string | null;
    intentLevel: string;
    intentScore: { toString(): string } | number | string | null;
    scoringFactors: Record<string, unknown> | string | number | boolean | null | unknown[];
    isViewed: boolean;
    viewedAt: Date | null;
    isContacted: boolean;
    contactedAt: Date | null;
    contactRevealed: boolean;
    creditsSpent: number;
    outcome: string | null;
    outcomeNotes: string | null;
    createdAt: Date;
    doctor: {
        id: number;
        name: string;
        slug: string;
        bio: string | null;
        qualifications: string[];
        geography: { name: string } | null;
    };
    geography: { id: number; name: string; slug: string } | null;
    analysis: Record<string, unknown> | null;
    leadCredits: Array<{
        id: number;
        transactionType: string;
        amount: number;
        description: string | null;
        createdAt: Date;
    }>;
    teleconsultations: Array<{
        id: string;
        scheduledAt: Date;
        status: string;
        durationMinutes: number;
    }>;
}

const intentColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const outcomeOptions = [
    'converted',
    'appointment_scheduled',
    'not_interested',
    'no_response',
    'wrong_specialty',
    'price_objection',
    'location_mismatch',
    'other'
];

export default function LeadDetails({ lead }: { lead: Lead }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [outcome, setOutcome] = useState(lead.outcome || '');
    const [outcomeNotes, setOutcomeNotes] = useState(lead.outcomeNotes || '');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleMarkViewed = async () => {
        setLoading(true);
        try {
            await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isViewed: true, viewedAt: new Date().toISOString() }),
            });
            router.refresh();
        } catch {
            setErrorMessage('Failed to update');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkContacted = async () => {
        setLoading(true);
        try {
            await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isContacted: true, contactedAt: new Date().toISOString() }),
            });
            router.refresh();
        } catch {
            setErrorMessage('Failed to update');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOutcome = async () => {
        setLoading(true);
        try {
            await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outcome, outcomeNotes }),
            });
            router.refresh();
        } catch {
            setErrorMessage('Failed to save');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}
            {/* Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Created {formatDate(lead.createdAt)}</div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${intentColors[lead.intentLevel]}`}>
                                {lead.intentLevel.toUpperCase()} Intent
                            </span>
                            {lead.isContacted ? (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                                    Contacted
                                </span>
                            ) : lead.isViewed ? (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                    Viewed
                                </span>
                            ) : (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                    New
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!lead.isViewed && (
                            <button
                                onClick={handleMarkViewed}
                                disabled={loading}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Mark Viewed
                            </button>
                        )}
                        {!lead.isContacted && (
                            <button
                                onClick={handleMarkContacted}
                                disabled={loading}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Mark Contacted
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 mb-2">Doctor</h3>
                        <Link href={`/admin/doctors/${lead.doctor.id}`} className="group">
                            <div className="font-medium text-slate-900 group-hover:text-teal-600">{lead.doctor.name}</div>
                            <div className="text-sm text-slate-500">
                                {lead.doctor.qualifications.slice(0, 2).join(', ')}
                            </div>
                            <div className="text-sm text-slate-400">
                                {lead.doctor.geography?.name || 'Location not set'}
                            </div>
                        </Link>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 mb-2">Lead Details</h3>
                        <div className="space-y-1 text-sm">
                            <div><span className="text-slate-500">Condition:</span> <span className="text-slate-900">{lead.conditionSlug?.replace(/-/g, ' ') || 'N/A'}</span></div>
                            <div><span className="text-slate-500">Specialty:</span> <span className="text-slate-900">{lead.specialtyMatched || 'N/A'}</span></div>
                            <div><span className="text-slate-500">Location:</span> <span className="text-slate-900">{lead.geography?.name || 'N/A'}</span></div>
                            <div><span className="text-slate-500">Session:</span> <span className="text-slate-900 font-mono text-xs">{lead.sessionHash?.slice(0, 16)}...</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {lead.scoringFactors && typeof lead.scoringFactors === 'object' && Object.keys(lead.scoringFactors).length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Scoring Factors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(lead.scoringFactors as Record<string, unknown>).map(([key, value]) => (
                            <div key={key} className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-sm text-slate-500 capitalize">{key.replace(/_/g, ' ')}</div>
                                <div className="font-medium text-slate-900">{String(value)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Outcome Tracking */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Outcome Tracking</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Outcome</label>
                        <select
                            value={outcome}
                            onChange={(e) => setOutcome(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            <option value="">Select outcome...</option>
                            {outcomeOptions.map(opt => (
                                <option key={opt} value={opt}>
                                    {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            value={outcomeNotes}
                            onChange={(e) => setOutcomeNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="Add notes about this lead..."
                        />
                    </div>
                    <button
                        onClick={handleSaveOutcome}
                        disabled={loading}
                        className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                        Save Outcome
                    </button>
                </div>
            </div>

            {/* Credit Transactions */}
            {lead.leadCredits.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Credit Transactions</h2>
                    <div className="space-y-2">
                        {lead.leadCredits.map(credit => (
                            <div key={credit.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-900">{credit.transactionType}</div>
                                    <div className="text-sm text-slate-500">{credit.description}</div>
                                </div>
                                <div className={`font-bold ${credit.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {credit.amount > 0 ? '+' : ''}{credit.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Teleconsultations */}
            {lead.teleconsultations.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Teleconsultations</h2>
                    <div className="space-y-2">
                        {lead.teleconsultations.map(tc => (
                            <div key={tc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-900">
                                        {formatDate(tc.scheduledAt)}
                                    </div>
                                    <div className="text-sm text-slate-500">{tc.durationMinutes} minutes</div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${tc.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        tc.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>
                                    {tc.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Back Link */}
            <div className="pt-4">
                <Link
                    href="/admin/leads"
                    className="text-slate-600 hover:text-slate-800 font-medium"
                >
                    ← Back to Leads
                </Link>
            </div>
        </div>
    );
}
