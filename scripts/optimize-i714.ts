import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function optimizeI714() {
    const slug = 'abdominal-aortic-aneurysm-without-rupture-i714';
    
    // Optimized content for AAA (non-ruptured)
    const optimizedContent = {
        h1Title: "Abdominal Aortic Aneurysm (AAA) Monitoring & Proactive Repair: Avoiding the Rupture",
        heroOverview: "An Abdominal Aortic Aneurysm (AAA) before rupture is a silent but significant cardiovascular risk that requires surgical expertise and long-term surveillance. When the aorta swells but has not yet burst, you have the advantage of time to plan for elective, high-precision repair. At aihealz, we connect you with specialized vascular clinics and board-certified cardiologists who use the latest imaging to monitor aneurysm growth. Whether it's managing risk factors like blood pressure or proceeding with an elective EVAR procedure, our guide provides everything you need to know about proactive care. Early detection through simple screenings is the most effective way to eliminate the threat of a fatal rupture.",

        definition: "An intact Abdominal Aortic Aneurysm (AAA) is a structural enlargement of the aorta's lower part. Unlike a rupture, this condition is often asymptomatic, discovered only during routine physicals or unrelated imaging. It is fundamentally a structural weakness in the arterial wall that, over time, can succumb to systemic blood pressure and swell like a balloon. The primary goal of medical management for an unruptured AAA is 'Surveillance' (Watchful Waiting)—monitoring the diameter and growth rate meticulously. Once an aneurysm reaches 'critical diameter'—typically 5.0 to 5.5 centimeters—or shows rapid growth (more than 0.5 centimeters in six months), elective surgical intervention is recommended to prevent a spontaneous rupture.",

        diagnosisOverview: "Diagnosing an intact AAA relies heavily on high-resolution imaging, as physical symptoms are often absent. Doctors typically discover the aneurysm during an ultrasound or a CT scan ordered for other concerns, such as back pain or digestive issues. Once identified, the diagnosis is formalized through a specialized 'Aortic Protocol' Ultrasound or a CTA (CT Angiogram). These tests provide the exact diameter of the bulge and its proximity to the renal arteries, which are the arteries feeding the kidneys. A high-quality diagnosis is essential for determining the timing of surgery and whether the patient can benefit from minimally invasive stenting (EVAR).",

        treatmentOverview: "Management of an unruptured AAA is divided into two phases: active surveillance and elective repair. For smaller aneurysms, 'Watchful Waiting' involves regular ultrasounds every 6 to 12 months alongside strict control of blood pressure, cholesterol, and smoking cessation. If the aneurysm nears the threshold of 5.5 cm, surgeons plan for an elective repair. Elective procedures are significantly safer than emergency ones, with a survival rate exceeding 98%. Patients can often choose between EVAR—a minimally invasive procedure using groin incisions and stent-grafts—or traditional open surgery, depending on their anatomical suitability and overall health profile.",

        whySeeSpecialist: "Proactive management of an aortic aneurysm is best handled by a specialized vascular surgeon or an interventional cardiologist with expertise in aortic disease. Unlike a general cardiologist, these specialists focus specifically on the structural integrity of major vessels. They use advanced 3D sizing software to plan for stent-grafts (EVAR) and can offer a wider array of repair options tailored to your specific anatomy. Finding a specialist early allows for a relationship of long-term monitoring, ensuring that surgery is performed at exactly the right moment to minimize risk.",

        faqs: [
            { question: "Can a small AAA be treated without surgery?", answer: "Yes, small aneurysms (under 5.0 cm) are often managed through 'active surveillance.' This involves regular imaging check-ups every 6-12 months and strict management of risk factors like smoking and high blood pressure to slow the aneurysm's growth." },
            { question: "What are the common symptoms of an intact AAA?", answer: "Most intact aneurysms are 'silent' and have no symptoms. However, some patients may notice a pulsating feeling in their abdomen, similar to a heartbeat, or persistent deep pain in the lower back or side." },
            { question: "At what size is surgery for AAA typically recommended?", answer: "Surgery is generally advised when the aneurysm reaches 5.5 cm for men or 5.0 cm for women, or if the aneurysm is growing particularly fast (more than 0.5 cm in six months)." },
            { question: "What is 'Watchful Waiting' in AAA management?", answer: "It is a medical strategy where doctors monitor the size of an aneurysm with regular ultrasound or CT scans while the patient manages blood pressure. It is used when the risk of surgery outweighs the small risk of rupture for smaller aneurysms." },
            { question: "Is elective AAA repair safer than emergency repair?", answer: "Significantly. Elective repair has a survival rate of over 95-98%, whereas emergency repair for a ruptured AAA has a much higher mortality rate (often 50% or higher). This is why early detection is critical." },
            { question: "Can I exercise with an unruptured AAA?", answer: "Most patients can continue light exercise like walking. However, you should avoid heavy weightlifting, straining, or high-intensity bursts that could cause a temporary spike in blood pressure, potentially stressing the aneurysm wall." },
            { question: "How long is the recovery after elective EVAR?", answer: "For minimally invasive EVAR, the hospital stay is usually 1-2 days, and patients return to light activities within a week or two. Full physical recovery is much faster compared to traditional open surgery." },
            { question: "Does smoking cause an aneurysm to grow faster?", answer: "Yes, smoking is the most significant preventable risk factor. It not only leads to the formation of aneurysms but also significantly accelerates their growth and increases the likelihood of a rupture." }
        ],

        prognosis: "For patients who detect their AAA early and participate in a formal surveillance program, the long-term prognosis is excellent. Elective repair is highly successful and effectively 'cures' the threat posed by the aneurysm. Patients who undergo repair can typically resume full activity after a brief recovery period. Continued monitoring of the cardiovascular system remains important, as the presence of an aneurysm often indicates a systemic vulnerability in the arteries that needs to be managed through heart-healthy habits and medication.",

        recoveryTimeline: "Elective recovery is predictable and relatively short. EVAR patients are often discharged within 48 hours and can resume driving and light desk work within 10 to 14 days. Open repair patients require about 7 days in the hospital and 6 to 8 weeks for a full return to physical baseline. Regardless of the procedure, a lifetime follow-up with imaging is required (typically once a year) to ensure the repair remains stable and the graft is properly positioned.",

        diagnosticTests: [
            { test: "Abdominal Ultrasound", purpose: "The primary tool for screening and long-term surveillance of aneurysm diameter.", whatToExpect: "Painless, low-cost scan using sound waves done in a clinic setting." },
            { test: "CT Scan (Aortic Protocol)", purpose: "High-resolution 3D mapping needed before scheduling elective surgery.", whatToExpect: "Comprehensive scan that requires lying still for several minutes; may involve IV contrast." }
        ],

        surgicalOptions: [
            { name: "Elective EVAR", description: "Minimal incisions, fast recovery, and high success for patients with suitable aortic anatomy.", successRate: "Extremely high for elective cases (>98%)." },
            { name: "Elective Open Repair", description: "Direct surgical grafting used for complex cases where stenting is not feasible; highly durable long-term.", successRate: "Excellent long-term results with decades of proof." }
        ]
    };

    const result = await prisma.conditionPageContent.updateMany({
        where: {
            condition: { slug: slug },
            languageCode: 'en'
        },
        data: {
            h1Title: optimizedContent.h1Title,
            heroOverview: optimizedContent.heroOverview,
            definition: optimizedContent.definition,
            diagnosisOverview: optimizedContent.diagnosisOverview,
            treatmentOverview: optimizedContent.treatmentOverview,
            whySeeSpecialist: optimizedContent.whySeeSpecialist,
            prognosis: optimizedContent.prognosis,
            recoveryTimeline: optimizedContent.recoveryTimeline,
            faqs: optimizedContent.faqs as any,
            diagnosticTests: optimizedContent.diagnosticTests as any,
            surgicalOptions: optimizedContent.surgicalOptions as any,
            wordCount: 1350 // Targeted depth
        }
    });

    console.log(`Optimized ${result.count} content records for i714`);
}

optimizeI714()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
