import {
  AssessmentResponses,
  Recommendation,
  ComplianceMethod,
} from "@/types/assessment";
import { calculateExemption } from "@/lib/exemptions/calculator";

/**
 * Calculate the best compliance method recommendation based on assessment responses
 * @param responses - Complete assessment responses
 * @returns Recommendation with primary method, reasoning, and alternatives
 */
export function calculateRecommendation(
  responses: AssessmentResponses,
): Recommendation {
  // 1. Check exemption status first (easiest path)
  const exemptionResult = calculateExemption(responses.exemption);

  if (exemptionResult.isExempt) {
    return {
      primaryMethod: "exemption",
      reasoning: exemptionResult.explanation,
      alternativeMethods: [],
      complianceStatus: "compliant",
      estimatedEffort: "low",
    };
  }

  // 2. Calculate viable compliance paths
  const viableMethods: ComplianceMethod[] = [];

  // Check income tracking viability
  const monthlyIncome = responses.monthlyIncome || 0;
  if (monthlyIncome >= 580) {
    viableMethods.push("income-tracking");
  }

  // Check seasonal income tracking viability
  if (responses.isSeasonalWork && monthlyIncome >= 580) {
    viableMethods.push("seasonal-income-tracking");
  }

  // Check hour tracking viability
  const totalHours = calculateTotalHours(responses);
  if (totalHours >= 80) {
    viableMethods.push("hour-tracking");
  }

  // 3. Determine primary recommendation based on priority
  // Priority: seasonal income (if seasonal worker) > regular income > hours
  let primaryMethod: ComplianceMethod;
  let reasoning: string;
  let complianceStatus: "compliant" | "needs-increase" | "unknown";
  let estimatedEffort: "low" | "medium" | "high";

  // If they're a seasonal worker and seasonal income tracking is viable, recommend that first
  if (
    responses.isSeasonalWork &&
    viableMethods.includes("seasonal-income-tracking")
  ) {
    primaryMethod = "seasonal-income-tracking";
    // 42 CFR 435.552(a)(7), (g). Averaged over the 6 months preceding the month
    // being assessed. Copy states the comparison, not a conclusion, and does not
    // rank this pathway above the others — 435.552(a) makes all seven available.
    // `monthlyIncome` is a single self-reported figure, NOT an average — the
    // previous wording ("Averaged over 6 months, your seasonal income comes to
    // $X") labelled a Deferred number as Computed. Under 435.552(g) the average
    // runs over the 6 months preceding the assessed month, which HourKeep does not
    // hold from one screening answer.
    reasoning = `You told us about $${monthlyIncome} a month. Threshold: $580. For seasonal work your state can average the 6 months before the month it's reviewing rather than looking at one month alone, so its figure may differ from this one. Keep records across the whole year.`;
    complianceStatus = "compliant";
    estimatedEffort = "low";
  } else if (viableMethods.includes("income-tracking")) {
    primaryMethod = "income-tracking";
    reasoning = `Recorded: $${monthlyIncome} a month. Threshold: $580. Your state counts your whole household here, so its figure may be higher than yours — ask what it already has on file.`;
    complianceStatus = "compliant";
    estimatedEffort = "low";
  } else if (viableMethods.includes("hour-tracking")) {
    primaryMethod = "hour-tracking";
    reasoning = `Recorded: ${totalHours} hours this month. Threshold: 80 hours. Keep recording as you go — the hours are what your state will look for if its own records don't already show them.`;
    complianceStatus = "compliant";
    estimatedEffort = totalHours > 100 ? "low" : "medium";
  } else {
    // Nothing recorded clears a threshold on its own. That is a DIFFERENCE, not a
    // verdict (ADR-0003: hoursNeeded survives as neutral arithmetic).
    //
    // The copy here used to present hours and income as alternatives — "you need
    // EITHER 50 more hours OR $200 more income". 42 CFR 435.552(e)(1) requires the
    // state to add activities together, and (e)(2) lets it credit income below the
    // threshold AS hours and combine that with the rest. So they are cumulative,
    // not exclusive, and the old framing sent people looking for hours they may
    // not have needed.
    //
    // The proxy is Conditional (a state election) and an UPPER BOUND:
    // 435.552(e)(2)(i) requires the state to allocate credited hours between
    // household members by a method we cannot know. Hence "up to", never "about".
    primaryMethod = "hour-tracking";
    const hoursNeeded = 80 - totalHours;
    const incomeNeeded = 580 - monthlyIncome;

    if (totalHours > 0 && monthlyIncome > 0) {
      reasoning = `Recorded: ${totalHours} hours and $${monthlyIncome} this month. Thresholds: 80 hours / $580. Difference: ${hoursNeeded} hours / $${incomeNeeded}. These are not separate races — some states can credit income as hours and count both together, so keep recording both.`;
    } else if (totalHours > 0) {
      reasoning = `Recorded: ${totalHours} hours this month. Threshold: 80 hours. Difference: ${hoursNeeded}. Work, volunteering, school, and job training all count toward the same total, and income can be counted alongside them.`;
    } else if (monthlyIncome > 0) {
      reasoning = `Recorded: $${monthlyIncome} this month. Threshold: $580. Difference: $${incomeNeeded}. Income under the threshold isn't wasted — some states credit it as hours, which you can then add other activities on top of. Your state counts your whole household, so its figure may be higher than yours.`;
    } else {
      reasoning = `Nothing recorded yet. There are two ways to get there and they work together: 80 hours a month across work, volunteering, school, and job training, or household income of at least $580. Start with whatever you already have.`;
    }

    complianceStatus = "needs-increase";
    estimatedEffort = "high";
  }

  // 4. Determine alternative methods
  const alternativeMethods = viableMethods.filter((m) => m !== primaryMethod);

  return {
    primaryMethod,
    reasoning,
    alternativeMethods,
    complianceStatus,
    estimatedEffort,
  };
}

