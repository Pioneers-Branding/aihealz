/**
 * Generate comprehensive treatments data with:
 * - Cost estimates by country
 * - New categories: drug, injection, prescription
 * - Populated across all specialties
 */

import * as fs from 'fs';
import * as path from 'path';

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
}

interface Treatment {
    name: string;
    type: 'medical' | 'surgical' | 'otc' | 'home_remedy' | 'therapy' | 'drug' | 'injection' | 'prescription';
    specialty: string;
    description?: string;
    costs?: {
        usa: TreatmentCost;
        uk: TreatmentCost;
        india: TreatmentCost;
        thailand: TreatmentCost;
        mexico: TreatmentCost;
        turkey: TreatmentCost;
        uae: TreatmentCost;
    };
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
}

// Cost multipliers relative to USA (1.0)
const COST_MULTIPLIERS: Record<string, number> = {
    usa: 1.0,
    uk: 0.75,
    india: 0.08,
    thailand: 0.15,
    mexico: 0.25,
    turkey: 0.20,
    uae: 0.45,
};

const CURRENCIES: Record<string, string> = {
    usa: 'USD',
    uk: 'GBP',
    india: 'INR',
    thailand: 'THB',
    mexico: 'MXN',
    turkey: 'TRY',
    uae: 'AED',
};

// Exchange rates to local currency (approx)
const EXCHANGE_RATES: Record<string, number> = {
    usa: 1,
    uk: 0.79,
    india: 83,
    thailand: 35,
    mexico: 17,
    turkey: 32,
    uae: 3.67,
};

function generateCosts(baseUsdPrice: number): Treatment['costs'] {
    const costs: Record<string, TreatmentCost> = {};

    for (const [country, multiplier] of Object.entries(COST_MULTIPLIERS)) {
        const usdPrice = Math.round(baseUsdPrice * multiplier);
        const localPrice = Math.round(usdPrice * EXCHANGE_RATES[country]);
        const variance = 0.2; // 20% variance for range

        costs[country] = {
            usd: usdPrice,
            currency: CURRENCIES[country],
            range: [
                Math.round(localPrice * (1 - variance)),
                Math.round(localPrice * (1 + variance))
            ] as [number, number]
        };
    }

    return costs as Treatment['costs'];
}

// ═══════════════════════════════════════════════════════════════════════════
// DRUGS DATABASE - Common pharmaceuticals by specialty
// ═══════════════════════════════════════════════════════════════════════════

