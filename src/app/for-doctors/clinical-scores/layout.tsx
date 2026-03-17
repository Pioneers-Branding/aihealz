import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Clinical Scoring Tools - Medical Calculators for Doctors',
    description: 'Evidence-based clinical scoring calculators including CHADS-VASc, Wells Score, MELD, Glasgow Coma Scale, and more. Free tools for healthcare professionals.',
};

export default function ClinicalScoresLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
