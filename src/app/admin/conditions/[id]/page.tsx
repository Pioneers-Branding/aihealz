import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import ConditionForm from './ConditionForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getCondition(id: string) {
    if (id === 'new') return null;

    const condition = await prisma.medicalCondition.findUnique({
        where: { id: parseInt(id, 10) },
    });

    return condition;
}

async function getDynamicOptions() {
    // Fetch unique specialist types from existing conditions
    const specialistTypes = await prisma.medicalCondition.findMany({
        where: { specialistType: { not: '' } },
        select: { specialistType: true },
        distinct: ['specialistType'],
        orderBy: { specialistType: 'asc' },
    });

    // Fetch unique body systems from existing conditions
    const bodySystems = await prisma.medicalCondition.findMany({
        where: { bodySystem: { not: null } },
        select: { bodySystem: true },
        distinct: ['bodySystem'],
        orderBy: { bodySystem: 'asc' },
    });

    // Fetch unique severity levels from existing conditions
    const severityLevels = await prisma.medicalCondition.findMany({
        where: { severityLevel: { not: null } },
        select: { severityLevel: true },
        distinct: ['severityLevel'],
        orderBy: { severityLevel: 'asc' },
    });

    return {
        specialistTypes: specialistTypes.map(s => s.specialistType).filter(Boolean),
        bodySystems: bodySystems.map(b => b.bodySystem).filter((b): b is string => b !== null),
        severityLevels: severityLevels.map(s => s.severityLevel).filter((s): s is string => s !== null),
    };
}

export default async function ConditionEditPage({ params }: PageProps) {
    const { id } = await params;
    const [condition, dynamicOptions] = await Promise.all([
        getCondition(id),
        getDynamicOptions(),
    ]);

    if (id !== 'new' && !condition) {
        notFound();
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {condition ? 'Edit Condition' : 'Add New Condition'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {condition ? `Editing: ${condition.commonName}` : 'Create a new medical condition'}
                </p>
            </div>

            {/* Form */}
            <ConditionForm
                condition={condition}
                specialistOptions={dynamicOptions.specialistTypes}
                bodySystemOptions={dynamicOptions.bodySystems}
                severityOptions={dynamicOptions.severityLevels}
            />
        </div>
    );
}
