/**
 * Help Text Content for Activity Definitions
 *
 * This file contains all help text, definitions, examples, and edge cases
 * for activity tracking and income requirements. All content is derived from
 * HR1 Section 71119 and the CFA Service Blueprint.
 *
 * Content is written in plain language (8th grade reading level) to ensure
 * accessibility for all Medicaid beneficiaries.
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Edge case example showing a specific scenario and whether it counts
 */
export interface EdgeCaseExample {
  scenario: string;
  counts: boolean | "varies";
  explanation: string;
}

/**
 * Activity definition with examples and edge cases
 */
export interface ActivityDefinition {
  title: string;
  definition: string;
  examples: string[];
  counterExamples: string[];
  edgeCases: EdgeCaseExample[];
  source: string;
}

/**
 * Income definition section
 */
export interface IncomeDefinition {
  title: string;
  definition: string;
  calculation?: string;
  whatCounts?: {
    title: string;
    description: string;
    examples: string[];
  };
  whatDoesNotCount?: {
    title: string;
    description: string;
    examples: string[];
  };
  whoQualifies?: string;
  howToCalculate?: string[];
  example?: {
    scenario: string;
    calculation: string;
    result: string;
  };
  options?: Array<{
    option: string;
    description: string;
    benefit: string;
  }>;
  note?: string;
  edgeCases?: EdgeCaseExample[];
  source: string;
}

/**
 * Dashboard guidance step
 */
export interface DashboardGuidanceStep {
  icon: string;
  text: string;
  action: string | null;
}

/**
 * Combination rules for activities
 */
export interface CombinationRules {
  title: string;
  definition: string;
  examples: string[];
  note: string;
  source: string;
}

/**
 * Dashboard guidance content
 */
export interface DashboardGuidance {
  title: string;
  steps: DashboardGuidanceStep[];
}

/**
 * A fact about the requirement that the app should volunteer unprompted.
 *
 * Added by W2a § 2.3b for gaps 15.7, 15.8, and 15.20 — three rows rated harmful
 * whose harm is an ABSENCE. Nothing in the app said them, so the app implied a
 * deadline and an obligation that many users do not have.
 *
 * `DashboardGuidance` has no prose field — only `{ icon, text, action }` steps —
 * so this content needed a shape of its own. See
 * docs/hr1-readiness/waves/wave-2a-truth-in-copy.md § 2.3b.
 *
 * `tone` distinguishes the two jobs: `reassuring` facts reduce unnecessary
 * alarm, `caution` facts warn against volunteering something harmful.
 */
export interface RequirementFact {
  id: string;
  tone: "reassuring" | "caution";
  title: string;
  body: string;
  /** Every hedge carries a next action. A hedge with nothing after it transfers anxiety without transferring capability. */
  nextAction: string;
  /** CFR citation. Shown in source and in an expandable detail, not in the headline. */
  citation: string;
}

/**
 * Where and when the requirement applies — W2a § 2.4, gaps 11.1 through 11.5.
 *
 * Orientation facts, not personal ones. Whose state is implementing and when is
 * a policy-profile question (W2b); these are the framing facts that were simply
 * absent, including two dates the app never mentioned at all.
 */
export interface ProgramScope {
  jurisdictions: string;
  /** Gap 11.4: the adult group is not "childless adults" — it includes parents. */
  whoItReaches: string;
  territories: string;
  keyDates: Array<{ date: string; what: string; citation: string }>;
  citation: string;
}

// ============================================================================
// Activity Definitions
// ============================================================================

