/**
 * recommendationEngine.ts is a Tier-1 module under ADR-0007: it decides which
 * pathway a user is shown, so a failing test comes before the change.
 *
 * W2a scope is narrow here. The strings this module returns stop asserting
 * determinations. What it does NOT do:
 *
 *  - remove `complianceStatus: "compliant"`. That is a verdict in a return value,
 *    ADR-0003 deletes the field, and it cascades into every consumer. W7b owns it.
 *    So `wave-2a-truth-in-copy.md` is explicit that "every verdict string removed"
 *    is true of STRINGS only.
 *  - reposition the engine from a recommender into a "pathways that may fit you"
 *    explainer. Also W7b.
 *
 * What it does: no user-facing string may assert exclusion, compliance, or that
 * one pathway is easiest — 42 CFR 435.552(a) makes all seven pathways equally
 * available, and states must offer all of them.
 */

import { describe, it, expect } from "vitest";

import {
  getComplianceMethodDescription,
  getComplianceMethodLabel,
  calculateRecommendation,
} from "../recommendationEngine";
import { calculateExemption } from "@/lib/exemptions/calculator";
import type { AssessmentResponses, ComplianceMethod } from "@/types/assessment";
import {
  findVerdictPhrases,
  formatHits,
} from "@/__tests__/support/verdictPhrases";

const METHODS: ComplianceMethod[] = [
  "exemption",
  "income-tracking",
  "seasonal-income-tracking",
  "hour-tracking",
];

/** Response shapes that reach each branch of generateRecommendation. */
const SCENARIOS: Array<{ label: string; responses: AssessmentResponses }> = [
  {
    label: "seasonal worker over the threshold",
    responses: {
      exemption: {},
      hasJob: true,
      isSeasonalWork: true,
      monthlyIncome: 700,
    },
  },
  {
    label: "income over the threshold",
    responses: { exemption: {}, hasJob: true, monthlyIncome: 900 },
  },
  {
    label: "hours over the threshold",
    responses: { exemption: {}, hasJob: true, monthlyWorkHours: 120 },
  },
  {
    label: "some hours and some income, both under",
    responses: {
      exemption: {},
      hasJob: true,
      monthlyIncome: 380,
      monthlyWorkHours: 30,
    },
  },
  {
    label: "some hours only, under",
    responses: { exemption: {}, hasJob: true, monthlyWorkHours: 40 },
  },
  {
    label: "some income only, under",
    responses: { exemption: {}, hasJob: true, monthlyIncome: 200 },
  },
  { label: "nothing recorded", responses: { exemption: {}, hasJob: false } },
  {
    // Found in review: every other scenario passes `exemption: {}`, and
    // calculateRecommendation short-circuits on `exemptionResult.isExempt` BEFORE
    // any pathway logic, returning `reasoning: exemptionResult.explanation`. So the
    // highest-stakes branch — the one that tells someone the requirement may not
    // reach them — was never exercised by the sweep at all.
    label: "apparently excluded, the short-circuit branch",
    responses: {
      exemption: { hasDependentChild13OrYounger: true },
      hasJob: false,
    },
  },
];

describe("ADR-0003: recommendation copy asserts no determination", () => {
  it.each(METHODS)(
    "getComplianceMethodDescription(%s) asserts nothing",
    (method) => {
      const hits = findVerdictPhrases(
        getComplianceMethodDescription(method),
        `description(${method})`,
      );
      expect(hits, formatHits(hits)).toEqual([]);
    },
  );

  it.each(METHODS)("getComplianceMethodLabel(%s) asserts nothing", (method) => {
    const hits = findVerdictPhrases(
      getComplianceMethodLabel(method),
      `label(${method})`,
    );
    expect(hits, formatHits(hits)).toEqual([]);
  });

  it.each(SCENARIOS)("$label — reasoning asserts nothing", ({ responses }) => {
    const hits = findVerdictPhrases(
      calculateRecommendation(responses).reasoning,
      "reasoning",
    );
    expect(hits, formatHits(hits)).toEqual([]);
  });
});

