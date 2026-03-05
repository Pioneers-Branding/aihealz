import prisma from '@/lib/db';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = {
  health_checkup: 'Health Checkup',
  disease_specific: 'Disease Specific',
  organ_specific: 'Organ Specific',
  age_specific: 'Age Specific',
  gender_specific: 'Gender Specific',
  lifestyle: 'Lifestyle',
  preventive: 'Preventive',
  corporate: 'Corporate',
};

export default async function AdminDiagnosticPackagesPage() {
  const [packages, stats] = await Promise.all([
    prisma.diagnosticPackage.findMany({
      include: {
        provider: { select: { name: true, slug: true } },
        tests: {
          include: {
            test: { select: { name: true, shortName: true } },
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.diagnosticPackage.aggregate({
      _count: true,
      _avg: { price: true },
    }),
  ]);

  const featuredCount = packages.filter((p) => p.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Packages</h1>
          <p className="text-sm text-slate-500">Manage bundled test packages from providers</p>
        </div>
        <Link
          href="/admin/diagnostics/packages/new"
          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors"
        >
          Add Package
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{stats._count}</p>
          <p className="text-sm text-slate-500">Total Packages</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-orange-500">{featuredCount}</p>
          <p className="text-sm text-slate-500">Featured</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-teal-600">
            {stats._avg.price ? `₹${Math.round(Number(stats._avg.price)).toLocaleString('en-IN')}` : '-'}
          </p>
          <p className="text-sm text-slate-500">Avg Price</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-green-600">
            {packages.reduce((sum, p) => sum + p._count.bookings, 0)}
          </p>
          <p className="text-sm text-slate-500">Total Bookings</p>
        </div>
      </div>

      {/* Package Type Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/diagnostics/packages"
            className="px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 text-sm font-medium"
          >
            All Packages
          </Link>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/diagnostics/packages?type=${key}`}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Package Name</th>
                <th className="px-6 py-3 text-left">Provider</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-center">Tests</th>
                <th className="px-6 py-3 text-center">Bookings</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{pkg.name}</p>
                        {pkg.targetAudience && (
                          <p className="text-xs text-slate-500">For: {pkg.targetAudience}</p>
                        )}
                      </div>
                      {pkg.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-600">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/diagnostics/providers/${pkg.provider.slug}`}
                      className="text-sm text-slate-600 hover:text-teal-600"
                    >
                      {pkg.provider.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                      {TYPE_LABELS[pkg.packageType] || pkg.packageType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-slate-600">{pkg.tests.length}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{pkg._count.bookings}</td>
                  <td className="px-6 py-4 text-right">
                    <div>
                      <p className="font-medium text-teal-600">₹{Number(pkg.price).toLocaleString('en-IN')}</p>
                      {pkg.mrpPrice && Number(pkg.mrpPrice) > Number(pkg.price) && (
                        <p className="text-xs text-slate-400 line-through">
                          ₹{Number(pkg.mrpPrice).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/diagnostics/packages/${pkg.id}`}
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No packages found</p>
          </div>
        )}
      </div>
    </div>
  );
}
