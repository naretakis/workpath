/**
 * TESTS — src/lib/reviewPeriod.ts
 *
 * W5 (ADR-0005 item 3). Written before the module, per ADR-0007 Tier 1.
 *
 * THE REVIEW PERIOD IS THE UNIT EVERYTHING ELSE IS MEASURED IN. 42 CFR 435.556(a)
 * defines four of them, and every downstream computation the plan still owes —
 * seasonal averaging over the 6 preceding months (§ 435.552(g)), the recent-inmate
 * window (§ 435.553(b)), multi-month progress, the period-scoped evidence package —
 * is a computation over months that are not today.
 *
 * SOURCE TIER, because engineering-standards.md requires it to be labelled.
 * Regulatory text is quoted from `docs/domain/cms-2454-ifc/2026-11094.txt`
 * (§ 435.556 begins at 91 FR 33473; (a)(2) continues onto 33474). Where a test
 * encodes CMS's *reading* rather than the rule's words, the Federal Register page
 * is cited too — that is the case for exactly one behaviour here, the
 * non-consecutive rule at 91 FR 33389.
 *
 * WHAT IS DELIBERATELY NOT HERE. No verdict. `monthsRequiredFor` returns a count
 * and `includesMonth` answers a set-membership question; neither says whether
 * anyone complied. ADR-0003: states determine status.
 */

import { describe, it, expect } from "vitest";
import {
  FEDERAL_DEFAULT_REVIEW_PERIOD,
  applicationReviewPeriod,
  renewalReviewPeriod,
  renewalReviewPeriodEndingAt,
  verificationReviewPeriod,
  newlyApplicableReviewPeriod,
  monthsInReviewPeriod,
  monthsRequiredFor,
  requiresConsecutiveMonths,
  includesMonth,
  type ReviewPeriod,
} from "@/lib/reviewPeriod";

describe("FEDERAL_DEFAULT_REVIEW_PERIOD", () => {
  // ADR-0001: every policy value is a state election or statutory-but-dynamic, and
  // all of them belong in src/lib/policy/. That module does not exist yet — W2b
  // creates it, and W2b is sequenced AFTER W5 — so this is the single named
  // constant the wave file authorises, and W2b moves it.

  it("42 CFR 435.556(a)(1): defaults the application lookback to 1 month, the statutory minimum", () => {
    // "at least one, but not more than 3 consecutive months, as specified in the
    // State plan" — 91 FR 33473. state-options.md records 1 as the pending
    // assumption because it is the least restrictive election and what most
    // states chose.
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.applicationLookbackMonths).toBe(1);
  });

  it("42 CFR 435.556(a)(2): defaults renewal and verification to 1 month each", () => {
    // "demonstration of community engagement for 1 or more months, as specified in
    // the State plan" — 91 FR 33473-74.
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.renewalMonthsRequired).toBe(1);
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.verificationMonthsRequired).toBe(1);
  });

  it("42 CFR 435.556(a)(1): bounds the elected lookback at 1 to 3", () => {
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.applicationLookbackBounds).toEqual({
      min: 1,
      max: 3,
    });
  });

  it("carries a citation, because a policy value without one is a guess", () => {
    // ADR-0001 makes `source` mandatory on the profile for this reason. The
    // constant is a stand-in for a profile, so it carries the same obligation.
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.source).toMatch(/435\.556/);
  });
});

