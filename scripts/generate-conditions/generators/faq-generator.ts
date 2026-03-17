/**
 * FAQ Generator
 *
 * Generates comprehensive FAQ content for condition pages (20+ questions)
 * optimized for featured snippets and voice search.
 */

import type {
  MedicalConditionInput,
  SpecialtyTemplate,
  GenerationContext,
  FAQ,
} from '../templates/base-template';
import { BASE_FAQ_TEMPLATES, interpolateTemplate } from '../templates/base-template';

export interface FAQOutput {
  faqs: FAQ[];
}

/**
 * Generate FAQ section for a condition (20+ questions)
 */
export function generateFAQs(context: GenerationContext): FAQOutput {
  const { condition, specialty, location } = context;
  const faqs: FAQ[] = [];

  // 1. Generate base FAQs from universal templates
  const baseFaqs = generateBaseFAQs(condition);
  faqs.push(...baseFaqs);

  // 2. Add specialty-specific FAQs
  const specialtyFaqs = generateSpecialtyFAQs(condition, specialty);
  faqs.push(...specialtyFaqs);

  // 3. Add condition-specific FAQs from database
  const conditionFaqs = generateConditionFAQs(condition);
  faqs.push(...conditionFaqs);

  // 4. Add location-specific FAQs if location provided
  if (location) {
    const locationFaqs = generateLocationFAQs(condition, specialty, location);
    faqs.push(...locationFaqs);
  }

  // 5. Add cost and doctor FAQs
  const practicalFaqs = generatePracticalFAQs(condition, specialty, location);
  faqs.push(...practicalFaqs);

  // 6. Add prognosis and lifestyle FAQs
  const lifestyleFaqs = generateLifestyleFAQs(condition, specialty);
  faqs.push(...lifestyleFaqs);

  // Deduplicate and ensure minimum count
  const uniqueFaqs = deduplicateFAQs(faqs);

  // Ensure at least 20 FAQs
  while (uniqueFaqs.length < 20) {
    const additionalFaq = generateAdditionalFAQ(condition, specialty, uniqueFaqs.length);
    uniqueFaqs.push(additionalFaq);
  }

  return { faqs: uniqueFaqs.slice(0, 25) };
}

/**
 * Generate base FAQs from universal templates
 */
function generateBaseFAQs(condition: MedicalConditionInput): FAQ[] {
  const conditionName = condition.commonName;

  return BASE_FAQ_TEMPLATES.slice(0, 10).map(template => ({
    question: interpolateTemplate(template.template, conditionName),
    answer: generateBaseAnswer(template.template, condition),
    schemaEligible: true,
    category: template.category,
  }));
}

/**
 * Generate specialty-specific FAQs
 */
function generateSpecialtyFAQs(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): FAQ[] {
  const conditionName = condition.commonName;

  return specialty.faqTemplates.slice(0, 5).map(template => ({
    question: interpolateTemplate(template, conditionName),
    answer: generateSpecialtyAnswer(template, condition, specialty),
    schemaEligible: true,
    category: categorizeQuestion(template) as FAQ['category'],
  }));
}

/**
 * Generate FAQs from condition database records
 */
function generateConditionFAQs(condition: MedicalConditionInput): FAQ[] {
  if (!Array.isArray(condition.faqs) || condition.faqs.length === 0) {
    return [];
  }

  return condition.faqs
    .filter(faq => faq && typeof faq.question === 'string' && typeof faq.answer === 'string')
    .slice(0, 5)
    .map(faq => ({
      question: faq.question,
      answer: faq.answer,
      schemaEligible: true,
      category: categorizeQuestion(faq.question) as FAQ['category'],
    }));
}

/**
 * Generate location-specific FAQs
 */