export const activityDefinitions: Record<string, ActivityDefinition> = {
  work: {
    title: "Work",
    // 42 CFR 435.552(b) defines work as THREE components, in any combination:
    //   (1) work in exchange for money;
    //   (2) work in exchange for goods or services — "in-kind" work;
    //   (3) unpaid work, other than community service.
    // Explicitly included: self-employment, business ownership, independent
    // contracting, in-kind compensation such as reduced rent for a property
    // manager, unpaid internships, unpaid trial periods when applying for a job,
    // and caregiving hours by a family caregiver who does not qualify for the
    // exclusion. The old definition said "Paid employment", which excluded two of
    // the three components (gap 4.1).
    //
    // The 80 hours is a MONTHLY TOTAL ACROSS ACTIVITIES — 435.552(a)(5) and
    // (e)(1) — not a per-activity minimum. It is stated once, in
    // combinationRules, rather than repeated in each activity definition.
    definition:
      "Work is broader than a paycheck. It covers work you're paid money for, work you're paid in something other than money like housing or meals, and unpaid work that isn't community service.",
    examples: [
      "A full-time or part-time job",
      "More than one part-time job, added together",
      "Gig work like Uber or DoorDash",
      "Self-employment, running a business, or contract work",
      "Work paid in housing, meals, or utilities instead of money",
      "An unpaid internship, or an unpaid trial period when applying for a job",
      "Caregiving hours that don't add up to a full exclusion still count here",
    ],
    counterExamples: [
      // "Unpaid internships" was here and it was wrong: 435.552(b) names unpaid
      // internships as work. Removed (gap 4.1).
      "Looking for a job on your own, or applying for jobs",
    ],
    edgeCases: [
      {
        scenario: "I work 60 hours at one job and 20 hours at another",
        counts: true,
        explanation:
          "Hours from every job add together: 60 + 20 = 80. The threshold is a monthly total, not a per-job one.",
      },
      {
        // 42 CFR 435.552(b): standalone supervised job search or job search
        // training does not qualify, but it may be a SUBSIDIARY activity inside a
        // qualifying work program if it is under half the program's required
        // hours. Unemployment-insurance job search can count where it is carried
        // out consistently with work program requirements (gap 4.10).
        scenario: "I spend a lot of time each month looking for a job",
        counts: "varies",
        explanation:
          "Job searching on its own doesn't count. But it can count as part of a job training program, as long as it's less than half of what that program requires — and job search you do as a condition of unemployment benefits may count too. If either applies to you, ask your state.",
      },
      {
        scenario: "I do gig work but my hours vary each month",
        counts: true,
        explanation:
          "Each month stands on its own, so record the hours as you go. In a light month, income and other activities can be added alongside them.",
      },
      {
        scenario:
          "My landlord reduces my rent in exchange for maintenance work",
        counts: true,
        explanation:
          "That's in-kind work and it counts. Getting a note from your landlord confirming the arrangement and the hours is worth doing — this is the kind of work that won't appear in any records your state checks.",
      },
    ],
    source: "42 CFR 435.552(a)(1), (b)",
  },

  volunteer: {
    title: "Community Service",
    // 42 CFR 435.552(b): unpaid work, VOLUNTARY OR COURT-ORDERED, with a
    // structured program, for the direct benefit of the community, under the
    // auspices of public or nonprofit organizations. Includes embedded
    // skill-building needed to perform the service. States MAY NOT restrict this
    // to 501(c)(3) organizations — local government agencies, religious
    // nonprofits, and small social service providers all qualify (gaps 4.8, 4.9).
    //
    // The organization must provide oversight, must not serve a partisan purpose,
    // and must track: activity type, dates, hours, and a POINT OF CONTACT WHO CAN
    // CONFIRM THE HOURS. CMS's verification guidance adds the organization's name
    // and address and the contact's phone or email. Capturing that as structured
    // data is W6a; saying it here is what stops evidence being rejected (gap 4.7).
    definition:
      "Unpaid work through an organized program that benefits the community. It can be voluntary or court-ordered — both count.",
    examples: [
      "A food bank, shelter, or community center",
      "A school, library, or park cleanup program",
      "A local government agency or a religious nonprofit",
      "Court-ordered community service",
      "Training the program requires before you can do the work",
    ],
    counterExamples: [
      "Helping one particular person outside an organized effort, like a neighbor's yard work",
      "Your own child's school events or parent-teacher conferences",
      "Recreational clubs",
      "Campaigning for a party or candidate",
    ],
    edgeCases: [
      {
        scenario: "I volunteer 40 hours and work 40 hours",
        counts: true,
        explanation:
          "These add together: 40 + 40 = 80. Different activities count toward one monthly total.",
      },
      {
        scenario: "I help my neighbor with yard work",
        counts: false,
        explanation:
          "Helping one person on your own isn't community service. If you do it through an organized program, it counts — and if you provide regular care to someone, that may matter in a different way, so it's worth asking about.",
      },
      {
        scenario: "The organization I volunteer for isn't a registered charity",
        counts: "varies",
        explanation:
          "It doesn't have to be a 501(c)(3). Your state cannot limit community service to registered charities — public agencies and nonprofits of other kinds qualify. What matters is that the program oversees the work, isn't partisan, and can confirm your hours.",
      },
      {
        scenario: "What should I get from the organization?",
        counts: "varies",
        explanation:
          "Ask for the type of activity, the dates, the hours, and the name and phone or email of someone who can confirm them. Without a contact who can confirm the hours, the record may not be accepted.",
      },
    ],
    source: "42 CFR 435.552(a)(2), (b)",
  },

  education: {
    title: "School",
    // 42 CFR 435.552(a)(4), (c), (d). Half-time is a CLIFF, not a slope:
    //   at least half-time  -> demonstrated, ZERO hours required, and combination
    //                          with other activities is NOT permitted, 435.552(a)(5)
    //   less than half-time -> convert to hours and combine
    // Enrollment status is determined by THE SCHOOL (435.552(c)), not by the
    // state and not by the user. It begins the first day of term, continues
    // through vacation and recess at the pre-break status, and ends at the end of
    // the month of expulsion, withdrawal, non-registration, or graduation.
    // Qualifying: institutions of higher education, career and technical
    // education, high school, and state-approved high school equivalency
    // programs. This definition correctly states no hours — do not add an hours
    // figure to it (gap 4.3).
    definition:
      "Being enrolled at least half-time in a school or training program. If you are, that may be enough on its own — there are no hours to add up.",
    examples: [
      "Community college or a four-year college",
      "Trade school or vocational training",
      "Career and technical education",
      "High school",
      "A GED or high school equivalency program your state approves",
    ],
    counterExamples: [
      "Studying on your own, outside an approved program",
      "A course that isn't part of a formal program",
    ],
    edgeCases: [
      {
        scenario: "I'm taking 2 classes at community college",
        counts: "varies",
        explanation:
          "It turns on whether your school calls that half-time, and the school is the one that decides — not you and not your state. Ask the registrar and get it in writing. If it is half-time or more, there are no hours to track.",
      },
      {
        scenario: "I'm enrolled half-time. Do I need hours on top?",
        counts: true,
        explanation:
          "No. At half-time or more, school counts on its own and hours are not required. It also cannot be combined with other activities — it doesn't need to be.",
      },
      {
        scenario: "I'm enrolled less than half-time",
        counts: "varies",
        explanation:
          "Then your class time converts into hours, and you can add work, volunteering, or job training on top to reach the monthly total. Your credit hours are what the conversion is based on, so keep your class schedule.",
      },
      {
        scenario: "It's summer break. Am I still enrolled?",
        counts: true,
        explanation:
          "Enrollment carries through vacations and breaks at whatever status you held before the break. It ends at the end of the month you graduate, withdraw, or don't register.",
      },
      {
        scenario: "I'm taking one online course for personal interest",
        counts: false,
        explanation:
          "Studying on your own outside an approved program doesn't count. If it's part of a formal program, ask the school what enrollment status it reports.",
      },
    ],
    source: "42 CFR 435.552(a)(4), (c), (d)",
  },

  workProgram: {
    title: "Job Training Program",
    // 42 CFR 435.552(b) — a CLOSED LIST of exactly five program types:
    //   1. Title I of WIOA (29 U.S.C. 3111 et seq.)
    //   2. section 236 of the Trade Act of 1974
    //   3. a state or local employment and training program meeting
    //      Governor-approved standards, including SNAP E&T
    //   4. a DOL or VA veterans employment/training program
    //   5. SNAP workforce partnerships
    // Standalone supervised job search or job search training does NOT qualify,
    // but may be a subsidiary activity if under half the program's required hours.
    // Health-provider-operated programs and Medicaid 1915(c)/(i) supported
    // employment do NOT qualify — a real trap, since those are the programs a
    // Medicaid beneficiary is most likely to already be in.
    definition:
      "Taking part in a job training or employment program that your state or the federal government runs or approves.",
    examples: [
      "SNAP Employment & Training, sometimes called SNAP E&T",
      "A workforce program under WIOA",
      "A state or local employment and training program your governor has approved",
      "A veterans employment or training program from the VA or Department of Labor",
      "A SNAP workforce partnership",
    ],
    counterExamples: [
      "Looking for work on your own, or a program that is only supervised job search",
      "Informal or self-arranged training",
      "A program run by your health plan or medical provider",
      "Supported employment services you get through Medicaid",
    ],
    edgeCases: [
      {
        scenario: "I'm in a SNAP E&T program",
        counts: true,
        explanation:
          "SNAP E&T is one of the programs named in the rule. Worth checking separately: if your household gets SNAP and you're not excused from SNAP's own work rules, that may take you out of this requirement altogether. Ask your state.",
      },
      {
        scenario: "My program includes some job search time",
        counts: "varies",
        explanation:
          "Job search inside a qualifying program can count, as long as it's under half the hours the program requires. A program that is only job search doesn't qualify.",
      },
      {
        scenario: "I get job support through my Medicaid plan",
        counts: false,
        explanation:
          "Supported employment through Medicaid, and programs run by health providers, aren't on the list of qualifying programs. The hours you actually work still count as work, though — ask your state how it records them.",
      },
    ],
    source: "42 CFR 435.552(a)(3), (b)",
  },
};

