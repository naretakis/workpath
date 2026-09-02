/**
 * No-verdict guard, part 1 of 3 — rendered output.
 *
 * Parts 2 and 3 assert on content data and on source text. This part asserts on
 * what a user actually sees, after JSX entities resolve and after conditional
 * branches pick a string. `You&apos;re Exempt` is three tokens in source and one
 * phrase on screen; only a render catches the screen form.
 *
 * SCOPE: props-driven components. The Dexie-backed pages
 * (app/settings/page.tsx, app/how-to-hourkeep/results/page.tsx) are covered by
 * part 3's source scan instead — rendering them needs fake-indexeddb, a router
 * mock, and a theme provider, and that fixture is the fragile kind of test that
 * gets disabled rather than fixed. The source scan reaches them for free.
 *
 * BOTH BRANCHES, ALWAYS. Every conditional here is exercised in both states,
 * because half of W2a's verdicts were in the branch nobody looked at —
 * app/export/page.tsx:179 and ComplianceModeSelector.tsx:132 among them.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { AssessmentBadge } from "@/components/assessment/AssessmentBadge";
import { ExemptionHistory } from "@/components/exemptions/ExemptionHistory";
import { IntroductionScreen } from "@/components/assessment/IntroductionScreen";
import { ComplianceModeSelector } from "@/components/compliance/ComplianceModeSelector";
import { RequirementFacts } from "@/components/help/RequirementFacts";
import { Dashboard } from "@/components/Dashboard";
import { CompletionMessage } from "@/components/tracking/CompletionMessage";
import { MonthNavigator } from "@/components/tracking/MonthNavigator";
import { ReviewPeriodPanel } from "@/components/tracking/ReviewPeriodPanel";
import {
  applicationReviewPeriod,
  renewalReviewPeriodEndingAt,
  FEDERAL_DEFAULT_REVIEW_PERIOD,
} from "@/lib/reviewPeriod";

import { requirementFacts } from "@/content/helpText";
import type { AssessmentResult } from "@/types/assessment";
import type { ExemptionHistory as ExemptionHistoryType } from "@/types/exemptions";

import {
  VERDICT_PHRASES,
  normaliseForGuard,
  phraseMatcher,
  formatHits,
  type VerdictHit,
} from "./support/verdictPhrases";

/**
 * Flatten the rendered DOM into text, separating every text node.
 *
 * NOT `document.body.textContent`. That concatenates adjacent elements with no
 * separator, so a heading reading "You're Exempt" followed by a sibling starting
 * with "R" becomes `You're ExemptR` — and `\byou're exempt\b` does not match,
 * because "R" is a word character and kills the trailing word boundary.
 *
 * This was a real hole, found by reintroducing the banned string and observing
 * that only the source scan went red. The render guard silently passed. Which is
 * the entire reason "prove the guard red before believing it" is an acceptance
 * criterion and not a nicety.
 */
function renderedText(): string {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];

  let node = walker.nextNode();
  while (node) {
    const value = node.nodeValue?.trim();
    if (value) parts.push(value);
    node = walker.nextNode();
  }

  return normaliseForGuard(parts.join(" \n "));
}

/** Collect every banned phrase from the rendered DOM. */
function verdictsInDom(label: string): VerdictHit[] {
  const text = renderedText();
  const hits: VerdictHit[] = [];

  for (const entry of VERDICT_PHRASES) {
    if (phraseMatcher(entry).test(text)) {
      hits.push({
        phrase: entry.phrase,
        why: entry.why,
        location: label,
        excerpt: text.trim().slice(0, 200),
      });
    }
  }

  return hits;
}

function expectNoVerdict(label: string) {
  const hits = verdictsInDom(label);
  expect(hits, formatHits(hits)).toEqual([]);
}

const NOW = new Date("2026-08-17T12:00:00Z");

function assessmentResult(isExempt: boolean): AssessmentResult {
  return {
    userId: "user-1",
    completedAt: NOW,
    version: 1,
    responses: { exemption: {} },
    recommendation: {
      primaryMethod: isExempt ? "exemption" : "hour-tracking",
      reasoning: isExempt
        ? "Your answers point at a category that may be set aside. Ask your state to check."
        : "Recorded: 46 hours this month. Threshold: 80 hours. Difference: 34.",
      alternativeMethods: [],
      complianceStatus: isExempt ? "compliant" : "needs-increase",
      estimatedEffort: "low",
    },
  } as AssessmentResult;
}

function historyEntry(isExempt: boolean): ExemptionHistoryType {
  return {
    id: isExempt ? 1 : 2,
    userId: "user-1",
    screeningDate: NOW,
    isExempt,
  };
}

