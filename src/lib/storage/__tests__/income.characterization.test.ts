/**
 * CHARACTERIZATION TESTS — src/lib/storage/income.ts
 *
 * Added by W0 § 0.2. This is the highest-value file in the wave's test scope:
 * three separate confirmed defects live in this module, and every one of them
 * reports a number to a user who is deciding whether they will keep their health
 * coverage. W0 fixes NONE of them. It pins them, with the CFR citation each
 * violates and the wave that owns the correction.
 *
 * The three:
 *
 *  1. **`monthlyEquivalent` is summed across entries** (`getMonthlyIncomeSummary`,
 *     `calculateSeasonalAverage`). Each row already stores a WHOLE-MONTH
 *     projection, so two bi-weekly paychecks of $400 produce
 *     868 + 868 = $1,736 rather than $868. Audit § 4.1, highest severity.
 *     Owned by **W7a**.
 *
 *  2. **The seasonal window includes the assessed month.** 42 CFR 435.552(g)
 *     averages the 6 months PRECEDING the month being assessed, excluding it.
 *     `getLast6Months("2026-07")` returns February through July — it includes July
 *     and drops January, so it is off by one in both directions. Owned by **W7a**.
 *
 *  3. **The divisor is a hardcoded 6** regardless of how many months hold data,
 *     so a user with one month of records has that month divided by six.
 *     Owned by **W7a**.
 *
 * ## Harness note: import order is load-bearing
 *
 * `fake-indexeddb/auto` MUST be imported before anything that reaches `@/lib/db`,
 * because `db.ts` instantiates Dexie at module load and Dexie binds
 * `globalThis.indexedDB` at construction. It is imported per-file rather than in
 * `vitest.setup.ts` deliberately: a global shim would make this ordering
 * constraint invisible to the next person, and the guard tests do not need a
 * database.
 */

import "fake-indexeddb/auto";

import { describe, it, expect, beforeEach, afterAll } from "vitest";

import { db } from "@/lib/db";
import {
  saveIncomeEntry,
  updateIncomeEntry,
  getIncomeEntryById,
  getIncomeEntriesByMonth,
  getIncomeEntriesForLast6Months,
  calculateSeasonalAverage,
  getMonthlyIncomeSummary,
  setComplianceMode,
  getComplianceMode,
  setSeasonalWorkerStatus,
  getSeasonalWorkerStatus,
} from "@/lib/storage/income";
import { calculateMonthlyEquivalent } from "@/lib/utils/payPeriodConversion";
import type { IncomeEntry } from "@/types/income";

const USER = "user-1";
const OTHER_USER = "user-2";

/**
 * Build an entry the way the UI does: `monthlyEquivalent` is computed by
 * `calculateMonthlyEquivalent` at capture time and stored. That is the input to
 * defect 1, so the fixture must not shortcut it.
 */
function entry(
  date: string,
  amount: number,
  payPeriod: IncomeEntry["payPeriod"],
  overrides: Partial<IncomeEntry> = {},
): Omit<IncomeEntry, "id" | "createdAt" | "updatedAt"> {
  return {
    userId: USER,
    date,
    amount,
    payPeriod,
    monthlyEquivalent: calculateMonthlyEquivalent(amount, payPeriod),
    ...overrides,
  };
}

beforeEach(async () => {
  await Promise.all([
    db.incomeEntries.clear(),
    db.complianceModes.clear(),
    db.seasonalWorkerStatus.clear(),
  ]);
});

afterAll(async () => {
  db.close();
});

