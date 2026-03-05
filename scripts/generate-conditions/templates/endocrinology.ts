/**
 * Endocrinology Specialty Template
 *
 * Template patterns for hormonal and metabolic conditions.
 */

import type { SpecialtyTemplate } from './base-template';

export const endocrinologyTemplate: SpecialtyTemplate = {
  specialty: 'Endocrinology',
  specialistTitle: 'Endocrinologist',
  specialistTitlePlural: 'Endocrinologists',
  bodySystem: 'Endocrine System',

  commonSymptomPatterns: [
    'Unexplained weight changes',
    'Fatigue and weakness',
    'Increased thirst and urination',
    'Temperature sensitivity',
    'Hair loss or excessive hair growth',
    'Irregular menstrual periods',
    'Mood changes and depression',
    'Skin changes (dry, oily, or discolored)',
    'Tremors or shakiness',
    'Muscle weakness',
    'Changes in appetite',
    'Sleep disturbances',
    'Difficulty concentrating',
    'Bone pain or fractures',
    'Changes in heart rate',
  ],

  commonTreatmentTypes: [
    {
      type: 'medication',
      examples: [
        'Insulin (various types)',
        'Metformin',
        'Sulfonylureas (Glimepiride)',
        'Thyroid hormone replacement (Levothyroxine)',
        'Antithyroid drugs (Methimazole)',
        'Corticosteroids',
        'Growth hormone',
        'Sex hormone replacement',
        'GLP-1 agonists (Semaglutide)',
        'SGLT2 inhibitors (Empagliflozin)',
      ],
    },
    {
      type: 'procedure',
      examples: [
        'Continuous glucose monitoring',
        'Insulin pump therapy',
        'Radioactive iodine therapy',
        'Fine needle aspiration biopsy',
        'Hormone stimulation tests',
        'Bone density testing',
      ],
    },
    {
      type: 'surgery',
      examples: [
        'Thyroidectomy',
        'Parathyroidectomy',
        'Adrenalectomy',
        'Pituitary surgery',
        'Pancreatic surgery',
        'Bariatric surgery for diabetes',
      ],
    },
    {
      type: 'lifestyle',
      examples: [
        'Diabetic diet management',
        'Regular blood sugar monitoring',
        'Exercise program',
        'Weight management',
        'Stress reduction',
        'Adequate sleep',
        'Alcohol limitation',
        'Smoking cessation',
      ],
    },
  ],

  commonRiskFactors: [
    { factor: 'Family history of diabetes', category: 'genetic', description: 'Strong genetic component in type 2 diabetes', modifiable: false },
    { factor: 'Obesity', category: 'lifestyle', description: 'Major risk factor for type 2 diabetes', modifiable: true },
    { factor: 'Sedentary lifestyle', category: 'lifestyle', description: 'Increases insulin resistance', modifiable: true },
    { factor: 'Age over 45', category: 'demographic', description: 'Risk increases with age', modifiable: false },
    { factor: 'Poor diet', category: 'lifestyle', description: 'High sugar and processed food intake', modifiable: true },
    { factor: 'Autoimmune conditions', category: 'medical', description: 'Associated with thyroid disorders', modifiable: false },
    { factor: 'Pregnancy history', category: 'medical', description: 'Gestational diabetes increases future risk', modifiable: false },
    { factor: 'PCOS', category: 'medical', description: 'Associated with insulin resistance', modifiable: true },
    { factor: 'Iodine deficiency', category: 'lifestyle', description: 'Causes thyroid problems', modifiable: true },
    { factor: 'Radiation exposure', category: 'environmental', description: 'Risk factor for thyroid conditions', modifiable: true },
  ],

  commonDiagnosticTests: [
    { test: 'Blood glucose tests (fasting, HbA1c)', purpose: 'Diagnose and monitor diabetes', whatToExpect: 'Simple blood draw after fasting. Results in 1-2 days.' },
    { test: 'Thyroid function tests (TSH, T3, T4)', purpose: 'Assess thyroid function', whatToExpect: 'Blood test. Results in 1-2 days.' },
    { test: 'Oral glucose tolerance test', purpose: 'Diagnose diabetes and prediabetes', whatToExpect: 'Drink glucose solution, blood drawn at intervals over 2-3 hours.' },
    { test: 'Hormone panels', purpose: 'Measure various hormone levels', whatToExpect: 'Blood test, may need fasting or specific timing.' },
    { test: 'Thyroid ultrasound', purpose: 'Image thyroid gland', whatToExpect: 'Gel applied to neck, probe moved over area. Painless.' },
    { test: 'Bone density scan (DEXA)', purpose: 'Assess bone health', whatToExpect: 'Lie on padded table while scanner passes over. Painless.' },
    { test: 'Thyroid scan', purpose: 'Evaluate thyroid function and nodules', whatToExpect: 'Radioactive iodine given, images taken hours later.' },
    { test: 'Cortisol tests', purpose: 'Diagnose adrenal disorders', whatToExpect: 'Blood, urine, or saliva samples at specific times.' },
  ],

  faqTemplates: [
    'Can diabetes be cured?',
    'What is the difference between Type 1 and Type 2 diabetes?',
    'How often should I check my blood sugar?',
    'What are symptoms of thyroid problems?',
    'Can I live a normal life with diabetes?',
    'Is insulin safe to use?',
    'What causes hormonal imbalance?',
    'How does PCOS affect fertility?',
    'Can thyroid problems cause weight gain?',
    'What is diabetic neuropathy?',
  ],

  linkedTreatmentSlugs: [
    'diabetes-treatment',
    'thyroid-treatment',
    'insulin-pump-therapy',
    'thyroidectomy',
    'hormone-replacement-therapy',
    'continuous-glucose-monitoring',
    'bariatric-surgery',
    'pcos-treatment',
  ],

  costRanges: {
    consultation: { min: 600, max: 2500, currency: 'INR' },
    hba1c: { min: 400, max: 800, currency: 'INR' },
    thyroidPanel: { min: 500, max: 1500, currency: 'INR' },
    hormonePanel: { min: 2000, max: 5000, currency: 'INR' },
    thyroidUltrasound: { min: 800, max: 2000, currency: 'INR' },
    insulinPump: { min: 150000, max: 400000, currency: 'INR' },
    cgm: { min: 5000, max: 15000, currency: 'INR' },
    thyroidectomy: { min: 80000, max: 200000, currency: 'INR' },
  },

  emergencyIndicators: [
    'Very high blood sugar with confusion (diabetic ketoacidosis)',
    'Very low blood sugar with loss of consciousness',
    'Thyroid storm (fever, rapid heart rate, confusion)',
    'Severe dehydration with diabetes',
    'Adrenal crisis (severe weakness, low blood pressure)',
    'Myxedema coma (severe hypothyroidism)',
    'Hyperosmolar hyperglycemic state',
  ],

  lifestyleRecommendations: [
    'Monitor blood sugar regularly',
    'Follow prescribed meal plans',
    'Exercise regularly (150 min/week)',
    'Take medications as prescribed',
    'Maintain healthy weight',
    'Get adequate sleep',
    'Manage stress effectively',
    'Attend regular follow-up appointments',
    'Check feet daily (diabetes)',
    'Wear medical ID bracelet',
  ],

  dietPatterns: {
    recommended: [
      'Low glycemic index foods',
      'High-fiber vegetables',
      'Lean proteins',
      'Whole grains in moderation',
      'Healthy fats (olive oil, nuts)',
      'Adequate iodine (seafood, iodized salt)',
      'Selenium-rich foods for thyroid',
      'Consistent meal timing',
      'Portion-controlled meals',
    ],
    avoid: [
      'Sugary foods and beverages',
      'Refined carbohydrates',
      'Trans fats',
      'Excessive alcohol',
      'Processed foods high in sodium',
      'Goitrogens in excess (soy, cruciferous) if thyroid issues',
      'Skipping meals',
      'Large portions',
      'Late-night eating',
    ],
  },
};

export default endocrinologyTemplate;
