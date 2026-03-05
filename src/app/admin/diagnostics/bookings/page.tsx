import prisma from '@/lib/db';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  sample_collected: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700',
  report_ready: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-slate-100 text-slate-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-orange-100 text-orange-700',
  refunded: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
};

export default async function AdminDiagnosticBookingsPage() {
  const [bookings, stats] = await Promise.all([
    prisma.diagnosticBooking.findMany({
      include: {
        provider: { select: { name: true, slug: true } },
        test: { select: { name: true, shortName: true, slug: true } },
        package: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.diagnosticBooking.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const totalBookings = stats.reduce((sum, s) => sum + s._count, 0);
  const pendingCount = stats.find((s) => s.status === 'pending')?._count || 0;
  const completedCount = stats.find((s) => s.status === 'completed')?._count || 0;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Test Bookings</h1>
        <p className="text-sm text-slate-500">Manage diagnostic test and package bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{totalBookings}</p>
          <p className="text-sm text-slate-500">Total Bookings</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-teal-600">
            {bookings.length > 0
              ? `₹${bookings.reduce((sum, b) => sum + Number(b.finalPrice), 0).toLocaleString('en-IN')}`
              : '₹0'}
          </p>
          <p className="text-sm text-slate-500">Total Revenue</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/diagnostics/bookings"
            className="px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 text-sm font-medium"
          >
            All ({totalBookings})
          </Link>
          {stats.map((s) => (
            <Link
              key={s.status}
              href={`/admin/diagnostics/bookings?status=${s.status}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${STATUS_COLORS[s.status]}`}
            >
              {s.status.replace('_', ' ')} ({s._count})
            </Link>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Booking ID</th>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Test/Package</th>
                <th className="px-6 py-3 text-left">Provider</th>
                <th className="px-6 py-3 text-center">Collection</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Payment</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/diagnostics/bookings/${booking.id}`}
                      className="text-sm font-mono text-teal-600 hover:underline"
                    >
                      {booking.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{booking.patientName}</p>
                      <p className="text-xs text-slate-500">{booking.patientPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">
                      {booking.test?.shortName || booking.test?.name || booking.package?.name || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/diagnostics/providers/${booking.provider.slug}`}
                      className="text-sm text-slate-600 hover:text-teal-600"
                    >
                      {booking.provider.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        booking.collectionType === 'home_collection'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {booking.collectionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[booking.status]}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${PAYMENT_COLORS[booking.paymentStatus]}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    ₹{Number(booking.finalPrice).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {formatDate(booking.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
