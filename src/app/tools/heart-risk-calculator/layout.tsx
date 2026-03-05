import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Heart Disease Risk Calculator - Cardiovascular Risk Assessment | AIHealz',
    description: 'Calculate your 10-year heart disease risk. Assess cardiovascular risk factors including blood pressure, cholesterol, smoking, and diabetes. Free heart risk calculator.',
    keywords: 'heart risk calculator, cardiovascular risk, heart disease risk, cardiac risk assessment, heart health calculator, CVD risk, blood pressure risk, cholesterol risk',
    openGraph: {
        title: 'Heart Disease Risk Calculator - Check Your Cardiovascular Health',
        description: 'Estimate your 10-year risk of heart disease based on key risk factors. Free cardiovascular risk assessment.',
        url: 'https://aihealz.com/tools/heart-risk-calculator',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/heart-risk-calculator',
    },
};

export default function HeartRiskCalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
