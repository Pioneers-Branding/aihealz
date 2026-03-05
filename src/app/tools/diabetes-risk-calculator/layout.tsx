import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Diabetes Risk Calculator - Type 2 Diabetes Risk Assessment | AIHealz',
    description: 'Assess your risk of developing Type 2 diabetes. Calculate diabetes risk based on age, BMI, family history, and lifestyle factors. Free diabetes risk calculator.',
    keywords: 'diabetes risk calculator, type 2 diabetes risk, diabetes assessment, prediabetes risk, blood sugar risk, diabetes prevention, metabolic risk calculator',
    openGraph: {
        title: 'Diabetes Risk Calculator - Check Your Type 2 Diabetes Risk',
        description: 'Assess your risk of developing Type 2 diabetes based on key risk factors. Free diabetes risk assessment tool.',
        url: 'https://aihealz.com/tools/diabetes-risk-calculator',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/diabetes-risk-calculator',
    },
};

export default function DiabetesRiskCalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
