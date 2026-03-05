'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FlaskConical, Package, Calendar, Star, Home, Settings,
  BarChart3, FileText, Users, Bell, ChevronDown, LogOut,
  CheckCircle, Clock, AlertCircle, TrendingUp, X, Sparkles
} from 'lucide-react';

interface LabSession {
  labId: number;
  name?: string;
  email?: string;
  subscriptionTier?: string;
  token?: string;
  expiresAt?: string;
  impersonated?: boolean;
}

function LabDashboardContent() {
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';

  const [session, setSession] = useState<LabSession | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showImpersonationBanner, setShowImpersonationBanner] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(isWelcome);

  useEffect(() => {
    // Check for provider session
    const sessionData = localStorage.getItem('provider_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed.labId) {
          setSession(parsed);
          setShowImpersonationBanner(parsed.impersonated === true);
        }
      } catch {
        // Invalid session data
      }
    }
  }, []);

  const handleExitImpersonation = () => {
    localStorage.removeItem('provider_session');
    localStorage.removeItem('provider_lab_id');
    localStorage.removeItem('admin_impersonating');
    window.close();
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tests', label: 'Tests & Pricing', icon: FlaskConical },
    { id: 'packages', label: 'Health Packages', icon: Package },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Sample data for demonstration
  const stats = {
    todayBookings: 12,
    pendingReports: 8,
    completedToday: 18,
    averageRating: 4.6,
    monthlyRevenue: 245000,
    homeCollections: 5,
  };

  const recentBookings = [
    { id: 1, patient: 'Rahul Sharma', test: 'Complete Blood Count', time: '10:30 AM', status: 'completed' },
    { id: 2, patient: 'Priya Patel', test: 'Lipid Profile', time: '11:00 AM', status: 'in_progress' },
    { id: 3, patient: 'Amit Kumar', test: 'Full Body Checkup', time: '11:30 AM', status: 'pending' },
    { id: 4, patient: 'Sneha Reddy', test: 'Thyroid Profile', time: '12:00 PM', status: 'pending' },
    { id: 5, patient: 'Vikram Singh', test: 'HbA1c', time: '12:30 PM', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Impersonation Banner */}
      {showImpersonationBanner && (
        <div className="fixed top-0 left-0 right-0 bg-purple-600 text-white py-2 px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              Admin Mode: You are viewing this dashboard as Lab #{session?.labId}
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
          >
            Exit Impersonation
          </button>
        </div>
      )}

      {/* Welcome Banner for New Registrations */}
      {showWelcomeBanner && !showImpersonationBanner && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <Sparkles size={20} />
            <span className="font-medium">
              Welcome to AIHealz! Your lab profile is now live. Complete your setup to start receiving bookings.
            </span>
          </div>
          <button
            onClick={() => setShowWelcomeBanner(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-slate-300 fixed h-full ${(showImpersonationBanner || showWelcomeBanner) ? 'pt-12' : ''}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/provider/lab/dashboard" className="flex items-center gap-2">
            <FlaskConical size={24} className="text-teal-400" />
            <span className="text-xl font-bold text-white">Lab Portal</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              {session?.name ? session.name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.name || 'Your Lab'}</p>
              <p className="text-xs text-slate-500 capitalize">{session?.subscriptionTier || 'Free'} Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-64 ${(showImpersonationBanner || showWelcomeBanner) ? 'pt-12' : ''}`}>
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="font-semibold text-slate-900">
              {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link
              href="/diagnostic-labs"
              target="_blank"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View Public Page
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.todayBookings}</p>
                      <p className="text-xs text-slate-500">Today's Bookings</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.pendingReports}</p>
                      <p className="text-xs text-slate-500">Pending Reports</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.completedToday}</p>
                      <p className="text-xs text-slate-500">Completed Today</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.averageRating}</p>
                      <p className="text-xs text-slate-500">Average Rating</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">₹{(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-slate-500">Monthly Revenue</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.homeCollections}</p>
                      <p className="text-xs text-slate-500">Home Collections</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Today's Schedule</h2>
                  <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium">
                          {booking.patient.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{booking.patient}</p>
                          <p className="text-sm text-slate-500">{booking.test}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">{booking.time}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status === 'completed' ? 'Completed' :
                           booking.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <button className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-teal-300 hover:shadow-md transition-all group">
                  <FlaskConical className="w-8 h-8 text-teal-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-teal-600">Add New Test</h3>
                  <p className="text-sm text-slate-500 mt-1">Configure pricing for a new test</p>
                </button>
                <button className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-teal-300 hover:shadow-md transition-all group">
                  <Package className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-purple-600">Create Package</h3>
                  <p className="text-sm text-slate-500 mt-1">Bundle tests into a health package</p>
                </button>
                <button className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-teal-300 hover:shadow-md transition-all group">
                  <FileText className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Upload Reports</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload patient test reports</p>
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const item = sidebarItems.find(i => i.id === activeTab);
                  if (item) {
                    const IconComponent = item.icon;
                    return <IconComponent size={32} className="text-slate-400" />;
                  }
                  return null;
                })()}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {sidebarItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500">
                This section is under development. Content coming soon.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LabDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    }>
      <LabDashboardContent />
    </Suspense>
  );
}
