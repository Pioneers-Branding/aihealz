'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AIResponseCard, { TypingIndicator } from '@/components/ui/ai-response-card';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function AiCareBotContent() {
    const searchParams = useSearchParams();
    const conditionParam = searchParams.get('condition') || '';
    const condition = conditionParam.replace(/-/g, ' ');

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello! I'm the **AI Care Bot**. ${condition ? `I see you're looking for guidance on **${condition}**.` : ''} I can provide evidence-based Over-The-Counter (OTC) medication suggestions and safe home remedies.\n\nCould you describe the exact symptoms you're feeling right now?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: input.trim() } as Message];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    condition
                })
            });
            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error occurred." }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    // Quick prompts
    const quickPrompts = useMemo(() => {
        if (condition) {
            return [
                `What are common symptoms of ${condition}?`,
                `What OTC medicines help with ${condition}?`,
                `Home remedies for ${condition}`,
                `When should I see a doctor for ${condition}?`,
            ];
        }
        return [
            'I have a headache and fever',
            'My throat is sore and scratchy',
            'I have an upset stomach',
            'I feel tired and weak',
        ];
    }, [condition]);

    return (
        <main className="min-h-screen bg-[#050B14] pt-20 pb-8 flex flex-col items-center">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-4xl px-4 flex flex-col h-[calc(100vh-7rem)] relative z-10">
                {/* Header */}
                <div className="bg-[#0A1128]/90 backdrop-blur-xl px-6 py-5 rounded-t-3xl border border-white/10 border-b-0 flex items-start sm:items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-[#0A1128] rounded-full flex items-center justify-center">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Care Bot</h1>
                            <p className="text-sm text-white/50 font-medium tracking-wide flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Evidence-based OTC & Home Remedies
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/symptoms"
                        className="text-xs font-semibold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Symptom Checker
                    </Link>
                </div>

                {/* Disclaimer Strip */}
                <div className="bg-rose-950/40 border-x border-white/10 px-6 py-3 flex items-start sm:items-center gap-3 shrink-0 text-sm backdrop-blur-sm">
                    <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-rose-300/80 leading-snug text-xs">
                        <strong className="text-rose-200">Medical Disclaimer:</strong> This bot provides educational information for minor issues. It is NOT a doctor. Consult a physician for severe or persistent symptoms.
                    </p>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto bg-[#050B14]/80 border-x border-white/10 p-6 space-y-6 scroll-smooth">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'user' ? (
                                <div className="max-w-[85%] sm:max-w-[75%] bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl rounded-br-md px-5 py-4 shadow-lg shadow-primary-500/10">
                                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                                </div>
                            ) : (
                                <div className="max-w-[90%] sm:max-w-[85%]">
                                    <AIResponseCard
                                        content={msg.content}
                                        variant="chat"
                                        showLinks={i === messages.length - 1}
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-5 py-4">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} className="h-1 flex-shrink-0" />
                </div>

                {/* Quick Prompts - Show only if few messages */}
                {messages.length < 3 && !isLoading && (
                    <div className="bg-[#050B14]/80 border-x border-white/10 px-4 pb-4">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2 px-2">Quick prompts</p>
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(prompt);
                                        inputRef.current?.focus();
                                    }}
                                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-3 py-2 rounded-xl transition-all"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-[#0A1128]/90 backdrop-blur-xl p-5 rounded-b-3xl border border-white/10 border-t-0 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] z-10 relative">
                    <form onSubmit={sendMessage} className="relative flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Describe your symptoms (e.g., I have a sore throat and mild fever)..."
                            className="w-full bg-[#050B14] border border-white/10 focus:border-primary-500/50 text-white text-[15px] rounded-2xl py-4 pl-6 pr-16 outline-none transition-all disabled:opacity-50 placeholder:text-white/30"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2.5 w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </form>
                    <div className="text-center mt-3 flex items-center justify-center gap-3">
                        <p className="text-[10px] text-white/30 font-medium tracking-wide">Powered by AIHealz Intelligence</p>
                        <span className="text-white/10">|</span>
                        <Link href="/tools" className="text-[10px] text-primary-400/70 hover:text-primary-400 transition-colors">
                            Health Calculators
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

function LoadingFallback() {
    return (
        <main className="min-h-screen bg-[#050B14] pt-24 pb-16 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-white/50 text-sm">Loading AI Care Bot...</p>
            </div>
        </main>
    );
}

export default function AiCareBotPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <AiCareBotContent />
        </Suspense>
    );
}
