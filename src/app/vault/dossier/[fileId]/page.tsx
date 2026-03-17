import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

/**
 * Vault File Dossier Page
 *
 * Displays full analysis of a medical report with:
 * - AI summary in plain English
 * - Key findings
 * - Recommendations
 * - Urgency level
 * - Option to share with doctor
 */

export const metadata: Metadata = {
    title: 'Medical Report Dossier | Health Vault | aihealz',
    description: 'View detailed AI analysis of your medical report in plain English.',
};

const URGENCY_STYLES = {
    routine: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        label: 'Routine',
        description: 'No immediate action required',
    },
    urgent: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        label: 'Urgent',
        description: 'Follow up with your doctor soon',
    },
    emergency: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        label: 'Emergency',
        description: 'Seek immediate medical attention',
    },
};

const FILE_TYPE_LABELS: Record<string, string> = {
    blood_work: 'Blood Work',
    imaging: 'Imaging / Scan',
    pathology: 'Pathology Report',
    prescription: 'Prescription',
    other: 'Medical Document',
};

export default async function DossierPage({ params }: { params: Promise<{ fileId: string }> }) {
    const { fileId } = await params;

    const vaultFile = await prisma.vaultFile.findUnique({
        where: { id: fileId },
        include: {
            analysis: true,
            vault: true,
        },
    });

    if (!vaultFile) {
        notFound();
    }

    const analysis = vaultFile.analysis;
    const urgencyStyle = analysis?.urgencyLevel
        ? URGENCY_STYLES[analysis.urgencyLevel as keyof typeof URGENCY_STYLES]
        : URGENCY_STYLES.routine;

    // Parse fullDossier JSON for additional data
    const dossier = analysis?.fullDossier as {
        keyFindings?: string[];
        recommendations?: string[];
        analyzedAt?: string;
    } | null;

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="text-sm text-slate-500 mb-8 flex items-center gap-2">
                    <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/vault" className="hover:text-primary-400 transition-colors">Health Vault</Link>
                    <span>/</span>
                    <span className="text-white">Dossier</span>
                </nav>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            {FILE_TYPE_LABELS[vaultFile.fileType] || 'Document'}
                        </span>
                        {analysis?.urgencyLevel && (
                            <span className={`px-3 py-1 rounded-full ${urgencyStyle.bg} ${urgencyStyle.text} text-xs font-semibold uppercase tracking-wider border ${urgencyStyle.border}`}>
                                {urgencyStyle.label}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{vaultFile.fileName}</h1>
                    <p className="text-slate-400">
                        Uploaded {new Date(vaultFile.uploadDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                        {vaultFile.fileSizeBytes && ` · ${(vaultFile.fileSizeBytes / 1024).toFixed(0)} KB`}
                    </p>
                </div>

                {/* Urgency Alert */}
                {analysis?.urgencyLevel && analysis.urgencyLevel !== 'routine' && (
                    <div className={`p-4 rounded-2xl ${urgencyStyle.bg} border ${urgencyStyle.border} mb-8`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${urgencyStyle.bg} flex items-center justify-center`}>
                                <svg className={`w-5 h-5 ${urgencyStyle.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className={`font-semibold ${urgencyStyle.text}`}>{urgencyStyle.label} Finding</p>
                                <p className="text-sm text-slate-400">{urgencyStyle.description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Summary */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        What Your Report Shows
                    </h2>
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-lg text-slate-200 leading-relaxed">
                            {analysis?.plainEnglish || vaultFile.aiSummary || 'Analysis pending. Click "Generate Brief" in your vault to analyze this document.'}
                        </p>
                        {analysis?.confidenceScore && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-sm text-slate-500">
                                    AI Confidence: {(Number(analysis.confidenceScore) * 100).toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Key Findings */}
                {dossier?.keyFindings && dossier.keyFindings.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Key Findings
                        </h2>
                        <ul className="space-y-3">
                            {dossier.keyFindings.map((finding, i) => (
                                <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <p className="text-slate-300">{finding}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Recommendations */}
                {dossier?.recommendations && dossier.recommendations.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recommendations
                        </h2>
                        <ul className="space-y-3">
                            {dossier.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                    <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-slate-300">{rec}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Actions */}
                <section className="flex flex-wrap gap-4">
                    <Link
                        href="/vault"
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Vault
                    </Link>
                    <Link
                        href="/doctors"
                        className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-500 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Find a Specialist
                    </Link>
                </section>

                {/* Disclaimer */}
                <div className="mt-12 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        <strong className="text-slate-400">Disclaimer:</strong> This AI-generated summary is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment decisions.
                    </p>
                </div>
            </div>
        </main>
    );
}
