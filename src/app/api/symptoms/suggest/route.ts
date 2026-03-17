import { NextRequest, NextResponse } from 'next/server';

// ─── Common medical symptoms list ───────────────────────────
const SYMPTOMS = [
    'Headache', 'Migraine', 'Nausea', 'Vomiting', 'Dizziness', 'Fatigue', 'Fever',
    'Chills', 'Cough', 'Dry Cough', 'Wet Cough', 'Sore Throat', 'Runny Nose',
    'Nasal Congestion', 'Sneezing', 'Shortness of Breath', 'Wheezing',
    'Chest Pain', 'Chest Tightness', 'Heart Palpitations', 'Rapid Heartbeat',
    'High Blood Pressure', 'Low Blood Pressure',
    'Abdominal Pain', 'Stomach Ache', 'Bloating', 'Gas', 'Constipation',
    'Diarrhea', 'Acid Reflux', 'Heartburn', 'Loss of Appetite', 'Weight Loss',
    'Weight Gain', 'Difficulty Swallowing',
    'Back Pain', 'Lower Back Pain', 'Upper Back Pain', 'Neck Pain', 'Stiff Neck',
    'Joint Pain', 'Knee Pain', 'Shoulder Pain', 'Hip Pain', 'Ankle Pain',
    'Muscle Pain', 'Muscle Cramps', 'Muscle Weakness', 'Muscle Stiffness',
    'Tingling Sensation', 'Numbness', 'Burning Sensation',
    'Blurred Vision', 'Double Vision', 'Eye Pain', 'Red Eyes', 'Dry Eyes',
    'Watery Eyes', 'Sensitivity to Light', 'Floaters in Vision',
    'Ear Pain', 'Ringing in Ears', 'Hearing Loss', 'Ear Discharge',
    'Skin Rash', 'Itching', 'Hives', 'Dry Skin', 'Acne', 'Skin Lesion',
    'Bruising', 'Swelling', 'Redness', 'Skin Discoloration',
    'Hair Loss', 'Brittle Nails',
    'Frequent Urination', 'Painful Urination', 'Blood in Urine',
    'Urinary Incontinence', 'Kidney Pain',
    'Anxiety', 'Depression', 'Mood Swings', 'Irritability', 'Insomnia',
    'Sleep Disturbance', 'Excessive Sleepiness', 'Night Sweats',
    'Memory Problems', 'Difficulty Concentrating', 'Confusion', 'Brain Fog',
    'Tremor', 'Seizures', 'Fainting', 'Loss of Consciousness',
    'Swollen Lymph Nodes', 'Swollen Glands',
    'Excessive Thirst', 'Dry Mouth', 'Mouth Sores', 'Bleeding Gums',
    'Jaw Pain', 'Toothache',
    'Difficulty Breathing', 'Coughing Blood', 'Chronic Cough',
    'Cold Hands and Feet', 'Pale Skin', 'Jaundice',
    'Abdominal Swelling', 'Blood in Stool', 'Rectal Bleeding',
    'Pelvic Pain', 'Menstrual Cramps', 'Irregular Periods', 'Heavy Periods',
    'Hot Flashes', 'Vaginal Discharge', 'Breast Pain',
    'Erectile Dysfunction', 'Testicular Pain',
    'Allergic Reaction', 'Swollen Face', 'Swollen Tongue',
    'Difficulty Speaking', 'Hoarse Voice', 'Loss of Voice',
    'Dehydration', 'Electrolyte Imbalance',
    'Excessive Sweating', 'Body Odor',
    'Sensitivity to Cold', 'Sensitivity to Heat',
    'Loss of Smell', 'Loss of Taste',
    'Snoring', 'Sleep Apnea',
    'Leg Cramps', 'Restless Legs', 'Swollen Legs', 'Varicose Veins',
    'Frequent Infections', 'Slow Wound Healing',
    'Bone Pain', 'Fracture', 'Osteoporosis',
];

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim();
    if (!q || q.length < 1) return NextResponse.json([]);

    const matches = SYMPTOMS
        .filter(s => s.toLowerCase().includes(q))
        .slice(0, 10)
        .map(s => ({ name: s, category: categorize(s) }));

    return NextResponse.json(matches);
}

function categorize(symptom: string): string {
    const s = symptom.toLowerCase();
    if (['headache', 'migraine', 'dizziness', 'seizures', 'fainting', 'tremor', 'confusion', 'memory', 'brain fog', 'tingling', 'numbness'].some(k => s.includes(k))) return 'Neurological';
    if (['chest', 'heart', 'palpitation', 'blood pressure', 'heartbeat'].some(k => s.includes(k))) return 'Cardiovascular';
    if (['cough', 'breath', 'wheez', 'throat', 'nose', 'nasal', 'sneez', 'snoring', 'apnea'].some(k => s.includes(k))) return 'Respiratory';
    if (['abdominal', 'stomach', 'bloat', 'gas', 'constipation', 'diarrhea', 'reflux', 'heartburn', 'swallow', 'appetite', 'stool', 'rectal'].some(k => s.includes(k))) return 'Gastrointestinal';
    if (['back pain', 'neck', 'joint', 'knee', 'shoulder', 'hip', 'ankle', 'muscle', 'bone', 'fracture', 'osteo'].some(k => s.includes(k))) return 'Musculoskeletal';
    if (['skin', 'rash', 'itch', 'hive', 'acne', 'bruise', 'hair', 'nail', 'dry skin', 'lesion'].some(k => s.includes(k))) return 'Dermatological';
    if (['vision', 'eye', 'floater', 'light'].some(k => s.includes(k))) return 'Ophthalmological';
    if (['ear', 'hearing', 'ringing'].some(k => s.includes(k))) return 'ENT';
    if (['urin', 'kidney', 'bladder'].some(k => s.includes(k))) return 'Urological';
    if (['anxiety', 'depress', 'mood', 'irritab', 'insomnia', 'sleep'].some(k => s.includes(k))) return 'Psychological';
    if (['menstrual', 'period', 'pelvic', 'vaginal', 'breast', 'hot flash'].some(k => s.includes(k))) return 'Gynecological';
    return 'General';
}
