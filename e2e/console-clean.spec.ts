import { test, expect } from "@playwright/test";

/**
 * No route may log a console error, and hydration must not fail.
 *
 * ## Why this cannot be a Vitest test
 *
 * A hydration mismatch is by definition a disagreement between server-rendered HTML
 * and the first client render. jsdom tests mount components fresh — there is no
 * server-rendered HTML to disagree with, so the entire bug class is unreachable.
 *
 * It is also **production-build-only**: `next dev` reported zero errors on the same
 * route where the static export threw React #418. So `npm run dev` cannot find it
 * either. It needs the real artifact in a real browser, which is this file.
 *
 * ## What React #418 means and why it matters here
 *
 * React discards the server HTML for the mismatched subtree and re-renders it on the
 * client. On a fast laptop that is invisible. On the target device — an old phone on
 * a poor connection — it is a flash of wrong or missing content, and it throws away
 * the one advantage a static export has. `component-standards.md` already warns about
 * the most likely cause ("a hook that returns `false` on first paint causes a
 * hydration flash") but nothing detected it.
 *
 * ## Deliberately strict
 *
 * Any console error fails. That is a higher bar than "no errors we care about", and
 * it is set there on purpose: this app runs offline on one device with no server-side
 * error reporting, so a console error is the only signal that exists, and an
 * allowlist would quietly grow. If something legitimate needs to log, it should log
 * `warn`.
 */

/** Routes reachable without a stored profile. Others redirect to /onboarding. */
const ROUTES = [
  "/",
  "/onboarding",
  "/tracking",
  "/settings",
  "/export",
  "/how-to-hourkeep",
];

/**
 * Errors from outside our control.
 *
 * Plausible is blocked or unreachable in a test environment, and a failed analytics
 * request is not an app defect. Kept as narrow as possible — matching the domain, not
 * a broad "network" pattern that would hide real fetch failures.
 */
const EXTERNAL_NOISE = [/plausible\.io/i, /ERR_(BLOCKED|INTERNET|NAME_NOT)/i];

function isOurs(text: string): boolean {
  return !EXTERNAL_NOISE.some((re) => re.test(text));
}

test.describe("console is clean on every route", () => {
  for (const route of ROUTES) {
    test(`${route} logs no console error`, async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error" && isOurs(msg.text())) {
          errors.push(`console.error: ${msg.text()}`);
        }
      });
      // Uncaught exceptions do not always surface as console messages.
      page.on("pageerror", (err) => {
        if (isOurs(err.message)) errors.push(`pageerror: ${err.message}`);
      });

      await page.goto(route, { waitUntil: "networkidle" });
      // Hydration happens after load; React logs the mismatch during it.
      await page.waitForTimeout(600);

      expect(errors, `${route}:\n${errors.join("\n\n")}`).toEqual([]);
    });
  }
});

test.describe("hydration succeeds", () => {
  for (const route of ROUTES) {
    test(`${route} hydrates without a mismatch`, async ({ page }) => {
      // Asserted separately from general console cleanliness, and by error number,
      // so a failure names the actual problem instead of "something logged".
      //   #418 — hydration failed, server HTML did not match the client
      //   #423 — error while hydrating, the tree was regenerated on the client
      //   #425 — text content did not match
      const hydrationErrors: string[] = [];
      const HYDRATION =
        /Minified React error #(418|423|425)|Hydration failed|did not match|Text content does not match/i;

      const capture = (text: string) => {
        if (HYDRATION.test(text)) hydrationErrors.push(text.split("\n")[0]);
      };
      page.on("console", (msg) => capture(msg.text()));
      page.on("pageerror", (err) => capture(err.message));

      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      expect(
        hydrationErrors,
        `${route} hydration mismatch. React discards the server HTML for the affected ` +
          `subtree and re-renders on the client — a visible flash on a slow phone.\n` +
          hydrationErrors.join("\n"),
      ).toEqual([]);
    });
  }
});
