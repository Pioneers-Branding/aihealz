-- ============================================================
-- aihealz.com — Seed Data
-- Sample conditions, geographies, doctors, and localized content
-- ============================================================

-- ─── LANGUAGES ──────────────────────────────────────────────
INSERT INTO languages (code, name, native_name) VALUES
  ('en', 'English',    'English'),
  ('hi', 'Hindi',      'हिन्दी'),
  ('ta', 'Tamil',      'தமிழ்'),
  ('te', 'Telugu',     'తెలుగు'),
  ('bn', 'Bengali',    'বাংলা'),
  ('mr', 'Marathi',    'मराठी'),
  ('es', 'Spanish',    'Español'),
  ('fr', 'French',     'Français'),
  ('de', 'German',     'Deutsch'),
  ('pt', 'Portuguese', 'Português'),
  ('yo', 'Yoruba',     'Yorùbá'),
  ('sw', 'Swahili',    'Kiswahili'),
  ('ar', 'Arabic',     'العربية'),
  ('zh', 'Chinese',    '中文');

-- ─── MEDICAL CONDITIONS ────────────────────────────────────
INSERT INTO medical_conditions (id, slug, scientific_name, common_name, description, symptoms, treatments, faqs, specialist_type, severity_level, icd_code, body_system) VALUES
  (1, 'back-pain', 'Dorsalgia', 'Back Pain',
   'Back pain is one of the most common reasons people seek medical help or miss work. Back pain can range from a dull, constant ache to a sudden, sharp, debilitating pain.',
   '["Muscle ache", "Shooting or stabbing pain", "Pain that radiates down the leg", "Limited flexibility or range of motion", "Inability to stand straight"]'::jsonb,
   '["Physical therapy", "NSAIDs", "Muscle relaxants", "Spinal injections", "Surgery (in severe cases)", "Chiropractic adjustment"]'::jsonb,
   '[{"q": "When should I see a doctor for back pain?", "a": "See a doctor if your back pain persists beyond a few weeks, is severe, spreads down one or both legs, or causes weakness, numbness, or tingling."},{"q": "Can back pain be prevented?", "a": "Regular exercise, proper lifting techniques, maintaining a healthy weight, and good posture can help prevent back pain."}]'::jsonb,
   'Orthopedic Surgeon', 'medium', 'M54.5', 'Musculoskeletal'),

  (2, 'migraine', 'Migraine', 'Migraine',
   'A migraine is a headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head. It is often accompanied by nausea, vomiting, and extreme sensitivity to light and sound.',
   '["Throbbing or pulsing pain", "Sensitivity to light and sound", "Nausea and vomiting", "Visual disturbances (aura)", "Tingling in face or extremities"]'::jsonb,
   '["Triptans", "Anti-nausea medications", "Preventive medications (beta-blockers, antidepressants)", "Botox injections", "CGRP inhibitors", "Lifestyle modifications"]'::jsonb,
   '[{"q": "What triggers migraines?", "a": "Common triggers include stress, hormonal changes, certain foods and drinks (aged cheese, alcohol, caffeine), changes in sleep patterns, and weather changes."},{"q": "How long does a migraine last?", "a": "A migraine attack can last anywhere from 4 to 72 hours if untreated."}]'::jsonb,
   'Neurologist', 'medium', 'G43.9', 'Neurological'),

  (3, 'kidney-stones', 'Nephrolithiasis', 'Kidney Stones',
   'Kidney stones are hard deposits made of minerals and salts that form inside your kidneys. They can affect any part of the urinary tract. Passing kidney stones can be quite painful.',
   '["Severe, sharp pain in the side and back", "Pain that radiates to lower abdomen and groin", "Pain during urination", "Pink, red, or brown urine", "Nausea and vomiting", "Frequent urination"]'::jsonb,
   '["Pain relievers", "Alpha blockers", "Sound wave therapy (lithotripsy)", "Ureteroscopy", "Percutaneous nephrolithotomy", "Increased water intake"]'::jsonb,
   '[{"q": "How are kidney stones diagnosed?", "a": "Through CT scans, ultrasounds, blood tests, and urine analysis."},{"q": "Can diet prevent kidney stones?", "a": "Drinking plenty of water, reducing sodium intake, and eating fewer oxalate-rich foods can help prevent kidney stones."}]'::jsonb,
   'Urologist', 'high', 'N20.0', 'Urological'),

  (4, 'diabetes-type-2', 'Diabetes Mellitus Type 2', 'Type 2 Diabetes',
   'Type 2 diabetes is a chronic condition that affects the way your body metabolizes sugar (glucose). With type 2 diabetes, your body either resists the effects of insulin or does not produce enough insulin to maintain normal glucose levels.',
   '["Increased thirst", "Frequent urination", "Unintended weight loss", "Fatigue", "Blurred vision", "Slow-healing sores", "Frequent infections", "Darkened skin patches"]'::jsonb,
   '["Metformin", "Insulin therapy", "SGLT2 inhibitors", "GLP-1 receptor agonists", "Dietary management", "Regular exercise", "Blood sugar monitoring"]'::jsonb,
   '[{"q": "Can type 2 diabetes be reversed?", "a": "While there is no cure, type 2 diabetes can be managed and sometimes put into remission through lifestyle changes, weight loss, and medication."},{"q": "What is HbA1c?", "a": "HbA1c is a blood test that measures your average blood sugar level over the past 2-3 months. A level below 6.5% is considered normal."}]'::jsonb,
   'Endocrinologist', 'high', 'E11', 'Endocrine'),

  (5, 'hypertension', 'Essential Hypertension', 'High Blood Pressure',
   'High blood pressure (hypertension) is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.',
   '["Usually no symptoms (silent killer)", "Headaches (in severe cases)", "Shortness of breath", "Nosebleeds", "Dizziness", "Chest pain"]'::jsonb,
   '["ACE inhibitors", "Calcium channel blockers", "Diuretics", "Beta-blockers", "ARBs", "Lifestyle changes (diet, exercise, stress management)"]'::jsonb,
   '[{"q": "What is normal blood pressure?", "a": "Normal blood pressure is typically around 120/80 mmHg. High blood pressure is 130/80 mmHg or higher."},{"q": "Can stress cause high blood pressure?", "a": "While stress can temporarily raise blood pressure, chronic stress may contribute to long-term hypertension through unhealthy coping behaviors."}]'::jsonb,
   'Cardiologist', 'high', 'I10', 'Cardiovascular'),

  (6, 'sciatica', 'Ischias', 'Sciatica',
   'Sciatica refers to pain that radiates along the path of the sciatic nerve, which branches from your lower back through your hips and buttocks and down each leg. Typically, sciatica affects only one side of the body.',
   '["Pain radiating from lower spine to buttock and down the back of the leg", "Numbness or muscle weakness along the nerve pathway", "Tingling or pins-and-needles sensation", "Worsening pain with prolonged sitting", "Sharp pain making it difficult to stand up"]'::jsonb,
   '["Physical therapy", "Steroid injections", "NSAIDs", "Muscle relaxants", "Heat/cold therapy", "Microdiscectomy surgery (in severe cases)"]'::jsonb,
   '[{"q": "Does sciatica go away on its own?", "a": "Most cases of sciatica resolve within 4-6 weeks with conservative treatment. However, some cases may require medical intervention."},{"q": "What is the best sleeping position for sciatica?", "a": "Sleeping on your side with a pillow between your knees or on your back with a pillow under your knees can help relieve sciatic pain."}]'::jsonb,
   'Orthopedic Surgeon', 'medium', 'M54.3', 'Musculoskeletal');

