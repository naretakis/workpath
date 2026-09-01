/**
 * W0 § 0.5 — the confirmation gate on the only irreversible action in the app.
 *
 * `deleteAllData` itself is covered in
 * `src/lib/storage/__tests__/deleteAllData.test.ts`. This file covers the gate,
 * which is the part that protects the user, because there is no server, no backup,
 * and — per `gap-analysis.md:298` (gap 15.27) — no import path, so an export cannot
 * restore anything. Nothing recovers from a mis-tap here.
 *
 * The load-bearing assertions are the negative ones: while the dialog is open and
 * unconfirmed, nothing may be deleted; and the copy must not describe the export as
 * a way back.
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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { db } from "@/lib/db";
import { DeleteAllDataDialog } from "@/components/settings/DeleteAllDataDialog";

const CONFIRM_WORD = "DELETE";

async function seedSomething() {
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
  localStorage.setItem("hourkeep-encryption-key", "secret");
}

function renderDialog(
  overrides: Partial<{ onClose: () => void; onDeleted: () => void }> = {},
) {
  const onClose = overrides.onClose ?? vi.fn();
  const onDeleted = overrides.onDeleted ?? vi.fn();
  render(<DeleteAllDataDialog open onClose={onClose} onDeleted={onDeleted} />);
  return { onClose, onDeleted };
}

/** The confirmation text field. */
function confirmField() {
  return screen.getByLabelText(/type .*delete/i);
}

function deleteButton() {
  return screen.getByRole("button", { name: /delete everything/i });
}

beforeEach(async () => {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

afterAll(async () => {
  db.close();
});

describe("the gate holds until the word is typed exactly", () => {
  it("deletes nothing merely by being open", async () => {
    await seedSomething();
    renderDialog();

    await screen.findByText(/can't be undone/i);

    expect(await db.profiles.count()).toBe(1);
    expect(await db.activities.count()).toBe(1);
    expect(localStorage.getItem("hourkeep-encryption-key")).toBe("secret");
  });

  it("disables the delete button before anything is typed", async () => {
    await seedSomething();
    renderDialog();

    expect(deleteButton()).toBeDisabled();
  });

  it("stays disabled for a partial match", async () => {
    await seedSomething();
    renderDialog();

    fireEvent.change(confirmField(), { target: { value: "DELET" } });

    expect(deleteButton()).toBeDisabled();
  });

  it("stays disabled for the wrong case, so the action cannot be taken absent-mindedly", async () => {
    await seedSomething();
    renderDialog();

    fireEvent.change(confirmField(), { target: { value: "delete" } });

    expect(deleteButton()).toBeDisabled();
  });

  it("enables only on an exact match", async () => {
    await seedSomething();
    renderDialog();

    fireEvent.change(confirmField(), { target: { value: CONFIRM_WORD } });

    expect(deleteButton()).toBeEnabled();
  });

  it("tolerates surrounding whitespace, which a phone keyboard adds on its own", async () => {
    // Autocorrect and long-press paste both append a space. Refusing that would
    // read as the app being broken rather than careful.
    await seedSomething();
    renderDialog();

    fireEvent.change(confirmField(), { target: { value: " DELETE " } });

    expect(deleteButton()).toBeEnabled();
  });

  it("cancelling deletes nothing and leaves the typed word behind it", async () => {
    await seedSomething();
    const { onClose, onDeleted } = renderDialog();

    fireEvent.change(confirmField(), { target: { value: CONFIRM_WORD } });
    fireEvent.click(screen.getByRole("button", { name: /keep my data/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onDeleted).not.toHaveBeenCalled();
    expect(await db.profiles.count()).toBe(1);
    expect(await db.activities.count()).toBe(1);
  });
});

describe("confirming deletes everything and reports completion once", () => {
  it("clears the database and browser storage", async () => {
    await seedSomething();
    const { onDeleted } = renderDialog();

    fireEvent.change(confirmField(), { target: { value: CONFIRM_WORD } });
    fireEvent.click(deleteButton());

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));

    const counts = await Promise.all(db.tables.map((t) => t.count()));
    expect(counts.reduce((a, b) => a + b, 0)).toBe(0);
    expect(localStorage.getItem("hourkeep-encryption-key")).toBeNull();
  });

  it("does not report completion when the delete fails, and says the data is still there", async () => {
    // The failure mode that matters most. A silent close after a failed delete
    // reads as success, so the user believes their records are gone when they are
    // not — and this is a privacy promise, so that belief is the harm.
    await seedSomething();
    const spy = vi.spyOn(db, "transaction").mockImplementation(() => {
      throw new Error("simulated transaction failure");
    });

    const { onDeleted, onClose } = renderDialog();
    fireEvent.change(confirmField(), { target: { value: CONFIRM_WORD } });
    fireEvent.click(deleteButton());

    expect(await screen.findByText(/still here/i)).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(await db.profiles.count()).toBe(1);

    spy.mockRestore();
  });
});

describe("the copy is honest about what is lost and what is not a way back", () => {
  it("says the action cannot be undone", async () => {
    renderDialog();
    expect(await screen.findByText(/can't be undone/i)).toBeInTheDocument();
  });

  it("does NOT describe the export as a backup or a restore path", async () => {
    // gap-analysis.md:298 (gap 15.27): there is no import path, so an export is a
    // printout, not a backup. § 0.5 of the wave file suggested offering an export
    // first as a mitigation; calling it one would be an unverified claim of exactly
    // the kind engineering-standards.md exists to prevent.
    renderDialog();
    await screen.findByText(/can't be undone/i);

    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/back ?up/i);
    expect(text).not.toMatch(/restore/i);
    expect(text).not.toMatch(/recover/i);
    expect(text).not.toMatch(/you can import/i);
  });

  it("names what goes, so the user can weigh it", async () => {
    renderDialog();
    await screen.findByText(/can't be undone/i);

    const text = (document.body.textContent ?? "").toLowerCase();
    // The things a user would grieve: their logged hours, their income records,
    // and their photographed evidence.
    expect(text).toContain("hours");
    expect(text).toContain("income");
    expect(text).toContain("photo");
  });

  it("asserts no legal status while doing it", async () => {
    // ADR-0003 applies here as everywhere: this dialog must not imply anything
    // about the user's eligibility, only about their records.
    renderDialog();
    await screen.findByText(/can't be undone/i);

    const text = (document.body.textContent ?? "").toLowerCase();
    expect(text).not.toContain("exempt");
    expect(text).not.toContain("compliant");
  });
});
