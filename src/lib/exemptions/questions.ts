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
 * COMMUNITY ENGAGEMENT SCREENING QUESTIONS
 *
 * AUTHORITY (re-cited by W2a § 2.4)
 * CMS-2454-IFC, 91 FR 33348 (June 3, 2026), corrected at 91 FR 39028
 * (June 29, 2026), effective July 31, 2026. Implements SSA § 1902(xx) as added by
 * § 71119 of PL 119-21 and codifies it at 42 CFR 435.550-435.563. The per-question
 * `HR1 Reference` comments below remain accurate as provenance, but the CFR is
 * what controls; this table is the mapping.
 *
 * STRUCTURE OF § 435.554, because it is easy to get wrong and W2a did get it wrong
 * on first pass: **(a)** holds the six supporting DEFINITIONS (caretaker relative,
 * dependent child, disabled individual, family caregiver, guardian, parent),
 * alphabetical and unnumbered. **(b)** is the operative exclusion sentence.
 * **(c)(1)-(c)(10)** are the ten categories. Confirmed in the IFC preamble:
 * "We define the terms caretaker relative, dependent child, disabled individual,
 * family caregiver, guardian and parent at § 435.554(a)" (91 FR 33348 at the
 * § II.E.3 discussion), with (c)(1) former foster care, (c)(2) American Indians,
 * (c)(3) caregivers, (c)(9) inmates each named explicitly.
 *
 * | Question                        | CFR                              | Tier              |
 * |---------------------------------|----------------------------------|-------------------|
 * | Date of birth, under 19         | 435.553(a)(1)                    | exception         |
 * | Date of birth, 65+              | 435.551, 435.119                 | OUTSIDE the group |
 * | Pregnant or postpartum          | 435.554(c)(10)                   | exclusion         |
 * | Dependent child 13 or under     | 435.554(c)(3); definition at (a) | exclusion         |
 * | Caring for a disabled individual| 435.554(c)(3); definition at (a) | exclusion         |
 * | Medicare                        | 435.553(a)(2)                    | exception         |
 * | Non-MAGI Medicaid               | 435.553(a)(3)                    | exception         |
 * | Veteran rated as total          | 435.554(c)(4)                    | exclusion         |
 * | Medically frail                 | 435.554(c)(5)                    | exclusion         |
 * | TANF compliance                 | 435.554(c)(6)                    | exclusion         |
 * | SNAP household                  | 435.554(c)(7)                    | exclusion         |
 * | Rehabilitation program          | 435.554(c)(8)                    | exclusion         |
 * | Inmate                          | 435.554(c)(9)                    | exclusion         |
 * | Within 3 months of release      | 435.553(b)                       | exception         |
 * | Indian / Urban Indian / IHS     | 435.554(c)(2)                    | exclusion         |
 * | Former foster care, NO QUESTION | 435.554(c)(1)                    | exclusion         |
 *
 * The three tiers have DIFFERENT LEGAL EFFECTS and this file's flat "exemption"
 * framing cannot express them — 435.556(c) prohibits the state from assessing an
 * excluded individual at all, while an exception means the month is deemed met.
 * W3 models the tiers; W4 rebuilds these questions.
 *
 * KNOWN GAPS in these questions, hedged in the help text rather than repeated as
 * fact (W4 fixes the questions themselves):
 *  - "veteran with a disability rated as total" excludes TDIU veterans as asked
 *  - the SNAP test is being SUBJECT TO SNAP work requirements, not complying with
 *    them, and it keys on HOUSEHOLD receipt — different from the TANF test
 *  - "disabled individual" uses the ADA definition at 28 CFR 35.108, which is
 *    broader than "someone with a disability", and 435.554(c)(3)(ii) lets multiple
 *    adults in one residence each qualify
 *  - former foster care children (435.554(c)(1)) has NO QUESTION AT ALL
 *
 * Three-Tier Information Architecture:
 * - Tier 1 (Question Text): authoritative terminology for legal accuracy
 * - Tier 2 (Help Text): plain language translation (8th grade reading level)
 * - Tier 3 (Definition Callouts): detailed definitions with examples (definitions.ts)
 *
 * Full cited extract: docs/domain/cms-2454-ifc/rule-extract.md
 * Statute: docs/domain/hr1/119hr1enr-title7-part3.md (Section 71119)
 */

