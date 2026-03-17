import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Drug Dosing Calculator - Medication Dosage Reference',
    description: 'AI-powered drug dosing calculator with pediatric and renal dosing adjustments. Evidence-based medication reference for healthcare professionals.',
};

export default function DrugDosingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
