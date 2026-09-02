/**
 * TESTS — src/lib/month.ts
 *
 * W5 (ADR-0005). Written before the module, per ADR-0007 Tier 1: the review-period
 * model and the month arithmetic under it are compliance logic.
 *
 * WHY THIS MODULE EXISTS AT ALL, rather than calling date-fns at each site.
 *
 * Two reasons, and the second is the load-bearing one.
 *
 * 1. W0 pinned a PROPERTY TO PRESERVE in calculations.characterization.test.ts:
 *    `calculateMonthlySummary` compares strings and so cannot drift across a
 *    timezone boundary. W2a had found a real bug of exactly that shape in the
 *    export builder, where `new Date("2026-07-01")` parsed as UTC midnight and
 *    printed the previous month in any negative-offset zone. W5 replaces the
 *    filtering mechanism, so W5 owns keeping the property.
 *
 *    The way to keep it is not care, it is construction. Every function here does
 *    INTEGER ARITHMETIC on a parsed year/month pair. No function parses a date
 *    string into a `Date`. `monthToDate` builds a `Date` from integers — which is
 *    unambiguously local — and is the only function that returns one.
 *
 * 2. `currentMonth` is the ONE sanctioned wall-clock read in `src/`. Its `now`
 *    parameter has an injectable default, following `buildTextReport.ts`'s
 *    `generatedAt = new Date()` — a pattern already in this codebase and already
 *    the right one. The guard test in `src/__tests__/no-wall-clock-month.test.ts`
 *    asserts nothing else in `src/` derives a month from the clock.
 *
 * The ten sites that used to is recorded in that guard test, not here.
 */

import { describe, it, expect } from "vitest";
import {
  isValidMonth,
  parseMonth,
  addMonths,
  previousMonth,
  nextMonth,
  compareMonths,
  monthsBetween,
  monthOfDate,
  monthToDate,
  formatMonthLong,
  currentMonth,
} from "@/lib/month";

describe("isValidMonth", () => {
  it("accepts a well-formed YYYY-MM", () => {
    expect(isValidMonth("2026-01")).toBe(true);
    expect(isValidMonth("2026-12")).toBe(true);
  });

  it("rejects a bare year, which is the input W0 proved silently sums a whole year", () => {
    // calculations.characterization.test.ts pinned that
    // `calculateMonthlySummary([...], "2026")` matched every month of 2026 and
    // returned `summary.month === "2026"`, because the filter was an unvalidated
    // text prefix. Making the parameter REQUIRED does not make it VALID — a
    // required `"2026"` is just as wrong as an optional one. This is the check
    // that closes that gap.
    expect(isValidMonth("2026")).toBe(false);
  });

  it("rejects a full date, a month out of range, and non-numeric input", () => {
    expect(isValidMonth("2026-07-01")).toBe(false);
    expect(isValidMonth("2026-00")).toBe(false);
    expect(isValidMonth("2026-13")).toBe(false);
    expect(isValidMonth("2026-7")).toBe(false); // unpadded
    expect(isValidMonth("abcd-ef")).toBe(false);
    expect(isValidMonth("")).toBe(false);
  });
});

describe("parseMonth", () => {
  it("returns a 1-indexed month, so the value reads the same as the string", () => {
    // Deliberately NOT 0-indexed like `Date.getMonth()`. An off-by-one between
    // "the 7 in 2026-07" and "the 6 JavaScript wants" is the single easiest
    // mistake to make in this module, so the boundary is at `monthToDate` and
    // nowhere else.
    expect(parseMonth("2026-07")).toEqual({ year: 2026, month: 7 });
    expect(parseMonth("2026-01")).toEqual({ year: 2026, month: 1 });
    expect(parseMonth("2026-12")).toEqual({ year: 2026, month: 12 });
  });

  it("throws on invalid input rather than returning NaN", () => {
    expect(() => parseMonth("2026")).toThrow(/2026/);
    expect(() => parseMonth("2026-13")).toThrow();
  });
});

