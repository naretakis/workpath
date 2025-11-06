import { ExemptionCategory } from "@/types/exemptions";

export type QuestionType = "date" | "boolean" | "multipleChoice";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface ExemptionQuestion {
  id: string;
  category: ExemptionCategory;
  text: string;
  type: QuestionType;
  helpText?: string;
  options?: QuestionOption[];
  required: boolean;
}

/**
 * EXEMPTION QUESTIONS - HR1 SECTION 71119 COVERAGE
 *
 * All questions in this file implement exemption categories defined in HR1 Section 71119.
 * See HR1_COVERAGE_ANALYSIS.md for complete mapping of questions to HR1 categories.
 *
 * Three-Tier Information Architecture:
 * - Tier 1 (Question Text): Uses authoritative HR1 terminology for legal accuracy
 * - Tier 2 (Help Text): Provides plain language translation (8th grade reading level)
 * - Tier 3 (Definition Callouts): Detailed definitions with examples (via definitions.ts)
 *
 * HR1 Reference: docs/domain/hr1/119hr1enr-title7-part3.md (Section 71119)
 */

// Age-based questions
// HR1 Reference: Section 71119(3)(A)(i)(II)(aa) - "under the age of 19"
// HR1 Reference: Section 71119(9)(A)(i)(II)(bb) - "under 65 years of age" (inverse = 65 or older)
export const ageQuestions: ExemptionQuestion[] = [
  {
    id: "age-dob",
    category: "age",
    text: "What is your date of birth?",
    type: "date",
    helpText:
      "We'll check if you're exempt based on your age. People 18 or younger and 65 or older are exempt.",
    required: true,
  },
];

// Family/caregiving questions
// HR1 Reference: Section 71119(9)(A)(ii)(III) - Parent/guardian/caretaker of dependent child or disabled individual
// HR1 Reference: Section 71119(9)(A)(ii)(IX) - Pregnant or postpartum
export const familyCaregivingQuestions: ExemptionQuestion[] = [
  {
    id: "family-pregnant",
    // HR1 Reference: Section 71119(9)(A)(ii)(IX) - "pregnant or entitled to postpartum medical assistance"
    category: "family-caregiving",
    text: "Are you currently pregnant or recently gave birth?",
    type: "boolean",
    helpText:
      "If you're pregnant or gave birth within the last 60 days, you're exempt. Select 'Yes' if either applies to you.",
    required: true,
  },
  {
    id: "family-child",
    // HR1 Reference: Section 71119(9)(A)(ii)(III) - "dependent child 13 years of age and under"
    category: "family-caregiving",
    text: "Do you live with a child age 13 or younger?",
    type: "boolean",
    helpText:
      "This includes your own children, stepchildren, or children you care for. The child must live in your household.",
    required: true,
  },
  {
    id: "family-disabled-dependent",
    // HR1 Reference: Section 71119(9)(A)(ii)(III) - "parent, guardian, caretaker relative, or family caregiver of a disabled individual"
    category: "family-caregiving",
    text: "Are you a parent or guardian of someone with a disability?",
    type: "boolean",
    helpText:
      "This includes caring for a child or adult with a disability. You must be their parent or legal guardian.",
    required: true,
  },
];

// Health/disability questions
// HR1 Reference: Section 71119(9)(A)(ii)(I) - Non-MAGI Medicaid
// HR1 Reference: Section 71119(9)(A)(ii)(IV) - Disabled veteran
// HR1 Reference: Section 71119(9)(A)(ii)(V) - Medically frail or special medical needs
// HR1 Reference: Section 71119(3)(A)(i)(II)(bb) - Entitled to or enrolled for Medicare
export const healthDisabilityQuestions: ExemptionQuestion[] = [
  {
    id: "health-medicare",
    // HR1 Reference: Section 71119(3)(A)(i)(II)(bb) - "entitled to, or enrolled for, benefits under part A of title XVIII, or enrolled for benefits under part B of title XVIII"
    category: "health-disability",
    text: "Do you have Medicare?",
    type: "boolean",
    helpText:
      "Medicare is federal health insurance, usually for people 65+ or with certain disabilities. This is different from Medicaid.",
    required: true,
  },
  {
    id: "health-non-magi",
    // HR1 Reference: Section 71119(9)(A)(ii)(I) - "described in subsection (a)(10)(A)(i)(IX)" (non-MAGI Medicaid)
    category: "health-disability",
    text: "Do you get Medicaid because of a disability or long-term care needs (non-MAGI Medicaid)?",
    type: "boolean",
    helpText:
      "This is a special type of Medicaid for people with disabilities or in nursing homes. If you're not sure, select 'No'.",
    required: true,
  },
  {
    id: "health-disabled-veteran",
    // HR1 Reference: Section 71119(9)(A)(ii)(IV) - "veteran with a disability rated as total under section 1155 of title 38, United States Code"
    category: "health-disability",
    text: "Are you a veteran with a 100% disability rating from the VA?",
    type: "boolean",
    helpText:
      "This means the VA determined you have a total (100%) service-connected disability. If you're not sure of your rating, select 'No'.",
    required: true,
  },
  {
    id: "health-medically-frail",
    // HR1 Reference: Section 71119(9)(A)(ii)(V) - "medically frail or otherwise has special medical needs"
    // Includes 5 sub-categories: (aa) blind/disabled, (bb) substance use disorder, (cc) disabling mental disorder,
    // (dd) physical/intellectual/developmental disability, (ee) serious/complex medical condition
    category: "health-disability",
    text: "Do you have a serious health condition or disability (defined as medically frail or special needs)?",
    type: "boolean",
    helpText:
      "This includes being blind, disabled, having substance use disorder, mental health conditions, or chronic illnesses. Check the definitions below for detailed examples.",
    required: true,
  },
];