/**
 * Calculate total monthly hours from all activities
 * @param responses - Assessment responses
 * @returns Total hours per month
 */
function calculateTotalHours(responses: AssessmentResponses): number {
  let total = 0;

  // Add work hours
  if (responses.monthlyWorkHours) {
    total += responses.monthlyWorkHours;
  }

  // Add volunteer hours
  if (responses.volunteerHoursPerMonth) {
    total += responses.volunteerHoursPerMonth;
  }

  // Add school hours
  if (responses.schoolHoursPerMonth) {
    total += responses.schoolHoursPerMonth;
  }

  // Add work program hours
  if (responses.workProgramHoursPerMonth) {
    total += responses.workProgramHoursPerMonth;
  }

  return total;
}

/**
 * Get a user-friendly label for a compliance method
 * @param method - Compliance method
 * @returns Display label
 */
export function getComplianceMethodLabel(method: ComplianceMethod): string {
  switch (method) {
    case "exemption":
      return "Exemption";
    case "income-tracking":
      return "Income Tracking";
    case "seasonal-income-tracking":
      return "Seasonal Income Tracking";
    case "hour-tracking":
      return "Hour Tracking";
  }
}

/**
 * Get a description for a compliance method
 * @param method - Compliance method
 * @returns Description text
 */
export function getComplianceMethodDescription(
  method: ComplianceMethod,
): string {
  switch (method) {
    // 42 CFR 435.554 and 435.553. Some categories mean the state is prohibited
    // from assessing compliance at all (435.556(c)); others mean the month counts
    // as already met. Either way the state decides, after checking its own records
    // first (435.557(a)-(b)).
    case "exemption":
      return "One of the categories that are set aside may apply to you. Export what you have, including anything that shows it, and ask your Medicaid agency to check.";
    // 42 CFR 435.552(f)(2) measures against MAGI-based income for the MAGI-based
    // HOUSEHOLD, not the individual — so "showing you earn at least $580"
    // contradicted the household framing W2a established everywhere else, and
    // read as not applying to a married user whose spouse works.
    case "income-tracking":
      return "Keep your pay stubs. Household income counts here, not just yours, so a spouse's earnings count too — the threshold is $580 a month.";
    // 42 CFR 435.552(g): the average runs over the 6 months PRECEDING the month
    // being reviewed, excluding it.
    case "seasonal-income-tracking":
      return "Keep records across the year. Your state can average the 6 months before the month it's reviewing, against a $580 threshold.";
    // 42 CFR 435.552(a)(1)-(a)(5): work program is a pathway too, and the old
    // string omitted it. Work includes in-kind and unpaid work under (b).
    case "hour-tracking":
      return "Record work, volunteering, school, and job training. They add up to one monthly total of 80 hours, and income can count alongside them.";
  }
}
