/**
 * W0 § 0.3.2 — deleting an income entry orphaned its documents and their blobs.
 *
 * Written BEFORE the fix. `deleteIncomeEntry` is a bare
 * `db.incomeEntries.delete(id)` (`src/lib/storage/income.ts:41-43`), while the
 * activity side has `deleteActivityWithDocuments`
 * (`src/lib/storage/activities.ts:9-44`) which cascades. The asymmetry means an
 * income entry's pay stubs and their image blobs stay in IndexedDB forever, with
 * a dangling `incomeEntryId`.
 *
 * `.kiro/steering/data-migration-standards.md`: "Deletes cascade explicitly...
 * name the dependents and remove them, or deliberately orphan them with a comment
 * saying why. Orphaned blobs are invisible and unbounded." There is also no income
 * counterpart to `cleanupOrphanedDocuments`, so nothing ever reclaims them —
 * blobs are the largest rows in the database and the user's storage quota is what
 * eventually breaks.
 *
 * ## The existing behaviour is pinned, not replaced
 *
 * `income.characterization.test.ts` pins that `deleteIncomeEntry` removes only the
 * entry row. That stays true: this wave ADDS a cascading function rather than
 * changing the narrow one, exactly as the activity side is arranged. Both tests
 * are correct simultaneously, and that is deliberate — silently making an existing
 * function destructive to related tables is how a caller gets surprised.
 */

import "fake-indexeddb/auto";

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
  vi,
} from "vitest";

import { db } from "@/lib/db";
import {
  saveIncomeEntry,
  deleteIncomeEntryWithDocuments,
} from "@/lib/storage/income";
import { calculateMonthlyEquivalent } from "@/lib/utils/payPeriodConversion";
import type { IncomeEntry } from "@/types/income";

const USER = "user-1";

function entryFixture(
  date: string,
  amount: number,
  payPeriod: IncomeEntry["payPeriod"] = "monthly",
): Omit<IncomeEntry, "id" | "createdAt" | "updatedAt"> {
  return {
    userId: USER,
    date,
    amount,
    payPeriod,
    monthlyEquivalent: calculateMonthlyEquivalent(amount, payPeriod),
  };
}

/** Attach `count` documents (each with its own blob) to an income entry. */
async function attachDocuments(incomeEntryId: number, count: number) {
  const ids: Array<{ documentId: number; blobId: number }> = [];
  for (let i = 0; i < count; i++) {
    const blobId = (await db.incomeDocumentBlobs.add({
      blob: new Blob([`stub-${incomeEntryId}-${i}`], { type: "image/jpeg" }),
      createdAt: new Date(),
    })) as number;
    const documentId = (await db.incomeDocuments.add({
      incomeEntryId,
      blobId,
      type: "pay_stub",
      description: `doc ${i} for entry ${incomeEntryId}`,
      fileSize: 10,
      mimeType: "image/jpeg",
      captureMethod: "camera",
      createdAt: new Date(),
    })) as number;
    ids.push({ documentId, blobId });
  }
  return ids;
}

beforeEach(async () => {
  await Promise.all([
    db.incomeEntries.clear(),
    db.incomeDocuments.clear(),
    db.incomeDocumentBlobs.clear(),
  ]);
});

afterEach(() => {
  // A test that FAILS never reaches its own spy.mockRestore(), so a throw-stub
  // would survive into the next test and report one real failure as two.
  vi.restoreAllMocks();
});

afterAll(async () => {
  db.close();
});

