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

  it("W5: rejects a bare YYYY prefix instead of silently summing a whole year", () => {
    // ───────────────────────────────────────────────────────────────────────────
    // INVERTED BY W5, 2026-09-02. Was:
    //
    //   it("CHARACTERIZATION: a bare YYYY prefix matches the whole year, because
    //       the filter is textual")
    //
    // and it asserted `totalHours === 20` and `month === "2026"` — a year's worth
    // of activities summed under a label claiming to be a month.
    //
    // The old test's own comment set this up: "W5 makes the month an explicit
    // required parameter (ADR-0005); a typed month value would make this input
    // impossible to express." Required is not the same as valid, though. A
    // required `"2026"` is exactly as wrong as an optional one, so W5 validates
    // the shape as well as demanding the argument.
    // ───────────────────────────────────────────────────────────────────────────
    expect(() =>
      calculateMonthlySummary(
        [
          activity("2026-01-15", "work", 10),
          activity("2026-12-15", "work", 10),
          activity("2027-01-15", "work", 10),
        ],
        "2026",
      ),
    ).toThrow(/2026/);
  });
});

describe("calculateMonthlySummary: the month parameter is REQUIRED and the clock is not read", () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // INVERTED BY W5, 2026-09-02. These two tests used to pin the OPPOSITE
  // behaviour, and turning them red was the signal that the fix landed.
  //
  // What they pinned before:
  //
  //   it("currently defaults to the current calendar month when no month is
  //       passed")
  //   it("currently returns a DIFFERENT answer for the same activities depending
  //       on today's date")
  //
  // `month` was optional and fell back to `format(new Date(), "yyyy-MM")`, and
  // `src/app/tracking/page.tsx:138` was the caller that forgot it entirely.
  // ADR-0005 required month to become explicit for exactly that reason: "an
  // optional month argument hides the bug where a caller forgets to pass one and
  // silently gets today."
  //
  // Why it mattered rather than merely being untidy: every use of this app is
  // retrospective. 42 CFR 435.556(a)(1) assesses the months PRECEDING
  // application, and 42 CFR 435.558 gives roughly 35 days to document months
  // already past. A silent "current month" default was wrong in the direction
  // that costs someone coverage. CMS-2454-IFC, 91 FR 33348 (June 3, 2026).
  //
  // Updated deliberately rather than deleted, so the record of what was fixed
  // survives in the file that proved it was broken.
  // ─────────────────────────────────────────────────────────────────────────────

  it("ADR-0005: will not compile without a month, and throws rather than defaulting if called anyway", () => {
    // Two layers, because neither alone is sufficient.
    //
    // The TYPE CHECKER is the observable for "the parameter is required":
    // `@ts-expect-error` makes `tsc --noEmit` fail if the error ever stops
    // occurring, which is what would happen if someone reintroduced the optional
    // parameter. No runtime assertion can express that, and no comment can
    // enforce it.
    //
    // The runtime throw matters separately. This app statically exports to a
    // browser, where types are gone; a call from untyped code must fail loudly
    // rather than quietly assume today. Failing loudly is the safe direction —
    // a thrown error is visible, whereas a silent wrong month reads as a real
    // answer.
    expect(() =>
      // @ts-expect-error month is a required parameter as of W5 (ADR-0005)
      calculateMonthlySummary([activity("2026-03-10", "work", 20)]),
    ).toThrow();
  });

  it("ADR-0005: returns the SAME answer for the same activities whatever today's date is", () => {
    // The exact inverse of the test this replaces. Same fixture, same two clocks,
    // opposite expectation. Previously June returned 90 and July returned 0 for
    // identical input; now the explicit month decides and the clock is inert.
    const activities = [activity("2026-06-10", "work", 90)];

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00"));
    const readInJune = calculateMonthlySummary(activities, "2026-06");

    vi.setSystemTime(new Date("2026-07-15T12:00:00"));
    const readInJuly = calculateMonthlySummary(activities, "2026-06");

    expect(readInJune).toEqual(readInJuly);
    expect(readInJune.totalHours).toBe(90);
    expect(readInJuly.totalHours).toBe(90);
    expect(readInJuly.month).toBe("2026-06");
  });

  it("ADR-0005: a month in the past is readable a year later without changing", () => {
    // The case the product exists for. Under 42 CFR 435.558 someone has ~35 days
    // to document months already gone, and ADR-0005 § 5 says the retrospective
    // case is the primary one. Reading December from the following August must
    // give December's answer.
    const activities = [
      activity("2026-12-05", "work", 40),
      activity("2026-12-19", "volunteer", 45),
    ];

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-08-15T12:00:00"));
    const summary = calculateMonthlySummary(activities, "2026-12");

    expect(summary.month).toBe("2026-12");
    expect(summary.totalHours).toBe(85);
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

  it("CHARACTERIZATION: education hours are combined, which 42 CFR 435.552(e) forbids at half-time", () => {
    // Current behaviour is incorrect per 42 CFR 435.552(a)(4) and (e).
    // Enrolment at least half-time qualifies with ZERO hours under (a)(4), and
    // § 435.552(e) then forbids combining it — because (a)(4) is already satisfied.
    // Less-than-half-time converts at `creditHours x 3 x 4.33` (42 CFR 435.552(d))
    // and may be combined.
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