SELECT setval('medical_conditions_id_seq', (SELECT MAX(id) FROM medical_conditions));

-- ─── GEOGRAPHIES ────────────────────────────────────────────
-- India
INSERT INTO geographies (id, name, slug, level, parent_id, supported_languages, population, timezone) VALUES
  (1,  'India',       'india',       'country', NULL, '{en,hi,ta,te,bn,mr}', 1400000000, 'Asia/Kolkata'),
  (2,  'Delhi',       'delhi',       'state',   1,    '{en,hi}',             30000000,   'Asia/Kolkata'),
  (3,  'New Delhi',   'new-delhi',   'city',    2,    '{en,hi}',             1500000,    'Asia/Kolkata'),
  (4,  'Saket',       'saket',       'locality',3,    '{en,hi}',             150000,     'Asia/Kolkata'),
  (5,  'Dwarka',      'dwarka',      'locality',3,    '{en,hi}',             200000,     'Asia/Kolkata'),
  (6,  'Tamil Nadu',  'tamil-nadu',  'state',   1,    '{en,ta}',             80000000,   'Asia/Kolkata'),
  (7,  'Chennai',     'chennai',     'city',    6,    '{en,ta}',             11000000,   'Asia/Kolkata'),
  (8,  'T. Nagar',    't-nagar',     'locality',7,    '{en,ta}',             300000,     'Asia/Kolkata'),
  (9,  'Maharashtra', 'maharashtra', 'state',   1,    '{en,hi,mr}',          125000000,  'Asia/Kolkata'),
  (10, 'Mumbai',      'mumbai',      'city',    9,    '{en,hi,mr}',          21000000,   'Asia/Kolkata'),
  (11, 'Andheri',     'andheri',     'locality',10,   '{en,hi}',             500000,     'Asia/Kolkata');