describe("applicationReviewPeriod — 42 CFR 435.556(a)(1)", () => {
  it("42 CFR 435.556(a)(1): is the months IMMEDIATELY PRECEDING the application month, excluding it", () => {
    // "immediately preceding the month of application" — 91 FR 33473. The
    // application month itself is NOT in the review period. This is the same
    // off-by-one class as the seasonal-averaging bug W7a fixes, where HourKeep
    // includes the assessed month and § 435.552(g) excludes it.
    const period = applicationReviewPeriod("2027-01", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      applicationLookbackMonths: 3,
    });

    expect(monthsInReviewPeriod(period)).toEqual([
      "2026-10",
      "2026-11",
      "2026-12",
    ]);
    expect(monthsInReviewPeriod(period)).not.toContain("2027-01");
  });

  it("42 CFR 435.556(a)(1): a 1-month lookback is exactly the month before application", () => {
    const period = applicationReviewPeriod("2027-01");
    expect(monthsInReviewPeriod(period)).toEqual(["2026-12"]);
  });

  it("crosses a year boundary, which is the case that matters for the January 2027 date", () => {
    // Not a hypothetical: states must implement by January 1, 2027, and a new
    // applicant in January 2027 is assessed on December 2026. That is why
    // PRD.md § 10 puts the operative date at ~December 1, 2026.
    const period = applicationReviewPeriod("2027-02", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      applicationLookbackMonths: 3,
    });
    expect(monthsInReviewPeriod(period)).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
    ]);
  });

  it("returns months in ascending calendar order", () => {
    const period = applicationReviewPeriod("2026-07", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      applicationLookbackMonths: 3,
    });
    expect(monthsInReviewPeriod(period)).toEqual([
      "2026-04",
      "2026-05",
      "2026-06",
    ]);
  });

  it("42 CFR 435.556(a)(1): rejects a lookback outside 1 to 3 months", () => {
    // "at least one, but not more than 3" — a 0 or a 4 is not a state election
    // the rule permits, and silently accepting one would produce a review period
    // no state can lawfully impose.
    expect(() =>
      applicationReviewPeriod("2027-01", {
        ...FEDERAL_DEFAULT_REVIEW_PERIOD,
        applicationLookbackMonths: 0,
      }),
    ).toThrow(/435\.556/);
    expect(() =>
      applicationReviewPeriod("2027-01", {
        ...FEDERAL_DEFAULT_REVIEW_PERIOD,
        applicationLookbackMonths: 4,
      }),
    ).toThrow(/435\.556/);
  });

  it("rejects a malformed application month", () => {
    expect(() => applicationReviewPeriod("2027")).toThrow();
  });

  it("42 CFR 435.556(a)(1): requires ALL elected months, so every month in the period is required", () => {
    // The application arm differs from the three enrolled arms: the rule says
    // "demonstration ... for at least one, but not more than 3 CONSECUTIVE
    // months", and rule-extract.md § 6 reads that as all of the state-elected
    // months. There is no "any one of these will do" here.
    const period = applicationReviewPeriod("2027-01", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      applicationLookbackMonths: 3,
    });
    expect(monthsRequiredFor(period)).toBe(3);
    expect(monthsRequiredFor(period)).toBe(monthsInReviewPeriod(period).length);
  });

  it("42 CFR 435.556(a)(1): the application months must be consecutive", () => {
    const period = applicationReviewPeriod("2027-01", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      applicationLookbackMonths: 3,
    });
    expect(requiresConsecutiveMonths(period)).toBe(true);
  });
});

describe("renewalReviewPeriod — 42 CFR 435.556(a)(2)(i)", () => {
  it("42 CFR 435.556(a)(2)(i): spans the eligibility period inclusively", () => {
    // "During the period between the effective date of such individual's most
    // recent determination or redetermination at renewal ... and the date the
    // individual's renewal is due" — 91 FR 33474.
    const period = renewalReviewPeriod("2026-07", "2026-12");
    expect(monthsInReviewPeriod(period)).toEqual([
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
      "2026-12",
    ]);
  });

  it("91 FR 33389: does NOT require consecutive months", () => {
    // PREAMBLE, not rule text, so the FR page is the citation. CMS: the clause
    // "whether or not consecutive" is "not modified by a grant of discretion to
    // the State. We therefore interpret it not to permit the State to require a
    // beneficiary to demonstrate community engagement for consecutive months ...
    // or to dictate the specific month(s)".
    //
    // This is user-favourable and under-communicated, which is why W5's UI states
    // it. Any qualifying month in the period counts.
    const period = renewalReviewPeriod("2026-07", "2026-12", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      renewalMonthsRequired: 3,
    });
    expect(requiresConsecutiveMonths(period)).toBe(false);
  });

  it("42 CFR 435.556(a)(2): defaults to requiring 1 month out of the whole period", () => {
    const period = renewalReviewPeriod("2026-07", "2026-12");
    expect(monthsRequiredFor(period)).toBe(1);
    expect(monthsInReviewPeriod(period)).toHaveLength(6);
  });

  it("42 CFR 435.556(b): caps months required at the length of the review period", () => {
    // "A State must not require an applicable individual to demonstrate community
    // engagement for a period that exceeds the period specified in paragraph
    // (a)(2)(i), (ii), or (iii)" — 91 FR 33474. A state electing 6 months against
    // a 3-month eligibility period cannot require 6.
    const period = renewalReviewPeriod("2026-10", "2026-12", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      renewalMonthsRequired: 6,
    });
    expect(monthsInReviewPeriod(period)).toHaveLength(3);
    expect(monthsRequiredFor(period)).toBe(3);
  });

  it("42 CFR 435.556(a)(2): requires at least 1 month even if a caller asks for fewer", () => {
    const period = renewalReviewPeriod("2026-07", "2026-12", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      renewalMonthsRequired: 0,
    });
    expect(monthsRequiredFor(period)).toBe(1);
  });
});

