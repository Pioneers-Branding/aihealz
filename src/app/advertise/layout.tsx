import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Advertise on aihealz - Reach Healthcare Seekers Worldwide',
    description: 'Advertise your clinic, hospital, or healthcare business on the world\'s largest multilingual healthcare platform. 71,000+ conditions, 18+ countries, 1M+ monthly visitors.',
    keywords: ['healthcare advertising', 'medical advertising', 'clinic marketing', 'hospital advertising', 'healthcare marketing platform'],
    openGraph: {
        title: 'Advertise on aihealz | Healthcare Advertising Platform',
        description: 'Reach millions of healthcare seekers worldwide. Target by condition, geography, specialty, and language.',
        type: 'website',
    },
};

export default function AdvertiseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
