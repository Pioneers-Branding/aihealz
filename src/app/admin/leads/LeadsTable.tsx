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
    isViewed: boolean;
    viewedAt: Date | null;
    isContacted: boolean;
    contactedAt: Date | null;
    contactRevealed: boolean;
    creditsSpent: number;
    outcome: string | null;
    createdAt: Date;
    doctor: { id: number; name: string; slug: string; specialty?: string };
    geography: { id: number; name: string; slug: string } | null;
}

interface LeadsTableProps {
    leads: Lead[];
}

const intentColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-600',
};

export default function LeadsTable({ leads }: LeadsTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filterIntent, setFilterIntent] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.doctor.name.toLowerCase().includes(search.toLowerCase()) ||
            lead.conditionSlug?.toLowerCase().includes(search.toLowerCase()) ||
            lead.geography?.name.toLowerCase().includes(search.toLowerCase()) ||
            lead.sessionHash?.toLowerCase().includes(search.toLowerCase());

        const matchesIntent = filterIntent === 'all' || lead.intentLevel === filterIntent;

        let matchesStatus = true;
        if (filterStatus === 'unviewed') matchesStatus = !lead.isViewed;
        else if (filterStatus === 'viewed') matchesStatus = lead.isViewed && !lead.isContacted;
        else if (filterStatus === 'contacted') matchesStatus = lead.isContacted;

        return matchesSearch && matchesIntent && matchesStatus;
    });

    const markAsViewed = async (id: string) => {
        try {
            await fetch(`/api/admin/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isViewed: true, viewedAt: new Date().toISOString() }),
            });
            router.refresh();
        } catch {
            setErrorMessage('Failed to update lead');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const markAsContacted = async (id: string) => {
        try {
            await fetch(`/api/admin/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isContacted: true, contactedAt: new Date().toISOString() }),
            });
            router.refresh();
        } catch {
            setErrorMessage('Failed to update lead');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
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
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <select
                    value={filterIntent}
                    onChange={(e) => setFilterIntent(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                    <option value="all">All Intent Levels</option>
                    <option value="high">High Intent</option>
                    <option value="medium">Medium Intent</option>
                    <option value="low">Low Intent</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                    <option value="all">All Statuses</option>
                    <option value="unviewed">Unviewed</option>
                    <option value="viewed">Viewed (Not Contacted)</option>
                    <option value="contacted">Contacted</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Doctor</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Condition</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Location</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Intent</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Outcome</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id} className={`hover:bg-slate-50 ${!lead.isViewed ? 'bg-blue-50/30' : ''}`}>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                    {formatDate(lead.createdAt)}
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/admin/doctors/${lead.doctor.id}`} className="hover:text-teal-600">
                                        <div className="font-medium text-slate-900">{lead.doctor.name}</div>
                                        <div className="text-xs text-slate-500">{lead.doctor.specialty}</div>
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    {lead.conditionSlug ? (
                                        <span className="text-sm text-slate-700">{lead.conditionSlug.replace(/-/g, ' ')}</span>
                                    ) : (
                                        <span className="text-sm text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {lead.geography?.name || '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${intentColors[lead.intentLevel]}`}>
                                        {lead.intentLevel}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        {lead.isContacted ? (
                                            <span className="text-xs text-green-600 font-medium">Contacted</span>
                                        ) : lead.isViewed ? (
                                            <span className="text-xs text-blue-600 font-medium">Viewed</span>
                                        ) : (
                                            <span className="text-xs text-slate-400">New</span>
                                        )}
                                        {lead.contactRevealed && (
                                            <span className="text-xs text-purple-600">Contact revealed</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {lead.outcome || '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        {!lead.isViewed && (
                                            <button
                                                onClick={() => markAsViewed(lead.id)}
                                                className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Mark Viewed
                                            </button>
                                        )}
                                        {!lead.isContacted && (
                                            <button
                                                onClick={() => markAsContacted(lead.id)}
                                                className="px-3 py-1 text-xs text-green-600 hover:text-green-700 font-medium"
                                            >
                                                Mark Contacted
                                            </button>
                                        )}
                                        <Link
                                            href={`/admin/leads/${lead.id}`}
                                            className="px-3 py-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredLeads.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No leads found matching your criteria.
                </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 text-sm text-slate-500">
                Showing {filteredLeads.length} of {leads.length} leads (most recent 500)
            </div>
        </div>
        </>
    );
}