describe("42 CFR 435.552(a): no pathway is ranked above another", () => {
  // States must make all seven pathways available and may not offer a subset.
  // Which one is least effort for a given person turns on what the state can
  // already see under 435.557(a) and on elections we do not know, so HourKeep can
  // say a pathway may suit someone — not that it is the easiest.
  it.each(METHODS)("does not call %s the easiest", (method) => {
    const text =
      `${getComplianceMethodDescription(method)} ${getComplianceMethodLabel(method)}`.toLowerCase();
    expect(text).not.toContain("easiest");
    expect(text).not.toContain("perfect");
  });

  it.each(SCENARIOS)("$label — reasoning ranks nothing", ({ responses }) => {
    const reasoning =
      calculateRecommendation(responses).reasoning.toLowerCase();
    expect(reasoning).not.toContain("easiest");
    expect(reasoning).not.toContain("perfect");
  });
});

describe("42 CFR 435.552(e): copy does not present hours and income as either/or", () => {
  // An earlier version of this test asserted only /\b(add|combine|together)\b/,
  // and it passed against copy that read "You need EITHER 50 more hours OR $200
  // more income" — because "add more work" contains "add". A test that a
  // falsehood satisfies is worse than no test. It now asserts the absence of the
  // either/or construction directly.
  const UNDER_BOTH: AssessmentResponses = {
    exemption: {},
    hasJob: true,
    monthlyIncome: 380,
    monthlyWorkHours: 30,
  };

  it("does not tell a user to choose between hours and income", () => {
    const { reasoning } = calculateRecommendation(UNDER_BOTH);
    expect(reasoning).not.toMatch(/\beither\b/i);
    expect(reasoning).not.toMatch(/\bor\s+\$/i);
    expect(reasoning).not.toMatch(/\binstead\b/i);
  });

  it("says the two can be counted together", () => {
    // 42 CFR 435.552(e)(2) worked example is exactly this user: $380 / $7.25 is
    // up to 52 hours, which added to 30 recorded hours clears 80. Telling them to
    // pick a lane is stricter than the rule and against their interest.
    const { reasoning } = calculateRecommendation(UNDER_BOTH);
    expect(reasoning).toMatch(/\b(together|combine[ds]?|alongside|both)\b/i);
  });

  it("never states a credited-hours figure as an estimate", () => {
    // Was wrapped in `if (/hours/ && /\$\d/)`, so a copy change that dropped either
    // made the test pass with ZERO assertions — and the body was negative-only, so
    // it never checked that any bound was stated. Found in review.
    //
    // 435.552(e)(2)(i) requires the state to allocate credited hours between
    // household members by a method we cannot know, so any figure we show is a
    // ceiling. compliance-copy-standards.md: "up to", never "about".
    for (const { label, responses } of SCENARIOS) {
      const { reasoning } = calculateRecommendation(responses);
      expect(reasoning, label).not.toMatch(/\babout \d/i);
      // If a converted-hours figure is quoted at all, it must be bounded.
      if (/÷|\bcredit(ed|s)? (income )?as\b.*\b\d+ hours\b/i.test(reasoning)) {
        expect(reasoning, label).toMatch(/\bup to\b/i);
      }
    }
  });

  it.each(SCENARIOS)(
    "$label — never uses an either/or construction",
    ({ responses }) => {
      // All three patterns on every scenario, not just `\beither\b` on the sweep
      // and the full set on one fixture. The narrow sweep was the same
      // one-word-wide check this file's own comment claims to have fixed, so
      // "Threshold: 80 hours — or you can earn $580 instead of logging hours"
      // would have passed on six of seven branches. Found in review.
      const { reasoning } = calculateRecommendation(responses);
      expect(reasoning).not.toMatch(/\beither\b/i);
      expect(reasoning).not.toMatch(/\bor\s+\$/i);
      expect(reasoning).not.toMatch(/\binstead of (logging|tracking)\b/i);
    },
  );

  it("the exemption short-circuit returns the calculator's copy, not a verdict", () => {
    // Pins the branch at the top of calculateRecommendation, which returns
    // `reasoning: exemptionResult.explanation` before any pathway logic runs.
    const { primaryMethod, reasoning } = calculateRecommendation({
      exemption: { hasDependentChild13OrYounger: true },
      hasJob: false,
    });
    expect(primaryMethod).toBe("exemption");
    expect(reasoning.length).toBeGreaterThan(60);
    const hits = findVerdictPhrases(reasoning, "exemption short-circuit");
    expect(hits, formatHits(hits)).toEqual([]);
  });
});

