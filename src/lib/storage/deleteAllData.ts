/**
 * Delete everything HourKeep has stored about a user.
 *
 * Added by W0 § 0.5. The app promised this in two places and did not have it:
 * "Export or delete anytime" in `PrivacyNotice.tsx:71`, which the user must accept
 * before onboarding, and again in `settings/PrivacyPolicy.tsx:77`.
 *
 * There is no server and no backup, so this is the only place a user can exercise
 * that promise — and it is irreversible. `gap-analysis.md:298` (gap 15.27) records
 * that HourKeep has no IMPORT path, so an export is a printout rather than a
 * backup and cannot restore anything. The confirmation gate in the UI is the only
 * real protection; nothing here should be described as recoverable.
 */

import { db } from "@/lib/db";

/**
 * Clear all Dexie tables and both browser storages.
 *
 * **Clears rows; does not delete the database.** `db.delete()` would drop the
 * schema and force a migration replay on the next open. Clearing needs no schema
 * change, which is why W0 bumps no Dexie version — W3 owns the consolidated v7
 * (`.kiro/steering/data-migration-standards.md`).
 *
 * **One transaction over every table.** A partial clear would leave a user
 * half-deleted with no way to finish: orphaned documents and blobs with no profile
 * to reach them from. Verified to work across all 14 tables under `fake-indexeddb`.
 *
 * **Both browser stores are emptied wholesale**, not swept by prefix. The keys are
 * inconsistent — `hourkeep-encryption-key` (hyphen),
 * `hourkeep_dashboard_guidance_dismissed` (underscore), and
 * `edge-cases-${activityType}` from `EdgeCaseExamples.tsx:163` with no prefix at
 * all. A prefix sweep missed the last of those, so a "deleted" app still remembered
 * which help sections the user had expanded. HourKeep is the only tenant of its
 * origin, so there is nothing else in those stores worth keeping.
 *
 * Clearing the encryption key matters most: `dateOfBirth` and `medicaidId` are
 * stored encrypted, and leaving the key behind would be the one fragment still
 * linking a fresh install to the old data.
 *
 * Note the autoincrement counters are NOT reset by `clear()`, so a new record
 * starts from the old high-water mark. Harmless — ids are internal — and recorded
 * because it is surprising when reading IndexedDB after a reset.
 *
 * @throws If the transaction fails. Callers must surface that rather than
 *   reporting success, since a partial delete is the one outcome a user must know
 *   about.
 */
export async function deleteAllData(): Promise<void> {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });

  if (typeof window !== "undefined") {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
}
