/**
 * Calendar-month primitives. `YYYY-MM` in, `YYYY-MM` out.
 *
 * W5 (ADR-0005). Tests: `src/lib/__tests__/month.test.ts`.
 *
 * TWO RULES GOVERN THIS FILE, and both come from bugs that already happened.
 *
 * 1. NO FUNCTION HERE PARSES A DATE STRING INTO A `Date`. Every calculation is
 *    integer arithmetic on a year/month pair. `new Date("2026-07-01")` parses as
 *    UTC midnight, so `.getMonth()` on it reports June in any negative-offset
 *    zone — W2a found exactly that bug in the export builder, and
 *    `.kiro/steering/data-migration-standards.md` names the class. W0 then pinned
 *    string-comparison immunity as a property to preserve, and W5 replaces the
 *    mechanism, so W5 owns preserving it. Construction, not care.
 *
 *    `monthToDate` is the one function that returns a `Date`, and it builds one
 *    from integers via the numeric constructor, which is unambiguously local.
 *
 * 2. `currentMonth` IS THE ONLY PLACE IN `src/` THAT READS THE WALL CLOCK FOR A
 *    MONTH. Its `now` parameter has an injectable default, the pattern already
 *    used by `buildTextReport.ts`'s `generatedAt = new Date()`.
 *    `src/__tests__/no-wall-clock-month.test.ts` enforces the exclusivity and
 *    records the ten sites that used to do this themselves — including one that
 *    used UTC while the other nine used local time, so the app could name two
 *    different months for the same instant.
 */

import { format } from "date-fns";

/** Strict `YYYY-MM`: four digits, a hyphen, and a zero-padded month 01-12. */
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Strict `YYYY-MM-DD`. Day range is not validated; only the shape and the month. */
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;

/**
 * Whether `value` is a well-formed calendar month.
 *
 * Rejects a bare `"2026"`. W0's characterization tests pinned that
 * `calculateMonthlySummary([...], "2026")` matched every month of that year and
 * returned `month: "2026"`, because the filter was an unvalidated text prefix.
 * Making the parameter required does not make it valid.
 */
export function isValidMonth(value: string): boolean {
  return MONTH_PATTERN.test(value);
}

/**
 * Split a month into its parts. `month` is **1-indexed**, so it reads the same as
 * the string: `parseMonth("2026-07").month === 7`.
 *
 * Deliberately not 0-indexed like `Date.getMonth()`. The conversion happens in
 * `monthToDate` and nowhere else, so there is exactly one place to get it wrong.
 *
 * @throws if `month` is not a valid `YYYY-MM`.
 */
export function parseMonth(month: string): { year: number; month: number } {
  if (!isValidMonth(month)) {
    throw new Error(
      `Invalid month ${JSON.stringify(month)}: expected YYYY-MM (for example "2026-07").`,
    );
  }
  return {
    year: Number(month.slice(0, 4)),
    month: Number(month.slice(5, 7)),
  };
}

/** Months since year 0, so arithmetic and comparison are plain integer work. */
function toOrdinal(month: string): number {
  const { year, month: m } = parseMonth(month);
  return year * 12 + (m - 1);
}

function fromOrdinal(ordinal: number): string {
  const year = Math.floor(ordinal / 12);
  const month = (ordinal % 12) + 1;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

/**
 * Shift a month by `delta` months. Negative moves backward. Crosses year
 * boundaries by construction, because it is integer arithmetic.
 */
export function addMonths(month: string, delta: number): string {
  return fromOrdinal(toOrdinal(month) + delta);
}

export function previousMonth(month: string): string {
  return addMonths(month, -1);
}

export function nextMonth(month: string): string {
  return addMonths(month, 1);
}

/**
 * Chronological comparator, usable directly as `Array.prototype.sort`'s argument.
 * Negative when `a` precedes `b`.
 */
export function compareMonths(a: string, b: string): number {
  return toOrdinal(a) - toOrdinal(b);
}

/**
 * Every month from `start` to `end`, **inclusive of both ends**, ascending.
 *
 * Returns `[]` when `end` precedes `start`. An inverted range is representable —
 * a review period whose end is before its start is a real edge case, and
 * `newlyApplicableReviewPeriod` produces one for anyone who becomes an applicable
 * individual in the month their coverage began — and an empty list is inspectable,
 * where a loop that never terminates presents as a hung phone.
 *
 * There is no explicit `if (to < from) return []` guard, and that is deliberate:
 * the loop below already cannot execute when `to < from`, so the guard was
 * unreachable. Mutation testing found it — defeating the guard changed no test
 * result, which is the signature of a branch that never decides anything. Removed
 * rather than left in place looking load-bearing.
 */
export function monthsBetween(start: string, end: string): string[] {
  const from = toOrdinal(start);
  const to = toOrdinal(end);

  const months: string[] = [];
  for (let ordinal = from; ordinal <= to; ordinal++) {
    months.push(fromOrdinal(ordinal));
  }
  return months;
}

/**
 * The calendar month a `YYYY-MM-DD` date falls in, by prefix rather than by
 * parsing. This is the operation that must never round-trip through `Date`.
 *
 * @throws if `date` is not a well-formed `YYYY-MM-DD`.
 */
export function monthOfDate(date: string): string {
  if (!DATE_PATTERN.test(date)) {
    throw new Error(
      `Invalid date ${JSON.stringify(date)}: expected YYYY-MM-DD (for example "2026-07-15").`,
    );
  }
  return date.slice(0, 7);
}

/**
 * Local midnight on the first of the month.
 *
 * The only `Date` this module produces, and built from integers via the numeric
 * constructor so it cannot be reinterpreted as UTC. Exists because the calendar
 * grid genuinely needs a `Date` to hand to `date-fns`.
 */
export function monthToDate(month: string): Date {
  const { year, month: m } = parseMonth(month);
  return new Date(year, m - 1, 1);
}

/** `"2026-07"` to `"July 2026"`. */
export function formatMonthLong(month: string): string {
  return format(monthToDate(month), "MMMM yyyy");
}

/**
 * The current calendar month, in **local** time.
 *
 * The single sanctioned wall-clock read in `src/`. Pass `now` to make a caller
 * deterministic; the default exists so ordinary callers need not thread a clock.
 *
 * Local, not UTC, deliberately: `new Date().toISOString().slice(0, 7)` names the
 * previous month for the first several hours of every month in any negative-offset
 * zone, and `how-to-hourkeep/results/page.tsx` used to do exactly that while nine
 * other sites used local time.
 */
export function currentMonth(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