const DRUGS_BY_SPECIALTY: Record<string, { name: string; brands: string[]; basePrice: number; generic: boolean }[]> = {
    'Cardiologist': [
        { name: 'Atorvastatin', brands: ['Lipitor', 'Atorva'], basePrice: 45, generic: true },
        { name: 'Lisinopril', brands: ['Zestril', 'Prinivil'], basePrice: 25, generic: true },
        { name: 'Metoprolol', brands: ['Lopressor', 'Toprol-XL'], basePrice: 30, generic: true },
        { name: 'Amlodipine', brands: ['Norvasc', 'Amlong'], basePrice: 28, generic: true },
        { name: 'Losartan', brands: ['Cozaar', 'Losar'], basePrice: 35, generic: true },
        { name: 'Clopidogrel', brands: ['Plavix', 'Clopilet'], basePrice: 120, generic: true },
        { name: 'Warfarin', brands: ['Coumadin', 'Warf'], basePrice: 20, generic: true },
        { name: 'Rivaroxaban', brands: ['Xarelto'], basePrice: 450, generic: false },
        { name: 'Apixaban', brands: ['Eliquis'], basePrice: 480, generic: false },
        { name: 'Digoxin', brands: ['Lanoxin', 'Digox'], basePrice: 22, generic: true },
        { name: 'Furosemide', brands: ['Lasix', 'Frusenex'], basePrice: 15, generic: true },
        { name: 'Spironolactone', brands: ['Aldactone'], basePrice: 25, generic: true },
        { name: 'Nitroglycerin', brands: ['Nitrostat', 'Nitrolingual'], basePrice: 40, generic: true },
        { name: 'Isosorbide Mononitrate', brands: ['Imdur', 'Monoket'], basePrice: 35, generic: true },
        { name: 'Entresto (Sacubitril/Valsartan)', brands: ['Entresto'], basePrice: 550, generic: false },
    ],
    'Neurologist': [
        { name: 'Levetiracetam', brands: ['Keppra', 'Levera'], basePrice: 80, generic: true },
        { name: 'Gabapentin', brands: ['Neurontin', 'Gabapin'], basePrice: 45, generic: true },
        { name: 'Pregabalin', brands: ['Lyrica', 'Pregalin'], basePrice: 180, generic: true },
        { name: 'Carbamazepine', brands: ['Tegretol', 'Zen Retard'], basePrice: 35, generic: true },
        { name: 'Valproic Acid', brands: ['Depakote', 'Valparin'], basePrice: 50, generic: true },
        { name: 'Topiramate', brands: ['Topamax', 'Topamac'], basePrice: 90, generic: true },
        { name: 'Sumatriptan', brands: ['Imitrex', 'Suminat'], basePrice: 150, generic: true },
        { name: 'Rizatriptan', brands: ['Maxalt', 'Rizact'], basePrice: 180, generic: true },
        { name: 'Levodopa/Carbidopa', brands: ['Sinemet', 'Syndopa'], basePrice: 120, generic: true },
        { name: 'Pramipexole', brands: ['Mirapex', 'Pramipex'], basePrice: 200, generic: true },
        { name: 'Ropinirole', brands: ['Requip', 'Ropark'], basePrice: 180, generic: true },
        { name: 'Donepezil', brands: ['Aricept', 'Donep'], basePrice: 250, generic: true },
        { name: 'Memantine', brands: ['Namenda', 'Admenta'], basePrice: 280, generic: true },
        { name: 'Riluzole', brands: ['Rilutek'], basePrice: 1200, generic: true },
        { name: 'Erenumab', brands: ['Aimovig'], basePrice: 650, generic: false },
    ],
    'Psychiatrist': [
        { name: 'Sertraline', brands: ['Zoloft', 'Serlift'], basePrice: 35, generic: true },
        { name: 'Fluoxetine', brands: ['Prozac', 'Fludac'], basePrice: 30, generic: true },
        { name: 'Escitalopram', brands: ['Lexapro', 'Nexito'], basePrice: 40, generic: true },
        { name: 'Venlafaxine', brands: ['Effexor', 'Venla'], basePrice: 55, generic: true },
        { name: 'Duloxetine', brands: ['Cymbalta', 'Duzela'], basePrice: 120, generic: true },
        { name: 'Bupropion', brands: ['Wellbutrin', 'Bupron'], basePrice: 85, generic: true },
        { name: 'Aripiprazole', brands: ['Abilify', 'Arip MT'], basePrice: 450, generic: true },
        { name: 'Quetiapine', brands: ['Seroquel', 'Qutan'], basePrice: 180, generic: true },
        { name: 'Risperidone', brands: ['Risperdal', 'Risnia'], basePrice: 120, generic: true },
        { name: 'Olanzapine', brands: ['Zyprexa', 'Oleanz'], basePrice: 200, generic: true },
        { name: 'Lithium Carbonate', brands: ['Lithobid', 'Licab'], basePrice: 25, generic: true },
        { name: 'Lamotrigine', brands: ['Lamictal', 'Lamitor'], basePrice: 90, generic: true },
        { name: 'Clonazepam', brands: ['Klonopin', 'Rivotril'], basePrice: 35, generic: true },
        { name: 'Alprazolam', brands: ['Xanax', 'Alprax'], basePrice: 40, generic: true },
        { name: 'Methylphenidate', brands: ['Ritalin', 'Concerta'], basePrice: 180, generic: true },
    ],
    'Endocrinologist': [
        { name: 'Metformin', brands: ['Glucophage', 'Glycomet'], basePrice: 20, generic: true },
        { name: 'Glimepiride', brands: ['Amaryl', 'Glimestar'], basePrice: 25, generic: true },
        { name: 'Sitagliptin', brands: ['Januvia', 'Istavel'], basePrice: 380, generic: false },
        { name: 'Empagliflozin', brands: ['Jardiance'], basePrice: 520, generic: false },
        { name: 'Dapagliflozin', brands: ['Farxiga', 'Forxiga'], basePrice: 480, generic: false },
        { name: 'Liraglutide', brands: ['Victoza', 'Saxenda'], basePrice: 950, generic: false },
        { name: 'Semaglutide', brands: ['Ozempic', 'Wegovy'], basePrice: 1200, generic: false },
        { name: 'Levothyroxine', brands: ['Synthroid', 'Eltroxin'], basePrice: 25, generic: true },
        { name: 'Methimazole', brands: ['Tapazole', 'Thyrocab'], basePrice: 30, generic: true },
        { name: 'Propylthiouracil', brands: ['PTU'], basePrice: 45, generic: true },
        { name: 'Testosterone Cypionate', brands: ['Depo-Testosterone'], basePrice: 120, generic: true },
        { name: 'Estradiol', brands: ['Estrace', 'Progynova'], basePrice: 45, generic: true },
        { name: 'Alendronate', brands: ['Fosamax', 'Osteofos'], basePrice: 80, generic: true },
        { name: 'Denosumab', brands: ['Prolia', 'Xgeva'], basePrice: 1800, generic: false },
        { name: 'Teriparatide', brands: ['Forteo'], basePrice: 3500, generic: false },
    ],
    'Gastroenterologist': [
        { name: 'Omeprazole', brands: ['Prilosec', 'Omez'], basePrice: 25, generic: true },
        { name: 'Pantoprazole', brands: ['Protonix', 'Pan'], basePrice: 30, generic: true },
        { name: 'Esomeprazole', brands: ['Nexium', 'Nexpro'], basePrice: 180, generic: true },
        { name: 'Famotidine', brands: ['Pepcid', 'Famocid'], basePrice: 20, generic: true },
        { name: 'Mesalamine', brands: ['Asacol', 'Mesacol'], basePrice: 450, generic: true },
        { name: 'Sulfasalazine', brands: ['Azulfidine', 'Saaz'], basePrice: 80, generic: true },
        { name: 'Infliximab', brands: ['Remicade'], basePrice: 4500, generic: false },
        { name: 'Adalimumab', brands: ['Humira'], basePrice: 5800, generic: false },
        { name: 'Vedolizumab', brands: ['Entyvio'], basePrice: 6200, generic: false },
        { name: 'Lactulose', brands: ['Enulose', 'Duphalac'], basePrice: 25, generic: true },
        { name: 'Rifaximin', brands: ['Xifaxan', 'Rifagut'], basePrice: 1400, generic: false },
        { name: 'Ondansetron', brands: ['Zofran', 'Ondem'], basePrice: 45, generic: true },
        { name: 'Metoclopramide', brands: ['Reglan', 'Perinorm'], basePrice: 20, generic: true },
        { name: 'Ursodeoxycholic Acid', brands: ['Actigall', 'Udiliv'], basePrice: 180, generic: true },
        { name: 'Pancrelipase', brands: ['Creon', 'Zenpep'], basePrice: 850, generic: false },
    ],
    'Pulmonologist': [
        { name: 'Albuterol', brands: ['Ventolin', 'ProAir', 'Asthalin'], basePrice: 45, generic: true },
        { name: 'Fluticasone/Salmeterol', brands: ['Advair', 'Seroflo'], basePrice: 350, generic: true },
        { name: 'Budesonide/Formoterol', brands: ['Symbicort', 'Foracort'], basePrice: 320, generic: true },
        { name: 'Tiotropium', brands: ['Spiriva'], basePrice: 450, generic: false },
        { name: 'Montelukast', brands: ['Singulair', 'Montair'], basePrice: 120, generic: true },
        { name: 'Fluticasone', brands: ['Flovent', 'Flohale'], basePrice: 280, generic: true },
        { name: 'Prednisone', brands: ['Deltasone', 'Omnacortil'], basePrice: 15, generic: true },
        { name: 'Azithromycin', brands: ['Zithromax', 'Azithral'], basePrice: 35, generic: true },
        { name: 'Roflumilast', brands: ['Daliresp'], basePrice: 380, generic: false },
        { name: 'Pirfenidone', brands: ['Esbriet'], basePrice: 9500, generic: false },
        { name: 'Nintedanib', brands: ['Ofev'], basePrice: 9800, generic: false },
        { name: 'Omalizumab', brands: ['Xolair'], basePrice: 2800, generic: false },
        { name: 'Mepolizumab', brands: ['Nucala'], basePrice: 3200, generic: false },
        { name: 'Benralizumab', brands: ['Fasenra'], basePrice: 3500, generic: false },
        { name: 'Dupilumab', brands: ['Dupixent'], basePrice: 3700, generic: false },
    ],
    'Rheumatologist': [
        { name: 'Methotrexate', brands: ['Trexall', 'Folitrax'], basePrice: 45, generic: true },
        { name: 'Hydroxychloroquine', brands: ['Plaquenil', 'HCQS'], basePrice: 35, generic: true },
        { name: 'Sulfasalazine', brands: ['Azulfidine', 'Saaz'], basePrice: 50, generic: true },
        { name: 'Leflunomide', brands: ['Arava', 'Lefno'], basePrice: 280, generic: true },
        { name: 'Adalimumab', brands: ['Humira'], basePrice: 5800, generic: false },
        { name: 'Etanercept', brands: ['Enbrel'], basePrice: 5200, generic: false },
        { name: 'Tocilizumab', brands: ['Actemra'], basePrice: 2800, generic: false },
        { name: 'Tofacitinib', brands: ['Xeljanz'], basePrice: 4500, generic: false },
        { name: 'Baricitinib', brands: ['Olumiant'], basePrice: 2400, generic: false },
        { name: 'Upadacitinib', brands: ['Rinvoq'], basePrice: 5500, generic: false },
        { name: 'Colchicine', brands: ['Colcrys', 'Zycolchin'], basePrice: 180, generic: true },
        { name: 'Allopurinol', brands: ['Zyloprim', 'Zyloric'], basePrice: 20, generic: true },
        { name: 'Febuxostat', brands: ['Uloric', 'Febuget'], basePrice: 180, generic: true },
        { name: 'Prednisone', brands: ['Deltasone', 'Wysolone'], basePrice: 15, generic: true },
        { name: 'Secukinumab', brands: ['Cosentyx'], basePrice: 5400, generic: false },
    ],
    'Dermatologist': [
        { name: 'Tretinoin', brands: ['Retin-A', 'Retino-A'], basePrice: 80, generic: true },
        { name: 'Adapalene', brands: ['Differin', 'Deriva'], basePrice: 45, generic: true },
        { name: 'Isotretinoin', brands: ['Accutane', 'Sotret'], basePrice: 350, generic: true },
        { name: 'Clindamycin Gel', brands: ['Cleocin-T', 'Clindac A'], basePrice: 35, generic: true },
        { name: 'Benzoyl Peroxide', brands: ['Benzac', 'Persol'], basePrice: 25, generic: true },
        { name: 'Hydrocortisone Cream', brands: ['Cortaid', 'Hycort'], basePrice: 15, generic: true },
        { name: 'Betamethasone', brands: ['Diprolene', 'Betnovate'], basePrice: 25, generic: true },
        { name: 'Tacrolimus Ointment', brands: ['Protopic', 'Tacroz'], basePrice: 280, generic: true },
        { name: 'Calcipotriene', brands: ['Dovonex', 'Daivonex'], basePrice: 450, generic: true },
        { name: 'Methotrexate', brands: ['Trexall', 'Folitrax'], basePrice: 45, generic: true },
        { name: 'Apremilast', brands: ['Otezla'], basePrice: 3800, generic: false },
        { name: 'Ustekinumab', brands: ['Stelara'], basePrice: 12500, generic: false },
        { name: 'Dupilumab', brands: ['Dupixent'], basePrice: 3700, generic: false },
        { name: 'Finasteride', brands: ['Propecia', 'Finax'], basePrice: 75, generic: true },
        { name: 'Minoxidil', brands: ['Rogaine', 'Mintop'], basePrice: 45, generic: true },
    ],
    'Oncologist': [
        { name: 'Tamoxifen', brands: ['Nolvadex', 'Tamodex'], basePrice: 120, generic: true },
        { name: 'Letrozole', brands: ['Femara', 'Letero'], basePrice: 280, generic: true },
        { name: 'Anastrozole', brands: ['Arimidex', 'Armotraz'], basePrice: 320, generic: true },
        { name: 'Imatinib', brands: ['Gleevec', 'Veenat'], basePrice: 8500, generic: true },
        { name: 'Erlotinib', brands: ['Tarceva', 'Erlonat'], basePrice: 6500, generic: true },
        { name: 'Osimertinib', brands: ['Tagrisso'], basePrice: 15000, generic: false },
        { name: 'Pembrolizumab', brands: ['Keytruda'], basePrice: 18000, generic: false },
        { name: 'Nivolumab', brands: ['Opdivo'], basePrice: 16000, generic: false },
        { name: 'Trastuzumab', brands: ['Herceptin'], basePrice: 4500, generic: true },
        { name: 'Rituximab', brands: ['Rituxan', 'Mabthera'], basePrice: 5200, generic: true },
        { name: 'Bevacizumab', brands: ['Avastin'], basePrice: 4800, generic: true },
        { name: 'Capecitabine', brands: ['Xeloda', 'Capegard'], basePrice: 2200, generic: true },
        { name: 'Ondansetron', brands: ['Zofran', 'Ondem'], basePrice: 45, generic: true },
        { name: 'Filgrastim', brands: ['Neupogen', 'Grafeel'], basePrice: 1800, generic: true },
        { name: 'Lenalidomide', brands: ['Revlimid'], basePrice: 22000, generic: false },
    ],
    'Nephrologist': [
        { name: 'Lisinopril', brands: ['Zestril', 'Listril'], basePrice: 25, generic: true },
        { name: 'Losartan', brands: ['Cozaar', 'Losar'], basePrice: 35, generic: true },
        { name: 'Furosemide', brands: ['Lasix', 'Frusenex'], basePrice: 15, generic: true },
        { name: 'Torsemide', brands: ['Demadex', 'Dytor'], basePrice: 35, generic: true },
        { name: 'Spironolactone', brands: ['Aldactone'], basePrice: 25, generic: true },
        { name: 'Sodium Bicarbonate', brands: ['Bicarb'], basePrice: 10, generic: true },
        { name: 'Sevelamer', brands: ['Renvela', 'Revlamer'], basePrice: 450, generic: true },
        { name: 'Calcium Acetate', brands: ['PhosLo', 'Calcimax'], basePrice: 120, generic: true },
        { name: 'Erythropoietin (Epoetin)', brands: ['Epogen', 'Eprex'], basePrice: 850, generic: true },
        { name: 'Darbepoetin', brands: ['Aranesp'], basePrice: 1200, generic: false },
        { name: 'Calcitriol', brands: ['Rocaltrol', 'Calcijex'], basePrice: 180, generic: true },
        { name: 'Cinacalcet', brands: ['Sensipar', 'Cinacal'], basePrice: 950, generic: true },
        { name: 'Mycophenolate', brands: ['CellCept', 'Myfortic'], basePrice: 650, generic: true },
        { name: 'Tacrolimus', brands: ['Prograf', 'Pangraf'], basePrice: 850, generic: true },
        { name: 'Cyclosporine', brands: ['Sandimmune', 'Neoral'], basePrice: 750, generic: true },
    ],
    'Infectious Disease Specialist': [
        { name: 'Amoxicillin', brands: ['Amoxil', 'Mox'], basePrice: 15, generic: true },
        { name: 'Azithromycin', brands: ['Zithromax', 'Azithral'], basePrice: 35, generic: true },
        { name: 'Ciprofloxacin', brands: ['Cipro', 'Ciplox'], basePrice: 30, generic: true },
        { name: 'Levofloxacin', brands: ['Levaquin', 'Levoflox'], basePrice: 45, generic: true },
        { name: 'Doxycycline', brands: ['Vibramycin', 'Doxt'], basePrice: 25, generic: true },
        { name: 'Metronidazole', brands: ['Flagyl', 'Metrogyl'], basePrice: 15, generic: true },
        { name: 'Fluconazole', brands: ['Diflucan', 'Forcan'], basePrice: 35, generic: true },
        { name: 'Voriconazole', brands: ['Vfend', 'Vorizol'], basePrice: 850, generic: true },
        { name: 'Acyclovir', brands: ['Zovirax', 'Acivir'], basePrice: 45, generic: true },
        { name: 'Valacyclovir', brands: ['Valtrex', 'Valcivir'], basePrice: 120, generic: true },
        { name: 'Oseltamivir', brands: ['Tamiflu', 'Fluvir'], basePrice: 150, generic: true },
        { name: 'Tenofovir/Emtricitabine', brands: ['Truvada', 'Tenvir-EM'], basePrice: 1800, generic: true },
        { name: 'Dolutegravir', brands: ['Tivicay'], basePrice: 1200, generic: true },
        { name: 'Sofosbuvir/Velpatasvir', brands: ['Epclusa', 'Velpanat'], basePrice: 8500, generic: true },
        { name: 'Vancomycin', brands: ['Vancocin'], basePrice: 380, generic: true },
    ],
    'Ophthalmologist': [
        { name: 'Latanoprost', brands: ['Xalatan', 'Lataprox'], basePrice: 120, generic: true },
        { name: 'Timolol', brands: ['Timoptic', 'Iotim'], basePrice: 35, generic: true },
        { name: 'Brimonidine', brands: ['Alphagan', 'Brimosun'], basePrice: 80, generic: true },
        { name: 'Dorzolamide', brands: ['Trusopt', 'Dorzox'], basePrice: 95, generic: true },
        { name: 'Bimatoprost', brands: ['Lumigan', 'Careprost'], basePrice: 180, generic: true },
        { name: 'Prednisolone Eye Drops', brands: ['Pred Forte', 'Predmet'], basePrice: 45, generic: true },
        { name: 'Moxifloxacin Eye Drops', brands: ['Vigamox', 'Moxicip'], basePrice: 55, generic: true },
        { name: 'Olopatadine', brands: ['Patanol', 'Olopat'], basePrice: 85, generic: true },
        { name: 'Cyclosporine Eye Drops', brands: ['Restasis', 'Cyclomune'], basePrice: 450, generic: true },
        { name: 'Aflibercept', brands: ['Eylea'], basePrice: 1850, generic: false },
        { name: 'Ranibizumab', brands: ['Lucentis'], basePrice: 1650, generic: false },
        { name: 'Bevacizumab (off-label)', brands: ['Avastin'], basePrice: 450, generic: true },
        { name: 'Dexamethasone Implant', brands: ['Ozurdex'], basePrice: 1200, generic: false },
        { name: 'Ketorolac Eye Drops', brands: ['Acular', 'Ketlur'], basePrice: 65, generic: true },
        { name: 'Artificial Tears', brands: ['Systane', 'Refresh'], basePrice: 15, generic: true },
    ],
    'Urologist': [
        { name: 'Tamsulosin', brands: ['Flomax', 'Urimax'], basePrice: 45, generic: true },
        { name: 'Finasteride', brands: ['Proscar', 'Finax'], basePrice: 75, generic: true },
        { name: 'Dutasteride', brands: ['Avodart', 'Duprost'], basePrice: 120, generic: true },
        { name: 'Sildenafil', brands: ['Viagra', 'Manforce'], basePrice: 350, generic: true },
        { name: 'Tadalafil', brands: ['Cialis', 'Megalis'], basePrice: 380, generic: true },
        { name: 'Oxybutynin', brands: ['Ditropan', 'Cystran'], basePrice: 35, generic: true },
        { name: 'Tolterodine', brands: ['Detrol', 'Roliten'], basePrice: 120, generic: true },
        { name: 'Mirabegron', brands: ['Myrbetriq'], basePrice: 380, generic: false },
        { name: 'Solifenacin', brands: ['Vesicare', 'Soliten'], basePrice: 180, generic: true },
        { name: 'Desmopressin', brands: ['DDAVP', 'Minirin'], basePrice: 280, generic: true },
        { name: 'Potassium Citrate', brands: ['Urocit-K', 'K-Cit'], basePrice: 85, generic: true },
        { name: 'Allopurinol', brands: ['Zyloprim', 'Zyloric'], basePrice: 20, generic: true },
        { name: 'Enzalutamide', brands: ['Xtandi'], basePrice: 12000, generic: false },
        { name: 'Abiraterone', brands: ['Zytiga', 'Abirapro'], basePrice: 8500, generic: true },
        { name: 'Leuprolide', brands: ['Lupron', 'Eligard'], basePrice: 1200, generic: true },
    ],
    'Gynecologist': [
        { name: 'Combined Oral Contraceptives', brands: ['Yasmin', 'Diane-35', 'Novelon'], basePrice: 25, generic: true },
        { name: 'Levonorgestrel IUD', brands: ['Mirena', 'Liletta'], basePrice: 850, generic: false },
        { name: 'Medroxyprogesterone', brands: ['Provera', 'Modus'], basePrice: 35, generic: true },
        { name: 'Norethindrone', brands: ['Aygestin', 'Primolut-N'], basePrice: 45, generic: true },
        { name: 'Conjugated Estrogens', brands: ['Premarin'], basePrice: 180, generic: true },
        { name: 'Estradiol Patch', brands: ['Estraderm', 'Climara'], basePrice: 120, generic: true },
        { name: 'Clomiphene', brands: ['Clomid', 'Siphene'], basePrice: 45, generic: true },
        { name: 'Letrozole (fertility)', brands: ['Femara', 'Letero'], basePrice: 120, generic: true },
        { name: 'Gonadotropins', brands: ['Follistim', 'Gonal-F'], basePrice: 1500, generic: false },
        { name: 'Metronidazole Vaginal', brands: ['MetroGel', 'Flagyl'], basePrice: 35, generic: true },
        { name: 'Fluconazole', brands: ['Diflucan', 'Forcan'], basePrice: 35, generic: true },
        { name: 'Misoprostol', brands: ['Cytotec', 'Misoprost'], basePrice: 25, generic: true },
        { name: 'Tranexamic Acid', brands: ['Lysteda', 'Pause'], basePrice: 180, generic: true },
        { name: 'Elagolix', brands: ['Orilissa'], basePrice: 1100, generic: false },
        { name: 'GnRH Agonists', brands: ['Lupron', 'Zoladex'], basePrice: 850, generic: true },
    ],
    'Pediatrician': [
        { name: 'Amoxicillin Suspension', brands: ['Amoxil', 'Mox'], basePrice: 15, generic: true },
        { name: 'Azithromycin Suspension', brands: ['Zithromax', 'Azee'], basePrice: 25, generic: true },
        { name: 'Ibuprofen Suspension', brands: ['Advil', 'Brufen'], basePrice: 12, generic: true },
        { name: 'Acetaminophen Suspension', brands: ['Tylenol', 'Crocin'], basePrice: 10, generic: true },
        { name: 'Cetirizine Syrup', brands: ['Zyrtec', 'Cetzine'], basePrice: 15, generic: true },
        { name: 'Montelukast Chewable', brands: ['Singulair', 'Montair'], basePrice: 85, generic: true },
        { name: 'Albuterol Nebulizer', brands: ['Ventolin', 'Asthalin'], basePrice: 25, generic: true },
        { name: 'Prednisolone Syrup', brands: ['Prelone', 'Omnacortil'], basePrice: 15, generic: true },
        { name: 'Omeprazole Suspension', brands: ['Prilosec', 'Omez'], basePrice: 35, generic: true },
        { name: 'Ranitidine Syrup', brands: ['Zantac', 'Rantac'], basePrice: 12, generic: true },
        { name: 'Methylphenidate', brands: ['Ritalin', 'Concerta'], basePrice: 180, generic: true },
        { name: 'Atomoxetine', brands: ['Strattera', 'Axepta'], basePrice: 250, generic: true },
        { name: 'Iron Supplements', brands: ['Fer-In-Sol', 'Tonoferon'], basePrice: 15, generic: true },
        { name: 'Vitamin D Drops', brands: ['D-Vi-Sol', 'Uprise-D3'], basePrice: 12, generic: true },
        { name: 'Probiotics', brands: ['Culturelle', 'Vizylac'], basePrice: 25, generic: true },
    ],
    'Allergist': [
        { name: 'Cetirizine', brands: ['Zyrtec', 'Cetzine'], basePrice: 25, generic: true },
        { name: 'Loratadine', brands: ['Claritin', 'Lorfast'], basePrice: 20, generic: true },
        { name: 'Fexofenadine', brands: ['Allegra', 'Fexova'], basePrice: 35, generic: true },
        { name: 'Diphenhydramine', brands: ['Benadryl'], basePrice: 15, generic: true },
        { name: 'Montelukast', brands: ['Singulair', 'Montair'], basePrice: 120, generic: true },
        { name: 'Fluticasone Nasal', brands: ['Flonase', 'Flomist'], basePrice: 35, generic: true },
        { name: 'Mometasone Nasal', brands: ['Nasonex', 'Mometaz'], basePrice: 45, generic: true },
        { name: 'Azelastine Nasal', brands: ['Astelin', 'Azep'], basePrice: 120, generic: true },
        { name: 'Epinephrine Auto-injector', brands: ['EpiPen', 'Auvi-Q'], basePrice: 650, generic: true },
        { name: 'Omalizumab', brands: ['Xolair'], basePrice: 2800, generic: false },
        { name: 'Dupilumab', brands: ['Dupixent'], basePrice: 3700, generic: false },
        { name: 'Cromolyn Sodium', brands: ['Nasalcrom', 'Cromoglicate'], basePrice: 25, generic: true },
        { name: 'Prednisone', brands: ['Deltasone', 'Omnacortil'], basePrice: 15, generic: true },
        { name: 'Immunotherapy Extracts', brands: ['Allergen Extracts'], basePrice: 450, generic: false },
        { name: 'Sublingual Tablets (SLIT)', brands: ['Grastek', 'Ragwitek'], basePrice: 380, generic: false },
    ],
    'Hematologist': [
        { name: 'Warfarin', brands: ['Coumadin', 'Warf'], basePrice: 20, generic: true },
        { name: 'Rivaroxaban', brands: ['Xarelto'], basePrice: 450, generic: false },
        { name: 'Apixaban', brands: ['Eliquis'], basePrice: 480, generic: false },
        { name: 'Enoxaparin', brands: ['Lovenox', 'Clexane'], basePrice: 180, generic: true },
        { name: 'Heparin', brands: ['Hep-Lock'], basePrice: 45, generic: true },
        { name: 'Iron Sucrose', brands: ['Venofer', 'Orofer'], basePrice: 280, generic: true },
        { name: 'Ferric Carboxymaltose', brands: ['Injectafer', 'Ferinject'], basePrice: 850, generic: false },
        { name: 'Vitamin B12 Injection', brands: ['Cyanocobalamin'], basePrice: 25, generic: true },
        { name: 'Folic Acid', brands: ['Folvite'], basePrice: 10, generic: true },
        { name: 'Hydroxyurea', brands: ['Hydrea', 'Cytodrox'], basePrice: 180, generic: true },
        { name: 'Eltrombopag', brands: ['Promacta'], basePrice: 8500, generic: false },
        { name: 'Romiplostim', brands: ['Nplate'], basePrice: 5500, generic: false },
        { name: 'Rituximab', brands: ['Rituxan', 'Mabthera'], basePrice: 5200, generic: true },
        { name: 'Imatinib', brands: ['Gleevec', 'Veenat'], basePrice: 8500, generic: true },
        { name: 'Ruxolitinib', brands: ['Jakafi'], basePrice: 14000, generic: false },
    ],
    'ENT Specialist': [
        { name: 'Amoxicillin-Clavulanate', brands: ['Augmentin', 'Clavam'], basePrice: 35, generic: true },
        { name: 'Azithromycin', brands: ['Zithromax', 'Azithral'], basePrice: 35, generic: true },
        { name: 'Fluticasone Nasal', brands: ['Flonase', 'Flomist'], basePrice: 35, generic: true },
        { name: 'Mometasone Nasal', brands: ['Nasonex', 'Mometaz'], basePrice: 45, generic: true },
        { name: 'Oxymetazoline', brands: ['Afrin', 'Nasivion'], basePrice: 12, generic: true },
        { name: 'Pseudoephedrine', brands: ['Sudafed', 'Sinarest'], basePrice: 15, generic: true },
        { name: 'Guaifenesin', brands: ['Mucinex', 'Ambrodil'], basePrice: 18, generic: true },
        { name: 'Dextromethorphan', brands: ['Delsym', 'Benylin'], basePrice: 15, generic: true },
        { name: 'Ciprofloxacin Ear Drops', brands: ['Ciprodex', 'Ciplox'], basePrice: 85, generic: true },
        { name: 'Ofloxacin Ear Drops', brands: ['Floxin', 'Oflox'], basePrice: 35, generic: true },
        { name: 'Betahistine', brands: ['Serc', 'Vertin'], basePrice: 45, generic: true },
        { name: 'Meclizine', brands: ['Antivert', 'Stugeron'], basePrice: 25, generic: true },
        { name: 'Prednisone', brands: ['Deltasone', 'Omnacortil'], basePrice: 15, generic: true },
        { name: 'Montelukast', brands: ['Singulair', 'Montair'], basePrice: 120, generic: true },
        { name: 'Saline Nasal Spray', brands: ['Ocean', 'Nasoclear'], basePrice: 8, generic: true },
    ],
    'Orthopedic Surgeon': [
        { name: 'Ibuprofen', brands: ['Advil', 'Brufen'], basePrice: 15, generic: true },
        { name: 'Naproxen', brands: ['Aleve', 'Naprosyn'], basePrice: 20, generic: true },
        { name: 'Celecoxib', brands: ['Celebrex', 'Cobix'], basePrice: 180, generic: true },
        { name: 'Acetaminophen', brands: ['Tylenol', 'Crocin'], basePrice: 12, generic: true },
        { name: 'Tramadol', brands: ['Ultram', 'Contramal'], basePrice: 45, generic: true },
        { name: 'Cyclobenzaprine', brands: ['Flexeril', 'Flexura'], basePrice: 35, generic: true },
        { name: 'Methocarbamol', brands: ['Robaxin', 'Robinax'], basePrice: 25, generic: true },
        { name: 'Pregabalin', brands: ['Lyrica', 'Pregalin'], basePrice: 180, generic: true },
        { name: 'Gabapentin', brands: ['Neurontin', 'Gabapin'], basePrice: 45, generic: true },
        { name: 'Alendronate', brands: ['Fosamax', 'Osteofos'], basePrice: 80, generic: true },
        { name: 'Calcium + Vitamin D', brands: ['Caltrate', 'Shelcal'], basePrice: 20, generic: true },
        { name: 'Glucosamine/Chondroitin', brands: ['Osteo Bi-Flex', 'Glycodin'], basePrice: 35, generic: true },
        { name: 'Hyaluronic Acid Injection', brands: ['Synvisc', 'Hyalgan'], basePrice: 850, generic: true },
        { name: 'Methylprednisolone', brands: ['Medrol', 'Solumedrol'], basePrice: 35, generic: true },
        { name: 'Teriparatide', brands: ['Forteo'], basePrice: 3500, generic: false },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// INJECTIONS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const INJECTIONS_BY_SPECIALTY: Record<string, { name: string; basePrice: number; frequency: string }[]> = {
    'Cardiologist': [
        { name: 'Heparin Injection', basePrice: 45, frequency: 'As needed' },
        { name: 'Enoxaparin (Lovenox)', basePrice: 180, frequency: 'Daily/twice daily' },
        { name: 'Alteplase (tPA)', basePrice: 8500, frequency: 'Emergency' },
        { name: 'Dobutamine', basePrice: 250, frequency: 'IV infusion' },
        { name: 'Epinephrine', basePrice: 85, frequency: 'Emergency' },
    ],
    'Rheumatologist': [
        { name: 'Methylprednisolone Injection', basePrice: 85, frequency: 'Weekly/monthly' },
        { name: 'Triamcinolone Joint Injection', basePrice: 120, frequency: 'Every 3-6 months' },
        { name: 'Adalimumab (Humira) Injection', basePrice: 5800, frequency: 'Every 2 weeks' },
        { name: 'Etanercept (Enbrel) Injection', basePrice: 5200, frequency: 'Weekly' },
        { name: 'Golimumab (Simponi) Injection', basePrice: 4800, frequency: 'Monthly' },
    ],
    'Endocrinologist': [
        { name: 'Insulin Glargine (Lantus)', basePrice: 320, frequency: 'Daily' },
        { name: 'Insulin Lispro (Humalog)', basePrice: 280, frequency: 'With meals' },
        { name: 'Semaglutide (Ozempic)', basePrice: 1200, frequency: 'Weekly' },
        { name: 'Dulaglutide (Trulicity)', basePrice: 850, frequency: 'Weekly' },
        { name: 'Testosterone Injection', basePrice: 120, frequency: 'Every 1-2 weeks' },
    ],
    'Oncologist': [
        { name: 'Pembrolizumab (Keytruda) IV', basePrice: 18000, frequency: 'Every 3 weeks' },
        { name: 'Trastuzumab (Herceptin) IV', basePrice: 4500, frequency: 'Every 3 weeks' },
        { name: 'Rituximab (Rituxan) IV', basePrice: 5200, frequency: 'Weekly/monthly' },
        { name: 'Filgrastim (Neupogen)', basePrice: 1800, frequency: 'Daily during chemo' },
        { name: 'Pegfilgrastim (Neulasta)', basePrice: 6500, frequency: 'Once per chemo cycle' },
    ],
    'Dermatologist': [
        { name: 'Botulinum Toxin (Botox)', basePrice: 450, frequency: 'Every 3-4 months' },
        { name: 'Hyaluronic Acid Filler', basePrice: 650, frequency: 'Every 6-12 months' },
        { name: 'Kenalog Injection', basePrice: 85, frequency: 'As needed for keloids' },
        { name: 'Dupilumab (Dupixent)', basePrice: 3700, frequency: 'Every 2 weeks' },
        { name: 'Platelet-Rich Plasma (PRP)', basePrice: 750, frequency: 'Monthly for 3 sessions' },
    ],
    'Orthopedic Surgeon': [
        { name: 'Cortisone Injection', basePrice: 150, frequency: 'Every 3-6 months' },
        { name: 'Hyaluronic Acid (Synvisc)', basePrice: 850, frequency: 'Every 6 months' },
        { name: 'PRP Injection', basePrice: 850, frequency: 'Series of 3' },
        { name: 'Stem Cell Injection', basePrice: 5000, frequency: 'As needed' },
        { name: 'Toradol Injection', basePrice: 45, frequency: 'As needed for pain' },
    ],
    'Neurologist': [
        { name: 'Botox for Migraines', basePrice: 1200, frequency: 'Every 12 weeks' },
        { name: 'Erenumab (Aimovig)', basePrice: 650, frequency: 'Monthly' },
        { name: 'Fremanezumab (Ajovy)', basePrice: 650, frequency: 'Monthly/quarterly' },
        { name: 'Methylprednisolone IV', basePrice: 450, frequency: 'For MS flares' },
        { name: 'Ocrelizumab (Ocrevus) IV', basePrice: 65000, frequency: 'Every 6 months' },
    ],
    'Ophthalmologist': [
        { name: 'Aflibercept (Eylea) Injection', basePrice: 1850, frequency: 'Monthly/bimonthly' },
        { name: 'Ranibizumab (Lucentis) Injection', basePrice: 1650, frequency: 'Monthly' },
        { name: 'Bevacizumab (Avastin) Injection', basePrice: 450, frequency: 'Monthly' },
        { name: 'Triamcinolone Intravitreal', basePrice: 350, frequency: 'Every 3-6 months' },
        { name: 'Dexamethasone Implant (Ozurdex)', basePrice: 1200, frequency: 'Every 3-6 months' },
    ],
    'Gastroenterologist': [
        { name: 'Infliximab (Remicade) IV', basePrice: 4500, frequency: 'Every 6-8 weeks' },
        { name: 'Vedolizumab (Entyvio) IV', basePrice: 6200, frequency: 'Every 4-8 weeks' },
        { name: 'Ustekinumab (Stelara) IV/SC', basePrice: 12500, frequency: 'Every 8-12 weeks' },
        { name: 'Octreotide Injection', basePrice: 850, frequency: 'Monthly' },
        { name: 'Vitamin B12 Injection', basePrice: 25, frequency: 'Monthly' },
    ],
    'Allergist': [
        { name: 'Epinephrine (EpiPen)', basePrice: 650, frequency: 'Emergency' },
        { name: 'Omalizumab (Xolair)', basePrice: 2800, frequency: 'Every 2-4 weeks' },
        { name: 'Allergen Immunotherapy', basePrice: 450, frequency: 'Weekly then monthly' },
        { name: 'Mepolizumab (Nucala)', basePrice: 3200, frequency: 'Every 4 weeks' },
        { name: 'Benralizumab (Fasenra)', basePrice: 3500, frequency: 'Every 4-8 weeks' },
    ],
    'Urologist': [
        { name: 'Leuprolide (Lupron)', basePrice: 1200, frequency: 'Monthly/3-monthly' },
        { name: 'Goserelin (Zoladex)', basePrice: 850, frequency: 'Monthly/3-monthly' },
        { name: 'Botox for Overactive Bladder', basePrice: 850, frequency: 'Every 6-12 months' },
        { name: 'Alprostadil Injection', basePrice: 180, frequency: 'As needed' },
        { name: 'BCG Intravesical', basePrice: 450, frequency: 'Weekly for 6 weeks' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SURGICAL PROCEDURES WITH COSTS
// ═══════════════════════════════════════════════════════════════════════════

const SURGICAL_PROCEDURES: Record<string, { name: string; basePrice: number }[]> = {
    'Cardiologist': [
        { name: 'Coronary Angioplasty (PCI) with Stent', basePrice: 35000 },
        { name: 'Coronary Artery Bypass Graft (CABG)', basePrice: 85000 },
        { name: 'Heart Valve Replacement', basePrice: 120000 },
        { name: 'TAVR (Transcatheter Aortic Valve)', basePrice: 150000 },
        { name: 'Pacemaker Implantation', basePrice: 35000 },
        { name: 'ICD Implantation', basePrice: 55000 },
        { name: 'Cardiac Ablation', basePrice: 45000 },
        { name: 'Heart Transplant', basePrice: 1200000 },
    ],
    'Orthopedic Surgeon': [
        { name: 'Total Knee Replacement', basePrice: 45000 },
        { name: 'Total Hip Replacement', basePrice: 48000 },
        { name: 'Spinal Fusion', basePrice: 85000 },
        { name: 'ACL Reconstruction', basePrice: 25000 },
        { name: 'Rotator Cuff Repair', basePrice: 18000 },
        { name: 'Arthroscopic Surgery', basePrice: 12000 },
        { name: 'Carpal Tunnel Release', basePrice: 5000 },
        { name: 'Disc Replacement', basePrice: 95000 },
    ],
    'Neurologist': [
        { name: 'Deep Brain Stimulation (DBS)', basePrice: 85000 },
        { name: 'Craniotomy for Tumor', basePrice: 75000 },
        { name: 'Spinal Cord Stimulator', basePrice: 55000 },
        { name: 'VP Shunt Placement', basePrice: 35000 },
        { name: 'Microvascular Decompression', basePrice: 45000 },
        { name: 'Endoscopic Pituitary Surgery', basePrice: 55000 },
    ],
    'Gastroenterologist': [
        { name: 'Colonoscopy with Polypectomy', basePrice: 4500 },
        { name: 'Upper Endoscopy (EGD)', basePrice: 3000 },
        { name: 'ERCP', basePrice: 8500 },
        { name: 'Laparoscopic Cholecystectomy', basePrice: 15000 },
        { name: 'Gastric Bypass Surgery', basePrice: 25000 },
        { name: 'Gastric Sleeve Surgery', basePrice: 18000 },
        { name: 'Liver Transplant', basePrice: 750000 },
        { name: 'Hemorrhoid Surgery', basePrice: 5500 },
    ],
    'Urologist': [
        { name: 'TURP (Prostate Resection)', basePrice: 12000 },
        { name: 'Radical Prostatectomy', basePrice: 35000 },
        { name: 'Robotic Prostatectomy', basePrice: 55000 },
        { name: 'Kidney Stone Lithotripsy', basePrice: 8000 },
        { name: 'Ureteroscopy', basePrice: 6500 },
        { name: 'Nephrectomy', basePrice: 25000 },
        { name: 'Kidney Transplant', basePrice: 350000 },
        { name: 'Vasectomy', basePrice: 1500 },
    ],
    'Ophthalmologist': [
        { name: 'Cataract Surgery', basePrice: 4500 },
        { name: 'LASIK Surgery', basePrice: 4000 },
        { name: 'PRK Surgery', basePrice: 3500 },
        { name: 'Glaucoma Surgery (Trabeculectomy)', basePrice: 8000 },
        { name: 'Vitrectomy', basePrice: 12000 },
        { name: 'Retinal Detachment Repair', basePrice: 15000 },
        { name: 'Corneal Transplant', basePrice: 25000 },
        { name: 'Eyelid Surgery (Blepharoplasty)', basePrice: 5500 },
    ],
    'Gynecologist': [
        { name: 'Hysterectomy (Laparoscopic)', basePrice: 18000 },
        { name: 'Hysterectomy (Abdominal)', basePrice: 22000 },
        { name: 'Myomectomy', basePrice: 15000 },
        { name: 'C-Section Delivery', basePrice: 12000 },
        { name: 'Tubal Ligation', basePrice: 4500 },
        { name: 'Ovarian Cyst Removal', basePrice: 8500 },
        { name: 'IVF Cycle', basePrice: 15000 },
        { name: 'Endometriosis Surgery', basePrice: 12000 },
    ],
    'ENT Specialist': [
        { name: 'Tonsillectomy', basePrice: 5500 },
        { name: 'Septoplasty', basePrice: 8000 },
        { name: 'Sinus Surgery (FESS)', basePrice: 12000 },
        { name: 'Cochlear Implant', basePrice: 45000 },
        { name: 'Thyroidectomy', basePrice: 18000 },
        { name: 'Laryngoscopy', basePrice: 3500 },
        { name: 'Mastoidectomy', basePrice: 15000 },
        { name: 'Sleep Apnea Surgery (UPPP)', basePrice: 12000 },
    ],
    'Oncologist': [
        { name: 'Mastectomy', basePrice: 25000 },
        { name: 'Lumpectomy', basePrice: 12000 },
        { name: 'Lung Cancer Surgery (Lobectomy)', basePrice: 45000 },
        { name: 'Colon Cancer Surgery', basePrice: 35000 },
        { name: 'Whipple Procedure', basePrice: 65000 },
        { name: 'Bone Marrow Transplant', basePrice: 350000 },
        { name: 'Tumor Resection', basePrice: 35000 },
    ],
    'Dermatologist': [
        { name: 'Mohs Surgery', basePrice: 3500 },
        { name: 'Skin Cancer Excision', basePrice: 2500 },
        { name: 'Hair Transplant', basePrice: 8000 },
        { name: 'Laser Skin Resurfacing', basePrice: 3000 },
        { name: 'Dermabrasion', basePrice: 2000 },
        { name: 'Scar Revision Surgery', basePrice: 2500 },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function generateTreatmentsData() {
    // Read existing treatments
    const existingPath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    let existingTreatments: Treatment[] = [];

    try {
        existingTreatments = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
    } catch (e) {
        console.log('No existing treatments file, starting fresh');
    }

    // Add costs to existing treatments
    const updatedTreatments: Treatment[] = existingTreatments.map(t => {
        let basePrice = 100; // Default

        // Estimate base prices based on type
        if (t.type === 'surgical') basePrice = 15000;
        else if (t.type === 'therapy') basePrice = 150;
        else if (t.type === 'medical') basePrice = 200;
        else if (t.type === 'otc') basePrice = 25;
        else if (t.type === 'home_remedy') basePrice = 15;

        return {
            ...t,
            costs: generateCosts(basePrice),
        };
    });

    // Add new drug treatments
    const drugTreatments: Treatment[] = [];
    for (const [specialty, drugs] of Object.entries(DRUGS_BY_SPECIALTY)) {
        for (const drug of drugs) {
            drugTreatments.push({
                name: drug.name,
                type: 'drug',
                specialty,
                brandNames: drug.brands,
                genericAvailable: drug.generic,
                requiresPrescription: true,
                costs: generateCosts(drug.basePrice),
            });

            // Also add as prescription type for dual categorization
            drugTreatments.push({
                name: `${drug.name} (Rx)`,
                type: 'prescription',
                specialty,
                brandNames: drug.brands,
                genericAvailable: drug.generic,
                requiresPrescription: true,
                costs: generateCosts(drug.basePrice),
            });
        }
    }

    // Add injection treatments
    const injectionTreatments: Treatment[] = [];
    for (const [specialty, injections] of Object.entries(INJECTIONS_BY_SPECIALTY)) {
        for (const injection of injections) {
            injectionTreatments.push({
                name: injection.name,
                type: 'injection',
                specialty,
                description: `Frequency: ${injection.frequency}`,
                requiresPrescription: true,
                costs: generateCosts(injection.basePrice),
            });
        }
    }

    // Add surgical procedures with costs
    const surgicalTreatments: Treatment[] = [];
    for (const [specialty, procedures] of Object.entries(SURGICAL_PROCEDURES)) {
        for (const procedure of procedures) {
            surgicalTreatments.push({
                name: procedure.name,
                type: 'surgical',
                specialty,
                costs: generateCosts(procedure.basePrice),
            });
        }
    }

    // Combine all treatments
    const allTreatments = [
        ...updatedTreatments,
        ...drugTreatments,
        ...injectionTreatments,
        ...surgicalTreatments,
    ];

    // Deduplicate by name + specialty
    const seen = new Set<string>();
    const dedupedTreatments = allTreatments.filter(t => {
        const key = `${t.name.toLowerCase()}-${t.specialty.toLowerCase()}-${t.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Write output
    const outputPath = path.join(process.cwd(), 'public', 'data', 'treatments-with-costs.json');
    fs.writeFileSync(outputPath, JSON.stringify(dedupedTreatments, null, 2));

    console.log(`Generated ${dedupedTreatments.length} treatments with costs`);
    console.log(`- Drugs: ${drugTreatments.length / 2}`);
    console.log(`- Injections: ${injectionTreatments.length}`);
    console.log(`- Surgical: ${surgicalTreatments.length}`);

    // Also update the main file
    fs.writeFileSync(existingPath, JSON.stringify(dedupedTreatments, null, 2));
    console.log(`Updated ${existingPath}`);
}

generateTreatmentsData();
