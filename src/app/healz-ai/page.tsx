'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Brain, Pill, Stethoscope, Heart, Activity, Leaf, Baby, Users,
  Moon, Dumbbell, MessageSquare, Send, ArrowRight, Sparkles,
  AlertTriangle, Info, Loader2
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const HEALTH_SEGMENTS = [
  {
    id: 'symptoms',
    name: 'Symptom Checker',
    icon: Stethoscope,
    color: 'from-blue-500 to-cyan-500',
    description: 'Describe your symptoms for guidance',
    prompt: 'I have the following symptoms: ',
  },
  {
    id: 'medications',
    name: 'OTC Medicines',
    icon: Pill,
    color: 'from-purple-500 to-pink-500',
    description: 'Safe over-the-counter recommendations',
    prompt: 'What OTC medicine can help with ',
  },
  {
    id: 'remedies',
    name: 'Home Remedies',
    icon: Leaf,
    color: 'from-green-500 to-emerald-500',
    description: 'Natural and Ayurvedic solutions',
    prompt: 'What are some home remedies for ',
  },
  {
    id: 'nutrition',
    name: 'Diet & Nutrition',
    icon: Heart,
    color: 'from-red-500 to-orange-500',
    description: 'Food recommendations for health',
    prompt: 'What should I eat or avoid if I have ',
  },
  {
    id: 'fitness',
    name: 'Exercise Guide',
    icon: Dumbbell,
    color: 'from-amber-500 to-yellow-500',
    description: 'Safe exercises and activities',
    prompt: 'What exercises are safe for someone with ',
  },
  {
    id: 'mental',
    name: 'Mental Wellness',
    icon: Brain,
    color: 'from-indigo-500 to-violet-500',
    description: 'Stress, anxiety, and sleep help',
    prompt: 'I need help with ',
  },
  {
    id: 'pediatric',
    name: 'Child Health',
    icon: Baby,
    color: 'from-pink-500 to-rose-500',
    description: 'Guidance for children\'s health',
    prompt: 'My child has ',
  },
  {
    id: 'elderly',
    name: 'Senior Care',
    icon: Users,
    color: 'from-teal-500 to-cyan-500',
    description: 'Health tips for seniors',
    prompt: 'Health advice for elderly person with ',
  },
];

const QUICK_QUESTIONS = [
  'What can help with a headache?',
  'Home remedies for cold and cough',
  'Foods to avoid with diabetes',
  'How to improve sleep quality?',
  'Safe exercises for back pain',
  'When should I see a doctor?',
];

function HealzAIContent() {
  const searchParams = useSearchParams();
  const segmentParam = searchParams.get('segment');
  const conditionParam = searchParams.get('condition');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(segmentParam);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-start with condition if provided
    if (conditionParam && messages.length === 0) {
      const initialMessage = `I want to know about ${conditionParam.replace(/-/g, ' ')}`;
      sendMessage(initialMessage);
    }
  }, [conditionParam]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          segment: selectedSegment,
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error occurred. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSegmentClick = (segment: typeof HEALTH_SEGMENTS[0]) => {
    setSelectedSegment(segment.id);
    setInput(segment.prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatMessage = (content: string) => {
    // Parse markdown-like formatting
    return content.split('\n').map((line, i) => {
      // Bold text
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
      // Lists
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
      // Numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
      return (
        <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 pb-4">
      <div className="max-w-6xl mx-auto px-4 flex flex-col h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 mb-4">
            <Sparkles size={16} className="text-teal-400" />
            <span className="text-teal-300 font-medium text-sm">AI-Powered Health Assistant</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Healz<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">AI</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Your intelligent health companion. Get evidence-based guidance for symptoms, remedies, nutrition, and wellness.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 overflow-y-auto pb-4">
              {/* Health Segments Grid */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 text-center">
                  What can I help you with?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {HEALTH_SEGMENTS.map((segment) => (
                    <button
                      key={segment.id}
                      onClick={() => handleSegmentClick(segment)}
                      className={`group p-4 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] text-left ${
                        selectedSegment === segment.id ? 'ring-2 ring-teal-500/50 border-teal-500/50' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${segment.color} flex items-center justify-center mb-3`}>
                        <segment.icon size={20} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-teal-400 transition-colors">
                        {segment.name}
                      </h3>
                      <p className="text-xs text-slate-500">{segment.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Questions */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 text-center">
                  Quick Questions
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_QUESTIONS.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(question)}
                      className="px-4 py-2 rounded-full bg-slate-800/50 text-sm text-slate-300 hover:bg-teal-500/20 hover:text-teal-400 border border-white/5 hover:border-teal-500/30 transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="max-w-2xl mx-auto">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">Medical Disclaimer</h4>
                    <p className="text-xs text-amber-300/80 leading-relaxed">
                      HealzAI provides general health information only. It is not a substitute for professional medical advice.
                      For serious symptoms or medical emergencies, please consult a healthcare provider immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
                        : 'bg-slate-800/80 text-slate-200 border border-white/5'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="text-sm leading-relaxed">{formatMessage(msg.content)}</div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 rounded-2xl px-5 py-4 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-teal-400" />
                      <span className="text-sm text-slate-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          <div className="pt-4 border-t border-white/5">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, remedies, diet, or wellness..."
                className="w-full px-5 py-4 pr-14 rounded-2xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </button>
            </form>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Info size={12} />
                <span>Powered by HealzAI Intelligence</span>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    setSelectedSegment(null);
                  }}
                  className="text-slate-400 hover:text-teal-400 transition-colors"
                >
                  Start new conversation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-4 py-4 border-t border-white/5 mt-4">
            <Link
              href="/conditions"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors"
            >
              <Activity size={14} />
              Browse Conditions
              <ArrowRight size={12} />
            </Link>
            <Link
              href="/remedies"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors"
            >
              <Leaf size={14} />
              Home Remedies
              <ArrowRight size={12} />
            </Link>
            <Link
              href="/doctors"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors"
            >
              <Stethoscope size={14} />
              Find a Doctor
              <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function HealzAIPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading HealzAI...</p>
        </div>
      </main>
    }>
      <HealzAIContent />
    </Suspense>
  );
}
