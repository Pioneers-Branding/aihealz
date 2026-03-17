'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, LayoutDashboard, Users, TrendingUp, Settings, LogOut,
  UserPlus, Eye, MessageSquare, Calendar, Star, Shield, Zap,
  ChevronRight, AlertCircle, Clock, Phone, Edit2, Plus, FileText
} from 'lucide-react';

type TabType = 'overview' | 'enquiries' | 'doctors' | 'departments' | 'insurance' | 'settings';

interface Enquiry {
  id: string;
  patientName: string;
  condition: string;
  department: string;
  message: string;
  createdAt: string;
  status: 'new' | 'responded' | 'converted';
  phone?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  profileViews: number;
  appointments: number;
  isVerified: boolean;
}

export default function HospitalDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hospitalName, setHospitalName] = useState('Apollo Hospitals Chennai');
  const [plan, setPlan] = useState('professional');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const [stats] = useState({
    profileViews: 12450,
    enquiries: 234,
    conversions: 89,
    activeDoctors: 156,
    rating: 4.6,
    reviews: 892,
  });

  const [enquiries] = useState<Enquiry[]>([
    {
      id: '1',
      patientName: 'Rajesh Kumar',
      condition: 'Heart Surgery Consultation',
      department: 'Cardiology',
      message: 'Looking for bypass surgery cost estimate and doctor availability',
      createdAt: '2024-01-15T10:30:00Z',
      status: 'new',
      phone: '+91-98765XXXXX',
    },
    {
      id: '2',
      patientName: 'Priya Sharma',
      condition: 'Knee Replacement',
      department: 'Orthopedics',
      message: 'Need quote for bilateral knee replacement with 5-day stay',
      createdAt: '2024-01-14T14:20:00Z',
      status: 'responded',
    },
    {
      id: '3',
      patientName: 'Ahmed Khan',
      condition: 'Cancer Treatment',
      department: 'Oncology',
      message: 'Second opinion for stage 2 breast cancer treatment',
      createdAt: '2024-01-13T09:15:00Z',
      status: 'converted',
    },
  ]);

  const [doctors] = useState<Doctor[]>([
    { id: '1', name: 'Dr. Prathap Reddy', specialty: 'Cardiology', profileViews: 3420, appointments: 156, isVerified: true },
    { id: '2', name: 'Dr. Suresh Menon', specialty: 'Orthopedics', profileViews: 2890, appointments: 98, isVerified: true },
    { id: '3', name: 'Dr. Lakshmi Nair', specialty: 'Oncology', profileViews: 2150, appointments: 67, isVerified: true },
    { id: '4', name: 'Dr. Ramesh Iyer', specialty: 'Neurology', profileViews: 1980, appointments: 54, isVerified: false },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    responded: 'bg-amber-100 text-amber-700',
    converted: 'bg-emerald-100 text-emerald-700',
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_session');
    window.location.href = '/provider/hospital/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-600/30 border-t-teal-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Building2 size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 truncate">{hospitalName}</p>
              <p className="text-xs text-slate-500 capitalize">{plan} Plan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
            { id: 'enquiries' as TabType, label: 'Enquiries', icon: MessageSquare, badge: 12 },
            { id: 'doctors' as TabType, label: 'Doctors', icon: Users },
            { id: 'departments' as TabType, label: 'Departments', icon: Building2 },
            { id: 'insurance' as TabType, label: 'Insurance', icon: Shield },
            { id: 'settings' as TabType, label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-teal-600 text-white text-xs">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Upgrade Banner */}
        {plan === 'basic' && (
          <div className="p-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
              <Zap size={20} className="mb-2" />
              <p className="font-semibold text-sm mb-1">Upgrade to Pro</p>
              <p className="text-xs text-teal-100 mb-3">
                Get unlimited enquiries and analytics
              </p>
              <Link
                href="/pricing"
                className="block text-center py-2 rounded-lg bg-white text-teal-700 text-sm font-semibold hover:bg-teal-50"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'enquiries' && 'Patient Enquiries'}
              {activeTab === 'doctors' && 'Doctor Management'}
              {activeTab === 'departments' && 'Departments'}
              {activeTab === 'insurance' && 'Insurance Partners'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-sm text-slate-500">Welcome back! Here&apos;s what&apos;s happening.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/hospitals/apollo-hospitals-chennai`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
            >
              <Eye size={16} />
              View Profile
            </Link>
            <Link
              href="/provider/hospital/edit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
            >
              <Edit2 size={16} />
              Edit Profile
            </Link>
          </div>
        </header>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Profile Views', value: stats.profileViews.toLocaleString(), icon: Eye, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Enquiries', value: stats.enquiries, icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Conversions', value: stats.conversions, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Active Doctors', value: stats.activeDoctors, icon: Users, color: 'text-teal-600 bg-teal-50' },
                  { label: 'Rating', value: stats.rating.toFixed(1), icon: Star, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Reviews', value: stats.reviews, icon: FileText, color: 'text-pink-600 bg-pink-50' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Enquiries */}
              <div className="bg-white rounded-2xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Recent Enquiries</h2>
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight size={16} />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {enquiries.slice(0, 3).map((enquiry) => (
                    <div key={enquiry.id} className="px-6 py-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900">{enquiry.patientName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[enquiry.status]}`}>
                            {enquiry.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{enquiry.condition}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(enquiry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100">
                        Respond
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Doctors */}
              <div className="bg-white rounded-2xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Top Performing Doctors</h2>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    Manage Doctors <ChevronRight size={16} />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {doctors.slice(0, 4).map((doctor) => (
                    <div key={doctor.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users size={18} className="text-slate-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{doctor.name}</span>
                            {doctor.isVerified && (
                              <Shield size={14} className="text-emerald-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{doctor.profileViews.toLocaleString()} views</p>
                        <p className="text-sm text-slate-500">{doctor.appointments} appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enquiries Tab */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-3">
                {['all', 'new', 'responded', 'converted'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      filter === 'all'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Enquiry List */}
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {enquiries.map((enquiry) => (
                  <div key={enquiry.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{enquiry.patientName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[enquiry.status]}`}>
                            {enquiry.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">{enquiry.condition}</span> • {enquiry.department}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 mb-4">{enquiry.message}</p>
                    <div className="flex items-center gap-3">
                      {enquiry.phone && (
                        <a
                          href={`tel:${enquiry.phone}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100"
                        >
                          <Phone size={16} />
                          Call Patient
                        </a>
                      )}
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                        <MessageSquare size={16} />
                        Send Response
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-slate-600">{doctors.length} doctors registered</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                  <UserPlus size={16} />
                  Add Doctor
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-6 py-4 text-left">Doctor</th>
                      <th className="px-6 py-4 text-left">Specialty</th>
                      <th className="px-6 py-4 text-center">Profile Views</th>
                      <th className="px-6 py-4 text-center">Appointments</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <Users size={18} className="text-slate-500" />
                            </div>
                            <span className="font-medium text-slate-900">{doctor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{doctor.specialty}</td>
                        <td className="px-6 py-4 text-center font-medium">{doctor.profileViews.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center font-medium">{doctor.appointments}</td>
                        <td className="px-6 py-4 text-center">
                          {doctor.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                              <Shield size={12} /> Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div className="text-center py-16 text-slate-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-30" />
              <p className="mb-4">Department management coming soon.</p>
              <button className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium">
                <Plus size={16} className="inline mr-2" />
                Add Department
              </button>
            </div>
          )}

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div className="text-center py-16 text-slate-500">
              <Shield size={48} className="mx-auto mb-4 opacity-30" />
              <p className="mb-4">Insurance partner management coming soon.</p>
              <button className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium">
                <Plus size={16} className="inline mr-2" />
                Add Insurance Partner
              </button>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Hospital Name</label>
                      <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                      Save Changes
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Subscription</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 capitalize">{plan} Plan</p>
                      <p className="text-sm text-slate-500">Renews on March 1, 2024</p>
                    </div>
                    <Link
                      href="/pricing"
                      className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
                    >
                      Manage Plan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
