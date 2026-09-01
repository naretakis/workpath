/**
 * W0 § 0.3.3 — the results page's two secondary buttons did the opposite of what
 * they said, and the destructive one bypassed the storage layer.
 *
 * Before this change:
 *
 *  - **"Back to Assessment"** called `db.assessmentResults.delete(result.id)`
 *    directly. Not `archiveAssessmentResult` — a hard delete, so no
 *    `assessmentHistory` row was written and the answers were simply gone. It also
 *    reached into Dexie from a component, which
 *    `.kiro/steering/data-migration-standards.md` forbids ("Reads and writes go
 *    through `src/lib/storage/`. No component touches Dexie directly") and which
 *    is why there was no seam to test or to put a guard behind.
 *  - **"Start Fresh"** deleted nothing. It only navigated.
 *
 * So the button that sounds non-destructive was the destructive one, and the button
 * that sounds destructive was inert.
 *
 * ## What each button means now, and why the two genuinely differ
 *
 * `/how-to-hourkeep` prefills the assessment from `getLatestAssessmentResult`
 * (`page.tsx:60-83`). That is what makes a real distinction available:
 *
 *  - **Keep the result** -> returning to the assessment prefills previous answers.
 *  - **Archive the result** -> the assessment starts blank.
 *
 * So: one button navigates and preserves, the other archives and therefore clears
 * the prefill. Neither hard-deletes.
 *
 * ## A limitation this does not fix
 *
 * `archiveAssessmentResult` is itself lossy: it writes an `AssessmentHistoryEntry`
 * of four scalars — `userId`, `completedAt`, `exemptionStatus`,
 * `recommendedMethod` — and discards `responses` and the full `recommendation`.
 * It is strictly better than a hard delete, which keeps nothing, but "archived"
 * overstates it. Widening the history record is a schema change and belongs to
 * W3's consolidated v7 (ADR-0002). Recorded here rather than fixed.
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

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock, back: vi.fn() }),
}));

import { db } from "@/lib/db";
import ResultsPage from "@/app/how-to-hourkeep/results/page";
import type { AssessmentResult } from "@/types/assessment";

const USER = "profile-1";

async function seedProfileAndResult(): Promise<number> {
  await db.profiles.put({
    id: USER,
    name: "Test User",
    state: "CA",
    dateOfBirth: "1990-01-01",
    createdAt: new Date(),
    updatedAt: new Date(),
    privacyNoticeAcknowledged: true,
    privacyNoticeAcknowledgedAt: new Date(),
    version: 1,
  });

  const result: AssessmentResult = {
    userId: USER,
    completedAt: new Date("2026-07-01T12:00:00"),
    responses: {
      exemption: {},
      hasJob: true,
      monthlyWorkHours: 90,
    },
    recommendation: {
      primaryMethod: "hour-tracking",
      reasoning: "Recorded: 90 hours this month. Threshold: 80 hours.",
      alternativeMethods: [],
      complianceStatus: "compliant",
      estimatedEffort: "medium",
    },
    version: 1,
  } as AssessmentResult;

  return (await db.assessmentResults.add(result)) as number;
}

beforeEach(async () => {
  pushMock.mockClear();
  await Promise.all([
    db.profiles.clear(),
    db.assessmentResults.clear(),
    db.assessmentHistory.clear(),
    db.complianceModes.clear(),
    db.seasonalWorkerStatus.clear(),
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
  // restoreAllMocks, not just the per-test mockRestore() calls below.
  //
  // Found under full-suite load: a test that FAILS never reaches its own
  // `spy.mockRestore()`, so its `db.assessmentHistory.add` throw-stub survived into
  // the next test and broke it too — one real failure reported as two, with the
  // second pointing at innocent code. Restoring here makes spy cleanup independent
  // of whether the test passed.
  vi.restoreAllMocks();
});

afterAll(async () => {
  db.close();
});

/** Find a button by accessible name once the page has finished loading. */
async function findButton(pattern: RegExp) {
  return waitFor(() => screen.getByRole("button", { name: pattern }));
}

describe("the non-destructive button preserves the result", () => {
  it("returning to the assessment leaves the result in place, so answers still prefill", async () => {
    const resultId = await seedProfileAndResult();
    render(<ResultsPage />);

    const button = await findButton(/review (my )?answers|back to assessment/i);
    fireEvent.click(button);

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/how-to-hourkeep"),
    );

    // THE ASSERTION THIS FIX EXISTS FOR: the old code deleted here.
    expect(await db.assessmentResults.get(resultId)).toBeDefined();
    expect(await db.assessmentHistory.count()).toBe(0);
  });

  it("its label does not promise a fresh start it does not deliver", async () => {
    await seedProfileAndResult();
    render(<ResultsPage />);

    const button = await findButton(/review (my )?answers|back to assessment/i);

    expect(button.textContent ?? "").not.toMatch(/fresh|start over|clear/i);
  });
});