-- USA
INSERT INTO geographies (id, name, slug, level, parent_id, supported_languages, population, timezone) VALUES
  (20, 'United States', 'usa',           'country', NULL, '{en,es}',  330000000, 'America/New_York'),
  (21, 'California',    'california',    'state',   20,   '{en,es}',  39500000,  'America/Los_Angeles'),
  (22, 'Los Angeles',   'los-angeles',   'city',    21,   '{en,es}',  4000000,   'America/Los_Angeles'),
  (23, 'Beverly Hills', 'beverly-hills', 'locality',22,   '{en}',     34000,     'America/Los_Angeles'),
  (24, 'New York',      'new-york',      'state',   20,   '{en,es}',  20000000,  'America/New_York'),
  (25, 'New York City', 'new-york-city', 'city',    24,   '{en,es}',  8300000,   'America/New_York'),
  (26, 'Manhattan',     'manhattan',     'locality',25,   '{en,es}',  1600000,   'America/New_York');

-- UK
INSERT INTO geographies (id, name, slug, level, parent_id, supported_languages, population, timezone) VALUES
  (30, 'United Kingdom', 'uk',      'country', NULL, '{en}',  67000000,  'Europe/London'),
  (31, 'England',        'england', 'state',   30,   '{en}',  56000000,  'Europe/London'),
  (32, 'London',         'london',  'city',    31,   '{en}',  9000000,   'Europe/London');

-- Nigeria
INSERT INTO geographies (id, name, slug, level, parent_id, supported_languages, population, timezone) VALUES
  (40, 'Nigeria',  'nigeria', 'country', NULL, '{en,yo}', 220000000,  'Africa/Lagos'),
  (41, 'Lagos',    'lagos',   'state',   40,   '{en,yo}', 15000000,   'Africa/Lagos'),
  (42, 'Ikeja',    'ikeja',   'city',    41,   '{en,yo}', 600000,     'Africa/Lagos');

-- Reset sequence
SELECT setval('geographies_id_seq', (SELECT MAX(id) FROM geographies));

