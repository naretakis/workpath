/**
 * The review period — 42 CFR 435.556(a).
 *
 * W5 (ADR-0005 item 3). Tests: `src/lib/__tests__/reviewPeriod.test.ts`.
 *
 * A review period is **the set of months a state may look at**. It is the unit
 * every other month-spanning computation is expressed in: seasonal averaging over
 * the 6 preceding months (§ 435.552(g)), the recent-inmate window (§ 435.553(b)),
 * multi-month progress, and the period-scoped evidence package (ADR-0006).
 *
 * WHAT THIS MODULE MUST NOT DO. It reports which months are in scope and how many
 * of them a state requires. It never reports how those months went. ADR-0003: we
 * assemble evidence, states determine status. `engineering-standards.md` extends
 * that to types and return values, not just copy, and a test asserts no field here
 * is named like a determination.
 *
 * SOURCE. Regulatory text quoted from `docs/domain/cms-2454-ifc/2026-11094.txt`;
 * § 435.556 begins at 91 FR 33473 and (a)(2) continues onto 33474. Exactly one
 * behaviour rests on preamble rather than rule text — the non-consecutive reading
 * at 91 FR 33389 — and it is cited as preamble where it is used.
 */

import {
  addMonths,
  isValidMonth,
  monthsBetween,
  parseMonth,
  previousMonth,
} from "@/lib/month";

/**
 * The state elections that determine a review period's length.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * W2b: MOVE THIS WHOLE BLOCK TO `src/lib/policy/`.
 *
 * ADR-0001 requires every policy value to come from an injected profile, and
 * `src/lib/policy/` does not exist yet — W2b creates it, and `waves/README.md`
 * sequences W2b *after* W5. `wave-5-month-scoping.md` therefore authorises exactly
 * one named federal-default constant here, on the understanding that W2b moves it.
 *
 * Keep it a single object with a single default export so that move stays a
 * two-line diff. Every consumer already takes it as an optional parameter, so W2b
 * changes what is passed in, not who reads it.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface ReviewPeriodPolicy {
  /**
   * § 435.556(a)(1). How many consecutive months immediately preceding the month
   * of application a state assesses. 1 to 3.
   */
  applicationLookbackMonths: number;
  /** § 435.556(a)(1)'s statutory range for the above. Not itself an election. */
  applicationLookbackBounds: { min: number; max: number };
  /** § 435.556(a)(2)(i). Months required within the eligibility period. At least 1. */
  renewalMonthsRequired: number;
  /** § 435.556(a)(2)(ii). Months required between more-frequent verifications. */
  verificationMonthsRequired: number;
  /**
   * How LONG the eligibility period is assumed to be, in months.
   *
   * The weakest number in this object, and it does not come from this rule. See
   * `renewalPeriodMonthsSource` and `renewalReviewPeriodEndingAt`.
   */
  renewalPeriodMonths: number;
  /**
   * Its own separate citation, because it has a different and worse provenance
   * than everything else here and must not travel without the caveat.
   */
  renewalPeriodMonthsSource: string;
  /**
   * Where these numbers come from. Mandatory, per ADR-0001: "a profile without a
   * citation is a guess, and guesses don't belong in compliance logic."
   */
  source: string;
}

/**
 * The least-restrictive statutory floor, which is also what most states elected.
 *
 * `state-options.md` records 1 month as the pending assumption for both the
 * application lookback and the renewal months required, on the grounds that it is
 * the statutory minimum. Idaho, Indiana and New Hampshire legislated longer
 * lookbacks; Indiana and New Hampshire also verify quarterly.
 *
 * This is a **Conditional** value in ADR-0003's sense: real, derived, and
 * dependent on a state election we do not know. UI built on it must name the
 * election rather than presenting the result as settled.
 */
export const FEDERAL_DEFAULT_REVIEW_PERIOD: ReviewPeriodPolicy = {
  applicationLookbackMonths: 1,
  applicationLookbackBounds: { min: 1, max: 3 },
  renewalMonthsRequired: 1,
  verificationMonthsRequired: 1,
  renewalPeriodMonths: 6,
  renewalPeriodMonthsSource:
    "NOT from CMS-2454-IFC. The IFC amends 42 CFR 435.916 to say MAGI renewals " +
    "occur every 12 months and no more often, while its own preamble states the " +
    "adult group is subject to 6-month renewals from January 1, 2027 under SSA " +
    "1902(e)(14)(L) — a different section of PL 119-21 that this rule does not " +
    "implement, and which does not reach American Indians or most 1115 enrollees. " +
    "The two do not agree and no reconciling rulemaking has issued. 6 is treated as " +
    "operative for the adult group per .kiro/steering/medicaid-domain-knowledge.md, " +
    "flagged as sourced elsewhere.",
  source:
    "42 CFR 435.556(a)(1) and (a)(2), CMS-2454-IFC, 91 FR 33473-74 (June 3, 2026); " +
    "statutory minimum, pending per-state election data",
};

