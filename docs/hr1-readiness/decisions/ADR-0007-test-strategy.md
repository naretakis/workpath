# ADR-0007 — Test Strategy

**Status:** Accepted
**Date:** 2026-08-16
**Tension:** deliberately departs from `.kiro/steering/getting-started.md`, which deprioritizes automated testing

## Context

There is no test runner. `package.json` has no `test` script and no jest, vitest, or testing-library
dependency. `@types/jest` is present, which is the only reason
`src/lib/utils/__tests__/imageCompression.test.ts` typechecks — it **cannot execute**.

Zero coverage exists on the five modules that decide whether a user believes they will keep their health
coverage:

| Module | Decides |
|---|---|
| `lib/calculations.ts` | monthly hours total and threshold comparison |
| `lib/utils/payPeriodConversion.ts` | the income threshold and conversions |
| `lib/storage/income.ts` | monthly income totals and seasonal averaging |
| `lib/exemptions/calculator.ts` | apparent exclusion status |
| `lib/assessment/recommendationEngine.ts` | which pathway is surfaced |

The plan changes all five. The gap analysis found eight `contradicts` + `harmful` rows concentrated in
exactly this code.

The steering doc's position — focus on making it work, skip automated tests — is reasonable for UI work
on a personal project. It is not reasonable for arithmetic that, if wrong, tells someone they are fine
when they are not.

## Decision

**Vitest**, and a tiered obligation rather than a blanket coverage target.

Vitest over Jest because it needs near-zero configuration alongside Next 16 and TypeScript, runs fast
enough for a TDD loop, and its API is close enough that the existing orphan test file can be adapted
rather than rewritten.

> **Priorities corrected on validation.** Two changes to what follows.
>
> **Characterization tests on the five modules are worth less than originally claimed.** A characterization
> test proves *unintended* changes didn't happen — but we intend to change essentially all behavior in all
> five. `calculations.ts` is 55 lines with three activity types and W6 replaces the type set;
> `payPeriodConversion` gets demoted out of compliance logic; `recommendationEngine.complianceStatus` is
> deleted outright. Pinning behavior we've decided to discard produces a diff full of intentional changes,
> which is a diff with no signal. Keep them, but **narrowly** — pin the specific arithmetic that must
> survive (the multipliers, the 12-check cascade order, `calculateAge` boundaries), not whole-module snapshots.
>
> **Two tests are promoted to Tier 1:**
>
> 1. **The Dexie v6 → v7 migration test.** The one place where being wrong destroys data irreversibly and
>    where correct behavior *is* "nothing changes." Previously Tier 2.
> 2. **The no-verdict render test** — asserting no surface renders "you are exempt" or "compliant."
>    Previously Tier 3 "encouraged." It mechanically enforces ADR-0003, the load-bearing decision, forever,
>    and it is the cheapest high-value test in the plan. Write it in W2a.
>
> **The gap-analysis count cited below was wrong** — the actual figure is 16 `contradicts` + `harmful` rows,
> not eight.

### Tier 1 — Required, TDD

The five modules above, plus the new policy profile, status resolver, review-period model, and
combination logic.

**Obligation: a failing test before the change.** Every rule these modules implement carries a CFR
citation in the test name, so the suite doubles as an executable statement of what we believe the law
requires.

```ts
it("§ 435.552(g): averages the 6 months PRECEDING the assessed month, excluding it", () => { ... });
it("§ 435.552(d): converts 6 credit hours to 77.94 monthly hours", () => { ... });
it("§ 435.553(a)(4): deems compliant for months the user held excluded status", () => { ... });
```

**Characterization tests come first.** Before changing any of the five, capture current behavior —
including the bugs. That way a diff proves which behavior changes were intentional. This is the single
most valuable step in Wave 0.

### Tier 2 — Required, not TDD

Storage layer round-trips and Dexie migrations. A v6 → v7 migration test with realistic fixture data,
asserting nothing is silently dropped. Uses `fake-indexeddb`.

### Tier 3 — Encouraged, not required

Component behavior for question flows and the status surfaces, focused on **what the user is told**.
A test that asserts the app never renders "You are exempt" is a cheap guard on ADR-0003.

### Tier 4 — Not automated

Camera capture, image compression against real photos, print stylesheets, PWA install and offline
behavior, and screen-reader passes. These stay manual; `src/lib/utils/TESTING.md` remains the record.

### Guardrails

- `npm test` in CI on the existing GitHub Actions workflow, gating deploy.
- A test asserting no policy literals (`80`, `580`, `7.25`, `4.33`) appear outside the policy profile —
  enforcing ADR-0001 mechanically rather than by discipline.

## Consequences

**Good**

- Makes it safe to change compliance math, which is otherwise the riskiest work in the plan.
- Characterization tests turn "did I break something?" into a diff.
- CFR-cited test names make the suite an audit trail of our legal reading — directly useful when the
  final rule lands and we need to diff our interpretation.
- Rescues the orphaned `imageCompression.test.ts`.

**Costs**

- Real upfront time in Wave 0 before any user-visible progress.
- Contradicts existing steering. Resolved by scoping: tests are required for domain logic, optional for
  UI. The steering doc should be amended to say so.
- `fake-indexeddb` and Vitest add devDependencies.

## Alternatives rejected

- **No tests, careful manual verification.** How you ship a bug that tells someone they're compliant when
  they aren't. The one thing this project cannot afford.
- **Jest.** More configuration friction with Next 16 and ESM for no benefit here.
- **Coverage percentage target.** Rewards testing easy code. Tiered obligation targets the code where
  being wrong actually hurts.
- **Playwright end-to-end.** Valuable eventually, too slow to stand up now, and doesn't address the
  arithmetic risk.
