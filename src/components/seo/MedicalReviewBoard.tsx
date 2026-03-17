'use client';

/**
 * Medical Review Board Sidebar
 *
 * Displays the doctors who have verified the content on this page.
 * Satisfies E-E-A-T "Expertise" and "Trust" signals.
 *
 * Thin-line shield icon (emerald tint) with doctor names + credentials.
 */

import { Shield, ExternalLink } from 'lucide-react';

interface Reviewer {
    name: string;
    qualifications: string[];
    slug: string;
    profileImage?: string;
    verifiedAt: string;
}

interface Props {
    reviewers: Reviewer[];
    lastReviewedAt?: string;
}

export default function MedicalReviewBoard({ reviewers, lastReviewedAt }: Props) {
    if (!reviewers || reviewers.length === 0) return null;

    return (
        <aside className="glass-card p-5 space-y-4" aria-label="Medical Review Board">
            <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-emerald-400/70" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold tracking-wide uppercase text-surface-100/50">
                    Medical Review Board
                </h3>
            </div>

            <div className="space-y-3">
                {reviewers.map((reviewer) => (
                    <div key={reviewer.slug} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            {reviewer.profileImage ? (
                                <img
                                    src={reviewer.profileImage}
                                    alt={reviewer.name}
                                    className="w-8 h-8 rounded-lg object-cover"
                                />
                            ) : (
                                <span className="text-xs font-medium text-surface-100/40">
                                    {reviewer.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <a
                                href={`/doctor/${reviewer.slug}`}
                                className="text-sm font-medium hover:text-primary-300 transition-colors
                         flex items-center gap-1"
                            >
                                {reviewer.name}
                                <ExternalLink size={10} className="opacity-30" />
                            </a>
                            <p className="text-xs text-surface-100/30 truncate">
                                {reviewer.qualifications.join(', ')}
                            </p>
                        </div>
                        <Shield size={12} className="text-emerald-500/50 flex-shrink-0 mt-1" strokeWidth={1.5} />
                    </div>
                ))}
            </div>

            {lastReviewedAt && (
                <p className="text-[10px] text-surface-100/20 pt-2 border-t border-white/5">
                    Last medical review: {new Date(lastReviewedAt).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                    })}
                </p>
            )}

            <p className="text-[10px] text-surface-100/20 leading-relaxed">
                Content on this page has been reviewed and verified by licensed medical professionals.
                This does not constitute medical advice.
            </p>
        </aside>
    );
}
