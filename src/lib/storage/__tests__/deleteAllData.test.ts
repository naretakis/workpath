/**
 * W0 § 0.5 — the app promises deletion in two places and did not have it.
 *
 * "Export or delete anytime" appears in `PrivacyNotice.tsx:71`, which a user must
 * accept before onboarding, and again in `settings/PrivacyPolicy.tsx:77`. Neither
 * was true: nothing in the codebase deleted a user's data. An unmet promise inside
 * a privacy notice is the worst place to have one.
 *
 * ## Scope: everything, in both stores
 *
 * All 14 Dexie tables, plus localStorage and sessionStorage in full.
 *
 * Clearing the browser stores WHOLESALE rather than by a `hourkeep` prefix is
 * deliberate. The keys are inconsistent — `hourkeep-encryption-key` uses a hyphen,
 * `hourkeep_dashboard_guidance_dismissed` an underscore, and
 * `EdgeCaseExamples.tsx:163` writes `edge-cases-${activityType}` with no prefix at
 * all. A prefix sweep would have missed the last of those, so a "deleted" app
 * would still remember which help sections the user had expanded. HourKeep is the
 * only tenant of its origin, so there is nothing else in those stores to preserve.
 *
 * ## No Dexie version bump
 *
 * Clearing tables needs no schema change, so this adds no migration. W3 owns the
 * consolidated v7 (`.kiro/steering/data-migration-standards.md`).
 *
 * ## On the "export first" mitigation
 *
 * `wave-0-safety-net.md` § 0.5 suggests offering an export before deleting.
 * `gap-analysis.md:298` (gap 15.27) records that there is no IMPORT path, so an
 * export cannot restore anything — it is a printout, not a backup, and rating it a
 * recovery mitigation would be exactly the kind of unverified claim
 * `engineering-standards.md` exists to stop. The type-to-confirm gate is therefore
 * the only real protection here, and the copy must not imply otherwise.
 */

import "fake-indexeddb/auto";

import { describe, it, expect, beforeEach, afterAll } from "vitest";

import { db } from "@/lib/db";
import { deleteAllData } from "@/lib/storage/deleteAllData";

