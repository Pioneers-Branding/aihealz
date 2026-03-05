import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const provider = await prisma.diagnosticProvider.findUnique({
      where: { id: parseInt(id) },
      include: {
        geography: { select: { id: true, name: true, slug: true } },
        testPrices: {
          include: {
            test: { select: { id: true, name: true, slug: true } },
          },
          take: 20,
        },
        packages: {
          select: { id: true, name: true, price: true, isActive: true },
          take: 10,
        },
        bookings: {
          select: { id: true, patientName: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          select: { id: true, reviewerName: true, rating: true, review: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...provider,
      rating: provider.rating ? Number(provider.rating) : null,
      homeCollectionFee: provider.homeCollectionFee ? Number(provider.homeCollectionFee) : null,
      partnerDiscount: provider.partnerDiscount ? Number(provider.partnerDiscount) : null,
      partnerCommission: provider.partnerCommission ? Number(provider.partnerCommission) : null,
    });
  } catch (error) {
    console.error('Failed to fetch diagnostic provider:', error);
    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await req.json();

    const provider = await prisma.diagnosticProvider.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.providerType !== undefined && { providerType: data.providerType }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.accreditations !== undefined && { accreditations: data.accreditations }),
        ...(data.homeCollectionAvailable !== undefined && { homeCollectionAvailable: data.homeCollectionAvailable }),
        ...(data.homeCollectionFee !== undefined && { homeCollectionFee: data.homeCollectionFee }),
        ...(data.isPartner !== undefined && { isPartner: data.isPartner }),
        ...(data.isVerified !== undefined && { isVerified: data.isVerified }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.geographyId !== undefined && { geographyId: data.geographyId }),
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Failed to update diagnostic provider:', error);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.diagnosticProvider.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete diagnostic provider:', error);
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
  }
}