describe("verificationReviewPeriod — 42 CFR 435.556(a)(2)(ii)", () => {
  it("42 CFR 435.556(a)(2)(ii): spans between demonstrations, inclusively", () => {
    // "During the period between the most recent demonstration of community
    // engagement and the date the individual's next demonstration ... is due,
    // consistent with § 435.557(d)" — 91 FR 33474. A state election; most
    // decline, but Indiana and New Hampshire do quarterly checks.
    const period = verificationReviewPeriod("2027-01", "2027-03");
    expect(monthsInReviewPeriod(period)).toEqual([
      "2027-01",
      "2027-02",
      "2027-03",
    ]);
  });

  it("91 FR 33389: does NOT require consecutive months either", () => {
    const period = verificationReviewPeriod("2027-01", "2027-03");
    expect(requiresConsecutiveMonths(period)).toBe(false);
  });

  it("42 CFR 435.556(b): is capped by the period length like the renewal arm", () => {
    const period = verificationReviewPeriod("2027-01", "2027-02", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      verificationMonthsRequired: 5,
    });
    expect(monthsRequiredFor(period)).toBe(2);
  });
});

describe("newlyApplicableReviewPeriod — 42 CFR 435.556(a)(2)(iii)", () => {
  it("42 CFR 435.556(a)(2)(iii): ends at the END OF THE MONTH PRIOR to becoming applicable", () => {
    // "and the end of the month prior to the month in which the individual becomes
    // an applicable individual as a result of a redetermination based on a change
    // in circumstances in accordance with § 435.916(d)" — 91 FR 33474.
    //
    // So a person who becomes an applicable individual in April is assessed
    // THROUGH MARCH and not for April. Getting this off by one would assess a
    // month the state may not assess.
    const period = newlyApplicableReviewPeriod("2027-01", "2027-04");
    expect(monthsInReviewPeriod(period)).toEqual([
      "2027-01",
      "2027-02",
      "2027-03",
    ]);
    expect(monthsInReviewPeriod(period)).not.toContain("2027-04");
  });

  it("42 CFR 435.556(a)(2)(iii): requires the LESSER of the elected months and the months available", () => {
    // rule-extract.md § 6: "Lesser of State-elected months or months in the review
    // period". Distinct from § 435.556(b)'s general cap in wording, identical in
    // effect, and worth its own test because this arm is the one where the period
    // is most often shorter than the election.
    const short = newlyApplicableReviewPeriod("2027-03", "2027-04", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      renewalMonthsRequired: 3,
    });
    expect(monthsInReviewPeriod(short)).toEqual(["2027-03"]);
    expect(monthsRequiredFor(short)).toBe(1);

    const long = newlyApplicableReviewPeriod("2027-01", "2027-06", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      renewalMonthsRequired: 3,
    });
    expect(monthsInReviewPeriod(long)).toHaveLength(5);
    expect(monthsRequiredFor(long)).toBe(3);
  });

  it("yields an empty period when someone becomes applicable in the month their coverage began", () => {
    // Representable and real: nothing precedes the start, so there is no month the
    // state may assess. An empty list is the honest answer; a one-month list
    // containing the start month would assess a month § 435.556(a)(2)(iii)
    // excludes.
    const period = newlyApplicableReviewPeriod("2027-04", "2027-04");
    expect(monthsInReviewPeriod(period)).toEqual([]);
    expect(monthsRequiredFor(period)).toBe(0);
  });

  it("91 FR 33389: does NOT require consecutive months", () => {
    const period = newlyApplicableReviewPeriod("2027-01", "2027-04");
    expect(requiresConsecutiveMonths(period)).toBe(false);
  });
});

describe("includesMonth", () => {
  it("answers set membership for every arm", () => {
    const application = applicationReviewPeriod("2027-01", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      applicationLookbackMonths: 3,
    });
    expect(includesMonth(application, "2026-11")).toBe(true);
    expect(includesMonth(application, "2027-01")).toBe(false);

    const renewal = renewalReviewPeriod("2026-07", "2026-12");
    expect(includesMonth(renewal, "2026-07")).toBe(true);
    expect(includesMonth(renewal, "2026-12")).toBe(true);
    expect(includesMonth(renewal, "2027-01")).toBe(false);
  });

  it("is false for a malformed month rather than throwing", () => {
    // Called from render paths where a throw would blank the page. A membership
    // question has a safe negative answer; a constructor does not, which is why
    // the constructors above throw and this does not.
    const renewal = renewalReviewPeriod("2026-07", "2026-12");
    expect(includesMonth(renewal, "2026")).toBe(false);
  });
});

describe("the ReviewPeriod value carries no verdict", () => {
  it("exposes months and counts, and nothing shaped like a determination", () => {
    // ADR-0003 and engineering-standards.md: "This constrains types and return
    // values, not only copy. `isCompliant: boolean` is a verdict regardless of
    // what renders it." A review period is a set of months the state may look at.
    // It must not acquire a field saying how that went.
    const periods: ReviewPeriod[] = [
      applicationReviewPeriod("2027-01"),
      renewalReviewPeriod("2026-07", "2026-12"),
      verificationReviewPeriod("2027-01", "2027-03"),
      newlyApplicableReviewPeriod("2027-01", "2027-04"),
    ];

    const banned =
      /compliant|compliance|exempt|eligible|satisfied|passed|met$/i;
    for (const period of periods) {
      for (const key of Object.keys(period)) {
        expect(key, `${period.kind}.${key}`).not.toMatch(banned);
      }
    }
  });
});

