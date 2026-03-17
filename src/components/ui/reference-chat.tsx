'use client';

import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { extractContentLinks, getContentColor, getClientGeoContext, type ContentLink } from '@/lib/content-linker';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ReferenceChatProps {
    category: string;
    placeholder: string;
    example: string;
    title: string;
}

// Lazy load links section
const ContentLinksSection = lazy(() => Promise.resolve({
    default: ({ links }: { links: ContentLink[] }) => (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-primary-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Related Resources</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {links.map((link, idx) => {
                    const colors = getContentColor(link.type);
                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${colors.bg} border ${colors.border} hover:bg-white/10 transition-all text-xs font-medium ${colors.text}`}
                        >
                            <ContentIcon type={link.type} />
                            {link.text}
                            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}));

// Icon component
function ContentIcon({ type }: { type: ContentLink['type'] }) {
    const iconClass = "w-3.5 h-3.5";
    switch (type) {
        case 'test':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
        case 'condition':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
        case 'treatment':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
        case 'specialty':
        case 'doctor':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'tool':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
        default:
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
}

/**
 * Escape HTML entities to prevent XSS
 */
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

/**
 * Secure markdown → HTML formatter for chat responses
 */
function formatMarkdown(md: string): string {
    let escaped = escapeHtml(md);

    const html = escaped
        // Headings
        .replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-white mt-4 mb-2 flex items-center gap-2"><span class="w-1 h-4 bg-primary-500 rounded-full"></span>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-white mt-5 mb-2">$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-6 mb-3">$1</h2>')
        // Bold & italic
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-primary-300">$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/30 backdrop-blur rounded-xl p-4 text-xs overflow-x-auto my-3 border border-white/5"><code class="text-emerald-300">$1</code></pre>')
        // Inline code
        .replace(/`(.+?)`/g, '<code class="bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
        // Bullet lists
        .replace(/^[-•] (.+)$/gm, '<li class="flex items-start gap-2 my-1"><span class="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span><span>$1</span></li>')
        // Numbered lists
        .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 my-1"><span class="text-primary-400 font-bold text-xs min-w-[20px]">$1.</span><span>$2</span></li>')
        // Line breaks
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

export default function ReferenceChat({ category, placeholder, example, title }: ReferenceChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const sendMessage = useCallback(async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        const userMsg: Message = { role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/reference/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    category,
                    history: messages.slice(-6),
                }),
            });

            const data = await res.json();
            const assistantMsg: Message = {
                role: 'assistant',
                content: data.reply || data.error || 'Something went wrong.',
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
        }
        setLoading(false);
        inputRef.current?.focus();
    }, [input, loading, category, messages]);

    // Memoize formatted messages with content links
    const formattedMessages = useMemo(() => {
        const geoContext = getClientGeoContext();
        return messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            return {
                ...msg,
                formattedContent: msg.role === 'assistant' ? formatMarkdown(msg.content) : null,
                contentLinks: msg.role === 'assistant' && isLast ? extractContentLinks(msg.content, undefined, geoContext) : [],
                key: i,
            };
        });
    }, [messages]);

    return (
        <div className="bg-[#0A1128]/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col min-h-[500px] max-h-[700px]">

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Clinical AI Assistant</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {messages.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-3xl flex items-center justify-center border border-primary-500/20">
                            <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Ask About {title}</h3>
                            <p className="text-sm text-white/50 max-w-sm">
                                Get instant, evidence-based clinical information powered by AI.
                            </p>
                        </div>
                        <button
                            onClick={() => sendMessage(example)}
                            className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all group flex items-center gap-3"
                        >
                            <span className="text-white/40">Try:</span>
                            <span className="text-primary-300 group-hover:text-primary-200">&quot;{example}&quot;</span>
                            <svg className="w-4 h-4 text-white/30 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <>
                        {formattedMessages.map((msg) => (
                            <div key={msg.key} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[90%] rounded-2xl px-5 py-4 ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md shadow-lg shadow-primary-500/10'
                                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
                                    }`}
                                >
                                    {msg.role === 'assistant' && msg.formattedContent ? (
                                        <div>
                                            <div
                                                className="prose prose-invert prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: msg.formattedContent }}
                                            />
                                            {/* Content Links */}
                                            {msg.contentLinks.length > 0 && (
                                                <Suspense fallback={<div className="h-10 bg-white/5 rounded-xl animate-pulse mt-4"></div>}>
                                                    <ContentLinksSection links={msg.contentLinks} />
                                                </Suspense>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5" aria-label="AI is typing">
                                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                        </div>
                                        <span className="text-xs text-white/40">Analyzing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#050B14]/80 border-t border-white/5">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="relative"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        disabled={loading}
                        aria-label="Type your message"
                        className="w-full bg-[#0A1128] border border-white/10 focus:border-primary-500/50 rounded-2xl py-4 pl-6 pr-16 text-white placeholder-white/30 outline-none transition-all shadow-inner disabled:opacity-50 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        aria-label="Send message"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </form>
                <div className="text-center mt-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">For educational purposes only. Not for clinical diagnosis.</p>
                </div>
            </div>
        </div>
    );
}