// Age-based questions
// HR1 Reference: Section 71119(3)(A)(i)(II)(aa) - "under the age of 19"
// HR1 Reference: Section 71119(9)(A)(i)(II)(bb) - "under 65 years of age" (inverse = 65 or older)
// Restored from commit 0adec5c - question text already uses appropriate terminology
export const ageQuestions: ExemptionQuestion[] = [
  {
    id: "age-dob",
    category: "age",
    text: "What is your date of birth?", // Tier 1: HR1-aligned terminology (straightforward question)
    type: "date",
    helpText:
      // Two different mechanisms, and neither is an "exemption".
      // Under 19: a mandatory exception, 42 CFR 435.553(a)(1) — the month counts
      // as already met. 65 and over: OUTSIDE 435.551 entirely, because the adult
      // group at 435.119 is ages 19-64 (gap 15.21). W3 models the distinction.
      "We use this to work out whether the requirement reaches you at all. It applies to adults aged 19 to 64. Under 19, months count as already met; at 65 or older you're in a different coverage group.", // Tier 2: Plain language translation
    required: true,
  },
];

// Family/caregiving questions
// HR1 Reference: Section 71119(9)(A)(ii)(III) - Parent/guardian/caretaker of dependent child or disabled individual
// HR1 Reference: Section 71119(9)(A)(ii)(IX) - Pregnant or postpartum
// Restored from commit 0adec5c with three-tier structure
export const familyCaregivingQuestions: ExemptionQuestion[] = [
  {
    id: "family-pregnant",
    // HR1 Reference: Section 71119(9)(A)(ii)(IX) - "pregnant or entitled to postpartum medical assistance"
    // Restored from commit 0adec5c
    category: "family-caregiving",
    text: "Are you currently pregnant or postpartum?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      // 42 CFR 435.554(c)(10) — pregnant or entitled to postpartum coverage under
      // SSA 1902(e)(5) or (e)(16). Most states now run 12-month postpartum
      // coverage under (e)(16), so a flat "60 days" understates it and would have
      // people answering no while still covered.
      "Are you pregnant, or covered by Medicaid after giving birth? Postpartum coverage often runs for 12 months rather than 60 days, so say yes if you're unsure and ask your state how long yours lasts.", // Tier 2: Plain language translation
    required: true,
  },
  {
    id: "family-child",
    // HR1 Reference: Section 71119(9)(A)(ii)(III) - "dependent child 13 years of age and under"
    // Restored from commit 0adec5c
    category: "family-caregiving",
    text: "Do you live in a household with a dependent child 13 years of age and under?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      // 42 CFR 435.554(c)(3), with "dependent child" defined at (a) — a dependent child is 13 or UNDER and relies
      // on another individual for care.
      "Do you live with a child age 13 or younger? This includes your own children, stepchildren, or children you care for. If yes, this may be one of the categories that are set aside — tell your state who you care for.", // Tier 2: Plain language translation
    required: true,
  },
  {
    id: "family-disabled-dependent",
    // HR1 Reference: Section 71119(9)(A)(ii)(III) - "parent, guardian, caretaker relative, or family caregiver of a disabled individual"
    // Restored from commit 0adec5c
    category: "family-caregiving",
    text: "Are you a parent, guardian, caretaker relative, or family caregiver of a disabled individual?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      // 42 CFR 435.554(c)(3), with "disabled individual" defined at (a) — "disabled individual" uses the ADA
      // definition at 28 CFR 35.108 and the person need NOT be Medicaid-eligible on
      // the basis of disability. (c)(3)(ii) allows multiple adults in one residence
      // each to qualify. W4 widens this question; the help text widens now.
      "Do you care for someone with a disability, a child or an adult? They don't have to be on Medicaid for their disability, and more than one adult in a home can be counted. If yes, this may be one of the categories that are set aside — tell your state who you care for and what you do for them.", // Tier 2: Plain language translation
    required: true,
  },
];