describe("behaviour is unchanged: W2a edits strings, not logic", () => {
  it("still selects seasonal income tracking for a seasonal worker over the threshold", () => {
    expect(
      calculateRecommendation({
        exemption: {},
        hasJob: true,
        isSeasonalWork: true,
        monthlyIncome: 700,
      }).primaryMethod,
    ).toBe("seasonal-income-tracking");
  });

  it("still selects income tracking over hour tracking when income clears the threshold", () => {
    expect(
      calculateRecommendation({
        exemption: {},
        hasJob: true,
        monthlyIncome: 900,
        monthlyWorkHours: 120,
      }).primaryMethod,
    ).toBe("income-tracking");
  });

  it("still falls back to hour tracking when nothing clears a threshold", () => {
    expect(
      calculateRecommendation({ exemption: {}, hasJob: false }).primaryMethod,
    ).toBe("hour-tracking");
  });

  it("still reports the difference to the threshold as a labelled number", () => {
    // hoursNeeded survives as neutral arithmetic (ADR-0003, Computed): a difference
    // is not a verdict.
    //
    // The earlier version used monthlyWorkHours: 40 and asserted toContain("40") —
    // but 80 - 40 = 40, so the input and the difference were the same number and
    // the assertion could not tell "Recorded: 40" from "Difference: 40". Deleting
    // the difference entirely would have passed. Same shape as the "add" bug this
    // wave already found. 30 recorded gives a distinguishable 50.
    const { reasoning } = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyWorkHours: 30,
    });
    expect(reasoning).toContain("Recorded: 30 hours");
    expect(reasoning).toContain("Difference: 50");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W0 § 0.2 CHARACTERIZATION — added 2026-08-17
//
// W2a's "behaviour is unchanged" block above pins four selections and one
// difference string. W0 § 0.2 asks additionally for "the four-gate ladder;
// `alternativeMethods: []` for exempt".
//
// One correction to that instruction, measured against the source: the structure
// is not four peer gates. It is an exclusion SHORT-CIRCUIT followed by a
// three-way priority chain, and the difference matters because the short-circuit
// returns before `viableMethods` is ever built — which is exactly why
// `alternativeMethods` is empty for an apparently-excluded user, and why that
// emptiness is a consequence rather than a decision.
//
// Reading the shape onto the rule, because it is where the model diverges most:
//
//   - 42 CFR 435.557(c)(2) does require exclusion to take precedence, so a
//     short-circuit is the right shape at the top. But ADR-0002 records that
//     `isExempt` flattens three legally distinct tiers, and 42 CFR 435.556(c)
//     PROHIBITS the state from assessing an excluded individual at all — which is
//     a stronger statement than "we skipped the pathway logic".
//   - 42 CFR 435.552(a) makes all seven pathways available and ranks none. The
//     priority chain here ranks three. W2a already removed the copy that asserted
//     one was easier; the ORDERING itself survives and is W7b's to remove.
//   - 42 CFR 435.552(e)(1) requires activities to be ADDED TOGETHER, and (e)(2)
//     lets income below the threshold be credited as hours and combined. The chain
//     below tests each pathway INDEPENDENTLY against its own threshold, so a user
//     at 60 hours and $400 clears neither and is told they are short on both.
//     Under the rule those may combine. That is the single largest behavioural
//     gap in this module and it belongs to W7b.
//
// CMS-2454-IFC, 91 FR 33348 (June 3, 2026).
// ─────────────────────────────────────────────────────────────────────────────

describe("W0 § 0.2: the exclusion short-circuit", () => {
  it("returns before any pathway logic runs, so alternativeMethods is empty", () => {
    // 42 CFR 435.556(c). Pinned as the OBSERVABLE consequence: the user has
    // $900/month and 120 hours, both of which would otherwise register as viable
    // pathways, and neither appears.
    const result = calculateRecommendation({
      exemption: { hasDependentChild13OrYounger: true },
      hasJob: true,
      monthlyIncome: 900,
      monthlyWorkHours: 120,
    });

    expect(result.primaryMethod).toBe("exemption");
    expect(result.alternativeMethods).toEqual([]);
  });

  it("takes precedence for every one of the calculator's exclusion branches", () => {
    // Not just the one branch the sweep above happens to use. If any branch stopped
    // short-circuiting, a user the state may be prohibited from assessing would be
    // routed into hour tracking.
    const exclusions: Array<AssessmentResponses["exemption"]> = [
      { isPregnantOrPostpartum: true },
      { hasDependentChild13OrYounger: true },
      { isParentGuardianOfDisabled: true },
      { isOnMedicare: true },
      { isEligibleForNonMAGI: true },
      { isDisabledVeteran: true },
      { isMedicallyFrail: true },
      { isOnSNAPOrTANFMeetingRequirements: true },
      { isInRehabProgram: true },
      { isIncarceratedOrRecentlyReleased: true },
      { hasTribalStatus: true },
    ];

    for (const exemption of exclusions) {
      const result = calculateRecommendation({
        exemption,
        hasJob: true,
        monthlyIncome: 900,
      });
      const label = JSON.stringify(exemption);

      expect(result.primaryMethod, label).toBe("exemption");
      expect(result.alternativeMethods, label).toEqual([]);
    }
  });

  it("passes the calculator's explanation through as `reasoning`, unmodified", () => {
    // So the engine adds no verdict of its own on this path, and ADR-0003
    // compliance for the exclusion branch is inherited from calculator.ts rather
    // than duplicated. If that ever changes, the guard in calculator.copy.test.ts
    // stops covering this surface.
    const exemption = { isMedicallyFrail: true };
    const engine = calculateRecommendation({ exemption, hasJob: false });
    const calculator = calculateExemption(exemption);

    expect(engine.reasoning).toBe(calculator.explanation);
  });

  it("reports low estimated effort for the exclusion branch", () => {
    expect(
      calculateRecommendation({
        exemption: { hasTribalStatus: true },
        hasJob: false,
      }).estimatedEffort,
    ).toBe("low");
  });
});

describe("W0 § 0.2: the three-way priority chain, and what it ranks", () => {
  // Order in source: seasonal income -> income -> hours -> fallback to hours.
  // 42 CFR 435.552(a) ranks none of the seven pathways; this ordering is W7b's to
  // remove. Pinned so the removal is visible.

  it("seasonal income outranks plain income when both are viable", () => {
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      isSeasonalWork: true,
      monthlyIncome: 900,
    });

    expect(result.primaryMethod).toBe("seasonal-income-tracking");
    expect(result.alternativeMethods).toEqual(["income-tracking"]);
  });

  it("income outranks hours when both are viable, and hours becomes the alternative", () => {
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyIncome: 900,
      monthlyWorkHours: 120,
    });

    expect(result.primaryMethod).toBe("income-tracking");
    expect(result.alternativeMethods).toEqual(["hour-tracking"]);
  });

  it("lists every viable pathway except the primary one, in source order", () => {
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      isSeasonalWork: true,
      monthlyIncome: 900,
      monthlyWorkHours: 120,
    });

    expect(result.primaryMethod).toBe("seasonal-income-tracking");
    expect(result.alternativeMethods).toEqual([
      "income-tracking",
      "hour-tracking",
    ]);
  });

  it("CHARACTERIZATION: seasonal status is IGNORED unless income already clears the threshold", () => {
    // The seasonal gate is `isSeasonalWork && monthlyIncome >= 580`, so a seasonal
    // worker below the threshold never reaches the seasonal pathway at all.
    //
    // This inverts the purpose of 42 CFR 435.552(g). Averaging exists precisely FOR
    // the worker whose individual months are uneven — someone at $300 in one month
    // and $900 in another. Gating it on a single month already clearing $580 offers
    // the averaging method only to people who do not need it.
    // Owned by W7a (gaps 5.4, 5.5).
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      isSeasonalWork: true,
      monthlyIncome: 300,
    });

    expect(result.primaryMethod).toBe("hour-tracking");
    expect(result.alternativeMethods).toEqual([]);
  });

  it("CHARACTERIZATION: hour-tracking is the fallback, so it is returned even when nothing is viable", () => {
    // `primaryMethod` does not distinguish "hours is your best route" from "nothing
    // cleared a threshold". Both return "hour-tracking"; only `complianceStatus`
    // and `alternativeMethods` differ. A consumer reading `primaryMethod` alone
    // cannot tell them apart.
    const viable = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyWorkHours: 120,
    });
    const nothing = calculateRecommendation({ exemption: {}, hasJob: false });

    expect(viable.primaryMethod).toBe("hour-tracking");
    expect(nothing.primaryMethod).toBe("hour-tracking");
    expect(viable.alternativeMethods).toEqual([]);
    expect(nothing.alternativeMethods).toEqual([]);
    expect(viable.complianceStatus).not.toBe(nothing.complianceStatus);
  });
});

