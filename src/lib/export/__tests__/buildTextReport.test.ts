/**
 * The export report is the artifact a user physically hands to a caseworker, so
 * what it prints matters more than what any screen shows. ADR-0006 makes it the
 * product's output target.
 *
 * Before W2a this logic lived in a closure inside app/export/page.tsx and could
 * not be tested at all — which is why wave-2 § 2.5's criterion ("the export
 * prints Logged / Threshold / Difference") named no observable. These tests are
 * that observable.
 */

import { describe, it, expect } from "vitest";

import { buildTextReport, type TextReportInput } from "../buildTextReport";
import {
  findVerdictPhrases,
  formatHits,
} from "@/__tests__/support/verdictPhrases";
import type { Activity, UserProfile } from "@/types";
import type { ComplianceMode, IncomeEntry } from "@/types/income";

const NOW = new Date("2026-08-17T12:00:00Z");

/** 42 CFR 435.552: 80 hours; 435.552(f): $7.25 x 80 = $580. Passed in, not hardcoded. */
const THRESHOLDS = { hours: 80, income: 580 };

const profile: UserProfile = {
  id: "user-1",
  name: "Sam Rivera",
  state: "OH",
  createdAt: NOW,
  updatedAt: NOW,
} as UserProfile;

function activity(date: string, hours: number, org?: string): Activity {
  return {
    date,
    type: "volunteer",
    hours,
    organization: org,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function income(date: string, monthlyEquivalent: number): IncomeEntry {
  return {
    userId: "user-1",
    date,
    amount: monthlyEquivalent,
    payPeriod: "monthly",
    monthlyEquivalent,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function mode(month: string, m: "hours" | "income"): ComplianceMode {
  return {
    userId: "user-1",
    month,
    mode: m,
    createdAt: NOW,
    updatedAt: NOW,
  } as ComplianceMode;
}

function build(overrides: Partial<TextReportInput> = {}): string {
  return buildTextReport({
    profile,
    activities: [],
    incomeEntries: [],
    complianceModes: [],
    thresholds: THRESHOLDS,
    generatedAt: NOW,
    ...overrides,
  });
}

describe("ADR-0003: the export prints a comparison, not a verdict", () => {
  it("prints Logged / Threshold / Difference for the hours block", () => {
    const report = build({
      activities: [activity("2026-07-05", 30), activity("2026-07-06", 16)],
      complianceModes: [mode("2026-07", "hours")],
    });

    expect(report).toContain("Logged: 46 hours");
    expect(report).toContain("Threshold: 80 hours");
    expect(report).toContain("Difference: 34 hours");
  });

  it("prints Logged / Threshold / Difference for the income block", () => {
    const report = build({
      incomeEntries: [income("2026-07-15", 380)],
      complianceModes: [mode("2026-07", "income")],
    });

    expect(report).toContain("Logged: $380.00");
    expect(report).toContain("Threshold: $580.00");
    expect(report).toContain("Difference: $200.00");
  });

  it("prints no verdict token in either block", () => {
    const report = build({
      activities: [activity("2026-07-05", 90)],
      incomeEntries: [income("2026-06-15", 700)],
      complianceModes: [mode("2026-07", "hours"), mode("2026-06", "income")],
    });

    const hits = findVerdictPhrases(report, "buildTextReport output");
    expect(hits, formatHits(hits)).toEqual([]);
  });

  it("says on its face that it is not a determination", () => {
    const report = build();
    expect(report).toMatch(/not a determination/i);
    expect(report).toMatch(/your state decides/i);
  });

  it("cites the ex parte obligation, so a caseworker sees it too", () => {
    // 42 CFR 435.557(a) defines the reliable-information set and (b) imposes the
    // duty to exhaust it before asking the individual. Cite the pair: the
    // June 29, 2026 correction shifted paragraph designations inside 435.557.
    expect(build()).toContain("435.557(a)-(b)");
  });
});

describe("42 CFR 435.603(d)-(f): the income block flags the household basis", () => {
  it("warns that the state's figure may be higher than one person's records", () => {
    // The threshold is measured against MAGI-based income for the MAGI-based
    // HOUSEHOLD. HourKeep stores one individual's records, so an apparent
    // shortfall here may not be one. Without this note the report reads as
    // evidence of failure.
    const report = build({
      incomeEntries: [income("2026-07-15", 380)],
      complianceModes: [mode("2026-07", "income")],
    });

    expect(report).toMatch(/whole tax household/i);
    expect(report).toContain("435.603(d)-(f)");
  });
});

describe("difference arithmetic", () => {
  it("clamps a surplus to zero rather than printing a negative difference", () => {
    const report = build({
      activities: [activity("2026-07-05", 95)],
      complianceModes: [mode("2026-07", "hours")],
    });

    expect(report).toContain("Logged: 95 hours");
    expect(report).toContain("Difference: 0 hours");
    expect(report).not.toContain("-15");
  });

  it("clamps an income surplus to zero as well", () => {
    const report = build({
      incomeEntries: [income("2026-07-15", 900)],
      complianceModes: [mode("2026-07", "income")],
    });

    expect(report).toContain("Difference: $0.00");
  });

  it("takes thresholds from its input, so W2b can pass the policy profile", () => {
    // Proves nothing is hardcoded here. If the FLSA minimum wage changes, only
    // the caller changes.
    const report = build({
      activities: [activity("2026-07-05", 30)],
      complianceModes: [mode("2026-07", "hours")],
      thresholds: { hours: 100, income: 800 },
    });

    expect(report).toContain("Threshold: 100 hours");
    expect(report).toContain("Difference: 70 hours");
  });
});

describe("behaviour preserved from the inline version", () => {
  it("defaults a month with no recorded mode to hours", () => {
    const report = build({ activities: [activity("2026-07-05", 12)] });
    expect(report).toContain("Recorded as: Hours");
    expect(report).toContain("Logged: 12 hours");
  });

  it("orders months newest first", () => {
    const report = build({
      activities: [activity("2026-05-01", 1), activity("2026-07-01", 2)],
    });
    expect(report.indexOf("July 2026")).toBeLessThan(
      report.indexOf("May 2026"),
    );
  });

  it("orders entries within a month oldest first", () => {
    const report = build({
      activities: [
        activity("2026-07-20", 5, "Late Org"),
        activity("2026-07-02", 5, "Early Org"),
      ],
    });
    expect(report.indexOf("Early Org")).toBeLessThan(
      report.indexOf("Late Org"),
    );
  });

  it("includes the profile header when a profile exists", () => {
    const report = build();
    expect(report).toContain("Sam Rivera");
    expect(report).toContain("OH");
    expect(report).toContain("August 17, 2026");
  });

  it("omits the profile header when there is no profile", () => {
    const report = build({ profile: undefined });
    expect(report).not.toContain("Name:");
  });

  it("states when a month has no activities", () => {
    const report = build({
      activities: [activity("2026-07-05", 4)],
      incomeEntries: [income("2026-06-01", 100)],
      complianceModes: [mode("2026-06", "hours")],
    });
    expect(report).toContain("No activities recorded");
  });

  it("states when nothing at all is recorded", () => {
    expect(build()).toContain("No activities or income entries recorded yet.");
  });

  it("does not shift the month heading across a timezone boundary", () => {
    // The month HEADING is built with `new Date(month + "-01T00:00:00")`. Without
    // the explicit time it parses as UTC midnight and, in any zone behind UTC,
    // formats as the previous month — the bug W2a found and fixed.
    //
    // vitest.config.mts pins TZ to America/New_York precisely so this assertion
    // can fail. Under the default UTC it passes even with the bug restored, which
    // makes it worthless. Verified both ways.
    expect(new Date().getTimezoneOffset()).toBeGreaterThan(0);

    const report = build({ activities: [activity("2026-07-01", 8)] });
    expect(report).toContain("July 2026");
    expect(report).not.toContain("June 2026");
  });

  it("keeps a first-of-month entry in its own month for every month of the year", () => {
    // One assertion per month boundary, since the off-by-one only bites on day 1.
    for (let m = 1; m <= 12; m++) {
      const month = String(m).padStart(2, "0");
      const report = build({ activities: [activity(`2026-${month}-01`, 4)] });
      const expected = new Date(2026, m - 1, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      expect(report, `2026-${month}-01`).toContain(expected);
    }
  });
});
