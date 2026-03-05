/**
 * Oncology Specialty Template
 *
 * Template patterns for cancer and tumor conditions.
 */

import type { SpecialtyTemplate } from './base-template';

export const oncologyTemplate: SpecialtyTemplate = {
  specialty: 'Oncology',
  specialistTitle: 'Oncologist',
  specialistTitlePlural: 'Oncologists',
  bodySystem: 'Multiple Systems (Cancer Care)',

  commonSymptomPatterns: [
    'Unexplained weight loss',
    'Persistent fatigue',
    'Unusual lumps or swelling',
    'Changes in moles or skin lesions',
    'Persistent pain without clear cause',
    'Changes in bowel or bladder habits',
    'Difficulty swallowing',
    'Unexplained bleeding or bruising',
    'Persistent cough or hoarseness',
    'Night sweats',
    'Loss of appetite',
    'Fever without infection',
    'Skin changes (yellowing, darkening)',
    'Sores that do not heal',
    'Neurological changes',
  ],

  commonTreatmentTypes: [
    {
      type: 'medication',
      examples: [
        'Chemotherapy drugs',
        'Targeted therapy drugs',
        'Immunotherapy (checkpoint inhibitors)',
        'Hormone therapy',
        'Biological response modifiers',
        'Anti-nausea medications',
        'Pain management medications',
        'Growth factor injections',
        'Bisphosphonates for bone health',
        'CAR-T cell therapy',
      ],
    },
    {
      type: 'procedure',
      examples: [
        'Radiation therapy',
        'Brachytherapy',
        'Stereotactic radiosurgery',
        'Tumor ablation',
        'Embolization',
        'Photodynamic therapy',
        'Bone marrow biopsy',
        'Port placement for chemotherapy',
      ],
    },
    {
      type: 'surgery',
      examples: [
        'Tumor resection',
        'Mastectomy',
        'Prostatectomy',
        'Colectomy',
        'Lobectomy',
        'Lymph node dissection',
        'Reconstructive surgery',
        'Bone marrow transplant',
        'Debulking surgery',
      ],
    },
    {
      type: 'lifestyle',
      examples: [
        'Nutritional support',
        'Physical activity as tolerated',
        'Stress management',
        'Support groups',
        'Palliative care integration',
        'Complementary therapies',
        'Smoking cessation',
        'Rest and recovery periods',
      ],
    },
  ],

  commonRiskFactors: [
    { factor: 'Tobacco use', category: 'lifestyle', description: 'Leading cause of preventable cancers', modifiable: true },
    { factor: 'Family history of cancer', category: 'genetic', description: 'Inherited gene mutations increase risk', modifiable: false },
    { factor: 'Age', category: 'demographic', description: 'Cancer risk increases with age', modifiable: false },
    { factor: 'UV exposure', category: 'environmental', description: 'Major cause of skin cancers', modifiable: true },
    { factor: 'Obesity', category: 'lifestyle', description: 'Associated with multiple cancer types', modifiable: true },
    { factor: 'Alcohol consumption', category: 'lifestyle', description: 'Increases risk of several cancers', modifiable: true },
    { factor: 'Viral infections (HPV, HBV, HCV)', category: 'medical', description: 'Cause certain cancers', modifiable: true },
    { factor: 'Radiation exposure', category: 'environmental', description: 'Increases cancer risk', modifiable: true },
    { factor: 'Chemical carcinogens', category: 'environmental', description: 'Occupational and environmental exposures', modifiable: true },
    { factor: 'Chronic inflammation', category: 'medical', description: 'Associated with cancer development', modifiable: true },
    { factor: 'Poor diet', category: 'lifestyle', description: 'Low fruits/vegetables, processed meats', modifiable: true },
    { factor: 'Physical inactivity', category: 'lifestyle', description: 'Increases certain cancer risks', modifiable: true },
  ],

  commonDiagnosticTests: [
    { test: 'Biopsy', purpose: 'Confirm cancer diagnosis and type', whatToExpect: 'Tissue sample taken, may require local anesthesia. Results in 3-7 days.' },
    { test: 'CT scan', purpose: 'Detect tumors and staging', whatToExpect: 'Lie in scanner, contrast may be given. Takes 15-30 minutes.' },
    { test: 'MRI', purpose: 'Detailed soft tissue imaging', whatToExpect: 'Lie in tube scanner for 30-60 minutes. May need contrast.' },
    { test: 'PET scan', purpose: 'Detect cancer spread throughout body', whatToExpect: 'Radioactive tracer injected, images taken after 1 hour.' },
    { test: 'Tumor markers (blood tests)', purpose: 'Monitor cancer levels', whatToExpect: 'Simple blood draw. Results in 1-3 days.' },
    { test: 'Genetic testing', purpose: 'Identify inherited cancer genes', whatToExpect: 'Blood or saliva sample. Results in 2-4 weeks.' },
    { test: 'Bone scan', purpose: 'Detect bone metastases', whatToExpect: 'Radioactive material injected, images taken 2-3 hours later.' },
    { test: 'Mammogram/colonoscopy', purpose: 'Cancer screening', whatToExpect: 'Varies by screening type. Generally routine procedures.' },
  ],

  faqTemplates: [
    'Is cancer hereditary?',
    'What are the survival rates for this cancer?',
    'Will I lose my hair during chemotherapy?',
    'Can cancer be completely cured?',
    'What is immunotherapy?',
    'How do I manage chemotherapy side effects?',
    'What is the difference between benign and malignant tumors?',
    'How often should I get cancer screenings?',
    'Can lifestyle changes reduce cancer risk?',
    'What is palliative care?',
  ],

  linkedTreatmentSlugs: [
    'chemotherapy',
    'radiation-therapy',
    'immunotherapy',
    'cancer-surgery',
    'targeted-therapy',
    'bone-marrow-transplant',
    'hormone-therapy',
    'palliative-care',
    'reconstructive-surgery',
  ],

  costRanges: {
    consultation: { min: 1000, max: 3000, currency: 'INR' },
    biopsy: { min: 5000, max: 20000, currency: 'INR' },
    ctScan: { min: 5000, max: 15000, currency: 'INR' },
    petScan: { min: 15000, max: 35000, currency: 'INR' },
    chemotherapy: { min: 50000, max: 300000, currency: 'INR' },
    radiation: { min: 100000, max: 500000, currency: 'INR' },
    cancerSurgery: { min: 200000, max: 1500000, currency: 'INR' },
    immunotherapy: { min: 200000, max: 1000000, currency: 'INR' },
    boneMarrowTransplant: { min: 1500000, max: 4000000, currency: 'INR' },
  },

  emergencyIndicators: [
    'Severe bleeding',
    'High fever during chemotherapy (neutropenic fever)',
    'Severe pain not controlled by medication',
    'Difficulty breathing',
    'Confusion or altered consciousness',
    'Signs of blood clots (leg swelling, chest pain)',
    'Severe vomiting/diarrhea leading to dehydration',
    'Seizures',
  ],

  lifestyleRecommendations: [
    'Maintain nutrition during treatment',
    'Stay as active as possible',
    'Get adequate rest',
    'Attend all follow-up appointments',
    'Report side effects promptly',
    'Join cancer support groups',
    'Practice stress management',
    'Maintain open communication with care team',
    'Take medications as prescribed',
    'Protect against infections',
  ],

  dietPatterns: {
    recommended: [
      'High-protein foods for strength',
      'Easily digestible foods during treatment',
      'Nutrient-dense foods',
      'Small frequent meals',
      'Anti-inflammatory foods',
      'Adequate hydration',
      'Foods rich in antioxidants',
      'Ginger for nausea',
      'Bland foods if experiencing mouth sores',
    ],
    avoid: [
      'Raw or undercooked foods (infection risk)',
      'Alcohol during treatment',
      'Processed and red meats',
      'Extremely spicy foods',
      'Foods that worsen nausea',
      'Grapefruit (interferes with medications)',
      'Unpasteurized products',
      'Large meals',
      'Foods with strong odors if sensitive',
    ],
  },
};

export default oncologyTemplate;
