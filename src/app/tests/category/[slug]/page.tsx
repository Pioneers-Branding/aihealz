import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGeoContext } from '@/lib/geo-context';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.diagnosticCategory.findUnique({
    where: { slug },
    select: { name: true, description: true, metaTitle: true, metaDescription: true },
  });

  if (!category) {
    return { title: 'Category Not Found | aihealz' };
  }

  return {
    title: category.metaTitle || `${category.name} Tests - Book Online at Best Price | aihealz`,
    description: category.metaDescription || category.description || `Find and compare ${category.name.toLowerCase()} from certified diagnostic centers. Book online with home collection available.`,
    openGraph: {
      title: `${category.name} | Diagnostic Tests`,
      description: category.description || `Browse all ${category.name.toLowerCase()} tests available at aihealz.`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const categories = await prisma.diagnosticCategory.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return categories.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const geo = await getGeoContext();
  const page = parseInt(pageStr || '1', 10);
  const pageSize = 24;

  const category = await prisma.diagnosticCategory.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        include: {
          _count: { select: { tests: true } },
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  // Get category IDs to search (include children)
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  // Fetch tests
  const [tests, totalCount] = await Promise.all([
    prisma.diagnosticTest.findMany({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
      },
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { prices: true } },
      },
      orderBy: [{ searchVolume: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.diagnosticTest.count({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatPrice = (priceInr: number | null, priceUsd: number | null) => {
    if (geo.countrySlug === 'in' || geo.countrySlug === 'india') {
      return priceInr ? `₹${priceInr.toLocaleString('en-IN')}` : null;
    }
    return priceUsd ? `$${priceUsd.toLocaleString('en-US')}` : null;
  };

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    numberOfItems: totalCount,
    itemListElement: tests.map((test, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * pageSize + index + 1,
      item: {
        '@type': 'MedicalTest',
        name: test.name,
        url: `https://aihealz.com/tests/${test.slug}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/tests" className="hover:text-emerald-400 transition-colors">Tests</Link>
            {category.parent && (
              <>
                <span>/</span>
                <Link href={`/tests/category/${category.parent.slug}`} className="hover:text-emerald-400 transition-colors">
                  {category.parent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-400">{category.name}</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              {category.icon && <span className="text-4xl">{category.icon}</span>}
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                {category.name}
              </h1>
            </div>
            {category.description && (
              <p className="text-lg text-slate-400 max-w-3xl">{category.description}</p>
            )}
            <p className="text-sm text-slate-500 mt-4">
              {totalCount.toLocaleString()} tests available
            </p>
          </div>

          {/* Subcategories */}
          {category.children.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-white mb-4">Subcategories</h2>
              <div className="flex flex-wrap gap-3">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/tests/category/${child.slug}`}
                    className="px-4 py-2 rounded-xl bg-slate-800/80 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-800 transition-all text-sm text-slate-300 hover:text-white"
                  >
                    {child.name}
                    <span className="ml-2 text-xs text-slate-500">({child._count.tests})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tests Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/tests/${test.slug}`}
                className="group bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 transition-all hover:bg-slate-800/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  {test.homeCollectionPossible && (
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      Home
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1 line-clamp-2">
                  {test.shortName || test.name}
                </h3>

                {test.shortName && test.shortName !== test.name && (
                  <p className="text-xs text-slate-500 mb-2 line-clamp-1">{test.name}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                  {test.avgPriceInr && (
                    <span className="text-sm font-semibold text-emerald-400">
                      {formatPrice(Number(test.avgPriceInr), Number(test.avgPriceUsd))}
                    </span>
                  )}
                  {test._count.prices > 0 ? (
                    <span className="text-xs text-slate-500">
                      {test._count.prices} provider{test._count.prices > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">Coming soon</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/tests/category/${slug}?page=${page - 1}`}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Previous
                </Link>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={`/tests/category/${slug}?page=${pageNum}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                        page === pageNum
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {page < totalPages && (
                <Link
                  href={`/tests/category/${slug}?page=${page + 1}`}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          )}

          {/* Empty state */}
          {tests.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No tests found</h3>
              <p className="text-slate-400 mb-6">We&apos;re adding tests to this category soon.</p>
              <Link
                href="/tests"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
              >
                Browse All Tests
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
