'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForDoctorsPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', specialty: '', city: '', experience: '', clinicName: '', bio: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateField = (field: string, value: string): string => {
        switch (field) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
                if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
                return '';
            case 'specialty':
                if (!value) return 'Please select a specialty';
                return '';
            case 'city':
                if (!value.trim()) return 'City is required';
                return '';
            default:
                return '';
        }
    };

    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (fieldErrors[field]) {
            const error = validateField(field, value);
            setFieldErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleFieldBlur = (field: string, value: string) => {
        const error = validateField(field, value);
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate all required fields
        const errors: Record<string, string> = {};
        ['name', 'email', 'password', 'specialty', 'city'].forEach(field => {
            const error = validateField(field, formData[field as keyof typeof formData]);
            if (error) errors[field] = error;
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please fix the errors above');
            setLoading(false);
            // Scroll to first error field
            const firstErrorField = Object.keys(errors)[0];
            document.querySelector(`[data-field="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        try {
            const res = await fetch('/api/doctor-join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create profile');
            }

            // Store session for auto-login
            if (data.session?.token) {
                localStorage.setItem('provider_session', JSON.stringify({
                    token: data.session.token,
                    doctorId: String(data.doctor.id),
                    doctorName: data.doctor.name,
                    email: data.doctor.email,
                    expiresAt: new Date(data.session.expiresAt).getTime(),
                }));
                localStorage.setItem('provider_doctor_id', String(data.doctor.id));
            }

            setSubmitted(true);

            // Redirect to dashboard after brief success message
            setTimeout(() => {
                router.push('/provider/dashboard');
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormData(prev => ({ ...prev, [key]: e.target.value }));

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-300 font-sans selection:bg-teal-500/30">
            {/* ── Navbar Spacer & Top Gradient ── */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none" />

            {/* ── Hero Section ── */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden border-b border-white/5">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 grid xl:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-8 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Built for Leading Practitioners</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
                            Scale your practice with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">Intelligent Matching</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-light">
                            Join over <strong className="text-white font-semibold">10,000+ verified doctors</strong> turning millions of monthly health inquiries into confirmed consultations, powered by aihealz's semantic patient-matching engine.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <a href="#join-form" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold overflow-hidden transition-all hover:scale-[1.02]">
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative">Claim Free Profile</span>
                                <svg className="w-4 h-4 relative transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                            <Link href="/for-doctors/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all hover:border-white/20">
                                View Premium Plans
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">2.4M+</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Monthly Patients</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">70k+</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Conditions Indexed</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">500+</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cities Covered</div>
                            </div>
                        </div>
                    </div>

                    {/* Features Display */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-blue-500/10 rounded-[2rem] blur-2xl flex-shrink-0" />
                        <div className="relative glass-card bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl space-y-6">
                            {[
                                { title: 'AI-Structured Bio', desc: 'Auto-generates your credentials into SEO-optimized content.' },
                                { title: 'High-Intent Leads', desc: 'Patients searching for your specific expertise and procedures.' },
                                { title: 'Top-tier Visibility', desc: 'Premium placement on corresponding condition and location pages.' },
                                { title: 'TeleHealth Integration', desc: 'Seamlessly connect your existing booking portal.' },
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Clinical Tools Section ── */}
            <section className="py-24 relative border-b border-white/5">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Professional Tools</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Clinical Decision Support</h2>
                        <p className="text-lg text-slate-400">Evidence-based tools built for medical professionals. Scoring systems, dosing calculators, and quick references.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { href: '/for-doctors/clinical-scores', iconPath: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', name: 'Clinical Scores', desc: 'Wells, CHADS-VASC, MELD, GCS, APACHE II, qSOFA, and 15+ validated scoring systems', badge: '15+ Scores' },
                            { href: '/for-doctors/surgical-checklist', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', name: 'Surgical Safety', desc: 'WHO Safe Surgery Checklist with Sign In, Time Out, and Sign Out phases', badge: 'WHO Standard' },
                            { href: '/for-doctors/drug-dosing', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', name: 'Drug Dosing', desc: 'Weight-based dosing, renal adjustments, and infusion rate calculators', badge: 'CrCl Adjusted' },
                            { href: '/for-doctors/quick-reference', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', name: 'Quick Reference', desc: 'RASS, CAM-ICU, ACLS drugs, antidotes, antibiotic spectrum, vent settings', badge: 'ICU Ready' },
                        ].map((tool) => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 hover:bg-slate-900/80 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.iconPath} />
                                        </svg>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full font-medium">
                                        {tool.badge}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                    {tool.name}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{tool.desc}</p>
                                <div className="mt-4 flex items-center text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open Tool
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Frictionless Onboarding</h2>
                        <p className="text-lg text-slate-400">Get discovered by patients globally in three simple steps.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { num: '01', title: 'Submit Credentials', desc: 'Complete the short application form. Takes less than 2 minutes.' },
                            { num: '02', title: 'Manual Verification', desc: 'Our clinical team cross-checks your medical licenses internally.' },
                            { num: '03', title: 'Profile Publication', desc: 'Your AI generated profile goes live, matching you instantly with patients.' },
                        ].map((step) => (
                            <div key={step.num} className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                                <div className="text-6xl font-black text-white/5 absolute top-4 right-4 group-hover:text-teal-500/10 transition-colors">{step.num}</div>
                                <div className="relative z-10 pt-10">
                                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Form Section ── */}
            <section id="join-form" className="py-24 relative overflow-hidden border-t border-white/5">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Create Your Profile</h2>
                        <p className="text-slate-400">Free profile gets you started instantly. Upgrade anytime for premium features.</p>
                    </div>

                    {submitted ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] p-12 text-center backdrop-blur-xl">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Profile Created!</h3>
                            <p className="text-emerald-200 mb-4">Redirecting you to your dashboard...</p>
                            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl">
                            {/* Account Credentials */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Account Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div data-field="name">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => handleFieldChange('name', e.target.value)}
                                            onBlur={e => handleFieldBlur('name', e.target.value)}
                                            placeholder="Dr. First Last"
                                            autoComplete="name"
                                            className={`w-full py-3 px-4 bg-black/50 border rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${fieldErrors.name ? 'border-red-500/50' : 'border-white/10'}`}
                                        />
                                        {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                                    </div>
                                    <div data-field="email">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Professional Email *</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => handleFieldChange('email', e.target.value)}
                                            onBlur={e => handleFieldBlur('email', e.target.value)}
                                            placeholder="doctor@clinic.com"
                                            autoComplete="email"
                                            className={`w-full py-3 px-4 bg-black/50 border rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${fieldErrors.email ? 'border-red-500/50' : 'border-white/10'}`}
                                        />
                                        {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                                    </div>
                                </div>
                                <div className="mt-4" data-field="password">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Password *</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={e => handleFieldChange('password', e.target.value)}
                                            onBlur={e => handleFieldBlur('password', e.target.value)}
                                            placeholder="Min 8 characters, 1 uppercase, 1 number"
                                            minLength={8}
                                            autoComplete="new-password"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                            spellCheck="false"
                                            className={`w-full py-3 px-4 pr-12 bg-black/50 border rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${fieldErrors.password ? 'border-red-500/50' : 'border-white/10'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
                                    {/* Password strength indicator */}
                                    {formData.password && !fieldErrors.password && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${
                                                        formData.password.length >= 12 ? 'w-full bg-emerald-500' :
                                                        formData.password.length >= 8 ? 'w-2/3 bg-amber-500' :
                                                        'w-1/3 bg-red-500'
                                                    }`}
                                                />
                                            </div>
                                            <span className={`text-xs ${
                                                formData.password.length >= 12 ? 'text-emerald-400' :
                                                formData.password.length >= 8 ? 'text-amber-400' :
                                                'text-red-400'
                                            }`}>
                                                {formData.password.length >= 12 ? 'Strong' : formData.password.length >= 8 ? 'Good' : 'Weak'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Info */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Professional Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6 mb-4">
                                    <div data-field="specialty">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Specialty *</label>
                                        <select
                                            required
                                            value={formData.specialty}
                                            onChange={e => handleFieldChange('specialty', e.target.value)}
                                            onBlur={e => handleFieldBlur('specialty', e.target.value)}
                                            className={`w-full py-3 px-4 bg-black/50 border rounded-xl text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer ${fieldErrors.specialty ? 'border-red-500/50' : 'border-white/10'}`}
                                        >
                                            <option value="" className="text-slate-500">Select Specialty...</option>
                                            {['Cardiology', 'Neurology', 'Psychiatry', 'Oncology', 'Orthopedics', 'Dermatology', 'Gastroenterology', 'Endocrinology', 'Pulmonology', 'Nephrology', 'Rheumatology', 'Pediatrics', 'Gynecology', 'Urology', 'Ophthalmology', 'ENT', 'Dentistry', 'General Medicine', 'Other'].map(s => (
                                                <option key={s} value={s} className="bg-slate-900">{s}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.specialty && <p className="text-red-400 text-xs mt-1">{fieldErrors.specialty}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Years of Experience</label>
                                        <input type="number" value={formData.experience} onChange={set('experience')} placeholder="10" min="0" max="60" className="w-full py-3 px-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div data-field="city">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Primary City *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.city}
                                            onChange={e => handleFieldChange('city', e.target.value)}
                                            onBlur={e => handleFieldBlur('city', e.target.value)}
                                            placeholder="Mumbai, New York, London..."
                                            autoComplete="address-level2"
                                            className={`w-full py-3 px-4 bg-black/50 border rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 outline-none transition-all ${fieldErrors.city ? 'border-red-500/50' : 'border-white/10'}`}
                                        />
                                        {fieldErrors.city && <p className="text-red-400 text-xs mt-1">{fieldErrors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => handleFieldChange('phone', e.target.value)}
                                            placeholder="+91 98765 43210"
                                            autoComplete="tel"
                                            className="w-full py-3 px-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Clinic Details */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Clinic Details <span className="text-xs text-slate-500 font-normal ml-2">(Optional)</span>
                                </h3>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Clinic / Hospital Name</label>
                                    <input type="text" value={formData.clinicName} onChange={set('clinicName')} placeholder="Apollo Hospitals, Mayo Clinic..." className="w-full py-3 px-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Brief Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={set('bio')}
                                        placeholder="Tell patients about your expertise, approach, and what makes you unique..."
                                        rows={3}
                                        maxLength={500}
                                        className="w-full py-3 px-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                                    />
                                    <p className="text-xs text-slate-600 mt-1">{formData.bio.length}/500 characters</p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 font-extrabold hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                        Creating Profile...
                                    </>
                                ) : (
                                    <>
                                        Create Free Profile
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-slate-500">
                                    Already have an account?{' '}
                                    <Link href="/provider/login" className="text-teal-400 hover:text-teal-300 font-semibold">
                                        Login to Dashboard
                                    </Link>
                                </p>
                            </div>

                            {/* Free vs Premium */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="p-4 bg-slate-800/30 rounded-xl">
                                        <div className="font-bold text-white mb-2 flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">FREE</span>
                                            Included Now
                                        </div>
                                        <ul className="space-y-1.5 text-slate-400">
                                            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Basic public profile</li>
                                            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>5 lead credits</li>
                                            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>2 specialty conditions</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                                        <div className="font-bold text-white mb-2 flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-teal-500 text-slate-900 rounded text-xs">PRO</span>
                                            Upgrade Later
                                        </div>
                                        <ul className="space-y-1.5 text-slate-400">
                                            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Website & clinic links</li>
                                            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>50+ lead credits/month</li>
                                            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Priority placement</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
