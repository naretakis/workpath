import { db } from "@/lib/db";
import { getDocumentsByActivity, deleteDocument } from "./documents";

/**
 * Delete an activity and all its associated documents
 * @param activityId - ID of the activity to delete
 */
export async function deleteActivityWithDocuments(
  activityId: number,
): Promise<void> {
  try {
    // Get all documents associated with this activity
    const documents = await getDocumentsByActivity(activityId);

    // Delete each document (this also deletes the blob)
    for (const doc of documents) {
      if (doc.id) {
        await deleteDocument(doc.id);
      }
    }

    // Delete the activity itself
    await db.activities.delete(activityId);
  } catch (error) {
    console.error("Error deleting activity with documents:", error);
    throw error;
  }
}

/**
 * Clean up orphaned documents (documents whose activities no longer exist)
 * @returns Number of orphaned documents deleted
 */
export async function cleanupOrphanedDocuments(): Promise<number> {
  try {
    // Get all documents
    const allDocuments = await db.documents.toArray();

    // Get all activity IDs
    const allActivities = await db.activities.toArray();
    const activityIds = new Set(
      allActivities
        .map((a) => a.id)
        .filter((id): id is number => id !== undefined),
    );

    // Find orphaned documents
    const orphanedDocuments = allDocuments.filter(
      (doc) => !activityIds.has(doc.activityId),
    );

    // Delete orphaned documents
    for (const doc of orphanedDocuments) {
      if (doc.id) {
        await deleteDocument(doc.id);
      }
    }

    return orphanedDocuments.length;
  } catch (error) {
    console.error("Error cleaning up orphaned documents:", error);
    throw error;
  }
}
