# ADR-0004 — Unified Compliance View

**Status:** Accepted
**Date:** 2026-08-16
**Replaces:** the `complianceModes` table and `ComplianceModeSelector`

## Context

HourKeep stores a per-month `mode: "hours" | "income"` and forks the entire dashboard on it. Hours mode
shows the calendar, activity list, and progress. Income mode shows only the income dashboard.

The IFC provides **seven** pathways (§ 435.552(a)) and requires States to make **all** of them available.
More pointedly, § 435.552(e) requires hours from work, community service, work programs, and
less-than-half-time education to be **summed**, and § 435.552(e)(2) permits income below the threshold to
be **converted into work hours** at `income ÷ federalMinimumWage` and combined.

CMS's own example: $380 of income becomes 52 credited hours, needing 28 more from other activities.

So HourKeep's either/or fork is **stricter than the law**. A user with 40 hours and $300 fails in both
modes, and the app never evaluates the combination that might qualify them. That is a false negative
against the user's interest.

The mode selector also carries a misleading confirmation dialog: "only your income will count toward
compliance while in income mode." That is not true of the law.

## Decision

Remove the mode fork. One view shows everything the user has recorded, with a running total.

**Combination model:**

```
workHours          = paid + in-kind + unpaid (incl. sub-threshold caregiving)
communityHours     = community service
workProgramHours   = work program participation
educationHours     = 0 if enrolled at least half-time (already qualifying, cannot combine)
                     else creditHours × 3 × 4.33, or actual hours for non-credit programs
proxyEligible      = totalIncome − income attributable to already-logged hours
proxyHours         = policyProfile.incomeToHoursProxyAvailable
                     && totalIncome < threshold
                     && proxyEligible > 0
                     ? proxyEligible / policyProfile.federalMinimumWage
                     : 0
                     // CORRECTED. The original guard was `workHours == 0` — see the note below.

totalHours = workHours + communityHours + workProgramHours + educationHours + proxyHours
```

Two pathway checks run **in parallel**, and the view surfaces whichever is favorable:

- **Half-time education** → qualifying on its own, no hours needed, no combination.
- **Income at or above threshold** → qualifying on its own, subject to the household caveat (ADR-0003).
- **Otherwise** → hours total against the 80-hour threshold, with `proxyHours` included where permitted.

> ### The `workHours === 0` guard was a bug. Corrected on validation.
>
> It produces exactly the harm ADR-0003 exists to prevent. Break it with **CMS's own worked example**: a
> family caregiver provides 55 hours/month to an unrelated non-cohabitant — she fails criterion (C) so she
> isn't excluded, but those hours count as unpaid work. Say she also earns $200 gig income.
>
> - **Real position:** 55 unpaid hours + ($200 ÷ $7.25 = 27 proxy hours) = **82. Qualifies.**
> - **With the guard:** `workHours = 55 ≠ 0` → `proxyHours = 0` → total 55 → **"short by 25."**
>
> A false negative, in the exact population this ADR cites as its reason to exist. Two further breaks:
> any user with *any* unpaid or in-kind hours loses the proxy entirely — and **W6 deliberately broadens
> `workHours` to include those, so the collision surface grows as the plan is implemented.** And two jobs
> with hours documented for only one zeroes the proxy for the other.
>
> **Replacement:** guard on **provenance**, not the aggregate. Link income entries to the activity or
> employer they came from, then `proxyEligibleIncome = totalIncome − income attributable to logged hours`.
> If provenance linking is too much for W7, the safe fallback is **not** `workHours === 0` — it is to show
> both figures and name the double-count risk. Under ADR-0003 the app isn't adjudicating, so it doesn't
> have to pick.
>
> ### The formula omits a codified requirement
>
> § 435.552(e)(2)(i) ends: *"provided that the agency must use a reasonable method to **allocate work hours
> between members of the household**."* Since the input is household MAGI income, the State does **not**
> credit `householdIncome ÷ minWage` to the individual — it allocates by a method HourKeep cannot know.
>
> **So `proxyHours` is an upper bound, not an estimate**, whenever the household has more than one earner.
> Copy must say "your state may be able to credit **up to** about 52 hours, and may divide that among people
> in your household." Tracked as gap 15.1.
>
> ### Defaulting the proxy on: right call, wrong reasoning
>
> ADR-0001's accepted-risk text says the user loses nothing if their State declines the option. **They lose
> the hours they didn't go find.** Keep the default on — it surfaces a real option — but frame it as
> belt-and-suspenders: *if you can reach 80 without counting on this, do.*

The `complianceModes` table is dropped in **W7**, not W3 — see ADR-0002. Income entries and activities both
persist and both display, always.

**Seven pathways, not six.** The parallel checks above omit § 435.552(a)(7), seasonal-worker average income.
W7's scope handles it separately, but the enumeration here should include it.

## Consequences

**Good**

- Stops being stricter than the law.
- Implements the combination pathway and the proxy, both user-favorable.
- One evaluation path means the export can no longer contradict the UI (gap 8.9).
- Removes a confirmation dialog that stated something false.
- Simpler: no mode state, no fork, no per-month mode row.

**Costs**

- Deletes a shipped feature and its table. `complianceModes` records a per-month user choice, so dropping it
  discards user intent — but the choice becomes meaningless once both pathways are always evaluated, and
  ADR-0002's preserve-by-default migration posture applies. Migrate the rows into a read-only note on the
  month rather than deleting them outright, so nothing a user recorded silently vanishes.
- A single view must present more information without overwhelming a phone screen. This is the main
  design risk in the wave.
- The proxy is a State option, so its availability is profile-dependent and the copy must hedge.

## Alternatives rejected

- **Keep modes, evaluate both silently.** Retains a stored mode with no meaning and keeps the misleading
  dialog.
- **Keep modes as a display filter only.** Less harmful, but still implies the choice matters when it
  doesn't.
- **Implement combination but not the proxy.** The proxy is precisely the case that helps low-income
  users with irregular hours — the population most at risk.
