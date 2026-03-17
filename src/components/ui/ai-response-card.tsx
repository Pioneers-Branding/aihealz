'use client';

import React, { useMemo, useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { extractContentLinks, getContentColor, getClientGeoContext, type ContentLink } from '@/lib/content-linker';

interface AIResponseCardProps {
    content: string;
    isLoading?: boolean;
    userLocation?: string;
    showLinks?: boolean;
    variant?: 'chat' | 'inline' | 'card';
    className?: string;
}

// Lazy load the links section for performance
const ContentLinksSection = lazy(() => Promise.resolve({
    default: ({ links }: { links: ContentLink[] }) => (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-primary-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Related on AIHealz</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {links.map((link, idx) => {
                    const colors = getContentColor(link.type);
                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`group flex items-center gap-3 p-3 rounded-xl ${colors.bg} border ${colors.border} hover:bg-white/10 transition-all duration-200`}
                        >
                            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${colors.icon} shrink-0`}>
                                <ContentIcon type={link.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${colors.text} truncate group-hover:text-white transition-colors`}>
                                    {link.text}
                                </p>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                                    {link.type === 'test' ? 'View Test Details' :
                                     link.type === 'condition' ? 'Read Condition Guide' :
                                     link.type === 'treatment' ? 'Treatment Info' :
                                     link.type === 'specialty' ? 'Find Doctors' :
                                     link.type === 'tool' ? 'Open Calculator' :
                                     'Learn More'}
                                </p>
                            </div>
                            <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}));

// Icon component for different content types
function ContentIcon({ type }: { type: ContentLink['type'] }) {
    switch (type) {
        case 'test':
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            );
        case 'condition':
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            );
        case 'treatment':
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            );
        case 'specialty':
        case 'doctor':
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'hospital':
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            );
        case 'tool':
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        default:
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
}

// Escape HTML entities
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

// Format markdown to HTML safely
function formatMarkdown(md: string): string {
    let escaped = escapeHtml(md);

    const html = escaped
        // Headings
        .replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-white mt-4 mb-2 flex items-center gap-2"><span class="w-1 h-4 bg-primary-500 rounded-full"></span>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-white mt-5 mb-2 flex items-center gap-2"><span class="w-1.5 h-5 bg-primary-500 rounded-full"></span>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-6 mb-3">$1</h2>')
        // Bold & italic
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-primary-300">$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/30 backdrop-blur rounded-xl p-4 text-xs overflow-x-auto my-3 border border-white/5"><code class="text-emerald-300">$1</code></pre>')
        // Inline code
        .replace(/`(.+?)`/g, '<code class="bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
        // Bullet lists with custom bullets
        .replace(/^[-•] (.+)$/gm, '<li class="flex items-start gap-2 my-1"><span class="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span><span>$1</span></li>')
        // Numbered lists
        .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 my-1"><span class="text-primary-400 font-bold text-xs min-w-[20px]">$1.</span><span>$2</span></li>')
        // Paragraphs
        .replace(/\n{2,}/g, '</p><p class="mb-3 text-white/80 leading-relaxed">')
        .replace(/\n/g, '<br/>')
        // Wrap
        .replace(/^/, '<p class="mb-3 text-white/80 leading-relaxed">')
        .replace(/$/, '</p>');

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'code', 'pre', 'li', 'ul', 'ol', 'span'],
        ALLOWED_ATTR: ['class'],
    });
}

// Loading skeleton
function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded-full w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded-full w-1/2"></div>
                </div>
            </div>
            <div className="space-y-2 mt-4">
                <div className="h-3 bg-white/5 rounded-full w-full"></div>
                <div className="h-3 bg-white/5 rounded-full w-5/6"></div>
                <div className="h-3 bg-white/5 rounded-full w-4/6"></div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="h-10 bg-white/5 rounded-xl flex-1"></div>
                <div className="h-10 bg-white/5 rounded-xl flex-1"></div>
            </div>
        </div>
    );
}

// Typing indicator
function TypingIndicator() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 rounded-2xl px-4 py-3">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs text-white/40">AI is thinking...</span>
        </div>
    );
}

// Links loading placeholder
function LinksPlaceholder() {
    return (
        <div className="mt-4 pt-4 border-t border-white/10 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-white/10"></div>
                <div className="h-2 bg-white/10 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="h-14 bg-white/5 rounded-xl"></div>
                <div className="h-14 bg-white/5 rounded-xl"></div>
            </div>
        </div>
    );
}

export default function AIResponseCard({
    content,
    isLoading = false,
    userLocation,
    showLinks = true,
    variant = 'chat',
    className = '',
}: AIResponseCardProps) {
    const [linksExpanded, setLinksExpanded] = useState(true);

    // Extract content links
    const contentLinks = useMemo(() => {
        if (!showLinks || isLoading || !content) return [];
        const geoContext = getClientGeoContext();
        return extractContentLinks(content, userLocation, geoContext);
    }, [content, userLocation, showLinks, isLoading]);

    // Format content
    const formattedContent = useMemo(() => {
        if (isLoading || !content) return '';
        return formatMarkdown(content);
    }, [content, isLoading]);

    // Variant-specific styling
    const containerClass = {
        chat: 'bg-white/5 border border-white/10 rounded-2xl rounded-bl-md',
        inline: 'bg-transparent',
        card: 'bg-[#0A1128]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/20',
    }[variant];

    if (isLoading) {
        return (
            <div className={`p-5 ${containerClass} ${className}`}>
                <TypingIndicator />
            </div>
        );
    }

    return (
        <div className={`${containerClass} ${className}`}>
            {/* Header - only for card variant */}
            {variant === 'card' && (
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">AIHealz Intelligence</h3>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider">AI-Powered Health Assistant</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={variant === 'card' ? 'p-6' : 'p-5'}>
                {/* AI Avatar for chat variant */}
                {variant === 'chat' && (
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold mt-1">AI Response</span>
                    </div>
                )}

                {/* Formatted content */}
                <div
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                />

                {/* Content Links */}
                {showLinks && contentLinks.length > 0 && (
                    <div>
                        {/* Collapse toggle for many links */}
                        {contentLinks.length > 4 && (
                            <button
                                onClick={() => setLinksExpanded(!linksExpanded)}
                                className="w-full mt-4 py-2 text-xs text-white/50 hover:text-white/70 transition-colors flex items-center justify-center gap-2"
                            >
                                {linksExpanded ? 'Show fewer' : `Show ${contentLinks.length} related pages`}
                                <svg className={`w-3 h-3 transition-transform ${linksExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )}

                        {linksExpanded && (
                            <Suspense fallback={<LinksPlaceholder />}>
                                <ContentLinksSection links={contentLinks.slice(0, 6)} />
                            </Suspense>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - only for card variant */}
            {variant === 'card' && (
                <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] text-white/30 text-center uppercase tracking-widest">
                        For informational purposes only. Consult a healthcare provider for medical advice.
                    </p>
                </div>
            )}
        </div>
    );
}

// Export loading component for external use
export { TypingIndicator, LoadingSkeleton };
