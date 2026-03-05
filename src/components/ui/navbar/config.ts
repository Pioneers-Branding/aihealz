/**
 * Navbar Configuration Constants
 * Centralized configuration for navigation, countries, cities, and languages
 */

// Navigation Links
export const navLinks = [
    { href: '/conditions', label: 'Conditions' },
    { href: '/treatments', label: 'Treatments' },
    { href: '/tests', label: 'Lab Tests' },
    { href: '/hospitals', label: 'Hospitals' },
    { href: '/doctors', label: 'Doctors' },
    { href: '/symptoms', label: 'AI Diagnosis' },
];

// Language configuration
export const LANGUAGE_DISPLAY: Record<string, { name: string; nativeName: string }> = {
    'en': { name: 'English', nativeName: 'EN' },
    'hi': { name: 'Hindi', nativeName: 'हि' },
    'ta': { name: 'Tamil', nativeName: 'த' },
    'te': { name: 'Telugu', nativeName: 'తె' },
    'kn': { name: 'Kannada', nativeName: 'ಕ' },
    'ml': { name: 'Malayalam', nativeName: 'മ' },
    'mr': { name: 'Marathi', nativeName: 'म' },
    'bn': { name: 'Bengali', nativeName: 'ব' },
    'gu': { name: 'Gujarati', nativeName: 'ગુ' },
    'pa': { name: 'Punjabi', nativeName: 'ਪੰ' },
    'ur': { name: 'Urdu', nativeName: 'ار' },
    'ar': { name: 'Arabic', nativeName: 'عر' },
    'es': { name: 'Spanish', nativeName: 'ES' },
    'fr': { name: 'French', nativeName: 'FR' },
    'pt': { name: 'Portuguese', nativeName: 'PT' },
    'de': { name: 'German', nativeName: 'DE' },
};

// Country slug to display name
export const COUNTRY_DISPLAY: Record<string, string> = {
    // Tier 1: Full support
    'india': 'India',
    'usa': 'USA',
    'uk': 'UK',
    'uae': 'UAE',
    'thailand': 'Thailand',
    'mexico': 'Mexico',
    'turkey': 'Turkey',
    // Tier 2: Content support
    'singapore': 'Singapore',
    'australia': 'Australia',
    'canada': 'Canada',
    'germany': 'Germany',
    'france': 'France',
    'brazil': 'Brazil',
    'saudi-arabia': 'Saudi Arabia',
    'egypt': 'Egypt',
    'nigeria': 'Nigeria',
    'south-africa': 'South Africa',
    'kenya': 'Kenya',
    'malaysia': 'Malaysia',
    'spain': 'Spain',
    'japan': 'Japan',
    'south-korea': 'South Korea',
    // Tier 3: Additional countries
    'indonesia': 'Indonesia',
    'philippines': 'Philippines',
    'pakistan': 'Pakistan',
    'bangladesh': 'Bangladesh',
    'vietnam': 'Vietnam',
    'russia': 'Russia',
    'italy': 'Italy',
    'netherlands': 'Netherlands',
    'poland': 'Poland',
    'new-zealand': 'New Zealand',
    'ireland': 'Ireland',
    'israel': 'Israel',
    'sweden': 'Sweden',
    'switzerland': 'Switzerland',
    'austria': 'Austria',
    'belgium': 'Belgium',
    'portugal': 'Portugal',
    'greece': 'Greece',
    'argentina': 'Argentina',
    'colombia': 'Colombia',
    'chile': 'Chile',
    'peru': 'Peru',
    'morocco': 'Morocco',
    'ghana': 'Ghana',
    'tanzania': 'Tanzania',
    'ethiopia': 'Ethiopia',
    'sri-lanka': 'Sri Lanka',
    'nepal': 'Nepal',
    'qatar': 'Qatar',
    'kuwait': 'Kuwait',
    'oman': 'Oman',
    'bahrain': 'Bahrain',
};

