import { db } from "@/lib/db";
import {
  ExemptionScreening,
  ExemptionResponses,
  ExemptionResult,
  ExemptionHistory,
} from "@/types/exemptions";

/**
 * Save a completed exemption screening
 * @param userId - User profile ID
 * @param responses - User's responses to screening questions
 * @param result - Calculated exemption result
 * @returns The saved screening record with ID
 */
export async function saveScreening(
  userId: string,
  responses: ExemptionResponses,
  result: ExemptionResult,
): Promise<ExemptionScreening> {
  try {
    const screening: ExemptionScreening = {
      userId,
      screeningDate: new Date(),
      responses,
      result,
      version: 1, // Current screening logic version
    };

    const id = await db.exemptions.add(screening);
    return { ...screening, id };
  } catch (error) {
    console.error("Error saving exemption screening:", error);
    throw new Error("Failed to save exemption screening");
  }
}

/**
 * Get the most recent exemption screening for a user
 * @param userId - User profile ID
 * @returns The latest screening record, or undefined if none exists
 */
export async function getLatestScreening(
  userId: string,
): Promise<ExemptionScreening | undefined> {
  try {
    const screenings = await db.exemptions
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("screeningDate");

    return screenings[0];
  } catch (error) {
    console.error("Error getting latest screening:", error);
    throw new Error("Failed to retrieve exemption screening");
  }
}

/**
 * Get all historical exemption screenings for a user
 * @param userId - User profile ID
 * @returns Array of historical screening records, sorted by date (newest first)
 */
export async function getScreeningHistory(
  userId: string,
): Promise<ExemptionHistory[]> {
  try {
    const history = await db.exemptionHistory
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("screeningDate");

    return history;
  } catch (error) {
    console.error("Error getting screening history:", error);
    throw new Error("Failed to retrieve screening history");
  }
}

/**
 * Archive a screening to history and remove it from current screenings
 * Used when user re-screens
 * @param screeningId - ID of the screening to archive
 */
export async function archiveScreening(screeningId: number): Promise<void> {
  try {
    const screening = await db.exemptions.get(screeningId);

    if (!screening) {
      throw new Error("Screening not found");
    }

    // Add to history
    const historyRecord: ExemptionHistory = {
      userId: screening.userId,
      screeningDate: screening.screeningDate,
      isExempt: screening.result.isExempt,
      exemptionCategory: screening.result.exemptionCategory,
    };

    await db.exemptionHistory.add(historyRecord);

    // Remove from current screenings
    await db.exemptions.delete(screeningId);
  } catch (error) {
    console.error("Error archiving screening:", error);
    throw new Error("Failed to archive exemption screening");
  }
}