-- ─── DOCTORS / PROVIDERS ────────────────────────────────────
INSERT INTO doctors_providers (id, slug, name, license_number, licensing_body, bio, qualifications, experience_years, contact_info, geography_id, is_verified, subscription_tier, rating, review_count, consultation_fee, fee_currency) VALUES
  (1, 'dr-arush-mehta', 'Dr. Arush Mehta', 'MCI-54321', 'Medical Council of India',
   'Dr. Arush Mehta is a board-certified Orthopedic Surgeon with over 15 years of experience in spinal surgery and pain management. He completed his fellowship at AIIMS, New Delhi.',
   ARRAY['MBBS (AIIMS)', 'MS Orthopaedics (PGI Chandigarh)', 'Fellowship in Spine Surgery'],
   15, '{"phone": "+91-11-2222-3333", "email": "dr.arush@example.com", "clinic": "SpineCare Clinic, Saket"}'::jsonb,
   4, true, 'premium', 4.8, 234, 1500, 'INR'),

  (2, 'dr-priya-sharma', 'Dr. Priya Sharma', 'MCI-67890', 'Medical Council of India',
   'Dr. Priya Sharma is a leading Neurologist specializing in migraine management and headache disorders. She has published extensively in international journals.',
   ARRAY['MBBS (Lady Hardinge)', 'MD Neurology (AIIMS)', 'DM Neurology'],
   12, '{"phone": "+91-11-3333-4444", "email": "dr.priya@example.com", "clinic": "NeuroWell Clinic, Dwarka"}'::jsonb,
   5, true, 'premium', 4.6, 187, 1200, 'INR'),

  (3, 'dr-rajesh-kumar', 'Dr. Rajesh Kumar', 'MCI-11111', 'Medical Council of India',
   'Dr. Rajesh Kumar is a general practitioner with a focus on preventive medicine and chronic disease management.',
   ARRAY['MBBS (Delhi University)', 'MD General Medicine'],
   8, '{"phone": "+91-11-4444-5555", "email": "dr.rajesh@example.com", "clinic": "HealthFirst Clinic, Saket"}'::jsonb,
   4, true, 'free', 4.2, 89, 500, 'INR'),

  (4, 'dr-lakshmi-rao', 'Dr. Lakshmi Rao', 'TN-MCI-22222', 'Tamil Nadu Medical Council',
   'Dr. Lakshmi Rao is a senior Urologist at Apollo Hospital, Chennai, with expertise in minimally invasive kidney stone treatment.',
   ARRAY['MBBS (Madras Medical College)', 'MS General Surgery', 'MCh Urology'],
   20, '{"phone": "+91-44-5555-6666", "email": "dr.lakshmi@example.com", "clinic": "Apollo Hospital, T. Nagar"}'::jsonb,
   8, true, 'premium', 4.9, 312, 2000, 'INR'),

  (5, 'dr-james-wilson', 'Dr. James Wilson', 'NY-12345', 'American Medical Association',
   'Dr. James Wilson is a renowned Cardiologist at Mount Sinai Hospital with expertise in interventional cardiology and heart failure management.',
   ARRAY['MD (Johns Hopkins)', 'Fellowship Cardiology (Mayo Clinic)', 'FACC'],
   22, '{"phone": "+1-212-555-0100", "email": "dr.wilson@example.com", "clinic": "Mount Sinai Cardiology, Manhattan"}'::jsonb,
   26, true, 'premium', 4.7, 445, 350, 'USD');

SELECT setval('doctors_providers_id_seq', (SELECT MAX(id) FROM doctors_providers));

-- ─── DOCTOR SPECIALTIES ─────────────────────────────────────
INSERT INTO doctor_specialties (doctor_id, condition_id, is_primary) VALUES
  (1, 1, true),   -- Dr. Arush → Back Pain (primary)
  (1, 6, false),  -- Dr. Arush → Sciatica
  (2, 2, true),   -- Dr. Priya → Migraine (primary)
  (3, 1, true),   -- Dr. Rajesh → Back Pain (free tier, primary)
  (3, 5, false),  -- Dr. Rajesh → Hypertension (free tier, 2nd)
  (4, 3, true),   -- Dr. Lakshmi → Kidney Stones (primary)
  (5, 5, true);   -- Dr. James → Hypertension (primary)

