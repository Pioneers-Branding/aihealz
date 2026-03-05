import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Surgical Safety Checklists - Pre-Op & Post-Op Guides',
    description: 'WHO-compliant surgical safety checklists and pre-operative/post-operative care guides for various surgical procedures.',
};

export default function SurgicalChecklistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
