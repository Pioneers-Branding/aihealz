'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FlaskConical, MapPin, Phone, Mail, Globe, Home,
  Star, Package, Calendar, Users, ArrowLeft, Loader2,
  CheckCircle, XCircle, Shield, Edit2, Save
} from 'lucide-react';

interface Provider {
  id: number;
  slug: string;
  name: string;
  providerType: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  accreditations: string[];
  homeCollectionAvailable: boolean;
  homeCollectionFee?: number;
  isPartner: boolean;
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount: number;
  totalBookings: number;
  geography?: { id: number; name: string; slug: string };
  testPrices: Array<{
    id: number;
    price: number;
    test: { id: number; name: string; slug: string };
  }>;
  packages: Array<{
    id: number;
    name: string;
    price: number;
    isActive: boolean;
  }>;
  bookings: Array<{
    id: number;
    patientName: string;
    status: string;
    createdAt: string;
  }>;
  reviews: Array<{
    id: number;
    reviewerName: string;
    rating: number;
    review?: string;
    createdAt: string;
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  lab: 'Pathology Lab',
  imaging_center: 'Imaging Center',
  hospital: 'Hospital Lab',
  clinic: 'Clinic',
  home_collection: 'Home Collection',
  full_service: 'Full Service',
};

export default function DiagnosticProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'packages' | 'bookings' | 'reviews'>('overview');

  useEffect(() => {
    fetchProvider();
  }, [params.id]);

  const fetchProvider = async () => {
    try {
      const res = await fetch(`/api/admin/diagnostic-providers/${params.id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProvider(data);
      }
    } catch (error) {
      console.error('Failed to fetch provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: 'isVerified' | 'isActive' | 'isPartner') => {
    if (!provider) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/diagnostic-providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !provider[field] }),
        credentials: 'include',
      });
      if (res.ok) {
        setProvider({ ...provider, [field]: !provider[field] });
      }
    } catch (error) {
      console.error('Failed to update provider:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImpersonate = () => {
    if (!provider) return;
    localStorage.setItem('admin_impersonating', 'true');
    localStorage.setItem('admin_original_session', localStorage.getItem('admin_session') || '');
    localStorage.setItem('provider_lab_id', provider.id.toString());
    localStorage.setItem('provider_session', JSON.stringify({ labId: provider.id, impersonated: true }));
    window.open('/provider/lab/dashboard', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Provider not found</p>
        <Link href="/admin/diagnostics/providers" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
          Back to Providers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/diagnostics/providers" className="mt-1 text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-4">
            {provider.logo ? (
              <img src={provider.logo} alt={provider.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center text-2xl font-bold text-teal-600">
                {provider.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                  {TYPE_LABELS[provider.providerType] || provider.providerType}
                </span>
                {provider.isPartner && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                    Partner
                  </span>
                )}
                {provider.isVerified && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={12} />
                    Verified
                  </span>
                )}
                {!provider.isActive && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{provider.geography?.name || 'No location set'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImpersonate}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
          >
            <Users size={16} />
            Impersonate
          </button>
          <button
            onClick={() => handleToggle('isPartner')}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              provider.isPartner
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {provider.isPartner ? 'Remove Partner' : 'Make Partner'}
          </button>
          <button
            onClick={() => handleToggle('isVerified')}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              provider.isVerified
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {provider.isVerified ? 'Remove Verification' : 'Verify'}
          </button>
          <button
            onClick={() => handleToggle('isActive')}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              provider.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {provider.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {provider.rating ? Number(provider.rating).toFixed(1) : '-'}
          </div>
          <div className="text-xs text-slate-500">Rating ({provider.reviewCount} reviews)</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{provider.testPrices.length}</div>
          <div className="text-xs text-slate-500">Tests Available</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{provider.packages.length}</div>
          <div className="text-xs text-slate-500">Health Packages</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{provider.totalBookings}</div>
          <div className="text-xs text-slate-500">Total Bookings</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
            <Home className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {provider.homeCollectionAvailable ? 'Yes' : 'No'}
          </div>
          <div className="text-xs text-slate-500">Home Collection</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'tests', label: `Tests (${provider.testPrices.length})` },
            { key: 'packages', label: `Packages (${provider.packages.length})` },
            { key: 'bookings', label: `Bookings (${provider.bookings.length})` },
            { key: 'reviews', label: `Reviews (${provider.reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Provider Details</h3>
            <dl className="space-y-3 text-sm">
              {provider.description && (
                <div>
                  <dt className="text-slate-500">Description</dt>
                  <dd className="text-slate-900 mt-1">{provider.description}</dd>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-500 flex items-center gap-1">
                    <MapPin size={14} /> Address
                  </dt>
                  <dd className="text-slate-900">{provider.address || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 flex items-center gap-1">
                    <Phone size={14} /> Phone
                  </dt>
                  <dd className="text-slate-900">{provider.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 flex items-center gap-1">
                    <Mail size={14} /> Email
                  </dt>
                  <dd className="text-slate-900">{provider.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 flex items-center gap-1">
                    <Globe size={14} /> Website
                  </dt>
                  <dd className="text-slate-900">
                    {provider.website ? (
                      <a href={provider.website} target="_blank" rel="noopener" className="text-teal-600 hover:underline">
                        {provider.website}
                      </a>
                    ) : '-'}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-teal-600" />
              Accreditations
            </h3>
            {provider.accreditations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {provider.accreditations.map((acc) => (
                  <span key={acc} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                    {acc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No accreditations added</p>
            )}

            {provider.homeCollectionAvailable && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <Home size={18} />
                  Home Collection Available
                </div>
                {provider.homeCollectionFee && (
                  <p className="text-sm text-green-600 mt-1">
                    Fee: ₹{provider.homeCollectionFee}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {provider.testPrices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {provider.testPrices.map((tp) => (
                <div key={tp.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-900">{tp.test.name}</div>
                    <div className="text-xs text-slate-500">/{tp.test.slug}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-teal-600">₹{Number(tp.price).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">No tests configured</div>
          )}
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {provider.packages.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {provider.packages.map((pkg) => (
                <div key={pkg.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{pkg.name}</div>
                      <div className={`text-xs ${pkg.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-purple-600">₹{Number(pkg.price).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">No packages created</div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {provider.bookings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {provider.bookings.map((booking) => (
                <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-900">{booking.patientName}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">No bookings yet</div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {provider.reviews.length > 0 ? (
            provider.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{review.reviewerName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.review && <p className="text-sm text-slate-600 mt-2">{review.review}</p>}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              No reviews yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
