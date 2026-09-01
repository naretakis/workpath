import { test, expect } from "@playwright/test";

/**
 * Every asset the shipped HTML references must actually exist.
 *
 * ## The bug this was written for
 *
 * `src/app/layout.tsx` carried
 * `const basePath = process.env.NODE_ENV === "production" ? "/hourkeep" : ""`, left
 * over from when the app was hosted at `naretakis.github.io/hourkeep`. The custom
 * domain removed that prefix, but the constant stayed — so every production build
 * emitted six links into a directory that does not exist:
 *
 *     https://hourkeep.app/hourkeep/manifest.json     -> 404
 *     https://hourkeep.app/manifest.json              -> 200
 *
 * Verified against the live site before fixing. The manifest link had been dead in
 * production, which means no "Add to Home Screen" and no app icon. For an
 * offline-first PWA aimed at people on old phones, that is the most important
 * non-functional requirement, silently broken.
 *
 * ## Why no existing test caught it
 *
 * Three separate reasons, and each is an argument for this file existing:
 *
 * 1. **Dev builds set the prefix to `""`**, so it never reproduced locally.
 * 2. **jsdom never loads real HTML from a real server**, so the Vitest suite never
 *    sees a `<link>` element resolve or fail.
 * 3. **`scripts/update-manifest.js` disagreed with `layout.tsx` and hid the
 *    symptom.** `next build` sets NODE_ENV=production for the app, so layout.tsx
 *    emitted `/hourkeep/...`; the post-build script runs in a plain node process
 *    where NODE_ENV is unset, so it logged "basePath: (none)" and wrote a perfectly
 *    correct manifest that nothing could reach. The reassuring log line was the
 *    problem.
 *
 * A build-output bug needs a test against the build output. That is what this is.
 */

/** Routes that exist in the static export. */
const ROUTES = [
  "/",
  "/onboarding",
  "/tracking",
  "/settings",
  "/export",
  "/how-to-hourkeep",
];

test.describe("shipped HTML references only assets that exist", () => {
  for (const route of ROUTES) {
    test(`${route} — every local href and src resolves`, async ({
      page,
      request,
    }) => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} itself should serve`).toBeLessThan(
        400,
      );

      // BOTH the raw server HTML and the hydrated DOM, and the first one is the
      // point.
      //
      // A DOM-only version of this test PASSED against the basePath bug it was
      // written to catch. React rewrites the document head during hydration, so by
      // the time `page.evaluate` runs the broken `/hourkeep/...` links have been
      // replaced by correct ones — the bug is real, shipped, and invisible from the
      // hydrated DOM. What a first-time visitor's browser fetches, and what an
      // install prompt or a crawler reads, is the raw HTML.
      //
      // Found by mutating the fix back in and watching these six specs stay green.
      const rawHtml = await (await request.get(route)).text();
      const rawRefs = [...rawHtml.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map(
        (m) => m[1],
      );

      const domRefs = await page.evaluate(() => {
        const out = new Set<string>();
        const add = (v: string | null) => v && out.add(v);
        document
          .querySelectorAll("link[href]")
          .forEach((el) => add(el.getAttribute("href")));
        document
          .querySelectorAll("script[src]")
          .forEach((el) => add(el.getAttribute("src")));
        document
          .querySelectorAll("img[src]")
          .forEach((el) => add(el.getAttribute("src")));
        return [...out].filter((h) => h.startsWith("/"));
      });

      const refs = [...new Set([...rawRefs, ...domRefs])];

      expect(
        refs.length,
        `${route} should reference at least the manifest and a stylesheet`,
      ).toBeGreaterThan(0);

      const broken: string[] = [];
      for (const ref of refs) {
        const res = await request.get(ref);
        if (!res.ok()) broken.push(`${ref} -> HTTP ${res.status()}`);
      }

      expect(
        broken,
        `${route} references assets that do not exist:\n${broken.join("\n")}`,
      ).toEqual([]);
    });
  }

  test("no reference carries the retired /hourkeep base path", async ({
    request,
  }) => {
    // The specific regression, asserted by name. A future contributor restoring the
    // GitHub Pages prefix — or copying it from git history — turns this red rather
    // than shipping a 404 nobody notices for months.
    // Raw HTML, not page.content(): React rewrites the head during hydration, so
    // the hydrated document no longer shows the prefix even when the build emitted it.
    const rawHtml = await (await request.get("/onboarding")).text();

    expect(
      rawHtml,
      "layout.tsx hardcoded /hourkeep for production builds; the site serves from a custom domain root",
    ).not.toContain("/hourkeep/");
  });
});

test.describe("the PWA manifest is reachable and usable", () => {
  test("the manifest link resolves and parses as JSON", async ({
    page,
    request,
  }) => {
    await page.goto("/onboarding");

    const href = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    expect(href, "no manifest link in the document head").toBeTruthy();

    const res = await request.get(href!);
    expect(res.ok(), `manifest link ${href} returned ${res.status()}`).toBe(
      true,
    );

    const manifest = JSON.parse(await res.text());
    expect(manifest.name ?? manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(Array.isArray(manifest.icons)).toBe(true);
  });

  test("every icon the manifest declares actually exists", async ({
    page,
    request,
  }) => {
    // update-manifest.js rewrites these paths at build time, so they are exactly the
    // kind of thing that drifts from the files on disk.
    await page.goto("/onboarding");
    const href = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    const manifest = JSON.parse(await (await request.get(href!)).text());

    const broken: string[] = [];
    for (const icon of manifest.icons as Array<{ src: string }>) {
      const res = await request.get(icon.src);
      if (!res.ok()) broken.push(`${icon.src} -> HTTP ${res.status()}`);
    }

    expect(
      broken,
      `manifest declares missing icons:\n${broken.join("\n")}`,
    ).toEqual([]);
  });

  test("start_url is fetchable, so an installed app opens rather than 404s", async ({
    request,
    page,
  }) => {
    await page.goto("/onboarding");
    const href = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    const manifest = JSON.parse(await (await request.get(href!)).text());

    const res = await request.get(manifest.start_url);
    expect(
      res.ok(),
      `start_url ${manifest.start_url} returned ${res.status()} — an installed app would open to an error`,
    ).toBe(true);
  });
});
