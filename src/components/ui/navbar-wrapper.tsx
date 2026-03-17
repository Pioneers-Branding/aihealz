import { headers } from 'next/headers';
import Navbar from './navbar';

/**
 * Server component wrapper for Navbar
 * Reads geo context from middleware headers and passes to client-side Navbar
 */
export default async function NavbarWrapper() {
    const headersList = await headers();

    const initialGeo = {
        countrySlug: headersList.get('x-aihealz-country') || null,
        citySlug: headersList.get('x-aihealz-city') || null,
        countryCode: headersList.get('x-aihealz-country-code') || null,
        lang: headersList.get('x-aihealz-lang') || 'en',
    };

    return <Navbar initialGeo={initialGeo} />;
}
