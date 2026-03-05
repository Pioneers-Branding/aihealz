import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const bookingSchema = z.object({
  providerId: z.number().int().positive(),
  testId: z.number().int().positive().optional(),
  packageId: z.number().int().positive().optional(),
  collectionType: z.enum(['walk_in', 'home_collection', 'camp']).default('walk_in'),
  patientName: z.string().min(2).max(200),
  patientPhone: z.string().min(10).max(20),
  patientEmail: z.string().email().optional(),
  patientAge: z.number().int().min(0).max(150).optional(),
  patientGender: z.string().optional(),
  collectionSlot: z.string().optional(), // ISO date-time string
  collectionAddress: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  sessionHash: z.string().optional(),
  geographyId: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    // Validate that either testId or packageId is provided
    if (!data.testId && !data.packageId) {
      return NextResponse.json(
        { error: 'Either testId or packageId must be provided' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.diagnosticProvider.findUnique({
      where: { id: data.providerId },
      select: { id: true, name: true, isActive: true, partnerCommission: true },
    });

    if (!provider || !provider.isActive) {
      return NextResponse.json(
        { error: 'Provider not found or inactive' },
        { status: 404 }
      );
    }

    // Get price information
    let price = 0;
    let currency = 'INR';

    if (data.testId) {
      const testPrice = await prisma.diagnosticTestPrice.findFirst({
        where: {
          testId: data.testId,
          providerId: data.providerId,
          isActive: true,
        },
        select: { price: true, currency: true },
      });
      if (testPrice) {
        price = Number(testPrice.price);
        currency = testPrice.currency;
      }
    }

    if (data.packageId) {
      const pkg = await prisma.diagnosticPackage.findUnique({
        where: { id: data.packageId },
        select: { price: true, currency: true },
      });
      if (pkg) {
        price = Number(pkg.price);
        currency = pkg.currency;
      }
    }

    // Create booking
    const booking = await prisma.diagnosticBooking.create({
      data: {
        providerId: data.providerId,
        testId: data.testId || null,
        packageId: data.packageId || null,
        collectionType: data.collectionType,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail,
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        collectionSlot: data.collectionSlot ? new Date(data.collectionSlot) : null,
        collectionAddress: data.collectionAddress,
        notes: data.notes,
        sessionHash: data.sessionHash,
        geographyId: data.geographyId,
        price,
        finalPrice: price, // Same as price for now, can apply discounts later
        currency,
        status: 'pending',
        paymentStatus: 'pending',
      },
      include: {
        provider: {
          select: { name: true, phone: true },
        },
        test: {
          select: { name: true },
        },
        package: {
          select: { name: true },
        },
      },
    });

    // Update provider booking count
    await prisma.diagnosticProvider.update({
      where: { id: data.providerId },
      data: { totalBookings: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        status: booking.status,
        price: booking.price,
        currency: booking.currency,
        providerName: booking.provider.name,
        testName: booking.test?.name || booking.package?.name,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Get booking status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    const sessionHash = searchParams.get('session');

    if (!bookingId && !sessionHash) {
      return NextResponse.json(
        { error: 'Booking ID or session hash required' },
        { status: 400 }
      );
    }

    const where = bookingId
      ? { id: bookingId }
      : { sessionHash: sessionHash as string };

    const bookings = await prisma.diagnosticBooking.findMany({
      where,
      include: {
        provider: {
          select: { name: true, slug: true, phone: true },
        },
        test: {
          select: { name: true, slug: true },
        },
        package: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: bookingId ? 1 : 10,
    });

    if (bookingId && bookings.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const formattedBookings = bookings.map((b) => ({
      id: b.id,
      status: b.status,
      paymentStatus: b.paymentStatus,
      price: b.price,
      currency: b.currency,
      collectionType: b.collectionType,
      collectionSlot: b.collectionSlot,
      createdAt: b.createdAt,
      provider: b.provider,
      test: b.test,
      package: b.package,
    }));

    return NextResponse.json({
      success: true,
      bookings: bookingId ? formattedBookings[0] : formattedBookings,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