describe("W0 § 0.2: threshold gates and calculateTotalHours", () => {
  // The 580 and 80 literals are ADR-0001 violations that W2b moves to the policy
  // profile. Pinned as inclusive comparisons, i.e. as arithmetic shape.

  it("W2b: the income gate is inclusive — exactly 580 is viable", () => {
    expect(
      calculateRecommendation({
        exemption: {},
        hasJob: true,
        monthlyIncome: 580,
      }).primaryMethod,
    ).toBe("income-tracking");
  });

  it("W2b: 579 is not viable, and the difference is reported as 1", () => {
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyIncome: 579,
    });

    expect(result.primaryMethod).toBe("hour-tracking");
    expect(result.reasoning).toContain("Difference: $1");
  });

  it("W2b: the hours gate is inclusive — exactly 80 is viable", () => {
    expect(
      calculateRecommendation({
        exemption: {},
        hasJob: true,
        monthlyWorkHours: 80,
      }).primaryMethod,
    ).toBe("hour-tracking");
    expect(
      calculateRecommendation({
        exemption: {},
        hasJob: true,
        monthlyWorkHours: 80,
      }).complianceStatus,
    ).toBe("compliant");
  });

  it("42 CFR 435.552(a)(1)-(a)(4): calculateTotalHours sums all four hour fields", () => {
    // work + volunteer + school + work program. 20 each = 80, which clears the
    // threshold only if every field is counted — so a dropped field is detectable.
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyWorkHours: 20,
      volunteerHoursPerMonth: 20,
      schoolHoursPerMonth: 20,
      workProgramHoursPerMonth: 20,
    });

    expect(result.primaryMethod).toBe("hour-tracking");
    expect(result.complianceStatus).toBe("compliant");
    expect(result.reasoning).toContain("Recorded: 80 hours");
  });

  it("each hour field alone contributes to the total, so none is silently ignored", () => {
    const fields = [
      "monthlyWorkHours",
      "volunteerHoursPerMonth",
      "schoolHoursPerMonth",
      "workProgramHoursPerMonth",
    ] as const;

    for (const field of fields) {
      const result = calculateRecommendation({
        exemption: {},
        hasJob: true,
        [field]: 85,
      });
      expect(result.reasoning, field).toContain("Recorded: 85 hours");
    }
  });

  it("CHARACTERIZATION: education hours are combined, which 42 CFR 435.552(a)(5) forbids at half-time", () => {
    // `schoolHoursPerMonth` is summed with everything else. Under
    // 42 CFR 435.552(a)(4) enrolment at least half-time qualifies with ZERO hours,
    // and (a)(5) forbids combining it with other activities; less-than-half-time
    // converts at `creditHours x 3 x 4.33` under (d) and may be combined. The
    // engine has one undifferentiated school-hours field and cannot express the
    // cliff. Owned by W6a.
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      schoolHoursPerMonth: 40,
      monthlyWorkHours: 40,
    });

    expect(result.reasoning).toContain("Recorded: 80 hours");
    expect(result.complianceStatus).toBe("compliant");
  });

  it("treats a missing or zero hours field as 0 rather than NaN", () => {
    const result = calculateRecommendation({ exemption: {}, hasJob: true });

    expect(result.reasoning).toContain("Nothing recorded yet");
    expect(result.reasoning).not.toContain("NaN");
  });

  it("CHARACTERIZATION: `hasJob` is read by nothing in the pathway logic", () => {
    // The field is passed by every caller and every fixture, and the module never
    // branches on it. Recorded because the audit's dead-type-surface list does not
    // include it and W4 rewrites the questions: an unread required-looking input is
    // exactly what gets preserved by accident.
    const withJob = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyIncome: 900,
    });
    const withoutJob = calculateRecommendation({
      exemption: {},
      hasJob: false,
      monthlyIncome: 900,
    });

    expect(withJob).toEqual(withoutJob);
  });
});

