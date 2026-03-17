/**
 * Google Places API (New) Integration
 *
 * Fetches real hospitals, clinics, and diagnostic labs from Google Places API (New)
 * Uses the new Places API endpoint: https://places.googleapis.com/v1/places:searchText
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
    return searchPlacesNew(`hospitals in ${city}, ${country}`, 'hospital', pageToken);
}

/**
 * Search for diagnostic labs/centers in a specific location
 */
export async function searchDiagnosticLabs(
    city: string,
    country: string,
    pageToken?: string
): Promise<PlacesSearchResult> {
    return searchPlacesNew(`diagnostic labs in ${city}, ${country}`, 'medical_lab', pageToken);
}

/**
 * Search for clinics in a specific location
 */
export async function searchClinics(
    city: string,
    country: string,
    pageToken?: string
): Promise<PlacesSearchResult> {
    return searchPlacesNew(`medical clinics in ${city}, ${country}`, 'doctor', pageToken);
}

/**
 * Search using the new Places API (v1)
 */
async function searchPlacesNew(
    textQuery: string,
    includedType: string,
    pageToken?: string
): Promise<PlacesSearchResult> {
    try {
        const fieldMask = [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.nationalPhoneNumber',
            'places.websiteUri',
            'places.photos',
            'places.types',
            'places.currentOpeningHours',
        ].join(',');

        const requestBody: any = {
            textQuery,
            maxResultCount: 20,
            languageCode: 'en',
        };

        // Add type filter if specified
        if (includedType && includedType !== 'health') {
            requestBody.includedType = includedType;
        }

        if (pageToken) {
            requestBody.pageToken = pageToken;
        }

        const response = await fetch(
            'https://places.googleapis.com/v1/places:searchText',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': fieldMask,
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Google Places API (New) error:', response.status, errorData);
            return { places: [], nextPageToken: null };
        }

        const data = await response.json();

        if (!data.places || data.places.length === 0) {
            return { places: [], nextPageToken: null };
        }

        const places: PlaceResult[] = data.places.map((place: any) => {
            // Extract photo URLs from the new format
            const photos = (place.photos || []).slice(0, 5).map((photo: any) => {
                if (!photo.name) return '';
                // New API photo URL format
                return `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_MAPS_API_KEY}`;
            }).filter(Boolean);

            return {
                placeId: place.id || '',
                name: place.displayName?.text || '',
                address: place.formattedAddress || '',
                latitude: place.location?.latitude || 0,
                longitude: place.location?.longitude || 0,
                rating: place.rating || null,
                reviewCount: place.userRatingCount || 0,
                phoneNumber: place.nationalPhoneNumber || null,
                website: place.websiteUri || null,
                photos,
                types: place.types || [],
                openNow: place.currentOpeningHours?.openNow ?? null,
            };
        });

        return {
            places,
            nextPageToken: data.nextPageToken || null,
        };
    } catch (error) {
        console.error('Error searching places (New API):', error);
        return { places: [], nextPageToken: null };
    }
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
