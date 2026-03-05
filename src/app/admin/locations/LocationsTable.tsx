"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/confirm-modal';

interface Location {
    id: number;
    name: string;
    slug: string;
    level: string;
    parentId: number | null;
    isActive: boolean;
    supportedLanguages: string[];
    parent: { id: number; name: string; slug: string } | null;
    _count: {
        children: number;
        doctors: number;
        localizedContent: number;
    };
}

interface LocationsTableProps {
    locations: Location[];
}

const levelColors: Record<string, string> = {
    continent: 'bg-indigo-100 text-indigo-700',
    country: 'bg-blue-100 text-blue-700',
    state: 'bg-purple-100 text-purple-700',
    city: 'bg-amber-100 text-amber-700',
    locality: 'bg-slate-100 text-slate-700',
};

export default function LocationsTable({ locations }: LocationsTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; locationId: number | null; locationName: string }>({
        isOpen: false,
        locationId: null,
        locationName: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const filteredLocations = locations.filter(location => {
        const matchesSearch =
            location.name.toLowerCase().includes(search.toLowerCase()) ||
            location.slug.toLowerCase().includes(search.toLowerCase()) ||
            location.parent?.name.toLowerCase().includes(search.toLowerCase());

        if (filterLevel === 'all') return matchesSearch;
        return matchesSearch && location.level === filterLevel;
    });

    const openDeleteModal = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, locationId: id, locationName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.locationId) return;
        const id = deleteModal.locationId;
        setDeleteModal({ isOpen: false, locationId: null, locationName: '' });

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                setErrorMessage(data.error || 'Failed to delete');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch {
            setErrorMessage('Failed to delete location');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setDeleting(null);
        }
    };

    const toggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/locations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                router.refresh();
            }
        } catch {
            setErrorMessage('Failed to update status');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    return (
        <>
        <ConfirmModal
            isOpen={deleteModal.isOpen}
            title="Delete Location"
            message={`Are you sure you want to delete "${deleteModal.locationName}"? This will also delete all child locations.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmVariant="danger"
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal({ isOpen: false, locationId: null, locationName: '' })}
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
                    placeholder="Search locations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                    <option value="all">All Levels</option>
                    <option value="continent">Continents</option>
                    <option value="country">Countries</option>
                    <option value="state">States</option>
                    <option value="city">Cities</option>
                    <option value="locality">Localities</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Location</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Level</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Parent</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Languages</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Children</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Doctors</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLocations.map((location) => (
                            <tr key={location.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div>
                                        <div className="font-medium text-slate-900">{location.name}</div>
                                        <div className="text-sm text-slate-500 font-mono">{location.slug}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[location.level]}`}>
                                        {location.level}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {location.parent?.name || '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {location.supportedLanguages.slice(0, 3).map(lang => (
                                            <span key={lang} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                                                {lang}
                                            </span>
                                        ))}
                                        {location.supportedLanguages.length > 3 && (
                                            <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                                                +{location.supportedLanguages.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {location._count.children}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {location._count.doctors}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleActive(location.id, location.isActive)}
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            location.isActive
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {location.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/locations/${location.id}`}
                                            className="px-3 py-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(location.id, location.name)}
                                            disabled={deleting === location.id}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                        >
                                            {deleting === location.id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredLocations.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No locations found matching your criteria.
                </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 text-sm text-slate-500">
                Showing {filteredLocations.length} of {locations.length} locations
            </div>
        </div>
        </>
    );
}