// Health/disability questions
// HR1 Reference: Section 71119(9)(A)(ii)(I) - Non-MAGI Medicaid
// HR1 Reference: Section 71119(9)(A)(ii)(IV) - Disabled veteran
// HR1 Reference: Section 71119(9)(A)(ii)(V) - Medically frail or special medical needs
// HR1 Reference: Section 71119(3)(A)(i)(II)(bb) - Entitled to or enrolled for Medicare
// Restored from commit 0adec5c with three-tier structure
export const healthDisabilityQuestions: ExemptionQuestion[] = [
  {
    id: "health-medicare",
    // HR1 Reference: Section 71119(3)(A)(i)(II)(bb) - "entitled to, or enrolled for, benefits under part A of title XVIII, or enrolled for benefits under part B of title XVIII"
    // Restored from commit 0adec5c
    category: "health-disability",
    text: "Are you entitled to or enrolled for Medicare?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      "Do you have Medicare? Medicare is federal health insurance, usually for people 65 or older or with certain disabilities. This is different from Medicaid.", // Tier 2: Plain language translation
    required: true,
  },
  {
    id: "health-non-magi",
    // HR1 Reference: Section 71119(9)(A)(ii)(I) - "described in subsection (a)(10)(A)(i)(IX)" (non-MAGI Medicaid)
    // Restored from commit 0adec5c
    category: "health-disability",
    text: "Are you eligible for non-MAGI Medicaid?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      "Do you get Medicaid because of a disability or long-term care needs? This is a special type of Medicaid for people with disabilities or in nursing homes. If you're not sure, select 'No'.", // Tier 2: Plain language translation
    required: true,
  },
  {
    id: "health-disabled-veteran",
    // HR1 Reference: Section 71119(9)(A)(ii)(IV) - "veteran with a disability rated as total under section 1155 of title 38, United States Code"
    // Restored from commit 0adec5c
    category: "health-disability",
    text: "Are you a veteran with a disability rated as total?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      // 42 CFR 435.554(c)(4) — rated as TOTAL under 38 U.S.C. 1155, TEMPORARY OR
      // PERMANENT. The IFC preamble is explicit that TDIU veterans, paid at the
      // 100 percent rate because their disabilities prevent them working, "must be
      // treated by States in the same manner" as veterans with a combined 100
      // percent rating.
      //
      // The old help text said "100% disability rating" and then "If you're not
      // sure of your rating, select 'No'" — which excluded TDIU veterans AND
      // suppressed the qualifying answer for anyone uncertain. Twice
      // user-unfavourable, and it contradicted definitions.ts and calculator.ts,
      // which W2a had already corrected. Never tell a user to answer No when unsure
      // on a question that could take them out of the requirement.
      "Has the VA rated your disability as total? That includes a temporary total rating, and it includes being paid at the total rate because your disabilities keep you from working, even if the percentages add up to less than 100. If you're not sure, say yes and ask your state to check your rating decision — don't rule yourself out.", // Tier 2: Plain language translation
    required: true,
  },
  {
    id: "health-medically-frail",
    // HR1 Reference: Section 71119(9)(A)(ii)(V) - "medically frail or otherwise has special medical needs"
    // Includes 5 sub-categories: (aa) blind/disabled, (bb) substance use disorder, (cc) disabling mental disorder,
    // (dd) physical/intellectual/developmental disability, (ee) serious/complex medical condition
    // Restored from commit 0adec5c
    category: "health-disability",
    text: "Are you medically frail or otherwise have special medical needs?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      "Do you have a serious health condition or disability? This includes being blind, disabled, having substance use disorder, mental health conditions, or chronic illnesses. Tap the info icons below for detailed examples.", // Tier 2: Plain language translation
    required: true,
  },
];

