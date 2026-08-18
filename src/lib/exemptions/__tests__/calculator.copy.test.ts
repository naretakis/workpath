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

import { describe, it, expect, vi } from "vitest";

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

// ─────────────────────────────────────────────────────────────────────────────
// W0 § 0.2 CHARACTERIZATION — added 2026-08-17
//
// W2a's "behaviour is unchanged" block above was a safety net for editing strings
// inside a Tier-1 module. It pins that every branch still resolves, the category
// each returns, ONE cascade pair (age over Medicare), and ONE calculateAge
// boundary. That is not the whole contract.
//
// W0 § 0.2 asks for "first-match-wins order across all 12 checks; calculateAge
// boundaries". Two corrections to that instruction, both measured:
//
//   - There are **13** returning branches, not 12, plus a fall-through: 2 age
//     sub-branches inside the single `dateOfBirth` guard, then 11 boolean guards.
//     `grep -c "nextSteps:"` on the module returns 14 (13 + the fall-through).
//     The audit's "12-way switch" figure counts question IDs in a DIFFERENT file
//     (`AssessmentFlow`'s questionId switches), not branches in this one.
//   - "First-match-wins" is pinned pairwise below rather than as one assertion,
//     because a single fixture with every flag set cannot distinguish "age wins"
//     from "the cascade is in the order I assumed".
//
// Why the order is load-bearing rather than incidental: 42 CFR 435.557(c)(2)
// requires the state to find EXCLUSION whenever it has sufficient information,
// even where the person also demonstrated compliance — so precedence between
// tiers has legal effect. This module cannot express the tiers yet (ADR-0002; the
// `isExempt` boolean flattens 42 CFR 435.554 exclusion, 435.553 exception, and
// 435.555 hardship into one flag), and W3 replaces it. Pinning the current order
// is what makes W3's reordering visible as a deliberate change.
// CMS-2454-IFC, 91 FR 33348 (June 3, 2026).
// ─────────────────────────────────────────────────────────────────────────────

describe("W0 § 0.2: first-match-wins cascade, pinned pairwise across all 13 branches", () => {
  /**
   * The cascade in source order. Index 0 is checked first.
   * Verified against src/lib/exemptions/calculator.ts on 2026-08-17: guards at
   * lines 50/53 (age <= 18), 69 (age >= 65), 90, 105, 123, 143, 159, 177, 197,
   * 220, 247, 263, 280.
   */
  const CASCADE: Array<{
    label: string;
    responses: ExemptionResponses;
    category: string;
  }> = [
    {
      label: "age <= 18",
      responses: { dateOfBirth: dobForAge(17) },
      category: "age",
    },
    {
      label: "age >= 65",
      responses: { dateOfBirth: dobForAge(70) },
      category: "age",
    },
    {
      label: "isPregnantOrPostpartum",
      responses: { isPregnantOrPostpartum: true },
      category: "family-caregiving",
    },
    {
      label: "hasDependentChild13OrYounger",
      responses: { hasDependentChild13OrYounger: true },
      category: "family-caregiving",
    },
    {
      label: "isParentGuardianOfDisabled",
      responses: { isParentGuardianOfDisabled: true },
      category: "family-caregiving",
    },
    {
      label: "isOnMedicare",
      responses: { isOnMedicare: true },
      category: "health-disability",
    },
    {
      label: "isEligibleForNonMAGI",
      responses: { isEligibleForNonMAGI: true },
      category: "health-disability",
    },
    {
      label: "isDisabledVeteran",
      responses: { isDisabledVeteran: true },
      category: "health-disability",
    },
    {
      label: "isMedicallyFrail",
      responses: { isMedicallyFrail: true },
      category: "health-disability",
    },
    {
      label: "isOnSNAPOrTANFMeetingRequirements",
      responses: { isOnSNAPOrTANFMeetingRequirements: true },
      category: "program-participation",
    },
    {
      label: "isInRehabProgram",
      responses: { isInRehabProgram: true },
      category: "program-participation",
    },
    {
      label: "isIncarceratedOrRecentlyReleased",
      responses: { isIncarceratedOrRecentlyReleased: true },
      category: "other",
    },
    {
      label: "hasTribalStatus",
      responses: { hasTribalStatus: true },
      category: "other",
    },
  ];

  it("the cascade has exactly 13 returning branches", () => {
    // Guards against a branch being added or removed without the pairwise sweep
    // below being extended to cover it.
    expect(CASCADE).toHaveLength(13);
  });

  it("each branch in isolation returns its own exemptionReason", () => {
    // `exemptionReason` is the string most likely to be printed in an export or a
    // summary, and W2a corrected one of them (the SNAP/TANF label) precisely
    // because of that. Pinned per branch so a later edit cannot silently swap two.
    const reasons = CASCADE.map(
      ({ responses }) => calculateExemption(responses).exemptionReason,
    );

    expect(reasons).toEqual([
      "18 years old or younger",
      "65 years old or older",
      "Pregnant or recently gave birth",
      "Has dependent child 13 or younger",
      "Parent or guardian of someone with a disability",
      "Has Medicare",
      "Gets Medicaid for disability or long-term care (non-MAGI Medicaid)",
      "Disabled veteran",
      "Has a serious health condition or disability",
      "On SNAP or TANF",
      "In drug or alcohol treatment program",
      "In jail/prison or recently released",
      "Native American tribal member or IHS-eligible",
    ]);
  });

  it("42 CFR 435.557(c)(2): every earlier branch wins over every later one, pairwise", () => {
    // 13 branches -> 78 ordered pairs. A single all-flags-set fixture would only
    // prove that ONE branch wins; this proves the whole order.
    for (let earlier = 0; earlier < CASCADE.length; earlier++) {
      for (let later = earlier + 1; later < CASCADE.length; later++) {
        const combined = {
          ...CASCADE[later].responses,
          ...CASCADE[earlier].responses,
        };
        const result = calculateExemption(combined);
        const label = `${CASCADE[earlier].label} should win over ${CASCADE[later].label}`;

        expect(result.exemptionReason, label).toBe(
          calculateExemption(CASCADE[earlier].responses).exemptionReason,
        );
      }
    }
  });

  it("CHARACTERIZATION: an in-range date of birth falls through the age guard entirely", () => {
    // Ages 19-64 are the 42 CFR 435.119 adult group, i.e. the population the
    // requirement actually reaches (42 CFR 435.551). Neither age sub-branch fires,
    // so evaluation continues to the boolean guards.
    const result = calculateExemption({
      dateOfBirth: dobForAge(40),
      isOnMedicare: true,
    });

    expect(result.exemptionCategory).toBe("health-disability");
    expect(result.exemptionReason).toBe("Has Medicare");
  });

  it("an in-range date of birth with no other flags resolves to not-apparently-excluded", () => {
    const result = calculateExemption({ dateOfBirth: dobForAge(40) });

    expect(result.isExempt).toBe(false);
    expect(result.exemptionCategory).toBeUndefined();
    expect(result.exemptionReason).toBeUndefined();
  });

  it("CHARACTERIZATION: an explicit `false` answer is treated the same as no answer", () => {
    // The guards are bare truthiness checks, so `false` and `undefined` are
    // indistinguishable. That matters for W4: 42 CFR 435.554(c)(5)(ii) requires
    // states to offer an off-list request path for medically-frail conditions, and
    // "I answered no" versus "I was never asked" are different evidentiary
    // positions. The current model cannot tell them apart.
    const explicitlyFalse = calculateExemption({
      isPregnantOrPostpartum: false,
      isMedicallyFrail: false,
      hasTribalStatus: false,
    });

    expect(explicitlyFalse.isExempt).toBe(false);
    expect(explicitlyFalse).toEqual(calculateExemption(NONE));
  });
});

