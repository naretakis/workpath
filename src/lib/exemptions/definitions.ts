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
 * - Tier 1 (Question Text in questions.ts): Uses authoritative CMS terminology
 * - Tier 2 (Help Text in questions.ts): Provides plain language translation
 * - Tier 3 (Definition Callouts - this file): Detailed definitions with examples
 *
 * AUTHORITY (updated by W2a § 2.4)
 * CMS-2454-IFC, 91 FR 33348 (June 3, 2026), corrected at 91 FR 39028
 * (June 29, 2026), effective July 31, 2026. Implements SSA § 1902(xx) as added
 * by § 71119 of PL 119-21, and codifies it at 42 CFR 435.550-435.563.
 *
 * The statute is provenance; the CFR is what controls. CMS calls PL 119-21 the
 * "Working Families Tax Cut (WFTC) legislation", and the rule's own term is the
 * COMMUNITY ENGAGEMENT REQUIREMENT. User-facing copy may still say "work
 * requirements" where that genuinely aids comprehension.
 *
 * THREE TIERS WITH DIFFERENT LEGAL EFFECTS — this file's word "exemption" flattens
 * them, and W3 models them properly:
 *   42 CFR 435.554  specified excluded individual. NOT an applicable individual;
 *                   435.556(c) PROHIBITS the state from assessing compliance
 *   42 CFR 435.553  mandatory exception. Still applicable, but DEEMED to have
 *                   demonstrated engagement for the month
 *   42 CFR 435.555  optional short-term hardship. A state election, all four
 *                   event types or none
 *
 * Full cited extract: docs/domain/cms-2454-ifc/rule-extract.md
 *
 * Created: November 5, 2025
 * Last Updated: August 17, 2026 (W2a — truth in copy; re-cited to the CFR)
 */

export interface TermDefinition {
  term: string;
  definition: string;
  examples?: string[];
  /**
   * W2a § 2.4: the operative authority is the codified rule, not the statute.
   * PL 119-21 § 71119 added SSA § 1902(xx); CMS-2454-IFC implements it and
   * codifies it at 42 CFR 435.550-435.563. Citing only the statute points at
   * text that no longer controls the detail — the tier structure, the
   * definitions, and the verification rules all live in the CFR.
   */
  source:
    | "42 CFR 435.550-435.563 (CMS-2454-IFC)"
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
      // 42 CFR 435.553(a)(2) — entitled to or enrolled for Part A, or enrolled
      // for Part B. A mandatory exception: deemed to have demonstrated community
      // engagement for any month it applies to, for part or all of the month.
      "Federal health insurance for people 65 or older, or people under 65 with certain disabilities. Part A or Part B both matter here: for any month you have Medicare, your state should treat this requirement as already met. Ask your state to confirm it has your Medicare enrolment on file — that's normally something it can look up itself.",
    examples: [
      "You turned 65 and enrolled in Medicare",
      "You receive Social Security disability benefits and have Medicare",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(II)(bb)",
  },

