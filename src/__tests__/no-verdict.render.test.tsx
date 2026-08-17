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
import { render, screen } from "@testing-library/react";

import { AssessmentBadge } from "@/components/assessment/AssessmentBadge";
import { ExemptionHistory } from "@/components/exemptions/ExemptionHistory";
import { IntroductionScreen } from "@/components/assessment/IntroductionScreen";
import { ComplianceModeSelector } from "@/components/compliance/ComplianceModeSelector";
import { RequirementFacts } from "@/components/help/RequirementFacts";

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