// Program participation questions
// HR1 Reference: Section 71119(9)(A)(ii)(VI) - SNAP/TANF work requirement compliance
// HR1 Reference: Section 71119(9)(A)(ii)(VII) - Drug/alcohol rehabilitation participation
// Restored from commit 0adec5c with three-tier structure
export const programParticipationQuestions: ExemptionQuestion[] = [
  {
    id: "program-snap-tanf",
    // HR1 Reference: Section 71119(9)(A)(ii)(VI) - "in compliance with any requirements imposed by the State pursuant to section 407" or "member of a household that receives supplemental nutrition assistance program benefits"
    // Restored from commit 0adec5c
    category: "program-participation",
    text: "Are you in compliance with SNAP or TANF work requirements?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      // TWO DIFFERENT TESTS, conflated by one question. W4 splits them.
      //  - TANF, 42 CFR 435.554(c)(6): the individual must be COMPLYING with TANF
      //    work requirements under SSA 407.
      //  - SNAP, 42 CFR 435.554(c)(7): a member of a HOUSEHOLD receiving SNAP who
      //    is NOT EXEMPT from a SNAP work requirement. The test is being SUBJECT TO
      //    those requirements, not complying with them, and it keys on household
      //    receipt rather than the individual's own.
      //
      // The old help text applied TANF's standard to both — "You must be actively
      // meeting their work requirements" — which is wrong for SNAP and wrong in the
      // user-unfavourable direction: it told someone subject to SNAP work rules but
      // behind on them to answer No, when for SNAP that answer should be Yes.
      "Does your household get SNAP (food stamps), or do you get TANF (cash assistance)? These work differently. For TANF, it's about keeping up with its work rules. For SNAP, it's about your household getting SNAP and those work rules applying to you — you don't have to be keeping up with them. Say yes if either fits, and let your state sort out which.", // Tier 2: Plain language translation
    required: true,
  },
  {
    id: "program-rehab",
    // HR1 Reference: Section 71119(9)(A)(ii)(VII) - "participating in a drug addiction or alcoholic treatment and rehabilitation program"
    // Restored from commit 0adec5c
    category: "program-participation",
    text: "Are you participating in a drug addiction or alcoholic treatment and rehabilitation program?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      "Are you currently in a drug or alcohol treatment program? This includes inpatient programs (where you stay at a facility) or outpatient programs (where you go for treatment but live at home).", // Tier 2: Plain language translation
    required: true,
  },
];

// Other exemptions questions
// HR1 Reference: Section 71119(9)(A)(ii)(II) - Indian/Urban Indian/California Indian/IHS-eligible
// HR1 Reference: Section 71119(9)(A)(ii)(VIII) - Inmate of public institution
// Restored from commit 0adec5c with three-tier structure
export const otherExemptionsQuestions: ExemptionQuestion[] = [
  {
    id: "other-incarcerated",
    // HR1 Reference: Section 71119(9)(A)(ii)(VIII) - "inmate of a public institution"
    // HR1 Reference: Section 71119(3)(A)(ii) - "within 3-month period ending on the first day of such month, the individual was an inmate"
    // Restored from commit 0adec5c
    category: "other",
    text: "Are you an inmate of a public institution or within 3 months of release?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      // Currently an inmate: specified exclusion, 42 CFR 435.554(c)(9) with
      // 435.1010. Recently released: mandatory exception, 435.553(b) — an inmate
      // at any point in the 3-month period ENDING ON THE FIRST DAY of the month.
      "Are you in jail or prison now, or were you released in the last 3 months? If yes, this may be one of the categories that are set aside, and months within three months of release should count as already met. Tell your state your release date.", // Tier 2: Plain language translation
    required: true,
  },
  {
    id: "other-tribal",
    // HR1 Reference: Section 71119(9)(A)(ii)(II) - "Indian or an Urban Indian", "California Indian", "IHS-eligible Indian"
    // Restored from commit 0adec5c
    category: "other",
    text: "Are you an Indian, Urban Indian, California Indian, or IHS-eligible Indian?", // Tier 1: HR1 terminology
    type: "boolean",
    helpText:
      "Are you a member of a Native American tribe or eligible for Indian Health Service? This includes being enrolled in a federally recognized tribe, being an Urban Indian, California Indian, or eligible for IHS services.", // Tier 2: Plain language translation
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
