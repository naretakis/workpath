/**
 * W0 § 0.3.4 — onboarding saved the assessment twice, and the surviving row lost
 * `noticeContext`.
 *
 * ## What actually happens, verified against the code
 *
 * 1. `AssessmentFlow.completeAssessment` builds a local `finalResponses` that
 *    INCLUDES `noticeContext` (`AssessmentFlow.tsx:342-352`) and writes it via
 *    `saveAssessmentResult` (`:358`).
 * 2. The user then clicks through to tracking, `handleStartTracking` fires
 *    (`:375-379`) and calls `onComplete(responses, ...)` — the component STATE,
 *    which never had `noticeContext` written into it.
 * 3. `onboarding/page.tsx:106` called `saveAssessmentResult(profileId, responses,
 *    recommendation)` a second time.
 * 4. `saveAssessmentResult` archives any existing result before inserting
 *    (`assessment.ts:102-124`), so the second call moved the good row into
 *    `assessmentHistory` and inserted a worse one.
 *
 * Net effect of a first-time onboarding: one spurious `assessmentHistory` row, and
 * a surviving `assessmentResults` row with `noticeContext === undefined`.
 *
 * ## Why that field matters
 *
 * `noticeContext` carries how many months the state said to document and the
 * response deadline. Under 42 CFR 435.558 the response window is 30 days from
 * receipt with a 5-day receipt presumption — roughly 35 days — and the notice must
 * state which months are being assessed (42 CFR 435.556). Losing it means the app
 * cannot show the user their own deadline. `how-to-hourkeep/page.tsx:74` reads
 * `latestResult.responses.noticeContext` to prefill on return, so it read exactly
 * the field the onboarding path destroyed.
 *
 * ## The wave file's prescribed fix is not applicable
 *
 * `wave-0-safety-net.md` § 0.3.4 says to "pass `finalResponses` rather than
 * `responses`" at `onboarding/page.tsx:106`. `finalResponses` is a local `const`
 * inside `completeAssessment` and does not exist in that file — the identifier is
 * not in scope anywhere in `onboarding/page.tsx`. The real loss site is
 * `AssessmentFlow.tsx:378`.
 *
 * Fixed two ways, both needed:
 *   - `completeAssessment` now commits `finalResponses` to component state, so the
 *     `responses` handed to `onComplete` carries `noticeContext`.
 *   - the duplicate write at `onboarding/page.tsx:106` is removed. It is safe to
 *     remove: `advanceStep("gettingStarted")` at `:369` is the ONLY way to reach
 *     the step whose button calls `onComplete`, and it runs only after
 *     `saveAssessmentResult` has already succeeded. Verified by grep — the string
 *     `"gettingStarted"` is set nowhere else.
 *
 * That also makes the two `AssessmentFlow` consumers symmetric: neither writes the
 * assessment result, because `AssessmentFlow` already did. `how-to-hourkeep`'s
 * `handleComplete` never wrote one.
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

import { db } from "@/lib/db";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";
import type { AssessmentResponses, Recommendation } from "@/types/assessment";

const USER = "profile-1";
const MONTHS_REQUIRED = 3;
const DEADLINE = "2026-09-30";

/** A date of birth that makes the person 17 today, tripping the age branch. */
function dobUnder19(): string {
  const today = new Date();
  const d = new Date(
    today.getFullYear() - 17,
    today.getMonth(),
    today.getDate() - 1,
  );
  return d.toISOString().slice(0, 10);
}

async function settle() {
  await new Promise((r) => setTimeout(r, 30));
}

/** Click the radio whose value matches, then Next. */
async function chooseAndAdvance(value: string) {
  const radios = screen.queryAllByRole("radio") as HTMLInputElement[];
  const target = radios.find((r) => r.value === value);
  if (!target) throw new Error(`no radio with value "${value}"`);
  fireEvent.click(target);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: /^next$/i }));
  await settle();
}

/**
 * Drive the shortest real path to completion.
 *
 * notice(yes) -> notice details(months) -> "what would you like to do"(check)
 * -> date of birth. A DOB under 19 trips 42 CFR 435.553(a)(1) and
 * `handleExemptionContinue` short-circuits straight into `completeAssessment`,
 * so the work and activities steps are never reached. That keeps this test to
 * four interactions instead of a dozen.
 */