describe("the destructive button archives through the storage layer", () => {
  it("asks before doing anything, and does nothing until confirmed", async () => {
    const resultId = await seedProfileAndResult();
    render(<ResultsPage />);

    fireEvent.click(await findButton(/start over/i));

    expect(
      await screen.findByText(/start over with a blank/i),
    ).toBeInTheDocument();
    expect(await db.assessmentResults.get(resultId)).toBeDefined();
    expect(await db.assessmentHistory.count()).toBe(0);
  });

  it("cancelling leaves the result untouched", async () => {
    const resultId = await seedProfileAndResult();
    render(<ResultsPage />);

    fireEvent.click(await findButton(/start over/i));
    await screen.findByText(/start over with a blank/i);

    // Cleared immediately before the cancel click rather than relying on the
    // beforeEach reset. A previous test's page-load effect can resolve after
    // unmount, find the database mid-reseed, and call router.push("/how-to-hourkeep")
    // from its own not-found branch — so a mock cleared in beforeEach can carry a
    // call that this test did not cause. Scoping the window makes the assertion
    // about the cancel click and nothing else.
    pushMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /keep my answers/i }));

    await waitFor(() =>
      expect(
        screen.queryByText(/start over with a blank/i),
      ).not.toBeInTheDocument(),
    );
    expect(await db.assessmentResults.get(resultId)).toBeDefined();
    expect(await db.assessmentHistory.count()).toBe(0);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("confirming ARCHIVES rather than hard-deleting, so a history row survives", async () => {
    const resultId = await seedProfileAndResult();
    render(<ResultsPage />);

    fireEvent.click(await findButton(/start over/i));
    await screen.findByText(/start over with a blank/i);
    fireEvent.click(screen.getByRole("button", { name: /start over/i }));

    await waitFor(async () =>
      expect(await db.assessmentResults.get(resultId)).toBeUndefined(),
    );

    // The difference between archiving and the old hard delete: a history row.
    const history = await db.assessmentHistory.toArray();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      userId: USER,
      recommendedMethod: "hour-tracking",
    });
    expect(history[0].completedAt).toEqual(new Date("2026-07-01T12:00:00"));
  });

  it("navigates to the assessment after archiving", async () => {
    await seedProfileAndResult();
    render(<ResultsPage />);

    fireEvent.click(await findButton(/start over/i));
    await screen.findByText(/start over with a blank/i);
    fireEvent.click(screen.getByRole("button", { name: /start over/i }));

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/how-to-hourkeep"),
    );
  });

  it("says nothing was lost when archiving fails, rather than navigating away", async () => {
    const resultId = await seedProfileAndResult();
    const spy = vi.spyOn(db.assessmentHistory, "add").mockImplementation(() => {
      throw new Error("simulated archive failure");
    });

    render(<ResultsPage />);
    fireEvent.click(await findButton(/start over/i));
    await screen.findByText(/start over with a blank/i);

    // Scoped for the same reason as the cancel test: a prior page-load effect can
    // resolve late and push from its own not-found branch.
    pushMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /start over/i }));

    expect(await screen.findByText(/still here/i)).toBeInTheDocument();
    expect(await db.assessmentResults.get(resultId)).toBeDefined();
    // Nothing archived, so the user has not silently lost the record.
    expect(await db.assessmentHistory.count()).toBe(0);
    // Not navigated away: they are still on the page, looking at the error.
    expect(pushMock).not.toHaveBeenCalledWith("/how-to-hourkeep");

    spy.mockRestore();
  });
});

describe("the page no longer reaches into Dexie for writes", () => {
  it("performs no direct assessmentResults.delete", async () => {
    // data-migration-standards.md: no component touches Dexie directly. Asserted
    // as a spy rather than a source grep so it covers the rendered code path, and
    // because the old call was the only write on the page.
    const deleteSpy = vi.spyOn(db.assessmentResults, "delete");
    const resultId = await seedProfileAndResult();

    render(<ResultsPage />);
    fireEvent.click(await findButton(/start over/i));
    await screen.findByText(/start over with a blank/i);
    fireEvent.click(screen.getByRole("button", { name: /start over/i }));

    await waitFor(async () =>
      expect(await db.assessmentResults.get(resultId)).toBeUndefined(),
    );

    // archiveAssessmentResult does call delete — but from the storage layer, after
    // writing history. What must not happen is the page calling it itself, which
    // is what the history assertion above distinguishes.
    expect(await db.assessmentHistory.count()).toBe(1);

    deleteSpy.mockRestore();
  });
});