// ============================================================================
// Income Definitions
// ============================================================================

export const incomeDefinitions: Record<string, IncomeDefinition> = {
  threshold: {
    title: "Income",
    // 42 CFR 435.552(a)(6) and (f): income is one of seven pathways, and the
    // threshold is the applicable federal minimum wage x 80. In 2026 that is
    // $7.25 x 80 = $580. Statutory but dynamic if the FLSA is amended; states may
    // not substitute the tipped wage, the youth wage, or a higher state wage.
    // The $580, 80, and $7.25 literals here move to the policy profile in W2b.
    definition:
      "Income is one way to meet the requirement. If your household's monthly income is at least $580, that may be enough on its own, with no hours to track. Your state makes that decision.",
    calculation: "$580 = 80 hours × $7.25, the federal minimum wage",
    whatCounts: {
      title: "What kinds of income usually count?",
      // 42 CFR 435.552(f)(2) -> 435.603(e) -> 26 U.S.C. 36B(d)(2)(B).
      // MAGI is adjusted gross income INCREASED BY excluded foreign earned
      // income, tax-exempt interest, and the portion of Social Security benefits
      // not included in gross income. So earned AND unearned income count, and
      // tax-exempt interest counts even though it is not taxable.
      // Authority: docs/domain/supporting-regs/42cfr-supporting-sections.txt
      // (raw eCFR text). Do not rely on a summary for this claim.
      description:
        "Earned and unearned income both generally count. This is the part that is easiest to get wrong: it is not just your paycheck.",
      examples: [
        "Pay from a job, including tips and commissions",
        "Self-employment, freelance, contract, and gig work",
        "Unemployment benefits",
        "Interest and dividends, including interest that isn't taxed",
        "Rent you collect, whether or not it's a business",
        "Social Security benefits, including the part that isn't taxed, so SSDI",
      ],
    },
    whatDoesNotCount: {
      title: "What kinds of income usually do NOT count?",
      // Short and specific on purpose. The old description here said "unearned
      // income does not count," which was the actual error: it excluded four
      // categories that 435.603(e) counts. Fixed entry by entry rather than
      // deleted, per .kiro/steering/compliance-copy-standards.md.
      description:
        "A few kinds of money are left out. This is a short list, not a general rule about unearned income.",
      examples: [
        // SSI is Title XVI, not a Title II Social Security benefit, and is not
        // in gross income, so 36B(d)(2)(B) never adds it back.
        "SSI, Supplemental Security Income. It is not the same as SSDI and it is not counted",
        // Not in gross income.
        "Child support you receive",
        // 42 CFR 435.603(d)(3) is a STATE OPTION, and a narrow one: it reaches
        // only actually-available cash support above nominal amounts, from the
        // person claiming the individual as a tax dependent, and only for
        // individuals described in (f)(2)(i) — those claimed as a dependent who
        // are NOT the taxpayer's spouse or child. A gift from a friend is not in
        // it. Conditional, not Deferred: name the election.
        "Gifts and loans, usually. One narrow exception: if someone claims you as a tax dependent and you are not their spouse or child, your state is allowed to count regular cash support they give you beyond small amounts. Ask your state whether it does that",
      ],
    },
    // Household MAGI is Deferred (ADR-0003): we ask the screener questions and
    // name the agency. The hard part is elicitation, not arithmetic —
    // 42 CFR 435.603(f) composition follows tax filing relationships rather than
    // residence, is asymmetric and per-person, and 435.603(d)(2) leaves out some
    // members entirely on a tax-filing-threshold test, not an age test.
    note: "Your state counts your whole tax household here, not just you. A spouse's income counts. If someone claims you as a tax dependent, their household's income is what gets counted. Three things to sort out before you talk to your state: are you married, does anyone claim you as a tax dependent, and does anyone else file taxes with you? HourKeep does not add this up, because household rules follow tax filing rather than who lives with you. Bring your pay stubs and ask your state what they already have on file.",
    edgeCases: [
      {
        scenario: "I earn $600 per month from my job",
        counts: true,
        explanation:
          "$600 is above the $580 threshold. Your state still makes the decision, and it counts your whole household, so the figure it uses may be higher than yours. Bring your pay stubs.",
      },
      {
        // This edge case was wrong twice over. (1) Unemployment compensation is
        // in gross income (IRC 85) and therefore in MAGI under 435.603(e), so
        // $400 + $200 = $600, above the threshold. (2) Even below the threshold
        // it is not "track hours from zero": 42 CFR 435.552(e)(2) lets the state
        // credit monthlyIncome / federalMinimumWage as work hours and combine
        // that with other activities. Hours and income are not either/or.
        scenario: "I earn $400 from work and $200 from unemployment",
        counts: true,
        explanation:
          "Unemployment benefits do count, so that is $600 in total, above the $580 threshold. Worth knowing either way: even when income is under the threshold, your state may be allowed to credit it as hours and add other activities on top. Income and hours are not an either/or choice.",
      },
      {
        scenario:
          "I do gig work and my income varies. Some months I earn $700, other months $400",
        counts: "varies",
        explanation:
          "It changes month to month, and each month is looked at on its own. In a $400 month you are not starting from zero: your state may be able to credit that income as hours and let you add work, volunteering, or school on top. You may also be able to use a 6-month average if you are a seasonal worker.",
      },
      {
        scenario: "My spouse works and I don't",
        counts: "varies",
        explanation:
          "Your spouse's income counts toward this pathway, so you may already be over the threshold without working an hour. Do not go looking for 80 hours of volunteering before you ask. Your state calculates the household figure.",
      },
      {
        // The two-sided message. More household income helps THIS pathway
        // (a floor). Separately there is a ceiling for the adult group itself:
        // 133% FPL plus the 5 percentage point disregard at
        // 42 CFR 435.603(d)(4). Going over the ceiling is a different
        // conversation that points at Marketplace subsidies — it is not a
        // community engagement failure, and copy must never imply a spouse's
        // earnings are disqualifying.
        scenario: "Can having more household income ever work against me?",
        counts: "varies",
        explanation:
          "Not for this requirement. More household income only helps here. Separately, this Medicaid group has an income limit of its own, and a household can earn enough to go over it. That is a different question with a different answer, not a problem with work or volunteering, and if it comes up ask your state about Marketplace coverage and premium tax credits.",
      },
    ],
    source: "42 CFR 435.552(a)(6), (f); 435.603(d)–(f)",
  },

  seasonalWorker: {
    title: "Seasonal Work",
    // 42 CFR 435.552(a)(7) and (g). The average is taken over the 6 months
    // PRECEDING the month being assessed, and the assessed month is excluded.
    // The copy below says "before the month your state is looking at" for that
    // reason. The arithmetic fix in src/lib/storage/income.ts, which currently
    // includes the assessed month, belongs to W7a (gaps 5.4, 5.5).
    definition:
      "If you do seasonal work, your state can look at your average monthly income over the 6 months before the month it is reviewing, instead of that one month on its own.",
    // "Seasonal worker" is defined by 26 U.S.C. 45R(d)(5)(B): labour performed on
    // a seasonal basis as the Secretary of Labor defines it (29 CFR
    // 500.20(s)(1)), INCLUDING retail workers employed exclusively during
    // holiday seasons. Those two are inclusive examples, not a closed test, and
    // the IFC sets no verification rule for seasonal-worker status. Do not
    // reintroduce a months-per-year threshold: there isn't one in the rule.
    whoQualifies:
      "Seasonal work means work that comes and goes with the season. Farm and harvest work, holiday retail, and summer tourism are the usual examples, but the rule is not limited to a fixed list or to a set number of months per year. If your work is seasonal, say so and ask your state.",
    calculation:
      "Average monthly income over the 6 months before the reviewed month, compared against $580",
    howToCalculate: [
      "Add up your income from the 6 months before the month your state is reviewing",
      "Divide by 6 to get your average monthly income",
      "Compare that average against the $580 threshold",
    ],
    example: {
      scenario: "You earned $3,480 across those 6 months",
      calculation: "$3,480 ÷ 6 months = $580 per month average",
      result: "Average: $580. Threshold: $580. Your state decides from here.",
    },
    edgeCases: [
      {
        scenario:
          "I work at a ski resort and only earn income 4 months per year",
        counts: "varies",
        explanation:
          "Seasonal work like this is what the 6-month average is for. Add up the 6 months before the month being reviewed, divide by 6, and compare that against $580. Your state runs the calculation and decides.",
      },
      {
        scenario:
          "I earned $4,000 in the summer but nothing the rest of the year",
        counts: "varies",
        explanation:
          "It depends which 6 months your state looks at, and that changes every month. $4,000 ÷ 6 is about $667 a month, which is above $580 — but a later 6-month window that misses the summer looks different. Keep the whole year recorded.",
      },
    ],
    source: "42 CFR 435.552(a)(7), (g); 26 U.S.C. 45R(d)(5)(B)",
  },

  incomeVsHours: {
    // The old title was "Income OR Hours - You Choose" and the old note said
    // "You only need to meet ONE of these requirements, not both." Needing one
    // pathway is true — 42 CFR 435.552(a) is a disjunction. The "you choose" and
    // "not both" framing was the error: it forecloses combination, which
    // 435.552(e)(1) requires the state to allow, and the income-to-hours proxy at
    // 435.552(e)(2), which adds income on top of hours. Same falsehood as the
    // ComplianceModeSelector dialog. See wave-2a-truth-in-copy.md § 2.6.
    title: "Income and Hours Work Together",
    definition:
      "There is more than one way to meet the requirement, and they are not either/or. Hours from different activities add up, and income can be counted alongside them.",
    options: [
      {
        option: "Income",
        description:
          "Household income of at least $580 a month may be enough on its own",
        benefit: "No hours to track",
      },
      {
        option: "Hours",
        description:
          "80 hours a month in total across work, volunteering, school, or job training",
        benefit: "Counts when income is under $580",
      },
      {
        option: "Both together",
        description:
          "When income is under $580, your state may be able to credit it as hours and let you add other activities on top",
        benefit: "Partial income and partial hours can still add up",
      },
    ],
    note: "You need to satisfy one pathway, but you do not have to pick a lane and stay in it. Hours from different activities add together, and income under the threshold is not wasted. Ask your state whether it credits income as hours.",
    edgeCases: [
      {
        scenario: "I work 100 hours per month but only earn $400",
        counts: true,
        explanation:
          "Logged: 100 hours. Threshold: 80 hours. Income under $580 does not undo that — the hours pathway stands on its own.",
      },
      {
        // CMS worked example, 42 CFR 435.552(e)(2): $380 / $7.25 = 52 hours,
        // needing 28 more. Conditional, and an upper bound: (e)(2)(i) requires
        // the state to allocate hours between household members by a method we
        // cannot know, so this is always "up to", never "about".
        scenario: "I earn $380 a month and volunteer 30 hours",
        counts: "varies",
        explanation:
          "These may combine. Some states can credit income as hours — $380 ÷ $7.25 is up to 52 hours — which alongside 30 volunteer hours would clear 80. Whether your state does this, and how much of the income it credits to you rather than to someone else in your household, is its decision. Record both.",
      },
    ],
    source: "42 CFR 435.552(a), (e)",
  },

  gigEconomy: {
    title: "Gig Work",
    // 42 CFR 435.552(b) names self-employment, business ownership, and
    // independent contracting as work. Gig platform earnings are income for the
    // 435.552(f) pathway and gig hours are hours for the (a)(1) pathway — the
    // same work can support either, which matters because platform income is
    // often the income payroll data misses.
    definition:
      "Work through platforms like Uber, DoorDash, or Instacart counts. The money counts toward the income pathway, and the time counts toward the hours pathway.",
    whatCounts: {
      title: "What Gig Work Counts?",
      description:
        "Earnings from gig platforms count, and so do the hours you spend earning them.",
      examples: [
        "Uber or Lyft driving",
        "DoorDash, Uber Eats, or Grubhub delivery",
        "Instacart shopping",
        "TaskRabbit tasks",
        "Fiverr or Upwork freelancing",
        "Other app-based gig work",
      ],
    },
    note: "Record income from every platform you work for, and your hours too. Gig income often does not show up in the payroll records your state checks first, so your own record may be the only evidence of it.",
    edgeCases: [
      {
        scenario: "I drive for Uber and made $650 this month",
        counts: true,
        explanation:
          "Logged: $650. Threshold: $580. Keep the earnings summary from the app — your state may not see platform income in its own records.",
      },
      {
        scenario:
          "I do DoorDash but my income varies. Some months $700, some $400",
        counts: "varies",
        explanation:
          "Each month is looked at on its own. In a $400 month, record your hours as well: your state may credit the income as hours and let you add other activities on top, and a 6-month average may be open to you if your work is seasonal.",
      },
      {
        scenario: "I work for multiple gig apps. Do I add them together?",
        counts: true,
        explanation:
          "Yes, add every platform together, and keep a separate earnings summary for each one so the total can be checked.",
      },
    ],
    source: "42 CFR 435.552(a)(6), (b), (f)",
  },
};

