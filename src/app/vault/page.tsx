'use client';

import { useState, useEffect } from 'react';
import {
    FolderOpen, FileText, Upload, Eye, Shield, Brain,
    Clock, ChevronRight, HardDrive, AlertCircle, Zap
} from 'lucide-react';

/**
 * Health Vault — Minimalist File Manager
 *
 * Left: original reports list
 * Right: AI-simplified summary side-by-side
 */

interface VaultFile {
    id: string;
    name: string;
    type: string;
    size: number;
    aiSummary: string | null;
    analysis: { summary: string; urgency: string; confidence: number | null } | null;
    isProcessed: boolean;
    uploadDate: string;
}

interface VaultData {
    id: string;
    storageUsed: number;
    maxStorage: number;
    files: VaultFile[];
}

export default function HealthVaultPage() {
    const [vault, setVault] = useState<VaultData | null>(null);
    const [selected, setSelected] = useState<VaultFile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchVault();
    }, []);

    async function fetchVault() {
        setLoading(true);
        try {
            // Get or create session hash
            let session = typeof window !== 'undefined' ? localStorage.getItem('aihealz_session') : null;
            if (!session) {
                // Generate a new session hash
                session = crypto.randomUUID();
                localStorage.setItem('aihealz_session', session);
            }

            const res = await fetch(`/api/vault?session=${session}`);
            const data = await res.json();

            // If no vault exists, create one
            if (!data.vault) {
                const createRes = await fetch('/api/vault', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'create_vault',
                        sessionHash: session,
                        countryCode: detectCountry(),
                    }),
                });

                if (createRes.ok) {
                    // Fetch again after creating
                    const newRes = await fetch(`/api/vault?session=${session}`);
                    const newData = await newRes.json();
                    setVault(newData.vault);
                } else {
                    // Set a default empty vault structure for UI
                    setVault({
                        id: 'pending',
                        storageUsed: 0,
                        maxStorage: 104857600, // 100MB default
                        files: [],
                    });
                }
            } else {
                setVault(data.vault);
                if (data.vault?.files?.[0]) setSelected(data.vault.files[0]);
            }
        } catch (error) {
            console.error('Failed to load vault:', error);
            setErrorMessage('Failed to load your vault. Please refresh the page.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    }

    function detectCountry(): string {
        // Try to get from cookie or timezone
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(/aihealz-geo=([^;:]+)/);
            if (match) {
                const codes: Record<string, string> = {
                    india: 'IN', usa: 'US', uk: 'GB', uae: 'AE', singapore: 'SG',
                    australia: 'AU', canada: 'CA', germany: 'DE', france: 'FR',
                };
                return codes[match[1]] || 'US';
            }
        }
        return 'US';
    }

    async function handleUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('session', typeof window !== 'undefined' ? localStorage.getItem('aihealz_session') || 'demo-session' : 'demo-session');

                const res = await fetch('/api/vault/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    await fetchVault();
                } else {
                    const error = await res.json();
                    setErrorMessage(error.message || 'Failed to upload file');
                    setTimeout(() => setErrorMessage(null), 5000);
                }
            } catch (error) {
                console.error('Upload failed:', error);
                setErrorMessage('Failed to upload file. Please try again.');
                setTimeout(() => setErrorMessage(null), 5000);
            } finally {
                setUploading(false);
            }
        };
        input.click();
    }

    async function handleViewDossier(fileId: string) {
        window.open(`/vault/dossier/${fileId}`, '_blank');
    }

    async function handleGenerateBrief(fileId: string) {
        setAnalyzing(fileId);
        try {
            const res = await fetch('/api/vault/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId }),
            });

            if (res.ok) {
                await fetchVault();
            } else {
                const error = await res.json();
                setErrorMessage(error.message || 'Failed to generate brief');
                setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setErrorMessage('Failed to generate brief. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setAnalyzing(null);
        }
    }

    const urgencyColors: Record<string, string> = {
        routine: 'text-emerald-400',
        urgent: 'text-amber-400',
        emergency: 'text-red-400',
    };

    const storagePercent = vault
        ? Math.round((Number(vault.storageUsed) / Number(vault.maxStorage)) * 100)
        : 0;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Error Message */}
                {errorMessage && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {errorMessage}
                    </div>
                )}
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                            <Shield size={20} className="text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Health Vault</h1>
                            <p className="text-xs text-surface-100/40">End-to-end encrypted · HIPAA compliant</p>
                        </div>
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-500 transition-all disabled:opacity-50"
                    >
                        <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Report'}
                    </button>
                </div>

                {/* Storage bar */}
                {vault && (
                    <div className="glass-card p-4 flex items-center gap-4">
                        <HardDrive size={16} className="text-surface-100/30" />
                        <div className="flex-1">
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500/60 rounded-full transition-all duration-500"
                                    style={{ width: `${storagePercent}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-xs text-surface-100/40">
                            {(Number(vault.storageUsed) / 1048576).toFixed(1)}MB / {(Number(vault.maxStorage) / 1048576).toFixed(0)}MB
                        </span>
                    </div>
                )}

                {/* Split view */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* File List */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-surface-100/50 uppercase tracking-wide flex items-center gap-2">
                            <FolderOpen size={14} /> Original Reports
                        </h2>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="glass-card p-4 animate-pulse">
                                        <div className="h-3 bg-white/[0.06] rounded w-2/3 mb-2" />
                                        <div className="h-2.5 bg-white/[0.06] rounded w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : vault?.files.length ? (
                            vault.files.map((file) => (
                                <button
                                    key={file.id}
                                    onClick={() => setSelected(file)}
                                    className={`w-full glass-card p-4 text-left transition-all hover:scale-[1.01] ${selected?.id === file.id ? 'border-primary-500/30 bg-primary-600/5' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText size={16} className="text-surface-100/30" />
                                            <div>
                                                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-surface-100/30 mt-0.5">
                                                    <span className="capitalize">{file.type.replace('_', ' ')}</span>
                                                    <span>·</span>
                                                    <span>{(file.size / 1024).toFixed(0)} KB</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {file.isProcessed && (
                                                <Brain size={12} className="text-primary-400" />
                                            )}
                                            <ChevronRight size={14} className="text-surface-100/20" />
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="glass-card p-8 space-y-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-600/20 flex items-center justify-center">
                                        <Upload size={28} className="text-primary-400" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">Welcome to Health Vault</h3>
                                    <p className="text-sm text-surface-100/50 max-w-xs mx-auto">
                                        Securely store your medical reports and get AI-powered summaries in simple language.
                                    </p>
                                </div>
                                <div className="border-t border-white/5 pt-4 space-y-2">
                                    <p className="text-xs text-surface-100/40 font-medium">What you can store:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Blood Tests', 'X-rays & Scans', 'Prescriptions', 'Lab Reports', 'Medical Records'].map((type) => (
                                            <span key={type} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-surface-100/60">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-500 transition-all disabled:opacity-50"
                                >
                                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Your First Report'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* AI Summary Panel */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-surface-100/50 uppercase tracking-wide flex items-center gap-2">
                            <Brain size={14} /> AI Summary
                        </h2>
                        {selected ? (
                            <div className="glass-card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{selected.name}</h3>
                                    {selected.analysis?.urgency && (
                                        <span className={`text-xs font-medium ${urgencyColors[selected.analysis.urgency] || ''}`}>
                                            {selected.analysis.urgency}
                                        </span>
                                    )}
                                </div>

                                {selected.analysis ? (
                                    <>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-surface-100/40 mb-1">What your report shows</p>
                                                <p className="text-sm text-surface-100/80 leading-relaxed">
                                                    {selected.analysis.summary}
                                                </p>
                                            </div>

                                            {selected.analysis.confidence !== null && (
                                                <div className="flex items-center gap-2">
                                                    <Zap size={12} className="text-primary-400" />
                                                    <span className="text-xs text-surface-100/30">
                                                        AI Confidence: {(selected.analysis.confidence * 100).toFixed(0)}%
                                                    </span>
                                                    {selected.analysis.confidence < 0.8 && (
                                                        <span className="flex items-center gap-1 text-xs text-amber-400">
                                                            <AlertCircle size={10} /> Flagged for review
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-white/5 flex items-center gap-3">
                                            <button
                                                onClick={() => handleViewDossier(selected.id)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600/20 text-primary-300 text-xs hover:bg-primary-600/30 transition-all"
                                            >
                                                <Eye size={12} /> View Full Dossier
                                            </button>
                                            <button
                                                onClick={() => handleGenerateBrief(selected.id)}
                                                disabled={analyzing === selected.id}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-surface-100/50 text-xs hover:bg-white/10 transition-all disabled:opacity-50"
                                            >
                                                <Clock size={12} /> {analyzing === selected.id ? 'Generating...' : 'Generate Brief'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-surface-100/30">
                                        <Brain size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">AI analysis in progress...</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="glass-card p-8 text-center text-surface-100/30">
                                <p className="text-sm">Select a report to view its AI summary</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
