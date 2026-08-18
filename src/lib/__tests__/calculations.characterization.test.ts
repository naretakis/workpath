/**
 * CHARACTERIZATION TESTS — src/lib/calculations.ts
 *
 * Added by W0 § 0.2. Purpose: pin CURRENT behaviour, bugs included, so that a
 * later diff proves which behaviour changes were intentional. See ADR-0007.
 *
 * W0 does not fix anything here. Every known-wrong behaviour below is annotated
 * with the CFR citation it violates and the wave that owns the correction.
 *
 * A note on what is worth pinning. ADR-0007's own validation note says
 * characterization tests on these modules are worth less than originally claimed,
 * because the plan intends to change most of this behaviour: `calculations.ts` is
 * 55 lines over three activity types, and W6a replaces the type set outright.
 * So the durable value here is narrow and deliberate:
 *
 *   - the per-type dispatch, because W6a must not silently drop a type;
 *   - the `startsWith` month filter, because W5 replaces the filtering mechanism
 *     and needs to know what it is replacing;
 *   - the OPTIONAL month parameter, which is a live defect (ADR-0005) and the one
 *     thing here most likely to be got wrong twice.
 *
 * The `>= 80` comparison and `hoursNeeded` are pinned as arithmetic, not as
 * policy: the literal 80 moves to the policy profile in W2b (ADR-0001), and the
 * test names below say so.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { calculateMonthlySummary } from "@/lib/calculations";
import type { Activity } from "@/types";

/** Minimal Activity fixture. `createdAt` / `updatedAt` are unread by the module. */
function activity(
  date: string,
  type: Activity["type"],
  hours: number,
): Activity {
  return {
    date,
    type,
    hours,
    createdAt: new Date("2026-01-01T00:00:00"),
    updatedAt: new Date("2026-01-01T00:00:00"),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("calculateMonthlySummary: per-type sums", () => {
  it("sums each activity type into its own bucket and into the total", () => {
    const summary = calculateMonthlySummary(
      [
        activity("2026-07-01", "work", 10),
        activity("2026-07-02", "work", 5),
        activity("2026-07-03", "volunteer", 7),
        activity("2026-07-04", "education", 3),
      ],
      "2026-07",
    );

    expect(summary.workHours).toBe(15);
    expect(summary.volunteerHours).toBe(7);
    expect(summary.educationHours).toBe(3);
    expect(summary.totalHours).toBe(25);
  });

  it("returns zeroed buckets and the requested month when given no activities", () => {
    const summary = calculateMonthlySummary([], "2026-07");

    expect(summary).toEqual({
      month: "2026-07",
      totalHours: 0,
      workHours: 0,
      volunteerHours: 0,
      educationHours: 0,
      isCompliant: false,
      hoursNeeded: 80,
    });
  });

  it("handles exactly the three types it knows about, and only those three", () => {
    // CHARACTERIZATION: the switch has no `default`, so an unrecognised type is
    // silently contributed to NO bucket and NO total. W6a adds `workProgram`
    // (42 CFR 435.552(a)(3)) and must add a branch, not rely on a fallthrough.
    // Deliberately cast: the point is to record what happens off-contract.
    const rogue = activity("2026-07-01", "workProgram" as Activity["type"], 40);

    const summary = calculateMonthlySummary(
      [rogue, activity("2026-07-02", "work", 10)],
      "2026-07",
    );

    expect(summary.totalHours).toBe(10);
    expect(summary.workHours).toBe(10);
  });
});

describe("calculateMonthlySummary: month filtering by string prefix", () => {
  it("filters with String.prototype.startsWith against the YYYY-MM prefix", () => {
    const summary = calculateMonthlySummary(
      [
        activity("2026-07-31", "work", 10),
        activity("2026-08-01", "work", 99),
        activity("2026-06-30", "work", 99),
      ],
      "2026-07",
    );

    expect(summary.totalHours).toBe(10);
  });

  it("does no date parsing, so it is immune to the timezone drift that affects Date arithmetic", () => {
    // Worth pinning as a PROPERTY TO PRESERVE, not a bug. W2a found a real
    // month-boundary bug in the export builder where `new Date("2026-07-01")`
    // parsed as UTC midnight and printed the previous month in any negative-offset
    // zone. This module compares strings and so cannot drift. W5 replaces the
    // filtering mechanism; whatever replaces it must keep this property.
    // .kiro/steering/data-migration-standards.md names this bug class directly.
    const firstOfMonth = calculateMonthlySummary(
      [activity("2026-07-01", "work", 8)],
      "2026-07",
    );
    const lastOfMonth = calculateMonthlySummary(
      [activity("2026-07-31", "work", 8)],
      "2026-07",
    );

    expect(firstOfMonth.totalHours).toBe(8);
    expect(lastOfMonth.totalHours).toBe(8);
  });

  it("CHARACTERIZATION: a bare YYYY prefix matches the whole year, because the filter is textual", () => {
    // Not currently reachable from the UI, but it records that the parameter is
    // an untyped string prefix rather than a validated calendar month. W5 makes
    // the month an explicit required parameter (ADR-0005); a typed month value
    // would make this input impossible to express.
    const summary = calculateMonthlySummary(
      [
        activity("2026-01-15", "work", 10),
        activity("2026-12-15", "work", 10),
        activity("2027-01-15", "work", 10),
      ],
      "2026",
    );

    expect(summary.totalHours).toBe(20);
    expect(summary.month).toBe("2026");
  });
});

describe("calculateMonthlySummary: the month parameter is optional and defaults to today", () => {
  // CHARACTERIZATION: current behaviour is a live defect.
  //
  // `month` is optional and falls back to `format(new Date(), "yyyy-MM")`.
  // ADR-0005 requires month to be an EXPLICIT REQUIRED parameter for exactly this
  // reason: "an optional month argument hides the bug where a caller forgets to
  // pass one and silently gets today."
  //
  // The caller that forgets is real: src/app/tracking/page.tsx:138 calls
  // `calculateMonthlySummary(allActivities)` with no month. Every use of this app
  // is retrospective — 42 CFR 435.556(a)(1) assesses the months PRECEDING
  // application, and 42 CFR 435.558 gives ~35 days to document months already
  // past — so a silent "current month" default is wrong in the direction that
  // matters. CMS-2454-IFC, 91 FR 33348 (June 3, 2026).
  //
  // Corrected in W5 (month scoping). Pinned here so W5's diff shows the change.

  it("currently defaults to the current calendar month when no month is passed", () => {
    // The expected month is DERIVED from the faked clock, not written as a
    // literal. Asserting `toBe("2026-07")` against a July system time would pass
    // for any implementation that happens to return July — including a hardcoded
    // one — so it would not actually pin "defaults to today". Proven: replacing
    // the wall-clock default with a literal `"2026-07"` left that version green.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T12:00:00"));
    const expectedMonth = "2026-03";

    const summary = calculateMonthlySummary([
      activity("2026-03-10", "work", 20),
      activity("2026-02-10", "work", 99),
    ]);

    expect(summary.month).toBe(expectedMonth);
    expect(summary.totalHours).toBe(20);
  });

  it("currently returns a DIFFERENT answer for the same activities depending on today's date", () => {
    // The clearest statement of why the default is a defect: identical input,
    // different output, decided by the wall clock.
    const activities = [activity("2026-06-10", "work", 90)];

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00"));
    const inJune = calculateMonthlySummary(activities);

    vi.setSystemTime(new Date("2026-07-15T12:00:00"));
    const inJuly = calculateMonthlySummary(activities);

    expect(inJune.totalHours).toBe(90);
    expect(inJuly.totalHours).toBe(0);
    expect(inJune.month).not.toBe(inJuly.month);
  });
});

describe("calculateMonthlySummary: threshold comparison and difference arithmetic", () => {
  // The 80 is a POLICY LITERAL living outside src/lib/policy/, which ADR-0001
  // forbids and W2b fixes. These tests pin the arithmetic SHAPE — an inclusive
  // comparison and a floored difference — not the value. When W2b injects the
  // threshold, the shape must survive; the number is expected to become dynamic.
  //
  // `hoursNeeded` is neutral arithmetic and survives ADR-0003: a difference is
  // not a verdict. `isCompliant` does NOT survive — ADR-0003 renames it to
  // `meetsHoursThreshold` in W7b, because a stored boolean named for a legal
  // conclusion asserts a determination HourKeep is not allowed to make.

  it("W2b: the threshold comparison is inclusive — exactly 80 hours satisfies it", () => {
    const summary = calculateMonthlySummary(
      [activity("2026-07-01", "work", 80)],
      "2026-07",
    );

    expect(summary.totalHours).toBe(80);
    expect(summary.isCompliant).toBe(true);
    expect(summary.hoursNeeded).toBe(0);
  });

  it("W2b: 79 hours does not satisfy it, and the difference is reported as 1", () => {
    const summary = calculateMonthlySummary(
      [activity("2026-07-01", "work", 79)],
      "2026-07",
    );

    expect(summary.isCompliant).toBe(false);
    expect(summary.hoursNeeded).toBe(1);
  });

  it("floors hoursNeeded at 0 rather than reporting a negative difference", () => {
    const summary = calculateMonthlySummary(
      [activity("2026-07-01", "work", 120)],
      "2026-07",
    );

    expect(summary.hoursNeeded).toBe(0);
  });

  it("reaches the threshold by COMBINING types, which is what 42 CFR 435.552(e)(1) requires", () => {
    // This one is correct today and must stay correct. 42 CFR 435.552(a)(5) and
    // (e)(1): the 80 hours is a monthly TOTAL across activities, not a per-activity
    // requirement. W2a corrected the copy that implied otherwise; this pins that
    // the arithmetic already agreed with the rule.
    const summary = calculateMonthlySummary(
      [
        activity("2026-07-01", "work", 30),
        activity("2026-07-02", "volunteer", 30),
        activity("2026-07-03", "education", 20),
      ],
      "2026-07",
    );

    expect(summary.totalHours).toBe(80);
    expect(summary.isCompliant).toBe(true);
  });

  it("CHARACTERIZATION: education hours are combined, which 42 CFR 435.552(a)(5) forbids for half-time enrolment", () => {
    // Current behaviour is incorrect per 42 CFR 435.552(a)(4) and (a)(5).
    // Enrolment at least half-time qualifies with ZERO hours and may NOT be
    // combined with other activities. Less-than-half-time converts to hours at
    // `creditHours x 3 x 4.33` (42 CFR 435.552(d)) and may be combined.
    //
    // This module has one undifferentiated `education` bucket and always combines
    // it, so it cannot express the half-time cliff at all. That is a model gap,
    // not an arithmetic slip. Owned by W6a (education half-time cliff and
    // credit-hour conversion). CMS-2454-IFC, 91 FR 33348.
    const summary = calculateMonthlySummary(
      [
        activity("2026-07-01", "education", 40),
        activity("2026-07-02", "work", 40),
      ],
      "2026-07",
    );

    expect(summary.totalHours).toBe(80);
    expect(summary.educationHours).toBe(40);
    expect(summary.isCompliant).toBe(true);
  });
});

describe("calculateMonthlySummary: fractional and zero hours", () => {
  it("accumulates fractional hours without rounding", () => {
    const summary = calculateMonthlySummary(
      [
        activity("2026-07-01", "work", 2.5),
        activity("2026-07-02", "work", 1.25),
      ],
      "2026-07",
    );

    expect(summary.workHours).toBe(3.75);
  });

  it("carries floating-point accumulation error, unrounded, into the total", () => {
    // CHARACTERIZATION: 0.1 + 0.2 !== 0.3 in IEEE 754, and nothing here rounds.
    // Harmless at the 80-hour threshold, recorded because W6a and W7b introduce
    // combination arithmetic where accumulated error could straddle a threshold.
    const summary = calculateMonthlySummary(
      [
        activity("2026-07-01", "work", 0.1),
        activity("2026-07-02", "work", 0.2),
      ],
      "2026-07",
    );

    expect(summary.workHours).not.toBe(0.3);
    expect(summary.workHours).toBeCloseTo(0.3, 10);
  });

  it("counts a zero-hour activity as a row that contributes nothing", () => {
    const summary = calculateMonthlySummary(
      [activity("2026-07-01", "work", 0)],
      "2026-07",
    );

    expect(summary.totalHours).toBe(0);
    expect(summary.hoursNeeded).toBe(80);
  });
});
