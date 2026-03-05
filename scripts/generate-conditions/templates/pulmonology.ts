/**
 * Pulmonology Specialty Template
 *
 * Template patterns for respiratory and lung conditions.
 */

import type { SpecialtyTemplate } from './base-template';

export const pulmonologyTemplate: SpecialtyTemplate = {
  specialty: 'Pulmonology',
  specialistTitle: 'Pulmonologist',
  specialistTitlePlural: 'Pulmonologists',
  bodySystem: 'Respiratory System',

  commonSymptomPatterns: [
    'Shortness of breath (dyspnea)',
    'Chronic cough',
    'Wheezing',
    'Chest tightness',
    'Coughing up blood (hemoptysis)',
    'Excessive mucus production',
    'Difficulty breathing when lying down',
    'Rapid breathing (tachypnea)',
    'Blue lips or fingertips (cyanosis)',
    'Chest pain with breathing',
    'Fatigue and weakness',
    'Night sweats',
    'Unexplained weight loss',
    'Snoring and sleep apnea symptoms',
    'Recurrent respiratory infections',
  ],

  commonTreatmentTypes: [
    {
      type: 'medication',
      examples: [
        'Bronchodilators (Salbutamol, Formoterol)',
        'Inhaled corticosteroids (Budesonide, Fluticasone)',
        'Combination inhalers (Seretide, Symbicort)',
        'Leukotriene modifiers (Montelukast)',
        'Antibiotics for infections',
        'Mucolytics (N-acetylcysteine)',
        'Oxygen therapy',
        'Antifibrotic agents (Pirfenidone)',
        'Pulmonary arterial hypertension drugs',
        'Immunosuppressants for ILD',
      ],
    },
    {
      type: 'procedure',
      examples: [
        'Bronchoscopy',
        'Thoracentesis',
        'Pulmonary function tests',
        'Sleep study (polysomnography)',
        'CPAP/BiPAP therapy',
        'Chest tube placement',
        'Pleurodesis',
        'Endobronchial ultrasound (EBUS)',
      ],
    },
    {
      type: 'surgery',
      examples: [
        'Lung transplant',
        'Lobectomy',
        'Pneumonectomy',
        'Lung volume reduction surgery',
        'Thoracotomy',
        'VATS (Video-assisted thoracoscopic surgery)',
        'Bullectomy',
      ],
    },
    {
      type: 'lifestyle',
      examples: [
        'Smoking cessation',
        'Pulmonary rehabilitation',
        'Breathing exercises',
        'Environmental modifications',
        'Weight management',
        'Vaccination (flu, pneumonia)',
        'Air quality improvements',
      ],
    },
  ],

  commonRiskFactors: [
    { factor: 'Smoking', category: 'lifestyle', description: 'Primary cause of COPD and lung cancer', modifiable: true },
    { factor: 'Air pollution exposure', category: 'environmental', description: 'Contributes to respiratory diseases', modifiable: true },
    { factor: 'Occupational dust/chemicals', category: 'environmental', description: 'Industrial lung diseases', modifiable: true },
    { factor: 'Allergies', category: 'medical', description: 'Triggers asthma and allergic conditions', modifiable: true },
    { factor: 'Family history', category: 'genetic', description: 'Genetic predisposition to lung diseases', modifiable: false },
    { factor: 'Age', category: 'demographic', description: 'Lung function naturally declines with age', modifiable: false },
    { factor: 'Obesity', category: 'lifestyle', description: 'Increases breathing difficulty', modifiable: true },
    { factor: 'Weakened immune system', category: 'medical', description: 'Higher infection risk', modifiable: true },
    { factor: 'Previous respiratory infections', category: 'medical', description: 'Can cause permanent lung damage', modifiable: false },
    { factor: 'Secondhand smoke', category: 'environmental', description: 'Passive smoking effects', modifiable: true },
  ],

  commonDiagnosticTests: [
    { test: 'Pulmonary Function Tests (PFT)', purpose: 'Measure lung capacity and airflow', whatToExpect: 'Breathe into a mouthpiece connected to spirometer. Takes 30-45 minutes.' },
    { test: 'Chest X-ray', purpose: 'Visualize lungs and detect abnormalities', whatToExpect: 'Stand against plate while images are taken. Quick and painless.' },
    { test: 'CT scan of chest', purpose: 'Detailed lung imaging', whatToExpect: 'Lie in scanner for 10-20 minutes. May need contrast.' },
    { test: 'Bronchoscopy', purpose: 'Direct visualization of airways', whatToExpect: 'Thin tube inserted through nose/mouth. Sedation provided.' },
    { test: 'Sleep study', purpose: 'Diagnose sleep apnea', whatToExpect: 'Overnight stay with monitoring equipment attached.' },
    { test: 'Arterial blood gas (ABG)', purpose: 'Measure oxygen and CO2 levels', whatToExpect: 'Blood drawn from artery. More uncomfortable than regular blood test.' },
    { test: 'Pulse oximetry', purpose: 'Measure blood oxygen saturation', whatToExpect: 'Clip placed on finger. Non-invasive and painless.' },
    { test: 'Sputum culture', purpose: 'Identify respiratory infections', whatToExpect: 'Cough sample into cup. Results in 2-5 days.' },
  ],

  faqTemplates: [
    'What is the difference between asthma and COPD?',
    'Can lung damage from smoking be reversed?',
    'How do I know if I have sleep apnea?',
    'Is tuberculosis still common?',
    'What triggers asthma attacks?',
    'Can pneumonia be prevented?',
    'How does air pollution affect lungs?',
    'What are the signs of lung cancer?',
    'Is bronchitis contagious?',
    'How effective are inhalers?',
  ],

  linkedTreatmentSlugs: [
    'pulmonary-rehabilitation',
    'bronchoscopy',
    'cpap-therapy',
    'lung-transplant',
    'oxygen-therapy',
    'asthma-treatment',
    'copd-treatment',
    'sleep-apnea-treatment',
  ],

  costRanges: {
    consultation: { min: 600, max: 2000, currency: 'INR' },
    pft: { min: 1000, max: 3000, currency: 'INR' },
    chestXray: { min: 300, max: 800, currency: 'INR' },
    ctChest: { min: 4000, max: 10000, currency: 'INR' },
    bronchoscopy: { min: 15000, max: 35000, currency: 'INR' },
    sleepStudy: { min: 8000, max: 20000, currency: 'INR' },
    lungSurgery: { min: 200000, max: 800000, currency: 'INR' },
    lungTransplant: { min: 2500000, max: 4000000, currency: 'INR' },
  },

  emergencyIndicators: [
    'Severe difficulty breathing at rest',
    'Blue lips or face',
    'Coughing up large amounts of blood',
    'Sudden severe chest pain with breathing',
    'Unable to speak in full sentences due to breathlessness',
    'Choking or airway obstruction',
    'Severe asthma attack not responding to inhaler',
    'Rapid deterioration in breathing',
  ],

  lifestyleRecommendations: [
    'Stop smoking and avoid secondhand smoke',
    'Exercise regularly as tolerated',
    'Practice breathing exercises daily',
    'Avoid air pollution and irritants',
    'Get annual flu vaccination',
    'Maintain healthy weight',
    'Use air purifiers indoors',
    'Stay hydrated',
    'Follow prescribed medication regimen',
    'Attend pulmonary rehabilitation',
  ],

  dietPatterns: {
    recommended: [
      'Lean proteins for muscle maintenance',
      'Fruits rich in vitamin C',
      'Vegetables high in antioxidants',
      'Whole grains for energy',
      'Foods high in omega-3 fatty acids',
      'Adequate hydration',
      'Small frequent meals',
      'Potassium-rich foods',
    ],
    avoid: [
      'Excessive salt (causes fluid retention)',
      'Carbonated beverages (cause bloating)',
      'Gas-producing foods',
      'Large heavy meals',
      'Excessive dairy if it increases mucus',
      'Cold foods if they trigger symptoms',
      'Processed foods with preservatives',
      'Foods that cause reflux',
    ],
  },
};

export default pulmonologyTemplate;
