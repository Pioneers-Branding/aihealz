import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const testType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!query && !category && !testType) {
      // Return popular tests if no search criteria
      const popularTests = await prisma.diagnosticTest.findMany({
        where: { isActive: true },
        select: {
          id: true,
          slug: true,
          name: true,
          shortName: true,
          testType: true,
          sampleType: true,
          avgPriceInr: true,
          homeCollectionPossible: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { searchVolume: 'desc' },
        take: limit,
        skip: offset,
      });

      return NextResponse.json({
        success: true,
        tests: popularTests.map((t) => ({
          ...t,
          avgPriceInr: t.avgPriceInr ? Number(t.avgPriceInr) : null,
        })),
        total: popularTests.length,
      });
    }

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };

    if (query) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { shortName: { contains: query, mode: 'insensitive' } },
        { aliases: { hasSome: searchTerms } },
        { keywords: { hasSome: searchTerms } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
      const cat = await prisma.diagnosticCategory.findFirst({
        where: { slug: category, isActive: true },
        select: { id: true },
      });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    if (testType) {
      where.testType = testType;
    }

    const [tests, total] = await Promise.all([
      prisma.diagnosticTest.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          shortName: true,
          testType: true,
          sampleType: true,
          avgPriceInr: true,
          homeCollectionPossible: true,
          reportTimeHours: true,
          fastingRequired: true,
          category: { select: { name: true, slug: true } },
          _count: { select: { prices: true } },
        },
        orderBy: [{ searchVolume: 'desc' }, { name: 'asc' }],
        take: Math.min(limit, 50),
        skip: offset,
      }),
      prisma.diagnosticTest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      tests: tests.map((t) => ({
        ...t,
        avgPriceInr: t.avgPriceInr ? Number(t.avgPriceInr) : null,
        providerCount: t._count.prices,
      })),
      total,
      hasMore: offset + tests.length < total,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search tests' },
      { status: 500 }
    );
  }
}