// ============================================================================
// Combination Rules
// ============================================================================

/**
 * The single place the 80-hour figure is framed as a monthly total.
 *
 * 42 CFR 435.552(a)(5) and (e)(1): work, community service, and work program
 * hours are determined separately for the month and then ADDED TOGETHER. The
 * threshold is one monthly total across activities, never a per-activity
 * minimum — which is what activityDefinitions.work / .volunteer / .workProgram
 * each implied before W2a by saying "at least 80 hours per month" individually.
 *
 * Two carve-outs the examples have to respect:
 *  - school at least half-time already demonstrates compliance under (a)(4) and
 *    may NOT be combined, 435.552(a)(5). Only less-than-half-time school
 *    converts to hours and combines.
 *  - income below the threshold may be credited as hours under 435.552(e)(2)
 *    and combined, at state option. So the list of things that add up is not
 *    limited to hours.
 */
export const combinationRules: CombinationRules = {
  title: "Adding Activities Together",
  definition:
    "The 80 hours is one monthly total across everything you do, not 80 hours of any single activity.",
  examples: [
    "40 hours work + 40 hours community service = 80",
    "30 hours work + 30 hours community service + 20 hours job training = 80",
    "Less-than-half-time school converts to hours and adds in alongside the rest",
    "Income under $580 may be credited as hours and added too, if your state does that",
  ],
  note: "Add up everything for the month and compare the total against 80. School at half-time or more is the exception: it counts on its own and is not combined with anything.",
  source: "42 CFR 435.552(a)(5), (e)",
};

