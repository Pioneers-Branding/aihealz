import prisma from '@/lib/db';
import Link from 'next/link';
import LocationsTable from './LocationsTable';

async function getLocations() {
    const locations = await prisma.geography.findMany({
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
        include: {
            parent: {
                select: { id: true, name: true, slug: true }
            },
            _count: {
                select: {
                    children: true,
                    doctors: true,
                    localizedContent: true,
                }
            }
        }
    });
    return locations;
}

export default async function LocationsPage() {
    const locations = await getLocations();

    const stats = {
        total: locations.length,
        countries: locations.filter(l => l.level === 'country').length,
        states: locations.filter(l => l.level === 'state').length,
        cities: locations.filter(l => l.level === 'city').length,
        active: locations.filter(l => l.isActive).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
                    <p className="text-slate-500 mt-1">Manage geographic locations and regions</p>
                </div>
                <Link
                    href="/admin/locations/new"
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    Add Location
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total Locations</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.countries}</div>
                    <div className="text-sm text-slate-500">Countries</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-purple-600">{stats.states}</div>
                    <div className="text-sm text-slate-500">States</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-amber-600">{stats.cities}</div>
                    <div className="text-sm text-slate-500">Cities</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-sm text-slate-500">Active</div>
                </div>
            </div>

            {/* Table */}
            <LocationsTable locations={locations} />
        </div>
    );
}
