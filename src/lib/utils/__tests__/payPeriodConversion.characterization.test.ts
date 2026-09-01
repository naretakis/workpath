/**
 * CHARACTERIZATION TESTS — src/lib/utils/payPeriodConversion.ts
 *
 * Added by W0 § 0.2. Pins CURRENT behaviour so a later diff proves which changes
 * were intentional. W0 fixes nothing here.
 *
 * ## A deliberate deviation from the wave file, and why
 *
 * `wave-0-safety-net.md` § 0.2 asks this module to pin "all four multipliers;
 * `580`; rounding". Pinning the multipliers and the threshold AS VALUES is the
 * wrong shape, for two reasons that ADR-0007 itself supplies.
 *
 * First, ADR-0007's validation note says characterization tests here are worth
 * less than originally claimed, because we intend to change the behaviour:
 * "`payPeriodConversion` gets demoted out of compliance logic." Pinning what we
 * have decided to move produces a diff full of intentional changes, which is a
 * diff with no signal.
 *
 * Second, and more concretely: `4.33`, `7.25`, `80` and `580` are exactly the
 * policy literals ADR-0001 requires to live in `src/lib/policy/`, and W2b moves
 * them there. `$7.25 x 80 = $580` is the FLSA federal minimum wage times the
 * monthly hours threshold (42 CFR 435.552(f)); the value is statutory but
 * DYNAMIC — it changes if the FLSA is amended, and states may not substitute the
 * tipped wage, the $4.25 youth wage, or a higher state minimum wage. A test that
 * asserts `INCOME_THRESHOLD === 580` as a permanent truth encodes the opposite.
 *
 * So this file pins the **arithmetic contract** — the shape that must survive
 * W2b — and pins today's constants exactly once, in a clearly-named snapshot
 * block that W2b is expected to delete or relocate. The distinction matters:
 * a failing contract test in W2b means the refactor broke something; a failing
 * snapshot test means the refactor did its job.
 *
 * ## What is NOT true of this module, contra the audit
 *
 * `codebase-audit-2026-08.md` § 6 states that "`REQUIRED_HOURS` and
 * `INCOME_THRESHOLD` sit unused in `payPeriodConversion.ts`". That is wrong for
 * `INCOME_THRESHOLD`, which has three live importers, verified 2026-08-17:
 * `src/lib/storage/income.ts:9`, `src/components/income/IncomeStatusIndicator.tsx:11`,
 * and `src/components/income/SeasonalWorkerView.tsx:16`. Only `REQUIRED_HOURS`
 * and `FEDERAL_MINIMUM_WAGE` are module-internal. W2b needs the real number.
 */

import { describe, it, expect } from "vitest";
import {
  calculateMonthlyEquivalent,
  formatCurrency,
  getPayPeriodLabel,
  PAY_PERIOD_MULTIPLIERS,
  FEDERAL_MINIMUM_WAGE,
  REQUIRED_HOURS,
  INCOME_THRESHOLD,
} from "@/lib/utils/payPeriodConversion";

