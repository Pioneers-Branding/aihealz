/**
 * Google Places API Integration
 *
 * Fetches real hospitals, clinics, and diagnostic labs from Google Places
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

interface PlaceResult {
    placeId: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number | null;
    reviewCount: number;
    phoneNumber: string | null;
    website: string | null;
    photos: string[];
    types: string[];
    openNow: boolean | null;
}

interface PlacesSearchResult {
    places: PlaceResult[];
    nextPageToken: string | null;
}

/**
 * Search for hospitals in a specific location
 */
export async function searchHospitals(
    city: string,
    country: string,
    pageToken?: string
): Promise<PlacesSearchResult> {
    return searchPlaces(`hospitals in ${city}, ${country}`, 'hospital', pageToken);
}

/**
 * Search for diagnostic labs/centers in a specific location
 */
export async function searchDiagnosticLabs(
    city: string,
    country: string,
    pageToken?: string
): Promise<PlacesSearchResult> {
    return searchPlaces(`diagnostic center OR pathology lab in ${city}, ${country}`, 'health', pageToken);
}

/**
 * Search for clinics in a specific location
 */
export async function searchClinics(
    city: string,
    country: string,
    pageToken?: string
): Promise<PlacesSearchResult> {
    return searchPlaces(`medical clinic OR doctor clinic in ${city}, ${country}`, 'doctor', pageToken);
}

/**
 * Generic place search
 */
async function searchPlaces(
    query: string,
    type: string,
    pageToken?: string
): Promise<PlacesSearchResult> {
    try {
        const params = new URLSearchParams({
            query,
            type,
            key: GOOGLE_MAPS_API_KEY,
        });

        if (pageToken) {
            params.append('pagetoken', pageToken);
        }

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
        );

        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Google Places API error:', data.status, data.error_message);
            return { places: [], nextPageToken: null };
        }

        const places: PlaceResult[] = await Promise.all(
            (data.results || []).map(async (place: any) => {
                // Get additional details for each place
                const details = await getPlaceDetails(place.place_id);

                return {
                    placeId: place.place_id,
                    name: place.name,
                    address: place.formatted_address,
                    latitude: place.geometry?.location?.lat || 0,
                    longitude: place.geometry?.location?.lng || 0,
                    rating: place.rating || null,
                    reviewCount: place.user_ratings_total || 0,
                    phoneNumber: details?.phoneNumber || null,
                    website: details?.website || null,
                    photos: getPhotoUrls(place.photos || []),
                    types: place.types || [],
                    openNow: place.opening_hours?.open_now ?? null,
                };
            })
        );

        return {
            places,
            nextPageToken: data.next_page_token || null,
        };
    } catch (error) {
        console.error('Error searching places:', error);
        return { places: [], nextPageToken: null };
    }
}

/**
 * Get detailed information about a place
 */
async function getPlaceDetails(placeId: string): Promise<{
    phoneNumber: string | null;
    website: string | null;
} | null> {
    try {
        const params = new URLSearchParams({
            place_id: placeId,
            fields: 'formatted_phone_number,website',
            key: GOOGLE_MAPS_API_KEY,
        });

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?${params}`
        );

        if (!response.ok) return null;

        const data = await response.json();

        return {
            phoneNumber: data.result?.formatted_phone_number || null,
            website: data.result?.website || null,
        };
    } catch {
        return null;
    }
}

/**
 * Convert photo references to URLs
 */
function getPhotoUrls(photos: any[], maxPhotos: number = 5): string[] {
    return photos.slice(0, maxPhotos).map((photo: any) => {
        if (!photo.photo_reference) return '';
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
    }).filter(Boolean);
}

/**
 * Generate a URL-friendly slug from a name
 */
export function generateSlug(name: string, city: string): string {
    const combined = `${name}-${city}`;
    return combined
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}