// ============================================================================
// Dashboard Guidance
// ============================================================================

export const dashboardGuidance: DashboardGuidance = {
  title: "Getting Started",
  steps: [
    {
      // Was "Decide how you want to use HourKeep, log hours, income, or seasonal
      // income" — the either/or framing 42 CFR 435.552(e) contradicts.
      icon: "compass",
      text: "Record whatever you have: hours, income, or both. They add together",
      action: null,
    },
    {
      icon: "add",
      text: "Tap + at the bottom right to add hours or income for the month",
      action: null,
    },
    {
      icon: "download",
      text: "Export what you've recorded and share it with your state Medicaid agency",
      action: null,
    },
  ],
};

// ============================================================================
// Facts the app should volunteer — W2a § 2.3b, gaps 15.7, 15.8, 15.20
// ============================================================================

/**
 * Three facts that are true, reassuring or protective, and were absent.
 *
 * A large share of the adult group is expected to be verified without being asked
 * for anything, because 42 CFR 435.557(b) requires states to exhaust their own
 * records first. An app that opens with a tracking calendar and says nothing about
 * that implies an obligation many users may not have.
 *
 * NOTE ON SOURCING: the stronger "a majority" framing is asserted in
 * .kiro/steering/compliance-copy-standards.md but was not tied to a Federal
 * Register page on review, so the copy says "many" rather than "most". Pin it to a
 * page in the Regulatory Impact Analysis before strengthening it.
 */
