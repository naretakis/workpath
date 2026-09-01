import { test, expect } from "@playwright/test";

/**
 * The platform APIs the Vitest suite has to stub, verified for real.
 *
 * ## Why this file is not busywork
 *
 * W0 worked around six missing platform features to get its tests running, and every
 * workaround is a piece of reality the suite does not exercise:
 *
 * | Feature | jsdom + fake-indexeddb | What W0 had to do |
 * |---|---|---|
 * | `Blob` via IndexedDB | returns a plain empty object | assert row counts, never content |
 * | Canvas | absent | inject a fake compressor |
 * | `URL.createObjectURL` | absent | `vi.stubGlobal` |
 * | `ResizeObserver` | absent | `vi.stubGlobal` |
 * | Service worker | absent | untested entirely |
 * | `navigator.storage.estimate` | absent | `vi.stubGlobal` |
 *
 * The first row is the one that matters most. `.kiro/steering/data-migration-standards.md`
 * requires the v6 → v7 migration test to assert that **blobs survived**, and W0 had to
 * write a handoff to W3 saying that is impossible under `fake-indexeddb` — that the test
 * could only prove a row was reachable, not that the bytes were intact.
 *
 * **This file removes that limitation.** A migration test written here can assert real
 * blob survival. Blobs are photographs of pay stubs — the evidence a user hands a state
 * agency under 42 CFR 435.557 — and losing them is unrecoverable, because there is no
 * server and no backup. That is the one failure this project cannot absorb, so it should
 * be tested where it can actually be tested.
 *
 * These specs are a **capability contract**, not app behaviour: they assert that the
 * environment W3, W6a and W8a will rely on genuinely provides what they need. If one
 * fails, the browser or Playwright version changed under us and a later wave's plan is
 * built on sand.
 */

test.describe("IndexedDB preserves Blob content, unlike fake-indexeddb", () => {
  test("a Blob survives a write/read round trip with its bytes intact", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    const result = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("pw-blob-contract", 1);
        r.onupgradeneeded = () =>
          r.result.createObjectStore("blobs", {
            keyPath: "id",
            autoIncrement: true,
          });
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });

      const payload = "pay stub bytes \u2014 not a placeholder";
      const original = new Blob([payload], { type: "image/jpeg" });

      const id = await new Promise<IDBValidKey>((res, rej) => {
        const q = db
          .transaction("blobs", "readwrite")
          .objectStore("blobs")
          .add({ blob: original });
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });

      const row = await new Promise<{ blob: Blob }>((res, rej) => {
        const q = db
          .transaction("blobs", "readonly")
          .objectStore("blobs")
          .get(id);
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });

      const stored = row.blob;
      const isBlob = stored instanceof Blob;
      const text = isBlob ? await stored.text() : null;

      db.close();
      indexedDB.deleteDatabase("pw-blob-contract");

      return {
        isBlob,
        size: isBlob ? stored.size : -1,
        type: isBlob ? stored.type : null,
        contentMatches: text === payload,
      };
    });

    // Under fake-indexeddb every one of these fails: isBlob false, no size, no type.
    expect(result.isBlob).toBe(true);
    expect(result.type).toBe("image/jpeg");
    expect(result.size).toBeGreaterThan(0);
    expect(
      result.contentMatches,
      "blob bytes did not survive the round trip — the thing W3's migration test needs to assert",
    ).toBe(true);
  });

  test("a Blob survives an IndexedDB version upgrade, which is what W3 must prove", async ({
    page,
  }) => {
    // The shape of the v6 -> v7 migration test, in miniature: write at v1, reopen at
    // v2 with a schema change, confirm the bytes are still there. Not a substitute for
    // W3's real fixture — a placeholder proving the technique works in this harness.
    await page.goto("/onboarding");

    const survived = await page.evaluate(async () => {
      const NAME = "pw-migration-contract";
      const payload = "evidence that must not be lost";

      const v1 = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(NAME, 1);
        r.onupgradeneeded = () =>
          r.result.createObjectStore("blobs", {
            keyPath: "id",
            autoIncrement: true,
          });
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      await new Promise((res, rej) => {
        const q = v1
          .transaction("blobs", "readwrite")
          .objectStore("blobs")
          .add({ id: 1, blob: new Blob([payload], { type: "image/jpeg" }) });
        q.onsuccess = () => res(null);
        q.onerror = () => rej(q.error);
      });
      v1.close();

      // Upgrade, adding a store the way a real migration would.
      const v2 = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(NAME, 2);
        r.onupgradeneeded = () => {
          if (!r.result.objectStoreNames.contains("added")) {
            r.result.createObjectStore("added", { keyPath: "id" });
          }
        };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });

      const row = await new Promise<{ blob: Blob }>((res, rej) => {
        const q = v2
          .transaction("blobs", "readonly")
          .objectStore("blobs")
          .get(1);
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });

      const text = row.blob instanceof Blob ? await row.blob.text() : null;
      v2.close();
      indexedDB.deleteDatabase(NAME);

      return text === payload;
    });

    expect(survived, "blob content did not survive a version upgrade").toBe(
      true,
    );
  });
});

test.describe("Canvas is real, so image compression is testable", () => {
  test("a canvas can encode a JPEG, which is what compressImage needs", async ({
    page,
  }) => {
    // ADR-0007 puts compression in Tier 4, "stays manual", because jsdom has no
    // Canvas. That reasoning does not hold here — this is the capability that lets a
    // later wave test real compression against a real image.
    await page.goto("/onboarding");

    const result = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return { hasContext: false, encoded: false, size: 0 };

      // Noise rather than flat colour, so JPEG actually has something to compress.
      for (let x = 0; x < 400; x += 8) {
        for (let y = 0; y < 300; y += 8) {
          ctx.fillStyle = `rgb(${(x * 7) % 256},${(y * 11) % 256},${(x + y) % 256})`;
          ctx.fillRect(x, y, 8, 8);
        }
      }

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/jpeg", 0.8),
      );

      return {
        hasContext: true,
        encoded: blob instanceof Blob && blob.type === "image/jpeg",
        size: blob?.size ?? 0,
      };
    });

    expect(result.hasContext).toBe(true);
    expect(result.encoded).toBe(true);
    expect(result.size).toBeGreaterThan(0);
  });
});

test.describe("the other four APIs W0 had to stub", () => {
  test("createObjectURL, revokeObjectURL, ResizeObserver and storage.estimate all exist", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    const caps = await page.evaluate(async () => {
      const url = URL.createObjectURL(new Blob(["x"]));
      const revoked = (() => {
        try {
          URL.revokeObjectURL(url);
          return true;
        } catch {
          return false;
        }
      })();
      const estimate = await navigator.storage?.estimate?.();

      return {
        createObjectURL: url.startsWith("blob:"),
        revokeObjectURL: revoked,
        resizeObserver: typeof ResizeObserver === "function",
        serviceWorkerSupported: "serviceWorker" in navigator,
        quotaIsANumber: typeof estimate?.quota === "number",
      };
    });

    expect(caps.createObjectURL).toBe(true);
    expect(caps.revokeObjectURL).toBe(true);
    expect(caps.resizeObserver).toBe(true);
    expect(caps.serviceWorkerSupported).toBe(true);
    // saveDocument gates writes on remaining quota; jsdom cannot report any.
    expect(caps.quotaIsANumber).toBe(true);
  });
});
