import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quick Medical Reference - Lab Values & Clinical Pearls',
    description: 'Instant access to normal lab values, vital sign ranges, Glasgow Coma Scale, and clinical pearls. Essential reference for healthcare professionals.',
};

export default function QuickReferenceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