export const requirementFacts: RequirementFact[] = [
  {
    id: "already-enrolled-timing",
    tone: "reassuring",
    // 42 CFR 435.559(c): for a beneficiary enrolled as of the state's
    // implementation date, the state verifies compliance at their FIRST RENEWAL
    // INITIATED ON OR AFTER that date — not on the implementation date itself.
    // "Initiated" means when the state's ex parte review begins; CMS explicitly
    // rejected an end-date trigger. So a renewal due in January or February 2027
    // may not bring community engagement into play until mid-2027. Gap 15.7.
    title:
      "If you already have Medicaid, this probably isn't starting in January",
    body: "For people already enrolled, states check this at your next renewal — not on the day the rules start. And it counts from when your state begins reviewing your renewal, not when it finishes. For a lot of people that means later in the year rather than January.",
    nextAction:
      "Find out when your renewal is due. Your state can tell you, and it's on any notice they've sent you.",
    citation: "42 CFR 435.559(c)",
  },
  {
    id: "ex-parte-first",
    tone: "reassuring",
    // 42 CFR 435.557(a) defines the reliable-information set; (b) imposes the
    // duty to exhaust it before requesting anything from the individual. CITE THE
    // PAIR: the June 29, 2026 correction notice (91 FR 39028) republished
    // 435.557 and shifted paragraph designations inside it. Gap 15.8.
    title:
      "Your state has to check its own records before it asks you anything",
    // "CMS expects MOST people" was softened to "many" on review: the majority
    // estimate is asserted in .kiro/steering/compliance-copy-standards.md but could
    // not be tied to a Federal Register page. Adjudicated claims from the preceding
    // 12 months and encounter data ARE confirmed in 435.557(a); SNAP/TANF and
    // school enrollment come from the preamble discussion and were not confirmed in
    // the regulatory text. Under-claiming a user-favourable fact is the safe
    // direction for an unverified cite.
    body: "Before your state asks you for a single document, it has to look at what it already holds: payroll records, Medicaid claims from the last 12 months, and information from other programmes such as SNAP, TANF, and schools. CMS expects many people to be cleared this way without doing anything. HourKeep is for what those records miss — unpaid work, caregiving, community service, gig income, part-time school.",
    nextAction:
      "Ask your state what it already has on file for you. You may not need to send anything.",
    citation: "42 CFR 435.557(a)–(b), as corrected at 91 FR 39028",
  },
  {
    id: "other-bases-considered",
    tone: "reassuring",
    // 42 CFR 435.558(d)(1): before denying or terminating, the state must consider
    // ALL OTHER BASES of eligibility. 435.558(a): coverage CONTINUES until the
    // person is determined ineligible. 435.558(b): 30 days from RECEIPT, and the
    // notice is deemed received 5 days after its date — so roughly 35 days.
    // 431.220(a)(1): determinations are appealable.
    title:
      "If you get a notice, you have about 35 days and your coverage continues",
    body: "A notice gives you 30 days from when you receive it, and it's treated as received 5 days after the date on it — so about 35 days in practice. Your coverage carries on while you respond. Before your state can end it, it has to check every other reason you might still be eligible, and you can appeal.",
    nextAction:
      "Check the date on the notice and count from there. Ask your state which months it's asking about, then send what you have for those months.",
    citation: "42 CFR 435.558(a)–(d), 431.220(a)(1)",
  },
  {
    id: "careful-what-you-report",
    tone: "caution",
    // Gap 15.20: a self-reported "no, I'm not meeting it" can be accepted at face
    // value and support a denial. So the app must never nudge a casual negative
    // self-report — say what the answer is used for, and surface the exception,
    // hardship, and ex parte paths BEFORE the question.
    title: "Be careful about saying you're not meeting it",
    body: "If you tell your state you aren't meeting the requirement, it can take that answer at face value and use it to deny coverage. It doesn't have to check further. So it's worth working out what you actually have first — some work doesn't look like work, some people aren't covered by this at all, and your state may already hold the proof.",
    nextAction:
      "Before answering, check whether one of the exceptions fits you, and ask your state what records it already has.",
    citation: "42 CFR 435.557; 91 FR 33348, 33372",
  },
];

