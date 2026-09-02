# Wave 5 — Month Scoping and Review Periods

**Depends on:** W0 only.
**Blocks:** W6, W7, W8, and W2b
**Decision record:** ADR-0005
**Detail level:** goals and scope. Task breakdown when the wave starts.

> ## Two blockers resolved 2026-09-01 — read before starting
>
> This header used to say **"Depends on: W2 (review-period length comes from the policy
> profile)"**, which contradicted the sequence and would have stopped W5 on day one. Both
> problems are the same root cause: the line predates W2 being split into **W2a** (copy,
> shipped) and **W2b** (policy profile, *after* W5). Nobody revisited it.
>
> ### 1. The policy profile does not exist yet, and W5 must not wait for it
>
> `waves/README.md` sequences W5 **before** W2b and lists W2b as depending on W5 — so
> taking the old header literally is circular. `src/lib/policy/` does not exist.
>
> **Resolution:** W5 defines the `ReviewPeriod` shape and derives it from a
> **hardcoded federal default** — a single named constant in the review-period module,
> commented as W2b's to move. W2b already owns "remove every policy literal", so this
> adds nothing to its scope; it just means W2b moves one more constant it was always
> going to move.
>
> Concretely, the federal defaults W5 should assume:
> **application lookback = 1 month** (the least-restrictive election, and what most
> States chose), **renewal = ≥ 1 month, not necessarily consecutive**. Cite
> 42 CFR 435.556(a) and keep the numbers in one place so W2b's diff is small.
>
> Acceptance criterion 3 is reworded below accordingly.
>
> ### 2. W5 needs NO Dexie version bump — drop the compound indexes
>
> Criterion 8 asked for `[userId+date]` and `[userId+month]` compound indexes. Those
> require a `.stores()` change, which requires a version bump — and
> `.kiro/steering/data-migration-standards.md` assigns **v7 to W3**, explicitly
> including "month-scoping columns", with no version for W5. Three waves once each
> thought they owned v7; that is exactly the defect the standards table exists to
> prevent.
>
> **Resolution:** the indexes move to **W3's consolidated v7**. W5 keeps the in-memory
> `userId` filtering it already describes in its own scope bullet, which is why that
> bullet says "Pairs with the W3 migration". Criterion 8 is struck below and restated
> as a handoff.
>
> This also means **W5 writes no migration test** and touches `src/lib/db.ts` not at
> all. Note `waves/README.md`'s dependency table justifies W5 → W0 as "migration test
> before touching the schema", which reads as though W5 touches schema. It does not;
> that justification is inaccurate and the real reason W5 depends on W0 is that W0's
> characterization tests are what make it safe to change `calculations.ts`.

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
- ~~**Compound indexes.** `[userId+date]` on activities and income; `[userId+month]` on status.~~
  **MOVED TO W3** (2026-09-01). These need a `.stores()` change and therefore a Dexie version bump, which
  `data-migration-standards.md` assigns to W3's consolidated v7. W5 keeps in-memory `userId` filtering —
  correct for a single-profile app, and the reason this bullet already said "pairs with the W3 migration".
  W5 touches `src/lib/db.ts` not at all and writes no migration test.
- **Month navigation UI.** A month selector that works on a phone, with clear indication of which months
  belong to the current review period.

## Acceptance criteria

- [ ] Selecting any month updates the summary, activity list, income view, and status together
- [ ] No domain function defaults to the current month
- [ ] `ReviewPeriod` drives evaluation, derived from a **single named federal-default constant** in the
      review-period module, commented as W2b's to move into `src/lib/policy/`. Reworded 2026-09-01: the
      policy profile does not exist yet and W2b comes after W5 — see the note at the top of this file
- [ ] Application review period is the correct consecutive months immediately preceding
- [ ] Renewal review period spans the eligibility period; UI states that any qualifying month counts
- [ ] Multi-month progress reflects the real review period, and `CompletionMessage` is reachable
- [ ] Past months are editable and visually distinguished from the current month
- [~] ~~Compound indexes exist; month queries no longer filter `userId` in memory~~ — **struck
      2026-09-01, handed to W3.** Needs a Dexie version bump W5 does not own. W3's v7 adds
      `[userId+date]` on activities and income and `[userId+month]` on status, alongside the `userId`
      column it already adds to `Activity`
- [ ] **W5 bumps no Dexie version and adds no migration** — `git diff` on `src/lib/db.ts` is empty

## Risks

| Risk | Mitigation |
|---|---|
| Wide mechanical change touching most tracking components | Required parameters make it compiler-guided; W0 tests catch behavior drift |
| Month navigation crowds a phone screen | Compact selector; the review period is the organizing frame, not a free calendar browse |
| Users backfill months they weren't enrolled for | Record the data; don't assert what it means. Consistent with ADR-0003 |
