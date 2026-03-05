import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import LanguageForm from './LanguageForm';

interface PageProps {
    params: Promise<{ code: string }>;
}

async function getLanguage(code: string) {
    if (code === 'new') return null;

    const language = await prisma.language.findUnique({
        where: { code },
    });

    return language;
}

export default async function LanguageEditPage({ params }: PageProps) {
    const { code } = await params;
    const language = await getLanguage(code);

    if (code !== 'new' && !language) {
        notFound();
    }

    return (
        <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {language ? 'Edit Language' : 'Add New Language'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {language ? `Editing: ${language.name}` : 'Add a new language to the system'}
                </p>
            </div>

            {/* Form */}
            <LanguageForm language={language} />
        </div>
    );
}
