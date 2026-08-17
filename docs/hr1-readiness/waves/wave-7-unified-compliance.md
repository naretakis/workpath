# Wave 7 — Unified Compliance and Income Repositioning

**Depends on:** W4 (status), W5 (months), W6 (activity types)
**Blocks:** W8
**Decision records:** ADR-0003, ADR-0004
**Detail level:** goals and scope. Task breakdown when the wave starts.

## Goal

Stop being stricter than the law, and finish repositioning income from adjudication to evidence. This wave
closes the largest cluster in the gap analysis.

## Scope

### Remove the mode fork (ADR-0004)

Delete `ComplianceModeSelector`, the `complianceModes` table, and the hours/income branch in
`tracking/page.tsx`. One view shows everything recorded, always.

Implement § 435.552(e) combination:

```
workHours        = paid + in-kind + unpaid (incl. sub-threshold caregiving)
communityHours   = community service
workProgramHours = work program
educationHours   = 0 if enrolled ≥ half-time (qualifying alone, cannot combine)
                   else creditHours × 3 × 4.33, or actual hours for non-credit
proxyEligible    = totalIncome − income attributable to already-logged hours   // provenance netting
proxyHours       = profile.incomeToHoursProxyAvailable
                   && totalIncome < profile.incomeThreshold
                   && proxyEligible > 0
                   ? proxyEligible / profile.federalMinimumWage : 0

totalHours = workHours + communityHours + workProgramHours + educationHours + proxyHours
```

**Three** pathways evaluate in parallel and the view surfaces whichever is favorable: half-time education
(qualifying alone), income at or above threshold (qualifying alone, with the household caveat), seasonal
average at or above threshold (§ 435.552(a)(7)), otherwise hours against 80.

> **The guard was corrected on validation.** The original `workHours === 0` condition broke CMS's own
> worked example — a caregiver with 55 unpaid hours and $200 income really has 82 qualifying hours, but the
> guard zeroed her proxy and reported "short by 25." And because W6a **broadens** `workHours` to include
> unpaid and in-kind work, the collision surface would have grown as the plan was implemented. Guard on
> **provenance** — net out only income that is already represented as logged hours. If provenance linking
> proves too costly, show **both** figures and name the double-count risk rather than picking. See ADR-0004.
>
> **And the number is an upper bound, not an estimate.** § 435.552(e)(2)(i) requires the agency to "use a
> reasonable method to **allocate work hours between members of the household**." Copy must say "your state
> may credit **up to** about 52 hours, and may divide that among people in your household." This is a
> **Conditional** value per ADR-0003 — show it with the State election named.

### Reposition income (ADR-0003)

- **Remove pay-period multiplication as a compliance input.** No such conversion exists in the rule; States
  determine a monthly MAGI figure using existing methodology. Keep the converter only as an optional,
  clearly-labeled personal estimate.
- **Fix the double-counting.** Today the monthly total sums `monthlyEquivalent` across every entry, so four
  weekly paychecks report ~$2,598 instead of ~$650. Change the semantics: entries are **evidence of payment
  received**, summed as actual amounts, presented as "what you've recorded" rather than a projected monthly
  figure.
- **Household framing.** Use the W4 screener answers to explain that the pathway counts the whole household
  and may already be satisfied — a married user whose spouse works may qualify with zero hours. Frame as a
  floor: more household income helps.
- **Seasonal corrections.** Present the § 435.552(g) / 26 U.S.C. 45R(d)(5)(B) test as an objective legal
  standard rather than a self-declared toggle. Fix the averaging window to the 6 months **preceding** the
  assessed month, excluding it. Handle insufficient history explicitly instead of dividing by 6 and
  rendering `$0.00` rows as though verified. Support the reasonably-predictable-changes alternative via
  `profile.seasonalMethod`, since most States elect it and it produces a different number.
- **Remove `Recommendation.complianceStatus`** and rename `MonthlySummary.isCompliant` to
  `meetsHoursThreshold`, documented as informational only.

### One evaluation path

A single `evaluateMonth(month, data, profile)` that the dashboard, results page, and export all call. The
export may not recompute anything. This structurally prevents gap 8.9 — UI and export disagreeing — from
recurring.

## Acceptance criteria

- [ ] No mode selector; `complianceModes` dropped
- [ ] Activities and income both always visible
- [ ] Combination math matches § 435.552(e), proven by tests including CMS's 55 + 25 caregiving example
- [ ] Income-to-hours proxy matches CMS's $380 → 52 hours example, and is guarded against double-counting
- [ ] Half-time education qualifies alone and cannot be combined
- [ ] Pay-period multiplication is not a compliance input
- [ ] Four weekly $150 paychecks no longer report ~$2,598
- [ ] Seasonal averaging excludes the assessed month, proven by CMS's July → June → Dec–May example
- [ ] Insufficient seasonal history is stated, not silently averaged
- [ ] Household framing appears wherever income is presented
- [ ] Exactly one evaluation function; export calls it

## Risks

| Risk | Mitigation |
|---|---|
| One view must present more without overwhelming a phone | Primary answer first, detail collapsed. This is the wave's main design risk |
| The proxy confuses users ("where did 52 hours come from?") | Show the arithmetic and label it as something the state may do, not something we did |
| Removing pay-period conversion feels like lost functionality | Retain it as a labeled personal estimate; explain why it isn't a compliance figure |
| Seasonal now has two computation paths | `profile.seasonalMethod` is a discriminated union; test both |
