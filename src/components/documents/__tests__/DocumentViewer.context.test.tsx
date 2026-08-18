/**
 * W0 § 0.3.1 — `DocumentViewer` must resolve against the table its caller names.
 *
 * `src/lib/storage/__tests__/documentAccess.test.ts` proves the DISPATCH is
 * correct. It cannot prove this component actually threads `context` into it — a
 * viewer that accepted the prop and ignored it would leave that suite green. This
 * file closes that gap, which is the whole distance between "the seam works" and
 * "the bug is fixed".
 *
 * ## Why this needs a stub, and what that costs
 *
 * The load path calls `URL.createObjectURL`, which jsdom does not implement, and
 * `fake-indexeddb` returns a stored `Blob` as a plain empty object (probed
 * 2026-08-17), so there is nothing real to pass it. Both are stubbed.
 *
 * Stated plainly so the criterion is not over-read: this asserts that the
 * component reads and deletes from the correct TABLE, and that it renders the
 * correct document's metadata. It does not assert that a real photograph appears
 * on screen — the image element's `src` is a stub value. Rendering an actual
 * captured image stays a manual check (ADR-0007 Tier 4,
 * `src/lib/utils/TESTING.md`).
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
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { db } from "@/lib/db";
import { DocumentViewer } from "@/components/documents/DocumentViewer";

/** Same explicit-id collision the dispatch test uses. */
const COLLIDING_ID = 7;

