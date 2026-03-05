/**
 * Seed doctors for ALL specialties across ALL regions
 *
 * This script creates at least 1 doctor per specialty per city/region
 * to ensure proper coverage for the doctor listing pages.
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz' });

// All medical specialties with their details
const SPECIALTIES = [
    { name: 'Cardiology', title: 'Cardiologist', qualifications: ['DM Cardiology', 'FACC'], conditions: ['heart-attack', 'coronary-artery-disease', 'heart-failure', 'arrhythmia', 'hypertension'] },
    { name: 'Orthopedics', title: 'Orthopedic Surgeon', qualifications: ['MS Orthopedics', 'DNB Orthopedics'], conditions: ['arthritis', 'osteoporosis', 'fractures', 'back-pain', 'joint-pain'] },
    { name: 'Gastroenterology', title: 'Gastroenterologist', qualifications: ['DM Gastroenterology', 'DNB Gastro'], conditions: ['peptic-ulcer', 'crohns-disease', 'ulcerative-colitis', 'hepatitis', 'fatty-liver'] },
    { name: 'Dermatology', title: 'Dermatologist', qualifications: ['MD Dermatology', 'DNB Dermatology'], conditions: ['acne', 'psoriasis', 'eczema', 'skin-cancer', 'hair-loss'] },
    { name: 'Neurology', title: 'Neurologist', qualifications: ['DM Neurology', 'DNB Neurology'], conditions: ['stroke', 'epilepsy', 'parkinsons-disease', 'multiple-sclerosis', 'migraine'] },
    { name: 'Pulmonology', title: 'Pulmonologist', qualifications: ['DM Pulmonology', 'DTCD'], conditions: ['asthma', 'copd', 'pneumonia', 'tuberculosis', 'sleep-apnea'] },
    { name: 'Endocrinology', title: 'Endocrinologist', qualifications: ['DM Endocrinology', 'DNB Endocrinology'], conditions: ['diabetes', 'thyroid-disorders', 'obesity', 'pcos'] },
    { name: 'Nephrology', title: 'Nephrologist', qualifications: ['DM Nephrology', 'DNB Nephrology'], conditions: ['chronic-kidney-disease', 'kidney-stones', 'dialysis'] },
    { name: 'Urology', title: 'Urologist', qualifications: ['MCh Urology', 'DNB Urology'], conditions: ['kidney-stones', 'prostate-cancer', 'urinary-incontinence'] },
    { name: 'Ophthalmology', title: 'Ophthalmologist', qualifications: ['MS Ophthalmology', 'DNB Ophthalmology'], conditions: ['cataract', 'glaucoma', 'diabetic-retinopathy', 'macular-degeneration'] },
    { name: 'ENT', title: 'ENT Specialist', qualifications: ['MS ENT', 'DNB Otorhinolaryngology'], conditions: ['sinusitis', 'tonsillitis', 'hearing-loss', 'vertigo'] },
    { name: 'Psychiatry', title: 'Psychiatrist', qualifications: ['MD Psychiatry', 'DNB Psychiatry'], conditions: ['depression', 'anxiety', 'schizophrenia', 'bipolar-disorder'] },
    { name: 'Oncology', title: 'Oncologist', qualifications: ['DM Oncology', 'DNB Oncology'], conditions: ['breast-cancer', 'lung-cancer', 'colon-cancer', 'leukemia', 'lymphoma'] },
    { name: 'Hematology', title: 'Hematologist', qualifications: ['DM Hematology', 'MD Pathology'], conditions: ['anemia', 'leukemia', 'lymphoma', 'bleeding-disorders'] },
    { name: 'Rheumatology', title: 'Rheumatologist', qualifications: ['DM Rheumatology', 'DNB Rheumatology'], conditions: ['rheumatoid-arthritis', 'lupus', 'gout', 'fibromyalgia'] },
    { name: 'Pediatrics', title: 'Pediatrician', qualifications: ['MD Pediatrics', 'DCH'], conditions: ['childhood-obesity', 'asthma', 'allergies', 'vaccination'] },
    { name: 'Obstetrics & Gynecology', title: 'Gynecologist', qualifications: ['MS OB-GYN', 'DNB OB-GYN'], conditions: ['pregnancy', 'pcos', 'endometriosis', 'infertility'] },
    { name: 'General Medicine', title: 'General Physician', qualifications: ['MD Medicine', 'DNB Medicine'], conditions: ['diabetes', 'hypertension', 'fever', 'infections'] },
    { name: 'Internal Medicine', title: 'Internist', qualifications: ['MD Internal Medicine', 'MRCP'], conditions: ['diabetes', 'hypertension', 'metabolic-disorders'] },
    { name: 'Family Medicine', title: 'Family Physician', qualifications: ['MD Family Medicine', 'MRCGP'], conditions: ['general-checkup', 'preventive-care', 'chronic-disease-management'] },
    { name: 'Emergency Medicine', title: 'Emergency Physician', qualifications: ['MD Emergency Medicine', 'FACEM'], conditions: ['trauma', 'cardiac-arrest', 'stroke', 'poisoning'] },
    { name: 'Infectious Disease', title: 'Infectious Disease Specialist', qualifications: ['DM Infectious Disease', 'FIDSA'], conditions: ['tuberculosis', 'hiv-aids', 'malaria', 'dengue'] },
    { name: 'Genetics', title: 'Geneticist', qualifications: ['MD Genetics', 'PhD Medical Genetics'], conditions: ['genetic-disorders', 'inherited-diseases', 'prenatal-diagnosis'] },
    { name: 'Neonatology', title: 'Neonatologist', qualifications: ['DM Neonatology', 'DNB Neonatology'], conditions: ['premature-birth', 'neonatal-jaundice', 'birth-defects'] },
    { name: 'Allergy & Immunology', title: 'Allergist', qualifications: ['MD Allergy & Immunology', 'FAAAAI'], conditions: ['allergies', 'asthma', 'immunodeficiency', 'autoimmune-diseases'] },
    { name: 'Geriatrics', title: 'Geriatrician', qualifications: ['MD Geriatrics', 'Fellowship Geriatrics'], conditions: ['alzheimers', 'dementia', 'osteoporosis', 'falls'] },
    { name: 'Sports Medicine', title: 'Sports Medicine Specialist', qualifications: ['MS Sports Medicine', 'FFSEM'], conditions: ['sports-injuries', 'muscle-strain', 'ligament-tear'] },
    { name: 'Pain Medicine', title: 'Pain Management Specialist', qualifications: ['MD Anesthesiology', 'Fellowship Pain Medicine'], conditions: ['chronic-pain', 'back-pain', 'neuropathic-pain'] },
    { name: 'Plastic Surgery', title: 'Plastic Surgeon', qualifications: ['MCh Plastic Surgery', 'DNB Plastic Surgery'], conditions: ['burns', 'reconstructive-surgery', 'cosmetic-surgery'] },
    { name: 'Neurosurgery', title: 'Neurosurgeon', qualifications: ['MCh Neurosurgery', 'DNB Neurosurgery'], conditions: ['brain-tumor', 'spinal-cord-injury', 'herniated-disc'] },
    { name: 'Vascular Surgery', title: 'Vascular Surgeon', qualifications: ['MCh Vascular Surgery', 'FRCS Vascular'], conditions: ['varicose-veins', 'peripheral-artery-disease', 'aortic-aneurysm'] },
    { name: 'Cardiothoracic Surgery', title: 'Cardiothoracic Surgeon', qualifications: ['MCh CVTS', 'FRCS CVTS'], conditions: ['coronary-artery-disease', 'heart-valve-disease', 'lung-cancer'] },
    { name: 'Hepatology', title: 'Hepatologist', qualifications: ['DM Hepatology', 'DNB Hepatology'], conditions: ['hepatitis', 'cirrhosis', 'fatty-liver', 'liver-cancer'] },
    { name: 'Critical Care', title: 'Critical Care Specialist', qualifications: ['DM Critical Care', 'FCCS'], conditions: ['sepsis', 'respiratory-failure', 'multi-organ-failure'] },
    { name: 'Palliative Care', title: 'Palliative Care Specialist', qualifications: ['MD Palliative Medicine', 'Fellowship Palliative'], conditions: ['cancer-pain', 'end-of-life-care', 'symptom-management'] },
    { name: 'Sleep Medicine', title: 'Sleep Specialist', qualifications: ['MD Sleep Medicine', 'ABSM Certified'], conditions: ['sleep-apnea', 'insomnia', 'narcolepsy'] },
    { name: 'Reproductive Medicine', title: 'Fertility Specialist', qualifications: ['MD Reproductive Medicine', 'Fellowship IVF'], conditions: ['infertility', 'pcos', 'endometriosis'] },
    { name: 'Dental', title: 'Dentist', qualifications: ['BDS', 'MDS'], conditions: ['tooth-decay', 'gum-disease', 'root-canal'] },
    { name: 'Maxillofacial Surgery', title: 'Maxillofacial Surgeon', qualifications: ['MDS Oral Surgery', 'FDSRCS'], conditions: ['jaw-surgery', 'facial-trauma', 'oral-cancer'] },
    { name: 'Physical Medicine', title: 'Physiatrist', qualifications: ['MD PMR', 'DNB PMR'], conditions: ['stroke-rehabilitation', 'spinal-cord-injury', 'chronic-pain'] },
    { name: 'Radiology', title: 'Radiologist', qualifications: ['MD Radiology', 'DNB Radiology'], conditions: ['imaging-diagnosis', 'interventional-radiology'] },
    { name: 'Pathology', title: 'Pathologist', qualifications: ['MD Pathology', 'DNB Pathology'], conditions: ['cancer-diagnosis', 'blood-disorders'] },
    { name: 'Ayurveda', title: 'Ayurvedic Doctor', qualifications: ['BAMS', 'MD Ayurveda'], conditions: ['chronic-diseases', 'digestive-disorders', 'skin-diseases'] },
    { name: 'Homeopathy', title: 'Homeopathic Doctor', qualifications: ['BHMS', 'MD Homeopathy'], conditions: ['allergies', 'skin-diseases', 'respiratory-disorders'] },
    { name: 'Bariatric Surgery', title: 'Bariatric Surgeon', qualifications: ['MS General Surgery', 'Fellowship Bariatric'], conditions: ['obesity', 'metabolic-syndrome', 'type-2-diabetes'] },
    { name: 'Nuclear Medicine', title: 'Nuclear Medicine Specialist', qualifications: ['MD Nuclear Medicine', 'DNB Nuclear Medicine'], conditions: ['thyroid-cancer', 'bone-scan', 'pet-ct'] },
];

// State-wise naming patterns (first names and last names common in each state)
const STATE_NAMES: Record<string, { firstNames: string[], lastNames: string[] }> = {
    // North India
    'Delhi': { firstNames: ['Rajesh', 'Amit', 'Priya', 'Neha', 'Vikram', 'Sunita', 'Arun', 'Kavita', 'Sanjay', 'Meera'], lastNames: ['Sharma', 'Gupta', 'Verma', 'Singh', 'Agarwal', 'Kapoor', 'Malhotra', 'Khanna', 'Arora', 'Jain'] },
    'Uttar Pradesh': { firstNames: ['Ramesh', 'Suresh', 'Geeta', 'Asha', 'Mahesh', 'Pooja', 'Dinesh', 'Sapna', 'Rakesh', 'Anita'], lastNames: ['Yadav', 'Singh', 'Sharma', 'Mishra', 'Tiwari', 'Pandey', 'Shukla', 'Tripathi', 'Dubey', 'Srivastava'] },
    'Punjab': { firstNames: ['Gurpreet', 'Harpreet', 'Manpreet', 'Jasleen', 'Amarjit', 'Simran', 'Baljit', 'Navjot', 'Kuldeep', 'Harvinder'], lastNames: ['Singh', 'Kaur', 'Gill', 'Sidhu', 'Dhillon', 'Sandhu', 'Bajwa', 'Grewal', 'Brar', 'Cheema'] },
    'Haryana': { firstNames: ['Virender', 'Naresh', 'Sunita', 'Rekha', 'Satish', 'Savita', 'Pawan', 'Kusum', 'Rajbir', 'Anita'], lastNames: ['Yadav', 'Malik', 'Saini', 'Tanwar', 'Dahiya', 'Hooda', 'Sangwan', 'Deshwal', 'Jakhar', 'Sheoran'] },
    'Rajasthan': { firstNames: ['Mahendra', 'Vinod', 'Saroj', 'Manju', 'Ashok', 'Kamlesh', 'Bharat', 'Suman', 'Gopal', 'Lakshmi'], lastNames: ['Sharma', 'Jain', 'Agarwal', 'Gupta', 'Rathore', 'Shekhawat', 'Meena', 'Bhati', 'Mathur', 'Bohra'] },
    'Madhya Pradesh': { firstNames: ['Shivraj', 'Kamal', 'Uma', 'Sadhana', 'Narendra', 'Nirmala', 'Brijesh', 'Shobha', 'Prem', 'Rani'], lastNames: ['Tiwari', 'Sharma', 'Singh', 'Thakur', 'Chouhan', 'Shrivastava', 'Dwivedi', 'Mishra', 'Patel', 'Jain'] },
    'Bihar': { firstNames: ['Nitish', 'Lalu', 'Mira', 'Sunila', 'Ravi', 'Usha', 'Manoj', 'Geeta', 'Vijay', 'Prem'], lastNames: ['Kumar', 'Singh', 'Prasad', 'Yadav', 'Thakur', 'Sinha', 'Jha', 'Mishra', 'Chaudhary', 'Mandal'] },
    'Jharkhand': { firstNames: ['Hemant', 'Shibu', 'Sunita', 'Durga', 'Raghu', 'Lata', 'Binod', 'Sita', 'Kishore', 'Kamla'], lastNames: ['Soren', 'Singh', 'Mahto', 'Sharma', 'Kumar', 'Oraon', 'Tirkey', 'Munda', 'Hembrom', 'Murmu'] },
    // West India
    'Maharashtra': { firstNames: ['Sachin', 'Amitabh', 'Priyanka', 'Aishwarya', 'Sharad', 'Supriya', 'Pramod', 'Sarika', 'Nitin', 'Sneha'], lastNames: ['Patil', 'Deshmukh', 'Jadhav', 'Kulkarni', 'Deshpande', 'Joshi', 'Pawar', 'Chavan', 'Shinde', 'Kadam'] },
    'Gujarat': { firstNames: ['Narendra', 'Ketan', 'Hetal', 'Jyoti', 'Bharat', 'Nisha', 'Jayesh', 'Komal', 'Mukesh', 'Aarti'], lastNames: ['Patel', 'Shah', 'Mehta', 'Desai', 'Dave', 'Trivedi', 'Parikh', 'Modi', 'Joshi', 'Pandya'] },
    'Goa': { firstNames: ['Anthony', 'Maria', 'Francis', 'Teresa', 'Joseph', 'Cecilia', 'Peter', 'Agnes', 'John', 'Rose'], lastNames: ['Fernandes', 'DeSouza', 'Pereira', 'Gomes', 'DSilva', 'Rodrigues', 'Dias', 'Carvalho', 'Mascarenhas', 'Noronha'] },
    // South India
    'Karnataka': { firstNames: ['Rajkumar', 'Shivaraj', 'Pushpa', 'Lakshmi', 'Basavaraj', 'Geetha', 'Venkatesh', 'Suma', 'Nagesh', 'Sharada'], lastNames: ['Gowda', 'Reddy', 'Shetty', 'Rao', 'Hegde', 'Patil', 'Bhat', 'Kumar', 'Murthy', 'Naik'] },
    'Tamil Nadu': { firstNames: ['Rajinikanth', 'Kamal', 'Nayanthara', 'Trisha', 'Vijay', 'Suriya', 'Dhanush', 'Samantha', 'Ajith', 'Jyothika'], lastNames: ['Subramanian', 'Krishnamurthy', 'Ramasamy', 'Natarajan', 'Sundaram', 'Venkatesh', 'Balakrishnan', 'Govindarajan', 'Shanmugam', 'Murugan'] },
    'Kerala': { firstNames: ['Mohanlal', 'Mammootty', 'Manju', 'Meera', 'Dileep', 'Kavya', 'Prithviraj', 'Nayanthara', 'Dulquer', 'Nazriya'], lastNames: ['Menon', 'Nair', 'Pillai', 'Kurup', 'Panicker', 'Warrier', 'Namboothiri', 'Thampi', 'Varma', 'Krishnan'] },
    'Andhra Pradesh': { firstNames: ['Chiranjeevi', 'Nagarjuna', 'Anushka', 'Kajal', 'Mahesh', 'Allu', 'Pawan', 'Rashmika', 'Ram', 'Sai'], lastNames: ['Reddy', 'Naidu', 'Rao', 'Raju', 'Varma', 'Chowdhary', 'Babu', 'Prasad', 'Krishna', 'Kumar'] },
    'Telangana': { firstNames: ['K. Chandrashekar', 'T. Harish', 'Samantha', 'Anushka', 'Srikanth', 'Sudheer', 'Nani', 'Pooja', 'Ravi', 'Priya'], lastNames: ['Rao', 'Reddy', 'Sharma', 'Goud', 'Mudiraj', 'Yadav', 'Chary', 'Gupta', 'Swamy', 'Deshmukh'] },
    // East India
    'West Bengal': { firstNames: ['Sourav', 'Amitabh', 'Rani', 'Bipasha', 'Prosenjit', 'Rituparna', 'Jeet', 'Nusrat', 'Parambrata', 'Raima'], lastNames: ['Banerjee', 'Chatterjee', 'Mukherjee', 'Sen', 'Das', 'Roy', 'Ghosh', 'Bose', 'Dutta', 'Sarkar'] },
    'Odisha': { firstNames: ['Naveen', 'Bijay', 'Anu', 'Barsha', 'Sabyasachi', 'Archita', 'Anubhav', 'Elina', 'Babushan', 'Sivani'], lastNames: ['Patnaik', 'Mohapatra', 'Mishra', 'Sahoo', 'Dash', 'Pradhan', 'Nayak', 'Behera', 'Panda', 'Mohanty'] },
    'Assam': { firstNames: ['Bhupen', 'Zubeen', 'Priyanka', 'Nilakshi', 'Jatin', 'Tarali', 'Kuldeep', 'Barsha', 'Adil', 'Nishita'], lastNames: ['Hazarika', 'Garg', 'Das', 'Bora', 'Baruah', 'Kalita', 'Choudhury', 'Sarma', 'Deka', 'Gogoi'] },
    'Tripura': { firstNames: ['Biplab', 'Manik', 'Mousumi', 'Susmita', 'Shankar', 'Ruma', 'Tapan', 'Jayanti', 'Sujit', 'Ananya'], lastNames: ['Deb', 'Das', 'Saha', 'Sen', 'Majumdar', 'Paul', 'Bhattacharjee', 'Nath', 'Roy', 'Chowdhury'] },
    // North East
    'Meghalaya': { firstNames: ['Conrad', 'Mukul', 'Patricia', 'Deborah', 'Keith', 'Sonia', 'Brian', 'Angela', 'Samuel', 'Mercy'], lastNames: ['Sangma', 'Lyngdoh', 'Syiemlieh', 'Kharkongor', 'Kharlukhi', 'Kharsyntiew', 'Pariat', 'Diengdoh', 'Marbaniang', 'Mylliemngap'] },
    'Manipur': { firstNames: ['Ibobi', 'Biren', 'Priyanka', 'Sonia', 'Tombi', 'Memcha', 'Nongmeikapam', 'Thoiba', 'Achouba', 'Sangeeta'], lastNames: ['Singh', 'Devi', 'Meitei', 'Ningthouja', 'Thokchom', 'Laishram', 'Yumnam', 'Oinam', 'Moirangthem', 'Khumukcham'] },
    'Mizoram': { firstNames: ['Zoramthanga', 'Lalduhoma', 'Vanlalruati', 'Malsawmtluangi', 'Biaktluanga', 'Zothansanga', 'Lalrinnunga', 'Vanlalhmuaka', 'Lalchungnunga', 'C. Lalremsiami'], lastNames: ['Sailo', 'Pachuau', 'Lalbiakzuala', 'Ralte', 'Chhakchhuak', 'Vanhlupuia', 'Renthlei', 'Hnamte', 'Lalramnghinghlova', 'Fanai'] },
    'Nagaland': { firstNames: ['Neiphiu', 'Temjen', 'Neisakho', 'Rosemary', 'Vizol', 'Seyie', 'Keneingutuo', 'Atsula', 'Khekiye', 'Arenla'], lastNames: ['Rio', 'Imna', 'Achumi', 'Kikon', 'Zhimo', 'Sema', 'Lotha', 'Ao', 'Angami', 'Chakhesang'] },
    'Arunachal Pradesh': { firstNames: ['Pema', 'Takam', 'Jarjum', 'Yame', 'Nabam', 'Tuki', 'Chow', 'Jomde', 'Techi', 'Oju'], lastNames: ['Khandu', 'Sanjoy', 'Ete', 'Hibu', 'Rebia', 'Yangfo', 'Tessa', 'Kena', 'Rigia', 'Apang'] },
    'Sikkim': { firstNames: ['Pawan', 'Prem', 'Diki', 'Yangchen', 'Sonam', 'Tshering', 'Phurba', 'Karma', 'Rinzing', 'Passang'], lastNames: ['Chamling', 'Golay', 'Tamang', 'Lepcha', 'Bhutia', 'Sherpa', 'Subba', 'Gurung', 'Rai', 'Limboo'] },
    // Union Territories
    'Chandigarh': { firstNames: ['Vijay', 'Pankaj', 'Neelam', 'Harshita', 'Rohit', 'Shweta', 'Gaurav', 'Kavita', 'Deepak', 'Swati'], lastNames: ['Sharma', 'Bansal', 'Goyal', 'Singla', 'Garg', 'Mittal', 'Gupta', 'Aggarwal', 'Jindal', 'Dhingra'] },
    'Uttarakhand': { firstNames: ['Trivendra', 'Tirath', 'Himani', 'Manju', 'Harish', 'Kamla', 'Bhagat', 'Anita', 'Kanti', 'Saraswati'], lastNames: ['Rawat', 'Bisht', 'Negi', 'Joshi', 'Pant', 'Bhatt', 'Thapa', 'Chauhan', 'Gusain', 'Semwal'] },
    'Himachal Pradesh': { firstNames: ['Jai', 'Virbhadra', 'Pratibha', 'Kiran', 'Sukhram', 'Asha', 'Kuldeep', 'Mamta', 'Rajan', 'Sunita'], lastNames: ['Singh', 'Thakur', 'Sharma', 'Verma', 'Chauhan', 'Negi', 'Rana', 'Pandit', 'Guleria', 'Chandel'] },
    'Jammu and Kashmir': { firstNames: ['Farooq', 'Omar', 'Mehbooba', 'Hina', 'Sajad', 'Nuzhat', 'Muzaffar', 'Asiya', 'Irfan', 'Rukhsana'], lastNames: ['Abdullah', 'Mufti', 'Lone', 'Khan', 'Wani', 'Dar', 'Bhat', 'Rather', 'Malik', 'Shah'] },
    'Ladakh': { firstNames: ['Sonam', 'Stanzin', 'Padma', 'Tsering', 'Dorje', 'Angmo', 'Rinchen', 'Diskit', 'Tundup', 'Yangchen'], lastNames: ['Nurboo', 'Namgyal', 'Paljor', 'Chosphel', 'Angchuk', 'Chondol', 'Rigzin', 'Mutup', 'Stobdan', 'Tsering'] },
    // Default for unknown states
    'default': { firstNames: ['Rajesh', 'Amit', 'Priya', 'Neha', 'Vikram', 'Sunita', 'Arun', 'Kavita', 'Sanjay', 'Meera'], lastNames: ['Kumar', 'Sharma', 'Singh', 'Gupta', 'Patel', 'Verma', 'Jain', 'Rao', 'Reddy', 'Nair'] },
};

// Medical council by state
const MEDICAL_COUNCILS: Record<string, string> = {
    'Delhi': 'Delhi Medical Council',
    'Maharashtra': 'Maharashtra Medical Council',
    'Karnataka': 'Karnataka Medical Council',
    'Tamil Nadu': 'Tamil Nadu Medical Council',
    'Kerala': 'Travancore-Cochin Medical Council',
    'Andhra Pradesh': 'Andhra Pradesh Medical Council',
    'Telangana': 'Telangana State Medical Council',
    'Gujarat': 'Gujarat Medical Council',
    'Rajasthan': 'Rajasthan Medical Council',
    'West Bengal': 'West Bengal Medical Council',
    'Uttar Pradesh': 'Uttar Pradesh Medical Council',
    'Punjab': 'Punjab Medical Council',
    'Haryana': 'Haryana Medical Council',
    'Madhya Pradesh': 'Madhya Pradesh Medical Council',
    'Bihar': 'Bihar Medical Council',
    'Odisha': 'Odisha Medical Council',
    'Assam': 'Assam Medical Council',
    'Jharkhand': 'Jharkhand Medical Council',
    'Chhattisgarh': 'Chhattisgarh Medical Council',
    'Uttarakhand': 'Uttarakhand Medical Council',
    'Himachal Pradesh': 'Himachal Pradesh Medical Council',
    'Goa': 'Goa Medical Council',
    'Tripura': 'Tripura Medical Council',
    'Meghalaya': 'Meghalaya Medical Council',
    'Manipur': 'Manipur Medical Council',
    'Mizoram': 'Mizoram Medical Council',
    'Nagaland': 'Nagaland Medical Council',
    'Arunachal Pradesh': 'Arunachal Pradesh Medical Council',
    'Sikkim': 'Sikkim Medical Council',
    'Chandigarh': 'Punjab Medical Council',
    'Jammu and Kashmir': 'J&K Medical Council',
    'Ladakh': 'J&K Medical Council',
    'default': 'Medical Council of India',
};

// Hospitals by city type
const HOSPITALS = {
    metro: ['Apollo Hospital', 'Fortis Hospital', 'Max Hospital', 'Manipal Hospital', 'Narayana Health', 'Medanta', 'Kokilaben Hospital', 'Lilavati Hospital', 'AIIMS', 'Tata Memorial'],
    tier1: ['District Hospital', 'Government Medical College Hospital', 'City Hospital', 'Regional Medical Centre', 'Civil Hospital', 'Multispecialty Hospital', 'Super Speciality Hospital'],
    tier2: ['General Hospital', 'Community Health Centre', 'Sub-District Hospital', 'Private Nursing Home', 'Mission Hospital', 'Trust Hospital'],
};

// Fee ranges by city tier
const FEE_RANGES = {
    metro: { min: 1000, max: 3000 },
    tier1: { min: 500, max: 1500 },
    tier2: { min: 300, max: 800 },
};

// Metro cities
const METRO_CITIES = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad'];
const TIER1_CITIES = ['jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'patna', 'vadodara', 'coimbatore', 'ludhiana', 'agra', 'nashik', 'varanasi', 'surat', 'visakhapatnam', 'kochi', 'thiruvananthapuram', 'chandigarh', 'guwahati', 'bhubaneswar'];

function getCityTier(citySlug: string): 'metro' | 'tier1' | 'tier2' {
    if (METRO_CITIES.includes(citySlug.toLowerCase())) return 'metro';
    if (TIER1_CITIES.includes(citySlug.toLowerCase())) return 'tier1';
    return 'tier2';
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface City {
    id: number;
    name: string;
    slug: string;
    state_name: string | null;
}

async function main() {
    console.log('Starting comprehensive doctor seeding...\n');

    const client = await pool.connect();

    try {
        // Get all cities with their states
        const citiesResult = await client.query(`
            SELECT c.id, c.name, c.slug, s.name as state_name
            FROM geographies c
            LEFT JOIN geographies s ON c.parent_id = s.id AND s.level = 'state'
            WHERE c.level = 'city' AND c.is_active = true
            ORDER BY c.name
        `);

        const cities: City[] = citiesResult.rows;
        console.log(`Found ${cities.length} cities\n`);

        // Get existing condition slugs for linking
        const conditionsResult = await client.query(`
            SELECT id, slug FROM medical_conditions WHERE is_active = true
        `);
        const conditionMap = new Map<string, number>();
        conditionsResult.rows.forEach((c: { id: number; slug: string }) => {
            conditionMap.set(c.slug, c.id);
        });
        console.log(`Found ${conditionMap.size} conditions\n`);

        // Get existing doctor slugs to avoid duplicates
        const existingDoctors = await client.query(`SELECT slug FROM doctors_providers`);
        const existingSlugs = new Set(existingDoctors.rows.map((d: { slug: string }) => d.slug));
        console.log(`Found ${existingSlugs.size} existing doctors\n`);

        let created = 0;
        let skipped = 0;
        const batchSize = 100;
        let batch: {
            slug: string;
            name: string;
            bio: string;
            qualifications: string[];
            experienceYears: number;
            consultationFee: number;
            feeCurrency: string;
            availableOnline: boolean;
            geographyId: number;
            licensingBody: string;
            isVerified: boolean;
            rating: number;
            reviewCount: number;
            subscriptionTier: string;
            contactInfo: object;
            schemaMarkup: object;
            specialty: string;
            conditions: string[];
        }[] = [];

        // For each city, create doctors for each specialty
        for (const city of cities) {
            const stateName = city.state_name || 'default';
            const stateNames = STATE_NAMES[stateName] || STATE_NAMES['default'];
            const medicalCouncil = MEDICAL_COUNCILS[stateName] || MEDICAL_COUNCILS['default'];
            const cityTier = getCityTier(city.slug);

            // Only seed doctors for Indian cities for now (most have state_name)
            if (!city.state_name) {
                // Skip non-Indian cities for now (they don't have state parents)
                skipped++;
                continue;
            }

            for (const specialty of SPECIALTIES) {
                // Generate doctor name
                const firstName = getRandomElement(stateNames.firstNames);
                const lastName = getRandomElement(stateNames.lastNames);
                const doctorName = `Dr. ${firstName} ${lastName}`;

                // Create unique slug
                const baseSlug = slugify(`dr-${firstName}-${lastName}-${specialty.title.split(' ')[0]}-${city.slug}`);
                let doctorSlug = baseSlug;
                let counter = 1;
                while (existingSlugs.has(doctorSlug)) {
                    doctorSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
                existingSlugs.add(doctorSlug);

                // Get fee range for city tier
                const feeRange = FEE_RANGES[cityTier];
                const fee = getRandomInt(feeRange.min, feeRange.max);

                // Get hospital
                const hospitals = HOSPITALS[cityTier];
                const hospital = getRandomElement(hospitals);

                // Generate experience (15-35 years for specialists)
                const experience = getRandomInt(15, 35);

                // Create bio
                const bio = `${doctorName} is a highly experienced ${specialty.title} practicing in ${city.name}. With over ${experience} years of experience, Dr. ${lastName} specializes in treating ${specialty.conditions.slice(0, 3).join(', ')} and other ${specialty.name.toLowerCase()} conditions. Currently associated with ${hospital}, ${city.name}.`;

                batch.push({
                    slug: doctorSlug,
                    name: doctorName,
                    bio,
                    qualifications: ['MBBS', ...specialty.qualifications],
                    experienceYears: experience,
                    consultationFee: fee,
                    feeCurrency: 'INR',
                    availableOnline: Math.random() > 0.3, // 70% available online
                    geographyId: city.id,
                    licensingBody: medicalCouncil,
                    isVerified: true,
                    rating: Math.round((4.0 + Math.random() * 0.9) * 10) / 10, // 4.0-4.9
                    reviewCount: getRandomInt(20, 200),
                    subscriptionTier: 'free',
                    contactInfo: {
                        hospital: `${hospital}, ${city.name}`,
                    },
                    schemaMarkup: {
                        "@context": "https://schema.org",
                        "@type": "Physician",
                        "name": doctorName,
                        "medicalSpecialty": specialty.name,
                        "hospitalAffiliation": hospital,
                    },
                    specialty: specialty.name,
                    conditions: specialty.conditions,
                });

                // Insert in batches
                if (batch.length >= batchSize) {
                    await insertBatch(client, batch, conditionMap);
                    created += batch.length;
                    console.log(`Created ${created} doctors...`);
                    batch = [];
                }
            }
        }

        // Insert remaining batch
        if (batch.length > 0) {
            await insertBatch(client, batch, conditionMap);
            created += batch.length;
        }

        console.log(`\n✅ Completed!`);
        console.log(`   Created: ${created} doctors`);
        console.log(`   Skipped: ${skipped} cities (non-Indian)`);

    } finally {
        client.release();
        await pool.end();
    }
}

async function insertBatch(
    client: import('pg').PoolClient,
    batch: {
        slug: string;
        name: string;
        bio: string;
        qualifications: string[];
        experienceYears: number;
        consultationFee: number;
        feeCurrency: string;
        availableOnline: boolean;
        geographyId: number;
        licensingBody: string;
        isVerified: boolean;
        rating: number;
        reviewCount: number;
        subscriptionTier: string;
        contactInfo: object;
        schemaMarkup: object;
        specialty: string;
        conditions: string[];
    }[],
    conditionMap: Map<string, number>
) {
    for (const doctor of batch) {
        // Insert doctor
        const result = await client.query(`
            INSERT INTO doctors_providers (
                slug, name, bio, qualifications, experience_years,
                consultation_fee, fee_currency, available_online, geography_id,
                licensing_body, is_verified, verification_date, rating, review_count,
                subscription_tier, contact_info, schema_markup, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13, $14, $15, $16, NOW(), NOW()
            )
            ON CONFLICT (slug) DO NOTHING
            RETURNING id
        `, [
            doctor.slug,
            doctor.name,
            doctor.bio,
            doctor.qualifications,
            doctor.experienceYears,
            doctor.consultationFee,
            doctor.feeCurrency,
            doctor.availableOnline,
            doctor.geographyId,
            doctor.licensingBody,
            doctor.isVerified,
            doctor.rating,
            doctor.reviewCount,
            doctor.subscriptionTier,
            JSON.stringify(doctor.contactInfo),
            JSON.stringify(doctor.schemaMarkup),
        ]);

        // Link to conditions if doctor was inserted
        if (result.rows.length > 0) {
            const doctorId = result.rows[0].id;

            for (let i = 0; i < doctor.conditions.length; i++) {
                const conditionId = conditionMap.get(doctor.conditions[i]);
                if (conditionId) {
                    await client.query(`
                        INSERT INTO doctor_specialties (doctor_id, condition_id, is_primary, created_at)
                        VALUES ($1, $2, $3, NOW())
                        ON CONFLICT DO NOTHING
                    `, [doctorId, conditionId, i === 0]);
                }
            }
        }
    }
}

main().catch(console.error);