describe("income entry round-trip", () => {
  it("saves an entry and returns its autoincrement id", async () => {
    const id = await saveIncomeEntry(entry("2026-07-10", 400, "bi-weekly"));

    expect(typeof id).toBe("number");
    const stored = await getIncomeEntryById(id);
    expect(stored).toMatchObject({
      userId: USER,
      date: "2026-07-10",
      amount: 400,
      payPeriod: "bi-weekly",
      monthlyEquivalent: 868,
    });
  });

  it("stamps createdAt and updatedAt on save, and moves updatedAt on update", async () => {
    const id = await saveIncomeEntry(entry("2026-07-10", 400, "bi-weekly"));
    const created = await getIncomeEntryById(id);
    expect(created?.createdAt).toBeInstanceOf(Date);
    expect(created?.updatedAt).toBeInstanceOf(Date);

    await updateIncomeEntry(id, { amount: 500 });
    const updated = await getIncomeEntryById(id);

    expect(updated?.amount).toBe(500);
    expect(updated?.createdAt?.getTime()).toBe(created?.createdAt?.getTime());
    expect(updated?.updatedAt?.getTime()).toBeGreaterThanOrEqual(
      created!.updatedAt!.getTime(),
    );
  });

  it("CHARACTERIZATION: updating `amount` does NOT recompute `monthlyEquivalent`", async () => {
    // The derived value is stored, so an update that changes the input leaves the
    // projection stale. .kiro/steering/data-migration-standards.md says "store the
    // input, derive the output" for exactly this reason: "cached derived values go
    // stale the moment a policy value or formula changes, and both will change."
    //
    // The UI happens to recompute and pass `monthlyEquivalent` alongside `amount`,
    // so this is latent rather than active — but the storage layer offers no
    // protection. Owned by W7a alongside the double-counting fix.
    const id = await saveIncomeEntry(entry("2026-07-10", 400, "bi-weekly"));
    await updateIncomeEntry(id, { amount: 100 });

    const stored = await getIncomeEntryById(id);
    expect(stored?.amount).toBe(100);
    expect(stored?.monthlyEquivalent).toBe(868); // still the $400 projection
  });

  it("returns undefined for an id that does not exist", async () => {
    expect(await getIncomeEntryById(9999)).toBeUndefined();
  });

  /**
   * REMOVED, and replaced rather than simply deleted.
   *
   * A characterization test here pinned that `deleteIncomeEntry` removed only the
   * entry row, orphaning `incomeDocuments` and `incomeDocumentBlobs` — W0 § 0.3's
   * second data-loss bug. It was written expecting the narrow function to SURVIVE
   * alongside a new cascading sibling, as on the activity side.
   *
   * It does not survive. `src/lib/storage/activities.ts` exports no narrow
   * `deleteActivity` — the bare row delete is internal to
   * `deleteActivityWithDocuments` — so exact symmetry meant removing the narrow
   * income export too. Keeping it would have left a trap: same argument, reads as
   * the obvious choice, silently orphans blobs that nothing reclaims (there is no
   * income counterpart to `cleanupOrphanedDocuments`).
   *
   * The behaviour it pinned is now covered from the other side, in
   * `deleteIncomeEntryWithDocuments.test.ts`: the cascade removes documents and
   * blobs, spares other entries' documents, and preserves the entry when a
   * document delete fails.
   */
});