// ============================================================================
// Verification Documents Help
// ============================================================================

export interface DocumentVerificationHelp {
  title: string;
  definition: string;
  why: string;
  workExamples: string[];
  volunteerExamples: string[];
  educationExamples: string[];
  incomeExamples: string[];
  gigWorkExamples: string[];
  tips: string[];
  gigWorkTips: string[];
  note: string;
}

export const documentVerificationHelp: DocumentVerificationHelp = {
  title: "Verification Documents",
  definition:
    "Documents that prove you completed work, volunteer, or education activities, or that verify your income.",
  why: "Your state Medicaid agency may ask for proof that you met the 80-hour requirement or the $580 income threshold. Having documents ready makes it easier to verify your hours or income.",
  workExamples: [
    "Pay stubs showing hours worked",
    "Timesheet or work schedule",
    "Letter from your employer confirming hours",
    "Self-employment records (invoices, receipts)",
    "Gig work app screenshots showing completed hours",
  ],
  volunteerExamples: [
    "Letter from the organization where you volunteer",
    "Signed timesheet from volunteer coordinator",
    "Certificate of volunteer service",
    "Email confirmation of volunteer hours",
  ],
  educationExamples: [
    "Class schedule showing you're enrolled",
    "Letter from school saying you're enrolled",
    "Transcript or grade report",
    "Tuition receipt or financial aid papers",
  ],
  incomeExamples: [
    "Pay stubs showing income amount",
    "Bank statements showing deposits from work",
    "1099 forms for self-employment or contract work",
    "Self-employment records (invoices, receipts, payment confirmations)",
    "Payment platform screenshots (PayPal, Venmo, Cash App for business)",
  ],
  gigWorkExamples: [
    "Uber or Lyft earnings summary from the app",
    "DoorDash weekly payment summary screenshot",
    "Instacart payment history from the app",
    "TaskRabbit earnings report",
    "Fiverr or Upwork payment confirmations",
    "Any gig platform's earnings dashboard screenshot",
  ],
  tips: [
    "Take a clear photo of the whole document",
    "Make sure you can read all the text",
    "Include the date and your name if you can see them",
    "You can add more than one document for each activity or income entry",
  ],
  gigWorkTips: [
    "Screenshot your earnings dashboard from the app",
    "Make sure the screenshot shows the date and total amount",
    "Include weekly or monthly summaries if available",
    "Capture payment confirmations or deposit notifications",
    "If you work for multiple apps, document each one separately",
  ],
  note: "Documents are optional but we recommend them. They stay private on your device. You only share them when you export your data.",
};

