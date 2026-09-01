/**
 * W0 § 0.5 — the delete path must actually be reachable from Settings.
 *
 * `DeleteAllDataDialog.test.tsx` covers the gate and
 * `deleteAllData.test.ts` covers the clearing. Neither proves a user can GET
 * there, and "reachable from Settings" is the acceptance criterion — so it needs
 * an observable of its own. A dialog nobody can open satisfies both other suites
 * and none of the promise in `PrivacyNotice.tsx:71`.
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

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: replaceMock,
    back: vi.fn(),
  }),
}));

import { db } from "@/lib/db";
import SettingsPage from "@/app/settings/page";

async function seedProfile() {
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
}

beforeEach(async () => {
  replaceMock.mockClear();
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
  localStorage.clear();
  sessionStorage.clear();

  // StorageInfo calls navigator.storage.estimate(); jsdom has no Storage Manager.
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

describe("Settings exposes the delete path", () => {
  it("renders a control for deleting all data", async () => {
    await seedProfile();
    render(<SettingsPage />);

    expect(
      await screen.findByRole("button", { name: /delete all my data/i }),
    ).toBeInTheDocument();
  });

  it("opening it shows the confirmation and deletes nothing yet", async () => {
    await seedProfile();
    render(<SettingsPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /delete all my data/i }),
    );

    expect(
      await screen.findByText(/delete all your data\?/i),
    ).toBeInTheDocument();
    expect(await db.profiles.count()).toBe(1);
    expect(await db.activities.count()).toBe(1);
  });

  it("completing the flow clears the data and sends the user to onboarding", async () => {
    // `replace`, not `push`: the profile no longer exists, so Back must not return
    // to a Settings page rendering one.
    await seedProfile();
    render(<SettingsPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /delete all my data/i }),
    );
    await screen.findByText(/delete all your data\?/i);

    fireEvent.change(screen.getByLabelText(/type .*delete/i), {
      target: { value: "DELETE" },
    });
    fireEvent.click(screen.getByRole("button", { name: /delete everything/i }));

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/onboarding"),
    );

    const counts = await Promise.all(db.tables.map((t) => t.count()));
    expect(counts.reduce((a, b) => a + b, 0)).toBe(0);
  });

  it("the promise that motivated this is on the page it is made from", async () => {
    // PrivacyNotice.tsx:71 and settings/PrivacyPolicy.tsx:77 both say "Export or
    // delete anytime". Asserting the delete control sits in the same Privacy & Data
    // section keeps the promise and the feature from drifting apart again.
    await seedProfile();
    render(<SettingsPage />);

    const deleteButton = await screen.findByRole("button", {
      name: /delete all my data/i,
    });
    const section = deleteButton.closest(".MuiPaper-root");

    expect(section?.textContent).toMatch(/privacy & data/i);
  });
});
