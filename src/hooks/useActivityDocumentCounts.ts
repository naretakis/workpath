import { useState, useEffect } from "react";
import { db } from "@/lib/db";

/**
 * Hook to get document counts for multiple activities
 * @param activityIds - Array of activity IDs to get counts for
 * @returns Map of activity ID to document count
 */
export function useActivityDocumentCounts(
  activityIds: number[],
): Map<number, number> {
  const [counts, setCounts] = useState<Map<number, number>>(new Map());
  const activityIdsKey = activityIds.join(",");

  useEffect(() => {
    async function loadCounts() {
      if (activityIds.length === 0) {
        setCounts(new Map());
        return;
      }

      try {
        // Get all documents for the given activity IDs
        const documents = await db.documents
          .where("activityId")
          .anyOf(activityIds)
          .toArray();

        // Count documents per activity
        const countMap = new Map<number, number>();
        for (const doc of documents) {
          const currentCount = countMap.get(doc.activityId) || 0;
          countMap.set(doc.activityId, currentCount + 1);
        }

        setCounts(countMap);
      } catch (error) {
        console.error("Error loading document counts:", error);
        setCounts(new Map());
      }
    }

    loadCounts();
  }, [activityIds, activityIdsKey]); // Re-run when activity IDs change

  return counts;
}