describe("renewalReviewPeriodEndingAt — deriving a renewal period from the due month", () => {
  // WHY THIS EXISTS, and why it is the shakiest thing in this module.
  //
  // § 435.556(a)(2)(i) makes the renewal review period "the period between the
  // effective date of such individual's most recent determination or
  // redetermination at renewal ... and the date the individual's renewal is due".
  // A user can reasonably be expected to know when their renewal is due. Almost
  // nobody knows the effective date of their last redetermination, and nothing in
  // HourKeep's schema recorded it.
  //
  // So the start is derived from an assumed renewal frequency, and that figure does
  // NOT come from this rule. The IFC amends § 435.916 to say MAGI renewals happen
  // every 12 months and no more often; its own preamble says the adult group is
  // subject to 6-month renewals from January 1, 2027 under § 1902(e)(14)(L) — a
  // different section of PL 119-21 that this rule does not implement, and which
  // does not apply to American Indians or most § 1115 enrollees. The two do not
  // agree, and no reconciling rulemaking has landed.
  //
  // `.kiro/steering/medicaid-domain-knowledge.md` § "Renewal frequency — a known
  // ambiguity" gives the instruction directly: treat 6 months as operative for the
  // adult group, flag it as sourced elsewhere, and watch for the reconciling
  // rulemaking. That is what this does. The number lives in the policy constant
  // with the ambiguity recorded in `source`, so W2b moves a documented assumption
  // rather than an anonymous 6.
  //
  // ADR-0003 classification: Conditional, and specifically a conditional whose
  // condition we are least sure of. Any UI built on it must say the state decides.

  it("42 CFR 435.556(a)(2)(i): the due month is the last month of the period, inclusive", () => {
    const period = renewalReviewPeriodEndingAt("2027-06");
    const months = monthsInReviewPeriod(period);

    expect(months[months.length - 1]).toBe("2027-06");
  });

  it("spans the assumed renewal frequency, six months by default", () => {
    const period = renewalReviewPeriodEndingAt("2027-06");

    expect(monthsInReviewPeriod(period)).toEqual([
      "2027-01",
      "2027-02",
      "2027-03",
      "2027-04",
      "2027-05",
      "2027-06",
    ]);
  });

  it("crosses a year boundary", () => {
    const period = renewalReviewPeriodEndingAt("2027-02");
    expect(monthsInReviewPeriod(period)).toEqual([
      "2026-09",
      "2026-10",
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
  });

  it("follows the policy when a state's renewal frequency is different", () => {
    const period = renewalReviewPeriodEndingAt("2027-06", {
      ...FEDERAL_DEFAULT_REVIEW_PERIOD,
      renewalPeriodMonths: 12,
    });
    expect(monthsInReviewPeriod(period)).toHaveLength(12);
    expect(monthsInReviewPeriod(period)[0]).toBe("2026-07");
  });

  it("91 FR 33389: still does not require consecutive months", () => {
    // The derived SPAN is an assumption. The non-consecutive rule is not — it is
    // CMS's reading of statutory text, and it survives however the span is
    // computed.
    const period = renewalReviewPeriodEndingAt("2027-06");
    expect(requiresConsecutiveMonths(period)).toBe(false);
  });

  it("42 CFR 435.556(a)(2): requires only 1 of those months by default", () => {
    // The user-favourable half, and the half that gets under-communicated: a
    // six-month period with one month required means any single qualifying month
    // in six is enough under the federal default.
    const period = renewalReviewPeriodEndingAt("2027-06");
    expect(monthsRequiredFor(period)).toBe(1);
    expect(monthsInReviewPeriod(period)).toHaveLength(6);
  });

  it("records the § 435.916 / § 1902(e)(14)(L) conflict in the policy source", () => {
    // The assumption must not be able to travel without its caveat. If someone
    // later reads `renewalPeriodMonths: 6` and takes it for a finding of this rule,
    // that is the failure this test exists to prevent.
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.renewalPeriodMonths).toBe(6);
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.renewalPeriodMonthsSource).toMatch(
      /1902\(e\)\(14\)\(L\)/,
    );
    expect(FEDERAL_DEFAULT_REVIEW_PERIOD.renewalPeriodMonthsSource).toMatch(
      /435\.916/,
    );
  });

  it("rejects a malformed due month", () => {
    expect(() => renewalReviewPeriodEndingAt("2027")).toThrow();
  });
});