async function driveToGettingStarted() {
  await settle();

  // Step 0 — have you received a notice?
  await chooseAndAdvance("yes");

  // Step 1 — how many months does it say? Deadline is prefilled from
  // initialNoticeContext, so only the month choice is needed.
  await chooseAndAdvance(String(MONTHS_REQUIRED));

  // Step 2 — check my situation, rather than skip.
  await chooseAndAdvance("check");

  // Step 3 — date of birth.
  const dateInput = document.querySelector(
    'input[type="date"]',
  ) as HTMLInputElement | null;
  if (!dateInput) throw new Error("no date input on the date-of-birth step");
  fireEvent.change(dateInput, { target: { value: dobUnder19() } });
  await settle();
  fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

  // completeAssessment writes, then advances to gettingStarted.
  await waitFor(() => expect(db.assessmentResults.count()).resolves.toBe(1));
  await settle();
}

beforeEach(async () => {
  await Promise.all([
    db.assessmentResults.clear(),
    db.assessmentHistory.clear(),
    db.assessmentProgress.clear(),
    db.profiles.clear(),
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

afterAll(async () => {
  db.close();
});

describe("completing the assessment writes exactly one result", () => {
  it("stores one row and no history entry on a first run", async () => {
    render(
      <AssessmentFlow
        userId={USER}
        showIntro={false}
        saveProgress={false}
        initialNoticeContext={{
          hasNotice: true,
          monthsRequired: MONTHS_REQUIRED,
          deadline: DEADLINE,
        }}
        onComplete={vi.fn()}
      />,
    );

    await driveToGettingStarted();

    expect(await db.assessmentResults.count()).toBe(1);
    // A spurious archive is the signature of the double write.
    expect(await db.assessmentHistory.count()).toBe(0);
  });

  it("the stored row carries noticeContext, which is where the deadline lives", async () => {
    render(
      <AssessmentFlow
        userId={USER}
        showIntro={false}
        saveProgress={false}
        initialNoticeContext={{
          hasNotice: true,
          monthsRequired: MONTHS_REQUIRED,
          deadline: DEADLINE,
        }}
        onComplete={vi.fn()}
      />,
    );

    await driveToGettingStarted();

    const [stored] = await db.assessmentResults.toArray();
    expect(stored.responses.noticeContext).toBeDefined();
    expect(stored.responses.noticeContext?.monthsRequired).toBe(
      MONTHS_REQUIRED,
    );
    expect(stored.responses.noticeContext?.deadline).toEqual(
      new Date(DEADLINE),
    );
  });
});

describe("the onComplete payload matches what was stored", () => {
  it("hands the caller responses that include noticeContext", async () => {
    // THE HANDOFF THIS FIX EXISTS FOR. handleStartTracking passed the component
    // `responses` state, which never had noticeContext merged into it, so any
    // consumer that persisted it wrote a strictly worse record than the one
    // completeAssessment had already saved.
    const onComplete =
      vi.fn<
        (
          r: AssessmentResponses,
          rec: Recommendation,
          n: { hasNotice: boolean; monthsRequired?: number; deadline?: string },
        ) => void
      >();

    render(
      <AssessmentFlow
        userId={USER}
        showIntro={false}
        saveProgress={false}
        initialNoticeContext={{
          hasNotice: true,
          monthsRequired: MONTHS_REQUIRED,
          deadline: DEADLINE,
        }}
        onComplete={onComplete}
      />,
    );

    await driveToGettingStarted();

    const startButton = await waitFor(() =>
      screen.getByRole("button", { name: /start using hourkeep/i }),
    );
    fireEvent.click(startButton);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));

    const [responses] = onComplete.mock.calls[0];
    expect(responses.noticeContext).toBeDefined();
    expect(responses.noticeContext?.monthsRequired).toBe(MONTHS_REQUIRED);
  });

  it("the payload agrees with the stored row, so persisting it would not regress the record", async () => {
    const onComplete = vi.fn();

    render(
      <AssessmentFlow
        userId={USER}
        showIntro={false}
        saveProgress={false}
        initialNoticeContext={{
          hasNotice: true,
          monthsRequired: MONTHS_REQUIRED,
          deadline: DEADLINE,
        }}
        onComplete={onComplete}
      />,
    );

    await driveToGettingStarted();
    fireEvent.click(
      await waitFor(() =>
        screen.getByRole("button", { name: /start using hourkeep/i }),
      ),
    );
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));

    const [payloadResponses] = onComplete.mock.calls[0] as [
      AssessmentResponses,
    ];
    const [stored] = await db.assessmentResults.toArray();

    expect(payloadResponses.noticeContext?.monthsRequired).toBe(
      stored.responses.noticeContext?.monthsRequired,
    );
    expect(payloadResponses.exemption).toEqual(stored.responses.exemption);
  });

  it("clicking through to tracking does not write a second result", async () => {
    // Guards the whole point: whatever the consumer does, AssessmentFlow itself
    // must not produce a second row or an archive.
    const onComplete = vi.fn();

    render(
      <AssessmentFlow
        userId={USER}
        showIntro={false}
        saveProgress={false}
        initialNoticeContext={{
          hasNotice: true,
          monthsRequired: MONTHS_REQUIRED,
          deadline: DEADLINE,
        }}
        onComplete={onComplete}
      />,
    );

    await driveToGettingStarted();
    fireEvent.click(
      await waitFor(() =>
        screen.getByRole("button", { name: /start using hourkeep/i }),
      ),
    );
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    await settle();

    expect(await db.assessmentResults.count()).toBe(1);
    expect(await db.assessmentHistory.count()).toBe(0);
  });
});

