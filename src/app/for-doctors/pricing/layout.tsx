import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Doctor Plans & Pricing | aihealz',
    description: 'Choose the right plan for your practice — Free, Premium, or Enterprise. AI-powered patient matching, priority listing, and analytics.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
