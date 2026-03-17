import prisma from '@/lib/db';
import Link from 'next/link';

export default async function CreativesPage() {
    const creatives = await prisma.adCreative.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            advertiser: {
                select: {
                    id: true,
                    companyName: true,
                },
            },
        },
    });

    const adTypeLabels: Record<string, string> = {
        display_banner: 'Display Banner',
        sidebar_sticky: 'Sidebar Sticky',
        inline_content: 'Inline Content',
        sponsored_listing: 'Sponsored Listing',
        featured_badge: 'Featured Badge',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ad Creatives</h1>
                    <p className="text-slate-500 mt-1">Manage ad images and content</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/advertising"
                        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                    <Link
                        href="/admin/advertising/creatives/new"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload Creative
                    </Link>
                </div>
            </div>

            {/* Creatives Grid */}
            {creatives.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Ad Creatives Yet</h3>
                        <p className="text-slate-500 mb-6">
                            Upload your first ad creative to start running campaigns.
                        </p>

                        <Link
                            href="/admin/advertising/creatives/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Upload First Creative
                        </Link>

                        {/* Requirements */}
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <h4 className="text-sm font-medium text-slate-700 mb-4">Accepted Formats & Sizes</h4>
                            <div className="grid sm:grid-cols-2 gap-4 text-left">
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <div className="text-xs font-medium text-slate-600 mb-1">File Types</div>
                                    <p className="text-sm text-slate-500">JPG, PNG, GIF, WebP</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <div className="text-xs font-medium text-slate-600 mb-1">Max File Size</div>
                                    <p className="text-sm text-slate-500">2MB per image</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <div className="text-xs font-medium text-slate-600 mb-1">Banner Sizes</div>
                                    <p className="text-sm text-slate-500">300×250, 728×90, 970×250</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <div className="text-xs font-medium text-slate-600 mb-1">Sidebar Sizes</div>
                                    <p className="text-sm text-slate-500">300×250, 300×600</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {creatives.map((creative) => (
                        <div key={creative.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-shadow">
                            {/* Preview */}
                            <div className="aspect-video bg-slate-100 relative">
                                {creative.imageUrl ? (
                                    <img
                                        src={creative.imageUrl}
                                        alt={creative.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${creative.isActive ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                                        {creative.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-medium text-slate-900 mb-1 truncate">{creative.name}</h3>
                                <div className="text-xs text-slate-500 mb-2">{creative.advertiser.companyName}</div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                        {adTypeLabels[creative.adType] || creative.adType}
                                    </span>
                                    {creative.width && creative.height && (
                                        <span className="text-slate-400">
                                            {creative.width}x{creative.height}
                                        </span>
                                    )}
                                </div>
                                {creative.headline && (
                                    <div className="mt-3 text-sm text-slate-600 truncate">{creative.headline}</div>
                                )}
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">
                                        {new Date(creative.createdAt).toLocaleDateString()}
                                    </span>
                                    <Link
                                        href={`/admin/advertising/creatives/${creative.id}`}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
