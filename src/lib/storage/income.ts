/**
 * Income Storage Functions
 *
 * Handles storage and retrieval of income entries and compliance mode data.
 */

import { db } from "@/lib/db";
import { IncomeEntry, MonthlyIncomeSummary } from "@/types/income";
import { INCOME_THRESHOLD } from "@/lib/utils/payPeriodConversion";
import {
  getDocumentsByIncomeEntry,
  deleteIncomeDocument,
} from "@/lib/storage/incomeDocuments";

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
 * Delete an income entry together with its documents and their image blobs.
 *
 * Added by W0 § 0.3.2. `deleteIncomeEntry` was a bare row delete, so pay stubs and
 * their blobs stayed in IndexedDB with a dangling `incomeEntryId` and nothing ever
 * reclaimed them — there is no income counterpart to `cleanupOrphanedDocuments`,
 * and blobs are the largest rows in the database.
 *
 * `.kiro/steering/data-migration-standards.md`: deletes cascade explicitly, and
 * orphaned blobs are invisible and unbounded.
 *
 * Mirrors `deleteActivityWithDocuments` in `./activities.ts`, including its
 * ordering contract: **documents first, entry last, and the entry is not deleted
 * if any document failed.** A user left with a visible error can retry; a user
 * left with orphaned pay stubs and no entry to reach them from cannot.
 *
 * The symmetry is exact: there is no narrow `deleteIncomeEntry` export, just as
 * there is no narrow `deleteActivity`. The bare row delete is internal to the
 * cascade. An exported narrow delete would be a trap — it takes the same argument,
 * reads as the obvious choice, and silently orphans blobs that nothing reclaims.
 * That export existed until W0 § 0.3.2 and was the bug.
 *
 * Not wrapped in a Dexie transaction, matching the activity path. Doing so would
 * be an improvement, but it is a behaviour change to the activity side as well and
 * belongs with the transactional-write work in § 0.6 rather than here.
 *
 * @param incomeEntryId - The entry to remove.
 * @throws If any attached document could not be deleted. The message names how
 *   many failed, so the UI can say something specific.
 */
export async function deleteIncomeEntryWithDocuments(
  incomeEntryId: number,
): Promise<void> {
  try {
    const documents = await getDocumentsByIncomeEntry(incomeEntryId);

    const failedDeletions: number[] = [];

    // Each deleteIncomeDocument removes the blob and then the metadata row.
    for (const doc of documents) {
      if (doc.id) {
        try {
          await deleteIncomeDocument(doc.id);
        } catch (docError) {
          console.error(
            `Failed to delete income document ${doc.id}:`,
            docError,
          );
          failedDeletions.push(doc.id);
        }
      }
    }

    if (failedDeletions.length > 0) {
      throw new Error(
        `Failed to delete ${failedDeletions.length} document(s). Income entry not deleted.`,
      );
    }

    await db.incomeEntries.delete(incomeEntryId);
  } catch (error) {
    console.error("Error deleting income entry with documents:", error);
    throw error;
  }
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
 * The stored compliance mode for a month, or `undefined` if the user has never
 * chosen one for that month.
 *
 * Added by W5. `getComplianceMode` collapses "no preference" into "hours", which is
 * a sensible default for a single fixed month and a defect once the page follows a
 * SELECTED month: a user tracking income in July who pages back to a June they have
 * never opened would have the whole surface flip to hours tracking, silently, with
 * their income entries apparently gone. The caller needs to tell the two apart so it
 * can leave the view as the user left it.
 *
 * Added alongside `getComplianceMode` rather than replacing it, because
 * `.kiro/steering/data-migration-standards.md` is explicit that `complianceMode`
 * must not be tidied before W7b. Both disappear together when ADR-0004's unified
 * compliance view removes the hours/income fork.
 */
export async function getStoredComplianceMode(
  userId: string,
  month: string,
): Promise<"hours" | "income" | undefined> {
  const mode = await db.complianceModes.where({ userId, month }).first();

  return mode?.mode;
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
