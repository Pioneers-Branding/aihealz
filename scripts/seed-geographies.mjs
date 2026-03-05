/**
 * Global Geography Seed Script
 * Inserts countries, states/provinces, and major cities into the geographies table.
 * Run: node scripts/seed-geographies.mjs
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: 'postgresql://taps@localhost:5432/aihealz?schema=public' });

// ─── Helper ────────────────────────────────────────────────
async function upsertGeo(name, slug, level, parentId = null, isoCode = null, langs = ['en']) {
    const existing = await pool.query(
        `SELECT id FROM geographies WHERE slug = $1 AND level = $2::\"GeoLevel\" AND (parent_id = $3 OR ($3 IS NULL AND parent_id IS NULL)) LIMIT 1`,
        [slug, level, parentId]
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const res = await pool.query(
        `INSERT INTO geographies (name, slug, level, parent_id, iso_code, supported_languages, is_active, locale_config, created_at)
         VALUES ($1, $2, $3::\"GeoLevel\", $4, $5, $6, true, '{}', NOW())
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [name, slug, level, parentId, isoCode, langs]
    );
    return res.rows[0]?.id;
}

async function seedCountry(name, slug, iso, langs = ['en']) {
    return upsertGeo(name, slug, 'country', null, iso, langs);
}

async function seedState(name, slug, countryId, langs = ['en']) {
    return upsertGeo(name, slug, 'state', countryId, null, langs);
}

async function seedCity(name, slug, stateId, langs = ['en']) {
    return upsertGeo(name, slug, 'city', stateId, null, langs);
}

// ─── Data ──────────────────────────────────────────────────
const WORLD = [
    {
        country: ['India', 'in', 'IN', ['en', 'hi']],
        states: [
            { name: 'Maharashtra', slug: 'maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Navi Mumbai'] },
            { name: 'Delhi', slug: 'delhi', cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'] },
            { name: 'Karnataka', slug: 'karnataka', cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'] },
            { name: 'Tamil Nadu', slug: 'tamil-nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Vellore'] },
            { name: 'Telangana', slug: 'telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
            { name: 'West Bengal', slug: 'west-bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'] },
            { name: 'Gujarat', slug: 'gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
            { name: 'Rajasthan', slug: 'rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
            { name: 'Uttar Pradesh', slug: 'uttar-pradesh', cities: ['Lucknow', 'Noida', 'Agra', 'Varanasi', 'Kanpur', 'Ghaziabad', 'Meerut'] },
            { name: 'Madhya Pradesh', slug: 'madhya-pradesh', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'] },
            { name: 'Kerala', slug: 'kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'] },
            { name: 'Punjab', slug: 'punjab-in', cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'] },
            { name: 'Haryana', slug: 'haryana', cities: ['Gurgaon', 'Faridabad', 'Panipat', 'Karnal'] },
            { name: 'Bihar', slug: 'bihar', cities: ['Patna', 'Gaya', 'Muzaffarpur'] },
            { name: 'Odisha', slug: 'odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela'] },
            { name: 'Andhra Pradesh', slug: 'andhra-pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur'] },
            { name: 'Assam', slug: 'assam', cities: ['Guwahati', 'Dibrugarh'] },
            { name: 'Jharkhand', slug: 'jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad'] },
            { name: 'Chhattisgarh', slug: 'chhattisgarh', cities: ['Raipur', 'Bilaspur'] },
            { name: 'Uttarakhand', slug: 'uttarakhand', cities: ['Dehradun', 'Haridwar', 'Rishikesh'] },
            { name: 'Goa', slug: 'goa', cities: ['Panaji', 'Margao'] },
        ]
    },
    {
        country: ['United States', 'us', 'US', ['en']],
        states: [
            { name: 'California', slug: 'california', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'] },
            { name: 'New York', slug: 'new-york', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany'] },
            { name: 'Texas', slug: 'texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'] },
            { name: 'Florida', slug: 'florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
            { name: 'Illinois', slug: 'illinois', cities: ['Chicago', 'Springfield', 'Naperville'] },
            { name: 'Pennsylvania', slug: 'pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown'] },
            { name: 'Ohio', slug: 'ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati'] },
            { name: 'Georgia', slug: 'georgia-us', cities: ['Atlanta', 'Savannah', 'Augusta'] },
            { name: 'Massachusetts', slug: 'massachusetts', cities: ['Boston', 'Cambridge', 'Worcester'] },
            { name: 'Michigan', slug: 'michigan', cities: ['Detroit', 'Grand Rapids', 'Ann Arbor'] },
            { name: 'Arizona', slug: 'arizona', cities: ['Phoenix', 'Tucson', 'Scottsdale'] },
            { name: 'Washington', slug: 'washington', cities: ['Seattle', 'Tacoma', 'Spokane'] },
            { name: 'Colorado', slug: 'colorado', cities: ['Denver', 'Colorado Springs', 'Boulder'] },
            { name: 'Minnesota', slug: 'minnesota', cities: ['Minneapolis', 'Saint Paul', 'Rochester MN'] },
            { name: 'Maryland', slug: 'maryland', cities: ['Baltimore', 'Bethesda'] },
        ]
    },
    {
        country: ['United Kingdom', 'gb', 'GB', ['en']],
        states: [
            { name: 'England', slug: 'england', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Bristol', 'Sheffield', 'Oxford', 'Cambridge'] },
            { name: 'Scotland', slug: 'scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen'] },
            { name: 'Wales', slug: 'wales', cities: ['Cardiff', 'Swansea'] },
            { name: 'Northern Ireland', slug: 'northern-ireland', cities: ['Belfast'] },
        ]
    },
    {
        country: ['United Arab Emirates', 'ae', 'AE', ['en', 'ar']],
        states: [
            { name: 'Dubai', slug: 'dubai', cities: ['Dubai City', 'Dubai Marina', 'Deira'] },
            { name: 'Abu Dhabi', slug: 'abu-dhabi', cities: ['Abu Dhabi City', 'Al Ain'] },
            { name: 'Sharjah', slug: 'sharjah', cities: ['Sharjah City'] },
        ]
    },
    {
        country: ['Singapore', 'sg', 'SG', ['en', 'zh']],
        states: [
            { name: 'Singapore', slug: 'singapore-central', cities: ['Singapore CBD', 'Orchard', 'Novena'] },
        ]
    },
    {
        country: ['Germany', 'de', 'DE', ['de', 'en']],
        states: [
            { name: 'Bavaria', slug: 'bavaria', cities: ['Munich', 'Nuremberg', 'Augsburg'] },
            { name: 'Berlin', slug: 'berlin', cities: ['Berlin City'] },
            { name: 'North Rhine-Westphalia', slug: 'north-rhine-westphalia', cities: ['Cologne', 'Dusseldorf', 'Dortmund', 'Essen'] },
            { name: 'Hamburg', slug: 'hamburg', cities: ['Hamburg City'] },
            { name: 'Hesse', slug: 'hesse', cities: ['Frankfurt', 'Wiesbaden'] },
            { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg', cities: ['Stuttgart', 'Heidelberg', 'Freiburg'] },
        ]
    },
    {
        country: ['Canada', 'ca', 'CA', ['en', 'fr']],
        states: [
            { name: 'Ontario', slug: 'ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'] },
            { name: 'British Columbia', slug: 'british-columbia', cities: ['Vancouver', 'Victoria', 'Surrey'] },
            { name: 'Quebec', slug: 'quebec', cities: ['Montreal', 'Quebec City', 'Laval'] },
            { name: 'Alberta', slug: 'alberta', cities: ['Calgary', 'Edmonton'] },
        ]
    },
    {
        country: ['Australia', 'au', 'AU', ['en']],
        states: [
            { name: 'New South Wales', slug: 'new-south-wales', cities: ['Sydney', 'Newcastle', 'Wollongong'] },
            { name: 'Victoria', slug: 'victoria', cities: ['Melbourne', 'Geelong'] },
            { name: 'Queensland', slug: 'queensland', cities: ['Brisbane', 'Gold Coast', 'Cairns'] },
            { name: 'Western Australia', slug: 'western-australia', cities: ['Perth', 'Fremantle'] },
            { name: 'South Australia', slug: 'south-australia', cities: ['Adelaide'] },
        ]
    },
    {
        country: ['Japan', 'jp', 'JP', ['ja', 'en']],
        states: [
            { name: 'Tokyo', slug: 'tokyo', cities: ['Shinjuku', 'Shibuya', 'Chiyoda', 'Minato'] },
            { name: 'Osaka', slug: 'osaka', cities: ['Osaka City', 'Sakai'] },
            { name: 'Kanagawa', slug: 'kanagawa', cities: ['Yokohama', 'Kawasaki'] },
            { name: 'Aichi', slug: 'aichi', cities: ['Nagoya'] },
            { name: 'Kyoto', slug: 'kyoto', cities: ['Kyoto City'] },
        ]
    },
    {
        country: ['South Korea', 'kr', 'KR', ['ko', 'en']],
        states: [
            { name: 'Seoul', slug: 'seoul', cities: ['Gangnam', 'Jongno', 'Mapo'] },
            { name: 'Busan', slug: 'busan', cities: ['Busan City'] },
            { name: 'Gyeonggi', slug: 'gyeonggi', cities: ['Suwon', 'Incheon', 'Seongnam'] },
        ]
    },
    {
        country: ['Thailand', 'th', 'TH', ['th', 'en']],
        states: [
            { name: 'Bangkok', slug: 'bangkok', cities: ['Bangkok City', 'Sukhumvit', 'Silom'] },
            { name: 'Chiang Mai', slug: 'chiang-mai', cities: ['Chiang Mai City'] },
            { name: 'Phuket', slug: 'phuket', cities: ['Phuket Town'] },
        ]
    },
    {
        country: ['Malaysia', 'my', 'MY', ['ms', 'en']],
        states: [
            { name: 'Kuala Lumpur', slug: 'kuala-lumpur', cities: ['KL City Centre', 'Bukit Bintang'] },
            { name: 'Penang', slug: 'penang', cities: ['George Town'] },
            { name: 'Selangor', slug: 'selangor', cities: ['Petaling Jaya', 'Shah Alam'] },
        ]
    },
    {
        country: ['France', 'fr', 'FR', ['fr', 'en']],
        states: [
            { name: 'Île-de-France', slug: 'ile-de-france', cities: ['Paris', 'Versailles', 'Boulogne-Billancourt'] },
            { name: 'Provence-Alpes-Côte d\'Azur', slug: 'provence', cities: ['Marseille', 'Nice', 'Toulon'] },
            { name: 'Auvergne-Rhône-Alpes', slug: 'auvergne-rhone-alpes', cities: ['Lyon', 'Grenoble'] },
        ]
    },
    {
        country: ['Brazil', 'br', 'BR', ['pt', 'en']],
        states: [
            { name: 'São Paulo', slug: 'sao-paulo-state', cities: ['São Paulo', 'Campinas', 'Santos'] },
            { name: 'Rio de Janeiro', slug: 'rio-de-janeiro-state', cities: ['Rio de Janeiro', 'Niterói'] },
            { name: 'Minas Gerais', slug: 'minas-gerais', cities: ['Belo Horizonte', 'Uberlândia'] },
        ]
    },
    {
        country: ['Mexico', 'mx', 'MX', ['es', 'en']],
        states: [
            { name: 'Mexico City', slug: 'cdmx', cities: ['Mexico City', 'Polanco', 'Roma Norte'] },
            { name: 'Jalisco', slug: 'jalisco', cities: ['Guadalajara', 'Puerto Vallarta'] },
            { name: 'Nuevo León', slug: 'nuevo-leon', cities: ['Monterrey'] },
        ]
    },
    {
        country: ['Saudi Arabia', 'sa', 'SA', ['ar', 'en']],
        states: [
            { name: 'Riyadh Region', slug: 'riyadh-region', cities: ['Riyadh'] },
            { name: 'Makkah Region', slug: 'makkah-region', cities: ['Jeddah', 'Mecca'] },
            { name: 'Eastern Province', slug: 'eastern-province', cities: ['Dammam', 'Dhahran'] },
        ]
    },
    {
        country: ['South Africa', 'za', 'ZA', ['en', 'af']],
        states: [
            { name: 'Gauteng', slug: 'gauteng', cities: ['Johannesburg', 'Pretoria', 'Sandton'] },
            { name: 'Western Cape', slug: 'western-cape', cities: ['Cape Town', 'Stellenbosch'] },
            { name: 'KwaZulu-Natal', slug: 'kwazulu-natal', cities: ['Durban', 'Pietermaritzburg'] },
        ]
    },
    {
        country: ['Nigeria', 'ng', 'NG', ['en']],
        states: [
            { name: 'Lagos State', slug: 'lagos-state', cities: ['Lagos', 'Ikeja', 'Victoria Island'] },
            { name: 'Abuja FCT', slug: 'abuja-fct', cities: ['Abuja'] },
            { name: 'Rivers State', slug: 'rivers-state', cities: ['Port Harcourt'] },
        ]
    },
    {
        country: ['Kenya', 'ke', 'KE', ['en', 'sw']],
        states: [
            { name: 'Nairobi County', slug: 'nairobi-county', cities: ['Nairobi'] },
            { name: 'Mombasa County', slug: 'mombasa-county', cities: ['Mombasa'] },
        ]
    },
    {
        country: ['Philippines', 'ph', 'PH', ['en', 'fil']],
        states: [
            { name: 'Metro Manila', slug: 'metro-manila', cities: ['Manila', 'Makati', 'Quezon City', 'Taguig'] },
            { name: 'Cebu', slug: 'cebu', cities: ['Cebu City'] },
        ]
    },
    {
        country: ['Turkey', 'tr', 'TR', ['tr', 'en']],
        states: [
            { name: 'Istanbul Province', slug: 'istanbul-province', cities: ['Istanbul', 'Kadikoy', 'Besiktas'] },
            { name: 'Ankara Province', slug: 'ankara-province', cities: ['Ankara'] },
            { name: 'Izmir Province', slug: 'izmir-province', cities: ['Izmir'] },
        ]
    },
    {
        country: ['Italy', 'it', 'IT', ['it', 'en']],
        states: [
            { name: 'Lazio', slug: 'lazio', cities: ['Rome'] },
            { name: 'Lombardy', slug: 'lombardy', cities: ['Milan', 'Bergamo'] },
            { name: 'Campania', slug: 'campania', cities: ['Naples'] },
            { name: 'Tuscany', slug: 'tuscany', cities: ['Florence', 'Pisa'] },
        ]
    },
    {
        country: ['Spain', 'es', 'ES', ['es', 'en']],
        states: [
            { name: 'Community of Madrid', slug: 'community-of-madrid', cities: ['Madrid'] },
            { name: 'Catalonia', slug: 'catalonia', cities: ['Barcelona'] },
            { name: 'Andalusia', slug: 'andalusia', cities: ['Seville', 'Malaga'] },
        ]
    },
    {
        country: ['China', 'cn', 'CN', ['zh', 'en']],
        states: [
            { name: 'Beijing', slug: 'beijing', cities: ['Beijing City'] },
            { name: 'Shanghai', slug: 'shanghai', cities: ['Shanghai City'] },
            { name: 'Guangdong', slug: 'guangdong', cities: ['Guangzhou', 'Shenzhen', 'Dongguan'] },
            { name: 'Zhejiang', slug: 'zhejiang', cities: ['Hangzhou', 'Ningbo'] },
        ]
    },
    {
        country: ['Indonesia', 'id', 'ID', ['id', 'en']],
        states: [
            { name: 'Jakarta', slug: 'jakarta', cities: ['Jakarta City', 'South Jakarta'] },
            { name: 'Bali', slug: 'bali', cities: ['Denpasar', 'Ubud'] },
            { name: 'East Java', slug: 'east-java', cities: ['Surabaya'] },
        ]
    },
    {
        country: ['Egypt', 'eg', 'EG', ['ar', 'en']],
        states: [
            { name: 'Cairo Governorate', slug: 'cairo-governorate', cities: ['Cairo', 'Heliopolis'] },
            { name: 'Alexandria Governorate', slug: 'alexandria-governorate', cities: ['Alexandria'] },
        ]
    },
    {
        country: ['Israel', 'il', 'IL', ['he', 'en']],
        states: [
            { name: 'Tel Aviv District', slug: 'tel-aviv-district', cities: ['Tel Aviv', 'Ramat Gan'] },
            { name: 'Jerusalem District', slug: 'jerusalem-district', cities: ['Jerusalem'] },
            { name: 'Haifa District', slug: 'haifa-district', cities: ['Haifa'] },
        ]
    },
    {
        country: ['Switzerland', 'ch', 'CH', ['de', 'fr', 'en']],
        states: [
            { name: 'Zurich Canton', slug: 'zurich', cities: ['Zurich City'] },
            { name: 'Geneva Canton', slug: 'geneva', cities: ['Geneva City'] },
            { name: 'Bern Canton', slug: 'bern', cities: ['Bern City', 'Basel'] },
        ]
    },
    {
        country: ['Poland', 'pl', 'PL', ['pl', 'en']],
        states: [
            { name: 'Masovia', slug: 'masovia', cities: ['Warsaw'] },
            { name: 'Lesser Poland', slug: 'lesser-poland', cities: ['Krakow'] },
        ]
    },
    {
        country: ['Netherlands', 'nl', 'NL', ['nl', 'en']],
        states: [
            { name: 'North Holland', slug: 'north-holland', cities: ['Amsterdam'] },
            { name: 'South Holland', slug: 'south-holland', cities: ['Rotterdam', 'The Hague'] },
        ]
    },
    {
        country: ['Sweden', 'se', 'SE', ['sv', 'en']],
        states: [
            { name: 'Stockholm County', slug: 'stockholm-county', cities: ['Stockholm'] },
            { name: 'Västra Götaland', slug: 'vastra-gotaland', cities: ['Gothenburg'] },
        ]
    },
    // Smaller but medically relevant
    { country: ['Bangladesh', 'bd', 'BD', ['bn', 'en']], states: [{ name: 'Dhaka Division', slug: 'dhaka-division', cities: ['Dhaka', 'Gazipur'] }, { name: 'Chittagong Division', slug: 'chittagong-division', cities: ['Chittagong'] }] },
    { country: ['Sri Lanka', 'lk', 'LK', ['si', 'en']], states: [{ name: 'Western Province', slug: 'western-province-lk', cities: ['Colombo', 'Kandy'] }] },
    { country: ['Nepal', 'np', 'NP', ['ne', 'en']], states: [{ name: 'Bagmati Province', slug: 'bagmati', cities: ['Kathmandu'] }] },
    { country: ['Pakistan', 'pk', 'PK', ['ur', 'en']], states: [{ name: 'Punjab', slug: 'punjab-pk', cities: ['Lahore', 'Islamabad', 'Rawalpindi'] }, { name: 'Sindh', slug: 'sindh', cities: ['Karachi', 'Hyderabad PK'] }] },
    { country: ['Vietnam', 'vn', 'VN', ['vi', 'en']], states: [{ name: 'Ho Chi Minh City Province', slug: 'hcmc', cities: ['Ho Chi Minh City'] }, { name: 'Hanoi', slug: 'hanoi', cities: ['Hanoi City'] }] },
    { country: ['New Zealand', 'nz', 'NZ', ['en']], states: [{ name: 'Auckland Region', slug: 'auckland-region', cities: ['Auckland'] }, { name: 'Wellington Region', slug: 'wellington-region', cities: ['Wellington'] }] },
    { country: ['Ireland', 'ie', 'IE', ['en']], states: [{ name: 'Leinster', slug: 'leinster', cities: ['Dublin'] }, { name: 'Munster', slug: 'munster', cities: ['Cork'] }] },
    { country: ['Qatar', 'qa', 'QA', ['ar', 'en']], states: [{ name: 'Doha Municipality', slug: 'doha-municipality', cities: ['Doha'] }] },
    { country: ['Kuwait', 'kw', 'KW', ['ar', 'en']], states: [{ name: 'Capital Governorate', slug: 'capital-kw', cities: ['Kuwait City'] }] },
    { country: ['Bahrain', 'bh', 'BH', ['ar', 'en']], states: [{ name: 'Capital Governorate BH', slug: 'capital-bh', cities: ['Manama'] }] },
    { country: ['Oman', 'om', 'OM', ['ar', 'en']], states: [{ name: 'Muscat Governorate', slug: 'muscat-gov', cities: ['Muscat'] }] },
    { country: ['Russia', 'ru', 'RU', ['ru', 'en']], states: [{ name: 'Moscow Oblast', slug: 'moscow-oblast', cities: ['Moscow'] }, { name: 'Saint Petersburg', slug: 'saint-petersburg', cities: ['Saint Petersburg City'] }] },
    { country: ['Colombia', 'co', 'CO', ['es', 'en']], states: [{ name: 'Bogota DC', slug: 'bogota-dc', cities: ['Bogota'] }, { name: 'Antioquia', slug: 'antioquia', cities: ['Medellin'] }] },
    { country: ['Argentina', 'ar', 'AR', ['es', 'en']], states: [{ name: 'Buenos Aires Province', slug: 'buenos-aires', cities: ['Buenos Aires'] }] },
    { country: ['Chile', 'cl', 'CL', ['es', 'en']], states: [{ name: 'Santiago Metropolitan', slug: 'santiago-metro', cities: ['Santiago'] }] },
    { country: ['Peru', 'pe', 'PE', ['es', 'en']], states: [{ name: 'Lima Province', slug: 'lima-province', cities: ['Lima'] }] },
    { country: ['Ghana', 'gh', 'GH', ['en']], states: [{ name: 'Greater Accra', slug: 'greater-accra', cities: ['Accra'] }] },
    { country: ['Tanzania', 'tz', 'TZ', ['sw', 'en']], states: [{ name: 'Dar es Salaam', slug: 'dar-es-salaam', cities: ['Dar es Salaam City'] }] },
    { country: ['Ethiopia', 'et', 'ET', ['am', 'en']], states: [{ name: 'Addis Ababa Region', slug: 'addis-ababa', cities: ['Addis Ababa'] }] },
];

// ─── Execution ─────────────────────────────────────────────
async function main() {
    let totalCountries = 0, totalStates = 0, totalCities = 0;

    for (const entry of WORLD) {
        const [cName, cSlug, cIso, cLangs] = entry.country;
        const countryId = await seedCountry(cName, cSlug, cIso, cLangs);
        if (!countryId) { console.log(`  ⏭ Country ${cName} already exists, skipping tree`); continue; }
        totalCountries++;
        console.log(`🌍 ${cName} (id: ${countryId})`);

        for (const st of entry.states) {
            const stateId = await seedState(st.name, st.slug, countryId, cLangs);
            if (!stateId) continue;
            totalStates++;
            console.log(`  📍 ${st.name} (id: ${stateId})`);

            for (const cityName of st.cities) {
                const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const cityId = await seedCity(cityName, citySlug, stateId, cLangs);
                if (cityId) totalCities++;
                console.log(`    🏙 ${cityName} (id: ${cityId || 'exists'})`);
            }
        }
    }

    console.log(`\n✅ Seeded: ${totalCountries} countries, ${totalStates} states, ${totalCities} cities`);
    await pool.end();
}

main().catch(e => { console.error('❌ Error:', e.message); pool.end(); process.exit(1); });
