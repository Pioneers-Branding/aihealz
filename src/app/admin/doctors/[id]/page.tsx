import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import DoctorForm from './DoctorForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getDoctor(id: string) {
    if (id === 'new') return null;

    const doctor = await prisma.doctorProvider.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            geography: true,
            specialties: {
                include: {
                    condition: {
                        select: { id: true, commonName: true }
                    }
                }
            }
        }
    });

    return doctor;
}

async function getFormData() {
    const [geographies, conditions, subscriptionPlans] = await Promise.all([
        prisma.geography.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                level: true,
                parent: {
                    select: {
                        name: true,
                        parent: { select: { name: true } } // country for cities
                    }
                }
            }
        }),
        prisma.medicalCondition.findMany({
            where: { isActive: true },
            orderBy: { commonName: 'asc' },
            select: { id: true, commonName: true, specialistType: true }
        }),
        // Fetch unique subscription tiers from active plans
        prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            select: { tier: true, planName: true },
            distinct: ['tier'],
            orderBy: { tier: 'asc' },
        })
    ]);

    // Extract unique tiers with their plan names for display
    const tierOptions = subscriptionPlans.map(p => ({
        value: p.tier,
        label: p.planName,
    }));

    // Transform geographies to include display name with full path
    const transformedGeographies = geographies.map(geo => {
        let displayName = geo.name;
        if (geo.parent) {
            if (geo.parent.parent) {
                displayName = `${geo.name}, ${geo.parent.name}, ${geo.parent.parent.name}`;
            } else {
                displayName = `${geo.name}, ${geo.parent.name}`;
            }
        }
        return {
            id: geo.id,
            name: geo.name,
            slug: geo.slug,
            displayName,
        };
    });

    return { geographies: transformedGeographies, conditions, tierOptions };
}

export default async function DoctorEditPage({ params }: PageProps) {
    const { id } = await params;
    const [doctor, formData] = await Promise.all([
        getDoctor(id),
        getFormData()
    ]);

    if (id !== 'new' && !doctor) {
        notFound();
    }

    // Serialize for client component - handle Decimal and Json types
    const serializedDoctor = doctor ? {
        ...doctor,
        consultationFee: doctor.consultationFee?.toString() || null,
        rating: doctor.rating?.toString() || null,
        badgeScore: doctor.badgeScore?.toString() || null,
        // Normalize contactInfo from JsonValue to a plain object or null
        contactInfo: (doctor.contactInfo && typeof doctor.contactInfo === 'object' && !Array.isArray(doctor.contactInfo))
            ? (doctor.contactInfo as Record<string, unknown>)
            : null,
    } : null;

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {doctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {doctor ? `Editing: ${doctor.name}` : 'Create a new healthcare provider profile'}
                </p>
            </div>

            {/* Form */}
            <DoctorForm
                doctor={serializedDoctor}
                geographies={formData.geographies}
                conditions={formData.conditions}
                tierOptions={formData.tierOptions}
            />
        </div>
    );
}
