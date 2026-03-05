'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Globe, Shield, Sparkles } from 'lucide-react';

/**
 * Concierge Chat Interface
 *
 * High-end concierge aesthetic:
 * - Soft shadow chat bubbles
 * - Elegant "typing" pulse indicator
 * - Real-time translation overlay toggle
 * - Professional medical icons
 */

interface ChatMessage {
    id: string;
    senderType: string;
    content: string;
    translatedText: string | null;
    translatedTo: string | null;
    originalLanguage: string | null;
    isRead: boolean;
    createdAt: string;
}

interface Props {
    encounterId: string;
    senderType: 'patient' | 'doctor';
    senderId: string;
    language?: string;
}

export default function ChatInterface({ encounterId, senderType, senderId, language = 'en' }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [showTranslation, setShowTranslation] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async (signal?: AbortSignal) => {
        try {
            const res = await fetch(`/api/encounters?id=${encounterId}`, { signal });
            if (!res.ok) {
                setFetchError(true);
                return;
            }
            const data = await res.json();
            setMessages(data.messages || []);
            setFetchError(false);
        } catch (err) {
            // Ignore abort errors
            if (err instanceof Error && err.name === 'AbortError') return;
            console.error('Failed to fetch messages');
            setFetchError(true);
        }
    }, [encounterId]);

    useEffect(() => {
        const controller = new AbortController();
        fetchMessages(controller.signal);

        const interval = setInterval(() => fetchMessages(), 3000); // Poll every 3s

        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [fetchMessages]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    async function sendMessage() {
        if (!input.trim() || sending) return;
        setSending(true);
        setIsTyping(true);
        setError(null);

        try {
            const res = await fetch('/api/encounters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'message',
                    encounterId,
                    senderType,
                    senderId,
                    content: input.trim(),
                    language,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to send message');
            }
            setInput('');
            await fetchMessages();
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
            setIsTyping(false);
        }
    }

    function formatTime(dateStr: string): string {
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="glass-card flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-emerald-400/70" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Secure Consultation</span>
                </div>
                <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${showTranslation
                            ? 'bg-primary-600/20 text-primary-300'
                            : 'bg-white/5 text-surface-100/40'
                        }`}
                >
                    <Globe size={12} />
                    {showTranslation ? 'Translation ON' : 'Translation OFF'}
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((msg) => {
                    const isOwn = msg.senderType === senderType;
                    const isSystem = msg.senderType === 'system' || msg.senderType === 'ai';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] text-surface-100/30 text-xs">
                                    {msg.senderType === 'ai' && <Sparkles size={10} className="text-primary-400" />}
                                    {msg.content}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isOwn
                                            ? 'bg-primary-600/20 text-surface-100/90 rounded-br-md'
                                            : 'bg-white/[0.06] text-surface-100/80 rounded-bl-md'
                                        }`}
                                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                >
                                    {msg.content}
                                </div>

                                {/* Translation overlay */}
                                {showTranslation && msg.translatedText && (
                                    <div className={`px-4 py-2 rounded-xl text-xs leading-relaxed bg-white/[0.03] text-surface-100/40 border border-white/5 ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                                        }`}>
                                        <Globe size={9} className="inline mr-1 opacity-50" />
                                        {msg.translatedText}
                                    </div>
                                )}

                                <span className={`text-[10px] text-surface-100/20 px-1 ${isOwn ? 'text-right' : ''}`}>
                                    {formatTime(msg.createdAt)}
                                    {msg.originalLanguage && msg.originalLanguage !== language && (
                                        <> · {msg.originalLanguage.toUpperCase()}</>
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex gap-1 px-4 py-3 w-16 rounded-2xl bg-white/[0.06] rounded-bl-md">
                        <span className="w-1.5 h-1.5 bg-surface-100/30 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-surface-100/30 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                        <span className="w-1.5 h-1.5 bg-surface-100/30 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                    </div>
                )}
            </div>

            {/* Error States */}
            {fetchError && (
                <div className="px-4 py-2 bg-red-500/10 border-y border-red-500/20 text-red-400 text-xs text-center">
                    Connection issue. Retrying...
                </div>
            )}
            {error && (
                <div className="px-4 py-2 bg-red-500/10 border-y border-red-500/20 text-red-400 text-xs text-center">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
                </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2.5 text-sm
                       placeholder:text-surface-100/20 focus:outline-none focus:border-primary-500/30 transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center
                       hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
