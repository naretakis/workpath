/**
 * Pay Period Conversion Utilities
 *
 * Handles conversion of income amounts from different pay periods
 * to monthly equivalents for compliance calculations.
 */

import { IncomeEntry } from "@/types/income";

// Income threshold constants
// Based on federal minimum wage: $7.25 × 80 hours = $580
export const FEDERAL_MINIMUM_WAGE = 7.25;
export const REQUIRED_HOURS = 80;
export const INCOME_THRESHOLD = FEDERAL_MINIMUM_WAGE * REQUIRED_HOURS; // $580

// Pay period multipliers for converting to monthly equivalent
export const PAY_PERIOD_MULTIPLIERS = {
  daily: 30, // 30 days per month
  weekly: 4.33, // 52 weeks ÷ 12 months
  "bi-weekly": 2.17, // 26 pay periods ÷ 12 months
  monthly: 1, // No conversion needed
} as const;

/**
 * Calculate monthly equivalent income based on pay period
 *
 * @param amount - The income amount for the pay period
 * @param payPeriod - The frequency of payment (daily, weekly, bi-weekly, monthly)
 * @returns Monthly equivalent amount rounded to 2 decimal places
 *
 * @example
 * calculateMonthlyEquivalent(400, "bi-weekly") // Returns 868.00
 * calculateMonthlyEquivalent(150, "weekly") // Returns 649.50
 */
export function calculateMonthlyEquivalent(
  amount: number,
  payPeriod: IncomeEntry["payPeriod"],
): number {
  const multiplier = PAY_PERIOD_MULTIPLIERS[payPeriod];
  return Math.round(amount * multiplier * 100) / 100; // Round to 2 decimals
}

/**
 * Format currency amount for display
 *
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get human-readable pay period label
 *
 * @param payPeriod - The pay period type
 * @returns Human-readable label
 */
export function getPayPeriodLabel(payPeriod: IncomeEntry["payPeriod"]): string {
  const labels = {
    daily: "Daily",
    weekly: "Weekly",
    "bi-weekly": "Bi-weekly",
    monthly: "Monthly",
  };
  return labels[payPeriod];
}
