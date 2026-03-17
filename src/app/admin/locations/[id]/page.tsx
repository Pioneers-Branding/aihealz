import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import LocationForm from './LocationForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getLocation(id: string) {
    if (id === 'new') return null;

    const location = await prisma.geography.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            parent: true,
        }
    });

    return location;
}

async function getParentOptions() {
    const locations = await prisma.geography.findMany({
        where: {
            level: { in: ['continent', 'country', 'state', 'city'] }
        },
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, level: true }
    });

    return locations;
}

async function getLanguages() {
    const languages = await prisma.language.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { code: true, name: true }
    });

    return languages;
}

async function getTimezones() {
    // Fetch unique timezones from existing locations
    const locations = await prisma.geography.findMany({
        where: { timezone: { not: null } },
        select: { timezone: true },
        distinct: ['timezone'],
        orderBy: { timezone: 'asc' },
    });

    return locations.map(l => l.timezone).filter((tz): tz is string => tz !== null);
}

export default async function LocationEditPage({ params }: PageProps) {
    const { id } = await params;
    const [location, parentOptions, languages, timezones] = await Promise.all([
        getLocation(id),
        getParentOptions(),
        getLanguages(),
        getTimezones(),
    ]);

    if (id !== 'new' && !location) {
        notFound();
    }

    // Serialize BigInt for client component
    const serializedLocation = location ? {
        ...location,
        population: location.population?.toString() || null,
        latitude: location.latitude?.toString() || null,
        longitude: location.longitude?.toString() || null,
    } : null;

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {location ? 'Edit Location' : 'Add New Location'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {location ? `Editing: ${location.name}` : 'Create a new geographic location'}
                </p>
            </div>

            {/* Form */}
            <LocationForm
                location={serializedLocation}
                parentOptions={parentOptions}
                languages={languages}
                timezoneOptions={timezones}
            />
        </div>
    );
}