describe("getIncomeEntriesByMonth: string-range query scoped by user", () => {
  it("returns only entries inside the YYYY-MM range", async () => {
    await saveIncomeEntry(entry("2026-06-30", 100, "monthly"));
    await saveIncomeEntry(entry("2026-07-01", 200, "monthly"));
    await saveIncomeEntry(entry("2026-07-31", 300, "monthly"));
    await saveIncomeEntry(entry("2026-08-01", 400, "monthly"));

    const july = await getIncomeEntriesByMonth(USER, "2026-07");

    expect(july.map((e) => e.date).sort()).toEqual([
      "2026-07-01",
      "2026-07-31",
    ]);
  });

  it("excludes another user's entries in the same month", async () => {
    await saveIncomeEntry(entry("2026-07-10", 100, "monthly"));
    await saveIncomeEntry(
      entry("2026-07-11", 900, "monthly", { userId: OTHER_USER }),
    );

    const mine = await getIncomeEntriesByMonth(USER, "2026-07");

    expect(mine).toHaveLength(1);
    expect(mine[0].amount).toBe(100);
  });

  it("uses an inclusive `-01` to `-31` string bound, so short months work by lexical ordering", async () => {
    // The bound is literally `${month}-01` to `${month}-31`. For February the upper
    // bound is the non-existent "2026-02-31", which still sorts after "2026-02-28",
    // so the query is correct — by string ordering rather than by calendar logic.
    // Recorded because W5 replaces month scoping and may switch to date objects,
    // at which point "2026-02-31" becomes an invalid Date rather than a safe bound.
    //
    // Asserted by including the last real day of a 28-day month AND a leap day,
    // both of which a calendar-aware upper bound would have to compute and a
    // string bound gets for free.
    await saveIncomeEntry(entry("2026-02-28", 250, "monthly"));
    await saveIncomeEntry(entry("2028-02-29", 260, "monthly"));

    const feb2026 = await getIncomeEntriesByMonth(USER, "2026-02");
    const feb2028 = await getIncomeEntriesByMonth(USER, "2028-02");

    expect(feb2026.map((e) => e.date)).toEqual(["2026-02-28"]);
    expect(feb2028.map((e) => e.date)).toEqual(["2028-02-29"]);
  });

  it("CHARACTERIZATION: a day-32 date would also be captured, because the bound is textual not calendrical", async () => {
    // "2026-07-32" is not a date, but it sorts inside "2026-07-01".."2026-07-31"?
    // No — it sorts AFTER "2026-07-31", so it is excluded. Pinned to record that
    // the range is a string comparison with no validation on either side: nothing
    // stops an invalid `date` being written, and whether it is found depends on
    // lexical position rather than on being a real day.
    await saveIncomeEntry(entry("2026-07-32", 999, "monthly"));

    const july = await getIncomeEntriesByMonth(USER, "2026-07");

    expect(july).toHaveLength(0);
    expect(await db.incomeEntries.count()).toBe(1); // written, but unfindable
  });

  it("returns an empty array for a month with no entries", async () => {
    expect(await getIncomeEntriesByMonth(USER, "2026-07")).toEqual([]);
  });
});

describe("DEFECT 1 — monthlyEquivalent is summed across entries (audit § 4.1)", () => {
  // CHARACTERIZATION: current behaviour is incorrect.
  //
  // Each row's `monthlyEquivalent` is already a whole-month projection of that
  // pay period. Adding two of them projects the month twice. 42 CFR 435.552(f)(2)
  // measures MAGI-based income for the MAGI-based household for the month; it does
  // not sum per-paycheck monthly projections. CMS-2454-IFC, 91 FR 33348
  // (June 3, 2026).
  //
  // Direction of harm: this OVERSTATES income, so it tells a user they clear the
  // threshold when they may not. That is the failure mode this project cannot
  // absorb — someone told they are fine, who then does not respond to a notice.
  //
  // Corrected in **W7a** (gap 5.4, 5.5 / audit § 4.1).

  it("currently reports $1,736 for two bi-weekly $400 paychecks, projecting the month twice", async () => {
    await saveIncomeEntry(entry("2026-07-03", 400, "bi-weekly"));
    await saveIncomeEntry(entry("2026-07-17", 400, "bi-weekly"));

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    // Each row stores 400 x 2.17 = 868. The month's real gross is $800.
    expect(summary.totalIncome).toBe(1736);
    expect(summary.entryCount).toBe(2);
  });

  it("currently reports $2,598 for four weekly $150 paychecks, where the real gross is $600", async () => {
    for (const date of [
      "2026-07-03",
      "2026-07-10",
      "2026-07-17",
      "2026-07-24",
    ]) {
      await saveIncomeEntry(entry(date, 150, "weekly"));
    }

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    // 150 x 4.33 = 649.5, summed four times.
    expect(summary.totalIncome).toBe(2598);
  });

  it("crosses the threshold on inflated income: $150/week reads as compliant, though the real gross is $600", async () => {
    // The user-visible consequence, stated plainly. Real monthly gross of $600
    // does clear $580 here — so pick a case where the inflation is what crosses it:
    // a single weekly $100 paycheck projects to $433 and does not clear, but two
    // of them project to $866 and do, while the real gross is $200.
    await saveIncomeEntry(entry("2026-07-03", 100, "weekly"));
    await saveIncomeEntry(entry("2026-07-10", 100, "weekly"));

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary.totalIncome).toBe(866);
    expect(summary.isCompliant).toBe(true); // real gross was $200
    expect(summary.amountNeeded).toBe(0);
  });

  it("does NOT double-count a single monthly entry, so the defect scales with entry count", async () => {
    await saveIncomeEntry(entry("2026-07-10", 800, "monthly"));

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary.totalIncome).toBe(800);
  });

  it("carries the same inflation into the incomeBySource breakdown, which is a SEPARATE summing site", async () => {
    // NOTE FOR W7a — there are THREE places that sum `monthlyEquivalent`, not one.
    // Found by mutation while pinning this defect: replacing the two `reduce`
    // accumulators (`getMonthlyIncomeSummary`'s `totalIncome` and
    // `calculateSeasonalAverage`'s `monthTotal`) left THIS test green, because
    // `incomeBySource` accumulates through `existing.monthlyEquivalent +=` and
    // `acc.push({ monthlyEquivalent: entry.monthlyEquivalent })` instead.
    //
    // So a fix applied only to the reduces would leave the per-source breakdown
    // still inflated — and the breakdown is what a user reads when deciding which
    // employer's pay stub to photograph. Grep `monthlyEquivalent` in the module,
    // do not trust the type checker.
    await saveIncomeEntry(
      entry("2026-07-03", 400, "bi-weekly", { source: "Diner" }),
    );
    await saveIncomeEntry(
      entry("2026-07-17", 400, "bi-weekly", { source: "Diner" }),
    );

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary.incomeBySource).toEqual([
      { source: "Diner", monthlyEquivalent: 1736 },
    ]);
  });

  it("groups a missing source under 'Unspecified' rather than dropping the row", async () => {
    await saveIncomeEntry(entry("2026-07-03", 300, "monthly"));
    await saveIncomeEntry(
      entry("2026-07-17", 200, "monthly", { source: "Diner" }),
    );

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary.incomeBySource).toEqual(
      expect.arrayContaining([
        { source: "Unspecified", monthlyEquivalent: 300 },
        { source: "Diner", monthlyEquivalent: 200 },
      ]),
    );
  });
});

