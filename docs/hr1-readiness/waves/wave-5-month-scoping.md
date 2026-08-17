# Wave 5 — Month Scoping and Review Periods

**Depends on:** W2 (review-period length comes from the policy profile)
**Blocks:** W6, W7, W8
**Decision record:** ADR-0005
**Detail level:** goals and scope. Task breakdown when the wave starts.

## Goal

Make the month an explicit parameter everywhere, and model the review period as a first-class value. This
is the single largest domain unlock in the plan — roughly a third of the remaining gaps depend on it.

## Scope

- **Lift month state.** One `selectedMonth` (`YYYY-MM`) at page level, passed down. `Calendar` becomes
  controlled instead of owning `useState(new Date())`. Replace all seven hardcoded
  `format(new Date(), "yyyy-MM")` call sites in `tracking/page.tsx`.
- **Make the month parameter required** on every domain function. No defaulting to the current month —
  the default is precisely what hides the current bugs. Making it required means the compiler finds every
  caller.
- **Review-period model.** The `ReviewPeriod` union from ADR-0005: application (1–3 consecutive months
  immediately preceding, length from the profile), renewal (eligibility period, ≥ 1 month, non-consecutive),
  and verification (between more-frequent checks).
- **Tell users the favorable rule.** § 435.556(a)(2) with CMS's reading: at renewal, States may **not**
  require consecutive months and may **not** dictate which months count. Any qualifying month in the period
  counts. Users should know this.
- **Past-month affordances.** Editable — backfilling is legitimate and the roadmap already wanted it — but
  visually distinct, and framed as a record rather than a target.
- **Fix multi-month progress.** `monthlyCompliance` currently holds one current-month entry with the
  comment "For now, just check current month," making `CompletionMessage` unreachable whenever more than
  one month is required. Compute across the actual review period.
- **Compound indexes.** `[userId+date]` on activities and income; `[userId+month]` on status. Removes
  in-memory `userId` filtering. Pairs with the W3 migration that adds `userId` to `Activity`.
- **Month navigation UI.** A month selector that works on a phone, with clear indication of which months
  belong to the current review period.

## Acceptance criteria

- [ ] Selecting any month updates the summary, activity list, income view, and status together
- [ ] No domain function defaults to the current month
- [ ] `ReviewPeriod` is derived from the policy profile and drives evaluation
- [ ] Application review period is the correct consecutive months immediately preceding
- [ ] Renewal review period spans the eligibility period; UI states that any qualifying month counts
- [ ] Multi-month progress reflects the real review period, and `CompletionMessage` is reachable
- [ ] Past months are editable and visually distinguished from the current month
- [ ] Compound indexes exist; month queries no longer filter `userId` in memory

## Risks

| Risk | Mitigation |
|---|---|
| Wide mechanical change touching most tracking components | Required parameters make it compiler-guided; W0 tests catch behavior drift |
| Month navigation crowds a phone screen | Compact selector; the review period is the organizing frame, not a free calendar browse |
| Users backfill months they weren't enrolled for | Record the data; don't assert what it means. Consistent with ADR-0003 |
