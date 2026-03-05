'use client';

/**
 * Mega Menu — Navigate by Body System
 *
 * Categories: Head & Brain, Heart, Spine & Joints, Lungs,
 * Digestive, Eyes, Skin, Women's Health, Mental Health, Children's Health
 * 
 * Opens on hover with smooth animation.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
    Brain, HeartPulse, Bone, Wind, Apple, Eye,
    Sparkles, Baby, SmilePlus, Activity, ChevronDown
} from 'lucide-react';

interface BodySystem {
    name: string;
    icon: typeof Brain;
    color: string;
    conditions: Array<{ name: string; slug: string }>;
}

const BODY_SYSTEMS: BodySystem[] = [
    {
        name: 'Head & Brain',
        icon: Brain,
        color: 'text-purple-400',
        conditions: [
            { name: 'Migraine', slug: 'migraine' },
            { name: 'Epilepsy', slug: 'epilepsy' },
            { name: 'Stroke', slug: 'stroke' },
            { name: 'Parkinson\'s Disease', slug: 'parkinsons-disease' },
            { name: 'Brain Tumors', slug: 'brain-tumors' },
        ],
    },
    {
        name: 'Heart & Cardiovascular',
        icon: HeartPulse,
        color: 'text-red-400',
        conditions: [
            { name: 'Heart Disease', slug: 'heart-disease' },
            { name: 'Hypertension', slug: 'hypertension' },
            { name: 'Heart Failure', slug: 'heart-failure' },
            { name: 'Arrhythmia', slug: 'arrhythmia' },
            { name: 'Coronary Artery Disease', slug: 'coronary-artery-disease' },
        ],
    },
    {
        name: 'Spine & Joints',
        icon: Bone,
        color: 'text-amber-400',
        conditions: [
            { name: 'Back Pain', slug: 'back-pain' },
            { name: 'Arthritis', slug: 'arthritis' },
            { name: 'Scoliosis', slug: 'scoliosis' },
            { name: 'Herniated Disc', slug: 'herniated-disc' },
            { name: 'Osteoporosis', slug: 'osteoporosis' },
        ],
    },
    {
        name: 'Lungs & Respiratory',
        icon: Wind,
        color: 'text-sky-400',
        conditions: [
            { name: 'Asthma', slug: 'asthma' },
            { name: 'COPD', slug: 'copd' },
            { name: 'Pneumonia', slug: 'pneumonia' },
            { name: 'Lung Cancer', slug: 'lung-cancer' },
            { name: 'Sleep Apnea', slug: 'sleep-apnea' },
        ],
    },
    {
        name: 'Digestive System',
        icon: Apple,
        color: 'text-green-400',
        conditions: [
            { name: 'Diabetes', slug: 'diabetes' },
            { name: 'IBS', slug: 'irritable-bowel-syndrome' },
            { name: 'Crohn\'s Disease', slug: 'crohns-disease' },
            { name: 'Liver Disease', slug: 'liver-disease' },
            { name: 'GERD', slug: 'gerd' },
        ],
    },
    {
        name: 'Eyes & Vision',
        icon: Eye,
        color: 'text-cyan-400',
        conditions: [
            { name: 'Glaucoma', slug: 'glaucoma' },
            { name: 'Cataracts', slug: 'cataracts' },
            { name: 'Macular Degeneration', slug: 'macular-degeneration' },
            { name: 'Diabetic Retinopathy', slug: 'diabetic-retinopathy' },
        ],
    },
    {
        name: 'Skin & Dermatology',
        icon: Sparkles,
        color: 'text-pink-400',
        conditions: [
            { name: 'Eczema', slug: 'eczema' },
            { name: 'Psoriasis', slug: 'psoriasis' },
            { name: 'Acne', slug: 'acne' },
            { name: 'Skin Cancer', slug: 'skin-cancer' },
            { name: 'Rosacea', slug: 'rosacea' },
        ],
    },
    {
        name: 'Mental Health',
        icon: SmilePlus,
        color: 'text-indigo-400',
        conditions: [
            { name: 'Depression', slug: 'depression' },
            { name: 'Anxiety Disorder', slug: 'anxiety-disorder' },
            { name: 'PTSD', slug: 'ptsd' },
            { name: 'Bipolar Disorder', slug: 'bipolar-disorder' },
            { name: 'ADHD', slug: 'adhd' },
        ],
    },
    {
        name: 'Women\'s Health',
        icon: Activity,
        color: 'text-rose-400',
        conditions: [
            { name: 'PCOS', slug: 'pcos' },
            { name: 'Endometriosis', slug: 'endometriosis' },
            { name: 'Breast Cancer', slug: 'breast-cancer' },
            { name: 'Menopause', slug: 'menopause' },
            { name: 'Prenatal Care', slug: 'prenatal-care' },
        ],
    },
    {
        name: 'Children\'s Health',
        icon: Baby,
        color: 'text-orange-400',
        conditions: [
            { name: 'Pediatric Asthma', slug: 'pediatric-asthma' },
            { name: 'Growth Disorders', slug: 'growth-disorders' },
            { name: 'Childhood Obesity', slug: 'childhood-obesity' },
            { name: 'Autism Spectrum', slug: 'autism-spectrum' },
        ],
    },
];

export default function MegaMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSystem, setActiveSystem] = useState<number>(0);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-surface-100/60
                   hover:text-surface-100/90 transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                Conditions <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-[680px] glass-card p-0 mt-1 z-50
                       animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ animationDuration: '200ms' }}>
                    <div className="flex">
                        {/* Left column: body systems */}
                        <div className="w-56 border-r border-white/5 py-3">
                            {BODY_SYSTEMS.map((system, i) => (
                                <button
                                    key={system.name}
                                    onMouseEnter={() => setActiveSystem(i)}
                                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-all ${activeSystem === i
                                            ? 'bg-white/5 text-white'
                                            : 'text-surface-100/50 hover:bg-white/[0.03]'
                                        }`}
                                >
                                    <system.icon size={15} className={system.color} />
                                    {system.name}
                                </button>
                            ))}
                        </div>

                        {/* Right column: conditions */}
                        <div className="flex-1 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                {(() => {
                                    const System = BODY_SYSTEMS[activeSystem];
                                    return (
                                        <>
                                            <System.icon size={18} className={System.color} />
                                            <h3 className="font-semibold text-sm">{System.name}</h3>
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {BODY_SYSTEMS[activeSystem].conditions.map((condition) => (
                                    <Link
                                        key={condition.slug}
                                        href={`/in/en/${condition.slug}`}
                                        className="px-3 py-2 rounded-lg text-sm text-surface-100/60
                             hover:bg-white/5 hover:text-surface-100/90 transition-all"
                                    >
                                        {condition.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/5">
                                <Link
                                    href="/conditions"
                                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                    View all conditions →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