// Program participation questions
// HR1 Reference: Section 71119(9)(A)(ii)(VI) - SNAP/TANF work requirement compliance
// HR1 Reference: Section 71119(9)(A)(ii)(VII) - Drug/alcohol rehabilitation participation
export const programParticipationQuestions: ExemptionQuestion[] = [
  {
    id: "program-snap-tanf",
    // HR1 Reference: Section 71119(9)(A)(ii)(VI) - "in compliance with any requirements imposed by the State pursuant to section 407" or "member of a household that receives supplemental nutrition assistance program benefits"
    category: "program-participation",
    text: "Are you on food stamps (SNAP) or cash assistance (TANF) and meeting their work requirements?",
    type: "boolean",
    helpText:
      "Important: You must be actively meeting their work requirements (not exempt from them). If you're exempt from SNAP/TANF work requirements, select 'No'.",
    required: true,
  },
  {
    id: "program-rehab",
    // HR1 Reference: Section 71119(9)(A)(ii)(VII) - "participating in a drug addiction or alcoholic treatment and rehabilitation program"
    category: "program-participation",
    text: "Are you currently in a drug or alcohol treatment program?",
    type: "boolean",
    helpText:
      "This includes inpatient programs (where you stay at a facility) or outpatient programs (where you go for treatment but live at home).",
    required: true,
  },
];

// Other exemptions questions
// HR1 Reference: Section 71119(9)(A)(ii)(II) - Indian/Urban Indian/California Indian/IHS-eligible
// HR1 Reference: Section 71119(9)(A)(ii)(VIII) - Inmate of public institution
export const otherExemptionsQuestions: ExemptionQuestion[] = [
  {
    id: "other-incarcerated",
    // HR1 Reference: Section 71119(9)(A)(ii)(VIII) - "inmate of a public institution"
    // HR1 Reference: Section 71119(3)(A)(ii) - "within 3-month period ending on the first day of such month, the individual was an inmate"
    category: "other",
    text: "Are you currently in jail or prison, or were you released in the last 3 months?",
    type: "boolean",
    helpText:
      "Select 'Yes' if you're currently incarcerated or if you were released within the last 3 months. After 3 months, you'll need to re-screen.",
    required: true,
  },
  {
    id: "other-tribal",
    // HR1 Reference: Section 71119(9)(A)(ii)(II) - "Indian or an Urban Indian", "California Indian", "IHS-eligible Indian"
    category: "other",
    text: "Are you a member of a Native American tribe or eligible for Indian Health Service?",
    type: "boolean",
    helpText:
      "This includes being enrolled in a federally recognized tribe, being an Urban Indian, California Indian, or eligible for IHS services.",
    required: true,
  },
];

// All questions in order
export const allQuestions: ExemptionQuestion[] = [
  ...ageQuestions,
  ...familyCaregivingQuestions,
  ...healthDisabilityQuestions,
  ...programParticipationQuestions,
  ...otherExemptionsQuestions,
];

// Get questions by category
export function getQuestionsByCategory(
  category: ExemptionCategory,
): ExemptionQuestion[] {
  switch (category) {
    case "age":
      return ageQuestions;
    case "family-caregiving":
      return familyCaregivingQuestions;
    case "health-disability":
      return healthDisabilityQuestions;
    case "program-participation":
      return programParticipationQuestions;
    case "other":
      return otherExemptionsQuestions;
  }
}

// Get question by ID
export function getQuestionById(id: string): ExemptionQuestion | undefined {
  return allQuestions.find((q) => q.id === id);
}

// Get category order for screening flow
export const categoryOrder: ExemptionCategory[] = [
  "age",
  "family-caregiving",
  "health-disability",
  "program-participation",
  "other",
];