/** Put at least one row in every table, so "cleared" means something. */
async function seedEveryTable() {
  await db.profiles.put({
    id: "p1",
    name: "Test User",
    state: "CA",
    dateOfBirth: "1990-01-01",
    createdAt: new Date(),
    updatedAt: new Date(),
    privacyNoticeAcknowledged: true,
    privacyNoticeAcknowledgedAt: new Date(),
    version: 1,
  });
  await db.activities.add({
    date: "2026-07-01",
    type: "work",
    hours: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const blobId = (await db.documentBlobs.add({
    blob: new Blob(["x"], { type: "image/jpeg" }),
    createdAt: new Date(),
  })) as number;
  await db.documents.add({
    activityId: 1,
    blobId,
    type: "pay-stub",
    fileSize: 1,
    mimeType: "image/jpeg",
    captureMethod: "camera",
    createdAt: new Date(),
  });
  await db.exemptions.add({
    userId: "p1",
    screeningDate: new Date(),
    responses: {},
    result: { isExempt: false, explanation: "x", nextSteps: "y" },
  } as never);
  await db.exemptionHistory.add({
    userId: "p1",
    screeningDate: new Date(),
    isExempt: false,
  } as never);
  await db.incomeEntries.add({
    userId: "p1",
    date: "2026-07-10",
    amount: 400,
    payPeriod: "monthly",
    monthlyEquivalent: 400,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const incomeBlobId = (await db.incomeDocumentBlobs.add({
    blob: new Blob(["y"], { type: "image/jpeg" }),
    createdAt: new Date(),
  })) as number;
  await db.incomeDocuments.add({
    incomeEntryId: 1,
    blobId: incomeBlobId,
    type: "pay_stub",
    fileSize: 1,
    mimeType: "image/jpeg",
    captureMethod: "camera",
    createdAt: new Date(),
  });
  await db.complianceModes.add({
    userId: "p1",
    month: "2026-07",
    mode: "hours",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.seasonalWorkerStatus.add({
    userId: "p1",
    month: "2026-07",
    isSeasonalWorker: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.assessmentProgress.add({
    userId: "p1",
    currentStep: "notice",
    responses: {},
    lastUpdatedAt: new Date(),
  } as never);
  await db.assessmentResults.add({
    userId: "p1",
    completedAt: new Date(),
    responses: { exemption: {} },
    recommendation: {
      primaryMethod: "hour-tracking",
      reasoning: "x",
      alternativeMethods: [],
      complianceStatus: "needs-increase",
      estimatedEffort: "high",
    },
    version: 1,
  } as never);
  await db.assessmentHistory.add({
    userId: "p1",
    completedAt: new Date(),
    exemptionStatus: false,
    recommendedMethod: "hour-tracking",
  });
}

beforeEach(async () => {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(async () => {
  db.close();
});

describe("deleteAllData clears every Dexie table", () => {
  it("the fixture really does populate all 14 tables, or the test below proves nothing", async () => {
    // A negative assertion is only as good as its precondition. If a table were
    // missed here, "everything is empty afterwards" would be trivially true for it.
    await seedEveryTable();

    const populated = await Promise.all(
      db.tables.map(async (t) => ({ name: t.name, count: await t.count() })),
    );
    const empty = populated.filter((t) => t.count === 0).map((t) => t.name);

    expect(db.tables).toHaveLength(14);
    expect(empty).toEqual([]);
  });

  it("leaves every table empty", async () => {
    await seedEveryTable();

    await deleteAllData();

    const remaining = await Promise.all(
      db.tables.map(async (t) => ({ name: t.name, count: await t.count() })),
    );
    expect(remaining.filter((t) => t.count > 0)).toEqual([]);
  });

  it("removes document and income blobs, which are the largest rows", async () => {
    await seedEveryTable();

    await deleteAllData();

    expect(await db.documentBlobs.count()).toBe(0);
    expect(await db.incomeDocumentBlobs.count()).toBe(0);
  });

  it("does not delete or downgrade the database itself", async () => {
    // Clearing rows rather than calling db.delete() means no schema change and no
    // migration replay, which is why W0 bumps no Dexie version. The database must
    // still be open and at the same version afterwards.
    await seedEveryTable();
    const versionBefore = db.verno;

    await deleteAllData();

    expect(db.isOpen()).toBe(true);
    expect(db.verno).toBe(versionBefore);
    expect(db.tables).toHaveLength(14);
  });

  it("is safe to call on an already-empty database", async () => {
    await expect(deleteAllData()).resolves.toBeUndefined();
    expect(await db.profiles.count()).toBe(0);
  });

  it("is idempotent", async () => {
    await seedEveryTable();

    await deleteAllData();
    await deleteAllData();

    const remaining = await Promise.all(db.tables.map((t) => t.count()));
    expect(remaining.reduce((a, b) => a + b, 0)).toBe(0);
  });

  it("leaves the app able to write again straight away", async () => {
    // A cleared database that cannot accept a new profile is not a fresh start,
    // it is a broken app. The user is sent to onboarding immediately after.
    await seedEveryTable();
    await deleteAllData();

    await db.profiles.put({
      id: "p2",
      name: "Fresh",
      state: "NY",
      dateOfBirth: "1991-02-02",
      createdAt: new Date(),
      updatedAt: new Date(),
      privacyNoticeAcknowledged: true,
      privacyNoticeAcknowledgedAt: new Date(),
      version: 1,
    });

    expect(await db.profiles.count()).toBe(1);
  });
});

describe("deleteAllData clears browser storage too", () => {
  it("removes the encryption key, so ciphertext left anywhere is unreadable", async () => {
    // src/lib/utils/encryption.ts:10 — "hourkeep-encryption-key". Leaving it
    // behind after a deletion would be the one fragment that still links a new
    // install to the old data.
    localStorage.setItem("hourkeep-encryption-key", "secret-material");

    await deleteAllData();

    expect(localStorage.getItem("hourkeep-encryption-key")).toBeNull();
  });

  it("removes the dashboard guidance flags from both localStorage and sessionStorage", async () => {
    localStorage.setItem("hourkeep_dashboard_guidance_dismissed", "true");
    sessionStorage.setItem("hourkeep_dashboard_guidance_collapsed", "true");

    await deleteAllData();

    expect(
      localStorage.getItem("hourkeep_dashboard_guidance_dismissed"),
    ).toBeNull();
    expect(
      sessionStorage.getItem("hourkeep_dashboard_guidance_collapsed"),
    ).toBeNull();
  });

  it("removes keys that carry no hourkeep prefix, which a prefix sweep would have missed", async () => {
    // EdgeCaseExamples.tsx:163 writes `edge-cases-${activityType}`. This is the
    // case that decided the wholesale approach.
    sessionStorage.setItem("edge-cases-work", "true");
    sessionStorage.setItem("edge-cases-volunteer", "false");

    await deleteAllData();

    expect(sessionStorage.length).toBe(0);
  });

  it("empties both stores completely", async () => {
    localStorage.setItem("a", "1");
    localStorage.setItem("b", "2");
    sessionStorage.setItem("c", "3");

    await deleteAllData();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
