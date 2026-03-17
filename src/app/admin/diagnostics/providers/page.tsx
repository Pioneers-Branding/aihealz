'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, FlaskConical, Users, Home, Star, CheckCircle } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  lab: 'Pathology Lab',
  imaging_center: 'Imaging Center',
  hospital: 'Hospital',
  clinic: 'Clinic',
  home_collection: 'Home Collection',
  full_service: 'Full Service',
};

interface Provider {
  id: number;
  slug: string;
  name: string;
  providerType: string;
  logo?: string;
  isPartner: boolean;
  isVerified: boolean;
  isActive: boolean;
  homeCollectionAvailable: boolean;
  accreditations: string[];
  rating?: number;
  reviewCount: number;
  geography?: { name: string };
  _count: {
    testPrices: number;
    packages: number;
    bookings: number;
    reviews: number;
  };
}

interface ProviderStats {
  total: number;
  avgRating: string | null;
  partners: number;
  verified: number;
  homeCollection: number;
}

export default function AdminDiagnosticProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/diagnostic-providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = (providerId: number) => {
    localStorage.setItem('admin_impersonating', 'true');
    localStorage.setItem('admin_original_session', localStorage.getItem('admin_session') || '');
    localStorage.setItem('provider_lab_id', providerId.toString());
    localStorage.setItem('provider_session', JSON.stringify({ labId: providerId, impersonated: true }));
    window.open('/provider/lab/dashboard', '_blank');
  };

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.geography?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-teal-600" />
            Diagnostic Labs & Centers
          </h1>
          <p className="text-sm text-slate-500">Manage diagnostic service providers</p>
        </div>
        <Link
          href="/admin/diagnostics/providers/new"
          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Provider
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.total || 0}</p>
          <p className="text-sm text-slate-500">Total Providers</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-500">{stats?.partners || 0}</p>
          <p className="text-sm text-slate-500">Partners</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.verified || 0}</p>
          <p className="text-sm text-slate-500">Verified</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
            <Home className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-600">{stats?.homeCollection || 0}</p>
          <p className="text-sm text-slate-500">Home Collection</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-500">
            {stats?.avgRating || '-'}
          </p>
          <p className="text-sm text-slate-500">Avg Rating</p>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">All Providers</h2>
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Provider</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-center">Tests</th>
                <th className="px-6 py-3 text-center">Packages</th>
                <th className="px-6 py-3 text-center">Bookings</th>
                <th className="px-6 py-3 text-center">Rating</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {provider.logo ? (
                        <img src={provider.logo} alt={provider.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-bold">{provider.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{provider.name}</p>
                          {provider.isPartner && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-600">
                              Partner
                            </span>
                          )}
                        </div>
                        {provider.accreditations.length > 0 && (
                          <p className="text-xs text-slate-500">{provider.accreditations.slice(0, 2).join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                      {TYPE_LABELS[provider.providerType] || provider.providerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{provider.geography?.name || '-'}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{provider._count.testPrices}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{provider._count.packages}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{provider._count.bookings}</td>
                  <td className="px-6 py-4 text-center">
                    {provider.rating ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{Number(provider.rating).toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({provider.reviewCount})</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {provider.isVerified && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Verified
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provider.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleImpersonate(provider.id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        title="Login as this provider"
                      >
                        Impersonate
                      </button>
                      <Link
                        href={`/admin/diagnostics/providers/${provider.id}`}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No providers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
