import prisma from '@/lib/db';
import Link from 'next/link';
import LanguagesTable from './LanguagesTable';

async function getLanguages() {
    const languages = await prisma.language.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: {
                    localizedContent: true,
                    uiTranslations: true,
                }
            }
        }
    });
    return languages;
}

export default async function LanguagesPage() {
    const languages = await getLanguages();

    const stats = {
        total: languages.length,
        active: languages.filter(l => l.isActive).length,
        withContent: languages.filter(l => l._count.localizedContent > 0).length,
        totalTranslations: languages.reduce((acc, l) => acc + l._count.uiTranslations, 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Languages</h1>
                    <p className="text-slate-500 mt-1">Manage supported languages and translations</p>
                </div>
                <Link
                    href="/admin/languages/new"
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    Add Language
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total Languages</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-sm text-slate-500">Active</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.withContent}</div>
                    <div className="text-sm text-slate-500">With Content</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalTranslations}</div>
                    <div className="text-sm text-slate-500">UI Translations</div>
                </div>
            </div>

            {/* Table */}
            <LanguagesTable languages={languages} />
        </div>
    );
}
