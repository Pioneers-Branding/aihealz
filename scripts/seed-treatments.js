/**
 * seed-treatments.ts
 * Appends treatments for missing specialties + Alternate & Integrative Medicine
 * to public/data/treatments.json
 *
 * Run: node scripts/seed-treatments.js
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'data', 'treatments.json');
const existing = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
const existingNames = new Set(existing.map(t => t.name.toLowerCase().trim()));

const NEW_TREATMENTS = [
    // ─── GERIATRICS ────────────────────────────
    ...g('Geriatrics', [
        ['Comprehensive Geriatric Assessment', 'medical'],
        ['Fall Risk Assessment & Prevention', 'medical'],
        ['Polypharmacy Review & Deprescribing', 'medical'],
        ['Cognitive Screening (MMSE/MoCA)', 'medical'],
        ['Palliative Dementia Care', 'medical'],
        ['Nutritional Supplementation for Elderly', 'medical'],
        ['Hip Fracture Surgical Repair', 'surgical'],
        ['Osteoporosis Bisphosphonate Therapy', 'medical'],
        ['Cataract Surgery in Elderly', 'surgical'],
        ['Incontinence Management', 'medical'],
        ['Calcium & Vitamin D Supplementation', 'otc'],
        ['Hearing Aid Fitting', 'medical'],
        ['Elder Mobility Exercises', 'therapy'],
        ['Caregiver Support Programs', 'therapy'],
        ['Delirium Prevention Protocols', 'medical'],
        ['Advance Care Planning', 'medical'],
        ['Sarcopenia Resistance Training', 'therapy'],
        ['Geriatric Pain Management', 'medical'],
        ['Balance Training / Tai Chi', 'therapy'],
        ['Memory Care Programs', 'therapy'],
    ]),

    // ─── PHYSICAL MEDICINE & REHABILITATION ────
    ...g('Physical Medicine & Rehabilitation', [
        ['Neurological Rehabilitation', 'therapy'],
        ['Stroke Rehabilitation Program', 'therapy'],
        ['Spinal Cord Injury Rehab', 'therapy'],
        ['Electromyography (EMG)', 'medical'],
        ['Nerve Conduction Studies', 'medical'],
        ['Prosthetic Training', 'therapy'],
        ['Occupational Therapy', 'therapy'],
        ['Speech & Language Therapy', 'therapy'],
        ['Hydrotherapy / Aqua Therapy', 'therapy'],
        ['Therapeutic Ultrasound', 'therapy'],
        ['Transcutaneous Electrical Nerve Stimulation (TENS)', 'therapy'],
        ['Manual Therapy / Joint Mobilization', 'therapy'],
        ['Gait Training', 'therapy'],
        ['Functional Capacity Evaluation', 'medical'],
        ['Orthotics & Bracing', 'medical'],
        ['Trigger Point Injection', 'medical'],
        ['Iontophoresis', 'therapy'],
        ['Vestibular Rehabilitation Therapy', 'therapy'],
        ['Work Hardening Programs', 'therapy'],
        ['Constraint-Induced Movement Therapy', 'therapy'],
    ]),

    // ─── PAIN MEDICINE / PALLIATIVE CARE ───────
    ...g('Pain Medicine & Palliative Care', [
        ['Epidural Steroid Injection', 'medical'],
        ['Nerve Block (Peripheral)', 'medical'],
        ['Spinal Cord Stimulator Implant', 'surgical'],
        ['Intrathecal Pain Pump', 'surgical'],
        ['Radiofrequency Ablation', 'medical'],
        ['Botox for Chronic Migraine', 'medical'],
        ['Opioid Management & Rotation', 'medical'],
        ['Ketamine Infusion Therapy', 'medical'],
        ['Hospice Enrollment & Coordination', 'medical'],
        ['Cancer Pain Radiation Therapy', 'medical'],
        ['Palliative Chemotherapy', 'medical'],
        ['Grief & Bereavement Counseling', 'therapy'],
        ['Symptom Management in Terminal Illness', 'medical'],
        ['Mindfulness-Based Pain Reduction', 'therapy'],
        ['Acetaminophen (Paracetamol)', 'otc'],
        ['Topical Capsaicin Cream', 'otc'],
        ['Heat / Cold Therapy for Pain', 'home_remedy'],
        ['Meditation for Pain Control', 'home_remedy'],
        ['Biofeedback for Pain', 'therapy'],
        ['Transcranial Magnetic Stimulation for Pain', 'therapy'],
    ]),

    // ─── FAMILY MEDICINE ──────────────────────
    ...g('Family Medicine', [
        ['Annual Physical Examination', 'medical'],
        ['Well-Woman / Well-Man Exam', 'medical'],
        ['Pediatric Wellness Check', 'medical'],
        ['Hypertension Management', 'medical'],
        ['Diabetes Screening (A1C)', 'medical'],
        ['Cholesterol Management', 'medical'],
        ['Immunization Administration', 'medical'],
        ['Minor Wound Suturing', 'surgical'],
        ['Skin Biopsy (Punch/Shave)', 'surgical'],
        ['Smoking Cessation Program (NRT)', 'medical'],
        ['Obesity Weight Management', 'medical'],
        ['Depression Screening (PHQ-9)', 'medical'],
        ['Travel Vaccination Counseling', 'medical'],
        ['Prenatal Care Coordination', 'medical'],
        ['Sports Physical Clearance', 'medical'],
        ['Allergy Skin Prick Testing', 'medical'],
        ['Joint Aspiration', 'medical'],
        ['Over-the-Counter Cough Suppressant', 'otc'],
        ['Honey & Lemon for Sore Throat', 'home_remedy'],
        ['STI Screening Panel', 'medical'],
    ]),

    // ─── NEUROSURGERY ─────────────────────────
    ...g('Neurosurgery', [
        ['Craniotomy for Tumor', 'surgical'],
        ['Endoscopic Brain Surgery', 'surgical'],
        ['Cerebral Aneurysm Clipping', 'surgical'],
        ['Aneurysm Coiling (Endovascular)', 'surgical'],
        ['VP Shunt Placement', 'surgical'],
        ['Deep Brain Stimulation (DBS)', 'surgical'],
        ['Spinal Fusion Surgery', 'surgical'],
        ['Microdiscectomy', 'surgical'],
        ['Laminectomy', 'surgical'],
        ['Stereotactic Radiosurgery (Gamma Knife)', 'surgical'],
        ['Awake Craniotomy', 'surgical'],
        ['Subdural Hematoma Evacuation', 'surgical'],
        ['Epidural Hematoma Drainage', 'surgical'],
        ['Chiari Decompression Surgery', 'surgical'],
        ['Carpal Tunnel Release', 'surgical'],
        ['Peripheral Nerve Repair', 'surgical'],
        ['Skull Base Surgery', 'surgical'],
        ['Epilepsy Surgery (Lobectomy)', 'surgical'],
        ['Cortical Mapping', 'medical'],
        ['Intracranial Pressure Monitoring', 'medical'],
    ]),

    // ─── CARDIOTHORACIC & VASCULAR SURGERY ────
    ...g('Cardiothoracic & Vascular Surgery', [
        ['Coronary Artery Bypass Graft (CABG)', 'surgical'],
        ['Heart Valve Repair / Replacement', 'surgical'],
        ['TAVR (Transcatheter Aortic Valve)', 'surgical'],
        ['Aortic Aneurysm Open Repair', 'surgical'],
        ['EVAR (Endovascular Aneurysm Repair)', 'surgical'],
        ['Carotid Endarterectomy', 'surgical'],
        ['Peripheral Arterial Bypass', 'surgical'],
        ['Thoracotomy', 'surgical'],
        ['VATS (Video-Assisted Thoracic Surgery)', 'surgical'],
        ['Lobectomy for Lung Cancer', 'surgical'],
        ['Heart Transplantation', 'surgical'],
        ['LVAD Implantation', 'surgical'],
        ['Pericardiocentesis', 'surgical'],
        ['ASD / VSD Closure', 'surgical'],
        ['Varicose Vein Stripping / Ablation', 'surgical'],
        ['Thrombectomy', 'surgical'],
        ['ECMO Support', 'medical'],
        ['Maze Procedure for AFib', 'surgical'],
        ['Stent Grafting', 'surgical'],
        ['Lung Transplantation', 'surgical'],
    ]),

    // ─── MAXILLOFACIAL & ORAL SURGERY ─────────
    ...g('Maxillofacial & Oral Surgery', [
        ['Wisdom Tooth Extraction', 'surgical'],
        ['Orthognathic (Jaw) Surgery', 'surgical'],
        ['TMJ Arthroscopy', 'surgical'],
        ['Cleft Lip & Palate Repair', 'surgical'],
        ['Dental Implant Placement', 'surgical'],
        ['Bone Grafting (Jaw)', 'surgical'],
        ['Incision & Drainage of Dental Abscess', 'surgical'],
        ['Jaw Fracture ORIF', 'surgical'],
        ['Le Fort Osteotomy', 'surgical'],
        ['Salivary Gland Excision', 'surgical'],
        ['Root Canal Therapy', 'surgical'],
        ['Gingivectomy', 'surgical'],
        ['Maxillary Sinus Lift', 'surgical'],
        ['TMJ Splint Therapy', 'medical'],
        ['Fluoride Treatment', 'medical'],
        ['Oral Cancer Biopsy', 'surgical'],
        ['Custom Night Guard', 'medical'],
        ['Chlorhexidine Mouthwash', 'otc'],
        ['Clove Oil for Toothache', 'home_remedy'],
        ['Saline Rinse for Oral Ulcers', 'home_remedy'],
    ]),

    // ─── SPORTS MEDICINE ──────────────────────
    ...g('Sports Medicine', [
        ['ACL Reconstruction', 'surgical'],
        ['Meniscus Repair / Meniscectomy', 'surgical'],
        ['PRP (Platelet-Rich Plasma) Injection', 'medical'],
        ['Cortisone Injection', 'medical'],
        ['Arthroscopic Shoulder Surgery', 'surgical'],
        ['Rotator Cuff Repair', 'surgical'],
        ['Tommy John Surgery (UCL)', 'surgical'],
        ['Sports Concussion Protocol', 'medical'],
        ['Achilles Tendon Repair', 'surgical'],
        ['Stress Fracture Immobilization', 'medical'],
        ['Return-to-Play Assessment', 'medical'],
        ['Kinesio Taping', 'therapy'],
        ['Cryotherapy', 'therapy'],
        ['Sports Massage', 'therapy'],
        ['RICE Protocol (Rest Ice Compression Elevation)', 'home_remedy'],
        ['Athletic Performance Testing', 'medical'],
        ['Exercise Prescription', 'therapy'],
        ['Biomechanical Analysis / Gait Study', 'medical'],
        ['Extracorporeal Shockwave Therapy', 'therapy'],
        ['Anti-inflammatory Gel (Diclofenac)', 'otc'],
    ]),

    // ─── OCCUPATIONAL MEDICINE ────────────────
    ...g('Occupational Medicine', [
        ['Pre-Employment Health Screening', 'medical'],
        ['Hearing Conservation Program', 'medical'],
        ['Respiratory Fit Testing', 'medical'],
        ['Lead Level Monitoring', 'medical'],
        ['Ergonomic Workplace Assessment', 'medical'],
        ['Work Capacity Evaluation', 'medical'],
        ['Disability Evaluation', 'medical'],
        ['Drug & Alcohol Testing', 'medical'],
        ['Occupational Asthma Treatment', 'medical'],
        ['Silicosis Management', 'medical'],
        ['Burn Treatment (Occupational)', 'medical'],
        ['Repetitive Strain Injury Treatment', 'therapy'],
        ['Return-to-Work Program', 'therapy'],
        ['Noise-Induced Hearing Loss Prevention', 'medical'],
        ['Workplace Stress Management', 'therapy'],
        ['Personal Protective Equipment (PPE) Training', 'medical'],
        ['Vaccination for Healthcare Workers', 'medical'],
        ['Chelation Therapy (Heavy Metals)', 'medical'],
        ['Shift Work Sleep Hygiene', 'home_remedy'],
        ['Anti-vibration Gloves', 'otc'],
    ]),

    // ─── RADIOLOGY / INTERVENTIONAL RADIOLOGY ─
    ...g('Radiology', [
        ['CT Scan (Computed Tomography)', 'medical'],
        ['MRI (Magnetic Resonance Imaging)', 'medical'],
        ['X-Ray (Radiography)', 'medical'],
        ['Ultrasound (Sonography)', 'medical'],
        ['Mammography', 'medical'],
        ['Fluoroscopy-Guided Procedures', 'medical'],
        ['CT-Guided Biopsy', 'surgical'],
        ['Angiography / Angioplasty', 'surgical'],
        ['Uterine Fibroid Embolization', 'surgical'],
        ['Hepatic Chemoembolization (TACE)', 'surgical'],
        ['Vertebroplasty / Kyphoplasty', 'surgical'],
        ['IVC Filter Placement', 'surgical'],
        ['Abscess Drainage (Image-Guided)', 'surgical'],
        ['Nephrostomy Tube Placement', 'surgical'],
        ['Biliary Stent Insertion', 'surgical'],
        ['TIPS Procedure', 'surgical'],
        ['Radiofrequency Ablation (Liver/Lung)', 'surgical'],
        ['DEXA Bone Density Scan', 'medical'],
        ['PET Scan', 'medical'],
        ['Contrast-Enhanced MRA', 'medical'],
    ]),

    // ─── NUCLEAR MEDICINE ─────────────────────
    ...g('Nuclear Medicine', [
        ['Radioiodine (I-131) Therapy', 'medical'],
        ['Thyroid Scintigraphy', 'medical'],
        ['Bone Scintigraphy (Bone Scan)', 'medical'],
        ['PET-CT Imaging', 'medical'],
        ['MUGA Scan (Cardiac)', 'medical'],
        ['Myocardial Perfusion Imaging (SPECT)', 'medical'],
        ['Sentinel Lymph Node Biopsy (Nuclear)', 'medical'],
        ['Octreotide Scan', 'medical'],
        ['MIBG Scan', 'medical'],
        ['GFR Measurement (Nuclear)', 'medical'],
        ['Lung V/Q Scan', 'medical'],
        ['Hepatobiliary Iminodiacetic Acid (HIDA) Scan', 'medical'],
        ['Gallium-67 Citrate Scan', 'medical'],
        ['Yttrium-90 Microsphere Therapy', 'medical'],
        ['Lutetium-177 PSMA Therapy', 'medical'],
        ['Radium-223 for Bone Metastases', 'medical'],
        ['Tc-99m Sestamibi Parathyroid Scan', 'medical'],
        ['Gastric Emptying Study', 'medical'],
        ['CSF Leak Study (Indium-111)', 'medical'],
        ['Thyroid Uptake Test', 'medical'],
    ]),

    // ─── PATHOLOGY / LABORATORY MEDICINE ──────
    ...g('Pathology', [
        ['Histopathological Examination', 'medical'],
        ['Frozen Section Analysis', 'medical'],
        ['Fine Needle Aspiration Cytology (FNAC)', 'medical'],
        ['Immunohistochemistry (IHC)', 'medical'],
        ['Flow Cytometry', 'medical'],
        ['Molecular Pathology (PCR/FISH)', 'medical'],
        ['Complete Blood Count (CBC)', 'medical'],
        ['Liver Function Tests (LFT)', 'medical'],
        ['Renal Function Tests (RFT/KFT)', 'medical'],
        ['Tumor Marker Panel', 'medical'],
        ['Bone Marrow Aspiration & Biopsy', 'surgical'],
        ['Pap Smear Cytology', 'medical'],
        ['HER2 Testing', 'medical'],
        ['Next-Generation Sequencing (NGS)', 'medical'],
        ['Electrophoresis (Protein/Hb)', 'medical'],
        ['Coagulation Panel (PT/INR/APTT)', 'medical'],
        ['Hematopathology Review', 'medical'],
        ['Autopsy / Post-Mortem Examination', 'medical'],
        ['Peripheral Blood Smear', 'medical'],
        ['Tissue Microarray Analysis', 'medical'],
    ]),

    // ─── PLASTIC & RECONSTRUCTIVE SURGERY ─────
    ...g('Plastic & Reconstructive Surgery', [
        ['Breast Reconstruction (DIEP Flap)', 'surgical'],
        ['Rhinoplasty', 'surgical'],
        ['Abdominoplasty (Tummy Tuck)', 'surgical'],
        ['Liposuction', 'surgical'],
        ['Facelift (Rhytidectomy)', 'surgical'],
        ['Blepharoplasty (Eyelid Surgery)', 'surgical'],
        ['Burn Reconstruction', 'surgical'],
        ['Skin Graft Surgery', 'surgical'],
        ['Tissue Expansion', 'surgical'],
        ['Hand Surgery / Tendon Repair', 'surgical'],
        ['Microsurgical Free Flap', 'surgical'],
        ['Keloid / Scar Revision', 'surgical'],
        ['Otoplasty (Ear Pinning)', 'surgical'],
        ['Craniofacial Surgery', 'surgical'],
        ['Gynecomastia Surgery', 'surgical'],
        ['Botox & Dermal Fillers', 'medical'],
        ['Laser Skin Resurfacing', 'medical'],
        ['Chemical Peel', 'medical'],
        ['Hair Transplantation (FUE/FUT)', 'surgical'],
        ['Fat Grafting / Lipofilling', 'surgical'],
    ]),

    // ═══════════════════════════════════════════════
    // ALTERNATE & INTEGRATIVE MEDICINE
    // ═══════════════════════════════════════════════

    // ─── AYURVEDA ─────────────────────────────
    ...g('Ayurveda', [
        ['Panchakarma Therapy', 'therapy'], ['Abhyanga (Oil Massage)', 'therapy'],
        ['Shirodhara', 'therapy'], ['Nasya (Nasal Therapy)', 'therapy'],
        ['Basti (Ayurvedic Enema)', 'therapy'], ['Virechana (Purgation)', 'therapy'],
        ['Vamana (Emesis Therapy)', 'therapy'], ['Raktamokshana (Bloodletting)', 'therapy'],
        ['Ayurvedic Herbal Medicines', 'medical'], ['Rasayana (Rejuvenation Therapy)', 'therapy'],
        ['Dinacharya (Daily Routine Optimization)', 'therapy'], ['Prakriti Assessment', 'medical'],
        ['Ashwagandha Supplementation', 'otc'], ['Triphala for Digestion', 'otc'],
        ['Turmeric (Curcumin) Therapy', 'otc'],
    ], 'Alternate & Integrative Medicine'),

    // ─── HOMEOPATHY ───────────────────────────
    ...g('Homeopathy', [
        ['Constitutional Homeopathic Treatment', 'medical'], ['Acute Remedy Prescription', 'medical'],
        ['Miasmatic Treatment', 'medical'], ['Homeopathic Allergy Desensitization', 'medical'],
        ['Homeopathic Immune Support', 'medical'], ['Tissue Salt Therapy', 'otc'],
        ['Arnica for Bruising & Trauma', 'otc'], ['Oscillococcinum for Flu', 'otc'],
        ['Nux Vomica for Digestive Issues', 'otc'], ['Belladonna for Fever', 'otc'],
        ['Ignatia for Grief & Emotional Distress', 'otc'], ['Cantharis for UTI', 'otc'],
        ['Rhus Tox for Joint Pain', 'otc'], ['Mother Tincture Therapy', 'medical'],
        ['Combination Remedies', 'otc'],
    ], 'Alternate & Integrative Medicine'),

    // ─── UNANI ────────────────────────────────
    ...g('Unani', [
        ['Ilaj bit Tadbeer (Regimental Therapy)', 'therapy'], ['Ilaj bil Ghiza (Diet Therapy)', 'therapy'],
        ['Ilaj bid Dawa (Pharmacotherapy)', 'medical'], ['Hijama (Cupping Therapy)', 'therapy'],
        ['Dalak (Massage)', 'therapy'], ['Hammam (Turkish Bath Therapy)', 'therapy'],
        ['Idrar-e-Baul (Diuresis Therapy)', 'medical'], ['Ishal (Purgation)', 'therapy'],
        ['Fasd (Venesection)', 'therapy'], ['Unani Pharmacopeia Medicines', 'medical'],
        ['Temperament Assessment (Mizaj)', 'medical'], ['Mufarrihat (Exhilarants)', 'medical'],
        ['Hab-e-Seer (Garlic Pills)', 'otc'], ['Khamira Gaozaban', 'otc'],
        ['Arq Gulab (Rose Water Therapy)', 'otc'],
    ], 'Alternate & Integrative Medicine'),

    // ─── SIDDHA ───────────────────────────────
    ...g('Siddha', [
        ['Varmam Therapy (Pressure Points)', 'therapy'], ['Pattru (Poultice Application)', 'therapy'],
        ['Ottradam (Fomentation)', 'therapy'], ['Thokkanam (Therapeutic Massage)', 'therapy'],
        ['Vasti (Siddha Enema)', 'therapy'], ['Siddha Herbal Preparations', 'medical'],
        ['Chenduram (Calcined Metals)', 'medical'], ['Parpam (Herbo-mineral)', 'medical'],
        ['Kuzhi (Medicated Pit Therapy)', 'therapy'], ['Nadi Pariksha (Pulse Diagnosis)', 'medical'],
        ['Agasthiyar Kuzhambu', 'medical'], ['Mega Sanjeevi', 'medical'],
        ['Nilavembu Kudineer', 'otc'], ['Kabasura Kudineer', 'otc'],
        ['Thirikadugu Chooranam', 'otc'],
    ], 'Alternate & Integrative Medicine'),

    // ─── YOGA & NATUROPATHY ───────────────────
    ...g('Yoga & Naturopathy', [
        ['Therapeutic Yoga (Asana Therapy)', 'therapy'], ['Pranayama (Breathing Exercises)', 'therapy'],
        ['Yoga Nidra (Guided Relaxation)', 'therapy'], ['Kriya Yoga (Cleansing)', 'therapy'],
        ['Hydrotherapy (Naturopathic)', 'therapy'], ['Mud Therapy', 'therapy'],
        ['Fasting Therapy', 'therapy'], ['Sun Therapy (Heliotherapy)', 'therapy'],
        ['Chromotherapy (Color Therapy)', 'therapy'], ['Magnet Therapy', 'therapy'],
        ['Diet Therapy (Naturopathic)', 'therapy'], ['Hot & Cold Hip Bath', 'therapy'],
        ['Steam Bath / Sauna', 'therapy'], ['Enema (Naturopathic)', 'therapy'],
        ['Acupressure Yoga Combination', 'therapy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── TRADITIONAL CHINESE MEDICINE ─────────
    ...g('Traditional Chinese Medicine', [
        ['Acupuncture (TCM)', 'therapy'], ['Chinese Herbal Medicine Prescription', 'medical'],
        ['Moxibustion', 'therapy'], ['Tui Na (Chinese Massage)', 'therapy'],
        ['Cupping Therapy (TCM)', 'therapy'], ['Gua Sha', 'therapy'],
        ['Qi Gong Therapy', 'therapy'], ['Tai Chi for Health', 'therapy'],
        ['Auricular Acupuncture', 'therapy'], ['Electroacupuncture', 'therapy'],
        ['Tongue & Pulse Diagnosis', 'medical'], ['Chinese Dietary Therapy', 'therapy'],
        ['Herbal Decoctions', 'medical'], ['Patent Chinese Medicine', 'otc'],
        ['Five Element Balancing', 'therapy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── ACUPUNCTURE ──────────────────────────
    ...g('Acupuncture', [
        ['Body Acupuncture', 'therapy'], ['Auricular (Ear) Acupuncture', 'therapy'],
        ['Scalp Acupuncture', 'therapy'], ['Electroacupuncture', 'therapy'],
        ['Laser Acupuncture', 'therapy'], ['Dry Needling', 'therapy'],
        ['Acupuncture for Chronic Pain', 'therapy'], ['Acupuncture for Fertility', 'therapy'],
        ['Acupuncture for Migraine', 'therapy'], ['Acupuncture for Nausea (Chemotherapy)', 'therapy'],
        ['Acupuncture for Smoking Cessation', 'therapy'], ['Cosmetic Acupuncture', 'therapy'],
        ['Battlefield Acupuncture', 'therapy'], ['Korean Hand Acupuncture', 'therapy'],
        ['Japanese Meridian Therapy', 'therapy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── CHIROPRACTIC & OSTEOPATHY ────────────
    ...g('Chiropractic & Osteopathy', [
        ['Spinal Manipulation / Adjustment', 'therapy'], ['Cervical Manipulation', 'therapy'],
        ['Lumbar Mobilization', 'therapy'], ['Craniosacral Therapy', 'therapy'],
        ['Myofascial Release', 'therapy'], ['Sacroiliac Joint Adjustment', 'therapy'],
        ['Osteopathic Manipulative Treatment (OMT)', 'therapy'], ['Activator Method', 'therapy'],
        ['Drop Table Technique', 'therapy'], ['Flexion-Distraction Technique', 'therapy'],
        ['Extremity Manipulation', 'therapy'], ['Postural Correction Program', 'therapy'],
        ['Spinal Decompression Therapy', 'therapy'], ['Instrument-Assisted Soft Tissue Mobilization', 'therapy'],
        ['Visceral Manipulation', 'therapy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── MASSAGE THERAPY ──────────────────────
    ...g('Massage Therapy', [
        ['Swedish Massage', 'therapy'], ['Deep Tissue Massage', 'therapy'],
        ['Sports Massage', 'therapy'], ['Trigger Point Therapy', 'therapy'],
        ['Hot Stone Massage', 'therapy'], ['Aromatherapy Massage', 'therapy'],
        ['Lymphatic Drainage Massage', 'therapy'], ['Prenatal Massage', 'therapy'],
        ['Thai Massage', 'therapy'], ['Shiatsu', 'therapy'],
        ['Myofascial Release Massage', 'therapy'], ['Pediatric Massage', 'therapy'],
        ['Geriatric Massage', 'therapy'], ['Neuromuscular Massage Therapy', 'therapy'],
        ['Chair Massage', 'therapy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── REFLEXOLOGY ──────────────────────────
    ...g('Reflexology', [
        ['Foot Reflexology', 'therapy'], ['Hand Reflexology', 'therapy'],
        ['Ear Reflexology', 'therapy'], ['Meridian Reflexology', 'therapy'],
        ['Reflexology for Headache Relief', 'therapy'], ['Reflexology for Digestive Health', 'therapy'],
        ['Reflexology for Stress Reduction', 'therapy'], ['Reflexology for Sleep Improvement', 'therapy'],
        ['Reflexology for Fertility Support', 'therapy'], ['Vertical Reflex Therapy (VRT)', 'therapy'],
        ['Maternity Reflexology', 'therapy'], ['Pediatric Reflexology', 'therapy'],
        ['Precision Reflexology', 'therapy'], ['Zone Therapy', 'therapy'],
        ['Facial Reflexology (Dien Chan)', 'therapy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── REIKI & ENERGY HEALING ───────────────
    ...g('Reiki & Energy Healing', [
        ['Usui Reiki', 'therapy'], ['Karuna Reiki', 'therapy'],
        ['Distance Reiki Healing', 'therapy'], ['Chakra Balancing', 'therapy'],
        ['Pranic Healing', 'therapy'], ['Therapeutic Touch', 'therapy'],
        ['Crystal Healing', 'therapy'], ['Aura Cleansing', 'therapy'],
        ['Sound Healing (Tibetan Bowls)', 'therapy'], ['Biofield Energy Therapy', 'therapy'],
        ['Polarity Therapy', 'therapy'], ['Quantum Touch Healing', 'therapy'],
        ['Healing Touch Certification Sessions', 'therapy'], ['Attunement Sessions', 'therapy'],
        ['Self-Reiki Practice', 'home_remedy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── MIND–BODY THERAPIES ──────────────────
    ...g('Mind-Body Therapies', [
        ['Mindfulness-Based Stress Reduction (MBSR)', 'therapy'], ['Guided Imagery', 'therapy'],
        ['Progressive Muscle Relaxation', 'therapy'], ['Biofeedback Therapy', 'therapy'],
        ['Cognitive Behavioral Therapy (CBT-based)', 'therapy'], ['Hypnotherapy', 'therapy'],
        ['Art Therapy', 'therapy'], ['Music Therapy', 'therapy'],
        ['Dance / Movement Therapy', 'therapy'], ['Journaling for Mental Health', 'home_remedy'],
        ['EFT (Emotional Freedom Technique)', 'therapy'], ['EMDR-Informed Techniques', 'therapy'],
        ['Breathwork (Holotropic/Wim Hof)', 'therapy'], ['Body Scan Meditation', 'home_remedy'],
        ['Laughter Therapy', 'therapy'],
    ], 'Alternate & Integrative Medicine'),

    // ─── HERBAL & NUTRACEUTICAL THERAPIES ─────
    ...g('Herbal & Nutraceutical Therapies', [
        ['Turmeric / Curcumin Supplementation', 'otc'], ['Ginger Extract for Nausea', 'otc'],
        ['Omega-3 Fatty Acid Supplementation', 'otc'], ['Probiotics for Gut Health', 'otc'],
        ['Vitamin D3 Supplementation', 'otc'], ['Echinacea for Immune Support', 'otc'],
        ['St. John\'s Wort for Mild Depression', 'otc'], ['Valerian Root for Sleep', 'otc'],
        ['Milk Thistle for Liver Health', 'otc'], ['Saw Palmetto for Prostate', 'otc'],
        ['Glucosamine & Chondroitin for Joints', 'otc'], ['Elderberry Syrup for Cold/Flu', 'otc'],
        ['CoQ10 for Heart Health', 'otc'], ['Melatonin for Jet Lag / Sleep', 'otc'],
        ['Magnesium Supplementation', 'otc'],
    ], 'Alternate & Integrative Medicine'),
];

function g(specialty, items, group) {
    return items.map(([name, type]) => ({
        name,
        type,
        specialty,
        ...(group ? { group } : {}),
    }));
}

// Filter out duplicates
const toAdd = NEW_TREATMENTS.filter(t => !existingNames.has(t.name.toLowerCase().trim()));

console.log(`  Existing treatments: ${existing.length}`);
console.log(`  New treatments to add: ${toAdd.length} (skipped ${NEW_TREATMENTS.length - toAdd.length} duplicates)`);

const merged = [...existing, ...toAdd];
fs.writeFileSync(FILE, JSON.stringify(merged, null, 2));

console.log(`  ✅ Total treatments now: ${merged.length}`);
console.log('  🎉 Done!');
