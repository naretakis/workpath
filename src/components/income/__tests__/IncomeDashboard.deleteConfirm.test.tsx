/**
 * W0 § 0.3.2 — income deletion must ask before destroying evidence.
 *
 * The cascade itself is tested in
 * `src/lib/storage/__tests__/deleteIncomeEntryWithDocuments.test.ts`. This file
 * tests the GATE, which is the part that protects the user: before § 0.3.2 income
 * deletion had no confirmation on either of its two paths — the list's trash icon
 * and the form's Delete button — so a mis-tap destroyed an entry and, once the
 * cascade landed, its pay stubs too.
 *
 * Making the delete cascade without also adding a gate would have made this wave
 * strictly more destructive than the bug it fixed. That is why the two ship
 * together.
 *
 * The most important assertion here is the negative one: opening the dialog and
 * cancelling must leave everything in place. A confirmation that has already done
 * the work by the time it asks is not a confirmation.
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
import { IncomeDashboard } from "@/components/income/IncomeDashboard";

const USER = "user-1";
const MONTH = "2026-07";

async function seedEntryWithDocuments(documentCount: number) {
  const entryId = (await db.incomeEntries.add({
    userId: USER,
    date: `${MONTH}-10`,
    amount: 400,
    payPeriod: "monthly",
    monthlyEquivalent: 400,
    source: "Diner",
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as number;

  for (let i = 0; i < documentCount; i++) {
    const blobId = (await db.incomeDocumentBlobs.add({
      blob: new Blob([`stub-${i}`], { type: "image/jpeg" }),
      createdAt: new Date(),
    })) as number;
    await db.incomeDocuments.add({
      incomeEntryId: entryId,
      blobId,
      type: "pay_stub",
      fileSize: 10,
      mimeType: "image/jpeg",
      captureMethod: "camera",
      createdAt: new Date(),
    });
  }

  return entryId;
}

function renderDashboard() {
  return render(
    <IncomeDashboard
      userId={USER}
      currentMonth={MONTH}
      isSeasonalWorker={false}
      onSeasonalWorkerToggle={() => {}}
    />,
  );
}

/** Click the list row's delete control, whatever its accessible name turns out to be. */
async function clickListDelete() {
  const deleteControl = await waitFor(() => {
    const candidates = screen
      .getAllByRole("button")
      .filter((b) => /delete/i.test(b.getAttribute("aria-label") ?? ""));
    if (candidates.length === 0) throw new Error("no delete control yet");
    return candidates[0];
  });
  fireEvent.click(deleteControl);
}

beforeEach(async () => {
  await Promise.all([
    db.incomeEntries.clear(),
    db.incomeDocuments.clear(),
    db.incomeDocumentBlobs.clear(),
    db.seasonalWorkerStatus.clear(),
    db.complianceModes.clear(),
  ]);

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
});

afterEach(() => {
  vi.unstubAllGlobals();
  // A test that FAILS never reaches its own spy.mockRestore(), so a throw-stub
  // would survive into the next test and report one real failure as two.
  vi.restoreAllMocks();
});

afterAll(async () => {
  db.close();
});

describe("income deletion asks first", () => {
  it("shows a confirmation and deletes NOTHING until it is confirmed", async () => {
    const entryId = await seedEntryWithDocuments(2);
    renderDashboard();

    await clickListDelete();

    expect(
      await screen.findByText(/delete this income entry\?/i),
    ).toBeInTheDocument();

    // The assertion that matters: asking has not already acted.
    expect(await db.incomeEntries.get(entryId)).toBeDefined();
    expect(await db.incomeDocuments.count()).toBe(2);
    expect(await db.incomeDocumentBlobs.count()).toBe(2);
  });

  it("cancelling leaves the entry, its documents, and its blobs untouched", async () => {
    const entryId = await seedEntryWithDocuments(2);
    renderDashboard();

    await clickListDelete();
    await screen.findByText(/delete this income entry\?/i);

    fireEvent.click(screen.getByRole("button", { name: /keep it/i }));

    await waitFor(() =>
      expect(
        screen.queryByText(/delete this income entry\?/i),
      ).not.toBeInTheDocument(),
    );

    expect(await db.incomeEntries.get(entryId)).toBeDefined();
    expect(await db.incomeDocuments.count()).toBe(2);
    expect(await db.incomeDocumentBlobs.count()).toBe(2);
  });

  it("names how many photos will go, because that is the fact that changes a decision", async () => {
    await seedEntryWithDocuments(3);
    renderDashboard();

    await clickListDelete();

    expect(await screen.findByText(/3 photos/i)).toBeInTheDocument();
  });

  it("says photo, singular, for one attachment", async () => {
    await seedEntryWithDocuments(1);
    renderDashboard();

    await clickListDelete();

    const description = await screen.findByText(/1 photo\b/i);
    expect(description).toBeInTheDocument();
    expect(description.textContent).not.toMatch(/1 photos/i);
  });

  it("omits the photo sentence when there is nothing attached", async () => {
    await seedEntryWithDocuments(0);
    renderDashboard();

    await clickListDelete();

    await screen.findByText(/delete this income entry\?/i);
    expect(screen.queryByText(/photo/i)).not.toBeInTheDocument();
    expect(screen.getByText(/can't be undone/i)).toBeInTheDocument();
  });

  it("confirming removes the entry, its documents, and its blobs together", async () => {
    const entryId = await seedEntryWithDocuments(2);
    renderDashboard();

    await clickListDelete();
    await screen.findByText(/delete this income entry\?/i);

    fireEvent.click(screen.getByRole("button", { name: /delete entry/i }));

    await waitFor(async () =>
      expect(await db.incomeEntries.get(entryId)).toBeUndefined(),
    );
    expect(await db.incomeDocuments.count()).toBe(0);
    expect(await db.incomeDocumentBlobs.count()).toBe(0);
  });
});

describe("a failed delete says nothing was lost", () => {
  it("keeps the entry and reports the failure rather than closing silently", async () => {
    // The cascade preserves the entry when a document delete fails. The user must
    // be told that, or a silent close reads as success and they never retry — and
    // the records they think are gone are the ones a state may ask for.
    const entryId = await seedEntryWithDocuments(1);
    const spy = vi
      .spyOn(db.incomeDocumentBlobs, "delete")
      .mockImplementation(() => {
        throw new Error("simulated blob delete failure");
      });

    renderDashboard();
    await clickListDelete();
    await screen.findByText(/delete this income entry\?/i);

    fireEvent.click(screen.getByRole("button", { name: /delete entry/i }));

    expect(await screen.findByText(/nothing was removed/i)).toBeInTheDocument();
    expect(await db.incomeEntries.get(entryId)).toBeDefined();

    spy.mockRestore();
  });
});
