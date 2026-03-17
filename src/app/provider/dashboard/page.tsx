'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, TrendingUp, Award, Eye,
    Search, Phone, Video, ChevronRight, Shield,
    ArrowUpRight, Clock, Star, AlertCircle, Zap, LogOut,
    User, Globe, MapPin, Building, Lock, CheckCircle,
    Edit3, Save, X, Briefcase, GraduationCap, Languages
} from 'lucide-react';
import { ProviderAuthGate, providerLogout } from '@/components/provider/AuthGate';

/**
 * Doctor Portal Dashboard
 *
 * Glassmorphism sidebar + data cards design.
 * Shows: leads, analytics, profile, subscription status.
 * Protected by ProviderAuthGate.
 */

interface Lead {
    id: string;
    intentLevel: string;
    intentScore: number | null;
    conditionSlug: string;
    specialtyMatched: string;
    geography: string | null;
    summary: string | null;
    urgency: string | null;
    isViewed: boolean;
    contactRevealed: boolean;
    createdAt: string;
}

interface DashboardData {
    leads: {
        leads: Lead[];
        pagination: { total: number; totalPages: number };
        unviewedCount: number;
    };
    analytics: {
        profileViews: number;
        searchAppearances: number;
        totalLeads: number;
        contactReveals: number;
        teleconsults: number;
    };
    badge: { score: number; rank: number | null; label: string | null } | null;
    doctor: { name: string; tier: string } | null;
}

interface ProfileData {
    profile: {
        id: number;
        slug: string;
        name: string;
        bio: string | null;
        experienceYears: number | null;
        qualifications: string[];
        email: string;
        phone: string;
        city: string;
        specialty: string;
        clinicName: string;
        clinicAddress: string | null;
        websiteUrl: string | null;
        consultationFee: number | null;
        teleconsultFee: number | null;
        availableHours: string;
        languages: string[];
        education: Array<{ degree: string; institution: string; year?: number }>;
        certifications: string[];
    };
    subscription: {
        tier: string;
        isPremium: boolean;
        plan: string;
        status: string;
        conditionsUsed: number;
        leadCreditsUsed: number;
        leadCreditsTotal: number;
        periodEnd: string | null;
    };
    features: {
        maxConditions: number;
        leadCreditsPerMonth: number;
        canShowWebsite: boolean;
        canShowClinicAddress: boolean;
        canShowPhone: boolean;
        canEditBio: boolean;
        hasAnalytics: boolean;
        hasTelelink: boolean;
        priorityListing: boolean;
        aiPoweredBio: boolean;
        leadScoring: boolean;
    };
    meta: {
        isVerified: boolean;
        badgeScore: number;
        badgeLabel: string | null;
        profileCompletion: number;
        createdAt: string;
    };
}

type TabType = 'leads' | 'analytics' | 'profile' | 'subscription';

export default function ProviderDashboard() {
    return (
        <ProviderAuthGate>
            {({ doctorId, doctorName }) => (
                <DashboardContent initialDoctorId={doctorId} initialDoctorName={doctorName} />
            )}
        </ProviderAuthGate>
    );
}

interface DashboardContentProps {
    initialDoctorId: string;
    initialDoctorName: string;
}

function getAuthToken(): string | null {
    try {
        const sessionData = localStorage.getItem('provider_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.expiresAt > Date.now()) {
                return session.token;
            }
        }
    } catch {
        // Invalid session
    }
    return null;
}

