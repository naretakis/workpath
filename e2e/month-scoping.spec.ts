import { test, expect, type Page } from "@playwright/test";

/**
 * Month scoping, in a real browser at phone size — W5 (ADR-0005).
 *
 * ## What is here, and what is deliberately not
 *
 * ADR-0007 Tier 3b sets one bar for adding a spec: **is this impossible in jsdom?**
 * 509 Vitest tests in ~20 seconds is worth protecting, and this suite exists to stay
 * small.
 *
 * So the month arithmetic, the four review periods, the § 435.556(b) cap, the
 * validation, the guard against wall-clock reads — none of that is here. It is all in
 * `src/lib/__tests__/month.test.ts`, `reviewPeriod.test.ts` and
 * `src/__tests__/no-wall-clock-month.test.ts`, where it runs fast and on every change.
 *
 * Four things genuinely need a browser:
 *
 * 1. **That the month-scoped surfaces agree AFTER A REAL CLICK, while all visible at
 *    once.** The W5 bug was not an arithmetic error — every function was individually
 *    fine. It was that four components each derived "now" independently, so the
 *    calendar could say March while the dashboard said today. Proving they now move
 *    together means observing them simultaneously in one laid-out document, which is
 *    the thing jsdom cannot do: every element there reports zero width and nothing is
 *    really visible.
 *
 * 2. **That `<input type="month">` yields a usable `YYYY-MM`.** jsdom does not
 *    implement month inputs; it treats the control as a text box. The whole
 *    review-period anchor rests on that value being well-formed, so the one place to
 *    check it is a browser that actually renders the widget.
 *
 * 3. **That writing the anchor does not bump the Dexie version, against a REAL
 *    IndexedDB.** This is W5's last acceptance criterion — "W5 bumps no Dexie version"
 *    — as something runnable. `git diff src/lib/db.ts` being empty proves nobody
 *    edited the schema file; it does not prove that storing a new field inside an
 *    unindexed nested object leaves the version alone. `fake-indexeddb` cannot settle
 *    that either. A real browser can, and `browser-capabilities.spec.ts` already
 *    established version behaviour as browser-worthy for exactly this reason.
 *
 * 4. **Phone layout of two new controls.** Same argument as
 *    `delete-all-mobile.spec.ts`: touch-target size and horizontal overflow are
 *    invisible in jsdom.
 */

/** Hours per month in the fixture. Distinct on purpose — see `seed`. */
const CURRENT_MONTH_HOURS = 46;
const PREVIOUS_MONTH_HOURS = 84;

/**
 * What the fixture's notice says. Drives the application lookback, since the page
 * clamps `monthsRequired` into 42 CFR 435.556(a)(1)'s 1-to-3 range.
 *
 * Referenced rather than restated in assertions: a first version hardcoded "1 month
 * in the period" while the fixture said 2, which failed for the right reason and cost
 * a run.
 */
const FIXTURE_MONTHS_REQUIRED = 2;

/**
 * Seed a profile and activities in two adjacent months.
 *
 * Same approach as `delete-all-mobile.spec.ts`: navigate to `/` first so the app's own
 * Dexie instance creates the schema at whatever version it is on, then write into the
 * existing stores and reopen with **no version argument**. Building the database here
 * would hard-code a schema W3's v7 bump is about to change.
 *
 * The two months carry DIFFERENT totals (46 and 84) because equal totals would let the
 * central assertion pass while the page ignored the month entirely — the exact failure
 * mode this file exists to catch.
 */