describe("the arithmetic contract: conversion is amount x multiplier, rounded to 2 decimals", () => {
  // These assertions must survive W2b. They reference the multiplier through
  // PAY_PERIOD_MULTIPLIERS rather than restating its value, so they keep holding
  // when the value moves to the policy profile.

  it.each(["daily", "weekly", "bi-weekly", "monthly"] as const)(
    "%s: applies the multiplier from PAY_PERIOD_MULTIPLIERS to the amount",
    (payPeriod) => {
      const amount = 137;
      const expected =
        Math.round(amount * PAY_PERIOD_MULTIPLIERS[payPeriod] * 100) / 100;

      expect(calculateMonthlyEquivalent(amount, payPeriod)).toBe(expected);
    },
  );

  it("rounds to at most 2 decimal places, using Math.round on cents", () => {
    // 150 x 4.33 = 649.5 exactly, so pick an amount that produces a third decimal.
    // 33 x 4.33 = 142.89 exactly; 7 x 4.33 = 30.31; use one that truncates.
    const result = calculateMonthlyEquivalent(0.005, "weekly");

    // 0.005 x 4.33 = 0.02165 -> rounds to 0.02
    expect(result).toBe(0.02);
  });

  it("rounds half away from zero for positive values, because Math.round is used", () => {
    // Math.round(x) rounds .5 UP. Pinned because a change to toFixed, banker's
    // rounding, or Math.floor would silently shift a user's monthly figure.
    // 1.25 x 4 would be needed; construct directly against the daily multiplier
    // of 30: 0.125 x 30 = 3.75 -> x100 = 375 -> Math.round(375) = 375 -> 3.75.
    expect(calculateMonthlyEquivalent(0.125, "daily")).toBe(3.75);
    // 0.0125 x 30 = 0.375 -> x100 = 37.5 -> Math.round -> 38 -> 0.38
    expect(calculateMonthlyEquivalent(0.0125, "daily")).toBe(0.38);
  });

  it("monthly is an identity conversion, not a no-op that skips rounding", () => {
    expect(calculateMonthlyEquivalent(580, "monthly")).toBe(580);
    // Still rounded: 580.005 -> 580.01, not 580.005.
    expect(calculateMonthlyEquivalent(580.005, "monthly")).toBe(580.01);
  });

  it("returns 0 for an amount of 0, for every pay period", () => {
    for (const payPeriod of [
      "daily",
      "weekly",
      "bi-weekly",
      "monthly",
    ] as const) {
      expect(calculateMonthlyEquivalent(0, payPeriod)).toBe(0);
    }
  });

  it("CHARACTERIZATION: propagates NaN rather than rejecting a non-numeric amount", () => {
    // No input validation. `IncomeEntryForm.tsx:151` calls this with
    // `parseFloat(amount)` from a text field, so a NaN reaches here whenever the
    // field is unparseable. The form guards with a truthiness check on `amount`
    // today; nothing in this module does. Recorded, not fixed — validation at the
    // storage boundary is W6b's `captureMethod` / validation scope.
    expect(calculateMonthlyEquivalent(NaN, "weekly")).toBeNaN();
  });

  it("CHARACTERIZATION: accepts a negative amount and returns a negative monthly equivalent", () => {
    // Not reachable from the UI today, and not obviously wrong — but recorded
    // because W7a repositions income as evidence and may need to represent a
    // correction or clawback. The current behaviour is "arithmetic, no policy".
    expect(calculateMonthlyEquivalent(-100, "monthly")).toBe(-100);
  });
});

describe("the arithmetic contract: the threshold is minimum wage x required hours", () => {
  it("derives INCOME_THRESHOLD as FEDERAL_MINIMUM_WAGE x REQUIRED_HOURS", () => {
    // 42 CFR 435.552(f): monthly income at least equal to the federal minimum
    // wage multiplied by 80. This RELATIONSHIP is the rule and must survive W2b.
    // The operands are policy values and are expected to move.
    expect(INCOME_THRESHOLD).toBe(FEDERAL_MINIMUM_WAGE * REQUIRED_HOURS);
  });
});

