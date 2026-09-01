import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — browser tests for what jsdom cannot reach.
 *
 * ## Why this exists alongside 423 Vitest tests
 *
 * The Vitest suite runs in jsdom, which lacks Canvas, `URL.createObjectURL`,
 * `ResizeObserver`, service workers and `navigator.storage.estimate`, and whose
 * `fake-indexeddb` returns a stored `Blob` as a plain empty object. W0 worked around
 * every one of those with a stub or an injected seam, and each stub is a piece of
 * reality the suite does not exercise.
 *
 * The first hour of using a real browser found a bug that had been shipping:
 * `layout.tsx` emitted `/hourkeep/manifest.json` in production builds while the site
 * serves from a custom domain root, so the PWA manifest link was a 404 on the live
 * site and the app was not installable. Invisible to dev builds (the prefix is empty
 * there) and to jsdom (which never loads real HTML from a real server).
 *
 * ## Scope discipline
 *
 * **This suite must not grow into a second copy of the Vitest tests.** 423 tests in
 * ~5 seconds is worth protecting; browser tests are slow and flakier. Add a spec here
 * only when the thing under test is impossible in jsdom. ADR-0007 § tiers has the
 * rule. If a spec could run in Vitest, it belongs in Vitest.
 *
 * ## Not in the deploy gate, deliberately
 *
 * `.github/workflows/deploy.yml` gates Pages on `npm test`, which stays Vitest-only
 * for now. Browsers are an ~82MB download and this project has already had one CI
 * break from a lockfile disagreement between npm versions. Run `npm run test:e2e`
 * locally and on demand; revisit CI once the suite has proven stable.
 */
export default defineConfig({
  testDir: "./e2e",

  // The bugs this suite exists to catch are build-output bugs, so tests run against
  // the real static export — `out/`, the exact artifact deployed to Pages — not the
  // dev server. The basePath bug reproduced ONLY in a production build.
  webServer: {
    // NO `--single`. That flag serves index.html for any unmatched path with HTTP
    // 200, which does two bad things: it makes an asset-resolution test incapable of
    // ever failing, and it misrepresents production, since GitHub Pages has no SPA
    // fallback and returns a real 404.
    //
    // Caught by a mutation that failed to change the failure count: reintroducing the
    // basePath bug kept failing exactly 8 specs before and after the asset test was
    // supposedly made stricter. With `--single`, `/hourkeep/manifest.json` returned
    // 200 and the "does this asset exist" check passed on a page of HTML. Verified
    // without the flag: real routes 200, missing paths 404.
    command: "npm run build && npx --yes serve out -l 4399",
    url: "http://localhost:4399/",
    reuseExistingServer: !process.env.CI,
    // A cold build plus a server start; generous because a slow machine failing
    // here looks like a test failure.
    timeout: 180_000,
    // The static server logs every asset request, which buries the test output.
    // stderr stays piped so a build failure is still visible.
    stdout: "ignore",
    stderr: "pipe",
  },

  use: {
    baseURL: "http://localhost:4399",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  // Serial locally: these tests share one IndexedDB origin, and parallel workers
  // clearing it out from under each other produces failures that look like bugs.
  workers: 1,
  fullyParallel: false,

  // Fail loudly rather than papering over flake. If a spec needs a retry to pass, it
  // is telling you something.
  retries: 0,
  forbidOnly: !!process.env.CI,

  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // 375×812 — an iPhone-class viewport. This project exists specifically to
      // close the phone-viewport acceptance criterion that W2a and W0 both had to
      // record UNMET, because it was the one criterion needing a person rather than
      // a command. Primary device for this app is a phone, often an old one.
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
