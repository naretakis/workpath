# ADR-0005 — Month-Scoped Data Model

**Status:** Accepted
**Date:** 2026-08-16
**Amended:** 2026-09-02 (W5 execution) — see the two notes below. Decision items **4** and **5** changed;
the rest stands.

## Context

Everything user-visible in HourKeep is pinned to the present. `Calendar.tsx:57` owns
`useState(new Date())` and never lifts it. `tracking/page.tsx` hardcodes `format(new Date(), "yyyy-MM")`
in seven places. `calculateMonthlySummary` defaults to the current month.

> **Three of those references are wrong. Corrected 2026-09-02, verified by command.**
>
> - The calendar is **`src/components/Calendar.tsx`**, not `Calendar.tsx:57` — the `useState(new Date())`
>   is at **line 62**. There is no `components/tracking/Calendar.tsx`; that directory holds only
>   `CompletionMessage.tsx`.
> - `tracking/page.tsx` has **six** `format(new Date(), "yyyy-MM")` sites, not seven —
>   `grep -c` prints 6, at lines 72, 151, 379, 392, 568, 649. There *is* a seventh wall-clock month
>   derivation in the file, at line 129 (`const now = new Date()` feeding `startOfMonth`/`endOfMonth` at
>   130–131), but it is a different expression. **Seven derivations, six of them that pattern.**
> - The problem is **not confined to `tracking/page.tsx`.** Nine occurrences of that pattern exist in
>   non-test `src/`: the six above plus `how-to-hourkeep/page.tsx:109`, `onboarding/page.tsx:122`, and
>   `calculations.ts:15`. A **tenth** derivation uses a *different mechanism* —
>   `how-to-hourkeep/results/page.tsx:117` does `new Date().toISOString().slice(0, 7)`, which is **UTC**.
>   On the first of a month in a negative-offset zone that returns a different month than the other nine.
>   Two mechanisms, two answers, same app.

The visible symptom: paging the calendar back re-paints the grid and lets you log hours into a past
month, but the summary, activity list, and income dashboard all stay on today. Per-month
`seasonalWorkerStatus` rows can only ever be written for the current month, even though the schema and
the export read them per-month.

This blocks a large fraction of the domain work. The IFC measures everything against a **review period**:

- **Application** — the 1–3 consecutive months **immediately preceding** the application month (§ 435.556(a)(1)).
- **Renewal** — the eligibility period, ≥ 1 month, **not necessarily consecutive** (§ 435.556(a)(2)(i)).
- **Seasonal income** — the 6 months **preceding** the month being assessed (§ 435.552(g)).
- **Recent-inmate exception** — the 3-month window ending on the first day of the assessed month (§ 435.553(b)).

Every one of those is a computation over months that are not today.

## Decision

Make the month an explicit, lifted parameter throughout, and introduce a review-period model.

**1. Lift month state.** A single `selectedMonth` (`YYYY-MM`) lives at the page level and is passed to
every child. `Calendar` becomes controlled. All seven `new Date()` call sites read `selectedMonth`.

**2. Every domain function takes an explicit month.** No defaulting to the current month. The parameter
becomes required, so the compiler finds every caller.

```ts
function evaluateMonth(month: string, data: MonthData, profile: PolicyProfile): MonthEvaluation
```

**3. Model the review period as a first-class value.**

```ts
type ReviewPeriod =
  | { kind: "application"; applicationMonth: string; months: string[] /* consecutive, preceding */ }
  | { kind: "renewal";     periodStart: string; periodEnd: string; monthsRequired: number }
  | { kind: "verification"; since: string; until: string; monthsRequired: number };
```

Derived from the policy profile, so `applicationLookbackMonths` drives the length.

**4. Add the compound index.** `activities` gains `[userId+date]`; income and status tables likewise.
Today month queries filter `userId` in memory, and `activities` has no `userId` column at all — it is
implicitly owned by `profiles[0]`. Adding `userId` to `Activity` in the v7 migration removes that
assumption.

