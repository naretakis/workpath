/**
 * calculator.ts is a Tier-1 module under ADR-0007: it decides the apparent
 * exclusion status a user is shown, so a failing test comes before the change
 * (.kiro/steering/engineering-standards.md).
 *
 * W2a changes only the STRINGS this module returns. The branch order, the
 * conditions, and `isExempt` are untouched — the three-tier re-model is W3/W4 and
 * removing the boolean is W7b. So these tests assert two things:
 *
 *   1. the copy no longer asserts a determination (ADR-0003), and
 *   2. the branch behaviour is unchanged, which is what makes it safe to edit
 *      strings inside a compliance-critical module.
 *
 * Test names carry the CFR citation, so the suite doubles as a statement of what
 * we believe the law requires.
 */

import { describe, it, expect } from "vitest";

import { calculateExemption } from "../calculator";
import type { ExemptionResponses } from "@/types/exemptions";
import {
  findVerdictPhrases,
  formatHits,
} from "@/__tests__/support/verdictPhrases";

/** A date of birth that yields the given age today. */
function dobForAge(age: number): Date {
  const today = new Date();
  return new Date(
    today.getFullYear() - age,
    today.getMonth(),
    today.getDate() - 1,
  );
}

const NONE: ExemptionResponses = {};

/** Every response that trips a branch, with the branch it is meant to trip. */
const BRANCHES: Array<{ label: string; responses: ExemptionResponses }> = [
  { label: "under 19", responses: { dateOfBirth: dobForAge(17) } },
  { label: "65 or older", responses: { dateOfBirth: dobForAge(70) } },
  {
    label: "pregnant or postpartum",
    responses: { isPregnantOrPostpartum: true },
  },
  {
    label: "dependent child 13 or younger",
    responses: { hasDependentChild13OrYounger: true },
  },
  {
    label: "parent or guardian of a disabled individual",
    responses: { isParentGuardianOfDisabled: true },
  },
  { label: "Medicare", responses: { isOnMedicare: true } },
  { label: "non-MAGI Medicaid", responses: { isEligibleForNonMAGI: true } },
  { label: "disabled veteran", responses: { isDisabledVeteran: true } },
  { label: "medically frail", responses: { isMedicallyFrail: true } },
  {
    label: "SNAP or TANF",
    responses: { isOnSNAPOrTANFMeetingRequirements: true },
  },
  { label: "rehabilitation program", responses: { isInRehabProgram: true } },
  {
    label: "incarcerated or recently released",
    responses: { isIncarceratedOrRecentlyReleased: true },
  },
  { label: "tribal status", responses: { hasTribalStatus: true } },
];