describe("W0 § 0.2: calculateAge boundaries", () => {
  // calculateAge reads `new Date()` directly, so every case below is constructed
  // RELATIVE to today rather than against a literal date. That is why these tests
  // do not use fake timers: the module takes no clock parameter, and faking the
  // clock would test a different code path from the one that ships.
  //
  // The implementation is:
  //   age = today.getFullYear() - dob.getFullYear()
  //   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
  //     age--
  // i.e. a whole-year difference, decremented when the birthday has not yet
  // arrived this year.

  const today = new Date();

  it("someone whose 19th birthday is today is 19, so the under-19 branch does NOT fire", () => {
    const nineteenToday = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate(),
    );

    expect(calculateExemption({ dateOfBirth: nineteenToday }).isExempt).toBe(
      false,
    );
  });

  it("someone whose 19th birthday is tomorrow is still 18, so the branch fires", () => {
    const nineteenTomorrow = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate() + 1,
    );

    expect(
      calculateExemption({ dateOfBirth: nineteenTomorrow }).exemptionReason,
    ).toBe("18 years old or younger");
  });

  it("someone whose 65th birthday is today is 65, so the outside-the-group branch fires", () => {
    const sixtyFiveToday = new Date(
      today.getFullYear() - 65,
      today.getMonth(),
      today.getDate(),
    );

    expect(
      calculateExemption({ dateOfBirth: sixtyFiveToday }).exemptionReason,
    ).toBe("65 years old or older");
  });

  it("someone whose 65th birthday is tomorrow is still 64, so neither age branch fires", () => {
    // 64 is inside the 42 CFR 435.119 adult group. This is the boundary that
    // decides whether the requirement reaches the person at all, so it is the one
    // most worth pinning.
    const sixtyFiveTomorrow = new Date(
      today.getFullYear() - 65,
      today.getMonth(),
      today.getDate() + 1,
    );

    expect(
      calculateExemption({ dateOfBirth: sixtyFiveTomorrow }).isExempt,
    ).toBe(false);
  });

  it("decrements when the birthday month is later this year (monthDiff < 0)", () => {
    // Exercises the first disjunct of the decrement condition, independently of
    // the day-of-month comparison.
    const birthdayNextMonth = new Date(
      today.getFullYear() - 19,
      today.getMonth() + 1,
      1,
    );

    expect(
      calculateExemption({ dateOfBirth: birthdayNextMonth }).exemptionReason,
    ).toBe("18 years old or younger");
  });

  it("does not decrement when the birthday month has already passed this year", () => {
    const birthdayLastMonth = new Date(
      today.getFullYear() - 19,
      today.getMonth() - 1,
      1,
    );

    expect(
      calculateExemption({ dateOfBirth: birthdayLastMonth }).isExempt,
    ).toBe(false);
  });

  it("CHARACTERIZATION: a future date of birth yields a negative age, which the <= 18 branch accepts", () => {
    // No validation. A typo in the year — 2062 for 2026 — produces a negative age
    // and is reported as "18 years old or younger", which is a plausible-looking
    // answer derived from impossible input. Recorded rather than fixed: input
    // validation at the screening boundary is W4's scope.
    const future = new Date(today.getFullYear() + 10, today.getMonth(), 1);

    expect(calculateExemption({ dateOfBirth: future }).exemptionReason).toBe(
      "18 years old or younger",
    );
  });

  it("CHARACTERIZATION: a Feb-29 date in a non-leap year silently rolls over to March 1", () => {
    // The `Date` constructor normalises out-of-range days rather than rejecting
    // them, so a mistyped or non-leap Feb 29 becomes March 1 BEFORE calculateAge
    // ever sees it. That shifts the stored day-of-month from 29 to 1, which is the
    // operand in the `today.getDate() < dateOfBirth.getDate()` comparison — so on
    // a day between the 2nd and the 28th of the birthday month, the person reads
    // as a year OLDER than the date they typed.
    //
    // Asserted directly against the constructor rather than by recomputing the age
    // with the module's own formula. A test that mirrors the implementation passes
    // whenever both are wrong in the same way, which is no test at all.
    //
    // 2007 is not a leap year; 2008 is.
    const nonLeap = new Date(2007, 1, 29);
    expect(nonLeap.getMonth()).toBe(2); // March, not February
    expect(nonLeap.getDate()).toBe(1);

    const realLeapDay = new Date(2008, 1, 29);
    expect(realLeapDay.getMonth()).toBe(1); // February, preserved
    expect(realLeapDay.getDate()).toBe(29);
  });

  it("the Feb-29 rollover does NOT change the computed age, on any day of the year", () => {
    // A PROPERTY TO PRESERVE, not a defect — and it is recorded here because the
    // first version of this test asserted the opposite and was caught by proving
    // it red. The claim "the rollover can flip the under-19 branch" is false, and
    // the reason is worth writing down so nobody re-derives it:
    //
    // The rollover moves Feb 29 to Mar 1, changing BOTH the month and the day.
    // The month change makes `monthDiff` one lower, which triggers the
    // `monthDiff < 0` decrement on exactly the days where the old day comparison
    // `today.getDate() < 29` would have triggered it. The two effects cancel.
    //
    // So a leap-day birth date and its rolled-over equivalent within the same year
    // are interchangeable for this module. W4 rebuilds the screening questions and
    // may introduce real date validation; this test says what must not regress.
    vi.useFakeTimers();

    const leapDay = new Date(2008, 1, 29); // 29 Feb 2008, preserved
    const rolledOver = new Date(2008, 2, 1); // 1 Mar 2008, what a non-leap year gives
    expect(leapDay.getDate()).toBe(29);

    // Sweep every month boundary plus the days on either side of 1 March, which is
    // where a divergence would have to appear if there were one.
    //
    // BOTH 2026 and 2027 are swept, and that is not padding. A 2008 birth turns 18
    // during 2026, so throughout 2026 both fixtures land inside `age <= 18` and the
    // branch fires either way — which makes 2026 alone unable to detect a
    // divergence. It turns 19 during 2027, so 2027 is where the fixtures straddle
    // the boundary and a difference becomes observable. Proven: with the
    // `monthDiff < 0` disjunct removed from calculateAge, a 2026-only sweep stayed
    // GREEN and the 2026+2027 sweep goes red.
    const probes: Date[] = [];
    for (const year of [2026, 2027]) {
      for (let month = 0; month < 12; month++) {
        probes.push(new Date(year, month, 1, 12));
        probes.push(new Date(year, month, 15, 12));
        probes.push(new Date(year, month, 28, 12));
      }
      probes.push(new Date(year, 1, 27, 12), new Date(year, 2, 2, 12));
    }

    for (const probe of probes) {
      vi.setSystemTime(probe);
      const fromLeapDay = calculateExemption({ dateOfBirth: leapDay });
      const fromRolledOver = calculateExemption({ dateOfBirth: rolledOver });

      expect(
        fromLeapDay.isExempt,
        `divergence on ${probe.toDateString()}`,
      ).toBe(fromRolledOver.isExempt);
      expect(
        fromLeapDay.exemptionReason,
        `divergence on ${probe.toDateString()}`,
      ).toBe(fromRolledOver.exemptionReason);
    }

    vi.useRealTimers();
  });
});
