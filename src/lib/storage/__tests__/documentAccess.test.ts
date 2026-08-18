/**
 * W0 § 0.3.1 — DocumentViewer resolved income document IDs against activity tables
 *
 * Written BEFORE the fix, per the Tier-1 obligation in
 * `.kiro/steering/engineering-standards.md` and ADR-0007. `DocumentViewer` is not
 * itself one of the five named Tier-1 modules, but the bug destroys a user's
 * evidence, and evidence is what the user hands the agency to keep their coverage
 * (42 CFR 435.557). Failing test first.
 *
 * ## The bug
 *
 * `db.documents` and `db.incomeDocuments` are separate object stores with
 * independent `++id` sequences (`src/lib/db.ts` v6, lines 124 and 129), so
 * activity document 3 and income document 3 both exist and both are "3".
 *
 * `IncomeEntryForm.tsx:775` passed ids loaded by `getDocumentsByIncomeEntry`
 * (i.e. from `db.incomeDocuments`) into `DocumentViewer`, which imported
 * `getDocument` / `getDocumentBlob` / `deleteDocument` from
 * `@/lib/storage/documents` — the ACTIVITY module — at lines 27-31 and had no
 * discriminating prop.
 *
 * Two distinct failure modes, and only the second is silent:
 *
 *  - **No collision:** the activity lookup misses and the viewer renders
 *    "Document not found". Visible, annoying, harmless.
 *  - **Collision:** the viewer shows an unrelated document, and Delete destroys
 *    THAT one. The income document survives and reappears on reload, so the user
 *    sees the delete "fail" while a pay stub for a different month is gone.
 *    Because both sequences start at 1, collision is the common case.
 *
 * ## Why the fix is a storage-layer seam rather than a switch in the component
 *
 * A `switch (context)` inside `DocumentViewer` would be smaller, but the only way
 * to test it is to render the dialog — and the render path calls
 * `URL.createObjectURL`, which jsdom does not implement. An acceptance criterion
 * has to name something runnable (`engineering-standards.md`), so the dispatch is
 * lifted into `src/lib/storage/documentAccess.ts` where it can be called directly.
 * This also keeps `component-standards.md`'s rule intact: components reach Dexie
 * only through `src/lib/storage/`.
 *
 * The prop is REQUIRED, not optional with an "activity" default. An optional
 * discriminator that defaults silently is how this bug class starts, and both call
 * sites are ours to update.
 */

import "fake-indexeddb/auto";

import { describe, it, expect, beforeEach, afterAll } from "vitest";

import { db } from "@/lib/db";
import {
  getDocumentAccessor,
  DOCUMENT_CONTEXTS,
  type DocumentContext,
} from "@/lib/storage/documentAccess";

/**
 * ## Two harness facts this file had to be rewritten around
 *
 * **1. `fake-indexeddb` does not preserve `Blob`.** Probed 2026-08-17: a `Blob`
 * written and read back arrives as a plain `Object` — `constructor.name` is
 * `"Object"`, `instanceof Blob` is `false`, `size`, `type`, `text()` and
 * `arrayBuffer()` are all absent, and it has zero enumerable keys. So a test that
 * asserts on blob CONTENT under this harness asserts on nothing.
 *
 * > **Carry this to W3.** `.kiro/steering/data-migration-standards.md` requires
 * > the v6 -> v7 migration test to assert that "blobs survived". Under
 * > `fake-indexeddb` that can only mean "the row is still reachable and its
 * > `blobId` still resolves" — it cannot mean the bytes are intact. W3 should
 * > state that limit rather than claim coverage it does not have, and confirm
 * > real blob survival by hand in DevTools -> Application -> IndexedDB.
 *
 * Blobs here are therefore distinguished by their sibling `createdAt` field, which
 * does round-trip, rather than by their contents.
 *
 * **2. `clear()` does not reset the autoincrement counter.** Ids keep advancing
 * across tests, and the two tables advance independently, so a test that seeds one
 * table more often than the other silently stops colliding. The first version of
 * this file hardcoded id `1` and produced four failures for that reason. Seeds now
 * take an EXPLICIT id, so the collision is constructed rather than hoped for.
 */

/** A fixed id used by every collision test, written explicitly into both tables. */
const COLLIDING_ID = 42;
const ACTIVITY_BLOB_AT = new Date("2026-01-01T00:00:00");
const INCOME_BLOB_AT = new Date("2026-02-02T00:00:00");

/** Seed one activity document at an explicit id, with a matching blob id. */
async function seedActivityDocument(
  description: string,
  id: number = COLLIDING_ID,
) {
  await db.documentBlobs.put({
    id,
    blob: new Blob([`activity:${description}`], { type: "image/jpeg" }),
    createdAt: ACTIVITY_BLOB_AT,
  });
  await db.documents.put({
    id,
    activityId: 1,
    blobId: id,
    type: "pay-stub",
    description,
    fileSize: 100,
    mimeType: "image/jpeg",
    captureMethod: "camera",
    createdAt: new Date("2026-01-01T00:00:00"),
  });
  return { id, blobId: id };
}

