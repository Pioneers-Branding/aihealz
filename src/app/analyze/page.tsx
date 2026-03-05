'use client';

import { useState } from 'react';
import {
    FileText, Upload, Loader, Brain, MapPin, Users,
    CheckCircle, AlertTriangle, AlertOctagon, Download,
    ChevronRight, Activity, Stethoscope, Clock
} from 'lucide-react';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';

// Convert specialty names to proper plural specialist titles
function formatSpecialistTitle(specialty: string): string {
    if (!specialty) return 'Specialists';
    const lower = specialty.toLowerCase().trim();

    // Handle already plural forms
    if (lower.endsWith('ists') || lower.endsWith('ians')) {
        return specialty.charAt(0).toUpperCase() + specialty.slice(1);
    }

    // Specialty -> Specialist mapping
    const mappings: Record<string, string> = {
        'hematology': 'Hematologists',
        'cardiology': 'Cardiologists',
        'neurology': 'Neurologists',
        'oncology': 'Oncologists',
        'gastroenterology': 'Gastroenterologists',
        'dermatology': 'Dermatologists',
        'endocrinology': 'Endocrinologists',
        'nephrology': 'Nephrologists',
        'pulmonology': 'Pulmonologists',
        'rheumatology': 'Rheumatologists',
        'urology': 'Urologists',
        'ophthalmology': 'Ophthalmologists',
        'orthopedics': 'Orthopedic Surgeons',
        'psychiatry': 'Psychiatrists',
        'radiology': 'Radiologists',
        'pathology': 'Pathologists',
        'general medicine': 'General Physicians',
        'internal medicine': 'Internists',
        'pediatrics': 'Pediatricians',
    };

    // Check direct mapping
    if (mappings[lower]) {
        return mappings[lower];
    }

    // If ends in -ology, convert to -ologists
    if (lower.endsWith('ology')) {
        return specialty.slice(0, -5) + 'ologists';
    }

    // If ends in -ist, just add s
    if (lower.endsWith('ist')) {
        return specialty + 's';
    }

    // Default: add Specialists
    return specialty + ' Specialists';
}

type Stage = 'upload' | 'processing' | 'dossier';

interface Indicator {
    name: string;
    value: string;
    normalRange: string;
    severity: string;
    explanation: string;
}

interface Doctor {
    id: number;
    name: string;
    slug: string;
    qualifications: string[];
    rating: number | null;
    reviewCount: number;
    consultationFee: number | null;
    feeCurrency: string;
    profileImage: string | null;
    subscriptionTier: string;
    matchRank: number;
    matchReason: string;
    avgWaitMinutes: number | null;
}

interface DossierData {
    analysisId: string;
    dossier: {
        title: string;
        plainEnglish: string;
        indicators: Indicator[];
        questionsToAsk: string[];
        lifestyleFactors: string[];
        urgency: { level: string; message: string };
        disclaimer: string;
    };
    doctors: {
        doctors: Doctor[];
        totalMatches: number;
        specialtySearched: string;
    };
    meta: {
        confidenceScore: number;
        urgencyLevel: string;
        processingTimeMs: number;
        piiRedacted: number;
    };
}

const PROCESSING_STEPS = [
    { icon: FileText, label: 'Parsing clinical data', duration: 800 },
    { icon: Brain, label: 'Securing patient privacy', duration: 600 },
    { icon: Activity, label: 'Extracting medical indicators', duration: 2000 },
    { icon: MapPin, label: 'Mapping regional specialists', duration: 1000 },
    { icon: Users, label: 'Ranking qualified doctors', duration: 800 },
    { icon: CheckCircle, label: 'Finalizing your dossier', duration: 500 },
];

