import { test, expect, type Page } from "@playwright/test";

/**
 * The delete-everything flow, on a phone.
 *
 * ## The criterion this closes
 *
 * W2a and W0 both had to record "a phone-viewport smoke test" as **UNMET** — the one
 * acceptance criterion in each wave that needed a person rather than a command. It then
 * got worse: W0 shipped a *destructive* Settings action, and a delete-everything button
 * is the worst thing to ship unseen at 375px.
 *
 * `engineering-standards.md` requires acceptance criteria to name an observable. This
 * file is that observable.
 *
 * ## Why the Vitest coverage is not enough
 *
 * `DeleteAllDataDialog.test.tsx` (13 tests) and `deleteAllReachable.test.tsx` (4) already
 * cover the gate and the wiring — in jsdom, where every element reports zero width and
 * `fullScreen` below `sm` is a prop nobody can see the effect of. They prove the logic.
 * They cannot prove a user can reach the confirm button with a thumb.
 *
 * Deliberately **not** re-testing the logic here. That would be a slow duplicate of a
 * fast suite. What this file asserts is only what needs a real viewport: that the dialog
 * is actually usable at phone size, and that the destructive control is not reachable
 * without deliberate action.
 */

/**
 * Give the app a profile.
 *
 * Navigates first so the app's own Dexie instance creates the schema at its current
 * version, then writes a row into the existing store. Building the database from scratch
 * here would hard-code a schema that W3's v7 bump is about to change, and would fight
 * Dexie's own upgrade logic — this way the fixture stays valid across version bumps.
 */
async function seedProfile(page: Page) {
  // `/`, not `/onboarding`. Dexie opens the database lazily on first query, and
  // `/onboarding` never touches it — so seeding after that route fails with
  // "object store was not found". `app/page.tsx` calls `db.profiles.toArray()` on
  // mount, which is what actually creates the schema. It then redirects to
  // /onboarding, by which point the stores exist.
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(
    async () => {
      const names = await indexedDB.databases?.();
      return !!names?.some((d) => d.name === "HourKeepDB");
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.evaluate(async () => {
    // Reopen with no version to attach to whatever schema the app created, rather
    // than hard-coding one that W3's v7 bump is about to change.
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open("HourKeepDB");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });

    await new Promise((res, rej) => {
      const tx = db.transaction("profiles", "readwrite");
      tx.objectStore("profiles").put({
        id: "e2e-profile",
        name: "E2E User",
        state: "CA",
        dateOfBirth: "1990-01-01",
        createdAt: new Date(),
        updatedAt: new Date(),
        privacyNoticeAcknowledged: true,
        privacyNoticeAcknowledgedAt: new Date(),
        version: 1,
      });
      tx.oncomplete = () => res(null);
      tx.onerror = () => rej(tx.error);
    });

    db.close();
  });
}

test.describe("delete-all is usable and safe at phone size", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the control is reachable in Settings without horizontal scrolling", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.goto("/settings", { waitUntil: "networkidle" });

    const button = page.getByRole("button", { name: /delete all my data/i });
    await expect(button).toBeVisible();

    // Horizontal scroll on a phone is a layout bug, not a preference.
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows, "the settings page scrolls horizontally at 375px").toBe(
      false,
    );

    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    // WCAG 2.2 AA SC 2.5.8 is 24x24; this project's standard is 44x44 (AAA, SC 2.5.5).
    expect(
      box!.height,
      "touch target below the 44px project standard",
    ).toBeGreaterThanOrEqual(44);
  });

  test("the dialog goes full-screen and its buttons stay on-screen", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.goto("/settings", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /delete all my data/i }).click();

    await expect(page.getByText(/delete all your data\?/i)).toBeVisible();

    // `fullScreen` below `sm` with `noSsr` — a prop with no observable effect in jsdom.
    const dialog = page.getByRole("dialog");
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(
      box!.width,
      "dialog is not full-width at 375px, so it was not treated as a phone",
    ).toBeGreaterThan(340);

    // The thing that actually matters: can the user reach both choices?
    await expect(
      page.getByRole("button", { name: /keep my data/i }),
    ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: /delete everything/i }),
    ).toBeInViewport();
  });

  test("the confirmation field and its button are both usable by touch", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.goto("/settings", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /delete all my data/i }).click();

    const field = page.getByLabel(/type .*delete/i);
    await expect(field).toBeVisible();

    const confirm = page.getByRole("button", { name: /delete everything/i });
    await expect(confirm).toBeDisabled();

    // Typing on a phone keyboard is the real interaction, not a programmatic set.
    await field.fill("DELETE");
    await expect(confirm).toBeEnabled();

    const box = await confirm.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("the whole flow completes and lands the user on onboarding", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.goto("/settings", { waitUntil: "networkidle" });

    // Something to lose, so "it deleted" means something.
    await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("HourKeepDB");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      await new Promise((res, rej) => {
        const tx = db.transaction("activities", "readwrite");
        tx.objectStore("activities").add({
          date: "2026-07-01",
          type: "work",
          hours: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        tx.oncomplete = () => res(null);
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    });

    await page.getByRole("button", { name: /delete all my data/i }).click();
    await page.getByLabel(/type .*delete/i).fill("DELETE");
    await page.getByRole("button", { name: /delete everything/i }).click();

    await page.waitForURL(/\/onboarding/, { timeout: 15_000 });

    // Verified in a REAL IndexedDB, not fake-indexeddb.
    const remaining = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("HourKeepDB");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const count = (store: string) =>
        new Promise<number>((res, rej) => {
          const q = db
            .transaction(store, "readonly")
            .objectStore(store)
            .count();
          q.onsuccess = () => res(q.result);
          q.onerror = () => rej(q.error);
        });
      const profiles = await count("profiles");
      const activities = await count("activities");
      db.close();
      return { profiles, activities, localStorageKeys: localStorage.length };
    });

    expect(remaining.profiles).toBe(0);
    expect(remaining.activities).toBe(0);
    expect(remaining.localStorageKeys).toBe(0);
  });

  test("cancelling keeps everything, so a mis-tap is recoverable", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.goto("/settings", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /delete all my data/i }).click();
    await page.getByLabel(/type .*delete/i).fill("DELETE");
    await page.getByRole("button", { name: /keep my data/i }).click();

    await expect(page.getByText(/delete all your data\?/i)).not.toBeVisible();

    const profiles = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("HourKeepDB");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const q = db
        .transaction("profiles", "readonly")
        .objectStore("profiles")
        .count();
      const n = await new Promise<number>((res) => {
        q.onsuccess = () => res(q.result);
      });
      db.close();
      return n;
    });

    expect(profiles).toBe(1);
  });
});