describe("DEFECT 2 — the seasonal window includes the assessed month (42 CFR 435.552(g))", () => {
  // CHARACTERIZATION: current behaviour is incorrect per 42 CFR 435.552(g).
  //
  // The rule averages the 6 months PRECEDING the month being assessed, and the
  // assessed month is EXCLUDED. CMS's own worked example: an application filed in
  // July with a 1-month review period assesses June, and averages December
  // through May.
  //
  // `getLast6Months("2026-07")` returns 2026-02 .. 2026-07. It includes the
  // assessed month and drops the sixth preceding month, so it is off by one in
  // both directions — not merely shifted.
  //
  // Note also that 42 CFR 435.603(h)(3) gives states a "reasonably predictable
  // changes" methodology as an ALTERNATIVE to averaging, which most states elect
  // and which prorates across up to 12 months. So the corrected window is itself
  // Conditional on a state election. Owned by **W7a** (gaps 5.4, 5.5).

  it("currently returns February through July for an assessed month of July", async () => {
    // getLast6Months is module-private; observed through seasonalHistory.
    await setSeasonalWorkerStatus(USER, "2026-07", true);

    const { history } = await calculateSeasonalAverage(USER, "2026-07");

    expect(history.map((h) => h.month)).toEqual([
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
    ]);
  });

  it("currently INCLUDES the assessed month, which 42 CFR 435.552(g) excludes", async () => {
    const { history } = await calculateSeasonalAverage(USER, "2026-07");

    expect(history.map((h) => h.month)).toContain("2026-07");
  });

  it("currently DROPS the sixth preceding month, so it is off by one in both directions", async () => {
    // Correct window for an assessed month of July is January through June.
    const { history } = await calculateSeasonalAverage(USER, "2026-07");

    expect(history.map((h) => h.month)).not.toContain("2026-01");
  });

  it("lets the assessed month's own income raise the average that is compared against it", async () => {
    // The circularity the off-by-one creates: a good July inflates the July
    // average. With the correct window, July's income could not influence it.
    await setSeasonalWorkerStatus(USER, "2026-07", true);
    await saveIncomeEntry(entry("2026-07-10", 6000, "monthly"));

    const { average, history } = await calculateSeasonalAverage(
      USER,
      "2026-07",
    );

    expect(history.find((h) => h.month === "2026-07")?.total).toBe(6000);
    expect(average).toBe(1000); // 6000 / 6, entirely from the assessed month
  });

  it("crosses month boundaries correctly when the window spans a year change", async () => {
    // `new Date(year, month - 1 - i, 1)` relies on JS Date normalising a negative
    // month index into the previous year. This is correct today and must stay
    // correct — it is the one piece of date arithmetic in the module.
    const { history } = await calculateSeasonalAverage(USER, "2027-01");

    expect(history.map((h) => h.month)).toEqual([
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
      "2026-12",
      "2027-01",
    ]);
  });

  it("getIncomeEntriesForLast6Months spans the same off-by-one window", async () => {
    await saveIncomeEntry(entry("2026-01-15", 100, "monthly"));
    await saveIncomeEntry(entry("2026-02-15", 200, "monthly"));
    await saveIncomeEntry(entry("2026-07-15", 700, "monthly"));

    const found = await getIncomeEntriesForLast6Months(USER, "2026-07");

    // January is outside the window; July is inside it.
    expect(found.map((e) => e.date).sort()).toEqual([
      "2026-02-15",
      "2026-07-15",
    ]);
  });
});

