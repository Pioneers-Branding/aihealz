import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Health Calculators & Tools - BMI, BMR, Heart Risk & More',
    description: 'Free AI-enhanced health calculators including BMI, BMR, heart disease risk, kidney function (eGFR), diabetes risk, body fat, and pregnancy due date calculators.',
    keywords: ['health calculators', 'BMI calculator', 'BMR calculator', 'heart risk calculator', 'eGFR calculator', 'diabetes risk', 'pregnancy calculator'],
    openGraph: {
        title: 'Health Calculators & Tools | aihealz',
        description: 'Free evidence-based health calculators with AI-enhanced insights. Calculate BMI, BMR, heart risk, and more.',
        type: 'website',
    },
};

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
