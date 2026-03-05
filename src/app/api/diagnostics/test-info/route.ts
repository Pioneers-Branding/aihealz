import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface ProviderInfo {
  id: number;
  slug: string;
  name: string;
  homeCollectionAvailable: boolean;
  homeCollectionFee: number | null;
  address: string | null;
  phone: string | null;
  price: number;
  mrpPrice: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testSlug = searchParams.get('slug');
    const providerSlug = searchParams.get('provider');

    if (!testSlug) {
      return NextResponse.json(
        { error: 'Test slug required' },
        { status: 400 }
      );
    }

    // Fetch test information
    const test = await prisma.diagnosticTest.findUnique({
      where: { slug: testSlug },
      select: {
        id: true,
        slug: true,
        name: true,
        shortName: true,
        sampleType: true,
        fastingRequired: true,
        fastingHours: true,
        reportTimeHours: true,
        homeCollectionPossible: true,
        preparationInstructions: true,
        avgPriceInr: true,
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Fetch provider information if specified
    let provider: ProviderInfo | null = null;
    if (providerSlug) {
      const providerData = await prisma.diagnosticProvider.findUnique({
        where: { slug: providerSlug },
        select: {
          id: true,
          slug: true,
          name: true,
          homeCollectionAvailable: true,
          homeCollectionFee: true,
          address: true,
          phone: true,
          testPrices: {
            where: {
              testId: test.id,
              isActive: true,
            },
            select: {
              price: true,
              mrpPrice: true,
            },
            take: 1,
          },
        },
      });

      if (providerData && providerData.testPrices.length > 0) {
        provider = {
          id: providerData.id,
          slug: providerData.slug,
          name: providerData.name,
          homeCollectionAvailable: providerData.homeCollectionAvailable,
          homeCollectionFee: providerData.homeCollectionFee ? Number(providerData.homeCollectionFee) : null,
          address: providerData.address,
          phone: providerData.phone,
          price: Number(providerData.testPrices[0].price),
          mrpPrice: providerData.testPrices[0].mrpPrice ? Number(providerData.testPrices[0].mrpPrice) : null,
        };
      }
    }

    // If no specific provider, get the cheapest one
    if (!provider) {
      const cheapestPrice = await prisma.diagnosticTestPrice.findFirst({
        where: {
          testId: test.id,
          isActive: true,
          provider: { isActive: true },
        },
        orderBy: { price: 'asc' },
        include: {
          provider: {
            select: {
              id: true,
              slug: true,
              name: true,
              homeCollectionAvailable: true,
              homeCollectionFee: true,
              address: true,
              phone: true,
            },
          },
        },
      });

      if (cheapestPrice) {
        provider = {
          id: cheapestPrice.provider.id,
          slug: cheapestPrice.provider.slug,
          name: cheapestPrice.provider.name,
          homeCollectionAvailable: cheapestPrice.provider.homeCollectionAvailable,
          homeCollectionFee: cheapestPrice.provider.homeCollectionFee ? Number(cheapestPrice.provider.homeCollectionFee) : null,
          address: cheapestPrice.provider.address,
          phone: cheapestPrice.provider.phone,
          price: Number(cheapestPrice.price),
          mrpPrice: cheapestPrice.mrpPrice ? Number(cheapestPrice.mrpPrice) : null,
        };
      }
    }

    return NextResponse.json({
      success: true,
      test: {
        ...test,
        avgPriceInr: test.avgPriceInr ? Number(test.avgPriceInr) : null,
      },
      provider,
    });
  } catch (error) {
    console.error('Test info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test information' },
      { status: 500 }
    );
  }
}
