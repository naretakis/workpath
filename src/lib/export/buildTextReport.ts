import { format } from "date-fns";

import type { Activity, UserProfile } from "@/types";
import type { ComplianceMode, IncomeEntry } from "@/types/income";

/**
 * Builds the human-readable evidence report a user hands to their agency.
 *
 * WHY THIS MODULE EXISTS
 * This logic lived inside a `handleExport` closure in app/export/page.tsx, which
 * read Dexie directly and passed the string straight to a download. Nothing
 * rendered it and nothing exported it, so wave-2 § 2.5's acceptance criterion —
 * "the export prints Logged / Threshold / Difference" — named no observable.
 * An acceptance criterion has to name something you can run, read, or see
 * (.kiro/steering/engineering-standards.md).
 *
 * The extraction is an authorized exception to W2a's "copy and content only"
 * scope, recorded in docs/hr1-readiness/waves/wave-2a-truth-in-copy.md § 2.5
 * [F5]. ADR-0006 makes the evidence package the product's output target and W8a
 * rewrites this as print-ready HTML, so a pure builder is work that wave needs
 * regardless. No Dexie, no React, no DOM.
 *
 * WHAT CHANGED IN THE OUTPUT — all five, itemised
 * An earlier version of this header claimed "no behaviour change beyond the § 2.5
 * string replacement". That was over-claimed, and a future reader deciding whether
 * this can be diffed against the old behaviour would have been misled. The data
 * read, the filtering, the ordering, the mode lookup, and every edge case ARE
 * byte-identical — verified by diffing both implementations across 13 fixtures in
 * two timezones. These five strings differ:
 *
 *   1. `✓ COMPLIANT` / `✗ NOT COMPLIANT` -> `Logged / Threshold / Difference`.
 *      HourKeep does not determine compliance: 42 CFR 435.556 makes it the state's
 *      question, 435.557(a)-(b) requires it to exhaust its own records first, and
 *      the determination is appealable under 431.220(a)(1). ADR-0003.
 *   2. `HOURKEEP COMPLIANCE REPORT` -> `HOURKEEP ACTIVITY RECORD`. The old title
 *      framed the artifact as a compliance finding.
 *   3. `Compliance Mode: Hours Tracking` -> `Recorded as: Hours`. Same reason.
 *   4. A four-line not-a-determination preamble, with citations, added at the top.
 *   5. A two-line household-income note added to the income block — see below.
 *
 * Plus one bug fix, not a string change: the month heading parsed as UTC and so
 * printed the PREVIOUS month in any negative-offset timezone. See below.
 *
 * POLICY LITERALS
 * `80` and `580` are passed in as `thresholds` rather than hardcoded, so W2b can
 * hand them straight from the policy profile without touching this file.
 * The caller still holds literals — recorded in the W2a handoff table.
 */

export interface ReportThresholds {
  /** Monthly hours threshold. 42 CFR 435.552(a)(1)-(a)(5). */
  hours: number;
  /** Monthly income threshold: federal minimum wage x hours. 42 CFR 435.552(f). */
  income: number;
}

export interface TextReportInput {
  profile?: UserProfile;
  activities: Activity[];
  incomeEntries: IncomeEntry[];
  complianceModes: ComplianceMode[];
  thresholds: ReportThresholds;
  /** Injected so output is deterministic under test. */
  generatedAt?: Date;
}

const RULE = "=".repeat(50);
const SUBRULE = "-".repeat(50);

/** `YYYY-MM` for a date string, without constructing a Date. */
function monthKey(isoDate: string): string {
  return isoDate.substring(0, 7);
}

/**
 * Renders one "Logged / Threshold / Difference" line.
 *
 * Difference is clamped at zero: a surplus is not a deficit, and a negative
 * "difference" reads as a penalty. ADR-0003 keeps `hoursNeeded` as neutral
 * arithmetic, and this is the same figure.
 */
function comparisonLine(
  label: string,
  logged: string,
  threshold: string,
  difference: string,
): string {
  return `${label}\n  Logged: ${logged}\n  Threshold: ${threshold}\n  Difference: ${difference}\n`;
}