describe("deleteIncomeEntryWithDocuments cascades to documents and blobs", () => {
  it("removes the entry, all its documents, and all their blobs", async () => {
    const id = (await saveIncomeEntry(
      entryFixture("2026-07-10", 400),
    )) as number;
    await attachDocuments(id, 3);

    expect(await db.incomeDocuments.count()).toBe(3);
    expect(await db.incomeDocumentBlobs.count()).toBe(3);

    await deleteIncomeEntryWithDocuments(id);

    expect(await db.incomeEntries.get(id)).toBeUndefined();
    expect(await db.incomeDocuments.count()).toBe(0);
    expect(await db.incomeDocumentBlobs.count()).toBe(0);
  });

  it("leaves another entry's documents and blobs untouched", async () => {
    const doomed = (await saveIncomeEntry(
      entryFixture("2026-07-10", 400),
    )) as number;
    const keeper = (await saveIncomeEntry(
      entryFixture("2026-07-20", 500),
    )) as number;
    await attachDocuments(doomed, 2);
    const keeperDocs = await attachDocuments(keeper, 2);

    await deleteIncomeEntryWithDocuments(doomed);

    expect(await db.incomeEntries.get(keeper)).toBeDefined();
    expect(
      await db.incomeDocuments.where({ incomeEntryId: keeper }).count(),
    ).toBe(2);
    for (const { blobId } of keeperDocs) {
      expect(await db.incomeDocumentBlobs.get(blobId)).toBeDefined();
    }
  });

  it("succeeds on an entry that has no documents", async () => {
    const id = (await saveIncomeEntry(
      entryFixture("2026-07-10", 400),
    )) as number;

    await deleteIncomeEntryWithDocuments(id);

    expect(await db.incomeEntries.get(id)).toBeUndefined();
  });

  it("does not touch ACTIVITY documents, which live in different tables", async () => {
    // The § 0.3.1 collision, from the other direction: an activity document may
    // share an id with an income document, so a cascade that reached the wrong
    // table would destroy unrelated evidence.
    const id = (await saveIncomeEntry(
      entryFixture("2026-07-10", 400),
    )) as number;
    const incomeDocs = await attachDocuments(id, 1);

    await db.documentBlobs.put({
      id: incomeDocs[0].blobId,
      blob: new Blob(["activity"], { type: "image/jpeg" }),
      createdAt: new Date(),
    });
    await db.documents.put({
      id: incomeDocs[0].documentId,
      activityId: 99,
      blobId: incomeDocs[0].blobId,
      type: "pay-stub",
      description: "ACTIVITY DOCUMENT",
      fileSize: 10,
      mimeType: "image/jpeg",
      captureMethod: "camera",
      createdAt: new Date(),
    });

    await deleteIncomeEntryWithDocuments(id);

    expect(
      (await db.documents.get(incomeDocs[0].documentId))?.description,
    ).toBe("ACTIVITY DOCUMENT");
    expect(await db.documentBlobs.get(incomeDocs[0].blobId)).toBeDefined();

    await db.documents.clear();
    await db.documentBlobs.clear();
  });
});

describe("deleteIncomeEntryWithDocuments preserves the entry when a document cannot be removed", () => {
  it("throws and leaves the entry in place, so the user can retry rather than losing the record silently", async () => {
    // Mirrors deleteActivityWithDocuments' contract: if a dependent fails, the
    // parent is NOT deleted. The alternative — delete the entry anyway — would
    // leave the user with orphaned pay stubs and no entry to reach them from,
    // which is worse than a visible failure.
    const id = (await saveIncomeEntry(
      entryFixture("2026-07-10", 400),
    )) as number;
    await attachDocuments(id, 2);

    const original = db.incomeDocumentBlobs.delete.bind(db.incomeDocumentBlobs);
    const spy = vi
      .spyOn(db.incomeDocumentBlobs, "delete")
      .mockImplementationOnce(() => {
        throw new Error("simulated blob delete failure");
      });

    await expect(deleteIncomeEntryWithDocuments(id)).rejects.toThrow();

    // The entry survives, so the documents remain reachable through the UI.
    expect(await db.incomeEntries.get(id)).toBeDefined();

    spy.mockRestore();
    void original;
  });

  it("reports how many documents failed, rather than failing silently", async () => {
    const id = (await saveIncomeEntry(
      entryFixture("2026-07-10", 400),
    )) as number;
    await attachDocuments(id, 2);

    const spy = vi
      .spyOn(db.incomeDocumentBlobs, "delete")
      .mockImplementation(() => {
        throw new Error("simulated blob delete failure");
      });

    await expect(deleteIncomeEntryWithDocuments(id)).rejects.toThrow(/2/);

    spy.mockRestore();
  });
});

describe("there is no narrow income-entry delete left to pick by mistake", () => {
  it("the storage module exports exactly one way to delete an income entry", async () => {
    // The original plan was to keep `deleteIncomeEntry` alongside a cascading
    // sibling, on the assumption that the activity side did the same. It does not:
    // `activities.ts` exports only `deleteActivityWithDocuments` and keeps its bare
    // `db.activities.delete` internal.
    //
    // So the narrow export was removed. It was a trap rather than an option — same
    // single-number argument, reads as the obvious choice, and silently orphans
    // blobs that nothing reclaims. Asserted mechanically so it cannot creep back:
    // a future contributor adding `deleteIncomeEntry` for convenience turns this
    // red.
    const incomeModule = await import("@/lib/storage/income");

    const deleters = Object.keys(incomeModule).filter((name) =>
      /^delete/.test(name),
    );

    expect(deleters).toEqual(["deleteIncomeEntryWithDocuments"]);
  });

  it("mirrors the activity module, which also exposes only a cascading delete", async () => {
    const activityModule = await import("@/lib/storage/activities");

    const deleters = Object.keys(activityModule).filter((name) =>
      /^delete/.test(name),
    );

    expect(deleters).toEqual(["deleteActivityWithDocuments"]);
  });
});
