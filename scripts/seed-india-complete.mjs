/**
 * Comprehensive India Geography Seed
 * Inserts ALL states/UTs with their tier 2-6 cities and regional languages.
 * Run: node scripts/seed-india-complete.mjs
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: 'postgresql://taps@localhost:5432/aihealz?schema=public' });

async function upsertGeo(name, slug, level, parentId, isoCode, langs) {
    const ex = await pool.query(
        `SELECT id FROM geographies WHERE slug = $1 AND level = $2::"GeoLevel" LIMIT 1`, [slug, level]
    );
    if (ex.rows.length > 0) return ex.rows[0].id;
    const res = await pool.query(
        `INSERT INTO geographies (name, slug, level, parent_id, iso_code, supported_languages, is_active, locale_config, created_at)
         VALUES ($1, $2, $3::"GeoLevel", $4, $5, $6, true, '{}', NOW()) RETURNING id`,
        [name, slug, level, parentId, isoCode, langs]
    );
    return res.rows[0]?.id;
}

// Get existing India country ID
async function getIndiaId() {
    const res = await pool.query(`SELECT id FROM geographies WHERE slug = 'in' AND level = 'country'::"GeoLevel" LIMIT 1`);
    return res.rows[0]?.id;
}

const INDIA_STATES = [
    {
        name: 'Andhra Pradesh', slug: 'andhra-pradesh', langs: ['en', 'te'],
        cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Kakinada', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Srikakulam', 'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadipatri']
    },
    {
        name: 'Arunachal Pradesh', slug: 'arunachal-pradesh', langs: ['en', 'hi'],
        cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur AP']
    },
    {
        name: 'Assam', slug: 'assam', langs: ['en', 'as'],
        cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Goalpara', 'North Lakhimpur', 'Dhubri']
    },
    {
        name: 'Bihar', slug: 'bihar', langs: ['en', 'hi'],
        cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Bihar Sharif', 'Saharsa', 'Sasaram', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bettiah', 'Hajipur', 'Aurangabad Bihar', 'Jehanabad']
    },
    {
        name: 'Chhattisgarh', slug: 'chhattisgarh', langs: ['en', 'hi'],
        cities: ['Raipur', 'Bhilai', 'Bilaspur CG', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Chirmiri', 'Mahasamund']
    },
    {
        name: 'Goa', slug: 'goa', langs: ['en', 'kok'],
        cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim']
    },
    {
        name: 'Gujarat', slug: 'gujarat', langs: ['en', 'gu'],
        cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Mehsana', 'Surendranagar', 'Bharuch', 'Gandhidham', 'Valsad', 'Vapi', 'Porbandar', 'Godhra', 'Veraval', 'Palanpur', 'Bhuj', 'Patan', 'Botad', 'Dahod', 'Amreli']
    },
    {
        name: 'Haryana', slug: 'haryana', langs: ['en', 'hi'],
        cities: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Palwal', 'Rewari', 'Hansi', 'Narnaul', 'Fatehabad', 'Mahendragarh']
    },
    {
        name: 'Himachal Pradesh', slug: 'himachal-pradesh', langs: ['en', 'hi'],
        cities: ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi HP', 'Palampur', 'Baddi', 'Nahan', 'Hamirpur HP', 'Una', 'Bilaspur HP', 'Kullu', 'Chamba']
    },
    {
        name: 'Jharkhand', slug: 'jharkhand', langs: ['en', 'hi'],
        cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro', 'Medininagar', 'Dumka', 'Chirkunda', 'Chaibasa', 'Chas']
    },
    {
        name: 'Karnataka', slug: 'karnataka', langs: ['en', 'kn'],
        cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Bijapur KA', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag-Betageri', 'Udupi', 'Robertson Pet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Chikmagalur', 'Gangavathi', 'Bagalkot', 'Ranebennur']
    },
    {
        name: 'Kerala', slug: 'kerala', langs: ['en', 'ml'],
        cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram', 'Thalassery', 'Kasaragod', 'Kayamkulam', 'Punalur', 'Vatakara', 'Manjeri', 'Perinthalmanna', 'Tirur', 'Attingal', 'Pathanamthitta', 'Neyyattinkara']
    },
    {
        name: 'Madhya Pradesh', slug: 'madhya-pradesh', langs: ['en', 'hi'],
        cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Itarsi', 'Hoshangabad', 'Sehore']
    },
    {
        name: 'Maharashtra', slug: 'maharashtra', langs: ['en', 'mr'],
        cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad MH', 'Thane', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Amravati', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Nanded', 'Satara', 'Beed', 'Yavatmal', 'Osmanabad', 'Wardha', 'Gondia', 'Ratnagiri', 'Hinganghat', 'Panvel', 'Vasai-Virar', 'Mira-Bhayandar', 'Bhiwandi', 'Ulhasnagar', 'Kalyan-Dombivli']
    },
    {
        name: 'Manipur', slug: 'manipur', langs: ['en', 'mni'],
        cities: ['Imphal', 'Thoubal', 'Bishnupur MN', 'Churachandpur']
    },
    {
        name: 'Meghalaya', slug: 'meghalaya', langs: ['en', 'kha'],
        cities: ['Shillong', 'Tura', 'Jowai', 'Nongstoin']
    },
    {
        name: 'Mizoram', slug: 'mizoram', langs: ['en', 'lus'],
        cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip']
    },
    {
        name: 'Nagaland', slug: 'nagaland', langs: ['en', 'nag'],
        cities: ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang']
    },
    {
        name: 'Odisha', slug: 'odisha', langs: ['en', 'or'],
        cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Jharsuguda', 'Bargarh', 'Jeypore', 'Angul', 'Dhenkanal', 'Rayagada', 'Paradip']
    },
    {
        name: 'Punjab', slug: 'punjab-in', langs: ['en', 'pa'],
        cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Mohali', 'Moga', 'Pathankot', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Zirakpur', 'Batala', 'Sangrur', 'Faridkot', 'Fazilka']
    },
    {
        name: 'Rajasthan', slug: 'rajasthan', langs: ['en', 'hi'],
        cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Tonk', 'Beawar', 'Churu', 'Hanumangarh', 'Jhunjhunu', 'Sawai Madhopur', 'Nagaur', 'Chittorgarh', 'Barmer', 'Bundi', 'Baran', 'Dholpur', 'Dausa', 'Dungarpur', 'Rajsamand', 'Banswara']
    },
    {
        name: 'Sikkim', slug: 'sikkim', langs: ['en', 'ne'],
        cities: ['Gangtok', 'Namchi', 'Gyalshing', 'Rangpo']
    },
    {
        name: 'Tamil Nadu', slug: 'tamil-nadu', langs: ['en', 'ta'],
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Tiruppur', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kancheepuram', 'Kumbakonam', 'Rajapalayam', 'Cuddalore', 'Ambur', 'Vaniyambadi', 'Villupuram', 'Tiruvannamalai', 'Pollachi', 'Nagapattinam']
    },
    {
        name: 'Telangana', slug: 'telangana', langs: ['en', 'te'],
        cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Kamareddy', 'Nirmal', 'Bodhan']
    },
    {
        name: 'Tripura', slug: 'tripura', langs: ['en', 'bn'],
        cities: ['Agartala', 'Udaipur TR', 'Dharmanagar', 'Kailasahar']
    },
    {
        name: 'Uttar Pradesh', slug: 'uttar-pradesh', langs: ['en', 'hi'],
        cities: ['Lucknow', 'Noida', 'Agra', 'Varanasi', 'Kanpur', 'Ghaziabad', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Budaun', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya', 'Mau', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Unnao', 'Bahraich', 'Sitapur', 'Banda', 'Hathras', 'Deoria', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Lakhimpur Kheri', 'Greater Noida']
    },
    {
        name: 'Uttarakhand', slug: 'uttarakhand', langs: ['en', 'hi'],
        cities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Roorkee', 'Kashipur', 'Rudrapur', 'Ramnagar UK', 'Pithoragarh', 'Almora', 'Nainital', 'Mussoorie', 'Pauri', 'Srinagar UK', 'Kotdwar']
    },
    {
        name: 'West Bengal', slug: 'west-bengal', langs: ['en', 'bn'],
        cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Darjiling', 'Cooch Behar']
    },
    // Union Territories
    {
        name: 'Delhi', slug: 'delhi', langs: ['en', 'hi'],
        cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini', 'Shahdara', 'Saket', 'Karol Bagh', 'Connaught Place', 'Lajpat Nagar']
    },
    {
        name: 'Jammu and Kashmir', slug: 'jammu-kashmir', langs: ['en', 'ur', 'hi'],
        cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur', 'Pulwama']
    },
    {
        name: 'Ladakh', slug: 'ladakh', langs: ['en', 'hi'],
        cities: ['Leh', 'Kargil']
    },
    {
        name: 'Chandigarh UT', slug: 'chandigarh-ut', langs: ['en', 'hi', 'pa'],
        cities: ['Chandigarh City']
    },
    {
        name: 'Puducherry', slug: 'puducherry', langs: ['en', 'ta', 'fr'],
        cities: ['Pondicherry', 'Karaikal', 'Mahe', 'Yanam']
    },
    {
        name: 'Andaman & Nicobar', slug: 'andaman-nicobar', langs: ['en', 'hi'],
        cities: ['Port Blair']
    },
    {
        name: 'Dadra Nagar Haveli & Daman Diu', slug: 'dadra-nagar-haveli-daman-diu', langs: ['en', 'gu', 'hi'],
        cities: ['Silvassa', 'Daman', 'Diu']
    },
    {
        name: 'Lakshadweep', slug: 'lakshadweep', langs: ['en', 'ml'],
        cities: ['Kavaratti']
    },
];

async function main() {
    const indiaId = await getIndiaId();
    if (!indiaId) { console.error('❌ India not found in geographies. Run seed-geographies.mjs first.'); process.exit(1); }
    console.log(`🇮🇳 India (id: ${indiaId})`);

    let totalStates = 0, totalCities = 0;

    for (const state of INDIA_STATES) {
        const stateId = await upsertGeo(state.name, state.slug, 'state', indiaId, null, state.langs);
        if (!stateId) { console.log(`  ⏭ ${state.name} already exists`); continue; }
        totalStates++;
        console.log(`  📍 ${state.name} (id: ${stateId}) [${state.langs.join(', ')}]`);

        for (const cityName of state.cities) {
            const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const cityId = await upsertGeo(cityName, citySlug, 'city', stateId, null, state.langs);
            if (cityId) totalCities++;
            console.log(`    🏙 ${cityName} (id: ${cityId || 'exists'})`);
        }
    }

    console.log(`\n✅ Seeded: ${totalStates} new states/UTs, ${totalCities} new cities for India`);
    await pool.end();
}

main().catch(e => { console.error('❌ Error:', e.message); pool.end(); process.exit(1); });
