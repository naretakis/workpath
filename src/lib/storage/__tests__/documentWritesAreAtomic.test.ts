/**
 * W0 § 0.6 — a failed document write left the blob behind.
 *
 * `saveDocument` and `saveIncomeDocument` both wrote the blob first and the metadata
 * row second, with no transaction. If the metadata write failed, the blob stayed in
 * IndexedDB with nothing pointing at it: invisible to the UI, uncounted by
 * `StorageInfo`, and unreachable by any delete path, because every delete starts
 * from the metadata row to find the `blobId`.
 *
 * Blobs are the largest rows in the database — photographs of pay stubs — and the
 * user's storage quota is finite. `.kiro/steering/data-migration-standards.md`:
 * "Orphaned blobs are invisible and unbounded."
 *
 * `cleanupOrphanedDocuments` exists for the activity side, but it scans
 * `db.documents` against `db.activities` — it finds documents whose ACTIVITY is
 * gone, not blobs whose DOCUMENT never existed. It cannot reach these. There is no
 * income counterpart at all.
 *
 * The fix is one Dexie transaction per save, so a metadata failure rolls the blob
 * back. Note this is genuinely different from the delete paths, which are
 * deliberately left non-transactional: a delete that fails partway is recoverable
 * because the parent row survives and the user can retry, whereas an orphaned blob
 * is unreachable by construction.
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
import { saveDocument } from "@/lib/storage/documents";
import { saveIncomeDocument } from "@/lib/storage/incomeDocuments";

const ACTIVITY_METADATA = {
  type: "pay-stub" as const,
  fileSize: 100,
  mimeType: "image/jpeg",
  captureMethod: "camera" as const,
};

const INCOME_METADATA = {
  type: "pay_stub" as const,
  fileSize: 100,
  mimeType: "image/jpeg" as const,
  captureMethod: "camera" as const,
};

beforeEach(async () => {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });

  // saveDocument checks navigator.storage.estimate() before writing; jsdom has no
  // Storage Manager, and without this the function throws before reaching the part
  // under test.
  vi.stubGlobal("navigator", {
    ...navigator,
    storage: {
      estimate: async () => ({ quota: 1_000_000_000, usage: 1_000_000 }),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

afterAll(async () => {
  db.close();
});

describe("saveDocument writes the blob and metadata atomically", () => {
  it("stores both on success", async () => {
    const id = await saveDocument(1, new Blob(["x"], { type: "image/jpeg" }), {
      ...ACTIVITY_METADATA,
    });

    expect(await db.documents.get(id)).toBeDefined();
    expect(await db.documentBlobs.count()).toBe(1);
  });

  it("leaves NO orphaned blob when the metadata write fails", async () => {
    // The whole point. Before the fix this left a blob nothing could reach.
    vi.spyOn(db.documents, "add").mockRejectedValue(
      new Error("simulated metadata write failure"),
    );

    await expect(
      saveDocument(1, new Blob(["x"], { type: "image/jpeg" }), {
        ...ACTIVITY_METADATA,
      }),
    ).rejects.toThrow();

    expect(await db.documentBlobs.count()).toBe(0);
    expect(await db.documents.count()).toBe(0);
  });

  it("leaves nothing behind across several failed attempts", async () => {
    // Orphans accumulate: a user retrying a flaky save three times used to leave
    // three unreachable blobs, each potentially several megabytes.
    vi.spyOn(db.documents, "add").mockRejectedValue(new Error("nope"));

    for (let i = 0; i < 3; i++) {
      await expect(
        saveDocument(1, new Blob([`x${i}`], { type: "image/jpeg" }), {
          ...ACTIVITY_METADATA,
        }),
      ).rejects.toThrow();
    }

    expect(await db.documentBlobs.count()).toBe(0);
  });

  it("does not roll back a previously saved document", async () => {
    // The transaction must scope to this save, not to everything in flight.
    const keeper = await saveDocument(
      1,
      new Blob(["keep"], { type: "image/jpeg" }),
      { ...ACTIVITY_METADATA },
    );

    vi.spyOn(db.documents, "add").mockRejectedValue(new Error("nope"));
    await expect(
      saveDocument(2, new Blob(["fail"], { type: "image/jpeg" }), {
        ...ACTIVITY_METADATA,
      }),
    ).rejects.toThrow();

    expect(await db.documents.get(keeper)).toBeDefined();
    expect(await db.documentBlobs.count()).toBe(1);
  });
});

describe("saveIncomeDocument writes the blob and metadata atomically", () => {
  it("stores both on success", async () => {
    const id = await saveIncomeDocument(
      1,
      new Blob(["x"], { type: "image/jpeg" }),
      { ...INCOME_METADATA },
    );

    expect(await db.incomeDocuments.get(id)).toBeDefined();
    expect(await db.incomeDocumentBlobs.count()).toBe(1);
  });

  it("leaves NO orphaned blob when the metadata write fails", async () => {
    // Worse on this side than the activity side: there is no income counterpart to
    // cleanupOrphanedDocuments, so nothing would ever reclaim these.
    vi.spyOn(db.incomeDocuments, "add").mockRejectedValue(
      new Error("simulated metadata write failure"),
    );

    await expect(
      saveIncomeDocument(1, new Blob(["x"], { type: "image/jpeg" }), {
        ...INCOME_METADATA,
      }),
    ).rejects.toThrow();

    expect(await db.incomeDocumentBlobs.count()).toBe(0);
    expect(await db.incomeDocuments.count()).toBe(0);
  });

  it("does not touch the ACTIVITY blob table when rolling back", async () => {
    // The two document families are separate tables — the § 0.3.1 collision from
    // the other direction. A rollback must not reach across.
    await db.documentBlobs.add({
      blob: new Blob(["activity"], { type: "image/jpeg" }),
      createdAt: new Date(),
    });

    vi.spyOn(db.incomeDocuments, "add").mockRejectedValue(new Error("nope"));
    await expect(
      saveIncomeDocument(1, new Blob(["x"], { type: "image/jpeg" }), {
        ...INCOME_METADATA,
      }),
    ).rejects.toThrow();

    expect(await db.documentBlobs.count()).toBe(1);
    expect(await db.incomeDocumentBlobs.count()).toBe(0);
  });
});

describe("the storage-quota guard still runs before anything is written", () => {
  it("refuses an oversized blob without creating a blob row", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      storage: {
        // Under the 50MB floor saveDocument requires.
        estimate: async () => ({ quota: 1_000_000, usage: 900_000 }),
      },
    });

    await expect(
      saveDocument(1, new Blob(["x"], { type: "image/jpeg" }), {
        ...ACTIVITY_METADATA,
      }),
    ).rejects.toThrow(/storage/i);

    expect(await db.documentBlobs.count()).toBe(0);
  });
});