describe("W0 § 0.2: complianceStatus and estimatedEffort", () => {
  // `complianceStatus: "compliant"` is a VERDICT IN A RETURN VALUE. W2a's scope
  // boundary named it explicitly and left it; ADR-0003 removes the field and W7b
  // owns that. Pinned so the removal is a visible change and every consumer is
  // found. `Recommendation.complianceStatus` is also on the audit's dead-type
  // surface as `"unknown"` — a third variant no branch ever returns.

  it("returns only 'compliant' or 'needs-increase' — never the declared 'unknown'", () => {
    const observed = new Set(
      SCENARIOS.map(
        ({ responses }) => calculateRecommendation(responses).complianceStatus,
      ),
    );

    expect([...observed].sort()).toEqual(["compliant", "needs-increase"]);
    expect(observed.has("unknown")).toBe(false);
  });

  it("W7b: reports 'compliant' whenever any single pathway clears its threshold", () => {
    for (const responses of [
      { exemption: {}, hasJob: true, monthlyIncome: 900 },
      { exemption: {}, hasJob: true, monthlyWorkHours: 120 },
      {
        exemption: {},
        hasJob: true,
        isSeasonalWork: true,
        monthlyIncome: 700,
      },
    ] as AssessmentResponses[]) {
      expect(calculateRecommendation(responses).complianceStatus).toBe(
        "compliant",
      );
    }
  });

  it("W7b: reports 'needs-increase' when no single pathway clears, even where the rule would combine", () => {
    // 60 hours and $400. Under 42 CFR 435.552(e)(2) a state MAY credit
    // $400 / $7.25 = up to 55 hours and combine that with the 60 recorded, which
    // would exceed 80. The engine tests each pathway alone, so it reports a
    // shortfall on both. This is the (e)(1)/(e)(2) combination gap, owned by W7b —
    // and it is user-unfavourable, which is why it is pinned rather than noted.
    const result = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyWorkHours: 60,
      monthlyIncome: 400,
    });

    expect(result.complianceStatus).toBe("needs-increase");
    expect(result.reasoning).toContain("Difference: 20 hours");
    expect(result.reasoning).toContain("$180");
  });

  it("grades hour-tracking effort by whether recorded hours exceed 100", () => {
    // `totalHours > 100 ? "low" : "medium"`. An undocumented literal that is not
    // a policy value — 100 appears nowhere in the rule — so W2b should not move it
    // to the profile. Recorded so it is not mistaken for one.
    expect(
      calculateRecommendation({
        exemption: {},
        hasJob: true,
        monthlyWorkHours: 101,
      }).estimatedEffort,
    ).toBe("low");
    expect(
      calculateRecommendation({
        exemption: {},
        hasJob: true,
        monthlyWorkHours: 100,
      }).estimatedEffort,
    ).toBe("medium");
  });

  it("reports high effort whenever nothing clears a threshold", () => {
    expect(
      calculateRecommendation({ exemption: {}, hasJob: false }).estimatedEffort,
    ).toBe("high");
  });
});

