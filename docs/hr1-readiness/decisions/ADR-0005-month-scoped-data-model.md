# ADR-0005 — Month-Scoped Data Model

**Status:** Accepted
**Date:** 2026-08-16

## Context

Everything user-visible in HourKeep is pinned to the present. `Calendar.tsx:57` owns
`useState(new Date())` and never lifts it. `tracking/page.tsx` hardcodes `format(new Date(), "yyyy-MM")`
in seven places. `calculateMonthlySummary` defaults to the current month.

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

**5. Past months are the primary case, and should be MORE actionable than the present.**

> **Reversed on validation.** An earlier version said the app "should not imply a past month can still be
> 'improved.'" That has it backwards. A past month **can** be improved — not by working more hours, but by
> **finding evidence for hours already worked**, which is exactly what a § 435.558 notice asks someone to do
> with ~35 days' notice about months already gone.
>
> So a past month should prompt *harder*, not softer: "We have no record for December. What were you doing?
> Who can confirm it?" Visually distinguish past from present, but treat the retrospective case as the one
> the product exists to serve.

## Consequences

**Good**

- Unblocks review periods, seasonal averaging, the recent-inmate window, multi-month progress, and
  period-scoped evidence packages. This is the single largest domain unlock in the plan.
- Fixes the existing bug where past-month logging silently has no visible effect.
- Removes the implicit `profiles[0]` ownership assumption.
- Compound indexes remove in-memory `userId` filtering.

**Costs**

- Touches nearly every component in the tracking surface. Wide but shallow.
- Making the month parameter required is a deliberately breaking change — that is the point, since it
  surfaces every caller — but it means one large mechanical commit.
- Dexie v7 migration to add `userId` to `Activity` and the compound indexes.

## Alternatives rejected

- **Keep the current-month default, add an optional month argument.** The default is exactly what hides
  the bugs. Optional parameters let call sites silently keep using "now."
- **Give the Calendar a callback but leave other components on `new Date()`.** Half-fixes it and leaves
  the summary/list divergence in place.
- **Model review periods as a UI concern only.** They are needed by evaluation, export, and the notice
  workflow. They belong in the domain.
