import { Metadata } from 'next';
import Link from 'next/link';
import {
    generateWebPageSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'Privacy Policy | aihealz',
    description: 'Privacy Policy for aihealz. Learn how we collect, use, and protect your healthcare data securely.',
    keywords: 'privacy policy aihealz, medical data protection, healthcare privacy, GDPR compliance aihealz',
    openGraph: {
        title: 'Privacy Policy | aihealz',
        description: 'How we protect your medical data.',
        url: 'https://aihealz.com/privacy',
        siteName: 'aihealz',
    }
};

const structuredData = [
    generateWebPageSchema(
        'Privacy Policy | AIHealz',
        'Privacy Policy for AIHealz. Learn how we collect, use, and protect your healthcare data securely with GDPR and HIPAA compliance.',
        'https://aihealz.com/privacy',
        { dateModified: '2026-10-01' }
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
    ]),
];

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-50 pt-24 pb-16 relative overflow-hidden">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 mt-10 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white drop-shadow-md">
                        Privacy Policy
                    </h1>
                    <p className="text-primary-400 font-bold tracking-widest uppercase text-xs">Last Updated: October 2026</p>
                </div>

                <div className="bg-[#0A1128]/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/10 prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-strong:text-white">
                    <p className="lead text-slate-300">
                        Welcome to <strong>aihealz</strong>. We respect your privacy and are committed to protecting your personal data globally. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">1. Important Information and Who We Are</h2>
                    <p className="text-slate-400">
                        aihealz is the controller and responsible for your personal data. We have appointed a data privacy manager who is responsible for overseeing questions in relation to this privacy policy. If you have any questions about this privacy policy, including any requests to exercise your legal rights, please contact the data privacy manager using the details set out below.
                    </p>
                    <ul className="text-slate-400 list-disc pl-6">
                        <li><strong>Email address:</strong> <a href="mailto:privacy@aihealz.com">privacy@aihealz.com</a></li>
                    </ul>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">2. The Data We Collect About You</h2>
                    <p className="text-slate-400">
                        Personal data, or personal information, means any information about an individual from which that person can be identified. It does not include data where the identity has been removed (anonymous data).
                    </p>
                    <p className="text-slate-400">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                    <ul className="text-slate-400 list-disc pl-6 space-y-2">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                        <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                        <li className="text-white bg-white/5 p-4 rounded-xl border border-white/10 mt-4"><strong>Health Data</strong>: Any data submitted through our AI symptom checker, medical travel bot, or report analysis tools is <strong>strictly transient</strong>. It is processed in memory for abstract AI analysis and is <strong>never permanently stored</strong> in our databases without explicit enterprise consent.</li>
                    </ul>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">3. How We Use Your Personal Data</h2>
                    <p className="text-slate-400">
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="text-slate-400 list-disc pl-6 space-y-2">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal obligation globally (GDPR, HIPAA compliance pipelines).</li>
                    </ul>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">4. Data Security</h2>
                    <p className="text-slate-400">
                        We have put in place robust, bank-grade encryption and security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a strict business need to know.
                    </p>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">5. Your Legal Rights</h2>
                    <p className="text-slate-400">
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
                    </p>
                    <p className="text-slate-400">
                        If you wish to exercise any of the rights set out above, please <Link href="/contact" className="font-bold underline">contact us</Link>.
                    </p>
                </div>
            </div>
        </main>
    );
}