describe("W0 § 0.2: the four fallback reasoning branches", () => {
  // Four mutually exclusive shapes, selected by which of hours and income are
  // non-zero. Pinned by a distinguishing fragment each, with inputs chosen so the
  // recorded figure and the difference are different numbers — the defect the W2a
  // review found in the original difference test.

  it("hours and income both recorded: states both differences", () => {
    const { reasoning } = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyWorkHours: 30,
      monthlyIncome: 380,
    });

    expect(reasoning).toContain("Recorded: 30 hours and $380");
    expect(reasoning).toContain("Difference: 50 hours / $200");
  });

  it("hours only: states the hours difference and names the other pathways", () => {
    const { reasoning } = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyWorkHours: 30,
    });

    expect(reasoning).toContain("Recorded: 30 hours");
    expect(reasoning).toContain("Difference: 50");
    expect(reasoning).not.toContain("$");
  });

  it("income only: states the income difference and the household caveat", () => {
    const { reasoning } = calculateRecommendation({
      exemption: {},
      hasJob: true,
      monthlyIncome: 380,
    });

    expect(reasoning).toContain("Recorded: $380");
    expect(reasoning).toContain("Difference: $200");
    // 42 CFR 435.552(f)(2) household basis, established by W2a.
    expect(reasoning).toContain("household");
  });

  it("nothing recorded: states both routes without a difference", () => {
    const { reasoning } = calculateRecommendation({
      exemption: {},
      hasJob: false,
    });

    expect(reasoning).toContain("Nothing recorded yet");
    expect(reasoning).not.toContain("Difference");
  });
});
