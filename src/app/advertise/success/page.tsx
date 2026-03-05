import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Thank You | AIHealz Advertising',
    description: 'Your advertising enquiry has been submitted successfully.',
    robots: 'noindex, nofollow',
};

export default function AdvertiseSuccessPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 relative overflow-hidden flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

            <div className="relative px-6 py-20 text-center max-w-2xl mx-auto">
                {/* Success Icon */}
                <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <svg className="w-12 h-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                    Thank You!
                </h1>
                <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                    Your advertising enquiry has been received. Our team will review your submission and reach out within <span className="text-white font-semibold">24 hours</span>.
                </p>

                {/* What's Next Card */}
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8 text-left">
                    <h2 className="text-lg font-semibold text-white mb-4">What happens next?</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-teal-400 text-sm font-bold">1</span>
                            </div>
                            <div>
                                <div className="font-medium text-white">Review</div>
                                <div className="text-sm text-slate-400">Our team reviews your requirements and matches you with the right advertising solutions.</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-teal-400 text-sm font-bold">2</span>
                            </div>
                            <div>
                                <div className="font-medium text-white">Discovery Call</div>
                                <div className="text-sm text-slate-400">We&apos;ll schedule a brief call to understand your goals and recommend the best approach.</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-teal-400 text-sm font-bold">3</span>
                            </div>
                            <div>
                                <div className="font-medium text-white">Campaign Setup</div>
                                <div className="text-sm text-slate-400">Once approved, we&apos;ll help you set up your first campaign and start reaching patients.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="text-slate-400 text-sm mb-10">
                    Questions in the meantime? Email us at{' '}
                    <a href="mailto:ads@aihealz.com" className="text-teal-400 hover:underline">
                        ads@aihealz.com
                    </a>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        Explore AIHealz
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    <Link
                        href="/advertise"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all"
                    >
                        Back to Advertising
                    </Link>
                </div>
            </div>
        </main>
    );
}