export default function AnalyzePage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [reportText, setReportText] = useState('');
    const [reportType, setReportType] = useState('blood_work');
    const [driveLink, setDriveLink] = useState('');
    const [processingStep, setProcessingStep] = useState(0);
    const [dossierData, setDossierData] = useState<DossierData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadMode, setUploadMode] = useState<'paste' | 'drive'>('paste');

    async function handleAnalyze() {
        if (uploadMode === 'paste' && (!reportText.trim() || reportText.trim().length < 20)) {
            setError('Please enter at least 20 characters of report text.');
            return;
        }
        if (uploadMode === 'drive' && !driveLink.trim()) {
            setError('Please provide a Google Drive link.');
            return;
        }

        setError(null);
        setStage('processing');
        setProcessingStep(0);

        for (let i = 0; i < PROCESSING_STEPS.length; i++) {
            setProcessingStep(i);
            await new Promise((r) => setTimeout(r, PROCESSING_STEPS[i].duration));
        }

        try {
            const body = uploadMode === 'paste'
                ? { text: reportText, reportType }
                : { driveLink, reportType };

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Analysis failed');
            const data = await response.json();
            setDossierData(data);
            setStage('dossier');
        } catch {
            setError('Failed to process your report. Please try again.');
            setStage('upload');
        }
    }

    return (
        <div className="min-h-screen bg-surface-50 pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {stage === 'upload' && (
                    <UploadView
                        reportText={reportText}
                        setReportText={setReportText}
                        reportType={reportType}
                        setReportType={setReportType}
                        driveLink={driveLink}
                        setDriveLink={setDriveLink}
                        uploadMode={uploadMode}
                        setUploadMode={setUploadMode}
                        onAnalyze={handleAnalyze}
                        error={error}
                    />
                )}
                {stage === 'processing' && <ProcessingView step={processingStep} />}
                {stage === 'dossier' && dossierData && (
                    <DossierView
                        data={dossierData}
                        onNewAnalysis={() => {
                            setStage('upload');
                            setReportText('');
                            setDriveLink('');
                            setDossierData(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

/* ─── Upload View ──────────────────────────────────────────── */

function UploadView({
    reportText, setReportText, reportType, setReportType,
    driveLink, setDriveLink, uploadMode, setUploadMode,
    onAnalyze, error,
}: {
    reportText: string; setReportText: (v: string) => void;
    reportType: string; setReportType: (v: string) => void;
    driveLink: string; setDriveLink: (v: string) => void;
    uploadMode: 'paste' | 'drive'; setUploadMode: (v: 'paste' | 'drive') => void;
    onAnalyze: () => void; error: string | null;
}) {
    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span></span>
                    AI-Powered Engine
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-surface-900 mb-4">
                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Report Analysis</span>
                </h1>
                <p className="text-lg text-surface-600 max-w-2xl mx-auto">
                    Upload your medical report and our AI will translate complex clinical data into plain language, identify abnormal indicators, and connect you with the right specialist.
                </p>
            </div>

            {/* ── How It Works ─────────────────────────────── */}
            <div className="max-w-3xl mx-auto">
                <h2 className="text-lg font-extrabold text-surface-900 mb-4 text-center">How It Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        { step: '1', icon: <Upload className="w-5 h-5" />, title: 'Upload Report', desc: 'Paste text or share via Google Drive' },
                        { step: '2', icon: <Brain className="w-5 h-5" />, title: 'AI Analyzes', desc: 'PII is stripped, data is encrypted' },
                        { step: '3', icon: <Activity className="w-5 h-5" />, title: 'Get Insights', desc: 'Key findings explained in plain English' },
                        { step: '4', icon: <Stethoscope className="w-5 h-5" />, title: 'Find Doctors', desc: 'Matched specialists in your area' },
                    ].map((s) => (
                        <div key={s.step} className="bg-white rounded-2xl border border-surface-200 p-4 text-center relative">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3 text-xs font-black">
                                {s.step}
                            </div>
                            <div className="text-primary-600 mx-auto mb-2 flex justify-center">{s.icon}</div>
                            <h3 className="text-sm font-extrabold text-surface-900 mb-1">{s.title}</h3>
                            <p className="text-xs text-surface-500">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Upload Card ──────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-surface-200 p-8 max-w-3xl mx-auto space-y-6 shadow-sm">
                {/* Report Type */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Report Type</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'blood_work', label: 'Blood Work' },
                            { value: 'imaging', label: 'MRI / X-Ray' },
                            { value: 'pathology', label: 'Pathology' },
                            { value: 'prescription', label: 'Prescription' },
                            { value: 'other', label: 'Other' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setReportType(opt.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${reportType === opt.value
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Upload Mode Toggle */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Upload Method</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setUploadMode('paste')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${uploadMode === 'paste' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-surface-50 border-surface-200 text-surface-600'
                                }`}
                        >
                            <FileText className="w-4 h-4" /> Paste Report Text
                        </button>
                        <button
                            onClick={() => setUploadMode('drive')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${uploadMode === 'drive' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-surface-50 border-surface-200 text-surface-600'
                                }`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2L2 19.5h20L12 2z" /><path d="M12 2l5 8.5H2" /><path d="M7 10.5l5 9L22 10.5" /></svg>
                            Google Drive Link
                        </button>
                    </div>
                </div>

                {/* Paste Mode */}
                {uploadMode === 'paste' && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                            Report Text <span className="text-surface-400">(for files under 5 MB)</span>
                        </label>
                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Paste your medical report text here... (blood values, imaging findings, pathology notes, etc.)"
                            className="w-full h-48 bg-surface-50 border border-surface-200 rounded-2xl p-4
                           text-surface-900 placeholder:text-surface-400 resize-none
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all text-sm font-mono"
                        />
                        <p className="text-xs text-surface-400">
                            All personal identifiers (names, addresses, phone numbers) are automatically stripped before AI processing.
                        </p>
                    </div>
                )}

                {/* Google Drive Mode */}
                {uploadMode === 'drive' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                            Google Drive Link <span className="text-surface-400">(for files over 5 MB)</span>
                        </label>
                        <input
                            type="url"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full py-3 px-4 bg-surface-50 border border-surface-200 rounded-xl
                           text-surface-900 placeholder:text-surface-400 text-sm
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        />
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                            <p className="text-sm font-bold text-blue-800">How to share from Google Drive:</p>
                            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                                <li>Upload your report (PDF/image) to Google Drive</li>
                                <li>Right-click the file → &quot;Share&quot; → &quot;Anyone with the link&quot;</li>
                                <li>Copy the sharing link and paste it above</li>
                            </ol>
                            <p className="text-xs text-blue-600">Supports: PDF, JPEG, PNG, DICOM • Max: 100 MB</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                {/* Analyze Button */}
                <button
                    onClick={onAnalyze}
                    disabled={uploadMode === 'paste' ? !reportText.trim() : !driveLink.trim()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-extrabold
                     hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-40
                     disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                >
                    <Brain size={20} /> Analyze Report
                </button>
            </div>

            {/* ── Supported Reports ────────────────────────── */}
            <div className="max-w-3xl mx-auto">
                <h2 className="text-sm font-extrabold text-surface-900 mb-3 text-center uppercase tracking-wider">What You Can Analyze</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, label: 'CBC / Blood Panel', desc: 'Hemogram, lipid, thyroid, liver' },
                        { icon: <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, label: 'MRI & CT Scans', desc: 'Brain, spine, abdomen imaging' },
                        { icon: <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, label: 'Biopsy Reports', desc: 'Histopathology, cytology' },
                        { icon: <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, label: 'Prescriptions', desc: 'Drug interactions, dosage check' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-surface-100 p-4 text-center">
                            <span className="text-2xl block mb-2">{item.icon}</span>
                            <p className="text-xs font-bold text-surface-900 mb-0.5">{item.label}</p>
                            <p className="text-[10px] text-surface-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Privacy */}
            <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 text-center">
                {[
                    { icon: <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, label: 'End-to-end Encrypted' },
                    { icon: <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>, label: 'Deleted After 24h' },
                    { icon: <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'HIPAA / GDPR Compliant' },].map((badge, i) => (
                        <div key={i} className="py-3 px-2 bg-white rounded-2xl border border-surface-100">
                            <span className="text-lg mb-1 block">{badge.icon}</span>
                            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">{badge.label}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
}

/* ─── Processing View ──────────────────────────────────────── */

function ProcessingView({ step }: { step: number }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
            <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                    <Loader size={36} className="text-primary-600 animate-spin" />
                </div>
            </div>

            <div className="space-y-3 w-full max-w-md">
                {PROCESSING_STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = i === step;
                    const isDone = i < step;

                    return (
                        <div
                            key={i}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${isActive ? 'bg-primary-50 border border-primary-200 scale-105' :
                                isDone ? 'bg-surface-100 opacity-50' : 'opacity-20'
                                }`}
                        >
                            <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-primary-600' : isDone ? 'text-accent-600' : 'text-surface-400'}`} />
                            <span className={`text-sm ${isActive ? 'text-surface-900 font-bold' : 'text-surface-500'}`}>{s.label}</span>
                            {isDone && <CheckCircle size={14} className="ml-auto text-accent-600" />}
                            {isActive && <Loader size={14} className="ml-auto text-primary-600 animate-spin" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Dossier View ─────────────────────────────────────────── */

function DossierView({ data, onNewAnalysis }: { data: DossierData; onNewAnalysis: () => void }) {
    const { dossier, doctors, meta } = data;
    const urgencyStyles: Record<string, string> = {
        routine: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        urgent: 'bg-amber-50 text-amber-700 border-amber-200',
        emergency: 'bg-red-50 text-red-700 border-red-200',
    };
    const UrgencyIcon = meta.urgencyLevel === 'emergency' ? AlertOctagon : meta.urgencyLevel === 'urgent' ? AlertTriangle : CheckCircle;

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-surface-900">{dossier.title}</h1>
                    <p className="text-surface-500 text-sm mt-1">
                        Processed in {(meta.processingTimeMs / 1000).toFixed(1)}s
                        {meta.piiRedacted > 0 && ` • ${meta.piiRedacted} personal items removed`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href={`/api/analysis/${data.analysisId}/pdf`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-sm font-bold text-surface-700 transition-all no-underline border border-surface-200"
                    >
                        <Download size={16} /> Export PDF
                    </a>
                    <button
                        onClick={onNewAnalysis}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-bold transition-all border border-primary-200"
                    >
                        <Upload size={16} /> New Analysis
                    </button>
                </div>
            </div>

            {/* Layout: Main + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Urgency */}
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${urgencyStyles[meta.urgencyLevel] || urgencyStyles.routine}`}>
                        <UrgencyIcon size={20} />
                        <div>
                            <p className="font-bold text-sm uppercase tracking-wider">{meta.urgencyLevel}</p>
                            <p className="text-xs opacity-80">{dossier.urgency.message}</p>
                        </div>
                    </div>

                    {/* Plain English Summary */}
                    <div className="bg-white rounded-3xl border border-surface-200 p-6 space-y-3">
                        <h2 className="text-lg font-extrabold text-surface-900 flex items-center gap-2">
                            <FileText size={18} className="text-primary-600" />
                            What Your Report Shows
                        </h2>
                        <p className="text-surface-600 leading-relaxed">{dossier.plainEnglish}</p>
                    </div>

                    {/* Key Indicators */}
                    {dossier.indicators.length > 0 && (
                        <div className="bg-white rounded-3xl border border-surface-200 p-6 space-y-4">
                            <h2 className="text-lg font-extrabold text-surface-900 flex items-center gap-2">
                                <Activity size={18} className="text-primary-600" />
                                Key Findings
                            </h2>
                            <div className="space-y-3">
                                {dossier.indicators.map((ind, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-surface-50 border border-surface-100">
                                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${ind.severity === 'critical' ? 'bg-red-500' :
                                            ind.severity === 'high' ? 'bg-orange-500' :
                                                ind.severity === 'borderline' ? 'bg-yellow-500' : 'bg-emerald-500'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-sm text-surface-900">{ind.name}</p>
                                                <span className="text-xs text-surface-400">{ind.normalRange && `Normal: ${ind.normalRange}`}</span>
                                            </div>
                                            <p className="text-surface-500 text-xs mt-1">{ind.explanation}</p>
                                        </div>
                                        <span className="text-sm font-mono font-bold text-surface-800">{ind.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Questions to Ask */}
                    <div className="bg-white rounded-3xl border border-surface-200 p-6 space-y-4">
                        <h2 className="text-lg font-extrabold text-surface-900 flex items-center gap-2">
                            <Stethoscope size={18} className="text-accent-600" />
                            Questions for Your Doctor
                        </h2>
                        <ol className="space-y-3">
                            {dossier.questionsToAsk.map((q, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-black flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <p className="text-surface-600 text-sm">{q}</p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Lifestyle */}
                    {dossier.lifestyleFactors.length > 0 && (
                        <div className="bg-white rounded-3xl border border-surface-200 p-6 space-y-4">
                            <h2 className="text-lg font-extrabold text-surface-900">Lifestyle Considerations</h2>
                            <ul className="space-y-2">
                                {dossier.lifestyleFactors.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-surface-600">
                                        <ChevronRight size={14} className="mt-0.5 text-accent-500 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="text-xs text-surface-400 p-4 border border-surface-200 rounded-2xl bg-surface-50">
                        {dossier.disclaimer}
                    </div>
                </div>

                {/* Doctor Sidebar */}
                <div className="space-y-4">
                    <h2 className="text-lg font-extrabold text-surface-900 flex items-center gap-2">
                        <Users size={18} className="text-primary-600" />
                        <span>Recommended {formatSpecialistTitle(doctors.specialtySearched)}</span>
                    </h2>
                    <p className="text-xs text-surface-400">{doctors.totalMatches} specialists found</p>

                    <div className="space-y-3">
                        {doctors.doctors.map((doc) => (
                            <a
                                key={doc.id}
                                href={`/doctor/${doc.slug}`}
                                className={`bg-white rounded-2xl border border-surface-200 p-4 block no-underline transition-all hover:shadow-lg hover:-translate-y-0.5 ${doc.matchRank === 1 ? 'border-primary-200 ring-1 ring-primary-100' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                                        {doc.profileImage ? (
                                            <AvatarWithFallback src={doc.profileImage} alt={doc.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            doc.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-surface-900 truncate">{doc.name}</p>
                                        {doc.qualifications.length > 0 && (
                                            <p className="text-xs text-surface-400 truncate">{doc.qualifications.slice(0, 2).join(' / ')}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
                                            {doc.rating && <span className="text-amber-600 flex items-center gap-0.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> {doc.rating}</span>}
                                            {doc.avgWaitMinutes && (
                                                <span className="flex items-center gap-1"><Clock size={10} /> {doc.avgWaitMinutes}m wait</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-surface-400">{doc.matchReason}</span>
                                    {doc.consultationFee && (
                                        <span className="text-xs font-bold text-surface-700">{doc.feeCurrency} {doc.consultationFee}</span>
                                    )}
                                </div>
                            </a>
                        ))}

                        {doctors.totalMatches === 0 && (
                            <div className="text-center text-sm text-surface-400 py-8 bg-surface-50 rounded-2xl border border-dashed border-surface-200">
                                No specialists found in your area yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