describe("saveAssessmentResult's archive-then-insert is what made the duplicate destructive", () => {
  it("calling it twice for the same user archives the first and keeps only the second", async () => {
    // Pinned so the reason the duplicate mattered is recorded, not just the fact.
    // This is correct behaviour for a genuine re-screening — it is only harmful
    // when the two calls describe the SAME screening, which is what onboarding did.
    const { saveAssessmentResult } = await import("@/lib/storage/assessment");

    const withNotice = {
      exemption: {},
      hasJob: false,
      noticeContext: { monthsRequired: 3, deadline: new Date(DEADLINE) },
    } as unknown as AssessmentResponses;
    const withoutNotice = {
      exemption: {},
      hasJob: false,
    } as unknown as AssessmentResponses;
    const recommendation = {
      primaryMethod: "hour-tracking",
      reasoning: "x",
      alternativeMethods: [],
      complianceStatus: "needs-increase",
      estimatedEffort: "high",
    } as Recommendation;

    await saveAssessmentResult(USER, withNotice, recommendation);
    await saveAssessmentResult(USER, withoutNotice, recommendation);

    expect(await db.assessmentResults.count()).toBe(1);
    expect(await db.assessmentHistory.count()).toBe(1);

    const [survivor] = await db.assessmentResults.toArray();
    expect(survivor.responses.noticeContext).toBeUndefined();
  });
});

describe("no AssessmentFlow consumer writes the assessment result itself", () => {
  // A source-level guard, and labelled as one. The behavioural tests above cover
  // AssessmentFlow; they cannot cover onboarding's handler, because reaching it in
  // jsdom means driving profile creation and the whole flow through a page that
  // redirects on mount. This asserts the specific thing that regressed instead.
  //
  // Follows the pattern already established by `src/__tests__/no-verdict.source.test.ts`.

  const CONSUMERS = [
    "src/app/onboarding/page.tsx",
    "src/app/how-to-hourkeep/page.tsx",
  ] as const;

  it.each(CONSUMERS)("%s does not call saveAssessmentResult", async (file) => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(file, "utf8");

    // Strip comments first: this file's own explanation of the bug names the
    // function repeatedly, and a naive search would match the prose that exists
    // to prevent the bug coming back.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    expect(code).not.toMatch(/saveAssessmentResult\s*\(/);
  });

  it("AssessmentFlow remains the single writer", async () => {
    const { readFileSync } = await import("node:fs");
    const code = readFileSync(
      "src/components/assessment/AssessmentFlow.tsx",
      "utf8",
    )
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    const calls = code.match(/saveAssessmentResult\s*\(/g) ?? [];
    expect(calls).toHaveLength(1);
  });
});