describe("addMonths", () => {
  it("moves forward and backward within a year", () => {
    expect(addMonths("2026-07", 1)).toBe("2026-08");
    expect(addMonths("2026-07", -1)).toBe("2026-06");
    expect(addMonths("2026-07", 0)).toBe("2026-07");
  });

  it("crosses a year boundary in both directions", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });

  it("crosses multiple years", () => {
    expect(addMonths("2026-07", 12)).toBe("2027-07");
    expect(addMonths("2026-07", -12)).toBe("2025-07");
    expect(addMonths("2026-01", -13)).toBe("2024-12");
    expect(addMonths("2026-12", 25)).toBe("2029-01");
  });

  it("is exactly reversible, for every month of a year and a range of deltas", () => {
    // A property sweep rather than examples. W0 recorded that an equivalence
    // sweep confined to 2026 was insensitive to the boundary that mattered and
    // only started failing when extended across a year end, so this spans three.
    for (let year = 2025; year <= 2027; year++) {
      for (let m = 1; m <= 12; m++) {
        const month = `${year}-${String(m).padStart(2, "0")}`;
        for (const delta of [-25, -13, -12, -7, -1, 1, 7, 12, 13, 25]) {
          expect(addMonths(addMonths(month, delta), -delta)).toBe(month);
        }
      }
    }
  });
});

describe("previousMonth / nextMonth", () => {
  it("steps one month, crossing years", () => {
    expect(previousMonth("2027-01")).toBe("2026-12");
    expect(nextMonth("2026-12")).toBe("2027-01");
  });
});

describe("compareMonths", () => {
  it("orders chronologically, not lexically", () => {
    expect(compareMonths("2026-07", "2026-08")).toBeLessThan(0);
    expect(compareMonths("2026-08", "2026-07")).toBeGreaterThan(0);
    expect(compareMonths("2026-07", "2026-07")).toBe(0);
    expect(compareMonths("2025-12", "2026-01")).toBeLessThan(0);
  });

  it("sorts a shuffled set of months into calendar order", () => {
    const shuffled = ["2027-01", "2026-02", "2026-12", "2025-11", "2026-01"];
    expect([...shuffled].sort(compareMonths)).toEqual([
      "2025-11",
      "2026-01",
      "2026-02",
      "2026-12",
      "2027-01",
    ]);
  });
});

describe("monthsBetween", () => {
  it("is inclusive of both ends and ascending", () => {
    expect(monthsBetween("2026-10", "2027-01")).toEqual([
      "2026-10",
      "2026-11",
      "2026-12",
      "2027-01",
    ]);
  });

  it("returns the single month when start equals end", () => {
    expect(monthsBetween("2026-07", "2026-07")).toEqual(["2026-07"]);
  });

  it("returns empty when end precedes start, rather than looping or throwing", () => {
    // An inverted range is a caller bug, but a review period whose end precedes
    // its start is representable (a renewal due the month it began), and an
    // infinite loop in a month-range helper is the kind of defect that presents
    // as a hung phone. Empty is the safe, inspectable answer.
    expect(monthsBetween("2026-08", "2026-07")).toEqual([]);
  });
});

describe("monthOfDate", () => {
  it("takes the YYYY-MM prefix of a YYYY-MM-DD date without parsing it", () => {
    expect(monthOfDate("2026-07-01")).toBe("2026-07");
    expect(monthOfDate("2026-07-31")).toBe("2026-07");
  });

  it("is immune to the timezone drift that affects Date parsing", () => {
    // The property W0 pinned, restated for the extracted helper. `new Date(
    // "2026-07-01")` parses as UTC midnight; in any negative-offset zone
    // `.getMonth()` on it reports June. A prefix slice cannot do that.
    // .kiro/steering/data-migration-standards.md names this bug class directly.
    expect(monthOfDate("2026-07-01")).toBe("2026-07");
    expect(monthOfDate("2026-01-01")).toBe("2026-01");
    expect(monthOfDate("2026-12-31")).toBe("2026-12");

    // Prove the divergence is REAL in this runtime rather than asserting into a
    // vacuum. vitest.config.mts pins TZ=America/New_York, so the naive parse
    // genuinely reports the previous month for the first of July — 5 is June,
    // zero-indexed. Without this line the three assertions above would still pass
    // in a UTC runtime where there is nothing to be immune to, and the test would
    // silently stop testing anything.
    expect(new Date("2026-07-01").getMonth()).toBe(5);
  });

  it("throws on a string that is not a date, rather than silently truncating", () => {
    expect(() => monthOfDate("2026-07")).toThrow();
    expect(() => monthOfDate("nonsense")).toThrow();
  });
});

