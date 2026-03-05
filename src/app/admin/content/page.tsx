import prisma from '@/lib/db';
import Link from 'next/link';
import ContentTable from './ContentTable';

async function getContent() {
    const content = await prisma.localizedContent.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 500,
        include: {
            condition: {
                select: { id: true, commonName: true, slug: true }
            },
            language: {
                select: { code: true, name: true }
            },
            geography: {
                select: { id: true, name: true, slug: true }
            },
            reviewer: {
                select: { id: true, name: true }
            }
        }
    });
    return content;
}

async function getStats() {
    const [total, aiDraft, underReview, verified, published] = await Promise.all([
        prisma.localizedContent.count(),
        prisma.localizedContent.count({ where: { status: 'ai_draft' } }),
        prisma.localizedContent.count({ where: { status: 'under_review' } }),
        prisma.localizedContent.count({ where: { status: 'verified' } }),
        prisma.localizedContent.count({ where: { status: 'published' } }),
    ]);

    return { total, aiDraft, underReview, verified, published };
}

export default async function ContentPage() {
    const [content, stats] = await Promise.all([getContent(), getStats()]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Localized Content</h1>
                    <p className="text-slate-500 mt-1">Manage condition pages in different languages and regions</p>
                </div>
                <Link
                    href="/admin/content/new"
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    Add Content
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total Pages</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-amber-600">{stats.aiDraft}</div>
                    <div className="text-sm text-slate-500">AI Draft</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
                    <div className="text-sm text-slate-500">Under Review</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-purple-600">{stats.verified}</div>
                    <div className="text-sm text-slate-500">Verified</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                    <div className="text-sm text-slate-500">Published</div>
                </div>
            </div>

            {/* Table */}
            <ContentTable content={content} />
        </div>
    );
}