const noop = () => {};

describe("ADR-0003 no-verdict guard: rendered output", () => {
  describe("AssessmentBadge", () => {
    it("apparently-excluded branch renders no verdict", () => {
      render(
        <AssessmentBadge
          result={assessmentResult(true)}
          onTakeAssessment={noop}
          onViewDetails={noop}
          onRetakeAssessment={noop}
        />,
      );
      expectNoVerdict("AssessmentBadge (apparently excluded)");
    });

    it("not-apparently-excluded branch renders no verdict", () => {
      render(
        <AssessmentBadge
          result={assessmentResult(false)}
          onTakeAssessment={noop}
          onViewDetails={noop}
          onRetakeAssessment={noop}
        />,
      );
      expectNoVerdict("AssessmentBadge (not apparently excluded)");
    });

    it("no-result branch renders no verdict", () => {
      render(
        <AssessmentBadge
          result={null}
          onTakeAssessment={noop}
          onViewDetails={noop}
          onRetakeAssessment={noop}
        />,
      );
      expectNoVerdict("AssessmentBadge (no result)");
    });

    it("still offers a way back to screening, so nothing is asserted by hiding", () => {
      // component-standards.md: suppressing UI because a user looks excluded
      // asserts a status more strongly than a sentence does. There must always be
      // a visible route back.
      render(
        <AssessmentBadge
          result={assessmentResult(true)}
          onTakeAssessment={noop}
          onViewDetails={noop}
          onRetakeAssessment={noop}
        />,
      );
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
  });

  describe("ExemptionHistory", () => {
    // This surface was MISSING from wave-2 § 2.5's table, which listed the dead
    // components/assessment/AssessmentHistory.tsx instead. It is live, rendered
    // from app/settings/page.tsx. wave-2a finding [F1].
    it("renders no verdict for either outcome", () => {
      render(
        <ExemptionHistory
          history={[historyEntry(true), historyEntry(false)]}
        />,
      );
      expectNoVerdict("ExemptionHistory (both outcomes)");
    });

    it("renders no verdict when empty", () => {
      render(<ExemptionHistory history={[]} />);
      expectNoVerdict("ExemptionHistory (empty)");
    });
  });

  describe("IntroductionScreen", () => {
    it("assessment variant renders no verdict", () => {
      render(
        <IntroductionScreen
          onGetStarted={noop}
          onSkip={noop}
          variant="assessment"
        />,
      );
      expectNoVerdict("IntroductionScreen (assessment)");
    });

    it("onboarding variant renders no verdict", () => {
      render(
        <IntroductionScreen
          onGetStarted={noop}
          onSkip={noop}
          variant="onboarding"
        />,
      );
      expectNoVerdict("IntroductionScreen (onboarding)");
    });
  });

  describe("ComplianceModeSelector", () => {
    it("hours mode renders no verdict", () => {
      render(
        <ComplianceModeSelector
          currentMode="hours"
          currentMonth="2026-08"
          onModeChange={noop}
        />,
      );
      expectNoVerdict("ComplianceModeSelector (hours)");
    });

    it("income mode renders no verdict", () => {
      render(
        <ComplianceModeSelector
          currentMode="income"
          currentMonth="2026-08"
          onModeChange={noop}
        />,
      );
      expectNoVerdict("ComplianceModeSelector (income)");
    });
  });

  describe("RequirementFacts", () => {
    it("renders no verdict", () => {
      render(<RequirementFacts />);
      expectNoVerdict("RequirementFacts");
    });

    it("42 CFR 435.559(c), 435.557(a)-(b): actually renders the reassuring facts", () => {
      // W2a § 2.3b's criterion is that this content is RENDERED, not merely
      // exported. An exported constant nobody displays fixes nothing.
      render(<RequirementFacts />);
      expect(
        screen.getByText(/probably isn't starting in January/i),
      ).toBeTruthy();
      expect(
        screen.getByText(/check its own records before it asks you/i),
      ).toBeTruthy();
      expect(screen.getByText(/be careful about saying/i)).toBeTruthy();
    });

    it("pairs every fact with a visible next action", () => {
      // Derived from the data, not hardcoded: an earlier version asserted "3" and
      // broke the moment a fourth fact was added, which is a test measuring the
      // wrong thing.
      render(<RequirementFacts />);
      expect(screen.getAllByText(/What to do:/i).length).toBe(
        requirementFacts.length,
      );
    });

    it("42 CFR 435.550: renders the scope and timing facts", () => {
      // Gaps 11.1-11.5. Georgia, Tennessee and Wisconsin are IN scope — this
      // project's own steering docs had two of them wrong and omitted the third.
      render(<RequirementFacts />);
      expect(
        screen.getByText(/43 states and the District of Columbia/i),
      ).toBeTruthy();
      expect(
        screen.getByText(/Georgia, Tennessee, and Wisconsin/i),
      ).toBeTruthy();
      expect(screen.getByText(/Puerto Rico/i)).toBeTruthy();
    });

    it("gap 11.4: renders that the adult group includes parents", () => {
      render(<RequirementFacts />);
      expect(screen.getByText(/parents are in this group too/i)).toBeTruthy();
    });

    it("renders the two dates the app never mentioned", () => {
      render(<RequirementFacts />);
      expect(screen.getByText("January 1, 2028")).toBeTruthy();
      expect(screen.getByText("December 31, 2028")).toBeTruthy();
    });
  });
});

describe("guard-the-guard: the render assertion can actually fail", () => {
  it("detects a banned phrase in rendered output, entities resolved", () => {
    // A guard never observed failing is not a guard. This renders the exact string
    // W2a removed from AssessmentBadge.tsx:154 and proves the DOM path catches it.
    render(
      <div>
        <span>You&apos;re Exempt</span>
      </div>,
    );
    const hits = verdictsInDom("fixture");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.map((h) => h.phrase)).toContain("you're exempt");
  });

  it("detects a verdict with no pronoun", () => {
    render(<div>Must Track Hours</div>);
    expect(verdictsInDom("fixture").map((h) => h.phrase)).toContain(
      "must track hours",
    );
  });

  it("does not fire on ordinary copy", () => {
    render(
      <div>
        Logged: 46 hours. Threshold: 80 hours. Difference: 34. Your state
        decides, and it must check its own records first.
      </div>,
    );
    expect(verdictsInDom("fixture")).toEqual([]);
  });
});

/**
 * W5's tracking surfaces.
 *
 * ─────────────────────────────────────────────────────────────────────────────────
 * ADDED AFTER THE W5 WAVE REVIEW, and this block is the structural fix rather than
 * the cosmetic one.
 *
 * W5 rewrote or created five month-scoped components and put NONE of them in this
 * file. Two verdicts got through as a direct result:
 *
 *   1. `Dashboard` rendered "Compliant" in green beside a tick, over "You've met the
 *      80-hour requirement!". Found by opening the built app in a browser. The
 *      source scan missed it because the banned list matched `COMPLIANT`
 *      case-sensitively to spare the `isCompliant` identifier, which also spared
 *      title case.
 *   2. `CompletionMessage` rendered "Your record covers every month" — a quantifier
 *      over the review period that nothing computed, and false under the federal
 *      default, where a renewal period is six months long and requires one. Found by
 *      an independent reviewer reading the render gate.
 *
 * The second one is the instructive failure. Its rendered branch was unreachable in
 * EVERY suite: the e2e fixture sets `monthsRequired: 2` with one qualifying month, so
 * the component returned `null` there, and the source scan cannot see a phrase it does
 * not have. A component whose only output nobody renders is a component whose copy
 * nobody checks.
 *
 * So the rule these tests encode: every branch that renders prose gets rendered here,
 * including the celebratory one. The threshold-met branch is where verdicts live,
 * because that is where the temptation is.
 * ─────────────────────────────────────────────────────────────────────────────────
 */
describe("ADR-0003 no-verdict guard: W5 month-scoped surfaces", () => {
  const summary = (totalHours: number) => ({
    month: "2026-07",
    totalHours,
    workHours: totalHours,
    volunteerHours: 0,
    educationHours: 0,
    isCompliant: totalHours >= 80,
    hoursNeeded: Math.max(80 - totalHours, 0),
  });

  describe("Dashboard", () => {
    it("renders no verdict when the month is OVER the threshold", () => {
      // The branch that used to say "Compliant".
      render(<Dashboard summary={summary(84)} threshold={80} />);
      expectNoVerdict("Dashboard (over threshold)");
    });

    it("renders no verdict when the month is under the threshold", () => {
      render(<Dashboard summary={summary(46)} threshold={80} />);
      expectNoVerdict("Dashboard (under threshold)");
    });

    it("renders no verdict at exactly the threshold", () => {
      render(<Dashboard summary={summary(80)} threshold={80} />);
      expectNoVerdict("Dashboard (exactly at threshold)");
    });
  });

  describe("CompletionMessage", () => {
    it("renders no verdict on the branch that actually renders", () => {
      // Reachable only when `monthsAtOrOverThreshold >= monthsRequired`, which is
      // why no other suite had ever rendered it.
      render(
        <CompletionMessage
          monthsAtOrOverThreshold={1}
          monthsRequired={1}
          monthsInPeriod={6}
          monthlyThreshold={80}
          reviewPeriodKind="renewal"
          onExport={noop}
          onContinueTracking={noop}
        />,
      );
      expectNoVerdict("CompletionMessage (renewal, 1 of 6)");
    });

    it("does not claim completeness it has not computed", () => {
      // The specific defect: one qualifying month out of a six-month period must not
      // read as though the record covers the period. Asserted on the rendered text
      // rather than on the phrase list, because "covers every month" is a bespoke
      // overstatement that no generic banned phrase would catch.
      render(
        <CompletionMessage
          monthsAtOrOverThreshold={1}
          monthsRequired={1}
          monthsInPeriod={6}
          monthlyThreshold={80}
          reviewPeriodKind="renewal"
          onExport={noop}
          onContinueTracking={noop}
        />,
      );

      const text = document.body.textContent ?? "";
      expect(text).not.toMatch(/every month/i);
      expect(text).not.toMatch(/\ball (of )?(the )?months\b/i);
      // And the honest form is present: both numbers, with the denominator named.
      expect(text).toMatch(/1 of 6 months/);
    });

    it("renders no verdict for an application period", () => {
      render(
        <CompletionMessage
          monthsAtOrOverThreshold={3}
          monthsRequired={3}
          monthsInPeriod={3}
          monthlyThreshold={80}
          reviewPeriodKind="application"
          onExport={noop}
          onContinueTracking={noop}
        />,
      );
      expectNoVerdict("CompletionMessage (application, 3 of 3)");
    });
  });

  describe("MonthNavigator", () => {
    it.each([
      ["past", "2026-06"],
      ["current", "2026-07"],
      ["future", "2026-08"],
    ])("renders no verdict for a %s month", (label, month) => {
      render(
        <MonthNavigator
          month={month}
          today="2026-07"
          onMonthChange={noop}
          reviewPeriodMonths={["2026-06", "2026-07"]}
        />,
      );
      expectNoVerdict(`MonthNavigator (${label})`);
    });
  });

  describe("ReviewPeriodPanel", () => {
    const hours = [
      { month: "2026-05", totalHours: 0 },
      { month: "2026-06", totalHours: 84 },
    ];

    it("renders no verdict when no anchor is known", () => {
      render(
        <ReviewPeriodPanel
          monthHours={[]}
          monthlyThreshold={80}
          pathway="hours"
          selectedMonth="2026-07"
          todayMonth="2026-07"
          onSelectMonth={noop}
          onAnchorChange={noop}
          onClearAnchor={noop}
        />,
      );
      expectNoVerdict("ReviewPeriodPanel (no anchor)");
    });

    it("renders no verdict for an application period", () => {
      render(
        <ReviewPeriodPanel
          reviewPeriod={applicationReviewPeriod("2026-07", {
            ...FEDERAL_DEFAULT_REVIEW_PERIOD,
            applicationLookbackMonths: 2,
          })}
          monthHours={hours}
          monthlyThreshold={80}
          pathway="hours"
          selectedMonth="2026-06"
          todayMonth="2026-07"
          onSelectMonth={noop}
          onAnchorChange={noop}
          onClearAnchor={noop}
        />,
      );
      expectNoVerdict("ReviewPeriodPanel (application)");
    });

    it("renders no verdict for a renewal period", () => {
      render(
        <ReviewPeriodPanel
          reviewPeriod={renewalReviewPeriodEndingAt("2026-06")}
          monthHours={hours}
          monthlyThreshold={80}
          pathway="hours"
          selectedMonth="2026-06"
          todayMonth="2026-07"
          onSelectMonth={noop}
          onAnchorChange={noop}
          onClearAnchor={noop}
        />,
      );
      expectNoVerdict("ReviewPeriodPanel (renewal)");
    });

    it("does not report an hours shortfall to someone tracking income", () => {
      // The most harmful thing the W5 review found. This panel sits above the
      // hours/income fork, so it rendered for everyone, and its rows are built from
      // logged activities — so an income-pathway user saw "Difference: 80" for every
      // month of their review period.
      //
      // ADR-0003 § Context names this harm in as many words: "HourKeep, seeing only
      // their own pay stubs, would tell them they're failing and send them looking
      // for 80 hours of volunteering." 42 CFR 435.552(a) makes all seven pathways
      // equally available and § 435.552(e)(2) lets income and hours combine.
      render(
        <ReviewPeriodPanel
          reviewPeriod={renewalReviewPeriodEndingAt("2026-06")}
          monthHours={[
            { month: "2026-05", totalHours: 0 },
            { month: "2026-06", totalHours: 0 },
          ]}
          monthlyThreshold={80}
          pathway="income"
          selectedMonth="2026-06"
          todayMonth="2026-07"
          onSelectMonth={noop}
          onAnchorChange={noop}
          onClearAnchor={noop}
        />,
      );

      const text = document.body.textContent ?? "";
      expect(text).not.toMatch(/Difference:/i);
      expect(text).not.toMatch(/at or over 80 hours/i);
      // And it says WHY the hours figure is not a target — 42 CFR 435.552(a)'s seven
      // pathways and § 435.552(e)(2)'s combination rule.
      //
      // Asserted on the explanation's own distinctive wording, not on the phrase
      // "tracking income". Mutation testing caught that: deleting the whole
      // explanation left this test green, because the per-month rows also contain the
      // words "tracking income". A test that can be satisfied by two different pieces
      // of copy is not pinning either of them.
      expect(text).toMatch(/one of several ways to meet this/i);
      expect(text).toMatch(/aren't a target you're missing/i);
      expectNoVerdict("ReviewPeriodPanel (income pathway)");
    });

    it("still reports the hours comparison to someone tracking hours", () => {
      // The positive twin. Suppressing the shortfall for everyone would satisfy the
      // test above by deletion, and the hours pathway genuinely needs the difference.
      render(
        <ReviewPeriodPanel
          reviewPeriod={renewalReviewPeriodEndingAt("2026-06")}
          monthHours={[{ month: "2026-06", totalHours: 46 }]}
          monthlyThreshold={80}
          pathway="hours"
          selectedMonth="2026-06"
          todayMonth="2026-07"
          onSelectMonth={noop}
          onAnchorChange={noop}
          onClearAnchor={noop}
        />,
      );

      const text = document.body.textContent ?? "";
      expect(text).toMatch(/Logged: 46 hours/);
      expect(text).toMatch(/Difference: 34/);
    });

    it("seeds the edit form from the stored anchor, so a renewal cannot become an application", () => {
      // A data-correctness bug review found: the draft state was initialised once at
      // mount and never synced, so a renewal user pressing "Change these dates" saw
      // "I'm applying" preselected with today's month — and saving silently converted
      // their anchor kind, which computes a completely different set of months under
      // 42 CFR 435.556(a)(1) versus (a)(2)(i).
      render(
        <ReviewPeriodPanel
          reviewPeriod={renewalReviewPeriodEndingAt("2026-06")}
          monthHours={hours}
          monthlyThreshold={80}
          pathway="hours"
          selectedMonth="2026-06"
          todayMonth="2026-09"
          onSelectMonth={noop}
          onAnchorChange={noop}
          onClearAnchor={noop}
        />,
      );

      // `fireEvent`, not a native `.click()`: a bare DOM click does not flush the
      // React state update, so the form never opened and the assertion below failed
      // looking for a control that had not rendered yet.
      fireEvent.click(
        screen.getByRole("button", { name: /change these dates/i }),
      );

      // The renewal toggle is the selected one, not "I'm applying".
      const renewalToggle = screen.getByRole("button", {
        name: /i'm renewing/i,
      });
      expect(renewalToggle).toHaveAttribute("aria-pressed", "true");

      // And the month is the stored renewal-due month, not today.
      const monthInput = document.querySelector<HTMLInputElement>(
        'input[type="month"]',
      );
      expect(monthInput?.value).toBe("2026-06");
    });

    it("says so when the app disagrees with the user's notice", () => {
      // § 435.556(a)(1) caps an application at 3 months, so a notice naming more
      // means a typo or a renewal. Silently showing the shorter period under-scoped
      // the months in the direction that costs coverage.
      render(
        <ReviewPeriodPanel
          reviewPeriod={applicationReviewPeriod("2026-07", {
            ...FEDERAL_DEFAULT_REVIEW_PERIOD,
            applicationLookbackMonths: 3,
          })}
          monthHours={hours}
          monthlyThreshold={80}
          pathway="hours"
          noticeExceedsApplicationBounds
          selectedMonth="2026-06"
          todayMonth="2026-07"
          onSelectMonth={noop}
          onAnchorChange={noop}
          onClearAnchor={noop}
        />,
      );

      const text = document.body.textContent ?? "";
      expect(text).toMatch(/doesn't match your letter/i);
      expect(text).toMatch(/Keep logging the extra months/i);
      expectNoVerdict("ReviewPeriodPanel (notice mismatch)");
    });
  });
});