-- ─── CONDITION REVIEWERS (E-E-A-T) ─────────────────────────
INSERT INTO condition_reviewers (condition_id, doctor_id, geography_id, is_primary, review_date) VALUES
  (1, 1, 4,  true,  '2025-01-15'),  -- Back Pain reviewed by Dr. Arush for Saket
  (1, 1, 3,  true,  '2025-01-15'),  -- Back Pain reviewed by Dr. Arush for New Delhi
  (2, 2, 5,  true,  '2025-02-01'),  -- Migraine reviewed by Dr. Priya for Dwarka
  (3, 4, 8,  true,  '2025-01-20'),  -- Kidney Stones reviewed by Dr. Lakshmi for T. Nagar
  (5, 5, 26, true,  '2025-02-10'),  -- Hypertension reviewed by Dr. James for Manhattan
  (6, 1, 4,  true,  '2025-01-15');  -- Sciatica reviewed by Dr. Arush for Saket

-- ─── LOCALIZED CONTENT ──────────────────────────────────────
INSERT INTO localized_content (condition_id, language_code, geography_id, title, description, localized_advice, local_factors, consultation_tips, meta_title, meta_description, status, reviewed_by, word_count) VALUES
  -- Back Pain — English — New Delhi / Saket
  (1, 'en', 4,
   'Back Pain Treatment in Saket, New Delhi',
   'Back pain affects millions of Indians every year. In urban areas like Saket, New Delhi, sedentary lifestyles and long commute times contribute significantly to spinal health issues. Understanding the causes and seeking timely treatment from qualified orthopedic specialists can prevent chronic complications.',
   'If you live in Saket or surrounding South Delhi areas, consider visiting one of the many multi-specialty hospitals along the Press Enclave Road corridor. Early morning yoga at Siri Fort or Deer Park can also help manage mild back pain.',
   '{"climate": "Delhi''s extreme heat in summers can cause dehydration, worsening muscle cramps and back pain", "lifestyle": "Long Metro commutes and desk jobs in nearby Nehru Place IT hub contribute to poor posture", "local_tip": "Many Ayurvedic centers in Hauz Khas offer complementary back pain treatments"}'::jsonb,
   'When visiting an orthopedic specialist in Saket, bring any previous MRI or X-ray reports. Most clinics in the area accept cashless insurance from major providers. Expect a 30-45 minute initial consultation.',
   'Back Pain Treatment in Saket, New Delhi | Best Orthopedic Doctors',
   'Find the best orthopedic doctors for back pain treatment in Saket, New Delhi. Expert spine specialists, verified reviews, and appointment booking.',
   'published', 1, 180),

  -- Back Pain — Hindi — New Delhi / Saket
  (1, 'hi', 4,
   'साकेत, नई दिल्ली में कमर दर्द का इलाज',
   'कमर दर्द हर साल लाखों भारतीयों को प्रभावित करता है। साकेत, नई दिल्ली जैसे शहरी क्षेत्रों में बैठे-बैठे काम करने और लंबे समय तक यात्रा करने से रीढ़ की हड्डी की समस्याएं बढ़ रही हैं। कारणों को समझना और योग्य हड्डी रोग विशेषज्ञों से समय पर इलाज कराना पुरानी जटिलताओं को रोक सकता है।',
   'अगर आप साकेत या दक्षिण दिल्ली के आसपास के इलाकों में रहते हैं, तो प्रेस एन्क्लेव रोड कॉरिडोर के कई मल्टी-स्पेशियलिटी अस्पतालों में जाने पर विचार करें। सिरी फोर्ट या डियर पार्क में सुबह का योग हल्के कमर दर्द को प्रबंधित करने में मदद कर सकता है।',
   '{"climate": "दिल्ली की गर्मियों में अत्यधिक गर्मी से डिहाइड्रेशन हो सकता है, जो मांसपेशियों की ऐंठन और कमर दर्द को बढ़ाता है", "lifestyle": "लंबी मेट्रो यात्राएं और नेहरू प्लेस IT हब में डेस्क जॉब खराब पोस्चर का कारण बनती हैं"}'::jsonb,
   'साकेत में हड्डी रोग विशेषज्ञ से मिलते समय, पिछली MRI या X-ray रिपोर्ट लेकर जाएं। इस क्षेत्र के अधिकांश क्लीनिक प्रमुख प्रदाताओं से कैशलेस बीमा स्वीकार करते हैं।',
   'साकेत, नई दिल्ली में कमर दर्द का इलाज | सर्वश्रेष्ठ हड्डी रोग डॉक्टर',
   'साकेत, नई दिल्ली में कमर दर्द के इलाज के लिए सर्वश्रेष्ठ हड्डी रोग डॉक्टर खोजें। विशेषज्ञ रीढ़ विशेषज्ञ, सत्यापित समीक्षाएं।',
   'published', 1, 200),

  -- Kidney Stones — English — Chennai / T. Nagar
  (3, 'en', 8,
   'Kidney Stone Treatment in T. Nagar, Chennai',
   'Kidney stones are a significant health concern in Chennai due to the city''s hot and humid climate, which leads to higher dehydration rates. T. Nagar, being one of Chennai''s most prominent neighborhoods, has excellent access to top urological care facilities.',
   'Stay well-hydrated, especially during Chennai''s intense summer months (March-June). The area''s proximity to Apollo Hospital and other multi-specialty facilities ensures quick access to lithotripsy and other advanced stone treatments.',
   '{"climate": "Chennai''s tropical climate with temperatures regularly exceeding 40°C increases dehydration risk and kidney stone formation", "lifestyle": "High consumption of calcium-rich South Indian dairy products may contribute to certain stone types", "local_tip": "Traditional Siddha medicine practitioners in T. Nagar offer herbal remedies that complement conventional treatment"}'::jsonb,
   'Bring previous ultrasound or CT scan reports when visiting a urologist in T. Nagar. Most hospitals here offer same-day diagnostic ultrasounds. Expect to provide a urine sample for analysis.',
   'Kidney Stone Treatment in T. Nagar, Chennai | Expert Urologists',
   'Find expert urologists for kidney stone treatment in T. Nagar, Chennai. Lithotripsy, minimally invasive surgery, and comprehensive stone management.',
   'published', 4, 170),

  -- Hypertension — English — Manhattan, NYC
  (5, 'en', 26,
   'High Blood Pressure Treatment in Manhattan, New York City',
   'Hypertension is one of the leading cardiovascular concerns in New York City, where the fast-paced Manhattan lifestyle—stress, long working hours, and dietary habits—contributes to elevated blood pressure in a significant portion of the population.',
   'Manhattan offers world-class cardiac care at institutions like Mount Sinai, NYU Langone, and NewYork-Presbyterian. Many practices in Midtown and the Upper East Side offer executive health screening packages that include comprehensive cardiovascular assessments.',
   '{"climate": "New York''s harsh winters can increase blood pressure due to cold-induced vasoconstriction", "lifestyle": "High-stress Wall Street culture and frequent dining out with sodium-rich meals contribute to hypertension", "local_tip": "Central Park offers excellent walking and running paths for cardiovascular exercise"}'::jsonb,
   'When visiting a cardiologist in Manhattan, bring a log of your blood pressure readings from the past 2-4 weeks. Most practices accept major insurance plans. Initial consultations typically last 45-60 minutes and may include an EKG.',
   'High Blood Pressure Treatment in Manhattan, NYC | Top Cardiologists',
   'Find top cardiologists for hypertension treatment in Manhattan, New York City. Expert cardiac care, verified specialists, and appointment booking.',
   'published', 5, 195);