function DashboardContent({ initialDoctorId, initialDoctorName }: DashboardContentProps) {
    // Doctor ID is passed from authenticated AuthGate - no default fallback
    const [doctorId] = useState<string>(initialDoctorId);

    useEffect(() => {
        // Check for upgrade success
        const params = new URLSearchParams(window.location.search);
        if (params.get('upgraded') === 'true') {
            setSuccessMessage('Successfully upgraded! Your new features are now active.');
            setTimeout(() => setSuccessMessage(null), 5000);
            // Remove query param from URL
            window.history.replaceState({}, '', '/provider/dashboard');
        }
    }, []);

    const [tab, setTab] = useState<TabType>('leads');
    const [data, setData] = useState<DashboardData | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [intentFilter, setIntentFilter] = useState<string>('');
    const [revealingLead, setRevealingLead] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Record<string, unknown>>({});
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        fetchDashboard();
        fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intentFilter, doctorId]);

    async function fetchDashboard() {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const params = new URLSearchParams({ doctorId });
            if (intentFilter) params.set('intent', intentFilter);
            const res = await fetch(`/api/provider/leads?${params}`, {
                headers: {
                    'X-Provider-Token': token,
                },
            });

            if (res.status === 401) {
                // Session invalid, redirect to login
                localStorage.removeItem('provider_session');
                localStorage.removeItem('provider_doctor_id');
                window.location.href = '/provider/login';
                return;
            }

            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchProfile() {
        setProfileLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const res = await fetch(`/api/provider/profile?doctorId=${doctorId}`, {
                headers: {
                    'X-Provider-Token': token,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem('provider_session');
                localStorage.removeItem('provider_doctor_id');
                window.location.href = '/provider/login';
                return;
            }

            const json = await res.json();
            setProfileData(json);
            // Initialize form with current values
            setProfileForm({
                name: json.profile?.name || '',
                phone: json.profile?.phone || '',
                city: json.profile?.city || '',
                specialty: json.profile?.specialty || '',
                clinicName: json.profile?.clinicName || '',
                experienceYears: json.profile?.experienceYears || '',
                bio: json.profile?.bio || '',
                websiteUrl: json.profile?.websiteUrl || '',
                clinicAddress: json.profile?.clinicAddress || '',
                consultationFee: json.profile?.consultationFee || '',
                teleconsultFee: json.profile?.teleconsultFee || '',
                availableHours: json.profile?.availableHours || '',
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setProfileLoading(false);
        }
    }

    async function saveProfile() {
        setSavingProfile(true);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const res = await fetch('/api/provider/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Provider-Token': token,
                },
                body: JSON.stringify({
                    doctorId: parseInt(doctorId, 10),
                    ...profileForm,
                    experienceYears: profileForm.experienceYears ? parseInt(String(profileForm.experienceYears), 10) : undefined,
                    consultationFee: profileForm.consultationFee ? parseInt(String(profileForm.consultationFee), 10) : undefined,
                    teleconsultFee: profileForm.teleconsultFee ? parseInt(String(profileForm.teleconsultFee), 10) : undefined,
                }),
            });
            const json = await res.json();
            if (res.ok) {
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
                setEditingProfile(false);
                await fetchProfile();
                await fetchDashboard(); // Refresh name in sidebar
            } else {
                setErrorMessage(json.error || 'Failed to update profile');
                setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            setErrorMessage('Failed to save profile. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleRevealContact(leadId: string) {
        setRevealingLead(leadId);
        try {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/provider/login';
                return;
            }

            const res = await fetch('/api/provider/leads/reveal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Provider-Token': token,
                },
                body: JSON.stringify({ leadId, doctorId }),
            });
            if (res.ok) {
                // Refresh dashboard to show updated lead
                await fetchDashboard();
            } else {
                const error = await res.json();
                setErrorMessage(error.message || 'Failed to reveal contact. You may not have enough credits.');
                setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (error) {
            console.error('Failed to reveal contact:', error);
            setErrorMessage('Failed to reveal contact. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setRevealingLead(null);
        }
    }

    function handleTeleLink(leadId: string) {
        // TODO: Implement tele-link booking flow
        window.open(`/provider/telelink?leadId=${leadId}`, '_blank');
    }

    function handleUpgrade(plan: string) {
        if (plan === 'Enterprise' || plan === 'Contact Sales') {
            window.location.href = '/contact?subject=Enterprise%20Plan%20Inquiry';
        } else {
            window.location.href = `/provider/subscribe?plan=${plan.toLowerCase()}`;
        }
    }

    const intentColors: Record<string, string> = {
        high: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
        medium: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
        low: 'bg-slate-500/20 text-slate-300 border-slate-500/20',
    };

    return (
        <div className="min-h-screen flex">
            {/* Error Toast */}
            {errorMessage && (
                <div className="fixed top-4 right-4 z-50 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2 max-w-md">
                    <AlertCircle size={16} />
                    {errorMessage}
                </div>
            )}
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2 max-w-md">
                    <CheckCircle size={16} />
                    {successMessage}
                </div>
            )}
            {/* ── Sidebar ──────────────────────────────── */}
            <aside className="w-64 flex-shrink-0 glass-card rounded-none border-r border-white/5
                        flex flex-col p-6 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                        <Shield size={20} className="text-primary-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{data?.doctor?.name || 'Doctor Portal'}</p>
                        <p className="text-xs text-surface-100/40 capitalize">{data?.doctor?.tier || 'Free'} Plan</p>
                    </div>
                </div>

                {/* Badge */}
                {data?.badge?.label && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                        <Award size={16} className="text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">{data.badge.label} in your city</span>
                    </div>
                )}

                {/* Nav */}
                <nav className="space-y-1 flex-1">
                    {[
                        { id: 'leads' as TabType, icon: Users, label: 'Active Leads', badge: data?.leads.unviewedCount },
                        { id: 'profile' as TabType, icon: User, label: 'My Profile' },
                        { id: 'analytics' as TabType, icon: TrendingUp, label: 'Performance' },
                        { id: 'subscription' as TabType, icon: Zap, label: 'Subscription' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${tab === item.id
                                ? 'bg-primary-600/15 text-primary-300 font-medium'
                                : 'text-surface-100/50 hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                            {item.badge && item.badge > 0 && (
                                <span className="ml-auto px-2 py-0.5 rounded-full bg-primary-600/30 text-primary-300 text-xs">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                          text-surface-100/40 hover:bg-white/5 transition-all">
                    <Video size={16} /> Tele-Link Settings
                </button>

                <button
                    onClick={providerLogout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                              text-rose-400/60 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </aside>

            {/* ── Main Content ─────────────────────────── */}
            <main className="flex-1 p-8 space-y-8 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-500/30 border-t-primary-400 rounded-full" />
                    </div>
                ) : (
                    <>
                        {/* Analytics Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: 'Profile Views', value: data?.analytics.profileViews || 0, icon: Eye, color: 'text-blue-400' },
                                { label: 'Search Hits', value: data?.analytics.searchAppearances || 0, icon: Search, color: 'text-purple-400' },
                                { label: 'Total Leads', value: data?.analytics.totalLeads || 0, icon: Users, color: 'text-emerald-400' },
                                { label: 'Contacts', value: data?.analytics.contactReveals || 0, icon: Phone, color: 'text-amber-400' },
                                { label: 'Teleconsults', value: data?.analytics.teleconsults || 0, icon: Video, color: 'text-pink-400' },
                            ].map((stat) => (
                                <div key={stat.label} className="glass-card p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <stat.icon size={16} className={stat.color} />
                                        <ArrowUpRight size={14} className="text-surface-100/20" />
                                    </div>
                                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                                    <p className="text-xs text-surface-100/40">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Leads Tab */}
                        {tab === 'leads' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <LayoutDashboard size={20} className="text-primary-400" />
                                        Active Leads
                                    </h2>
                                    <div className="flex gap-2">
                                        {['', 'high', 'medium', 'low'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setIntentFilter(f)}
                                                className={`px-3 py-1.5 rounded-full text-xs transition-all ${intentFilter === f
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white/5 text-surface-100/50 hover:bg-white/10'
                                                    }`}
                                            >
                                                {f || 'All'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {data?.leads.leads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            className={`glass-card p-5 transition-all hover:scale-[1.01] ${!lead.isViewed ? 'border-l-2 border-l-primary-500' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${intentColors[lead.intentLevel] || intentColors.low
                                                            }`}>
                                                            {lead.intentLevel.toUpperCase()} INTENT
                                                        </span>
                                                        {lead.urgency && lead.urgency !== 'routine' && (
                                                            <span className="flex items-center gap-1 text-xs text-amber-400">
                                                                <AlertCircle size={12} /> {lead.urgency}
                                                            </span>
                                                        )}
                                                        {!lead.isViewed && (
                                                            <span className="text-xs text-primary-400">● New</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-surface-100/80 leading-relaxed">
                                                        {lead.summary || `Patient seeking ${lead.specialtyMatched} for ${lead.conditionSlug}`}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-surface-100/40">
                                                        {lead.geography && (
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                {lead.geography}
                                                            </span>
                                                        )}
                                                        <span>
                                                            <Clock size={10} className="inline mr-1" />
                                                            {new Date(lead.createdAt).toLocaleDateString()}
                                                        </span>
                                                        {lead.intentScore && (
                                                            <span>Score: {(lead.intentScore * 100).toFixed(0)}%</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 ml-4">
                                                    {lead.contactRevealed ? (
                                                        <button
                                                            onClick={() => window.open(`tel:+${lead.id}`, '_self')}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                             bg-emerald-600/20 text-emerald-300 text-xs hover:bg-emerald-600/30 transition-all"
                                                        >
                                                            <Phone size={12} /> Contact
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRevealContact(lead.id)}
                                                            disabled={revealingLead === lead.id}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                             bg-primary-600/20 text-primary-300 text-xs hover:bg-primary-600/30 transition-all disabled:opacity-50"
                                                        >
                                                            <Eye size={12} /> {revealingLead === lead.id ? 'Revealing...' : 'Reveal (1 credit)'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleTeleLink(lead.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                           bg-white/5 text-surface-100/50 text-xs hover:bg-white/10 transition-all"
                                                    >
                                                        <Video size={12} /> Tele-Link
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!data?.leads.leads || data.leads.leads.length === 0) && (
                                        <div className="text-center py-16 text-surface-100/30">
                                            <Users size={40} className="mx-auto mb-4 opacity-30" />
                                            <p>No leads yet. As patients search for your specialty in your area, leads will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {tab === 'analytics' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <TrendingUp size={20} className="text-primary-400" />
                                    Search Performance
                                </h2>
                                <div className="glass-card p-8 text-center text-surface-100/40">
                                    <p>Performance charts will be populated once you have 7+ days of data.</p>
                                    <p className="text-xs mt-2">Profile views, search appearances, and lead conversion rate over time.</p>
                                </div>

                                {data?.badge && (
                                    <div className="glass-card p-6 space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Award size={18} className="text-emerald-400" />
                                            Specialist Ranking
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-20 h-20">
                                                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="2"
                                                        strokeDasharray={`${data.badge.score} ${100 - data.badge.score}`} strokeLinecap="round" />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                                                    {data.badge.score.toFixed(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{data.badge.label || 'Unranked'}</p>
                                                <p className="text-xs text-surface-100/40">
                                                    Based on profile completeness, ratings, reviews, and lead outcomes.
                                                </p>
                                                <p className="text-xs text-surface-100/30 mt-1">
                                                    <Star size={10} className="inline text-amber-400" /> Complete your profile to improve your score.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {tab === 'profile' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <User size={20} className="text-primary-400" />
                                        My Profile
                                    </h2>
                                    {!editingProfile ? (
                                        <button
                                            onClick={() => setEditingProfile(true)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600/20 text-primary-300 text-sm hover:bg-primary-600/30 transition-all"
                                        >
                                            <Edit3 size={14} /> Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingProfile(false)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-surface-100/50 text-sm hover:bg-white/10 transition-all"
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                            <button
                                                onClick={saveProfile}
                                                disabled={savingProfile}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-500 transition-all disabled:opacity-50"
                                            >
                                                <Save size={14} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {profileLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin w-8 h-8 border-2 border-primary-500/30 border-t-primary-400 rounded-full" />
                                    </div>
                                ) : profileData && (
                                    <>
                                        {/* Profile Completion & Preview Link */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="glass-card p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm text-surface-100/60">Profile Completion</span>
                                                    <span className="text-lg font-bold text-primary-400">{profileData.meta.profileCompletion}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary-600 to-emerald-500 transition-all duration-500"
                                                        style={{ width: `${profileData.meta.profileCompletion}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-surface-100/40 mt-2">
                                                    Complete your profile to improve visibility in search results
                                                </p>
                                            </div>
                                            <div className="glass-card p-5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-surface-100/60">Your Public Profile</p>
                                                    <p className="text-xs text-surface-100/40 mt-1">
                                                        healz.ai/doctor/{profileData.profile.slug}
                                                    </p>
                                                </div>
                                                <a
                                                    href={`/doctor/${profileData.profile.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-surface-100/70 text-sm hover:bg-white/10 transition-all"
                                                >
                                                    <Eye size={14} /> Preview
                                                </a>
                                            </div>
                                        </div>

                                        {/* Feature Status Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Conditions', used: profileData.subscription.conditionsUsed, max: profileData.features.maxConditions, icon: Briefcase },
                                                { label: 'Lead Credits', used: profileData.subscription.leadCreditsUsed, max: profileData.subscription.leadCreditsTotal, icon: Users },
                                                { label: 'Analytics', enabled: profileData.features.hasAnalytics, icon: TrendingUp },
                                                { label: 'Tele-Link', enabled: profileData.features.hasTelelink, icon: Video },
                                            ].map((feat) => (
                                                <div key={feat.label} className="glass-card p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <feat.icon size={14} className={feat.enabled === false ? 'text-surface-100/30' : 'text-primary-400'} />
                                                        <span className="text-xs text-surface-100/60">{feat.label}</span>
                                                    </div>
                                                    {'max' in feat ? (
                                                        <p className="text-sm font-medium">
                                                            {feat.used} / {feat.max}
                                                        </p>
                                                    ) : (
                                                        <p className={`text-sm font-medium flex items-center gap-1 ${feat.enabled ? 'text-emerald-400' : 'text-surface-100/30'}`}>
                                                            {feat.enabled ? <CheckCircle size={12} /> : <Lock size={12} />}
                                                            {feat.enabled ? 'Enabled' : 'Premium'}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Basic Information */}
                                        <div className="glass-card p-6 space-y-5">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <User size={16} className="text-primary-400" />
                                                Basic Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1">Full Name</label>
                                                    {editingProfile ? (
                                                        <input
                                                            type="text"
                                                            value={String(profileForm.name || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{profileData.profile.name}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1">Email</label>
                                                    <p className="text-sm text-surface-100/60">{profileData.profile.email}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1 flex items-center gap-1">
                                                        Phone
                                                        {!profileData.features.canShowPhone && (
                                                            <span className="text-amber-400/60"><Lock size={10} /></span>
                                                        )}
                                                    </label>
                                                    {editingProfile ? (
                                                        <input
                                                            type="tel"
                                                            value={String(profileForm.phone || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">
                                                            {profileData.profile.phone || <span className="text-surface-100/30">Not set</span>}
                                                            {!profileData.features.canShowPhone && profileData.profile.phone && (
                                                                <span className="text-xs text-amber-400/60 ml-2">(Hidden on profile)</span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1">Years of Experience</label>
                                                    {editingProfile ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="80"
                                                            value={String(profileForm.experienceYears || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{profileData.profile.experienceYears || <span className="text-surface-100/30">Not set</span>} years</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Practice Details */}
                                        <div className="glass-card p-6 space-y-5">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Building size={16} className="text-primary-400" />
                                                Practice Details
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1">Specialty</label>
                                                    {editingProfile ? (
                                                        <input
                                                            type="text"
                                                            value={String(profileForm.specialty || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{profileData.profile.specialty || <span className="text-surface-100/30">Not set</span>}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1">City</label>
                                                    {editingProfile ? (
                                                        <input
                                                            type="text"
                                                            value={String(profileForm.city || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{profileData.profile.city || <span className="text-surface-100/30">Not set</span>}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1">Clinic / Hospital Name</label>
                                                    {editingProfile ? (
                                                        <input
                                                            type="text"
                                                            value={String(profileForm.clinicName || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{profileData.profile.clinicName || <span className="text-surface-100/30">Not set</span>}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-surface-100/50 mb-1">Consultation Fee (₹)</label>
                                                    {editingProfile ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={String(profileForm.consultationFee || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">
                                                            {profileData.profile.consultationFee
                                                                ? `₹${profileData.profile.consultationFee.toLocaleString()}`
                                                                : <span className="text-surface-100/30">Not set</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Premium Features */}
                                        <div className={`glass-card p-6 space-y-5 ${!profileData.subscription.isPremium ? 'border border-amber-500/20' : ''}`}>
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <Zap size={16} className="text-amber-400" />
                                                    Premium Features
                                                </h3>
                                                {!profileData.subscription.isPremium && (
                                                    <button
                                                        onClick={() => handleUpgrade('premium')}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30 transition-all"
                                                    >
                                                        <Zap size={12} /> Upgrade to Unlock
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <label className="block text-xs text-surface-100/50 mb-1 flex items-center gap-1">
                                                        <Globe size={10} />
                                                        Website URL
                                                        {!profileData.features.canShowWebsite && <Lock size={10} className="text-amber-400/60" />}
                                                    </label>
                                                    {editingProfile && profileData.features.canShowWebsite ? (
                                                        <input
                                                            type="url"
                                                            value={String(profileForm.websiteUrl || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                                                            placeholder="https://your-website.com"
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className={`text-sm ${!profileData.features.canShowWebsite ? 'text-surface-100/30' : ''}`}>
                                                            {profileData.features.canShowWebsite
                                                                ? (profileData.profile.websiteUrl || <span className="text-surface-100/30">Not set</span>)
                                                                : 'Upgrade to Premium to add website'
                                                            }
                                                        </p>
                                                    )}
                                                    {!profileData.features.canShowWebsite && (
                                                        <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-[1px] rounded-lg" />
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <label className="block text-xs text-surface-100/50 mb-1 flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        Clinic Address
                                                        {!profileData.features.canShowClinicAddress && <Lock size={10} className="text-amber-400/60" />}
                                                    </label>
                                                    {editingProfile && profileData.features.canShowClinicAddress ? (
                                                        <input
                                                            type="text"
                                                            value={String(profileForm.clinicAddress || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, clinicAddress: e.target.value })}
                                                            placeholder="Full clinic address"
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <p className={`text-sm ${!profileData.features.canShowClinicAddress ? 'text-surface-100/30' : ''}`}>
                                                            {profileData.features.canShowClinicAddress
                                                                ? (profileData.profile.clinicAddress || <span className="text-surface-100/30">Not set</span>)
                                                                : 'Upgrade to show full address'
                                                            }
                                                        </p>
                                                    )}
                                                    {!profileData.features.canShowClinicAddress && (
                                                        <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-[1px] rounded-lg" />
                                                    )}
                                                </div>
                                                <div className="relative md:col-span-2">
                                                    <label className="block text-xs text-surface-100/50 mb-1 flex items-center gap-1">
                                                        Bio / About
                                                        {!profileData.features.canEditBio && <Lock size={10} className="text-amber-400/60" />}
                                                    </label>
                                                    {editingProfile && profileData.features.canEditBio ? (
                                                        <textarea
                                                            value={String(profileForm.bio || '')}
                                                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                                            rows={4}
                                                            maxLength={2000}
                                                            placeholder="Tell patients about your experience, approach to care, and specializations..."
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-primary-500/50 focus:outline-none resize-none"
                                                        />
                                                    ) : (
                                                        <p className={`text-sm ${!profileData.features.canEditBio ? 'text-surface-100/30' : ''}`}>
                                                            {profileData.features.canEditBio
                                                                ? (profileData.profile.bio || <span className="text-surface-100/30">Not set</span>)
                                                                : 'Upgrade to Premium to add a detailed bio'
                                                            }
                                                        </p>
                                                    )}
                                                    {!profileData.features.canEditBio && (
                                                        <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-[1px] rounded-lg" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Premium Feature Checklist */}
                                            {!profileData.subscription.isPremium && (
                                                <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                                    <p className="text-sm text-amber-300/80 mb-3">Upgrade to Premium to unlock:</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-surface-100/60">
                                                        {[
                                                            'Display website URL on profile',
                                                            'Show full clinic address',
                                                            'Add detailed bio',
                                                            'Display phone number',
                                                            'Priority search listing',
                                                            '50 lead credits/month',
                                                            '15 condition specialties',
                                                            'Full analytics dashboard',
                                                            'Tele-Link video consults',
                                                            'AI-powered profile optimization',
                                                        ].map((feat) => (
                                                            <div key={feat} className="flex items-center gap-2">
                                                                <CheckCircle size={10} className="text-amber-400/60" />
                                                                {feat}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Subscription Tab */}
                        {tab === 'subscription' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Zap size={20} className="text-primary-400" />
                                    Subscription & Billing
                                </h2>

                                {/* Current Status */}
                                {profileData?.subscription && (
                                    <div className="glass-card p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                profileData.subscription.isPremium ? 'bg-amber-500/20' : 'bg-white/5'
                                            }`}>
                                                <Zap size={24} className={profileData.subscription.isPremium ? 'text-amber-400' : 'text-surface-100/40'} />
                                            </div>
                                            <div>
                                                <p className="font-semibold capitalize">{profileData.subscription.tier} Plan</p>
                                                <p className="text-xs text-surface-100/50">
                                                    {profileData.subscription.periodEnd
                                                        ? `Renews ${new Date(profileData.subscription.periodEnd).toLocaleDateString()}`
                                                        : 'No expiration'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-surface-100/60">Lead Credits</p>
                                            <p className="font-bold">
                                                {profileData.subscription.leadCreditsUsed} / {profileData.subscription.leadCreditsTotal}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Plan Comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        {
                                            name: 'Free',
                                            price: '₹0',
                                            priceNote: 'forever',
                                            conditions: 2,
                                            features: [
                                                { text: 'Basic profile listing', included: true },
                                                { text: '2 condition specialties', included: true },
                                                { text: '5 lead credits/month', included: true },
                                                { text: 'Community search listing', included: true },
                                                { text: 'Website URL on profile', included: false },
                                                { text: 'Full clinic address', included: false },
                                                { text: 'Phone number display', included: false },
                                                { text: 'Custom bio', included: false },
                                                { text: 'Analytics dashboard', included: false },
                                                { text: 'Tele-Link video consults', included: false },
                                            ],
                                            cta: 'Current Plan',
                                            isActive: data?.doctor?.tier === 'free',
                                        },
                                        {
                                            name: 'Premium',
                                            price: '₹4,999',
                                            priceNote: '/month',
                                            conditions: 15,
                                            features: [
                                                { text: 'Priority profile listing', included: true },
                                                { text: '15 condition specialties', included: true },
                                                { text: '50 lead credits/month', included: true },
                                                { text: 'Top of search results', included: true },
                                                { text: 'Website URL on profile', included: true },
                                                { text: 'Full clinic address', included: true },
                                                { text: 'Phone number display', included: true },
                                                { text: 'Custom bio with AI assist', included: true },
                                                { text: 'Full analytics dashboard', included: true },
                                                { text: 'Tele-Link video consults', included: true },
                                            ],
                                            cta: 'Upgrade Now',
                                            isActive: data?.doctor?.tier === 'premium',
                                            highlighted: true,
                                        },
                                        {
                                            name: 'Enterprise',
                                            price: '₹19,999',
                                            priceNote: '/month',
                                            conditions: 1000,
                                            features: [
                                                { text: 'Featured "Top Doctor" badge', included: true },
                                                { text: 'Unlimited condition specialties', included: true },
                                                { text: '500 lead credits/month', included: true },
                                                { text: 'Guaranteed top 3 in search', included: true },
                                                { text: 'All Premium features', included: true },
                                                { text: 'Dedicated account manager', included: true },
                                                { text: 'Custom branding options', included: true },
                                                { text: 'Multi-location support', included: true },
                                                { text: 'API access & integrations', included: true },
                                                { text: 'Priority support (24/7)', included: true },
                                            ],
                                            cta: 'Contact Sales',
                                            isActive: data?.doctor?.tier === 'enterprise',
                                        },
                                    ].map((plan) => (
                                        <div
                                            key={plan.name}
                                            className={`glass-card p-6 space-y-4 transition-all ${plan.highlighted ? 'border-primary-500/30 md:scale-105 relative' : ''
                                                } ${plan.isActive ? 'ring-2 ring-emerald-500/30' : ''}`}
                                        >
                                            {plan.highlighted && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-600 text-xs font-medium">
                                                    Most Popular
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold">{plan.name}</h3>
                                                <p className="text-2xl font-bold mt-1">
                                                    {plan.price}
                                                    <span className="text-sm font-normal text-surface-100/40"> {plan.priceNote}</span>
                                                </p>
                                            </div>
                                            <ul className="space-y-2">
                                                {plan.features.map((f) => (
                                                    <li key={f.text} className={`flex items-center gap-2 text-sm ${f.included ? 'text-surface-100/70' : 'text-surface-100/30'}`}>
                                                        {f.included ? (
                                                            <CheckCircle size={12} className="text-emerald-400" />
                                                        ) : (
                                                            <X size={12} className="text-surface-100/20" />
                                                        )}
                                                        {f.text}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                onClick={() => !plan.isActive && handleUpgrade(plan.name)}
                                                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${plan.isActive
                                                    ? 'bg-emerald-600/20 text-emerald-300 cursor-default'
                                                    : plan.highlighted
                                                        ? 'bg-primary-600 text-white hover:bg-primary-500'
                                                        : 'bg-white/5 text-surface-100/70 hover:bg-white/10'
                                                    }`}
                                                disabled={plan.isActive}
                                            >
                                                {plan.isActive ? '✓ Current Plan' : plan.cta}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* FAQ */}
                                <div className="glass-card p-6 space-y-4">
                                    <h3 className="font-semibold">Frequently Asked Questions</h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-surface-100/80 font-medium">What are lead credits?</p>
                                            <p className="text-surface-100/50 mt-1">Lead credits let you reveal contact information for patients who are searching for specialists in your area. Each reveal costs 1 credit.</p>
                                        </div>
                                        <div>
                                            <p className="text-surface-100/80 font-medium">Can I change plans anytime?</p>
                                            <p className="text-surface-100/50 mt-1">Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle.</p>
                                        </div>
                                        <div>
                                            <p className="text-surface-100/80 font-medium">What payment methods do you accept?</p>
                                            <p className="text-surface-100/50 mt-1">We accept all major credit/debit cards, UPI, and net banking through our secure payment partner Razorpay.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