describe("ADR-0003: calculateExemption returns no determination in its copy", () => {
  it.each(BRANCHES)(
    "$label — explanation and nextSteps assert nothing",
    ({ responses }) => {
      const result = calculateExemption(responses);
      const hits = [
        ...findVerdictPhrases(result.explanation, "explanation"),
        ...findVerdictPhrases(result.nextSteps, "nextSteps"),
      ];
      expect(hits, formatHits(hits)).toEqual([]);
    },
  );

  it("the no-exclusion-found branch asserts nothing either", () => {
    const result = calculateExemption(NONE);
    const hits = [
      ...findVerdictPhrases(result.explanation, "explanation"),
      ...findVerdictPhrases(result.nextSteps, "nextSteps"),
    ];
    expect(hits, formatHits(hits)).toEqual([]);
  });

  it.each(BRANCHES)(
    "$label — pairs its hedge with a concrete next action",
    ({ responses }) => {
      const { nextSteps } = calculateExemption(responses);
      // compliance-copy-standards.md: "If you can't name the next action, the copy
      // isn't finished." A hedge with nothing after it transfers anxiety without
      // transferring capability.
      expect(nextSteps.length).toBeGreaterThan(30);
      expect(nextSteps).toMatch(/\b(ask|tell|bring|show|check|keep|get)\b/i);
    },
  );

  // POSITIVE FLOOR. Found in review: the no-verdict assertions above are all
  // negative, and an empty string produces no hits — so `explanation: ""` for
  // every branch would have kept the whole suite green. That is
  // compliance-copy-standards.md's "when you delete, replace" failure mode
  // expressed as a test suite, and every negative criterion needs a positive twin.
  it.each(BRANCHES)(
    "$label — explanation actually says something",
    ({ responses }) => {
      const { explanation } = calculateExemption(responses);
      expect(explanation.length).toBeGreaterThan(60);
      // Names the mechanism rather than just hedging: either a category applies, or
      // the month is treated as met, or the requirement doesn't reach them.
      expect(explanation).toMatch(
        /\b(sets? aside|already met|doesn't reach|isn't allowed|different (coverage )?group|routes into)\b/i,
      );
    },
  );

  it("the no-exclusion-found branch says something too", () => {
    const { explanation, nextSteps } = calculateExemption(NONE);
    expect(explanation.length).toBeGreaterThan(60);
    expect(nextSteps.length).toBeGreaterThan(30);
    // 42 CFR 435.557(a)-(b): "nothing matched" is not "the requirement applies".
    expect(explanation).toMatch(/isn't settled|may apply|has to check/i);
  });
});

describe("42 CFR 435.551: age 65 and over is outside the adult group, not excluded within it", () => {
  // Gap 15.21. The applicable-individual definition at 435.551 covers the
  // 435.119 adult group, which is ages 19-64. Someone 65 or over is not an
  // applicable individual who happens to be excluded — they are outside the group
  // the requirement applies to. 435.603(j) makes the adjacent point: MAGI methods
  // are not used where being 65 or older is a condition of eligibility.
  //
  // The old copy said "You may be exempt from work requirements because you're 65
  // or older", which describes the wrong mechanism, and the same error sat in
  // ProfileForm.tsx:198.
  it("does not describe 65+ as an exemption or exclusion", () => {
    const { explanation, nextSteps } = calculateExemption({
      dateOfBirth: dobForAge(70),
    });
    const combined = `${explanation} ${nextSteps}`.toLowerCase();
    expect(combined).not.toContain("exempt");
    expect(combined).not.toContain("exclusion");
    expect(combined).not.toContain("excluded");
  });

  it("says the requirement is for adults 19 to 64", () => {
    // Was /19|64|adult/i — an alternation over three fragments, one of which is
    // the substring "adult", so "Medicaid for adults" passed. Effectively
    // unfalsifiable. Requires the actual range now.
    const { explanation } = calculateExemption({ dateOfBirth: dobForAge(70) });
    expect(explanation).toMatch(/\b19\b/);
    expect(explanation).toMatch(/\b64\b/);
  });
});

describe("42 CFR 435.553(a)(1): under 19 is a mandatory exception, not a specified exclusion", () => {
  // 435.553 exceptions and 435.554 exclusions have different legal effects: an
  // excluded individual is not an applicable individual at all and the state is
  // PROHIBITED from assessing them (435.556(c)), while someone with an exception
  // is deemed to have demonstrated community engagement for the month. Under 19
  // is 435.553(a)(1) — an exception. Re-modelling the tiers is W3/W4; the copy
  // must stop calling it an exemption now.
  it("does not call being under 19 an exemption", () => {
    const { explanation, nextSteps } = calculateExemption({
      dateOfBirth: dobForAge(17),
    });
    expect(`${explanation} ${nextSteps}`.toLowerCase()).not.toContain("exempt");
  });
});

describe("behaviour is unchanged: W2a edits strings, not logic", () => {
  // The safety net for editing inside a Tier-1 module. If a string edit
  // accidentally moves a branch, these fail.
  it("42 CFR 435.554: every listed response still resolves to apparent exclusion", () => {
    for (const { label, responses } of BRANCHES) {
      expect(calculateExemption(responses).isExempt, label).toBe(true);
    }
  });

  it("no responses still resolves to not-apparently-excluded", () => {
    expect(calculateExemption(NONE).isExempt).toBe(false);
  });

  it("preserves the category assigned to each branch", () => {
    const categories = BRANCHES.map(
      ({ responses }) => calculateExemption(responses).exemptionCategory,
    );
    expect(categories).toEqual([
      "age",
      "age",
      "family-caregiving",
      "family-caregiving",
      "family-caregiving",
      "health-disability",
      "health-disability",
      "health-disability",
      "health-disability",
      "program-participation",
      "program-participation",
      "other",
      "other",
    ]);
  });

  it("preserves the cascade order: age wins over a later branch", () => {
    // Age is checked first, so an under-19 user who is also on Medicare resolves
    // on age. Pinning this because W2a reorders nothing — and because
    // 435.557(c)(2) requires exclusion to win wherever the state has sufficient
    // information, which makes the precedence order load-bearing later.
    const result = calculateExemption({
      dateOfBirth: dobForAge(17),
      isOnMedicare: true,
    });
    expect(result.exemptionCategory).toBe("age");
    expect(result.exemptionReason).toContain("18");
  });

  it("calculateAge boundary: someone turning 19 tomorrow is still under 19", () => {
    const today = new Date();
    const dayBefore19thBirthday = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate() + 1,
    );
    expect(
      calculateExemption({ dateOfBirth: dayBefore19thBirthday })
        .exemptionCategory,
    ).toBe("age");
  });
});
