import { NextRequest, NextResponse } from 'next/server';
import { getGeoFromIP, getCountrySlug, getCitySlug } from '@/lib/ip-geolocation';

/**
 * GET /api/geo/detect
 *
 * Detects user's location from their IP address.
 * Used as fallback when Cloudflare/Vercel headers aren't available.
 */
export async function GET(request: NextRequest) {
    try {
        // Get client IP from various headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const cfConnectingIP = request.headers.get('cf-connecting-ip');

        // Use first IP from x-forwarded-for chain, or fall back to other headers
        const ip = cfConnectingIP
            || (forwardedFor ? forwardedFor.split(',')[0].trim() : null)
            || realIP
            || '127.0.0.1';

        // Get geo data from IP
        const geo = await getGeoFromIP(ip);

        if (!geo.countryCode) {
            return NextResponse.json({
                success: false,
                error: 'Could not determine location',
                ip: ip,
            });
        }

        const countrySlug = getCountrySlug(geo.countryCode);
        const citySlug = getCitySlug(geo.city);

        return NextResponse.json({
            success: true,
            ip: ip,
            countryCode: geo.countryCode,
            countryName: geo.countryName,
            countrySlug: countrySlug,
            city: geo.city,
            citySlug: citySlug,
            region: geo.region,
            timezone: geo.timezone,
        });
    } catch (error) {
        console.error('Geo detection API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Geo detection failed',
        }, { status: 500 });
    }
}