  nonMAGIMedicaid: {
    term: "Non-MAGI Medicaid",
    definition:
      // 42 CFR 435.553(a)(3) — described in a mandatory coverage group at
      // SSA 1902(a)(10)(A)(i)(I)-(VII). Also 435.551, which limits applicable
      // individuals to the 435.119 adult group, and 435.603(j), which lists where
      // MAGI methods do not apply at all.
      "Medicaid for people with disabilities or elderly people who need long-term care. This is a different group from the one this requirement is attached to, so it may not be a condition of your coverage at all. Ask your state which coverage group you're in — that one question settles it, and it's something it can answer from its own records.",
    examples: [
      "You receive Medicaid because you have a disability",
      "You're in a nursing home and Medicaid pays for your care",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(II)(bb)",
  },

  snap: {
    term: "SNAP",
    definition:
      // 42 CFR 435.554(c)(7) — a member of a HOUSEHOLD that receives SNAP and is
      // NOT EXEMPT from a SNAP work requirement. The test is being SUBJECT TO those
      // requirements, not complying with them, and it keys on household receipt.
      // Was "If you're on SNAP and meeting their work requirements" — the TANF
      // standard applied to SNAP, wrong in the user-unfavourable direction, and the
      // same error questions.ts documents itself as having fixed.
      "The Supplemental Nutrition Assistance Program, also called food stamps. It helps people buy groceries. For this requirement, what matters is that your household gets SNAP and its work rules apply to you — you don't have to be keeping up with them. Tell your state you're on SNAP and bring your approval notice.",
    examples: [
      "You get a card each month to buy food at the grocery store",
      "You receive food assistance benefits",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(VI)(bb)",
  },

  tanf: {
    term: "TANF",
    definition:
      // 42 CFR 435.554(c)(6) — COMPLIANT with TANF work requirements under SSA 407.
      // Unlike SNAP, compliance is the test here. States define compliance
      // differently, so the detail varies. CMS tells states not to rely on
      // reporting from the individual for this one.
      "Temporary Assistance for Needy Families. It's cash assistance for families with children. For this requirement, what matters is keeping up with TANF's own work rules — which is different from how SNAP works. Tell your state you're on TANF and ask it to check with the TANF agency; it isn't supposed to make you prove this yourself.",
    examples: [
      "You receive monthly cash payments to help with bills",
      "You get financial assistance for your family",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(VI)(aa)",
  },

  ihsEligible: {
    term: "IHS-eligible",
    definition:
      // 42 CFR 435.554(c)(2), using the definition at 42 CFR 447.51 — Indian,
      // Urban Indian, California Indian, IHS-eligible. STATES MUST NOT REVERIFY
      // this status once established, which is worth telling people.
      "Eligible for the Indian Health Service. If you're a member of a federally recognized tribe or meet certain criteria, you can get health care through IHS. This is one of the categories the rule sets aside. Tell your state once and ask it to record your status permanently — it isn't allowed to make you prove this again at later renewals.",
    examples: [
      "You're enrolled in a federally recognized tribe",
      "You receive health care at an Indian Health Service facility",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(II)(cc)",
  },

  // ============================================================================
  // WORK & ACTIVITIES
  // ============================================================================

  communityEngagement: {
    term: "Community Engagement",
    definition:
      // 42 CFR 435.552(a) — seven pathways. The old text listed "going to school at
      // least half-time" among things that count toward 80 hours, which is the
      // 435.552(a)(4)/(a)(5) error again: half-time school needs no hours and may
      // not be combined. Work here includes in-kind and unpaid work, 435.552(b).
      "The activities that can satisfy this requirement. Work, volunteering, and job training add up to a monthly total of 80 hours between them. Being in school at least half-time is different: it can be enough on its own, with no hours to count. Income is another route again.",
    examples: [
      "Working 20 hours a week at a job",
      "Volunteering 10 hours a week through an organized program",
      "Unpaid work, or work paid in housing or meals rather than money",
      "Job training through a qualifying workforce program",
      "Being enrolled at least half-time in school, which needs no hours",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(2)",
  },

  workProgram: {
    term: "Work Program",
    definition:
      // 42 CFR 435.552(b) is a CLOSED LIST of five program types, and standalone
      // supervised job search or job search training is expressly EXCLUDED.
      // The old definition was generic ("job training, workforce development, or
      // employment services") and listed "Career counseling and job search
      // assistance" as a qualifying example — wrong in the user-FAVOURABLE
      // direction, which is the more dangerous one here: a user logs hours the
      // state then rejects. activityDefinitions.workProgram in helpText.ts had this
      // right; this file did not.
      "A job training or employment program from a specific list the rule sets out — mainly WIOA programs, SNAP Employment & Training, a state or local program your governor has approved, veterans programs from the VA or Department of Labor, and SNAP workforce partnerships. A program that is only job search doesn't count, though job search inside a qualifying program can if it's under half the program's hours.",
    examples: [
      "SNAP Employment & Training",
      "A workforce program under WIOA",
      "A state or local training program your governor has approved",
      "A veterans employment or training program",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(D)",
  },

  educationalProgramHalfTime: {
    term: "Educational Program - Half-Time",
    definition:
      // Was: "For most colleges, this means taking at least 6 credit hours per
      // semester. Hours spent in class and studying count toward your 80 hours
      // per month." Wrong three ways, and W2a missed it on first pass because this
      // file was scoped as hedge-only work.
      //  1. 42 CFR 435.552(a)(4): at least half-time requires NO hours at all.
      //  2. 42 CFR 435.552(a)(5): at half-time or more it may NOT be combined with
      //     anything, so it does not "count toward your 80 hours".
      //  3. 42 CFR 435.552(c): the SCHOOL determines enrollment status. A
      //     credit-hour rule of thumb is not the test — and the figure was
      //     self-defeating anyway, since 6 credits converts to 77.94 hours under
      //     435.552(d)(1), below 80.
      // Contradicted activityDefinitions.education in src/content/helpText.ts.
      "Being enrolled for at least half of what your school counts as full-time. Your school decides whether you are — not you and not your state, so ask the registrar and get it in writing. If you are at half-time or more, that may be enough on its own: there are no hours to add up, and it isn't combined with anything else.",
    examples: [
      "Two classes at a community college, if the school calls that half-time",
      "A career or technical training program",
      "High school, or a GED program your state approves",
      "Trade school",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(B)",
  },

  // ============================================================================
  // FAMILY & CAREGIVING
  // ============================================================================

  postpartum: {
    term: "Postpartum",
    definition:
      // 42 CFR 435.554(c)(10) — pregnant, or entitled to postpartum coverage under
      // SSA 1902(e)(5) or (e)(16). A specified excluded individual: 435.556(c)
      // PROHIBITS the state from assessing compliance. Most states now run
      // 12-month postpartum coverage under (e)(16), so "60 days" understates it.
      "The period after giving birth. Coverage often runs for 12 months now rather than 60 days, depending on your state. This is one of the categories the rule sets aside, and your state isn't allowed to assess this requirement while it applies. Ask your state how long your postpartum coverage runs — it's frequently longer than people expect.",
    examples: [
      "You gave birth 3 weeks ago",
      "You're recovering from childbirth",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
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
      // 42 CFR 435.554(c)(3), with "dependent child" defined at (a) — a "dependent child" is 13 or UNDER and
      // relies on another individual for care. The transition protection at
      // 435.553(a)(4) matters: prior exclusion is itself a mandatory exception, so
      // a parent whose child turns 14 mid-review-period is deemed compliant for
      // the months they held the exclusion.
      "A child age 13 or under who relies on someone for care. This includes your own children, stepchildren, or children you're the guardian for. Caring for a child this age is one of the categories the rule sets aside. Tell your state who you care for. If your child turns 14 partway through a period your state is reviewing, ask it to count the months before that — those months are protected, and it's easy for that to be missed.",
    examples: [
      "Your 10-year-old daughter",
      "Your partner's 5-year-old son who lives with you",
      "A child you're the legal guardian for who is 12 years old",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(III)",
  },

  caretakerRelative: {
    term: "Caretaker Relative",
    definition:
      // 42 CFR 435.554(c)(3), with "caretaker relative" defined at (a) — a relative by blood, adoption, or
      // marriage LIVING WITH the person and assuming PRIMARY RESPONSIBILITY for
      // their care, drawn from an enumerated relationship list that states may
      // optionally extend (435.554(a)(iv)). Distinct from "family caregiver" at
      // the "family caregiver" definition at (a), whose three-prong test at (c)(3)(i) including an 80-hour route for
      // a non-relative who does not live with the person. W4 separates them.
      "A relative who lives with a child and takes primary responsibility for their care. This includes parents, grandparents, aunts, uncles, and other relatives. Caring for a child 13 or under, or for someone with a disability, is one of the categories the rule sets aside. Tell your state who you care for, what you do for them, and whether you live together — those details decide which category fits, and some states count more relationships than the basic list.",
    examples: [
      "A grandmother raising her grandchildren",
      "An aunt caring for her nephew",
      "A parent taking care of their child",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(III)",
  },

  // ============================================================================
  // HEALTH & DISABILITY
  // ============================================================================

  disabledVeteran: {
    term: "Disabled Veteran",
    definition:
      // 42 CFR 435.554(c)(4) — a veteran with a disability rated as TOTAL under
      // 38 U.S.C. 1155, TEMPORARY OR PERMANENT.
      //
      // The old text said this "means the VA has determined you have a 100%
      // service-connected disability", which silently excluded veterans on TDIU
      // (total disability based on individual unemployability). TDIU veterans are
      // compensated at the 100% rate even where their combined schedular rating is
      // below 100%. Narrowing in the user-unfavourable direction. W4 fixes the
      // question; the definition stops repeating it now.
      "A veteran whose disability the VA rates as total. That includes a temporary total rating, not only a permanent one, and it includes being paid at the total rate because your disabilities keep you from working, even when the percentages add up to less than 100. This is one of the categories the rule sets aside. Get your VA rating decision letter or benefits summary and show it to your state — and if you're paid at the total rate but your combined rating reads under 100 percent, say so plainly, because that is easy to misread.",
    examples: [
      "You receive 100% disability compensation from the VA",
      "The VA rated your service-connected disability as total",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(IV)",
  },

  medicallyFrail: {
    term: "Medically Frail",
    definition:
      // 42 CFR 435.554(c)(5), (c)(5) — a TWO-PART test, and the gate is
      // FUNCTIONAL, not diagnostic: the condition must significantly impair the
      // person's ability to comply with the requirement. Diagnosis alone is not
      // enough. Then one of five categories at (c)(5)(i)(A)-(E).
      //
      // States MUST keep an auditable, regularly revised list of qualifying
      // conditions AND a process for someone whose condition is not on the list to
      // request consideration (435.554(c)(5)(ii)). Telling people that request
      // path exists is the most actionable thing in this definition.
      //
      // Distinct from the Alternative Benefit Plan definition at 42 CFR 440.315(f).
      // Under challenge in Massachusetts v. Oz (D. Mass.), which targets this
      // functional gate; no injunction is in effect, so the rule is operative.
      "Having a serious health condition or disability that gets in the way of working or volunteering. Two things decide it: whether your condition is on the list your state keeps, and whether it genuinely stops you managing 80 hours a month — a diagnosis on its own isn't the test. The list covers blindness and disability, substance use disorders, mental health conditions, physical, intellectual and developmental disabilities, and serious or complex medical conditions. Ask your state for its list, and if your condition isn't on it, ask how to request that it be considered anyway — states have to offer that route.",
    examples: [
      "You're blind or have very limited vision",
      "You have a disability that limits your daily activities",
      "You're being treated for drug or alcohol addiction",
      "You have a mental health condition that makes it hard to work",
      "You have a chronic illness that requires regular medical care",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)",
  },

  substanceUseDisorder: {
    term: "Substance Use Disorder",
    definition:
      // 42 CFR 435.554(c)(5)(i)(B) — substance use disorder, EXCLUDING individuals
      // in stable recovery, which CMS sets at 5 years or more. It applies whether
      // or not someone is in active treatment, and covers early recovery (under a
      // year) and sustained recovery (1-5 years). States MUST allow
      // self-identification, INCLUDING AFTER A RELAPSE — the single most important
      // protection in this definition and previously absent.
      //
      // Records here fall under 42 CFR part 2 as well as HIPAA.
      "A medical condition where someone has trouble controlling their use of drugs or alcohol, also called addiction. It counts whether or not you're currently in treatment, and it still counts in early or ongoing recovery — it's only people in stable recovery for five years or more who fall outside it. If you've relapsed, you can say so and be counted again; states have to let you. As with any condition here, what matters is whether it gets in the way of working or volunteering. Ask your state how to tell them, and ask what happens to that information.",
    examples: [
      "You're receiving treatment for drug addiction",
      "You're in recovery from alcohol addiction",
      "You're working with a counselor on substance abuse issues",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(bb)",
  },

  disablingMentalDisorder: {
    term: "Disabling Mental Disorder",
    definition:
      // 42 CFR 435.554(c)(5)(i)(C) — a disabling mental disorder. Still subject to
      // the functional gate at (c)(5): the condition must significantly impair the
      // ability to comply.
      "A mental health condition that makes it hard to work or get through daily activities — severe depression, anxiety, bipolar disorder, schizophrenia, or PTSD, among others. This is one of the conditions that can put you in a category the rule sets aside, as long as it genuinely gets in the way of working or volunteering. A letter from your clinician describing what you struggle to manage, rather than just naming the diagnosis, is the document that helps here.",
    examples: [
      "You have severe depression that makes it hard to leave the house",
      "You have PTSD that affects your ability to work",
      "You're being treated for schizophrenia",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(cc)",
  },

  physicalIntellectualDevelopmentalDisability: {
    term: "Physical/Intellectual/Developmental Disability",
    definition:
      // 42 CFR 435.554(c)(5)(i)(D) — a physical, intellectual, or developmental
      // disability that significantly impairs ONE OR MORE ACTIVITIES OF DAILY
      // LIVING. One is enough; the copy should not imply a higher bar.
      "A condition that significantly limits everyday activities. Physical disabilities affect your body, such as not being able to walk. Intellectual and developmental disabilities affect learning and thinking, such as Down syndrome or autism. Just one everyday activity being significantly affected is enough — you don't have to be unable to manage several. This can put you in a category the rule sets aside. Tell your state which activities are affected and how.",
    examples: [
      "You use a wheelchair and can't walk",
      "You have cerebral palsy",
      "You have Down syndrome",
      "You have autism",
      "You have a traumatic brain injury",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(dd)",
  },

  seriousComplexMedicalCondition: {
    term: "Serious or Complex Medical Condition",
    definition:
      // 42 CFR 435.554(c)(5)(i)(E) — a serious or complex medical condition. The
      // rule carries an extensive qualifier list; see rule-extract.md § 3.5.
      // Subject to the functional gate at (c)(5).
      "An ongoing health problem that needs regular medical care or treatment — cancer, heart disease, diabetes with complications, kidney disease, and other chronic illnesses among them. This can put you in a category the rule sets aside, as long as it genuinely gets in the way of working or volunteering. Your state keeps a list of qualifying conditions, and it has to let you ask about a condition that isn't on it. Ask for the list, and ask what your recent medical claims already show.",
    examples: [
      "You're receiving chemotherapy for cancer",
      "You have heart disease and see a cardiologist regularly",
      "You have kidney disease and need dialysis",
      "You have severe asthma that requires frequent treatment",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(V)(ee)",
  },

  // ============================================================================
  // PROGRAMS & REHABILITATION
  // ============================================================================

  drugAlcoholRehabProgram: {
    term: "Drug/Alcohol Rehabilitation Program",
    definition:
      // 42 CFR 435.554(c)(8) — participating in a drug addiction or alcoholic
      // treatment and rehabilitation programme as defined at 7 U.S.C. 2012(h).
      // States MAY set a minimum time commitment: a state election, so Conditional.
      "A treatment program for drug or alcohol addiction. It can be inpatient, where you stay at a facility, or outpatient, where you attend but live at home. Taking part is one of the categories the rule sets aside. Some states expect a minimum number of hours or weeks, so ask yours whether it does. Ask your programme for a letter confirming you're enrolled and how often you attend, and keep it — this is rarely something a state can verify from its own records.",
    examples: [
      "You're in a 30-day inpatient treatment program",
      "You attend outpatient counseling 3 times per week",
      "You're in a recovery program at a treatment center",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference: "Section 1902(xx)(9)(A)(ii)(VII)",
  },

  // ============================================================================
  // OTHER CIRCUMSTANCES
  // ============================================================================

  inmate: {
    term: "Inmate",
    definition:
      // TWO MECHANISMS. Currently an inmate of a public institution is a specified
      // EXCLUSION, 42 CFR 435.554(c)(9) with 435.1010. Recently released is a
      // mandatory EXCEPTION, 435.553(b): an inmate at any point in the 3-month
      // period ENDING ON THE FIRST DAY of the month in question.
      //
      // 435.557 requires states to obtain incarceration data from correctional
      // facilities, so this is usually verifiable without the person doing anything.
      "Someone who is in jail or prison. Being in a public institution is one of the categories the rule sets aside. After release there's a further window: any month falling within three months of your release should be treated as already met. Tell your state your release date and ask it to apply that window. States have to get incarceration records from correctional facilities, so ask what they already hold before gathering anything yourself.",
    examples: [
      "You're currently in county jail",
      "You're in state prison",
      "You were released from jail 2 months ago",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
    sourceReference:
      "Section 1902(xx)(9)(A)(ii)(VIII) and Section 1902(xx)(3)(A)(ii)",
  },

  indianUrbanIndianCaliforniaIndian: {
    term: "Indian/Urban Indian/California Indian",
    definition:
      // 42 CFR 435.554(c)(2), using the definition at 42 CFR 447.51 — Indian,
      // Urban Indian, California Indian, and IHS-eligible are all covered.
      // STATES MUST NOT REVERIFY this status once established.
      "Someone who is a member of a federally recognized Native American tribe, lives in an urban area and is of Native American descent, or is a California Indian. All of these are covered, and so is being eligible for Indian Health Service care. This is one of the categories the rule sets aside. Tell your state once and ask it to record your status permanently — it isn't allowed to make you prove this again at later renewals, so if you're asked a second time, point that out.",
    examples: [
      "You're enrolled in a federally recognized tribe",
      "You're Native American and live in a city",
      "You're a California Indian",
    ],
    source: "42 CFR 435.550-435.563 (CMS-2454-IFC)",
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