/**
 * One of the four review periods 42 CFR 435.556(a) defines.
 *
 * `months` is present on every arm and is the answer to "which months". It is
 * computed once at construction so two call sites cannot derive it differently,
 * and so the value stays serializable for the evidence export.
 *
 * `monthsRequired` is the § 435.556(b) cap already applied. See
 * `requiredWithinPeriod`.
 */
export type ReviewPeriod =
  | {
      /** § 435.556(a)(1). An applicant. */
      kind: "application";
      applicationMonth: string;
      months: string[];
      monthsRequired: number;
    }
  | {
      /** § 435.556(a)(2)(i). Enrolled, assessed at renewal. */
      kind: "renewal";
      periodStart: string;
      periodEnd: string;
      months: string[];
      monthsRequired: number;
    }
  | {
      /** § 435.556(a)(2)(ii). Enrolled, in a state that verifies between renewals. */
      kind: "verification";
      since: string;
      until: string;
      months: string[];
      monthsRequired: number;
    }
  | {
      /** § 435.556(a)(2)(iii). Became an applicable individual mid-period. */
      kind: "newlyApplicable";
      periodStart: string;
      becameApplicableMonth: string;
      months: string[];
      monthsRequired: number;
    };

/**
 * § 435.556(b): "A State must not require an applicable individual to demonstrate
 * community engagement for a period that exceeds the period specified in paragraph
 * (a)(2)(i), (ii), or (iii) of this section" — 91 FR 33474.
 *
 * Note which paragraphs that lists. **(a)(1) is absent**, so the cap does not reach
 * applications; an applicant owes all of the state-elected months. That asymmetry
 * is why this function is not applied to the application arm.
 *
 * Returns 0 for an empty period. A period containing no months cannot require one,
 * and flooring at 1 there would manufacture an obligation for a month the state may
 * not assess. That falls out of the expression rather than needing its own branch —
 * `Math.min(…, 0)` is 0 — and an explicit `if (available === 0) return 0` guard was
 * removed after mutation testing showed defeating it changed no test result. The
 * rule it encodes is stated here instead, where it cannot rot into dead code.
 *
 * The `Math.max(elected, 1)` floor is separate and is NOT redundant: § 435.556(a)(2)
 * requires "1 or more months", so a state cannot elect zero for a non-empty period.
 */
function requiredWithinPeriod(elected: number, available: number): number {
  return Math.min(Math.max(elected, 1), available);
}

/**
 * § 435.556(a)(1): "demonstration of community engagement for at least one, but not
 * more than 3 consecutive months, as specified in the State plan, **immediately
 * preceding the month of application**" — 91 FR 33473.
 *
 * The application month itself is **excluded**. This is the same off-by-one class
 * as the seasonal-averaging defect W7a fixes, where HourKeep includes the assessed
 * month and § 435.552(g) excludes it.
 *
 * @throws if the month is malformed, or the elected lookback is outside 1 to 3.
 */
export function applicationReviewPeriod(
  applicationMonth: string,
  policy: ReviewPeriodPolicy = FEDERAL_DEFAULT_REVIEW_PERIOD,
): ReviewPeriod {
  parseMonth(applicationMonth); // throws on malformed input

  const { min, max } = policy.applicationLookbackBounds;
  const lookback = policy.applicationLookbackMonths;
  if (!Number.isInteger(lookback) || lookback < min || lookback > max) {
    throw new Error(
      `Application lookback of ${lookback} months is outside the range 42 CFR 435.556(a)(1) ` +
        `permits (at least ${min}, not more than ${max}).`,
    );
  }

  const months = monthsBetween(
    addMonths(applicationMonth, -lookback),
    previousMonth(applicationMonth),
  );

  return {
    kind: "application",
    applicationMonth,
    months,
    // All of the state-elected months. § 435.556(b)'s cap does not reach (a)(1),
    // and the period is exactly `lookback` months long in any case.
    monthsRequired: months.length,
  };
}

/**
 * § 435.556(a)(2)(i): the period "between the effective date of such individual's
 * most recent determination or redetermination at renewal ... and the date the
 * individual's renewal is due" — 91 FR 33474. Both ends inclusive.
 */
export function renewalReviewPeriod(
  periodStart: string,
  periodEnd: string,
  policy: ReviewPeriodPolicy = FEDERAL_DEFAULT_REVIEW_PERIOD,
): ReviewPeriod {
  parseMonth(periodStart);
  parseMonth(periodEnd);

  const months = monthsBetween(periodStart, periodEnd);

  return {
    kind: "renewal",
    periodStart,
    periodEnd,
    months,
    monthsRequired: requiredWithinPeriod(
      policy.renewalMonthsRequired,
      months.length,
    ),
  };
}

