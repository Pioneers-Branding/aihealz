import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pregnancy Due Date Calculator - Calculate Your Due Date | AIHealz',
    description: 'Calculate your estimated due date and current pregnancy week. Track your pregnancy trimester with our free due date calculator based on your last menstrual period.',
    keywords: 'due date calculator, pregnancy calculator, estimated due date, EDD calculator, pregnancy week calculator, trimester calculator, LMP calculator, pregnancy tracker',
    openGraph: {
        title: 'Pregnancy Due Date Calculator - When Is Your Baby Due?',
        description: 'Calculate your estimated due date, pregnancy week, and trimester. Free pregnancy calculator based on LMP.',
        url: 'https://aihealz.com/tools/pregnancy-due-date-calculator',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/pregnancy-due-date-calculator',
    },
};

export default function PregnancyCalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