/** Seed one income document at an explicit id, with a matching blob id. */
async function seedIncomeDocument(
  description: string,
  id: number = COLLIDING_ID,
) {
  await db.incomeDocumentBlobs.put({
    id,
    blob: new Blob([`income:${description}`], { type: "image/jpeg" }),
    createdAt: INCOME_BLOB_AT,
  });
  await db.incomeDocuments.put({
    id,
    incomeEntryId: 1,
    blobId: id,
    type: "pay_stub",
    description,
    fileSize: 100,
    mimeType: "image/jpeg",
    captureMethod: "camera",
    createdAt: new Date("2026-02-02T00:00:00"),
  });
  return { id, blobId: id };
}

beforeEach(async () => {
  await Promise.all([
    db.documents.clear(),
    db.documentBlobs.clear(),
    db.incomeDocuments.clear(),
    db.incomeDocumentBlobs.clear(),
  ]);
});

afterAll(async () => {
  db.close();
});

describe("the collision this fix exists for is real, not theoretical", () => {
  it("both tables accept the same numeric id, holding different documents", async () => {
    const activity = await seedActivityDocument("activity doc");
    const income = await seedIncomeDocument("income doc");

    // The precondition that turns a mismatched lookup from a harmless "not found"
    // into "someone else's document, and Delete destroys it".
    expect(activity.id).toBe(income.id);
    expect((await db.documents.get(COLLIDING_ID))?.description).toBe(
      "activity doc",
    );
    expect((await db.incomeDocuments.get(COLLIDING_ID))?.description).toBe(
      "income doc",
    );
  });

  it("both sequences start at 1 on a fresh database, so collision is the common case", async () => {
    // Asserted on autoincrement rather than on the explicit ids used elsewhere,
    // because "the ids happen to collide" is the part of the bug that makes it
    // destructive in practice rather than merely possible.
    const activityId = await db.documents.add({
      activityId: 1,
      blobId: 1,
      type: "pay-stub",
      fileSize: 1,
      mimeType: "image/jpeg",
      captureMethod: "camera",
      createdAt: new Date(),
    });
    const incomeId = await db.incomeDocuments.add({
      incomeEntryId: 1,
      blobId: 1,
      type: "pay_stub",
      fileSize: 1,
      mimeType: "image/jpeg",
      captureMethod: "camera",
      createdAt: new Date(),
    });

    expect(activityId).toBe(incomeId);
  });
});

describe("getDocumentAccessor: metadata reads are scoped to the right table", () => {
  it("income context resolves an income document id to the income document", async () => {
    await seedActivityDocument("activity doc");
    const income = await seedIncomeDocument("income doc");

    const found = await getDocumentAccessor("income").getMetadata(income.id);

    expect(found?.description).toBe("income doc");
  });

  it("activity context resolves the same id to the activity document", async () => {
    const activity = await seedActivityDocument("activity doc");
    await seedIncomeDocument("income doc");

    const found = await getDocumentAccessor("activity").getMetadata(
      activity.id,
    );

    expect(found?.description).toBe("activity doc");
  });

  it("the two contexts return DIFFERENT documents for the same id", async () => {
    await seedActivityDocument("activity doc");
    await seedIncomeDocument("income doc");

    const viaActivity =
      await getDocumentAccessor("activity").getMetadata(COLLIDING_ID);
    const viaIncome =
      await getDocumentAccessor("income").getMetadata(COLLIDING_ID);

    expect(viaActivity?.description).toBe("activity doc");
    expect(viaIncome?.description).toBe("income doc");
    expect(viaActivity?.description).not.toBe(viaIncome?.description);
  });

  it("returns undefined rather than throwing when the id is absent from that table", async () => {
    await seedIncomeDocument("income doc");

    // The pre-fix "not found" path: an income id looked up as an activity when no
    // activity document happens to share it.
    expect(
      await getDocumentAccessor("activity").getMetadata(COLLIDING_ID),
    ).toBeUndefined();
  });
});

