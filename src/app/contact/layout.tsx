import { Metadata } from 'next';
import {
    generateContactPageSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'Contact Us - Get in Touch with aihealz',
    description: 'Contact aihealz for patient support, doctor verification, partnership opportunities, or general inquiries. Our global team is available 24/7.',
    keywords: ['contact aihealz', 'healthcare support', 'medical directory contact', 'doctor verification'],
    openGraph: {
        title: 'Contact Us | aihealz',
        description: 'Get in touch with our global healthcare team. Available 24/7 for patients, doctors, and partners.',
        type: 'website',
    },
};

const structuredData = [
    generateContactPageSchema(),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Contact', url: '/contact' },
    ]),
];

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            {children}
        </>
    );
}