-- ─── UI TRANSLATIONS (Sample Key-Value pairs) ──────────────
INSERT INTO ui_translations (language_code, namespace, key, value) VALUES
  -- English (base)
  ('en', 'common', 'nav.home', 'Home'),
  ('en', 'common', 'nav.conditions', 'Medical Conditions'),
  ('en', 'common', 'nav.doctors', 'Find Doctors'),
  ('en', 'common', 'nav.analyze', 'AI Report Analysis'),
  ('en', 'common', 'footer.disclaimer', 'This information is for educational purposes only and should not replace professional medical advice.'),
  ('en', 'common', 'button.book_appointment', 'Book Appointment'),
  ('en', 'common', 'button.learn_more', 'Learn More'),
  ('en', 'common', 'label.verified_doctor', 'Verified Doctor'),
  ('en', 'common', 'label.fact_checked_by', 'Fact-checked by'),
  ('en', 'common', 'label.last_reviewed', 'Last reviewed on'),
  ('en', 'condition', 'section.symptoms', 'Symptoms'),
  ('en', 'condition', 'section.treatments', 'Treatment Options'),
  ('en', 'condition', 'section.faqs', 'Frequently Asked Questions'),
  ('en', 'condition', 'section.local_doctors', 'Top Specialists Near You'),
  ('en', 'condition', 'section.local_advice', 'Local Health Insights'),

  -- Hindi
  ('hi', 'common', 'nav.home', 'होम'),
  ('hi', 'common', 'nav.conditions', 'चिकित्सा स्थितियां'),
  ('hi', 'common', 'nav.doctors', 'डॉक्टर खोजें'),
  ('hi', 'common', 'nav.analyze', 'AI रिपोर्ट विश्लेषण'),
  ('hi', 'common', 'footer.disclaimer', 'यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह की जगह नहीं ले सकती।'),
  ('hi', 'common', 'button.book_appointment', 'अपॉइंटमेंट बुक करें'),
  ('hi', 'common', 'button.learn_more', 'और जानें'),
  ('hi', 'common', 'label.verified_doctor', 'सत्यापित डॉक्टर'),
  ('hi', 'common', 'label.fact_checked_by', 'द्वारा तथ्य-जांच'),
  ('hi', 'common', 'label.last_reviewed', 'अंतिम समीक्षा'),
  ('hi', 'condition', 'section.symptoms', 'लक्षण'),
  ('hi', 'condition', 'section.treatments', 'उपचार विकल्प'),
  ('hi', 'condition', 'section.faqs', 'अक्सर पूछे जाने वाले प्रश्न'),
  ('hi', 'condition', 'section.local_doctors', 'आपके पास के विशेषज्ञ'),
  ('hi', 'condition', 'section.local_advice', 'स्थानीय स्वास्थ्य जानकारी'),

  -- Tamil
  ('ta', 'common', 'nav.home', 'முகப்பு'),
  ('ta', 'common', 'nav.conditions', 'மருத்துவ நிலைகள்'),
  ('ta', 'common', 'nav.doctors', 'மருத்துவர்களைக் கண்டறியுங்கள்'),
  ('ta', 'common', 'nav.analyze', 'AI அறிக்கை பகுப்பாய்வு'),
  ('ta', 'common', 'footer.disclaimer', 'இந்த தகவல் கல்வி நோக்கங்களுக்கு மட்டுமே மற்றும் தொழில்முறை மருத்துவ ஆலோசனையை மாற்றாது.'),
  ('ta', 'common', 'button.book_appointment', 'சந்திப்பை முன்பதிவு செய்யுங்கள்'),
  ('ta', 'common', 'label.verified_doctor', 'சரிபார்க்கப்பட்ட மருத்துவர்'),
  ('ta', 'common', 'label.fact_checked_by', 'உண்மை சரிபார்ப்பு'),
  ('ta', 'condition', 'section.symptoms', 'அறிகுறிகள்'),
  ('ta', 'condition', 'section.treatments', 'சிகிச்சை விருப்பங்கள்'),
  ('ta', 'condition', 'section.faqs', 'அடிக்கடி கேட்கப்படும் கேள்விகள்'),
  ('ta', 'condition', 'section.local_doctors', 'அருகிலுள்ள நிபுணர்கள்'),
  ('ta', 'condition', 'section.local_advice', 'உள்ளூர் சுகாதார நுண்ணறிவுகள்');