export function buildTextReport(input: TextReportInput): string {
  const {
    profile,
    activities,
    incomeEntries,
    complianceModes,
    thresholds,
    generatedAt = new Date(),
  } = input;

  let out = "HOURKEEP ACTIVITY RECORD\n";
  out += RULE + "\n\n";

  if (profile) {
    out += `Name: ${profile.name}\n`;
    out += `State: ${profile.state}\n`;
    out += `Report Date: ${format(generatedAt, "MMMM d, yyyy")}\n\n`;
  }

  // Said once, at the top, so no month block has to hedge individually.
  out += "This is a record of what you logged. It is not a determination.\n";
  out += "Your state decides whether the requirement is met, and it must\n";
  out += "check its own records before asking you for anything.\n";
  out += "42 CFR 435.552, 435.556, 435.557(a)-(b)\n\n";
  out += RULE + "\n\n";

  const allMonths = new Set<string>();
  activities.forEach((a) => allMonths.add(monthKey(a.date)));
  incomeEntries.forEach((i) => allMonths.add(monthKey(i.date)));

  const sortedMonths = Array.from(allMonths).sort().reverse();

  sortedMonths.forEach((month) => {
    const modeRecord = complianceModes.find(
      (m) => m.month === month && m.userId === profile?.id,
    );
    const mode = modeRecord?.mode || "hours";

    // `new Date("2026-07-01")` is parsed as UTC midnight, so in any negative-offset
    // timezone it lands on June 30 local and this heading printed the WRONG MONTH.
    // Pre-existing defect carried over from the inline version, caught by the test
    // this extraction made possible. The explicit time makes it local midnight,
    // matching how per-entry dates are already handled a few lines below.
    // .kiro/steering/data-migration-standards.md names this exact bug class.
    out += `${format(new Date(month + "-01T00:00:00"), "MMMM yyyy")}\n`;
    out += SUBRULE + "\n";
    out += `Recorded as: ${mode === "hours" ? "Hours" : "Income"}\n\n`;

    if (mode === "hours") {
      const monthActivities = activities.filter(
        (a) => monthKey(a.date) === month,
      );
      const totalHours = monthActivities.reduce((sum, a) => sum + a.hours, 0);
      const difference = Math.max(0, thresholds.hours - totalHours);

      out += comparisonLine(
        "Hours",
        `${totalHours} hours`,
        `${thresholds.hours} hours`,
        `${difference} hours`,
      );
      out += "\n";

      if (monthActivities.length > 0) {
        [...monthActivities]
          .sort((a, b) => a.date.localeCompare(b.date))
          .forEach((activity) => {
            out += `  ${format(new Date(activity.date + "T00:00:00"), "MMM d, yyyy")} - `;
            out += `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - `;
            out += `${activity.hours} hours`;
            if (activity.organization) {
              out += ` - ${activity.organization}`;
            }
            out += "\n";
          });
      } else {
        out += "  No activities recorded\n";
      }
    } else {
      const monthIncomeEntries = incomeEntries.filter(
        (i) => monthKey(i.date) === month,
      );
      const totalIncome = monthIncomeEntries.reduce(
        (sum, i) => sum + i.monthlyEquivalent,
        0,
      );
      const difference = Math.max(0, thresholds.income - totalIncome);

      out += comparisonLine(
        "Income",
        `$${totalIncome.toFixed(2)}`,
        `$${thresholds.income.toFixed(2)}`,
        `$${difference.toFixed(2)}`,
      );
      // 42 CFR 435.552(f)(2) -> 435.603(d)-(f): the threshold is measured against
      // MAGI-based income for the MAGI-based HOUSEHOLD, not the individual. This
      // figure is one person's records, so the state's number may be higher.
      // Saying so prevents the report reading as a shortfall it may not be.
      out +=
        "  Note: your state counts your whole tax household here, so its\n";
      out += "  figure may be higher than this one. 42 CFR 435.603(d)-(f)\n";
      out += "\n";

      if (monthIncomeEntries.length > 0) {
        [...monthIncomeEntries]
          .sort((a, b) => a.date.localeCompare(b.date))
          .forEach((entry) => {
            out += `  ${format(new Date(entry.date + "T00:00:00"), "MMM d, yyyy")} - `;
            out += `$${entry.amount.toFixed(2)} (${entry.payPeriod}) → $${entry.monthlyEquivalent.toFixed(2)}/month`;
            if (entry.source) {
              out += ` - ${entry.source}`;
            }
            out += "\n";
          });
      } else {
        out += "  No income entries recorded\n";
      }
    }

    out += "\n";
  });

  if (activities.length === 0 && incomeEntries.length === 0) {
    out += "No activities or income entries recorded yet.\n";
  }

  return out;
}
