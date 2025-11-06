/**
 * Plain Language Definitions for Exemption Screening Terms
 *
 * This file contains plain language definitions for technical and legal terms
 * used in the Medicaid work requirements exemption screening process.
 *
 * All definitions are written at an 8th grade reading level and use conversational
 * tone to help users understand complex terms without legal jargon.
 *
 * Three-Tier Information Architecture:
 * - Tier 1 (Question Text in questions.ts): Uses authoritative HR1 terminology
 * - Tier 2 (Help Text in questions.ts): Provides plain language translation
 * - Tier 3 (Definition Callouts - this file): Detailed definitions with examples
 *
 * All definitions align with updated question terminology from commit 0adec5c.
 * See HR1_COVERAGE_ANALYSIS.md for complete mapping of definitions to HR1 categories.
 *
 * Created: November 5, 2025
 * Last Updated: November 6, 2025 (Terminology Realignment)
 */

export interface TermDefinition {
  term: string;
  definition: string;
  examples?: string[];
  source:
    | "HR1 Section 71119"
    | "Service Blueprint"
    | "Domain Knowledge"
    | "Common knowledge/industry best practices";
  sourceReference?: string;
}

/**
 * All term definitions organized by category
 */
export const termDefinitions: Record<string, TermDefinition> = {
  // ============================================================================
  // HEALTH INSURANCE & PROGRAMS
  // ============================================================================

  medicare: {
    term: "Medicare",
    definition:
      "Federal health insurance for people 65 or older, or people under 65 with certain disabilities. If you have Medicare, you're exempt from work requirements.",
    examples: [
      "You turned 65 and enrolled in Medicare",
      "You receive Social Security disability benefits and have Medicare",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(II)(bb)",
  },

  nonMAGIMedicaid: {
    term: "Non-MAGI Medicaid",
    definition:
      "Medicaid for people with disabilities or elderly people who need long-term care. This is different from regular Medicaid. If you qualify for this type of Medicaid, you're exempt from work requirements.",
    examples: [
      "You receive Medicaid because you have a disability",
      "You're in a nursing home and Medicaid pays for your care",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(II)(bb)",
  },

  snap: {
    term: "SNAP",
    definition:
      "The Supplemental Nutrition Assistance Program, also called food stamps. It helps people buy groceries. If you're on SNAP and meeting their work requirements, you may be exempt from Medicaid work requirements.",
    examples: [
      "You get a card each month to buy food at the grocery store",
      "You receive food assistance benefits",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(VI)(bb)",
  },

  tanf: {
    term: "TANF",
    definition:
      "Temporary Assistance for Needy Families. It's cash assistance for families with children. If you're on TANF and meeting their work requirements, you may be exempt from Medicaid work requirements.",
    examples: [
      "You receive monthly cash payments to help with bills",
      "You get financial assistance for your family",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(VI)(aa)",
  },

  ihsEligible: {
    term: "IHS-eligible",
    definition:
      "Eligible for the Indian Health Service. If you're a member of a federally recognized tribe or meet certain criteria, you can get health care through IHS. If you're IHS-eligible, you're exempt from work requirements.",
    examples: [
      "You're enrolled in a federally recognized tribe",
      "You receive health care at an Indian Health Service facility",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(II)(cc)",
  },

  // ============================================================================
  // WORK & ACTIVITIES
  // ============================================================================

  communityEngagement: {
    term: "Community Engagement",
    definition:
      "Activities that count toward the 80 hours per month requirement. This includes working at a job, volunteering, going to school at least half-time, or participating in a work program.",
    examples: [
      "Working 20 hours per week at a job",
      "Volunteering 10 hours per week at a food bank",
      "Taking classes at a community college",
      "Attending job training through a workforce program",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(2)",
  },

  workProgram: {
    term: "Work Program",
    definition:
      "A program that helps you learn job skills or find work. This includes job training, workforce development, or employment services programs. Hours spent in these programs count toward your 80 hours per month.",
    examples: [
      "Job training at a workforce center",
      "Career counseling and job search assistance",
      "Skills training program",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(D)",
  },

  educationalProgramHalfTime: {
    term: "Educational Program - Half-Time",
    definition:
      "Going to school for at least half of what the school considers full-time. For most colleges, this means taking at least 6 credit hours per semester. Hours spent in class and studying count toward your 80 hours per month.",
    examples: [
      "Taking 2 classes at a community college (6 credits)",
      "Enrolled in a career training program for 12 hours per week",
      "Attending trade school part-time",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(B)",
  },

  // ============================================================================
  // FAMILY & CAREGIVING
  // ============================================================================

  postpartum: {
    term: "Postpartum",
    definition:
      "The period after giving birth. For Medicaid, this typically means within 60 days after you have a baby, but your state may extend this period. If you're postpartum, you're exempt from work requirements.",
    examples: [
      "You gave birth 3 weeks ago",
      "You're recovering from childbirth",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(IX)",
  },

  dependent: {
    term: "Dependent",
    definition:
      "A child or person you take care of. For work requirements, this usually means a child age 13 or younger, or someone with a disability that you care for.",
    examples: [
      "Your 8-year-old child",
      "A child you're the legal guardian for",
      "An adult child with a disability who lives with you",
    ],
    source: "Common knowledge/industry best practices",
  },

  dependentChild13OrYounger: {
    term: "Dependent Child 13 or Younger",
    definition:
      "A child age 13 or under who lives in your household. This includes your own children, stepchildren, or children you're the guardian for. If you live with a child this age, you're exempt from work requirements.",
    examples: [
      "Your 10-year-old daughter",
      "Your partner's 5-year-old son who lives with you",
      "A child you're the legal guardian for who is 12 years old",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(III)",
  },

  caretakerRelative: {
    term: "Caretaker Relative",
    definition:
      "A family member who takes care of a child. This includes parents, grandparents, aunts, uncles, or other relatives who are responsible for a child's care. If you're a caretaker relative of a child 13 or younger or someone with a disability, you're exempt from work requirements.",
    examples: [
      "A grandmother raising her grandchildren",
      "An aunt caring for her nephew",
      "A parent taking care of their child",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(III)",
  },

  // ============================================================================
  // HEALTH & DISABILITY
  // ============================================================================

  disabledVeteran: {
    term: "Disabled Veteran",
    definition:
      "A veteran who has a total disability rating from the VA (Veterans Affairs). This means the VA has determined you have a 100% service-connected disability. If you're a disabled veteran, you're exempt from work requirements.",
    examples: [
      "You receive 100% disability compensation from the VA",
      "The VA rated your service-connected disability as total",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(IV)",
  },

  medicallyFrail: {
    term: "Medically Frail",
    definition:
      "Having a serious health condition or disability that makes it hard to work or do daily activities. This includes being blind, disabled, having a substance use disorder, mental health condition, physical or developmental disability, or a serious medical condition. If you're medically frail, you're exempt from work requirements.",
    examples: [
      "You're blind or have very limited vision",
      "You have a disability that limits your daily activities",
      "You're being treated for drug or alcohol addiction",
      "You have a mental health condition that makes it hard to work",
      "You have a chronic illness that requires regular medical care",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)",
  },

  substanceUseDisorder: {
    term: "Substance Use Disorder",
    definition:
      "A medical condition where someone has trouble controlling their use of drugs or alcohol. This is also called addiction. If you have a substance use disorder, you're considered medically frail and exempt from work requirements.",
    examples: [
      "You're receiving treatment for drug addiction",
      "You're in recovery from alcohol addiction",
      "You're working with a counselor on substance abuse issues",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(bb)",
  },

  disablingMentalDisorder: {
    term: "Disabling Mental Disorder",
    definition:
      "A mental health condition that makes it hard to do daily activities or work. This includes conditions like severe depression, anxiety, bipolar disorder, schizophrenia, or PTSD. If you have a disabling mental disorder, you're exempt from work requirements.",
    examples: [
      "You have severe depression that makes it hard to leave the house",
      "You have PTSD that affects your ability to work",
      "You're being treated for schizophrenia",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(cc)",
  },

  physicalIntellectualDevelopmentalDisability: {
    term: "Physical/Intellectual/Developmental Disability",
    definition:
      "A condition that significantly limits your ability to do everyday activities. Physical disabilities affect your body (like not being able to walk). Intellectual or developmental disabilities affect learning and thinking (like Down syndrome or autism). If you have any of these, you're exempt from work requirements.",
    examples: [
      "You use a wheelchair and can't walk",
      "You have cerebral palsy",
      "You have Down syndrome",
      "You have autism",
      "You have a traumatic brain injury",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(dd)",
  },

  seriousComplexMedicalCondition: {
    term: "Serious or Complex Medical Condition",
    definition:
      "An ongoing health problem that requires regular medical care or treatment. This includes conditions like cancer, heart disease, diabetes with complications, kidney disease, or other chronic illnesses. If you have a serious or complex medical condition, you're exempt from work requirements.",
    examples: [
      "You're receiving chemotherapy for cancer",
      "You have heart disease and see a cardiologist regularly",
      "You have kidney disease and need dialysis",
      "You have severe asthma that requires frequent treatment",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(ee)",
  },

  // ============================================================================
  // PROGRAMS & REHABILITATION
  // ============================================================================

  drugAlcoholRehabProgram: {
    term: "Drug/Alcohol Rehabilitation Program",
    definition:
      "A treatment program for people with drug or alcohol addiction. This can be inpatient (you stay at a facility) or outpatient (you go for treatment but live at home). If you're in a rehab program, you're exempt from work requirements.",
    examples: [
      "You're in a 30-day inpatient treatment program",
      "You attend outpatient counseling 3 times per week",
      "You're in a recovery program at a treatment center",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(VII)",
  },

  // ============================================================================
  // OTHER CIRCUMSTANCES
  // ============================================================================

  inmate: {
    term: "Inmate",
    definition:
      "A person who is in jail or prison. If you're currently incarcerated or were released within the last 3 months, you're exempt from work requirements during that time.",
    examples: [
      "You're currently in county jail",
      "You're in state prison",
      "You were released from jail 2 months ago",
    ],
    source: "HR1 Section 71119",
    sourceReference:
      "Section 1902(xx)(9)(A)(ii)(VIII) and Section 1902(xx)(3)(A)(ii)",
  },

  indianUrbanIndianCaliforniaIndian: {
    term: "Indian/Urban Indian/California Indian",
    definition:
      "A person who is a member of a federally recognized Native American tribe, lives in an urban area and is of Native American descent, or is a California Indian. If you're in any of these categories, you're exempt from work requirements.",
    examples: [
      "You're enrolled in a federally recognized tribe",
      "You're Native American and live in a city",
      "You're a California Indian",
    ],
    source: "HR1 Section 71119",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(II)",
  },
};

/**
 * Get definition for a specific term
 */
export function getDefinition(termKey: string): TermDefinition | undefined {
  return termDefinitions[termKey];
}

/**
 * Get all definitions for a specific category
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDefinitionsByCategory(category: string): TermDefinition[] {
  // This could be expanded to organize definitions by category
  return Object.values(termDefinitions);
}

/**
 * Search definitions by term name
 */
export function searchDefinitions(searchTerm: string): TermDefinition[] {
  const lowerSearch = searchTerm.toLowerCase();
  return Object.values(termDefinitions).filter(
    (def) =>
      def.term.toLowerCase().includes(lowerSearch) ||
      def.definition.toLowerCase().includes(lowerSearch),
  );
}

/**
 * Get definitions used in a specific question
 * Maps question IDs to relevant definition keys
 */
export const questionDefinitionMap: Record<string, string[]> = {
  "age-dob": [],
  "family-pregnant": ["postpartum"],
  "family-child": ["dependentChild13OrYounger", "dependent"],
  "family-disabled-dependent": ["caretakerRelative", "dependent"],
  "health-medicare": ["medicare"],
  "health-non-magi": ["nonMAGIMedicaid"],
  "health-disabled-veteran": ["disabledVeteran"],
  "health-medically-frail": [
    "medicallyFrail",
    "substanceUseDisorder",
    "disablingMentalDisorder",
    "physicalIntellectualDevelopmentalDisability",
    "seriousComplexMedicalCondition",
  ],
  "program-snap-tanf": ["snap", "tanf", "communityEngagement"],
  "program-rehab": ["drugAlcoholRehabProgram"],
  "other-incarcerated": ["inmate"],
  "other-tribal": ["indianUrbanIndianCaliforniaIndian", "ihsEligible"],
};

/**
 * Get definitions relevant to a specific question
 */
export function getDefinitionsForQuestion(
  questionId: string,
): TermDefinition[] {
  const definitionKeys = questionDefinitionMap[questionId] || [];
  return definitionKeys
    .map((key) => termDefinitions[key])
    .filter((def): def is TermDefinition => def !== undefined);
}