describe("monthToDate", () => {
  it("returns local midnight on the first of the month, built from integers", () => {
    // This is the ONE place a Date is constructed, and it uses the numeric
    // constructor precisely so it cannot be reinterpreted as UTC. Asserted via
    // the local getters, which is what every consumer reads.
    const d = monthToDate("2026-07");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // 0-indexed: the one deliberate conversion
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(0);
  });

  it("round-trips through monthOfDate-equivalent formatting for every month", () => {
    // Guards the 1-indexed/0-indexed boundary in both directions at once.
    for (let m = 1; m <= 12; m++) {
      const month = `2026-${String(m).padStart(2, "0")}`;
      const d = monthToDate(month);
      const back = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      expect(back).toBe(month);
    }
  });
});

describe("formatMonthLong", () => {
  it("renders a human month and year", () => {
    expect(formatMonthLong("2026-07")).toBe("July 2026");
    expect(formatMonthLong("2027-01")).toBe("January 2027");
    expect(formatMonthLong("2026-12")).toBe("December 2026");
  });
});

describe("currentMonth", () => {
  it("derives the month from an injected clock, in local time", () => {
    // The expectation is DERIVED from the input, not written as a literal that
    // happens to match. W0 recorded a test that passed against a hardcoded
    // "2026-07" because the fixture clock was July.
    const now = new Date(2026, 2, 15, 12, 0, 0); // 2026-03-15 local
    expect(currentMonth(now)).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    );
    expect(currentMonth(now)).toBe("2026-03");
  });

  it("uses local calendar fields, not the UTC ISO string", () => {
    // Asserted against a stub rather than a real Date, and the reason is worth
    // stating: in a UTC runtime local and UTC agree on the month for every
    // instant, so NO real-Date test can tell the two implementations apart there.
    // A stub whose local getters and whose toISOString() disagree can, on any
    // runtime, in either direction.
    //
    // This is the portable half of the proof. The real-Date test below is the
    // half that exercises an actual Date, and it depends on the pinned TZ.
    const localJanUtcDec = {
      getFullYear: () => 2026,
      getMonth: () => 0, // January, locally
      toISOString: () => "2025-12-31T23:00:00.000Z", // December, in UTC
    } as unknown as Date;
    expect(currentMonth(localJanUtcDec)).toBe("2026-01");

    const localDecUtcJan = {
      getFullYear: () => 2025,
      getMonth: () => 11, // December, locally
      toISOString: () => "2026-01-01T04:30:00.000Z", // January, in UTC
    } as unknown as Date;
    expect(currentMonth(localDecUtcJan)).toBe("2025-12");
  });

  it("names the local month at an instant where UTC has already rolled over", () => {
    // The live defect this replaces: how-to-hourkeep/results/page.tsx derived the
    // month with `new Date().toISOString().slice(0, 7)` — UTC — while nine other
    // sites used local `format(new Date(), "yyyy-MM")`. Those name DIFFERENT
    // months at a boundary, so the app could hold two answers for one instant.
    //
    // DIRECTION MATTERS AND IS EASY TO GET BACKWARDS. vitest.config.mts pins
    // TZ=America/New_York, a NEGATIVE offset, so UTC runs AHEAD of local. The
    // divergence therefore appears at the END of a local month, not the start:
    // 23:30 on 31 December local is already 04:30 on 1 January in UTC.
    //
    // A first version of this test used 00:30 on 1 January, which does not
    // diverge in a negative-offset zone at all — and it duly passed with the UTC
    // implementation substituted in. Mutation testing caught it; reading the test
    // did not.
    const lateOnTheLastDay = new Date(2025, 11, 31, 23, 30, 0);
    expect(currentMonth(lateOnTheLastDay)).toBe("2025-12");
    // Sanity: prove the instant really does straddle, so this test cannot quietly
    // stop being a straddle test if the pinned zone ever changes.
    expect(lateOnTheLastDay.toISOString().slice(0, 7)).toBe("2026-01");
  });

  it("defaults to the real clock when no argument is given", () => {
    // Derived from a second read of the same clock rather than a literal, so this
    // asserts the default EXISTS and is the wall clock without pinning a date.
    const expected = currentMonth(new Date());
    expect(currentMonth()).toBe(expected);
    expect(isValidMonth(currentMonth())).toBe(true);
  });
});
