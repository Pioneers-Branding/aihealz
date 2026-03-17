import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Body Fat Calculator - Estimate Body Fat Percentage | AIHealz',
    description: 'Calculate your body fat percentage using the U.S. Navy method. More accurate than BMI for assessing body composition. Free body fat percentage calculator.',
    keywords: 'body fat calculator, body fat percentage, navy body fat calculator, fat percentage calculator, body composition calculator, lean mass calculator, fitness calculator',
    openGraph: {
        title: 'Body Fat Calculator - Check Your Body Fat Percentage',
        description: 'Estimate your body fat percentage using circumference measurements. Free U.S. Navy method calculator.',
        url: 'https://aihealz.com/tools/body-fat-calculator',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/body-fat-calculator',
    },
};

export default function BodyFatCalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