// ============================================================================
// Where and when this applies — W2a § 2.4, gaps 11.1–11.5
// ============================================================================

/**
 * Scope and timing facts the app never stated.
 *
 * Gap 11.1 was a genuine factual error in this project's own steering docs, not
 * just an omission: Georgia and Wisconsin were listed as OUT of scope and
 * Tennessee was missing from the list entirely. All three are in. Corrected in
 * validation-findings-2026-08.md § A1.
 *
 * Whose state is implementing, and on what date, is a policy-profile question
 * and belongs to W2b. These are the framing facts.
 */
export const programScope: ProgramScope = {
  // 43 States + DC = 44 jurisdictions. Includes three non-expansion States —
  // Georgia, Tennessee, Wisconsin — plus § 1115 populations inside Hawaii,
  // Massachusetts, New York, Oregon, and Utah. Out of scope: Alabama, Florida,
  // Kansas, Mississippi, South Carolina, Texas, Wyoming.
  jurisdictions:
    "44 places have to put this in place: 43 states and the District of Columbia. Georgia, Tennessee, and Wisconsin are among them, which surprises people because they didn't expand Medicaid. A handful of states aren't affected at all. Ask your state whether it applies to you.",

  // Gap 11.4. 42 CFR 435.119 is the ACA expansion group: adults 19-64 at or below
  // 133% FPL who are not described in a mandatory coverage group. It is NOT
  // "childless adults" — it includes PARENTS whose income exceeds the 435.110
  // threshold. A parent whose youngest child is 14 or older is an applicable
  // individual under 435.551, because the 435.554(c)(3) exclusion only reaches
  // caregivers of a child 13 or under. The app's framing implied childless adults.
  whoItReaches:
    "This applies to adults aged 19 to 64 who have Medicaid through the group that expanded under the Affordable Care Act. That is not only people without children — parents are in this group too, and if your youngest child is 14 or older, the caregiving categories may not cover you. Ask your state which group your coverage is in.",

  // 42 CFR 435.550: the rule reaches the 50 States and DC. NOT the territories.
  territories:
    "Puerto Rico, Guam, the U.S. Virgin Islands, American Samoa, and the Northern Mariana Islands are not covered by this requirement at all.",

  keyDates: [
    {
      date: "January 1, 2027",
      what: "The date states have to start, unless they chose to start earlier. Some already have. If you're already enrolled, you're checked at your next renewal rather than on this date.",
      citation: "42 CFR 435.559(a)–(c)",
    },
    {
      date: "January 1, 2028",
      what: "Documents get harder to avoid. From this date states have to ask for documentation whenever it's reasonably available. They still can't turn you down only because a document doesn't exist — but it's worth building the habit of keeping things now. Some states start asking for medical documentation a year earlier than this.",
      citation: "42 CFR 435.557(b)(2)",
    },
    {
      date: "December 31, 2028",
      what: "The last date any state's good-faith-effort extension can run to. It cannot be pushed back further.",
      citation: "42 CFR 435.560",
    },
  ],

  citation: "42 CFR 435.550, 435.557(b)(2), 435.559, 435.560",
};