describe("DEFECT 3 — the seasonal divisor is a hardcoded 6", () => {
  // CHARACTERIZATION: current behaviour divides by 6 unconditionally, whatever
  // number of months actually hold records.
  //
  // Direction of harm: this UNDERSTATES income for a user with a partial history,
  // which sends someone looking for hours they may not need. It is the mirror of
  // defect 1 and it is user-unfavourable.
  //
  // 42 CFR 435.552(g) does specify a 6-month average, so a fixed divisor of 6 is
  // not obviously wrong as a matter of law — the defect is that HourKeep holds only
  // what the user typed, so a missing month is indistinguishable from a zero-income
  // month. Whether a sparse history should be averaged over 6, over the months
  // present, or refused as insufficient evidence is a W7a decision. Pinned here so
  // that decision is visible as a change.

  it("divides by 6 even when only one month holds any income", async () => {
    await saveIncomeEntry(entry("2026-05-10", 3000, "monthly"));

    const { average } = await calculateSeasonalAverage(USER, "2026-07");

    expect(average).toBe(500); // 3000 / 6, not 3000 / 1
  });

  it("returns an average of 0 for a completely empty history rather than NaN", async () => {
    const { average, history } = await calculateSeasonalAverage(
      USER,
      "2026-07",
    );

    expect(average).toBe(0);
    expect(history).toHaveLength(6);
    expect(history.every((h) => h.total === 0)).toBe(true);
  });

  it("always reports exactly 6 history rows, zero-filling months with no entries", async () => {
    await saveIncomeEntry(entry("2026-06-10", 600, "monthly"));

    const { history } = await calculateSeasonalAverage(USER, "2026-07");

    expect(history).toHaveLength(6);
    expect(history.filter((h) => h.total === 0)).toHaveLength(5);
  });
});

