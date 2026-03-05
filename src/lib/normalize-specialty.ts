/**
 * Shared specialty normalizer — single source of truth for mapping
 * raw specialist_type values from the DB to canonical display names.
 *
 * Used by:  Homepage, Conditions page, CMS Admin Panel
 */

/* ─── Canonical Specialties with SVG paths ──────────────────────────────── */

export interface SpecialtyIconInfo {
    path: string;
    color: string;
}

export const SPECIALTY_ICON_DATA: Record<string, SpecialtyIconInfo> = {
    'Allergy & Immunology': { path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-indigo-500' },
    'Anesthesiology': { path: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'text-pink-500' },
    'Cardiology': { path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-rose-500' },
    'Cardiothoracic & Vascular Surgery': { path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-red-600' },
    'Dentistry': { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-cyan-500' },
    'Dermatology': { path: '7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', color: 'text-pink-400' },
    'Emergency Medicine': { path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-red-500' },
    'Endocrinology': { path: '19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'text-emerald-500' },
    'ENT (Ear, Nose, Throat)': { path: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'text-amber-500' },
    'Family Medicine': { path: '17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-500' },
    'Gastroenterology': { path: '19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-orange-500' },
    'General Medicine': { path: '4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-teal-500' },
    'General Surgery': { path: '14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z', color: 'text-slate-600' },
    'Genetics': { path: '9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'text-purple-500' },
    'Geriatrics': { path: '16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-gray-500' },
    'Hematology': { path: '4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-red-600' },
    'Infectious Disease': { path: '12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-lime-500' },
    'Maxillofacial & Oral Surgery': { path: '9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-cyan-600' },
    'Neonatology': { path: '16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-pink-400' },
    'Nephrology': { path: '19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-amber-600' },
    'Neurology': { path: '9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'text-violet-500' },
    'Neurosurgery': { path: '9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'text-purple-600' },
    'Nuclear Medicine': { path: '12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-yellow-500' },
    'Obstetrics & Gynecology': { path: '16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-pink-500' },
    'Occupational Medicine': { path: '19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-gray-600' },
    'Oncology': { path: '12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7', color: 'text-indigo-500' },
    'Ophthalmology': { path: '15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'text-sky-500' },
    'Orthopedics': { path: '12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-amber-500' },
    'Pain Medicine & Palliative Care': { path: '4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-slate-400' },
    'Pathology': { path: '21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'text-blue-600' },
    'Pediatrics': { path: '16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-sky-400' },
    'Physical Medicine & Rehabilitation': { path: '16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-green-500' },
    'Plastic & Reconstructive Surgery': { path: '5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'text-pink-500' },
    'Podiatry': { path: '19 14l-7 7m0 0l-7-7m7 7V3', color: 'text-amber-600' },
    'Preventive & Public Health': { path: '3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600' },
    'Psychiatry & Mental Health': { path: '9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'text-violet-400' },
    'Pulmonology': { path: '5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2', color: 'text-cyan-500' },
    'Radiology': { path: '8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-slate-500' },
    'Rheumatology': { path: '7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11', color: 'text-orange-400' },
    'Sports Medicine': { path: '16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-green-500' },
    'Tropical Medicine': { path: '3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400' },
    'Urology': { path: '19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'text-blue-400' },
};

// Legacy emoji map for backwards compatibility
export const SPECIALTY_ICON_MAP: Record<string, string> = Object.fromEntries(
    Object.keys(SPECIALTY_ICON_DATA).map(k => [k, '•'])
);

export const ALL_SPECIALTIES = Object.keys(SPECIALTY_ICON_MAP);

/* ─── Normalizer ─────────────────────────────────────────── */

export function normalizeSpecialty(spec: string | null | undefined): string {
    const s = spec?.trim() || '';
    if (!s) return 'General Medicine';

    // Cardiothoracic / Vascular Surgery (must check before Cardiology)
    if (/Cardiothorac|Vascular\s*Surg/i.test(s)) return 'Cardiothoracic & Vascular Surgery';
    // Cardiology / Cardiologist
    if (/Cardiolog/i.test(s)) return 'Cardiology';
    // Dermatology / Dermatologist
    if (/Dermatolog/i.test(s)) return 'Dermatology';
    // Neurosurgery (must check before Neurology)
    if (/Neurosurg/i.test(s)) return 'Neurosurgery';
    // Neurology / Neurologist
    if (/Neurolog/i.test(s)) return 'Neurology';
    // Gastroenterology / Gastroenterologist
    if (/Gastroenterolog/i.test(s)) return 'Gastroenterology';
    // Oncology / Oncologist
    if (/Oncolog/i.test(s)) return 'Oncology';
    // Orthopedics / Orthopedic Surgeon
    if (/Orthop[ae]?ed/i.test(s)) return 'Orthopedics';
    // Pediatrics / Pediatrician / Paediatr
    if (/P[ae]?ediatr/i.test(s)) return 'Pediatrics';
    // Psychiatry / Psychiatrist / Mental Health
    if (/Psychiatr|Mental\s*Health/i.test(s)) return 'Psychiatry & Mental Health';
    // Ophthalmology / Ophthalmologist
    if (/Ophthalmolog/i.test(s)) return 'Ophthalmology';
    // Obstetrics & Gynecology
    if (/Gynecolog|Obstetric/i.test(s)) return 'Obstetrics & Gynecology';
    // Urology / Urologist
    if (/Urolog/i.test(s)) return 'Urology';
    // Endocrinology / Endocrinologist
    if (/Endocrinolog/i.test(s)) return 'Endocrinology';
    // Pulmonology / Pulmonologist
    if (/Pulmonolog/i.test(s)) return 'Pulmonology';
    // Rheumatology / Rheumatologist
    if (/Rheumatolog/i.test(s)) return 'Rheumatology';
    // Nephrology / Nephrologist
    if (/Nephrolog/i.test(s)) return 'Nephrology';
    // Hematology / Hematologist
    if (/H[ae]?matolog/i.test(s)) return 'Hematology';
    // Dentistry / Dentist
    if (/Dentist/i.test(s)) return 'Dentistry';
    // ENT / Otolaryngology
    if (/ENT|Otolaryngol/i.test(s)) return 'ENT (Ear, Nose, Throat)';
    // Neonatology / Neonatologist
    if (/Neonatolog/i.test(s)) return 'Neonatology';
    // Genetics / Geneticist
    if (/Genetic/i.test(s)) return 'Genetics';
    // Infectious Disease
    if (/Infectious/i.test(s)) return 'Infectious Disease';
    // Emergency Medicine
    if (/Emergency/i.test(s)) return 'Emergency Medicine';
    // Sports Medicine
    if (/Sports\s*Med/i.test(s)) return 'Sports Medicine';
    // Occupational Medicine
    if (/Occupational/i.test(s)) return 'Occupational Medicine';
    // Nuclear Medicine
    if (/Nuclear/i.test(s)) return 'Nuclear Medicine';
    // Geriatrics
    if (/Geriatr/i.test(s)) return 'Geriatrics';
    // Pain Medicine / Palliative
    if (/Pain\s*Med|Palliative/i.test(s)) return 'Pain Medicine & Palliative Care';
    // Physical Medicine / Rehabilitation / Physiotherapy
    if (/Physical\s*Med|Rehab|Physiother/i.test(s)) return 'Physical Medicine & Rehabilitation';
    // Family Medicine
    if (/Family/i.test(s)) return 'Family Medicine';
    // Podiatry / Podiatrist
    if (/Podiatr/i.test(s)) return 'Podiatry';
    // Maxillofacial / Oral Surgery
    if (/Maxillofac|Oral\s*Surg/i.test(s)) return 'Maxillofacial & Oral Surgery';
    // Preventive / Public Health
    if (/Preventive|Public\s*Health/i.test(s)) return 'Preventive & Public Health';
    // Tropical Medicine
    if (/Tropical/i.test(s)) return 'Tropical Medicine';
    // Plastic & Reconstructive Surgery
    if (/Plastic|Reconstructive/i.test(s)) return 'Plastic & Reconstructive Surgery';
    // Allergy / Immunology
    if (/Allerg|Immunolog/i.test(s)) return 'Allergy & Immunology';
    // Anesthesiology / Anesthesiologist
    if (/Anesthes/i.test(s)) return 'Anesthesiology';
    // Radiology / Radiologist / Diagnostic Radiology
    if (/Radiol/i.test(s)) return 'Radiology';
    // Pathology / Pathologist / Histopath
    if (/Patholog|Histopath/i.test(s)) return 'Pathology';
    // General Surgery (catch-all surgeon that didn't match above)
    if (/Surgeon|^Surgery$/i.test(s) && !/Neuro|Cardio|Ortho|Plastic|Oral|Maxillo|Vascular/i.test(s)) return 'General Surgery';
    // General / Internal Medicine
    if (/General|Internist|Internal/i.test(s)) return 'General Medicine';

    return s;
}
