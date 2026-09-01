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

  /**
   * Stable identity for the id set. W0 § 0.6.
   *
   * The dependency array used to be `[activityIds, activityIdsKey]`, and the array
   * was the problem. `ActivityList.tsx` derives it fresh on every render, so its
   * reference changed every time — and the effect ends with
   * `setCounts(new Map(...))`, which is a new object and so never bails out of
   * re-rendering. Effect -> setState -> render -> new array identity -> effect,
   * unbounded. Not merely one redundant query per render: a render loop, paced only
   * by how fast IndexedDB answers, on a device that is often an old phone.
   *
   * `react-hooks/exhaustive-deps` cannot catch this. The rule reports MISSING
   * dependencies; this array was over-specified, which satisfies it. Measured
   * against eslint-plugin-react-hooks 7.1.1 with inline disables ignored, this hook
   * raised nothing. The guard is `useActivityDocumentCounts.test.tsx`, which counts
   * queries across re-renders, because that is the only observable available.
   *
   * The effect now depends on this string alone and re-parses the ids from it, so
   * there is no array identity in the dependency list at all — no suppression
   * comment needed, and nothing for a future edit to reintroduce.
   */
  const activityIdsKey = activityIds.join(",");

  useEffect(() => {
    async function loadCounts() {
      const ids = activityIdsKey
        .split(",")
        .filter((part) => part !== "")
        .map(Number);

      if (ids.length === 0) {
        setCounts(new Map());
        return;
      }

      try {
        // Get all documents for the given activity IDs
        const documents = await db.documents
          .where("activityId")
          .anyOf(ids)
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
  }, [activityIdsKey]);

  return counts;
}
