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
    reasoning = `Your seasonal work averages $${monthlyIncome}/month over 6 months, which could meet the $580 requirement. Seasonal income tracking is perfect for your situation—it lets you average your income across months when work varies by season.`;
    complianceStatus = "compliant";
    estimatedEffort = "low";
  } else if (viableMethods.includes("income-tracking")) {
    primaryMethod = "income-tracking";
    reasoning = `You earn $${monthlyIncome}/month, which could meet the $580 requirement. Income tracking is the easiest option—just submit one paystub each month instead of tracking hours daily.`;
    complianceStatus = "compliant";
    estimatedEffort = "low";
  } else if (viableMethods.includes("hour-tracking")) {
    primaryMethod = "hour-tracking";
    reasoning = `You're completing ${totalHours} hours per month across your activities, which could meet the 80-hour requirement. Keep tracking your hours to document your compliance.`;
    complianceStatus = "compliant";
    estimatedEffort = totalHours > 100 ? "low" : "medium";
  } else {
    // No viable method currently - recommend hour tracking with guidance
    primaryMethod = "hour-tracking";
    const hoursNeeded = 80 - totalHours;
    const incomeNeeded = 580 - monthlyIncome;

    if (totalHours > 0 && monthlyIncome > 0) {
      reasoning = `You're currently at ${totalHours} hours/month and $${monthlyIncome}/month. You need either ${hoursNeeded} more hours or $${incomeNeeded} more income to meet requirements. Hour tracking is recommended—add more work, volunteering, or school hours to reach 80 hours/month.`;
    } else if (totalHours > 0) {
      reasoning = `You're currently at ${totalHours} hours/month. You need ${hoursNeeded} more hours to reach the 80-hour requirement. Add more work, volunteering, or school hours to document your compliance.`;
    } else if (monthlyIncome > 0) {
      reasoning = `You're currently earning $${monthlyIncome}/month. You need $${incomeNeeded} more to reach the $580 requirement, or you can track 80 hours/month of activities instead.`;
    } else {
      reasoning = `To document compliance, you need to either earn $580/month or complete 80 hours/month of qualifying activities (work, volunteering, or school). Start tracking your activities to see where you stand.`;
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
    case "exemption":
      return "You may be exempt from work requirements, just export your data (with exemption docs) and share to your Medicaid agency.";
    case "income-tracking":
      return "Submit one paystub per month showing you earn at least $580.";
    case "seasonal-income-tracking":
      return "Track your income over 6 months, averaging at least $580/month.";
    case "hour-tracking":
      return "Log 80 hours per month of work, volunteering, or school.";
  }
}
