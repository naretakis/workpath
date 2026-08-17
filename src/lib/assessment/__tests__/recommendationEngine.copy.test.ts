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
