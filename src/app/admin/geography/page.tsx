import prisma from '@/lib/db';
import Link from 'next/link';
import { GlobeIcon, MapIcon, CityIcon, LocationPinIcon } from '@/components/ui/icons';

export default async function GeographyOverviewPage() {
    // Get counts per level
    const [totalCountries, totalStates, totalCities] = await Promise.all([
        prisma.geography.count({ where: { level: 'country' } }),
        prisma.geography.count({ where: { level: 'state' } }),
        prisma.geography.count({ where: { level: 'city' } }),
    ]);

    // Get doctors by top cities
    const topCitiesWithDoctors = await prisma.geography.findMany({
        where: { level: 'city' },
        orderBy: { population: 'desc' },
        take: 10,
        include: {
            parent: {
                select: { name: true, parent: { select: { name: true } } },
            },
            _count: {
                select: {
                    doctors: true,
                    leadLogs: true,
                },
            },
        },
    });

    // Get hospitals by city
    const hospitalsByCity = await prisma.hospital.groupBy({
        by: ['city'],
        where: { city: { not: null } },
        _count: true,
        orderBy: { _count: { city: 'desc' } },
        take: 10,
    });

    // Get insurance coverage by country
    const insuranceByCountry = await prisma.insuranceProvider.groupBy({
        by: ['headquartersCountry'],
        where: { headquartersCountry: { not: null } },
        _count: true,
    });

    // Get content coverage
    const contentCoverage = await prisma.localizedContent.groupBy({
        by: ['languageCode'],
        _count: true,
        orderBy: { _count: { languageCode: 'desc' } },
        take: 10,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Geographic Overview
                </h1>
                <p className="text-slate-500 mt-1">View location hierarchy, coverage, and content distribution</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <GlobeIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalCountries.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Countries</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalStates.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">States/Regions</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CityIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalCities.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Cities</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <LocationPinIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{(totalCountries + totalStates + totalCities).toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Total Locations</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Cities by Population */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Top Cities (by Population)</h3>
                        <Link href="/admin/locations" className="text-sm text-teal-600 hover:text-teal-700">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {topCitiesWithDoctors.map((city, i) => (
                            <div key={city.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium text-slate-900">{city.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {city.parent?.name}{city.parent?.parent?.name && `, ${city.parent.parent.name}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-slate-900">
                                        {city._count.doctors} doctors
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {city._count.leadLogs} leads
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topCitiesWithDoctors.length === 0 && (
                            <div className="px-6 py-8 text-center text-slate-400">
                                No city data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Hospitals by City */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Hospitals by City</h3>
                        <Link href="/admin/hospitals" className="text-sm text-teal-600 hover:text-teal-700">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {hospitalsByCity.map((item, i) => (
                            <div key={item.city} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-600">
                                        {i + 1}
                                    </span>
                                    <span className="font-medium text-slate-900">{item.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900">{item._count}</span>
                                    <span className="text-xs text-slate-400">hospitals</span>
                                </div>
                            </div>
                        ))}
                        {hospitalsByCity.length === 0 && (
                            <div className="px-6 py-8 text-center text-slate-400">
                                No hospital location data
                            </div>
                        )}
                    </div>
                </div>

                {/* Insurance by Country */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900">Insurance Providers by Country</h3>
                    </div>
                    <div className="p-6">
                        {insuranceByCountry.length > 0 ? (
                            <div className="space-y-3">
                                {insuranceByCountry.map((item) => {
                                    const maxCount = Math.max(...insuranceByCountry.map(i => i._count));
                                    return (
                                        <div key={item.headquartersCountry}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-900">
                                                    {item.headquartersCountry}
                                                </span>
                                                <span className="text-sm text-slate-500">{item._count}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                    style={{ width: `${(item._count / maxCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-4">
                                No insurance provider data
                            </div>
                        )}
                    </div>
                </div>

                {/* Content by Language */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900">Content Coverage by Language</h3>
                    </div>
                    <div className="p-6">
                        {contentCoverage.length > 0 ? (
                            <div className="space-y-3">
                                {contentCoverage.map((item) => {
                                    const maxCount = contentCoverage[0]._count;
                                    return (
                                        <div key={item.languageCode}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-900 uppercase">
                                                    {item.languageCode}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {item._count.toLocaleString()} pages
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                                    style={{ width: `${(item._count / maxCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-4">
                                No content data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Hierarchy Summary */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
                <h3 className="font-semibold text-emerald-900 mb-4">Location Hierarchy</h3>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                        <span className="text-sm text-emerald-800">Countries ({totalCountries})</span>
                    </div>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-sm text-emerald-800">States ({totalStates})</span>
                    </div>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500" />
                        <span className="text-sm text-emerald-800">Cities ({totalCities})</span>
                    </div>
                </div>
                <p className="text-sm text-emerald-700 text-center mt-4">
                    Locations are organized hierarchically for proper SEO URL structure and content targeting.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    href="/admin/locations"
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all"
                >
                    <svg className="w-6 h-6 text-teal-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <div className="font-medium text-slate-900">Manage Locations</div>
                    <div className="text-xs text-slate-500 mt-1">Add/edit geographies</div>
                </Link>
                <Link
                    href="/admin/hospitals"
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all"
                >
                    <svg className="w-6 h-6 text-teal-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="font-medium text-slate-900">Manage Hospitals</div>
                    <div className="text-xs text-slate-500 mt-1">Hospital locations</div>
                </Link>
                <Link
                    href="/admin/doctors"
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all"
                >
                    <svg className="w-6 h-6 text-teal-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="font-medium text-slate-900">View Doctors</div>
                    <div className="text-xs text-slate-500 mt-1">Doctor locations</div>
                </Link>
                <Link
                    href="/admin/languages"
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all"
                >
                    <svg className="w-6 h-6 text-teal-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <div className="font-medium text-slate-900">Languages</div>
                    <div className="text-xs text-slate-500 mt-1">Content localization</div>
                </Link>
            </div>
        </div>
    );
}