async function seed(page: Page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(
    async () => {
      const names = await indexedDB.databases?.();
      return !!names?.some((d) => d.name === "HourKeepDB");
    },
    undefined,
    { timeout: 10_000 },
  );

  return page.evaluate(
    async ([currentHours, previousHours, monthsRequired]) => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("HourKeepDB");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });

      // Month labels are derived from the browser's own clock, in LOCAL time, so the
      // fixture agrees with what `currentMonth()` will compute inside the app. A
      // hardcoded month would make this spec expire.
      const pad = (n: number) => String(n).padStart(2, "0");
      const now = new Date();
      const monthAt = (offset: number) => {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      };
      const thisMonth = monthAt(0);
      const lastMonth = monthAt(-1);

      // Day 05 and 12: safe in every month, including February.
      const rows = [
        { date: `${thisMonth}-05`, type: "work", hours: currentHours },
        { date: `${lastMonth}-05`, type: "work", hours: previousHours - 4 },
        { date: `${lastMonth}-12`, type: "volunteer", hours: 4 },
      ];

      await new Promise((res, rej) => {
        const tx = db.transaction(["profiles", "activities"], "readwrite");
        tx.objectStore("profiles").put({
          id: "e2e-month-profile",
          name: "E2E Month User",
          state: "CA",
          dateOfBirth: "1990-01-01",
          createdAt: new Date(),
          updatedAt: new Date(),
          privacyNoticeAcknowledged: true,
          privacyNoticeAcknowledgedAt: new Date(),
          version: 1,
          onboardingContext: {
            hasNotice: true,
            monthsRequired: monthsRequired,
          },
        });
        const store = tx.objectStore("activities");
        for (const row of rows) {
          store.add({ ...row, createdAt: new Date(), updatedAt: new Date() });
        }
        tx.oncomplete = () => res(null);
        tx.onerror = () => rej(tx.error);
      });

      const version = db.version;
      db.close();

      // Long month names, so assertions can match what the UI renders.
      const label = (month: string) =>
        new Date(
          Number(month.slice(0, 4)),
          Number(month.slice(5, 7)) - 1,
          1,
        ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

      return {
        thisMonth,
        lastMonth,
        thisMonthLabel: label(thisMonth),
        lastMonthLabel: label(lastMonth),
        version,
      };
    },
    [
      CURRENT_MONTH_HOURS,
      PREVIOUS_MONTH_HOURS,
      FIXTURE_MONTHS_REQUIRED,
    ] as const,
  );
}