/**
 * A renewal review period ending at the month the renewal is due, with the start
 * derived from the assumed renewal frequency.
 *
 * READ THE CAVEAT BEFORE USING THIS. § 435.556(a)(2)(i) runs the period from "the
 * effective date of such individual's most recent determination or redetermination
 * at renewal" to "the date the individual's renewal is due". A user can reasonably
 * be expected to know the second date. Almost nobody knows the first, and HourKeep
 * never stored it.
 *
 * So the start is **assumed**, from `policy.renewalPeriodMonths`, and that figure
 * does not come from this rule — see `renewalPeriodMonthsSource`, which records the
 * § 435.916 versus § 1902(e)(14)(L) conflict in full. Treat the resulting month list
 * as Conditional in ADR-0003's sense, and the weakest such value in the app: the
 * user's state decides, and the user should be told to ask which months.
 *
 * What is NOT assumed, and is worth saying loudly to the user either way: the months
 * need not be consecutive, the state may not dictate which ones count, and under the
 * federal default only one month in the whole period is required.
 */
export function renewalReviewPeriodEndingAt(
  renewalDueMonth: string,
  policy: ReviewPeriodPolicy = FEDERAL_DEFAULT_REVIEW_PERIOD,
): ReviewPeriod {
  parseMonth(renewalDueMonth);

  const span = Math.max(policy.renewalPeriodMonths, 1);
  const periodStart = addMonths(renewalDueMonth, -(span - 1));

  return renewalReviewPeriod(periodStart, renewalDueMonth, policy);
}

/**
 * § 435.556(a)(2)(ii): the period "between the most recent demonstration of
 * community engagement and the date the individual's next demonstration of
 * community engagement is due, consistent with § 435.557(d)" — 91 FR 33474.
 *
 * Only reachable in a state that elected more-frequent verification.
 */
export function verificationReviewPeriod(
  since: string,
  until: string,
  policy: ReviewPeriodPolicy = FEDERAL_DEFAULT_REVIEW_PERIOD,
): ReviewPeriod {
  parseMonth(since);
  parseMonth(until);

  const months = monthsBetween(since, until);

  return {
    kind: "verification",
    since,
    until,
    months,
    monthsRequired: requiredWithinPeriod(
      policy.verificationMonthsRequired,
      months.length,
    ),
  };
}

/**
 * § 435.556(a)(2)(iii): the period "between the effective date of such individual's
 * most recent determination or redetermination at renewal ... and **the end of the
 * month prior to the month in which the individual becomes an applicable
 * individual** as a result of a redetermination based on a change in circumstances
 * in accordance with § 435.916(d)" — 91 FR 33474.
 *
 * So someone who becomes an applicable individual in April is assessed through
 * March, not April. An off-by-one here assesses a month the state may not assess.
 *
 * The months-required figure is the lesser of the election and what the period
 * contains — `rule-extract.md` § 6 states it that way, and § 435.556(b) reaches
 * this arm explicitly.
 */
export function newlyApplicableReviewPeriod(
  periodStart: string,
  becameApplicableMonth: string,
  policy: ReviewPeriodPolicy = FEDERAL_DEFAULT_REVIEW_PERIOD,
): ReviewPeriod {
  parseMonth(periodStart);
  parseMonth(becameApplicableMonth);

  const months = monthsBetween(
    periodStart,
    previousMonth(becameApplicableMonth),
  );

  return {
    kind: "newlyApplicable",
    periodStart,
    becameApplicableMonth,
    months,
    monthsRequired: requiredWithinPeriod(
      policy.renewalMonthsRequired,
      months.length,
    ),
  };
}

/** The months in scope, ascending. Both ends of the period are included. */
export function monthsInReviewPeriod(period: ReviewPeriod): string[] {
  return period.months;
}

/**
 * How many months of the period a state requires — § 435.556(b)'s cap already
 * applied at construction.
 *
 * A count, not a verdict. It says how many months are asked for, never how many
 * were demonstrated.
 */
export function monthsRequiredFor(period: ReviewPeriod): number {
  return period.monthsRequired;
}

/**
 * Whether the required months must be **consecutive**. True only for applications.
 *
 * PREAMBLE, 91 FR 33389, not rule text. § 435.556(a)(2) says "whether or not
 * consecutive", and CMS reads that clause as "not modified by a grant of discretion
 * to the State. We therefore interpret it not to permit the State to require a
 * beneficiary to demonstrate community engagement for consecutive months ... or to
 * dictate the specific month(s)".
 *
 * So for the three enrolled arms, **any qualifying month in the period counts**.
 * That is user-favourable and badly under-communicated, which is why W5 says it on
 * screen. § 435.556(a)(1), by contrast, says "consecutive months" in the rule text
 * itself.
 */
export function requiresConsecutiveMonths(period: ReviewPeriod): boolean {
  return period.kind === "application";
}

/**
 * Whether `month` falls inside the period.
 *
 * Returns `false` for a malformed month rather than throwing, because this is
 * called from render paths where a throw blanks the page. A membership question has
 * a safe negative answer; the constructors above have no safe fallback and so do
 * throw.
 */
export function includesMonth(period: ReviewPeriod, month: string): boolean {
  if (!isValidMonth(month)) return false;
  return period.months.includes(month);
}
