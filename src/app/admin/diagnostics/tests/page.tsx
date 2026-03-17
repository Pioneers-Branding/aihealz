import prisma from '@/lib/db';
import Link from 'next/link';

export default async function AdminDiagnosticTestsPage() {
  const [tests, categories, stats] = await Promise.all([
    prisma.diagnosticTest.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { prices: true, bookings: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.diagnosticCategory.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { tests: true } },
        children: {
          include: { _count: { select: { tests: true } } },
        },
      },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.diagnosticTest.aggregate({
      _count: true,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Diagnostic Tests</h1>
          <p className="text-sm text-slate-500">Manage lab tests, imaging scans, and health checkups</p>
        </div>
        <Link
          href="/admin/diagnostics/tests/new"
          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors"
        >
          Add Test
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{stats._count}</p>
          <p className="text-sm text-slate-500">Total Tests</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
          <p className="text-sm text-slate-500">Categories</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-teal-600">
            {tests.filter((t) => t._count.prices > 0).length}
          </p>
          <p className="text-sm text-slate-500">With Pricing</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-orange-500">
            {tests.filter((t) => t._count.prices === 0).length}
          </p>
          <p className="text-sm text-slate-500">No Pricing</p>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Categories</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const totalTests = cat._count.tests + cat.children.reduce((sum, c) => sum + c._count.tests, 0);
              return (
                <Link
                  key={cat.id}
                  href={`/admin/diagnostics/tests?category=${cat.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors"
                >
                  {cat.icon} {cat.name} ({totalTests})
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Tests</h2>
          <input
            type="text"
            placeholder="Search tests..."
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Test Name</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-center">Providers</th>
                <th className="px-6 py-3 text-center">Bookings</th>
                <th className="px-6 py-3 text-right">Avg Price</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{test.shortName || test.name}</p>
                      {test.shortName && (
                        <p className="text-xs text-slate-500 truncate max-w-xs">{test.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{test.category.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 capitalize">
                      {test.testType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{test._count.prices}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{test._count.bookings}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-teal-600">
                    {test.avgPriceInr ? `₹${Number(test.avgPriceInr).toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/diagnostics/tests/${test.id}`}
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
      </div>
    </div>
  );
}
