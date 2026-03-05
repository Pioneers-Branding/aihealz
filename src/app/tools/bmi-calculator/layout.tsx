import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'BMI Calculator - Calculate Your Body Mass Index | AIHealz',
    description: 'Free BMI calculator to check your body mass index instantly. Find out if you are underweight, normal weight, overweight, or obese. Get personalized health insights.',
    keywords: 'BMI calculator, body mass index, calculate BMI, BMI chart, healthy weight, weight calculator, BMI check, body weight index',
    openGraph: {
        title: 'BMI Calculator - Check Your Body Mass Index',
        description: 'Calculate your BMI instantly and understand your weight category. Free online BMI calculator with health insights.',
        url: 'https://aihealz.com/tools/bmi-calculator',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/bmi-calculator',
    },
};

export default function BMICalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
