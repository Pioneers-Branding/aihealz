'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface BookingFormData {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: string;
  patientGender: string;
  collectionType: 'walk_in' | 'home_collection';
  preferredDate: string;
  preferredTime: string;
  collectionAddress: string;
  notes: string;
}

interface TestInfo {
  id: number;
  name: string;
  slug: string;
  sampleType: string | null;
  fastingRequired: boolean;
  reportTimeHours: number | null;
  homeCollectionPossible: boolean;
}

interface ProviderInfo {
  id: number;
  name: string;
  slug: string;
  homeCollectionAvailable: boolean;
  homeCollectionFee: number | null;
  address: string | null;
  phone: string | null;
  price: number;
  mrpPrice: number | null;
}

export default function BookTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const providerSlug = searchParams.get('provider');

  const [testSlug, setTestSlug] = useState<string>('');
  const [test, setTest] = useState<TestInfo | null>(null);
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    collectionType: 'walk_in',
    preferredDate: '',
    preferredTime: '',
    collectionAddress: '',
    notes: '',
  });

  useEffect(() => {
    params.then((p) => setTestSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!testSlug) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/diagnostics/test-info?slug=${testSlug}&provider=${providerSlug || ''}`);
        const data = await res.json();
        if (data.test) setTest(data.test);
        if (data.provider) setProvider(data.provider);
      } catch {
        setError('Failed to load test information');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [testSlug, providerSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test || !provider) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/diagnostics/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          testId: test.id,
          ...formData,
          patientAge: formData.patientAge ? parseInt(formData.patientAge, 10) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setSuccess(true);
      setBookingId(data.bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Booking Submitted!</h1>
          <p className="text-slate-400 mb-6">
            Your booking request has been received. The diagnostic center will contact you shortly to confirm the appointment.
          </p>
          {bookingId && (
            <p className="text-sm text-slate-500 mb-6">Booking ID: {bookingId}</p>
          )}
          <div className="flex gap-4 justify-center">
            <Link
              href="/tests"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Browse More Tests
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/tests" className="hover:text-emerald-400 transition-colors">Tests</Link>
          <span>/</span>
          <span className="text-slate-400">Book Test</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-white mb-6">Book Your Test</h1>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Patient Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.patientEmail}
                      onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Age</label>
                      <input
                        type="number"
                        value={formData.patientAge}
                        onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                        placeholder="Age"
                        min="0"
                        max="150"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Gender</label>
                      <select
                        value={formData.patientGender}
                        onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Collection Preference</h2>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.collectionType === 'walk_in'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-slate-800/50 border-white/5 hover:border-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="collectionType"
                        value="walk_in"
                        checked={formData.collectionType === 'walk_in'}
                        onChange={(e) => setFormData({ ...formData, collectionType: e.target.value as 'walk_in' | 'home_collection' })}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <svg className={`w-6 h-6 ${formData.collectionType === 'walk_in' ? 'text-emerald-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div>
                          <p className="font-medium text-white">Visit Lab</p>
                          <p className="text-xs text-slate-500">Walk-in to the center</p>
                        </div>
                      </div>
                    </label>

                    {(test?.homeCollectionPossible && provider?.homeCollectionAvailable) && (
                      <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.collectionType === 'home_collection'
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-800/50 border-white/5 hover:border-white/10'
                      }`}>
                        <input
                          type="radio"
                          name="collectionType"
                          value="home_collection"
                          checked={formData.collectionType === 'home_collection'}
                          onChange={(e) => setFormData({ ...formData, collectionType: e.target.value as 'walk_in' | 'home_collection' })}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <svg className={`w-6 h-6 ${formData.collectionType === 'home_collection' ? 'text-emerald-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <div>
                            <p className="font-medium text-white">Home Collection</p>
                            <p className="text-xs text-slate-500">
                              {provider?.homeCollectionFee ? `+${formatPrice(provider.homeCollectionFee)}` : 'Free'}
                            </p>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>

                  {formData.collectionType === 'home_collection' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Collection Address *</label>
                      <textarea
                        required={formData.collectionType === 'home_collection'}
                        value={formData.collectionAddress}
                        onChange={(e) => setFormData({ ...formData, collectionAddress: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                        placeholder="Enter your complete address for sample collection"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Preferred Time</label>
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="">Any time</option>
                        <option value="06:00-08:00">6:00 AM - 8:00 AM</option>
                        <option value="08:00-10:00">8:00 AM - 10:00 AM</option>
                        <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                        <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                        <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                        <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                      placeholder="Any special requirements or medical conditions to note"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !test || !provider}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-white mb-4">Order Summary</h3>

              {test && (
                <div className="mb-4 pb-4 border-b border-white/5">
                  <p className="font-medium text-white">{test.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                    {test.sampleType && <span>{test.sampleType}</span>}
                    {test.fastingRequired && <span className="text-orange-400">Fasting Required</span>}
                    {test.reportTimeHours && (
                      <span>Report: {test.reportTimeHours < 24 ? `${test.reportTimeHours}h` : `${Math.round(test.reportTimeHours / 24)}d`}</span>
                    )}
                  </div>
                </div>
              )}

              {provider && (
                <div className="mb-4 pb-4 border-b border-white/5">
                  <p className="text-sm text-slate-400">Lab</p>
                  <p className="font-medium text-white">{provider.name}</p>
                  {provider.address && (
                    <p className="text-xs text-slate-500 mt-1">{provider.address}</p>
                  )}
                </div>
              )}

              {provider && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Test Price</span>
                    <span className="text-white">{formatPrice(provider.price)}</span>
                  </div>
                  {formData.collectionType === 'home_collection' && provider.homeCollectionFee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Home Collection</span>
                      <span className="text-white">{formatPrice(provider.homeCollectionFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/5">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-bold text-emerald-400">
                      {formatPrice(
                        provider.price +
                          (formData.collectionType === 'home_collection' && provider.homeCollectionFee
                            ? provider.homeCollectionFee
                            : 0)
                      )}
                    </span>
                  </div>
                  {provider.mrpPrice && provider.mrpPrice > provider.price && (
                    <p className="text-xs text-slate-500 text-right">
                      You save {formatPrice(provider.mrpPrice - provider.price)}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-4">
                Payment will be collected at the lab or during home collection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
