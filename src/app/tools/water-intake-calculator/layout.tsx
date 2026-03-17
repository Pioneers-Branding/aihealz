import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Water Intake Calculator - Daily Hydration Needs | AIHealz',
    description: 'Calculate how much water you should drink daily based on your weight, activity level, and climate. Free daily water intake calculator for optimal hydration.',
    keywords: 'water intake calculator, daily water needs, hydration calculator, how much water to drink, water consumption calculator, hydration needs, fluid intake',
    openGraph: {
        title: 'Water Intake Calculator - Find Your Daily Hydration Needs',
        description: 'Calculate your optimal daily water intake based on body weight, activity, and climate. Free hydration calculator.',
        url: 'https://aihealz.com/tools/water-intake-calculator',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/water-intake-calculator',
    },
};

export default function WaterIntakeCalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