test.describe("month scoping on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("every month-scoped surface names the same month, and follows a real click", async ({
    page,
  }) => {
    // THE CENTRAL ASSERTION OF THIS WAVE.
    //
    // Before W5: `Calendar` owned `useState(new Date())`, so paging it repainted the
    // grid while the dashboard, the activity list and the income view stayed on today.
    // Hours logged into a past month appeared to vanish. Every individual function was
    // correct; the components simply did not share a month.
    const fixture = await seed(page);
    await page.goto("/tracking", { waitUntil: "networkidle" });

    const navigatorHeading = page.getByRole("heading", {
      name: fixture.thisMonthLabel,
      level: 2,
    });
    const dashboardHeading = page.getByRole("heading", {
      name: `Monthly Progress - ${fixture.thisMonthLabel}`,
    });
    // `exact: true` is load-bearing. Playwright matches accessible names as
    // substrings by default, and the Dashboard heading is now also an h3 — a
    // deliberate a11y fix, since MUI's variant h5 renders an <h5> element and skipped
    // the page from h2 straight to h5. Without `exact` this locator resolves to both
    // "September 2026" and "Monthly Progress - September 2026" and fails strict mode.
    const calendarHeading = page.getByRole("heading", {
      name: fixture.thisMonthLabel,
      level: 3,
      exact: true,
    });

    // `ActivityList` groups by month and renders each group's label as an h6. Asserted
    // because the summary and the list are separate derivations, and a mutation that
    // pinned only the LIST to today went undetected until this was added — the
    // criterion says the summary, activity list, income view and status move
    // together, so the list needs its own observable.
    const activityListMonth = (label: string) =>
      page.getByRole("heading", { name: label, level: 6, exact: true });

    await expect(navigatorHeading).toBeVisible();
    await expect(dashboardHeading).toBeVisible();
    await expect(calendarHeading).toBeVisible();
    await expect(activityListMonth(fixture.thisMonthLabel)).toBeVisible();
    await expect(
      page.getByText(`${CURRENT_MONTH_HOURS} / 80 hours`),
    ).toBeVisible();

    // Page back through the navigator. Its label names the destination month rather
    // than a direction, which is both the a11y requirement and what makes this
    // locator readable.
    await page
      .getByRole("button", { name: `Show ${fixture.lastMonthLabel}` })
      .first()
      .click();

    // All three headings move, and the total changes with them. The two months carry
    // different totals precisely so this cannot pass by coincidence.
    await expect(
      page.getByRole("heading", { name: fixture.lastMonthLabel, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: `Monthly Progress - ${fixture.lastMonthLabel}`,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: fixture.lastMonthLabel,
        level: 3,
        exact: true,
      }),
    ).toBeVisible();
    await expect(activityListMonth(fixture.lastMonthLabel)).toBeVisible();
    await expect(
      page.getByText(`${PREVIOUS_MONTH_HOURS} / 80 hours`),
    ).toBeVisible();

    // And the month we left is no longer claimed anywhere as the current view — for
    // the summary AND for the list, which are computed separately.
    await expect(
      page.getByRole("heading", {
        name: `Monthly Progress - ${fixture.thisMonthLabel}`,
      }),
    ).toHaveCount(0);
    await expect(activityListMonth(fixture.thisMonthLabel)).toHaveCount(0);
  });

  test("a past month is marked as one, and offers a way back", async ({
    page,
  }) => {
    // ADR-0005 § 5, as reconciled with the wave file: a past month is a RECORD, and it
    // prompts for evidence rather than for progress toward a threshold. "34 hours to
    // go" is meaningless for a month that has ended; "who can confirm it" is not.
    const fixture = await seed(page);
    await page.goto("/tracking", { waitUntil: "networkidle" });

    await page
      .getByRole("button", { name: `Show ${fixture.lastMonthLabel}` })
      .first()
      .click();

    await expect(page.getByText("Past month")).toBeVisible();
    await expect(
      page.getByText(/find proof for hours you already logged/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: `Back to ${fixture.thisMonthLabel}` }),
    ).toBeVisible();

    // And it really goes back, so the affordance is not decorative.
    await page
      .getByRole("button", { name: `Back to ${fixture.thisMonthLabel}` })
      .click();
    await expect(page.getByText("This month")).toBeVisible();
  });

  test("no month-scoped surface asserts a verdict, at any month", async ({
    page,
  }) => {
    // The Vitest no-verdict guard scans source and rendered components. It cannot see
    // the ASSEMBLED page across a month change — and that is exactly where the two
    // verdicts W5 removed were found, by looking at this screen in a browser.
    // `Dashboard` and `IncomeStatusIndicator` both rendered "Compliant" in green,
    // which W2a's guard missed because it matched `COMPLIANT` case-sensitively to
    // spare the `isCompliant` identifier.
    //
    // Checked at BOTH months, including the one over the threshold, since that is the
    // branch the verdict lived in.
    const fixture = await seed(page);
    await page.goto("/tracking", { waitUntil: "networkidle" });

    const banned = [/\bCompliant\b/, /You've met/i, /Goal Complete/i];

    /**
     * Read the text and match it here, rather than using
     * `expect(locator).not.toHaveText(regex)`.
     *
     * That is not a stylistic preference. `toHaveText` with a regular expression is a
     * WHOLE-STRING match, so `not.toHaveText(/\bCompliant\b/)` against `<body>` passes
     * for any page containing anything else — which is every page. The assertion was
     * vacuous, and mutation testing is what revealed it: reintroducing the exact
     * verdict this test exists to catch left it green.
     *
     * `toContainText` would also work. This form is used because it reports the
     * offending phrase in the failure rather than dumping the whole document.
     */
    const assertNoVerdict = async (context: string) => {
      const text = (await page.locator("body").innerText()).replace(
        /\s+/g,
        " ",
      );
      for (const pattern of banned) {
        expect(
          text,
          `${context}: rendered a banned verdict matching ${pattern}`,
        ).not.toMatch(pattern);
      }
    };

    // Both branches matter, and the threshold-met branch is the one the verdicts lived
    // in — so checking only the default month would have missed them entirely.
    await assertNoVerdict("under the threshold");

    await page
      .getByRole("button", { name: `Show ${fixture.lastMonthLabel}` })
      .first()
      .click();
    await expect(
      page.getByText(`${PREVIOUS_MONTH_HOURS} / 80 hours`),
    ).toBeVisible();

    await assertNoVerdict("at or over the threshold");
  });

  test("the review-period anchor round-trips a reload without bumping the Dexie version", async ({
    page,
  }) => {
    // W5's last acceptance criterion, as a runnable observable.
    //
    // `git diff src/lib/db.ts` being empty proves nobody edited the schema file. It
    // does NOT prove that persisting a new optional field inside an unindexed nested
    // object leaves the database version alone — that depends on `profiles: "id"`
    // indexing only `id`, which is a fact about IndexedDB rather than about the diff.
    // `fake-indexeddb` cannot settle it. This can.
    const fixture = await seed(page);
    await page.goto("/tracking", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /tell us your dates/i }).click();
    await page.getByRole("button", { name: /i'm applying/i }).click();

    // `<input type="month">` is a real widget here. jsdom treats it as a text box, so
    // this is the only place the YYYY-MM contract can actually be checked.
    const monthInput = page.locator('input[type="month"]');
    await expect(monthInput).toBeVisible();
    await monthInput.fill(fixture.thisMonth);
    await expect(monthInput).toHaveValue(/^\d{4}-\d{2}$/);

    await page.getByRole("button", { name: "Save", exact: true }).click();

    // 42 CFR 435.556(a)(1): the months IMMEDIATELY PRECEDING the application month.
    // The fixture's notice says 2 months, so the period is the two months before the
    // application month — and the application month itself must NOT be listed, which
    // is the off-by-one that would assess a month the state may not assess.
    await expect(
      page.getByRole("heading", { name: /months your state may look at/i }),
    ).toBeVisible();
    await expect(
      page.getByText(`${FIXTURE_MONTHS_REQUIRED} months in the period`),
    ).toBeVisible();
    await expect(
      page.getByText(`${FIXTURE_MONTHS_REQUIRED} months required`),
    ).toBeVisible();
    await expect(page.getByText(fixture.lastMonthLabel).first()).toBeVisible();

    // Survives a full reload, from real storage.
    await page.reload({ waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /months your state may look at/i }),
    ).toBeVisible();

    const after = await page.evaluate(async () => {
      const dbs = await indexedDB.databases();
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("HourKeepDB");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const profile = await new Promise<{
        onboardingContext?: { reviewPeriodAnchor?: unknown };
      }>((res, rej) => {
        const r = db.transaction("profiles").objectStore("profiles").getAll();
        r.onsuccess = () => res(r.result[0]);
        r.onerror = () => rej(r.error);
      });
      const version = db.version;
      db.close();
      return {
        version,
        reportedVersion: dbs.find((d) => d.name === "HourKeepDB")?.version,
        anchor: profile?.onboardingContext?.reviewPeriodAnchor ?? null,
      };
    });

    expect(after.anchor).toEqual({
      kind: "application",
      month: fixture.thisMonth,
    });
    expect(after.version).toBe(fixture.version);
    expect(after.reportedVersion).toBe(fixture.version);
  });

  test("the new month controls fit a 375px viewport and are usable by touch", async ({
    page,
  }) => {
    const fixture = await seed(page);
    await page.goto("/tracking", { waitUntil: "networkidle" });

    // Horizontal scroll on a phone is a layout bug, not a preference.
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    // 44x44 is this project's touch-target standard (WCAG 2.2 AAA SC 2.5.5).
    // component-standards.md notes the theme sets no minimum, so these controls carry
    // it themselves until W10 fixes it centrally.
    for (const name of [
      `Show ${fixture.lastMonthLabel}`,
      /tell us your dates/i,
    ]) {
      const control = page.getByRole("button", { name }).first();
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box, String(name)).not.toBeNull();
      expect(box!.height, String(name)).toBeGreaterThanOrEqual(44);
      expect(box!.width, String(name)).toBeGreaterThanOrEqual(44);
    }

    // Every icon-only navigation control carries a label naming its destination, not a
    // direction. "Previous month" tells a screen-reader user nothing about where they
    // will land, and these are the only route to the months a state actually assesses.
    const unlabelled = await page
      .locator("button:not([aria-label])")
      .evaluateAll(
        (buttons) =>
          buttons.filter((b) => (b.textContent ?? "").trim() === "").length,
      );
    expect(unlabelled).toBe(0);
  });
});