function generateLocationFAQs(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate,
  location: { country: string; city?: string }
): FAQ[] {
  const conditionName = condition.commonName;
  const locationName = location.city || location.country;
  const specialistTitle = specialty.specialistTitle;

  return [
    {
      question: `Who is the best ${specialistTitle.toLowerCase()} for ${conditionName} in ${locationName}?`,
      answer: `The best ${specialistTitle.toLowerCase()} for ${conditionName} in ${locationName} would have extensive experience treating this condition, good patient reviews, and credentials from recognized medical institutions. Look for doctors who specialize in ${conditionName} and have performed numerous successful treatments. You can find verified ${specialistTitle.toLowerCase()}s on our platform with patient ratings and reviews to help you make an informed decision.`,
      schemaEligible: true,
      category: 'doctor' as const,
    },
    {
      question: `Which hospital is best for ${conditionName} treatment in ${locationName}?`,
      answer: `The best hospital for ${conditionName} treatment in ${locationName} should have specialized departments, experienced ${specialty.specialistTitlePlural.toLowerCase()}, modern diagnostic equipment, and a good track record of successful outcomes. Consider factors like hospital accreditation, available facilities, patient reviews, and insurance coverage when making your choice.`,
      schemaEligible: true,
      category: 'doctor' as const,
    },
    {
      question: `How much does ${conditionName} treatment cost in ${locationName}?`,
      answer: `The cost of ${conditionName} treatment in ${locationName} varies depending on the type of treatment required, hospital chosen, and individual case complexity. Consultation fees typically range from the lower end for basic visits to higher amounts for specialized consultations. Treatment costs can vary significantly based on whether medication, procedures, or surgery is needed. We recommend getting a personalized cost estimate based on your specific situation.`,
      schemaEligible: true,
      category: 'cost' as const,
    },
  ];
}

/**
 * Generate practical FAQs about cost and doctors
 */
function generatePracticalFAQs(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate,
  location?: { country: string; city?: string }
): FAQ[] {
  const conditionName = condition.commonName;
  const specialistTitle = specialty.specialistTitle;

  const faqs: FAQ[] = [
    {
      question: `What questions should I ask my ${specialistTitle.toLowerCase()} about ${conditionName}?`,
      answer: `When consulting a ${specialistTitle.toLowerCase()} about ${conditionName}, ask about: 1) The exact diagnosis and what tests confirm it, 2) Available treatment options and their success rates, 3) Potential side effects of treatments, 4) Expected recovery time and prognosis, 5) Lifestyle changes that can help, 6) Warning signs to watch for, and 7) Follow-up care schedule. Being prepared with questions helps ensure you get comprehensive information about your condition.`,
      schemaEligible: true,
      category: 'doctor' as const,
    },
    {
      question: `Does insurance cover ${conditionName} treatment?`,
      answer: `Most health insurance plans cover treatment for ${conditionName}, including doctor consultations, diagnostic tests, medications, and medically necessary procedures. However, coverage varies by plan and provider. Pre-existing condition clauses may apply in some cases. It's advisable to verify coverage with your insurance provider before starting treatment and inquire about any pre-authorization requirements for specific procedures.`,
      schemaEligible: true,
      category: 'cost' as const,
    },
    {
      question: `How do I prepare for a ${conditionName} consultation?`,
      answer: `To prepare for a ${conditionName} consultation: 1) Bring all previous medical records and test results, 2) List all current medications including supplements, 3) Note your symptoms, when they started, and what makes them better or worse, 4) Prepare a list of questions for the doctor, 5) Bring a family member for support if needed, 6) Note your family medical history, and 7) Arrive early to complete paperwork. This helps ensure a productive consultation.`,
      schemaEligible: true,
      category: 'doctor' as const,
    },
  ];

  return faqs;
}

/**
 * Generate lifestyle and prognosis FAQs
 */
function generateLifestyleFAQs(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): FAQ[] {
  const conditionName = condition.commonName;

  const faqs: FAQ[] = [
    {
      question: `What is the long-term outlook for people with ${conditionName}?`,
      answer: `The long-term outlook for ${conditionName} varies depending on the severity, how early treatment is started, and how well the treatment plan is followed. Many people with ${conditionName} lead full, active lives with proper management. Early diagnosis, appropriate treatment, regular monitoring, and lifestyle modifications all contribute to better outcomes. Your doctor can provide a more specific prognosis based on your individual case.`,
      schemaEligible: true,
      category: 'prognosis' as const,
    },
    {
      question: `Can ${conditionName} come back after treatment?`,
      answer: `Whether ${conditionName} can recur depends on the type and cause of the condition. Some conditions can be fully cured, while others may require ongoing management. Following your treatment plan, attending regular check-ups, and maintaining recommended lifestyle changes can help prevent recurrence or manage chronic conditions effectively. Discuss specific recurrence risks with your healthcare provider.`,
      schemaEligible: true,
      category: 'prognosis' as const,
    },
    {
      question: `What lifestyle changes help manage ${conditionName}?`,
      answer: `Lifestyle changes that may help manage ${conditionName} include: ${specialty.lifestyleRecommendations.slice(0, 5).join(', ')}. Additionally, maintaining a healthy diet, getting adequate sleep, managing stress, and avoiding known triggers can improve outcomes. Your doctor can provide personalized recommendations based on your specific situation.`,
      schemaEligible: true,
      category: 'lifestyle' as const,
    },
  ];

  return faqs;
}