describe("getDocumentAccessor: blob reads are scoped to the right blob table", () => {
  // Discriminated by the row's `createdAt`, not by blob bytes — see the harness
  // note above. `fake-indexeddb` returns a Blob as a plain empty object, so
  // `.text()` does not exist and content assertions would be vacuous.

  it("income context reads the income blob row, not the activity row with the same id", async () => {
    const activity = await seedActivityDocument("activity doc");
    const income = await seedIncomeDocument("income doc");
    expect(activity.blobId).toBe(income.blobId);

    const row = await getDocumentAccessor("income").getBlob(income.blobId);

    expect((row as { createdAt?: Date } | undefined)?.createdAt).toEqual(
      INCOME_BLOB_AT,
    );
  });

  it("activity context reads the activity blob row for the same blob id", async () => {
    const activity = await seedActivityDocument("activity doc");
    await seedIncomeDocument("income doc");

    const row = await getDocumentAccessor("activity").getBlob(activity.blobId);

    expect((row as { createdAt?: Date } | undefined)?.createdAt).toEqual(
      ACTIVITY_BLOB_AT,
    );
  });

  it("returns undefined for a blob id present in the OTHER table only", async () => {
    // The strongest form of "scoped to the right table": the id exists, just not
    // here. A shared-table implementation would return a row.
    await seedIncomeDocument("income doc");

    expect(
      await getDocumentAccessor("activity").getBlob(COLLIDING_ID),
    ).toBeUndefined();
  });

  it("returns undefined for a blob id absent from both tables", async () => {
    expect(await getDocumentAccessor("income").getBlob(9999)).toBeUndefined();
  });
});

describe("getDocumentAccessor: deletion destroys only the addressed document", () => {
  // The data-loss case. Every assertion here is about what SURVIVES.

  it("deleting through the income context leaves the colliding activity document intact", async () => {
    const activity = await seedActivityDocument("activity doc");
    const income = await seedIncomeDocument("income doc");

    await getDocumentAccessor("income").remove(income.id);

    expect(await db.incomeDocuments.get(income.id)).toBeUndefined();
    expect(await db.incomeDocumentBlobs.get(income.blobId)).toBeUndefined();

    // The document the old code would have destroyed.
    const survivor = await db.documents.get(activity.id);
    expect(survivor?.description).toBe("activity doc");
    expect(await db.documentBlobs.get(activity.blobId)).toBeDefined();
  });

  it("deleting through the activity context leaves the colliding income document intact", async () => {
    const activity = await seedActivityDocument("activity doc");
    const income = await seedIncomeDocument("income doc");

    await getDocumentAccessor("activity").remove(activity.id);

    expect(await db.documents.get(activity.id)).toBeUndefined();
    expect(await db.documentBlobs.get(activity.blobId)).toBeUndefined();

    const survivor = await db.incomeDocuments.get(income.id);
    expect(survivor?.description).toBe("income doc");
    expect(await db.incomeDocumentBlobs.get(income.blobId)).toBeDefined();
  });

  it("removes the blob as well as the metadata, so no orphan is left behind", async () => {
    // `.kiro/steering/data-migration-standards.md`: orphaned blobs are invisible
    // and unbounded, and there is no income counterpart to
    // `cleanupOrphanedDocuments`.
    const income = await seedIncomeDocument("income doc");

    await getDocumentAccessor("income").remove(income.id);

    expect(await db.incomeDocumentBlobs.count()).toBe(0);
    expect(await db.incomeDocuments.count()).toBe(0);
  });

  it("throws rather than silently succeeding when the document is absent", async () => {
    await expect(getDocumentAccessor("income").remove(9999)).rejects.toThrow();
  });

  it("throws when the id exists only in the OTHER table, rather than deleting from it", async () => {
    // The pre-fix destructive path, inverted into an assertion: an income id
    // handed to the activity context must NOT reach into the income tables.
    const income = await seedIncomeDocument("income doc");

    await expect(
      getDocumentAccessor("activity").remove(COLLIDING_ID),
    ).rejects.toThrow();

    expect((await db.incomeDocuments.get(income.id))?.description).toBe(
      "income doc",
    );
  });
});

describe("the context union is closed and exhaustively covered", () => {
  it("DOCUMENT_CONTEXTS lists exactly the two contexts", () => {
    expect([...DOCUMENT_CONTEXTS]).toEqual(["activity", "income"]);
  });

  it("every context returns a complete accessor, so a new context cannot ship half-wired", async () => {
    for (const context of DOCUMENT_CONTEXTS) {
      const accessor = getDocumentAccessor(context);

      expect(typeof accessor.getMetadata, context).toBe("function");
      expect(typeof accessor.getBlob, context).toBe("function");
      expect(typeof accessor.remove, context).toBe("function");
    }
  });

  it("every context is independently exercised against a live database", async () => {
    // Guards the shape of the sweep above: a `getDocumentAccessor` that returned
    // the same activity-backed accessor for both contexts would satisfy the
    // typeof checks. This one cannot.
    await seedActivityDocument("activity doc");
    await seedIncomeDocument("income doc");

    const results: Record<string, string | undefined> = {};
    for (const context of DOCUMENT_CONTEXTS) {
      results[context] = (
        await getDocumentAccessor(context).getMetadata(COLLIDING_ID)
      )?.description;
    }

    expect(results).toEqual({
      activity: "activity doc",
      income: "income doc",
    });
  });

  it("rejects an unknown context at runtime as well as in the type system", () => {
    expect(() => getDocumentAccessor("nonsense" as DocumentContext)).toThrow(
      /nonsense/,
    );
  });
});
