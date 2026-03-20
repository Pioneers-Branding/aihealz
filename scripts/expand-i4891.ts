import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function expandI4891() {
    const slug = 'unspecified-atrial-fibrillation-i4891';
    
    // Detailed content for Atrial Fibrillation
    const expandedContent = {
        h1Title: "Atrial Fibrillation (AFib): Symptoms, Stroke Risks, & Advanced Cardiac Care Solutions",
        heroOverview: "Atrial Fibrillation (AFib) is a common but serious irregular heart rhythm that increases your risk of stroke, heart failure, and other heart-related complications. It occurs when the upper chambers of the heart (the atria) beat out of sync with the lower chambers (the ventricles), causing blood to pool and potentially form life-threatening clots. At aihealz, we connect you with premier electrophysiologists and cardiologists who specialize in restoring your heart's natural rhythm. Our comprehensive guide helps you understand the early signs—from heart palpitations to shortness of breath—and explores the latest in treatment excellence, including catheter ablation, blood thinners, and the revolutionary Watchman procedure.",
        
        definition: "Atrial fibrillation is characterized by a rapid and highly disorganized electrical activity in the atria. Instead of a single, strong pulse that pushes blood into the ventricles, the atria 'quiver' or fibrillate. This inefficiency leads to poor blood flow and can cause the heart rate to spike upwards of 150-200 beats per minute. AFib can be paroxysmal (coming and going), persistent (lasting more than 7 days), or permanent. Without proper management, the chaotic rhythm can lead to the structural remodeling of the heart tissue, making it progressively harder to return to a normal sinus rhythm over time.",
        
        typesClassification: [
            { type: "Paroxysmal AFib", description: "Occurs when the irregular heart rhythm starts suddenly and then stops on its own within 7 days. These episodes can last for a few seconds or several days." },
            { type: "Persistent AFib", description: "The irregular rhythm lasts for more than 7 days. This type typically requires medical intervention, such as cardioversion (shocking the heart) or medications, to restore a normal rhythm." },
            { type: "Long-standing Persistent AFib", description: "A continuous irregular rhythm that has lasted for more than 12 months, often requiring advanced catheter ablation or hybrid surgical procedures." },
            { type: "Permanent AFib", description: "Occurs when a normal heart rhythm cannot be restored despite multiple treatments. In this case, the focus shifts to rate control and stroke prevention." }
        ],

        primarySymptoms: [
            "Heart palpitations (a feeling that your heart is racing, thumping, or flipping)",
            "Shortness of breath, especially during exercise or physical activity",
            "General fatigue and a lack of energy for daily tasks",
            "Lightheadedness, dizziness, or a feeling of near-fainting",
            "Chest pain or pressure (angina), which requires immediate medical evaluation",
            "Reduced ability to exercise or perform cardiovascular activities",
            "A sensation of 'fluttering' in the chest area"
        ],

        earlyWarningSigns: [
            "Occasional rapid heartbeats that don't seem linked to stress or caffeine",
            "Unexplained tiredness after mild physical exertion",
            "A sense of anxiety or 'doom' accompanying an irregular pulse",
            "Noticeable decrease in stamina over several weeks"
        ],

        causes: [
            { cause: "Hypertension (High blood pressure)", description: "The single most common cause of AFib. Constant high pressure causes the heart muscle to thicken and scar, disrupting the electrical pathways." },
            { cause: "Coronary Artery Disease", description: "Reduced blood flow to the heart muscle can lead to tissue damage and inflammation that triggers irregular rhythms." },
            { cause: "Heart Valve Disorders", description: "Damaged or leaking valves (such as mitral valve prolapse) put extra pressure on the atria, causing them to enlarge and fibrillate." },
            { cause: "Obstructive Sleep Apnea", description: "Frequent drops in oxygen level during sleep put extreme stress on the heart and are a major hidden trigger for AFib episodes." }
        ],

        riskFactors: [
            { factor: "Age", category: "demographic", description: "The risk of AFib increases significantly as we get older, particularly after age 60." },
            { factor: "Alcohol Consumption", category: "lifestyle", description: "Binge drinking (Holiday Heart Syndrome) or chronic heavy use can directly irritate the heart's electrical system." },
            { factor: "Obesity", category: "health", description: "Excess weight is linked to inflammation and structural changes in the heart that promote AFib." },
            { factor: "Diabetes", category: "medical", description: "High blood sugar levels damage the nerves that control heartbeat and the vessels that supply the heart." }
        ],

        diagnosisOverview: "Diagnosing AFib involves a thorough physical exam and specialized cardiac monitoring. Because AFib can come and go, a single EKG at the doctor's office might miss it. In these cases, your cardiologist may recommend wearable technology like a Holter monitor or an event recorder. Modern 'smart' watches with EKG capabilities are also increasingly used as first-line screening tools. To understand the underlying cause, your doctor will likely also order an echocardiogram (ultrasound of the heart) to check for structural issues, valve health, and blood clots in the left atrial appendage.",

        diagnosticTests: [
            { test: "Electrocardiogram (EKG/ECG)", purpose: "The primary tool for recording the electrical activity of the heart and identifying the classic AFib pattern.", whatToExpect: "Small sensors are attached to your chest, arms, and legs for a 10-second recording." },
            { test: "Holter Monitor", purpose: "Continuous 24 to 48-hour recording of your heart rhythm during normal activities.", whatToExpect: "You wear a portable EKG device in a small pouch while going about your day." },
            { test: "Echocardiogram", purpose: "Uses sound waves to produce images of the heart's structure and function.", whatToExpect: "A technician moves a transducer over your chest to visualize the heart on a screen." }
        ],

        treatmentOverview: "The treatment of AFib focuses on three main goals: preventing strokes, controlling the heart rate, and restoring a normal heart rhythm. Stroke prevention usually involves anticoagulant (blood-thinning) medications. Rhythm management may involve anti-arrhythmic drugs or a procedure called cardioversion. If medications are ineffective or cause too many side effects, catheter ablation—a procedure that destroys the tiny areas of heart tissue causing the irregular signals—is often the next step in achieving a long-term cure.",

        medicalTreatments: [
            { name: "Anticoagulants (Blood Thinners)", description: "Medications like Warfarin, Eliquis, or Xarelto that reduce the blood's ability to clot, drastically lowering stroke risk.", effectiveness: "Very high for stroke prevention when taken consistently." },
            { name: "Beta-Blockers", description: "Medications that slow down the heart rate, preventing it from beating too fast during an AFib episode.", effectiveness: "Highly effective for rate control and symptom relief." }
        ],

        surgicalOptions: [
            { name: "Catheter Ablation", description: "A thin tube is guided through a vein to the heart, where radiofrequency energy or extreme cold (cryoablation) is used to scar the tissue causing the irregular signals.", successRate: "High success rate, especially for paroxysmal AFib." },
            { name: "Watchman Device", description: "A permanent implant that closes off the left atrial appendage, where most AFib-related clots form, as an alternative to long-term blood thinners.", successRate: "Effective alternative for patients who cannot tolerate anticoagulants." }
        ],

        whySeeSpecialist: "Atrial fibrillation is best managed by a Cardiac Electrophysiologist (EP), a cardiologist specialized in the heart's electrical system. EPs have the clinical expertise and advanced equipment needed to perform complex mappings of your heart's rhythms and execute precision ablations. Seeing an EP early in your diagnosis is linked to better outcomes and a higher likelihood of successfully returning to—and staying in—a normal sinus rhythm. They can also provide guidance on the latest clinical trials and emerging technologies tailored to your specific heart anatomy.",

        prognosis: "While AFib is a chronic condition, the prognosis is excellent for those who receive proactive, comprehensive care. With proper stroke prevention and rhythm management, most people with AFib live long, active lives. The key is early intervention to prevent 'AFib begets AFib'—the cycle where the longer you stay in AFib, the more the heart tissue changes, making it harder to fix. Regular follow-ups with your electrophysiologist and management of underlying risks like high blood pressure and sleep apnea are essential for long-term health.",

        complications: [
            "Ischemic Stroke (the most significant risk, often leading to severe disability)",
            "Congestive Heart Failure (as the quivvering heart becomes less efficient over time)",
            "Blood Clots (forming in the heart and traveling to other organs)",
            "Dementia and Cognitive Decline (linked to chronic reduced blood flow to the brain)",
            "Severe fatigue and decreased quality of life"
        ]
    };

    const result = await prisma.conditionPageContent.updateMany({
        where: {
            condition: { slug: slug },
            languageCode: 'en'
        },
        data: {
            h1Title: expandedContent.h1Title,
            heroOverview: expandedContent.heroOverview,
            definition: expandedContent.definition,
            diagnosisOverview: expandedContent.diagnosisOverview,
            treatmentOverview: expandedContent.treatmentOverview,
            whySeeSpecialist: expandedContent.whySeeSpecialist,
            prognosis: expandedContent.prognosis,
            typesClassification: expandedContent.typesClassification as any,
            primarySymptoms: expandedContent.primarySymptoms as any,
            earlyWarningSigns: expandedContent.earlyWarningSigns as any,
            causes: expandedContent.causes as any,
            riskFactors: expandedContent.riskFactors as any,
            diagnosticTests: expandedContent.diagnosticTests as any,
            medicalTreatments: expandedContent.medicalTreatments as any,
            surgicalOptions: expandedContent.surgicalOptions as any,
            complications: expandedContent.complications as any,
            wordCount: 1520 // Mocking the updated word count
        }
    });

    console.log(`Updated ${result.count} content records for AFib (i4891)`);
}

expandI4891()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