/**
 * Generate additional FAQs to meet minimum count
 */
function generateAdditionalFAQ(
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate,
  index: number
): FAQ {
  const conditionName = condition.commonName;
  const specialistTitle = specialty.specialistTitle;

  const additionalTemplates: { question: string; answer: string; category: FAQ['category'] }[] = [
    {
      question: `Is ${conditionName} common?`,
      answer: `${conditionName} is a condition that affects many people worldwide. The prevalence varies by region, age group, and other demographic factors. While exact numbers depend on the specific type and diagnostic criteria used, it's important to know that effective treatments are available and many people successfully manage this condition.`,
      category: 'general',
    },
    {
      question: `Can children get ${conditionName}?`,
      answer: `${conditionName} can affect people of various ages, including children, though the presentation may differ from adults. Pediatric cases may require specialized care and age-appropriate treatments. If you suspect your child has symptoms of ${conditionName}, consult a pediatric specialist or ${specialistTitle.toLowerCase()} experienced in treating children.`,
      category: 'general',
    },
    {
      question: `Is ${conditionName} contagious?`,
      answer: `Whether ${conditionName} is contagious depends on its underlying cause. Conditions caused by infections may be transmissible, while those caused by genetics, lifestyle factors, or autoimmune processes are not contagious. Your healthcare provider can clarify the nature of your specific condition and any necessary precautions.`,
      category: 'general',
    },
    {
      question: `Can I work with ${conditionName}?`,
      answer: `Many people with ${conditionName} continue to work successfully. The ability to work depends on the severity of symptoms, type of work, and how well the condition is managed. Some may need workplace accommodations. Discuss your work situation with your doctor to understand any limitations and get advice on managing symptoms at work.`,
      category: 'lifestyle',
    },
    {
      question: `What is the difference between ${conditionName} and similar conditions?`,
      answer: `${conditionName} may share symptoms with related conditions in the same specialty area. Accurate diagnosis by a qualified ${specialistTitle.toLowerCase()} is essential to differentiate between conditions and ensure appropriate treatment. Diagnostic tests, medical history, and physical examination help distinguish between similar conditions.`,
      category: 'general',
    },
    {
      question: `Can ${conditionName} affect other parts of the body?`,
      answer: `Depending on its nature, ${conditionName} may have effects beyond the primary affected area. Some conditions can cause systemic effects or increase the risk of other health issues. Regular monitoring and comprehensive care help identify and address any related health concerns early.`,
      category: 'general',
    },
    {
      question: `How long does ${conditionName} treatment typically last?`,
      answer: `Treatment duration for ${conditionName} varies based on the condition severity, type of treatment, and individual response. Some cases may require short-term treatment, while others need ongoing management. Your ${specialistTitle.toLowerCase()} will provide a personalized treatment timeline and adjust it based on your progress.`,
      category: 'treatment',
    },
  ];

  const template = additionalTemplates[index % additionalTemplates.length];

  return {
    question: template.question,
    answer: template.answer,
    schemaEligible: true,
    category: template.category,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateBaseAnswer(template: string, condition: MedicalConditionInput): string {
  const conditionName = condition.commonName;
  const description = condition.description || `a medical condition affecting the ${condition.bodySystem || 'body'}`;

  const answers: Record<string, string> = {
    'What is {condition}?': `${conditionName} is ${description}. It requires proper diagnosis and treatment by a qualified healthcare professional.`,
    'What are the first signs of {condition}?': `Early signs of ${conditionName} may include ${(condition.symptoms as string[])?.slice(0, 3).join(', ') || 'various symptoms'} among others. Recognizing these early symptoms can lead to timely treatment and better outcomes.`,
    'What causes {condition}?': `${conditionName} can be caused by various factors including genetic predisposition, lifestyle factors, and environmental triggers. A healthcare provider can help identify specific causes in your case.`,
    'How is {condition} diagnosed?': `${conditionName} is typically diagnosed through a combination of physical examination, medical history review, and diagnostic tests. Your doctor will determine the most appropriate diagnostic approach.`,
    'What is the best treatment for {condition}?': `The best treatment for ${conditionName} depends on individual factors including severity, overall health, and patient preferences. Treatment options may include medications, procedures, and lifestyle modifications. Consult a specialist for personalized recommendations.`,
    'Can {condition} be cured?': `Whether ${conditionName} can be completely cured depends on the specific type and cause. Many cases can be effectively managed or put into remission with proper treatment. Early diagnosis and treatment generally lead to better outcomes.`,
    'How much does {condition} treatment cost?': `Treatment costs for ${conditionName} vary based on the type of treatment needed, healthcare facility, and location. Costs can range from affordable consultations to more expensive procedures or surgeries. Insurance coverage can significantly reduce out-of-pocket expenses.`,
    'Which doctor should I consult for {condition}?': `For ${conditionName}, you should consult a ${condition.specialistType || 'specialist'} who has experience treating this condition. They can provide accurate diagnosis and create an appropriate treatment plan.`,
    'Which hospital is best for {condition} treatment?': `The best hospital for ${conditionName} treatment should have experienced specialists, modern facilities, and a good track record with this condition. Consider factors like location, insurance coverage, and patient reviews when choosing.`,
    'Is {condition} covered by insurance?': `Most health insurance plans cover medically necessary treatment for ${conditionName}. Coverage specifics depend on your plan. Contact your insurance provider to verify coverage and understand any pre-authorization requirements.`,
  };

  for (const [key, answer] of Object.entries(answers)) {
    if (template === key) {
      return answer;
    }
  }

  // Default answer for unmatched templates
  return `For information about ${conditionName} related to this topic, please consult with a qualified healthcare professional who can provide personalized guidance based on your specific situation.`;
}

function generateSpecialtyAnswer(
  template: string,
  condition: MedicalConditionInput,
  specialty: SpecialtyTemplate
): string {
  const conditionName = condition.commonName;
  const specialistTitle = specialty.specialistTitle;

  // Generate contextual answer based on specialty patterns
  return `This is an important question about ${conditionName}. A qualified ${specialistTitle.toLowerCase()} can provide the most accurate answer based on your specific situation. Generally, management involves a combination of medical treatment, lifestyle modifications, and regular monitoring. Early consultation leads to better outcomes.`;
}

function categorizeQuestion(question: string): string {
  if (!question || typeof question !== 'string') {
    return 'general';
  }
  const questionLower = question.toLowerCase();

  if (questionLower.includes('symptom') || questionLower.includes('sign') || questionLower.includes('feel')) {
    return 'symptoms';
  }
  if (questionLower.includes('treat') || questionLower.includes('medication') || questionLower.includes('medicine')) {
    return 'treatment';
  }
  if (questionLower.includes('cost') || questionLower.includes('price') || questionLower.includes('insurance') || questionLower.includes('afford')) {
    return 'cost';
  }
  if (questionLower.includes('doctor') || questionLower.includes('hospital') || questionLower.includes('specialist')) {
    return 'doctor';
  }
  if (questionLower.includes('diet') || questionLower.includes('exercise') || questionLower.includes('lifestyle') || questionLower.includes('prevent')) {
    return 'lifestyle';
  }
  if (questionLower.includes('cure') || questionLower.includes('recover') || questionLower.includes('outlook') || questionLower.includes('prognosis')) {
    return 'prognosis';
  }

  return 'general';
}

function deduplicateFAQs(faqs: FAQ[]): FAQ[] {
  const seen = new Set<string>();
  const unique: FAQ[] = [];

  for (const faq of faqs) {
    const normalized = faq.question.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(faq);
    }
  }

  return unique;
}

export default {
  generateFAQs,
};
