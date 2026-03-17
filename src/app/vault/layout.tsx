import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Health Vault - Secure Medical Records Storage',
    description: 'Store and organize your medical records securely. Upload lab reports, prescriptions, and health documents. Access your health history anytime.',
    keywords: ['health records', 'medical vault', 'medical records storage', 'health document storage', 'PHR'],
    openGraph: {
        title: 'Health Vault | Secure Medical Records | aihealz',
        description: 'Store and organize your medical records securely. Access your health history anytime, anywhere.',
        type: 'website',
    },
};

export default function VaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
