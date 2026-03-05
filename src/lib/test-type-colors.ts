/**
 * Color coding for different diagnostic test types
 * Used across the application for visual differentiation
 */

export type DiagnosticTestType =
    | 'lab_test'
    | 'imaging'
    | 'pathology'
    | 'genetic'
    | 'cardiac'
    | 'pulmonary'
    | 'endoscopy'
    | 'other';

export interface TestTypeStyle {
    bg: string;
    border: string;
    text: string;
    hoverBg: string;
    icon: string;
    label: string;
}

export const TEST_TYPE_COLORS: Record<DiagnosticTestType, TestTypeStyle> = {
    lab_test: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        hoverBg: 'hover:bg-blue-500/20',
        icon: '🧪',
        label: 'Lab Test',
    },
    imaging: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        hoverBg: 'hover:bg-purple-500/20',
        icon: '📷',
        label: 'Imaging',
    },
    pathology: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-400',
        hoverBg: 'hover:bg-rose-500/20',
        icon: '🔬',
        label: 'Pathology',
    },
    genetic: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        hoverBg: 'hover:bg-amber-500/20',
        icon: '🧬',
        label: 'Genetic',
    },
    cardiac: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        hoverBg: 'hover:bg-red-500/20',
        icon: '❤️',
        label: 'Cardiac',
    },
    pulmonary: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
        hoverBg: 'hover:bg-cyan-500/20',
        icon: '🫁',
        label: 'Pulmonary',
    },
    endoscopy: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        hoverBg: 'hover:bg-orange-500/20',
        icon: '🔎',
        label: 'Endoscopy',
    },
    other: {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        text: 'text-slate-400',
        hoverBg: 'hover:bg-slate-500/20',
        icon: '📋',
        label: 'Other',
    },
};

// Health package colors (different from test types)
export const PACKAGE_COLORS = {
    basic: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        hoverBg: 'hover:bg-emerald-500/20',
        icon: '📦',
        label: 'Basic Package',
    },
    comprehensive: {
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/20',
        text: 'text-teal-400',
        hoverBg: 'hover:bg-teal-500/20',
        icon: '🎁',
        label: 'Comprehensive',
    },
    premium: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        text: 'text-indigo-400',
        hoverBg: 'hover:bg-indigo-500/20',
        icon: '👑',
        label: 'Premium',
    },
    specialized: {
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        text: 'text-pink-400',
        hoverBg: 'hover:bg-pink-500/20',
        icon: '🎯',
        label: 'Specialized',
    },
};

// Category icons and colors
export const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
    'blood-tests': { icon: '🩸', color: 'text-red-400' },
    'diabetes-tests': { icon: '🍬', color: 'text-amber-400' },
    'thyroid-tests': { icon: '🦋', color: 'text-purple-400' },
    'lipid-tests': { icon: '💧', color: 'text-blue-400' },
    'liver-tests': { icon: '🫀', color: 'text-rose-400' },
    'kidney-tests': { icon: '🫘', color: 'text-orange-400' },
    'vitamin-tests': { icon: '💊', color: 'text-green-400' },
    'hormone-tests': { icon: '⚗️', color: 'text-pink-400' },
    'infection-tests': { icon: '🦠', color: 'text-lime-400' },
    'cancer-markers': { icon: '🎯', color: 'text-red-500' },
    'allergy-tests': { icon: '🤧', color: 'text-yellow-400' },
    'urine-tests': { icon: '🧫', color: 'text-amber-400' },
    'stool-tests': { icon: '💩', color: 'text-yellow-600' },
    'imaging': { icon: '📷', color: 'text-purple-400' },
    'xray': { icon: '☢️', color: 'text-cyan-400' },
    'ct-scan': { icon: '🔄', color: 'text-blue-400' },
    'mri': { icon: '🧲', color: 'text-indigo-400' },
    'ultrasound': { icon: '📡', color: 'text-teal-400' },
    'pet-scan': { icon: '☢️', color: 'text-amber-500' },
    'cardiac-tests': { icon: '❤️', color: 'text-red-400' },
    'pulmonary-tests': { icon: '🫁', color: 'text-cyan-400' },
    'genetic-tests': { icon: '🧬', color: 'text-amber-400' },
    'prenatal-tests': { icon: '🤰', color: 'text-pink-400' },
    'pathology': { icon: '🔬', color: 'text-rose-400' },
    'health-packages': { icon: '📦', color: 'text-emerald-400' },
};

// Helper function to get test type style
export function getTestTypeStyle(testType: string): TestTypeStyle {
    return TEST_TYPE_COLORS[testType as DiagnosticTestType] || TEST_TYPE_COLORS.other;
}

// Helper function to get category style
export function getCategoryStyle(categorySlug: string): { icon: string; color: string } {
    return CATEGORY_STYLES[categorySlug] || { icon: '📋', color: 'text-slate-400' };
}
