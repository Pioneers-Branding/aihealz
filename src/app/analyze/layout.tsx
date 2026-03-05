import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Medical Report Analysis - Understand Your Lab Results',
    description: 'Upload your medical report and get AI-powered analysis in plain English. Identify abnormal indicators, understand your results, and connect with the right specialist.',
    keywords: ['medical report analysis', 'lab results', 'blood test interpretation', 'AI health analysis', 'medical report reader'],
    openGraph: {
        title: 'AI Medical Report Analysis | aihealz',
        description: 'Upload your medical report and get AI-powered analysis in plain English. Understand your lab results and find the right specialist.',
        type: 'website',
    },
};

export default function AnalyzeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
