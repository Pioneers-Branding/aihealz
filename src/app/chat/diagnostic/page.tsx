'use client';

import { useState, useRef, useEffect, Suspense, useMemo, lazy } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { extractContentLinks, getContentColor, getClientGeoContext, type ContentLink } from '@/lib/content-linker';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const QUICK_PROMPTS = [
    { label: 'What is CBC test?', query: 'What is a Complete Blood Count (CBC) test and why is it done?', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { label: 'Thyroid tests', query: 'What are the different thyroid tests and when should I get them?', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Fasting requirements', query: 'Which tests require fasting and for how long?', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Diabetes tests', query: 'What tests are used to diagnose or monitor diabetes?', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Home collection', query: 'Which tests can be collected at home?', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Cholesterol test', query: 'What does a lipid profile test measure?', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

// Lazy content links
const ContentLinksSection = lazy(() => Promise.resolve({
    default: ({ links }: { links: ContentLink[] }) => (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Book These Tests</span>
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
                            {link.type === 'test' && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            )}
                            {link.text}
                            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}));

// Escape HTML
function escapeHtml(text: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

// Format markdown
function formatMarkdown(md: string): string {
    let escaped = escapeHtml(md);
    const html = escaped
        .replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-white mt-4 mb-2">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-white mt-5 mb-2">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-violet-300">$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded text-xs">$1</code>')
        .replace(/^[-•] (.+)$/gm, '<li class="flex items-start gap-2 my-1"><span class="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0"></span><span>$1</span></li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 my-1"><span class="text-violet-400 font-bold text-xs min-w-[20px]">$1.</span><span>$2</span></li>')
        .replace(/\n{2,}/g, '</p><p class="mb-3 text-white/80 leading-relaxed">')
        .replace(/\n/g, '<br/>')
        .replace(/^/, '<p class="mb-3 text-white/80 leading-relaxed">')
        .replace(/$/, '</p>');

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h3', 'h4', 'p', 'br', 'strong', 'em', 'code', 'li', 'span'],
        ALLOWED_ATTR: ['class'],
    });
}

function DiagnosticChatContent() {
    const searchParams = useSearchParams();
    const testSlug = searchParams.get('test');
    const providerSlug = searchParams.get('provider');

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: messageText };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/diagnostics/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    history: messages.slice(-6),
                    testSlug,
                    providerSlug,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'I apologize, but I encountered a network error. Please try again.' },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    // Memoized formatted messages with content links
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
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-20 pb-8 flex flex-col">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 flex-1 flex flex-col w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <Link href="/tests" className="inline-flex items-center text-sm text-white/50 hover:text-violet-400 mb-4 transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Tests
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2">Diagnostic Test Assistant</h1>
                    <p className="text-white/50 text-sm">
                        Ask questions about lab tests, preparation, normal ranges, and more
                    </p>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-[#0A1128]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/20">
                    {/* Header Bar */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">Lab Test Expert</h3>
                            <p className="text-[10px] text-white/50 uppercase tracking-wider">Diagnostic AI</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-violet-500/20">
                                    <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">How can I help you today?</h3>
                                <p className="text-white/50 text-sm mb-8 max-w-md">
                                    I can help you understand lab tests, preparation requirements, normal ranges, and when you might need them.
                                </p>

                                {/* Quick Prompts */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-xl">
                                    {QUICK_PROMPTS.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(prompt.query)}
                                            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-violet-500/20 text-sm text-white/70 hover:text-white transition-all border border-white/10 hover:border-violet-500/30 flex items-center gap-2 text-left"
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={prompt.iconPath} />
                                                </svg>
                                            </span>
                                            <span>{prompt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {formattedMessages.map((msg) => (
                                    <div key={msg.key} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                                                msg.role === 'user'
                                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md shadow-lg shadow-violet-500/10'
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
                                                <div className="flex gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                                <span className="text-xs text-white/40">Researching...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/5 bg-[#050B14]/80">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about any lab test or diagnostic..."
                                className="w-full bg-[#0A1128] border border-white/10 focus:border-violet-500/50 rounded-2xl py-4 pl-6 pr-16 text-white placeholder:text-white/30 outline-none transition-all disabled:opacity-50 text-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-white font-medium transition-all flex items-center justify-center shadow-lg shadow-violet-500/20"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>
                        <div className="text-center mt-3 flex items-center justify-center gap-3">
                            <p className="text-[10px] text-white/30">For informational purposes only</p>
                            <span className="text-white/10">|</span>
                            <Link href="/diagnostic-labs" className="text-[10px] text-violet-400/70 hover:text-violet-400 transition-colors">
                                Find Labs Near You
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function DiagnosticChatPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white/50 text-sm">Loading Diagnostic Assistant...</p>
                </div>
            </main>
        }>
            <DiagnosticChatContent />
        </Suspense>
    );
}