// Country to cities mapping - for dropdown filtering
export const COUNTRY_CITIES: Record<string, string[]> = {
    'india': ['delhi', 'new-delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kochi', 'chandigarh'],
    'usa': ['new-york', 'los-angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose', 'austin', 'seattle', 'denver', 'boston', 'miami', 'atlanta'],
    'uk': ['london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'liverpool', 'edinburgh'],
    'australia': ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'],
    'canada': ['toronto', 'vancouver', 'montreal', 'calgary', 'ottawa', 'edmonton'],
    'uae': ['dubai', 'abu-dhabi', 'sharjah'],
    'saudi-arabia': ['riyadh', 'jeddah', 'makkah', 'medina'],
    'egypt': ['cairo', 'alexandria', 'giza'],
    'germany': ['berlin', 'munich', 'frankfurt', 'hamburg', 'cologne'],
    'france': ['paris', 'lyon', 'marseille'],
    'japan': ['tokyo', 'osaka', 'kyoto', 'yokohama'],
    'south-korea': ['seoul', 'busan', 'incheon'],
    'thailand': ['bangkok', 'chiang-mai', 'pattaya', 'phuket'],
    'singapore': ['singapore'],
    'malaysia': ['kuala-lumpur', 'penang', 'johor-bahru'],
    'indonesia': ['jakarta', 'surabaya', 'bandung', 'bali'],
    'philippines': ['manila', 'cebu', 'davao'],
    'pakistan': ['karachi', 'lahore', 'islamabad'],
    'bangladesh': ['dhaka', 'chittagong'],
    'vietnam': ['ho-chi-minh-city', 'hanoi'],
    'turkey': ['istanbul', 'ankara', 'izmir'],
    'mexico': ['mexico-city', 'guadalajara', 'monterrey'],
    'brazil': ['sao-paulo', 'rio-de-janeiro', 'brasilia'],
    'nigeria': ['lagos', 'abuja', 'kano'],
    'south-africa': ['johannesburg', 'cape-town', 'durban'],
    'kenya': ['nairobi', 'mombasa'],
    'qatar': ['doha'],
    'kuwait': ['kuwait-city'],
    'oman': ['muscat'],
    'bahrain': ['manama'],
    'israel': ['tel-aviv', 'jerusalem', 'haifa'],
    'russia': ['moscow', 'saint-petersburg'],
    'italy': ['rome', 'milan'],
    'netherlands': ['amsterdam'],
    'poland': ['warsaw'],
    'ireland': ['dublin'],
    'sweden': ['stockholm'],
    'switzerland': ['zurich', 'geneva'],
    'austria': ['vienna'],
    'belgium': ['brussels'],
    'portugal': ['lisbon'],
    'greece': ['athens'],
    'spain': ['madrid', 'barcelona'],
    'argentina': ['buenos-aires'],
    'colombia': ['bogota'],
    'chile': ['santiago'],
    'peru': ['lima'],
    'new-zealand': ['auckland', 'wellington', 'christchurch'],
    'sri-lanka': ['colombo'],
    'nepal': ['kathmandu'],
};

// City slug to display name
export const CITY_DISPLAY: Record<string, string> = {
    // India
    'delhi': 'Delhi',
    'new-delhi': 'New Delhi',
    'mumbai': 'Mumbai',
    'bangalore': 'Bangalore',
    'bengaluru': 'Bengaluru',
    'chennai': 'Chennai',
    'kolkata': 'Kolkata',
    'hyderabad': 'Hyderabad',
    'pune': 'Pune',
    'ahmedabad': 'Ahmedabad',
    'jaipur': 'Jaipur',
    'lucknow': 'Lucknow',
    'kochi': 'Kochi',
    'chandigarh': 'Chandigarh',
    // USA
    'new-york': 'New York',
    'los-angeles': 'Los Angeles',
    'chicago': 'Chicago',
    'houston': 'Houston',
    'phoenix': 'Phoenix',
    'philadelphia': 'Philadelphia',
    'san-antonio': 'San Antonio',
    'san-diego': 'San Diego',
    'dallas': 'Dallas',
    'san-jose': 'San Jose',
    'austin': 'Austin',
    'seattle': 'Seattle',
    'denver': 'Denver',
    'boston': 'Boston',
    'miami': 'Miami',
    'atlanta': 'Atlanta',
    // UK
    'london': 'London',
    'manchester': 'Manchester',
    'birmingham': 'Birmingham',
    'leeds': 'Leeds',
    'glasgow': 'Glasgow',
    'liverpool': 'Liverpool',
    'edinburgh': 'Edinburgh',
    // Australia
    'sydney': 'Sydney',
    'melbourne': 'Melbourne',
    'brisbane': 'Brisbane',
    'perth': 'Perth',
    'adelaide': 'Adelaide',
    // Canada
    'toronto': 'Toronto',
    'vancouver': 'Vancouver',
    'montreal': 'Montreal',
    'calgary': 'Calgary',
    'ottawa': 'Ottawa',
    'edmonton': 'Edmonton',
    // UAE
    'dubai': 'Dubai',
    'abu-dhabi': 'Abu Dhabi',
    'sharjah': 'Sharjah',
    // Saudi Arabia
    'riyadh': 'Riyadh',
    'jeddah': 'Jeddah',
    'makkah': 'Makkah',
    'medina': 'Medina',
    // Egypt
    'cairo': 'Cairo',
    'alexandria': 'Alexandria',
    'giza': 'Giza',
    // Germany
    'berlin': 'Berlin',
    'munich': 'Munich',
    'frankfurt': 'Frankfurt',
    'hamburg': 'Hamburg',
    'cologne': 'Cologne',
    // France
    'paris': 'Paris',
    'lyon': 'Lyon',
    'marseille': 'Marseille',
    // Japan
    'tokyo': 'Tokyo',
    'osaka': 'Osaka',
    'kyoto': 'Kyoto',
    'yokohama': 'Yokohama',
    // South Korea
    'seoul': 'Seoul',
    'busan': 'Busan',
    'incheon': 'Incheon',
    // Thailand
    'bangkok': 'Bangkok',
    'chiang-mai': 'Chiang Mai',
    'pattaya': 'Pattaya',
    'phuket': 'Phuket',
    // Singapore
    'singapore': 'Singapore',
    // Malaysia
    'kuala-lumpur': 'Kuala Lumpur',
    'penang': 'Penang',
    'johor-bahru': 'Johor Bahru',
    // Indonesia
    'jakarta': 'Jakarta',
    'surabaya': 'Surabaya',
    'bandung': 'Bandung',
    'bali': 'Bali',
    // Philippines
    'manila': 'Manila',
    'cebu': 'Cebu',
    'davao': 'Davao',
    // Pakistan
    'karachi': 'Karachi',
    'lahore': 'Lahore',
    'islamabad': 'Islamabad',
    // Bangladesh
    'dhaka': 'Dhaka',
    'chittagong': 'Chittagong',
    // Vietnam
    'ho-chi-minh-city': 'Ho Chi Minh City',
    'hanoi': 'Hanoi',
    // Turkey
    'istanbul': 'Istanbul',
    'ankara': 'Ankara',
    'izmir': 'Izmir',
    // Mexico
    'mexico-city': 'Mexico City',
    'guadalajara': 'Guadalajara',
    'monterrey': 'Monterrey',
    // Brazil
    'sao-paulo': 'Sao Paulo',
    'rio-de-janeiro': 'Rio de Janeiro',
    'brasilia': 'Brasilia',
    // Nigeria
    'lagos': 'Lagos',
    'abuja': 'Abuja',
    'kano': 'Kano',
    // South Africa
    'johannesburg': 'Johannesburg',
    'cape-town': 'Cape Town',
    'durban': 'Durban',
    // Kenya
    'nairobi': 'Nairobi',
    'mombasa': 'Mombasa',
    // Gulf Countries
    'doha': 'Doha',
    'kuwait-city': 'Kuwait City',
    'muscat': 'Muscat',
    'manama': 'Manama',
    // Israel
    'tel-aviv': 'Tel Aviv',
    'jerusalem': 'Jerusalem',
    'haifa': 'Haifa',
    // Russia
    'moscow': 'Moscow',
    'saint-petersburg': 'Saint Petersburg',
    // Europe
    'rome': 'Rome',
    'milan': 'Milan',
    'amsterdam': 'Amsterdam',
    'warsaw': 'Warsaw',
    'dublin': 'Dublin',
    'stockholm': 'Stockholm',
    'zurich': 'Zurich',
    'geneva': 'Geneva',
    'vienna': 'Vienna',
    'brussels': 'Brussels',
    'lisbon': 'Lisbon',
    'athens': 'Athens',
    'madrid': 'Madrid',
    'barcelona': 'Barcelona',
    // Latin America
    'buenos-aires': 'Buenos Aires',
    'bogota': 'Bogota',
    'santiago': 'Santiago',
    'lima': 'Lima',
    // New Zealand
    'auckland': 'Auckland',
    'wellington': 'Wellington',
    'christchurch': 'Christchurch',
};

// Timezone to region mapping
export const TIMEZONE_REGION_MAP: Record<string, { country: string; city: string | null }> = {
    // India
    'Asia/Kolkata': { country: 'India', city: null },
    'Asia/Calcutta': { country: 'India', city: null },
    // USA
    'America/New_York': { country: 'USA', city: 'New York' },
    'America/Los_Angeles': { country: 'USA', city: 'Los Angeles' },
    'America/Chicago': { country: 'USA', city: 'Chicago' },
    'America/Denver': { country: 'USA', city: null },
    'America/Phoenix': { country: 'USA', city: null },
    'America/Detroit': { country: 'USA', city: null },
    'America/Boise': { country: 'USA', city: null },
    'America/Indiana/Indianapolis': { country: 'USA', city: null },
    'Pacific/Honolulu': { country: 'USA', city: null },
    'America/Anchorage': { country: 'USA', city: null },
    // UK
    'Europe/London': { country: 'UK', city: 'London' },
    // Germany
    'Europe/Berlin': { country: 'Germany', city: 'Berlin' },
    // France
    'Europe/Paris': { country: 'France', city: 'Paris' },
    // Spain
    'Europe/Madrid': { country: 'Spain', city: 'Madrid' },
    // Australia
    'Australia/Sydney': { country: 'Australia', city: 'Sydney' },
    'Australia/Melbourne': { country: 'Australia', city: 'Melbourne' },
    'Australia/Brisbane': { country: 'Australia', city: 'Brisbane' },
    'Australia/Perth': { country: 'Australia', city: 'Perth' },
    'Australia/Adelaide': { country: 'Australia', city: 'Adelaide' },
    // Canada
    'America/Toronto': { country: 'Canada', city: 'Toronto' },
    'America/Vancouver': { country: 'Canada', city: 'Vancouver' },
    'America/Edmonton': { country: 'Canada', city: null },
    'America/Winnipeg': { country: 'Canada', city: null },
    'America/Montreal': { country: 'Canada', city: 'Montreal' },
    // Mexico
    'America/Mexico_City': { country: 'Mexico', city: 'Mexico City' },
    'America/Tijuana': { country: 'Mexico', city: null },
    'America/Monterrey': { country: 'Mexico', city: null },
    // Brazil
    'America/Sao_Paulo': { country: 'Brazil', city: 'Sao Paulo' },
    'America/Rio_Branco': { country: 'Brazil', city: null },
    'America/Recife': { country: 'Brazil', city: null },
    // Africa
    'Africa/Lagos': { country: 'Nigeria', city: 'Lagos' },
    'Africa/Nairobi': { country: 'Kenya', city: 'Nairobi' },
    'Africa/Johannesburg': { country: 'South Africa', city: 'Johannesburg' },
    'Africa/Cairo': { country: 'Egypt', city: 'Cairo' },
    'Africa/Casablanca': { country: 'Morocco', city: 'Casablanca' },
    'Africa/Accra': { country: 'Ghana', city: 'Accra' },
    'Africa/Dar_es_Salaam': { country: 'Tanzania', city: 'Dar es Salaam' },
    'Africa/Addis_Ababa': { country: 'Ethiopia', city: 'Addis Ababa' },
    // Middle East
    'Asia/Dubai': { country: 'UAE', city: 'Dubai' },
    'Asia/Riyadh': { country: 'Saudi Arabia', city: 'Riyadh' },
    'Asia/Qatar': { country: 'Qatar', city: 'Doha' },
    'Asia/Kuwait': { country: 'Kuwait', city: 'Kuwait City' },
    'Asia/Muscat': { country: 'Oman', city: 'Muscat' },
    'Asia/Bahrain': { country: 'Bahrain', city: 'Manama' },
    'Asia/Jerusalem': { country: 'Israel', city: 'Tel Aviv' },
    'Europe/Istanbul': { country: 'Turkey', city: 'Istanbul' },
    // East Asia
    'Asia/Tokyo': { country: 'Japan', city: 'Tokyo' },
    'Asia/Seoul': { country: 'South Korea', city: 'Seoul' },
    // Southeast Asia
    'Asia/Bangkok': { country: 'Thailand', city: 'Bangkok' },
    'Asia/Singapore': { country: 'Singapore', city: null },
    'Asia/Kuala_Lumpur': { country: 'Malaysia', city: 'Kuala Lumpur' },
    'Asia/Jakarta': { country: 'Indonesia', city: 'Jakarta' },
    'Asia/Manila': { country: 'Philippines', city: 'Manila' },
    'Asia/Ho_Chi_Minh': { country: 'Vietnam', city: 'Ho Chi Minh City' },
    'Asia/Saigon': { country: 'Vietnam', city: 'Ho Chi Minh City' },
    // South Asia
    'Asia/Karachi': { country: 'Pakistan', city: 'Karachi' },
    'Asia/Dhaka': { country: 'Bangladesh', city: 'Dhaka' },
    'Asia/Colombo': { country: 'Sri Lanka', city: 'Colombo' },
    'Asia/Kathmandu': { country: 'Nepal', city: 'Kathmandu' },
    // Europe
    'Europe/Rome': { country: 'Italy', city: 'Rome' },
    'Europe/Amsterdam': { country: 'Netherlands', city: 'Amsterdam' },
    'Europe/Warsaw': { country: 'Poland', city: 'Warsaw' },
    'Europe/Dublin': { country: 'Ireland', city: 'Dublin' },
    'Europe/Stockholm': { country: 'Sweden', city: 'Stockholm' },
    'Europe/Zurich': { country: 'Switzerland', city: 'Zurich' },
    'Europe/Vienna': { country: 'Austria', city: 'Vienna' },
    'Europe/Brussels': { country: 'Belgium', city: 'Brussels' },
    'Europe/Lisbon': { country: 'Portugal', city: 'Lisbon' },
    'Europe/Athens': { country: 'Greece', city: 'Athens' },
    'Europe/Moscow': { country: 'Russia', city: 'Moscow' },
    // Latin America
    'America/Buenos_Aires': { country: 'Argentina', city: 'Buenos Aires' },
    'America/Bogota': { country: 'Colombia', city: 'Bogota' },
    'America/Santiago': { country: 'Chile', city: 'Santiago' },
    'America/Lima': { country: 'Peru', city: 'Lima' },
    // Oceania
    'Pacific/Auckland': { country: 'New Zealand', city: 'Auckland' },
    'Pacific/Wellington': { country: 'New Zealand', city: 'Wellington' },
};

// Types
export interface NavbarProps {
    initialGeo?: {
        countrySlug: string | null;
        citySlug: string | null;
        countryCode: string | null;
        lang: string;
    };
}

export interface Region {
    country: string;
    city: string | null;
}