beforeEach(async () => {
  await Promise.all([
    db.documents.clear(),
    db.documentBlobs.clear(),
    db.incomeDocuments.clear(),
    db.incomeDocumentBlobs.clear(),
  ]);

  // jsdom implements none of the three things this component's render path needs.
  // Without them the load path throws and the component renders its generic
  // "Failed to load document" error, which would make every assertion below pass
  // or fail for the wrong reason.
  //
  // Each stub is a piece of reality this test does not exercise, so they are named
  // rather than buried:
  //   - createObjectURL / revokeObjectURL: absent from jsdom, and there is no real
  //     Blob to hand them anyway (fake-indexeddb returns a plain object).
  //   - ResizeObserver: required by react-zoom-pan-pinch's TransformWrapper, which
  //     wraps the image. Absent from jsdom; without it the whole subtree throws.
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:stub"),
    revokeObjectURL: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  await db.documentBlobs.put({
    id: COLLIDING_ID,
    blob: new Blob(["activity"], { type: "image/jpeg" }),
    createdAt: new Date("2026-01-01T00:00:00"),
  });
  await db.documents.put({
    id: COLLIDING_ID,
    activityId: 1,
    blobId: COLLIDING_ID,
    type: "volunteer-verification",
    description: "ACTIVITY DOCUMENT",
    fileSize: 100,
    mimeType: "image/jpeg",
    captureMethod: "camera",
    createdAt: new Date("2026-01-01T00:00:00"),
  });

  await db.incomeDocumentBlobs.put({
    id: COLLIDING_ID,
    blob: new Blob(["income"], { type: "image/jpeg" }),
    createdAt: new Date("2026-02-02T00:00:00"),
  });
  await db.incomeDocuments.put({
    id: COLLIDING_ID,
    incomeEntryId: 1,
    blobId: COLLIDING_ID,
    type: "pay_stub",
    description: "INCOME DOCUMENT",
    fileSize: 100,
    mimeType: "image/jpeg",
    captureMethod: "camera",
    createdAt: new Date("2026-02-02T00:00:00"),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(async () => {
  db.close();
});

describe("DocumentViewer threads `context` through to the storage layer", () => {
  it('context="income" renders the income document, not the activity document sharing its id', async () => {
    render(
      <DocumentViewer
        documentId={COLLIDING_ID}
        context="income"
        onClose={() => {}}
      />,
    );

    expect(await screen.findByText("INCOME DOCUMENT")).toBeInTheDocument();
    expect(screen.queryByText("ACTIVITY DOCUMENT")).not.toBeInTheDocument();
  });

  it('context="activity" renders the activity document for the same id', async () => {
    render(
      <DocumentViewer
        documentId={COLLIDING_ID}
        context="activity"
        onClose={() => {}}
      />,
    );

    expect(await screen.findByText("ACTIVITY DOCUMENT")).toBeInTheDocument();
    expect(screen.queryByText("INCOME DOCUMENT")).not.toBeInTheDocument();
  });

  it("labels an income document type as words, not as the raw underscored key", async () => {
    // Before the fix an income document never resolved, so DOCUMENT_TYPE_LABELS
    // was never consulted for its keys. Now that it renders, an unlabelled
    // fallback would print "pay_stub".
    render(
      <DocumentViewer
        documentId={COLLIDING_ID}
        context="income"
        onClose={() => {}}
      />,
    );

    await screen.findByText("INCOME DOCUMENT");
    expect(screen.getByText("Pay Stub")).toBeInTheDocument();
    expect(screen.queryByText("pay_stub")).not.toBeInTheDocument();
  });

  it("reports not-found rather than showing the other table's document when the id is absent", async () => {
    await db.incomeDocuments.clear();

    render(
      <DocumentViewer
        documentId={COLLIDING_ID}
        context="income"
        onClose={() => {}}
      />,
    );

    expect(await screen.findByText("Document not found")).toBeInTheDocument();
    // The activity document with the same id is still there and must not surface.
    expect(screen.queryByText("ACTIVITY DOCUMENT")).not.toBeInTheDocument();
  });
});

/**
 * Walk the two-step delete: the first Delete reveals a confirmation, the second
 * performs it.
 *
 * Both buttons are labelled exactly "Delete" and the states are distinguished only
 * by a warning Alert appearing — so the helper waits on the Alert's text rather
 * than on a button name, which is the only thing that actually differs.
 *
 * Worth noting for W10: two different destructive actions sharing one accessible
 * name, told apart by adjacent prose, is a real usability problem for anyone
 * navigating by button list. Out of scope here; § 0.3 is data loss only.
 */
async function confirmDelete() {
  fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
  await screen.findByText(/delete this document permanently\?/i);
  fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
}

describe("DocumentViewer deletion is scoped to the named context", () => {
  it('context="income" delete destroys the income document and spares the activity document', async () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();

    render(
      <DocumentViewer
        documentId={COLLIDING_ID}
        context="income"
        onClose={onClose}
        onDelete={onDelete}
      />,
    );
    await screen.findByText("INCOME DOCUMENT");

    await confirmDelete();

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(COLLIDING_ID));

    expect(await db.incomeDocuments.get(COLLIDING_ID)).toBeUndefined();
    expect(await db.incomeDocumentBlobs.get(COLLIDING_ID)).toBeUndefined();

    // THE ASSERTION THIS WHOLE FIX EXISTS FOR.
    const survivor = await db.documents.get(COLLIDING_ID);
    expect(survivor?.description).toBe("ACTIVITY DOCUMENT");
    expect(await db.documentBlobs.get(COLLIDING_ID)).toBeDefined();
  });

  it('context="activity" delete destroys the activity document and spares the income document', async () => {
    const onDelete = vi.fn();

    render(
      <DocumentViewer
        documentId={COLLIDING_ID}
        context="activity"
        onClose={() => {}}
        onDelete={onDelete}
      />,
    );
    await screen.findByText("ACTIVITY DOCUMENT");

    await confirmDelete();

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(COLLIDING_ID));

    expect(await db.documents.get(COLLIDING_ID)).toBeUndefined();
    expect(await db.documentBlobs.get(COLLIDING_ID)).toBeUndefined();

    const survivor = await db.incomeDocuments.get(COLLIDING_ID);
    expect(survivor?.description).toBe("INCOME DOCUMENT");
    expect(await db.incomeDocumentBlobs.get(COLLIDING_ID)).toBeDefined();
  });
});
