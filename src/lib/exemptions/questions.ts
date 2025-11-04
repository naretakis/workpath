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

// Age-based questions
export const ageQuestions: ExemptionQuestion[] = [
  {
    id: "age-dob",
    category: "age",
    text: "What is your date of birth?",
    type: "date",
    helpText: "We use this to check if you're exempt based on age.",
    required: true,
  },
];

// Family/caregiving questions
export const familyCaregivingQuestions: ExemptionQuestion[] = [
  {
    id: "family-pregnant",
    category: "family-caregiving",
    text: "Are you currently pregnant or postpartum?",
    type: "boolean",
    helpText: "Postpartum means within 60 days after giving birth.",
    required: true,
  },
  {
    id: "family-child",
    category: "family-caregiving",
    text: "Do you live in a household with a child age 13 or younger?",
    type: "boolean",
    helpText: "This includes your own children or other dependents.",
    required: true,
  },
  {
    id: "family-disabled-dependent",
    category: "family-caregiving",
    text: "Are you a parent or guardian of someone with a disability?",
    type: "boolean",
    helpText:
      "This applies if you care for a child or adult with a disability.",
    required: true,
  },
];

// Health/disability questions
export const healthDisabilityQuestions: ExemptionQuestion[] = [
  {
    id: "health-medicare",
    category: "health-disability",
    text: "Are you on Medicare or entitled to Medicare?",
    type: "boolean",
    helpText:
      "Medicare is health insurance for people 65+ or with disabilities.",
    required: true,
  },
  {
    id: "health-non-magi",
    category: "health-disability",
    text: "Are you eligible for non-MAGI Medicaid?",
    type: "boolean",
    helpText:
      "Non-MAGI Medicaid is for people with disabilities or who are elderly. If you're not sure, select No.",
    required: true,
  },
  {
    id: "health-disabled-veteran",
    category: "health-disability",
    text: "Are you a disabled veteran?",
    type: "boolean",
    helpText:
      "This applies if you're a veteran with a service-connected disability.",
    required: true,
  },
  {
    id: "health-medically-frail",
    category: "health-disability",
    text: "Are you medically frail or have special needs?",
    type: "boolean",
    helpText:
      "This includes: blind, disabled, substance use disorder, disabling mental disorder, physical/intellectual/developmental disability, or serious/complex medical condition.",
    required: true,
  },
];

// Program participation questions
export const programParticipationQuestions: ExemptionQuestion[] = [
  {
    id: "program-snap-tanf",
    category: "program-participation",
    text: "Are you on SNAP or TANF and meeting those work requirements?",
    type: "boolean",
    helpText:
      "SNAP is food stamps. TANF is cash assistance. You must be meeting (not exempt from) their work requirements.",
    required: true,
  },
  {
    id: "program-rehab",
    category: "program-participation",
    text: "Are you participating in drug or alcohol rehabilitation?",
    type: "boolean",
    helpText: "This includes inpatient or outpatient treatment programs.",
    required: true,
  },
];

// Other exemptions questions
export const otherExemptionsQuestions: ExemptionQuestion[] = [
  {
    id: "other-incarcerated",
    category: "other",
    text: "Are you currently incarcerated or within 3 months of release?",
    type: "boolean",
    helpText:
      "This applies if you're currently in jail or prison, or were released in the last 3 months.",
    required: true,
  },
  {
    id: "other-tribal",
    category: "other",
    text: "Are you Indian, Urban Indian, California Indian, or IHS-eligible Indian?",
    type: "boolean",
    helpText:
      "This applies if you're a member of a federally recognized tribe or eligible for Indian Health Service.",
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
