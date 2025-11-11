/**
 * Income Storage Functions
 *
 * Handles storage and retrieval of income entries and compliance mode data.
 */

import { db } from "@/lib/db";
import { IncomeEntry, MonthlyIncomeSummary } from "@/types/income";
import {
  calculateMonthlyEquivalent,
  INCOME_THRESHOLD,
} from "@/lib/utils/payPeriodConversion";

/**
 * Save a new income entry
 */
export async function saveIncomeEntry(
  entry: Omit<IncomeEntry, "id" | "createdAt" | "updatedAt">,
): Promise<number> {
  const id = await db.incomeEntries.add({
    ...entry,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

/**
 * Update an existing income entry
 */
export async function updateIncomeEntry(
  id: number,
  entry: Partial<Omit<IncomeEntry, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  await db.incomeEntries.update(id, {
    ...entry,
    updatedAt: new Date(),
  });
}

/**
 * Delete an income entry
 */
export async function deleteIncomeEntry(id: number): Promise<void> {
  await db.incomeEntries.delete(id);
}

/**
 * Get income entry by ID
 */
export async function getIncomeEntryById(
  id: number,
): Promise<IncomeEntry | undefined> {
  return db.incomeEntries.get(id);
}

/**
 * Get all income entries for a specific month
 */
export async function getIncomeEntriesByMonth(
  userId: string,
  month: string, // YYYY-MM
): Promise<IncomeEntry[]> {
  return db.incomeEntries
    .where("date")
    .between(`${month}-01`, `${month}-31`, true, true)
    .and((entry) => entry.userId === userId)
    .toArray();
}

/**
 * Get all income entries for the past 6 months (including current month)
 */
export async function getIncomeEntriesForLast6Months(
  userId: string,
  currentMonth: string, // YYYY-MM
): Promise<IncomeEntry[]> {
  const months = getLast6Months(currentMonth);
  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];

  return db.incomeEntries
    .where("date")
    .between(`${firstMonth}-01`, `${lastMonth}-31`, true, true)
    .and((entry) => entry.userId === userId)
    .toArray();
}

/**
 * Calculate 6-month seasonal average
 */
export async function calculateSeasonalAverage(
  userId: string,
  currentMonth: string,
): Promise<{
  average: number;
  history: Array<{ month: string; total: number }>;
}> {
  const months = getLast6Months(currentMonth);
  const history: Array<{ month: string; total: number }> = [];
  let totalIncome = 0;

  for (const month of months) {
    const entries = await getIncomeEntriesByMonth(userId, month);
    const monthTotal = entries.reduce(
      (sum, entry) => sum + entry.monthlyEquivalent,
      0,
    );
    history.push({ month, total: monthTotal });
    totalIncome += monthTotal;
  }

  const average = totalIncome / 6;

  return { average, history };
}

/**
 * Get last 6 months including current month
 */
function getLast6Months(currentMonth: string): string[] {
  const months: string[] = [];
  const [year, month] = currentMonth.split("-").map(Number);

  for (let i = 5; i >= 0; i--) {
    const date = new Date(year, month - 1 - i, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
  }

  return months;
}

/**
 * Calculate monthly income summary with compliance status
 */
export async function getMonthlyIncomeSummary(
  userId: string,
  month: string,
): Promise<MonthlyIncomeSummary> {
  const entries = await getIncomeEntriesByMonth(userId, month);

  const totalIncome = entries.reduce(
    (sum, entry) => sum + entry.monthlyEquivalent,
    0,
  );

  // Calculate income breakdown by source
  const incomeBySource = entries.reduce(
    (acc, entry) => {
      const source = entry.source || "Unspecified";
      const existing = acc.find((item) => item.source === source);
      if (existing) {
        existing.monthlyEquivalent += entry.monthlyEquivalent;
      } else {
        acc.push({ source, monthlyEquivalent: entry.monthlyEquivalent });
      }
      return acc;
    },
    [] as Array<{ source: string; monthlyEquivalent: number }>,
  );

  // Check user-level seasonal worker status for this month
  const isSeasonalWorker = await getSeasonalWorkerStatus(userId, month);

  let seasonalData;
  if (isSeasonalWorker) {
    seasonalData = await calculateSeasonalAverage(userId, month);
  }

  const effectiveIncome = isSeasonalWorker
    ? seasonalData!.average
    : totalIncome;

  return {
    month,
    totalIncome,
    entryCount: entries.length,
    isCompliant: effectiveIncome >= INCOME_THRESHOLD,
    amountNeeded: Math.max(0, INCOME_THRESHOLD - effectiveIncome),
    isSeasonalWorker,
    seasonalAverage: seasonalData?.average,
    seasonalHistory: seasonalData?.history,
    incomeBySource,
  };
}

/**
 * Set compliance mode for a specific month
 */
export async function setComplianceMode(
  userId: string,
  month: string,
  mode: "hours" | "income",
): Promise<void> {
  const existing = await db.complianceModes.where({ userId, month }).first();

  if (existing) {
    await db.complianceModes.update(existing.id!, {
      mode,
      updatedAt: new Date(),
    });
  } else {
    await db.complianceModes.add({
      userId,
      month,
      mode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Get compliance mode for a specific month
 * Defaults to "hours" if not set
 */
export async function getComplianceMode(
  userId: string,
  month: string,
): Promise<"hours" | "income"> {
  const mode = await db.complianceModes.where({ userId, month }).first();

  return mode?.mode || "hours"; // Default to hours
}

/**
 * Set seasonal worker status for a specific user and month
 */
export async function setSeasonalWorkerStatus(
  userId: string,
  month: string,
  isSeasonalWorker: boolean,
): Promise<void> {
  const existing = await db.seasonalWorkerStatus
    .where({ userId, month })
    .first();

  if (existing) {
    await db.seasonalWorkerStatus.update(existing.id!, {
      isSeasonalWorker,
      updatedAt: new Date(),
    });
  } else {
    await db.seasonalWorkerStatus.add({
      userId,
      month,
      isSeasonalWorker,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Get seasonal worker status for a specific user and month
 * Defaults to false if not set
 */
export async function getSeasonalWorkerStatus(
  userId: string,
  month: string,
): Promise<boolean> {
  const status = await db.seasonalWorkerStatus.where({ userId, month }).first();

  return status?.isSeasonalWorker || false;
}
