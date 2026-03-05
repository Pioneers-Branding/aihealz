'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AuthGateProps {
    children: ReactNode | ((props: { doctorId: string; doctorName: string }) => ReactNode);
    onAuthenticated?: (doctorId: string, doctorName: string) => void;
}

interface ProviderSession {
    doctorId: string;
    doctorName: string;
    email: string;
    token: string;
    expiresAt: number;
}

/**
 * Provider Auth Gate
 *
 * Protects provider dashboard routes by requiring authentication.
 * Stores session in localStorage (will be replaced with proper auth later).
 */
export function ProviderAuthGate({ children, onAuthenticated }: AuthGateProps) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [authenticatedUser, setAuthenticatedUser] = useState<{ doctorId: string; doctorName: string } | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        checkSession();
    }, []);

    function checkSession() {
        setIsLoading(true);
        try {
            const sessionData = localStorage.getItem('provider_session');
            if (sessionData) {
                const session: ProviderSession = JSON.parse(sessionData);
                // Check if session is expired
                if (session.expiresAt > Date.now()) {
                    setIsAuthenticated(true);
                    setAuthenticatedUser({ doctorId: session.doctorId, doctorName: session.doctorName });
                    onAuthenticated?.(session.doctorId, session.doctorName);
                    setIsLoading(false);
                    return;
                } else {
                    // Session expired, clear it
                    localStorage.removeItem('provider_session');
                }
            }
            setShowLogin(true);
        } catch {
            setShowLogin(true);
        }
        setIsLoading(false);
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginError(null);
        setIsLoggingIn(true);

        try {
            const res = await fetch('/api/provider/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setLoginError(data.error || 'Invalid credentials');
                setIsLoggingIn(false);
                return;
            }

            // Store session
            const session: ProviderSession = {
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                email: data.email,
                token: data.token,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            };
            localStorage.setItem('provider_session', JSON.stringify(session));
            localStorage.setItem('provider_doctor_id', data.doctorId);

            setIsAuthenticated(true);
            setAuthenticatedUser({ doctorId: data.doctorId, doctorName: data.doctorName });
            setShowLogin(false);
            onAuthenticated?.(data.doctorId, data.doctorName);
        } catch {
            setLoginError('Failed to connect. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                    <p className="text-slate-400 text-sm">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (showLogin && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="glass-card p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-600/20 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-primary-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Provider Login</h1>
                            <p className="text-slate-400 text-sm">
                                Sign in to access your doctor dashboard
                            </p>
                        </div>

                        {/* Error Message */}
                        {loginError && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                                <AlertCircle size={16} />
                                {loginError}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="doctor@clinic.com"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                                             text-white placeholder:text-slate-500
                                             focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                                             text-white placeholder:text-slate-500
                                             focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3
                                         bg-primary-600 hover:bg-primary-500 disabled:opacity-50
                                         text-white font-semibold rounded-xl transition-all"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/10">
                            <a
                                href="/for-doctors#join-form"
                                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                Not a provider yet? Join as Doctor
                                <ArrowRight size={14} />
                            </a>
                            <a
                                href="/provider/forgot-password"
                                className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
                            >
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <p className="text-xs text-slate-400 text-center">
                            The Provider Dashboard is exclusively for verified healthcare professionals.
                            Your credentials were sent when your profile was approved.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Only render children after authentication is confirmed
    // If children is a function, pass the authenticated user data
    if (typeof children === 'function' && authenticatedUser) {
        return <>{children(authenticatedUser)}</>;
    }

    return <>{children}</>;
}

/**
 * Hook to get current provider session
 */
export function useProviderSession(): ProviderSession | null {
    const [session, setSession] = useState<ProviderSession | null>(null);

    useEffect(() => {
        try {
            const sessionData = localStorage.getItem('provider_session');
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                if (parsed.expiresAt > Date.now()) {
                    setSession(parsed);
                }
            }
        } catch {
            // Invalid session
        }
    }, []);

    return session;
}

/**
 * Logout function
 */
export function providerLogout() {
    localStorage.removeItem('provider_session');
    localStorage.removeItem('provider_doctor_id');
    window.location.href = '/provider/dashboard';
}
