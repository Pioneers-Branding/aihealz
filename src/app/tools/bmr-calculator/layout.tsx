import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'BMR Calculator - Basal Metabolic Rate & Daily Calorie Needs | AIHealz',
    description: 'Calculate your Basal Metabolic Rate (BMR) and daily calorie needs. Find calories for weight loss, maintenance, or muscle gain. Free BMR calculator.',
    keywords: 'BMR calculator, basal metabolic rate, calorie calculator, daily calories, TDEE calculator, calorie needs, weight loss calories, metabolism calculator',
    openGraph: {
        title: 'BMR & Calorie Calculator - Find Your Daily Calorie Needs',
        description: 'Calculate your BMR and daily calorie requirements for weight loss, maintenance, or gain. Free online calculator.',
        url: 'https://aihealz.com/tools/bmr-calculator',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/bmr-calculator',
    },
};

export default function BMRCalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