> **MOVED TO W3, 2026-09-02. This item is no longer W5's.**
>
> A `.stores()` change requires a Dexie version bump, and
> `.kiro/steering/data-migration-standards.md` § Version ownership assigns **v7 to W3**, explicitly
> including "month-scoping columns". Three consecutive waves once each believed they owned v7; that
> table exists to stop exactly this.
>
> So W3's consolidated v7 adds `[userId+date]` on activities and income and `[userId+month]` on status,
> alongside the `userId` column it already adds to `Activity`. **W5 keeps in-memory `userId` filtering** —
> correct for a single-profile app — **writes no migration, and does not touch `src/lib/db.ts` at all.**
>
> This was resolved in `waves/wave-5-month-scoping.md` and `waves/README.md` on 2026-09-01, but **this
> ADR was not amended at the time**, so it still instructed W5 to perform a v7 migration. Recorded here
> because an ADR that contradicts its own wave file is a trap for whoever reads the ADR first. The
> "Costs" section below is corrected on the same ground.
>
> **What W5 does instead, for the anchor problem this item was partly solving.** Deriving a review period
> needs an *anchor* month — § 435.556(a)(1) measures from the month of application — and nothing in the
> schema stored one. `OnboardingContext` held only `monthsRequired` (a count) and `deadline` (a notice
> response date); neither identifies a month under review, and inferring one from `deadline` would be
> invention, not computation, since § 435.556(a)(2) forbids States from dictating *which* months.
>
> W5 stores the anchor as an **optional field on `OnboardingContext`**. `db.ts:39` declares
> `profiles: "id"`, so `id` is the only indexed property and `onboardingContext` is unindexed nested
> data. Adding an optional field to it needs **no `.stores()` change and no version bump** — it is the
> "add the new shape, leave old rows alone" pattern the standards prescribe, and `git diff src/lib/db.ts`
> stays empty. Old profiles simply lack the field, and the app says it does not know.

**5. Past months are the primary case, and should be MORE actionable than the present.**

> **Reversed on validation.** An earlier version said the app "should not imply a past month can still be
> 'improved.'" That has it backwards. A past month **can** be improved — not by working more hours, but by
> **finding evidence for hours already worked**, which is exactly what a § 435.558 notice asks someone to do
> with ~35 days' notice about months already gone.
>
> So a past month should prompt *harder*, not softer: "We have no record for December. What were you doing?
> Who can confirm it?" Visually distinguish past from present, but treat the retrospective case as the one
> the product exists to serve.

> **Reconciled with the wave file, 2026-09-02.** `wave-5-month-scoping.md` § Scope says past months are
> "framed as a record rather than a target," and its Risks table says "Record the data; don't assert what
> it means." Read alone, that is the softer framing this item was *reversed away from*.
>
> They are reconcilable, and the reconciliation is the design rule W5 implements: **a past month gets an
> evidence prompt, not a progress-toward-80 target.** "34 hours to go" is a target and is wrong for a
> month that has ended. "You logged 46 hours in December. Who can confirm them?" prompts harder while
> asserting nothing. Both documents are satisfied; neither was picked over the other.

## Consequences

**Good**

- Unblocks review periods, seasonal averaging, the recent-inmate window, multi-month progress, and
  period-scoped evidence packages. This is the single largest domain unlock in the plan.
- Fixes the existing bug where past-month logging silently has no visible effect.
- ~~Removes the implicit `profiles[0]` ownership assumption.~~ **W3, with item 4.**
- ~~Compound indexes remove in-memory `userId` filtering.~~ **W3, with item 4.**

**Costs**

- Touches nearly every component in the tracking surface. Wide but shallow.
- ~~Making the month parameter required is a deliberately breaking change — that is the point, since it
  surfaces every caller — but it means one large mechanical commit.~~

  > **Overstated, corrected 2026-09-02.** Exactly **one** function in `src/lib/` has an optional month:
  > `calculateMonthlySummary` (`calculations.ts:12`). All eight month-taking functions in
  > `storage/income.ts` already require it. And it has **one** production caller —
  > `tracking/page.tsx:138` — so "the compiler finds every caller" finds one. The signature change is
  > a two-line diff.
  >
  > The real work is at the *call sites*, which are not domain functions and which the compiler
  > therefore cannot find: the ten wall-clock derivations listed in the Context note above. That is why
  > W5 adds a **guard test** asserting zero wall-clock month derivations outside one named helper —
  > a negative criterion needs a positive observable, and `tsc` is not one here.

- ~~Dexie v7 migration to add `userId` to `Activity` and the compound indexes.~~ **W3.** W5 bumps no
  version; see the note on item 4.

## Alternatives rejected

- **Keep the current-month default, add an optional month argument.** The default is exactly what hides
  the bugs. Optional parameters let call sites silently keep using "now."
- **Give the Calendar a callback but leave other components on `new Date()`.** Half-fixes it and leaves
  the summary/list divergence in place.
- **Model review periods as a UI concern only.** They are needed by evaluation, export, and the notice
  workflow. They belong in the domain.
