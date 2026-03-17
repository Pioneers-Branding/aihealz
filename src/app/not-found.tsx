import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col items-center justify-center px-6 py-24">
            <div className="text-center max-w-lg">
                {/* Large 404 */}
                <div className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-cyan-600 leading-none mb-4 select-none">
                    404
                </div>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Page Not Found
                </h1>
                <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go Home
                    </Link>
                    <Link
                        href="/conditions"
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                    >
                        Browse Conditions
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="mt-16 pt-8 border-t border-white/10">
                    <p className="text-sm text-slate-500 mb-4">Popular sections:</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link href="/symptoms" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                            AI Diagnosis
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link href="/doctors" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                            Find Doctors
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link href="/analyze" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                            Report Analysis
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link href="/contact" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