describe("getMonthlyIncomeSummary: threshold comparison and the seasonal fork", () => {
  it("compares the non-seasonal month total against the threshold inclusively", async () => {
    await saveIncomeEntry(entry("2026-07-10", 580, "monthly"));

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary.totalIncome).toBe(580);
    expect(summary.isCompliant).toBe(true);
    expect(summary.amountNeeded).toBe(0);
  });

  it("reports the difference to the threshold and floors it at 0", async () => {
    await saveIncomeEntry(entry("2026-07-10", 380, "monthly"));

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    // 42 CFR 435.552(e)(2): income below the threshold is not wasted — the state
    // MAY credit monthlyIncome / federalMinimumWage as hours and combine it. CMS's
    // example is $380 / $7.25 = 52 hours, needing 28 more. This module models none
    // of that; the proxy is W7b. Recorded so the omission is visible.
    expect(summary.amountNeeded).toBe(200);
    expect(summary.isCompliant).toBe(false);
  });

  it("compares the seasonal AVERAGE, not the month total, once seasonal status is set", async () => {
    await setSeasonalWorkerStatus(USER, "2026-07", true);
    await saveIncomeEntry(entry("2026-07-10", 3000, "monthly"));

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary.totalIncome).toBe(3000);
    expect(summary.seasonalAverage).toBe(500); // 3000 / 6
    expect(summary.isCompliant).toBe(false); // 500 < 580, despite $3,000 recorded
    expect(summary.amountNeeded).toBe(80);
  });

  it("omits seasonalAverage and seasonalHistory entirely when not a seasonal worker", async () => {
    await saveIncomeEntry(entry("2026-07-10", 600, "monthly"));

    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary.isSeasonalWorker).toBe(false);
    expect(summary.seasonalAverage).toBeUndefined();
    expect(summary.seasonalHistory).toBeUndefined();
  });

  it("reads seasonal status PER MONTH, so the same user can be seasonal in one month and not another", async () => {
    await setSeasonalWorkerStatus(USER, "2026-07", true);
    await saveIncomeEntry(entry("2026-07-10", 3000, "monthly"));
    await saveIncomeEntry(entry("2026-08-10", 3000, "monthly"));

    const july = await getMonthlyIncomeSummary(USER, "2026-07");
    const august = await getMonthlyIncomeSummary(USER, "2026-08");

    expect(july.isSeasonalWorker).toBe(true);
    expect(august.isSeasonalWorker).toBe(false);
    expect(august.isCompliant).toBe(true);
  });

  it("returns a zeroed summary for a month with no entries", async () => {
    const summary = await getMonthlyIncomeSummary(USER, "2026-07");

    expect(summary).toMatchObject({
      month: "2026-07",
      totalIncome: 0,
      entryCount: 0,
      isCompliant: false,
      amountNeeded: 580,
      isSeasonalWorker: false,
    });
  });
});

describe("complianceMode and seasonalWorkerStatus: per-user, per-month upserts", () => {
  // `complianceMode` is the hours/income fork that ADR-0004 removes and W7b
  // deletes. `.kiro/steering/data-migration-standards.md` is explicit that it must
  // NOT be dropped before then — four files reference it and removing it early
  // breaks reads. Pinned so W7b's removal is a visible change rather than a
  // silent one.

  it("defaults the compliance mode to 'hours' when nothing is stored", async () => {
    expect(await getComplianceMode(USER, "2026-07")).toBe("hours");
  });

  it("upserts rather than inserting a second row for the same user and month", async () => {
    await setComplianceMode(USER, "2026-07", "income");
    await setComplianceMode(USER, "2026-07", "hours");

    expect(await db.complianceModes.where({ userId: USER }).count()).toBe(1);
    expect(await getComplianceMode(USER, "2026-07")).toBe("hours");
  });

  it("keeps compliance mode separate per month and per user", async () => {
    await setComplianceMode(USER, "2026-07", "income");
    await setComplianceMode(USER, "2026-08", "hours");
    await setComplianceMode(OTHER_USER, "2026-07", "hours");

    expect(await getComplianceMode(USER, "2026-07")).toBe("income");
    expect(await getComplianceMode(USER, "2026-08")).toBe("hours");
    expect(await getComplianceMode(OTHER_USER, "2026-07")).toBe("hours");
  });

  it("defaults seasonal worker status to false when nothing is stored", async () => {
    expect(await getSeasonalWorkerStatus(USER, "2026-07")).toBe(false);
  });

  it("upserts seasonal worker status, and can be set back to false", async () => {
    await setSeasonalWorkerStatus(USER, "2026-07", true);
    expect(await getSeasonalWorkerStatus(USER, "2026-07")).toBe(true);

    await setSeasonalWorkerStatus(USER, "2026-07", false);
    expect(await getSeasonalWorkerStatus(USER, "2026-07")).toBe(false);
    expect(await db.seasonalWorkerStatus.where({ userId: USER }).count()).toBe(
      1,
    );
  });
});
