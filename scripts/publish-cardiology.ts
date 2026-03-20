import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const p = new PrismaClient({ adapter });

async function main() {
  // 1. Publish all existing cardiology condition content
  console.log('Publishing all cardiology condition content...');
  const updated = await p.conditionPageContent.updateMany({
    where: {
      condition: { specialistType: 'Cardiologist' },
      languageCode: 'en',
      status: 'review',
    },
    data: { status: 'published' },
  });
  console.log(`✅ Published ${updated.count} condition pages\n`);

  // 2. Create content for the 3 missing core conditions
  const missing = [
    {
      slug: 'coronary-artery-disease',
      content: {
        h1Title: 'Coronary Artery Disease (CAD): Prevention, Diagnosis & Treatment',
        heroOverview: 'Coronary Artery Disease (CAD) is the most common type of heart disease, caused by plaque buildup in the coronary arteries that supply blood to the heart muscle. At aihealz, we connect you with top cardiologists who specialize in diagnosing and treating CAD using the latest interventional techniques, from lifestyle management to stenting and bypass surgery.',
        definition: 'Coronary Artery Disease occurs when the coronary arteries become narrowed or blocked due to atherosclerosis — a gradual buildup of cholesterol, fat, and other substances (plaque) on the inner walls. This reduces blood flow to the heart, potentially causing chest pain (angina), shortness of breath, or a heart attack. CAD develops over decades and is the leading cause of death worldwide.',
        diagnosisOverview: 'Diagnosis of CAD involves a combination of physical examination, blood tests (cholesterol, glucose, CRP), and imaging. Key diagnostic tools include an ECG (electrocardiogram), stress testing (exercise or pharmacological), echocardiography, coronary CT angiography (CCTA), and invasive coronary angiography. The choice of test depends on symptom severity and risk profile.',
        treatmentOverview: 'Treatment ranges from lifestyle modifications and medications for mild cases to interventional procedures for severe disease. Medications include statins, aspirin, beta-blockers, and ACE inhibitors. Interventional options include percutaneous coronary intervention (PCI/stenting) and coronary artery bypass grafting (CABG). The treatment plan is tailored to the extent of disease, symptoms, and patient factors.',
        prognosis: 'With early detection and proper management, many patients with CAD can lead active, normal lives. Modern interventions like drug-eluting stents and bypass surgery have excellent long-term outcomes. Lifestyle changes — quitting smoking, regular exercise, and a heart-healthy diet — significantly improve prognosis and can slow or even reverse plaque buildup.',
        whySeeSpecialist: 'A cardiologist specializing in coronary artery disease can perform advanced diagnostics like cardiac catheterization and offer interventional treatments like stenting. They create personalized treatment plans that balance medication management with procedural intervention, and provide ongoing monitoring to prevent disease progression.',
        primarySymptoms: ['Chest pain or pressure (angina)', 'Shortness of breath during activity', 'Fatigue and reduced exercise tolerance', 'Pain radiating to arm, jaw, neck, or back'],
        earlyWarningSigns: ['Unusual fatigue during routine activities', 'Mild chest discomfort with exertion', 'Shortness of breath climbing stairs'],
        preventionStrategies: ['Regular cardiovascular exercise (150 min/week)', 'Heart-healthy Mediterranean diet', 'Quit smoking completely', 'Manage blood pressure and cholesterol', 'Maintain healthy weight (BMI 18.5-24.9)', 'Control diabetes with proper medication', 'Limit alcohol consumption', 'Regular cardiac health screenings'],
        complications: ['Myocardial infarction (heart attack)', 'Heart failure', 'Arrhythmias (irregular heartbeat)', 'Sudden cardiac death', 'Chronic angina limiting daily activities'],
        faqs: [
          { question: 'Can coronary artery disease be reversed?', answer: 'Aggressive lifestyle changes and medications like statins can slow progression and in some cases partially reverse plaque buildup. However, established blockages typically require intervention.' },
          { question: 'What is the difference between a stent and bypass surgery?', answer: 'A stent is a minimally invasive procedure where a small mesh tube is placed to keep an artery open. Bypass surgery (CABG) creates new pathways for blood flow using grafts. Bypass is typically used for more extensive or complex disease.' },
          { question: 'How often should I get checked for heart disease?', answer: 'Adults over 40 should have cardiovascular risk assessment every 5 years. Those with risk factors (family history, diabetes, smoking) should be screened more frequently.' },
          { question: 'Can I exercise with coronary artery disease?', answer: 'Yes, exercise is strongly recommended. Cardiac rehabilitation programs provide supervised, safe exercise plans. Always consult your cardiologist before starting a new exercise regimen.' },
          { question: 'Is CAD hereditary?', answer: 'Family history is a significant risk factor. If a first-degree relative had heart disease before age 55 (men) or 65 (women), your risk is higher. However, lifestyle modifications can substantially reduce even genetic risk.' }
        ],
        emergencySigns: ['Severe crushing chest pain lasting more than 15 minutes', 'Chest pain with profuse sweating, nausea, and dizziness', 'Sudden severe shortness of breath at rest', 'Loss of consciousness', 'Severe palpitations with light-headedness'],
        lifestyleModifications: ['30 minutes of moderate exercise 5 days per week', 'Mediterranean or DASH diet', 'Complete smoking cessation', 'Limit sodium to less than 2,300mg daily', 'Manage stress through relaxation techniques', 'Achieve and maintain healthy weight', 'Limit alcohol to 1 drink/day for women, 2 for men', 'Get 7-9 hours of quality sleep', 'Monitor blood pressure at home regularly', 'Take all prescribed medications consistently'],
        dietRecommendations: ['Fatty fish (salmon, mackerel) 2-3 times weekly', 'Fruits and vegetables (5+ servings daily)', 'Whole grains and fiber-rich foods', 'Nuts (almonds, walnuts) in moderation', 'Olive oil as primary cooking fat', 'Legumes and beans regularly', 'Low-fat dairy products', 'Lean proteins'],
        diagnosticTests: [
          { test: 'Coronary CT Angiography (CCTA)', purpose: 'Non-invasive imaging to detect plaque and blockages in coronary arteries.', whatToExpect: 'Quick scan with IV contrast; results in minutes.' },
          { test: 'Cardiac Catheterization', purpose: 'Gold standard for assessing severity and location of blockages.', whatToExpect: 'Minimally invasive procedure through wrist or groin; allows immediate stenting if needed.' },
          { test: 'Stress Test', purpose: 'Evaluates heart function during physical exertion to detect reduced blood flow.', whatToExpect: 'Exercise on treadmill while ECG monitors heart rhythm; about 30 minutes.' }
        ],
        medicalTreatments: [
          { name: 'Statins (Atorvastatin, Rosuvastatin)', type: 'medication', description: 'Lower LDL cholesterol and stabilize arterial plaque.', effectiveness: 'high' },
          { name: 'Aspirin / Dual Antiplatelet Therapy', type: 'medication', description: 'Prevent blood clots in narrowed arteries.', effectiveness: 'high' },
          { name: 'Beta-blockers (Metoprolol)', type: 'medication', description: 'Reduce heart rate and blood pressure, decreasing oxygen demand.', effectiveness: 'high' },
          { name: 'ACE inhibitors / ARBs', type: 'medication', description: 'Protect heart and blood vessels by lowering blood pressure.', effectiveness: 'high' },
          { name: 'Nitroglycerin', type: 'medication', description: 'Rapid relief of angina by dilating coronary arteries.', effectiveness: 'moderate' }
        ],
        surgicalOptions: [
          { name: 'Percutaneous Coronary Intervention (PCI/Stenting)', description: 'Balloon angioplasty with drug-eluting stent placement to open blocked arteries.', successRate: 'Over 95% procedural success rate.' },
          { name: 'Coronary Artery Bypass Grafting (CABG)', description: 'Open-heart surgery creating new blood flow pathways using grafts from chest or leg vessels.', successRate: 'Excellent long-term results; 90%+ graft patency at 10 years.' }
        ],
        hospitalCriteria: ['24/7 cardiac catheterization lab', 'Experienced interventional cardiology team', 'Cardiac surgery capability', 'Advanced imaging (CT, MRI)', 'Cardiac rehabilitation program', 'NABH/JCI accreditation'],
        keyStats: { icdCode: 'I25.1', severity: 'moderate-severe', bodySystem: 'Heart & Cardiovascular', prevalence: 'Most common heart disease globally', demographics: 'Adults over 40, men at higher risk' },
        specialistType: 'Cardiologist',
        metaTitle: 'Coronary Artery Disease Treatment & Specialists',
        metaDescription: 'Learn about coronary artery disease symptoms, diagnosis, stenting, bypass surgery, and prevention. Find top cardiologists near you.',
        keywords: ['coronary artery disease', 'CAD treatment', 'heart disease', 'stent', 'bypass surgery', 'cardiologist'],
        wordCount: 1500,
      }
    },
    {
      slug: 'heart-failure',
      content: {
        h1Title: 'Heart Failure: Comprehensive Management & Treatment Options',
        heroOverview: 'Heart failure is a chronic condition where the heart cannot pump blood efficiently enough to meet the body\'s needs. At aihealz, we connect you with specialized heart failure cardiologists who use advanced diagnostics and cutting-edge therapies to improve quality of life and long-term outcomes.',
        definition: 'Heart failure (HF) occurs when the heart muscle is weakened or stiffened, reducing its ability to fill with or pump blood effectively. It can be classified as HFrEF (reduced ejection fraction, where the heart pumps weakly) or HFpEF (preserved ejection fraction, where the heart fills poorly). Heart failure is not a sudden event but a progressive condition that worsens over time without treatment.',
        diagnosisOverview: 'Diagnosis involves clinical assessment, blood tests (BNP/NT-proBNP levels), chest X-ray, ECG, and echocardiography. Echocardiography is the primary diagnostic tool, measuring ejection fraction and heart structure. Additional tests may include cardiac MRI, stress tests, and cardiac catheterization to determine the underlying cause.',
        treatmentOverview: 'Treatment follows guideline-directed medical therapy (GDMT) including ACE inhibitors/ARBs/ARNI, beta-blockers, mineralocorticoid receptor antagonists, and SGLT2 inhibitors. Device therapy includes ICDs for sudden death prevention and CRT for cardiac resynchronization. Advanced options include LVADs (left ventricular assist devices) and heart transplantation for end-stage disease.',
        prognosis: 'Modern heart failure therapies have significantly improved survival and quality of life. With optimal medication management and lifestyle changes, many patients maintain active lives for years. Early diagnosis and treatment adherence are key factors in long-term outcomes.',
        whySeeSpecialist: 'Heart failure specialists offer advanced diagnostics, optimize complex multi-drug regimens, and manage device therapies. They monitor disease progression with biomarkers and imaging, and coordinate care across specialties for the best outcomes.',
        primarySymptoms: ['Shortness of breath (during activity or lying down)', 'Persistent fatigue and weakness', 'Swelling in legs, ankles, and feet', 'Rapid or irregular heartbeat'],
        earlyWarningSigns: ['Increasing shortness of breath during routine tasks', 'Waking up breathless at night', 'Unexplained weight gain (fluid retention)', 'Persistent cough or wheezing'],
        preventionStrategies: ['Control high blood pressure', 'Manage diabetes effectively', 'Maintain healthy weight', 'Regular exercise as tolerated', 'Limit sodium intake to 1,500-2,000mg daily', 'Avoid excessive alcohol', 'Quit smoking', 'Regular cardiac checkups'],
        complications: ['Kidney damage or failure', 'Heart valve problems', 'Liver damage from fluid congestion', 'Arrhythmias (irregular heart rhythms)', 'Cardiac cachexia (muscle wasting)'],
        faqs: [
          { question: 'Is heart failure the same as a heart attack?', answer: 'No. A heart attack is a sudden event where blood flow to part of the heart is blocked. Heart failure is a chronic condition where the heart gradually loses pumping ability. However, heart attacks can lead to heart failure.' },
          { question: 'Can heart failure be cured?', answer: 'While heart failure is typically a chronic condition, some causes (like valve disease or thyroid disorders) can be treated to restore heart function. In most cases, the goal is managing symptoms and slowing progression.' },
          { question: 'What is ejection fraction?', answer: 'Ejection fraction (EF) measures the percentage of blood pumped out with each heartbeat. Normal is 55-70%. HFrEF means EF is below 40%, while HFpEF has normal or near-normal EF but the heart fills poorly.' },
          { question: 'How much fluid can I drink with heart failure?', answer: 'Most heart failure patients should limit fluids to 1.5-2 liters per day. Your doctor will provide specific guidance based on your condition severity.' }
        ],
        emergencySigns: ['Sudden severe shortness of breath at rest', 'Chest pain or pressure', 'Fainting or severe dizziness', 'Rapid weight gain (3+ pounds in a day)', 'Coughing up pink, frothy mucus'],
        lifestyleModifications: ['Daily weight monitoring', 'Sodium restriction (1,500-2,000mg/day)', 'Fluid restriction as advised', 'Regular light exercise (cardiac rehab)', 'Medication adherence', 'Stress management', 'Adequate sleep', 'Avoid NSAIDs', 'Limit alcohol', 'Regular follow-up appointments'],
        dietRecommendations: ['Low-sodium foods', 'Fresh fruits and vegetables', 'Lean proteins (fish, chicken)', 'Whole grains', 'Potassium-rich foods (if not on certain medications)', 'Olive oil', 'Herbs and spices instead of salt', 'Limited processed foods'],
        diagnosticTests: [
          { test: 'Echocardiogram', purpose: 'Primary tool to assess heart structure, function, and ejection fraction.', whatToExpect: 'Non-invasive ultrasound of the heart; takes 30-45 minutes.' },
          { test: 'BNP/NT-proBNP Blood Test', purpose: 'Biomarker that indicates heart failure severity and guides treatment.', whatToExpect: 'Simple blood draw; results help monitor disease progression.' },
          { test: 'Cardiac MRI', purpose: 'Detailed imaging to identify causes like scarring, inflammation, or infiltration.', whatToExpect: 'Lie still in MRI machine for 45-60 minutes; may require contrast.' }
        ],
        medicalTreatments: [
          { name: 'Sacubitril/Valsartan (Entresto)', type: 'medication', description: 'ARNI that reduces hospitalizations and improves survival in HFrEF.', effectiveness: 'high' },
          { name: 'Beta-blockers (Carvedilol, Bisoprolol)', type: 'medication', description: 'Improve heart function and reduce mortality in heart failure.', effectiveness: 'high' },
          { name: 'SGLT2 Inhibitors (Dapagliflozin, Empagliflozin)', type: 'medication', description: 'Newer drugs that reduce hospitalizations in both HFrEF and HFpEF.', effectiveness: 'high' },
          { name: 'Diuretics (Furosemide)', type: 'medication', description: 'Remove excess fluid to relieve congestion symptoms.', effectiveness: 'moderate' },
          { name: 'Spironolactone/Eplerenone', type: 'medication', description: 'MRA that improves survival and reduces hospitalizations.', effectiveness: 'high' }
        ],
        surgicalOptions: [
          { name: 'ICD (Implantable Cardioverter-Defibrillator)', description: 'Device that monitors heart rhythm and delivers shocks to prevent sudden death.', successRate: 'Reduces sudden cardiac death risk by 30-50%.' },
          { name: 'CRT (Cardiac Resynchronization Therapy)', description: 'Pacemaker that coordinates heart chamber contractions for better pumping.', successRate: 'Improves symptoms in 70% of eligible patients.' },
          { name: 'LVAD (Left Ventricular Assist Device)', description: 'Mechanical pump for end-stage heart failure as bridge to transplant or destination therapy.', successRate: '1-year survival exceeding 80%.' }
        ],
        hospitalCriteria: ['Advanced heart failure program', 'Device implantation capability', 'Heart transplant program or referral network', 'Cardiac rehabilitation', '24/7 emergency cardiac care', 'NABH/JCI accreditation'],
        keyStats: { icdCode: 'I50', severity: 'moderate-severe', bodySystem: 'Heart & Cardiovascular', prevalence: '64 million people worldwide', demographics: 'Increases with age, more common after 65' },
        specialistType: 'Cardiologist',
        metaTitle: 'Heart Failure Treatment & Management',
        metaDescription: 'Learn about heart failure symptoms, diagnosis, medications, and device therapies. Find specialized heart failure cardiologists.',
        keywords: ['heart failure', 'heart failure treatment', 'ejection fraction', 'cardiologist', 'HFrEF', 'HFpEF'],
        wordCount: 1400,
      }
    },
    {
      slug: 'atrial-fibrillation',
      content: {
        h1Title: 'Atrial Fibrillation (AFib): Diagnosis, Treatment & Stroke Prevention',
        heroOverview: 'Atrial fibrillation is the most common heart rhythm disorder, affecting millions worldwide. It increases stroke risk 5-fold but is highly manageable with proper treatment. At aihealz, we connect you with electrophysiologists and cardiologists who specialize in rhythm management and stroke prevention.',
        definition: 'Atrial fibrillation (AFib) is an irregular, often rapid heart rhythm originating in the upper chambers (atria) of the heart. Instead of contracting in a coordinated manner, the atria quiver chaotically, leading to inefficient blood flow. This can cause blood to pool and form clots, significantly increasing the risk of stroke. AFib can be paroxysmal (intermittent), persistent, or permanent.',
        diagnosisOverview: 'Diagnosis typically begins with an ECG (electrocardiogram) which shows the characteristic irregular rhythm pattern. For intermittent AFib, Holter monitors (24-48 hour) or event recorders (weeks to months) are used. Echocardiography assesses heart structure and function. Blood tests check thyroid function and electrolytes. A CHA₂DS₂-VASc score determines stroke risk.',
        treatmentOverview: 'Treatment focuses on three pillars: rate control (beta-blockers, calcium channel blockers), rhythm control (antiarrhythmic drugs, cardioversion, catheter ablation), and stroke prevention (anticoagulants like DOACs). Catheter ablation — particularly pulmonary vein isolation — has become a first-line treatment for many patients, with high success rates.',
        prognosis: 'With appropriate treatment, most AFib patients lead normal, active lives. Catheter ablation can achieve rhythm control in 70-80% of patients. Anticoagulation therapy dramatically reduces stroke risk. The key is early diagnosis and consistent treatment adherence.',
        whySeeSpecialist: 'An electrophysiologist (EP) is a cardiologist with advanced training in heart rhythm disorders. They perform catheter ablation, manage complex antiarrhythmic therapy, and use advanced mapping technology to precisely target the source of AFib.',
        primarySymptoms: ['Heart palpitations (racing, fluttering, or pounding)', 'Fatigue and reduced exercise tolerance', 'Shortness of breath', 'Dizziness or lightheadedness'],
        earlyWarningSigns: ['Occasional episodes of heart racing', 'Unexplained tiredness', 'Feeling your heart skip beats', 'Mild shortness of breath with normal activity'],
        preventionStrategies: ['Control high blood pressure', 'Maintain healthy weight', 'Limit alcohol and caffeine', 'Treat sleep apnea if present', 'Regular exercise (moderate intensity)', 'Manage stress effectively', 'Control diabetes', 'Regular cardiac screenings after age 50'],
        complications: ['Stroke (5x increased risk)', 'Heart failure from prolonged rapid rate', 'Blood clots', 'Cognitive decline over time', 'Reduced quality of life'],
        faqs: [
          { question: 'Can AFib go away on its own?', answer: 'Paroxysmal AFib (intermittent episodes) may stop on its own, but the condition tends to progress over time. Early treatment with ablation or medication can prevent progression to permanent AFib.' },
          { question: 'Do I need to take blood thinners for life?', answer: 'Anticoagulation depends on your CHA₂DS₂-VASc stroke risk score, not on whether you still have AFib episodes. Many patients need lifelong anticoagulation even after successful ablation.' },
          { question: 'What is catheter ablation?', answer: 'A minimally invasive procedure where a catheter is threaded through blood vessels to the heart. Radiofrequency energy or cryotherapy is used to create tiny scars that block abnormal electrical signals causing AFib.' },
          { question: 'Can I drink alcohol with AFib?', answer: 'Alcohol is a well-known AFib trigger. Most specialists recommend eliminating or significantly limiting alcohol intake, especially binge drinking ("holiday heart syndrome").' },
          { question: 'Is AFib dangerous?', answer: 'AFib itself is rarely immediately life-threatening, but untreated AFib significantly increases stroke risk and can lead to heart failure over time. With proper treatment, risks are well-managed.' }
        ],
        emergencySigns: ['Sudden severe chest pain', 'Stroke symptoms (face drooping, arm weakness, speech difficulty)', 'Fainting or near-fainting', 'Extremely rapid heart rate (>150 bpm) with symptoms', 'Severe shortness of breath at rest'],
        lifestyleModifications: ['Limit or eliminate alcohol', 'Reduce caffeine intake', 'Treat sleep apnea (CPAP if needed)', 'Regular moderate exercise', 'Maintain healthy weight', 'Manage stress and anxiety', 'Monitor heart rate regularly', 'Stay hydrated', 'Avoid excessive stimulants', 'Regular follow-up with cardiologist'],
        dietRecommendations: ['Heart-healthy Mediterranean diet', 'Fruits and vegetables', 'Omega-3 rich fish', 'Whole grains', 'Limit processed foods and sodium', 'Potassium-rich foods (bananas, leafy greens)', 'Adequate hydration', 'Limit or avoid alcohol'],
        diagnosticTests: [
          { test: 'ECG (Electrocardiogram)', purpose: 'First-line test to detect AFib rhythm pattern.', whatToExpect: 'Quick, painless test with electrodes on chest; results in minutes.' },
          { test: 'Holter Monitor / Event Recorder', purpose: 'Captures intermittent AFib episodes over days to weeks.', whatToExpect: 'Wear a small portable device; press button when symptoms occur.' },
          { test: 'Transesophageal Echocardiogram (TEE)', purpose: 'Check for blood clots in the heart before cardioversion or ablation.', whatToExpect: 'Ultrasound probe passed through esophagus under sedation.' }
        ],
        medicalTreatments: [
          { name: 'DOACs (Apixaban, Rivaroxaban)', type: 'medication', description: 'Modern blood thinners that significantly reduce stroke risk in AFib.', effectiveness: 'high' },
          { name: 'Beta-blockers (Metoprolol)', type: 'medication', description: 'Control heart rate during AFib episodes.', effectiveness: 'high' },
          { name: 'Flecainide / Propafenone', type: 'medication', description: 'Antiarrhythmic drugs for rhythm control in patients without structural heart disease.', effectiveness: 'moderate' },
          { name: 'Amiodarone', type: 'medication', description: 'Potent antiarrhythmic for resistant AFib; requires monitoring.', effectiveness: 'high' }
        ],
        surgicalOptions: [
          { name: 'Catheter Ablation (Pulmonary Vein Isolation)', description: 'Minimally invasive procedure to electrically isolate triggers in the pulmonary veins.', successRate: '70-80% success rate for paroxysmal AFib; may require repeat procedures.' },
          { name: 'Left Atrial Appendage Closure (Watchman)', description: 'Device implant for patients who cannot take blood thinners; seals off the main clot-forming area.', successRate: 'Over 95% implant success rate.' }
        ],
        hospitalCriteria: ['Electrophysiology (EP) lab', 'Experienced ablation team', '3D cardiac mapping technology', 'Stroke center capability', 'Cardiac monitoring unit', 'NABH/JCI accreditation'],
        keyStats: { icdCode: 'I48', severity: 'moderate', bodySystem: 'Heart & Cardiovascular', prevalence: '33+ million people worldwide', demographics: 'Increases with age; 10% prevalence in those over 80' },
        specialistType: 'Cardiologist',
        metaTitle: 'Atrial Fibrillation Treatment & Specialists',
        metaDescription: 'Learn about atrial fibrillation symptoms, ablation, blood thinners, and stroke prevention. Find top cardiologists and electrophysiologists.',
        keywords: ['atrial fibrillation', 'AFib treatment', 'catheter ablation', 'stroke prevention', 'cardiologist', 'electrophysiologist'],
        wordCount: 1500,
      }
    }
  ];

  for (const { slug, content } of missing) {
    const condition = await p.medicalCondition.findUnique({ where: { slug } });
    if (!condition) {
      console.log(`❌ Condition not found: ${slug}`);
      continue;
    }

    const existing = await p.conditionPageContent.findFirst({
      where: { conditionId: condition.id, languageCode: 'en' }
    });

    if (existing) {
      console.log(`⏭  ${slug} already has content, updating...`);
      await p.conditionPageContent.update({
        where: { id: existing.id },
        data: { ...content, status: 'published' },
      });
    } else {
      await p.conditionPageContent.create({
        data: {
          conditionId: condition.id,
          languageCode: 'en',
          ...content,
          status: 'published',
        },
      });
    }
    console.log(`✅ Created/updated: ${slug}`);
  }

  // 3. Verify
  const total = await p.conditionPageContent.count({
    where: { condition: { specialistType: 'Cardiologist' }, languageCode: 'en', status: 'published' },
  });
  console.log(`\n📊 Total published cardiology pages: ${total}`);
}

main()
  .catch(console.error)
  .finally(async () => { await p.$disconnect(); pool.end(); });