describe("W2b POLICY-LITERAL SNAPSHOT — expected to move to src/lib/policy/", () => {
  /**
   * ADR-0001: no policy value outside `src/lib/policy/`. Every constant asserted
   * in this block is a policy literal that W2b relocates. These assertions record
   * TODAY'S VALUES so the relocation can be proven value-preserving; they are not
   * claims that the values are permanent.
   *
   * When W2b runs, this block should be deleted or rewritten against the policy
   * profile. A failure here after W2b means the refactor changed a number.
   */

  it("today: the four pay-period multipliers are 30, 4.33, 2.17 and 1", () => {
    expect(PAY_PERIOD_MULTIPLIERS).toEqual({
      daily: 30,
      weekly: 4.33,
      "bi-weekly": 2.17,
      monthly: 1,
    });
  });

  it("today: the federal minimum wage constant is 7.25 and required hours is 80", () => {
    // 42 CFR 435.552(a)(1)-(a)(3), (f)(1). Dynamic if the FLSA is amended.
    expect(FEDERAL_MINIMUM_WAGE).toBe(7.25);
    expect(REQUIRED_HOURS).toBe(80);
  });

  it("today: the income threshold evaluates to 580", () => {
    expect(INCOME_THRESHOLD).toBe(580);
  });

  it("today: the documented worked examples still hold", () => {
    // The module's own JSDoc examples. If either changes, the doc comment is stale.
    expect(calculateMonthlyEquivalent(400, "bi-weekly")).toBe(868);
    expect(calculateMonthlyEquivalent(150, "weekly")).toBe(649.5);
  });

  it("CHARACTERIZATION: weekly uses 4.33, an approximation of 52/12 = 4.3333...", () => {
    // 4.33 is 52 weeks / 12 months truncated to 2dp, so a weekly earner's monthly
    // equivalent is understated by ~0.08% against the exact figure. At the $580
    // threshold that is about $0.44 — enough to matter only for someone sitting
    // within a dollar of the line, which is precisely who is most at risk.
    //
    // Note 4.33 is ALSO the Carnegie-Unit constant in 42 CFR 435.552(d)'s
    // credit-hour conversion (`creditHours x 3 x 4.33`), where CMS publishes it as
    // 4.33 exactly. The two uses are unrelated and must not be collapsed into one
    // shared constant when W2b builds the profile. W7a owns the income side.
    const exact = 52 / 12;
    expect(PAY_PERIOD_MULTIPLIERS.weekly).toBeLessThan(exact);
    expect(calculateMonthlyEquivalent(134, "weekly")).toBeLessThan(134 * exact);
  });

  it("CHARACTERIZATION: bi-weekly uses 2.17, an approximation of 26/12 = 2.1666...", () => {
    // 2.17 is rounded UP, so bi-weekly is overstated by ~0.15%. Note the two
    // approximations point in OPPOSITE directions, so the same annual income
    // produces a different monthly equivalent depending on how the user is paid.
    const exact = 26 / 12;
    expect(PAY_PERIOD_MULTIPLIERS["bi-weekly"]).toBeGreaterThan(exact);
    expect(calculateMonthlyEquivalent(267, "bi-weekly")).toBeGreaterThan(
      267 * exact,
    );
  });

  it("CHARACTERIZATION: daily uses a flat 30, so month length is ignored", () => {
    // A daily earner's monthly equivalent is identical in February and July.
    // Recorded because W5 makes the month explicit and W7a revisits income; a
    // month-aware conversion would change every stored `monthlyEquivalent`.
    expect(PAY_PERIOD_MULTIPLIERS.daily).toBe(30);
  });
});

describe("formatCurrency and getPayPeriodLabel: presentation only", () => {
  it("formats as en-US USD with exactly two fraction digits", () => {
    expect(formatCurrency(580)).toBe("$580.00");
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("rounds to two fraction digits at the formatting boundary", () => {
    expect(formatCurrency(0.005)).toBe("$0.01");
  });

  it("renders a negative amount with a leading minus", () => {
    expect(formatCurrency(-580)).toBe("-$580.00");
  });

  it("maps each pay period to its display label", () => {
    expect(getPayPeriodLabel("daily")).toBe("Daily");
    expect(getPayPeriodLabel("weekly")).toBe("Weekly");
    expect(getPayPeriodLabel("bi-weekly")).toBe("Bi-weekly");
    expect(getPayPeriodLabel("monthly")).toBe("Monthly");
  });

  it("covers every key of PAY_PERIOD_MULTIPLIERS, so a new pay period cannot ship unlabelled", () => {
    for (const payPeriod of Object.keys(PAY_PERIOD_MULTIPLIERS) as Array<
      keyof typeof PAY_PERIOD_MULTIPLIERS
    >) {
      expect(getPayPeriodLabel(payPeriod)).toBeTruthy();
    }
  });
});
