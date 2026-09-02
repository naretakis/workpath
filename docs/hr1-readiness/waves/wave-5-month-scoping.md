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

> ## Corrections made at execution — 2026-09-02
>
> Every count below was re-derived by command before any code was written, on the standing assumption
> (`engineering-standards.md`) that this document's bookkeeping is no better than W0's was. Four things
> were wrong and two acceptance criteria needed rewriting. All are folded in below; recorded here so the
> corrections are visible rather than silently applied.
>
> 1. **"Seven hardcoded `format(new Date(), "yyyy-MM")` call sites in `tracking/page.tsx`" — there are
>    six.** `grep -c` prints 6, at lines 72, 151, 379, 392, 568, 649. A seventh wall-clock month
>    derivation exists at line 129 (`const now = new Date()` → `startOfMonth`/`endOfMonth` at 130–131),
>    which is presumably where "seven" came from, but it is a different expression.
> 2. **The problem is not confined to `tracking/page.tsx`, and this file never said otherwise but never
>    said so either.** Nine occurrences in non-test `src/`: the six above plus
>    `how-to-hourkeep/page.tsx:109`, `onboarding/page.tsx:122`, `calculations.ts:15`. Plus a tenth using
>    a **different mechanism** — `how-to-hourkeep/results/page.tsx:117` derives the month via
>    `new Date().toISOString().slice(0, 7)`, i.e. **UTC**, which can name a different month than the
>    other nine on the first of a month in a negative-offset zone. All ten are in scope.
> 3. **"Make the month parameter required on every domain function" overstates the work.** Exactly one
>    function in `src/lib/` has an optional month — `calculateMonthlySummary` (`calculations.ts:12`) —
>    and it has exactly one production caller (`tracking/page.tsx:138`). All eight month-taking functions
>    in `storage/income.ts` already require it. So "the compiler finds every caller" finds one, and the
>    signature change is a two-line diff. The wave is **smaller in `src/lib/` and larger in `src/app/`**
>    than this scope section implies.
> 4. **The "For now, just check current month" comment is at lines 163–164**, inside a `monthsRequired`
>    guard.
>
> Also: **ADR-0005 had not been amended** for either of the 2026-09-01 resolutions below, so it still
> instructed W5 to perform a v7 migration, and three of its code references were stale
> (`Calendar.tsx:57` → `src/components/Calendar.tsx:62`). Amended 2026-09-02.

## Goal

Make the month an explicit parameter everywhere, and model the review period as a first-class value. This
is the single largest domain unlock in the plan — roughly a third of the remaining gaps depend on it.

## Scope

- **Lift month state.** One `selectedMonth` (`YYYY-MM`) at page level, passed down. `Calendar` becomes
  controlled instead of owning `useState(new Date())` (`src/components/Calendar.tsx:62`). Replace the
  **six** hardcoded `format(new Date(), "yyyy-MM")` call sites in `tracking/page.tsx` **and the seventh
  wall-clock derivation at line 129** — plus the three sites outside that file. Ten in total; see the
  corrections note above.
- **Make the month parameter required** on every domain function. No defaulting to the current month —
  the default is precisely what hides the current bugs. In practice this is one signature
  (`calculateMonthlySummary`) with one caller; the compiler cannot find the call sites that matter,
  because they are not domain functions. A **guard test** covers those instead.
- **Review-period model.** The `ReviewPeriod` union from ADR-0005: application (1–3 consecutive months
  immediately preceding, length from the profile), renewal (eligibility period, ≥ 1 month, non-consecutive),
  and verification (between more-frequent checks).
- **Tell users the favorable rule.** § 435.556(a)(2) with CMS's reading: at renewal, States may **not**
  require consecutive months and may **not** dictate which months count. Any qualifying month in the period
  counts. Users should know this.
- **Past-month affordances.** Editable — backfilling is legitimate and the roadmap already wanted it — but
  visually distinct, and framed as a record rather than a target.
- **Fix multi-month progress.** `monthlyCompliance` currently holds one current-month entry with the
  comment "For now, just check current month" (lines 163–164), making `CompletionMessage` unreachable
  whenever more than one month is required. Compute across the actual review period.
- **Rewrite `CompletionMessage`'s copy.** *Added 2026-09-02, approved before implementation.* Not in this
  file's original scope, and unavoidable: the component renders **`🎉 Goal Complete!`** (line 62) and
  "You've completed all N required months" (67–68), which is row 2 of the banned table in
  `compliance-copy-standards.md`. `monthsRequired` is documented 1–6, and the component returns `null`
  when `monthsCompleted < monthsRequired`, so today it can only render at `monthsRequired === 1`.
  **Making it reachable therefore ships banned copy to five of six valid values** — the bug and the
  no-verdict guard have been protecting each other by accident. Replace with neutral arithmetic: hours
  logged, threshold, difference, per month. Line 117 also asserts "Renewals happen every 6 months", a
  policy literal outside `src/lib/policy/` **and** the known § 435.916 / § 1902(e)(14)(L) ambiguity —
  drop it or hedge it with the ambiguity named. Overlaps W7b, which owns removing `isCompliant`; W5 does
  the copy only and leaves the type to W7b.
- **Store a review-period anchor, without a schema bump.** *Added 2026-09-02.* § 435.556(a)(1) measures
  the application review period from the **month of application**, and nothing in the schema stored one:
  `OnboardingContext` held `monthsRequired` (a count) and `deadline` (a notice response date), neither of
  which identifies a month under review. Inferring months from `deadline` would be invention rather than
  computation — § 435.556(a)(2) forbids States from dictating *which* months count. So W5 adds an
  optional anchor field to `OnboardingContext`, which is **unindexed** (`db.ts:39` declares
  `profiles: "id"`), so it needs no `.stores()` change and no version bump. When unset, the app shows the
  selected month alone and says it does not know which months the State will review.
- ~~**Compound indexes.** `[userId+date]` on activities and income; `[userId+month]` on status.~~
  **MOVED TO W3** (2026-09-01). These need a `.stores()` change and therefore a Dexie version bump, which
  `data-migration-standards.md` assigns to W3's consolidated v7. W5 keeps in-memory `userId` filtering —
  correct for a single-profile app, and the reason this bullet already said "pairs with the W3 migration".
  W5 touches `src/lib/db.ts` not at all and writes no migration test.
- **Month navigation UI.** A month selector that works on a phone, with clear indication of which months
  belong to the current review period.

## Acceptance criteria

- [ ] Selecting any month updates the summary, activity list, income view, and status together
- [ ] ~~No domain function defaults to the current month~~ → **A guard test asserts zero wall-clock month
      derivations anywhere in `src/`, outside one named helper.** Rewritten 2026-09-02, approved before
      implementation. The original is a negative criterion with no positive twin, and
      `engineering-standards.md` requires one: it is satisfiable by editing a single line in
      `calculations.ts` while all ten derivations listed in the corrections note survive — including the
      two that use different mechanisms and can disagree at a month boundary. Those call sites are not
      domain functions, so `tsc` cannot find them and "no function defaults" stays true while the bug
      stays live. The guard must be proven to fail against today's tree before the fix lands
- [ ] `ReviewPeriod` drives evaluation, derived from a **single named federal-default constant** in the
      review-period module, commented as W2b's to move into `src/lib/policy/`. Reworded 2026-09-01: the
      policy profile does not exist yet and W2b comes after W5 — see the note at the top of this file
- [ ] Application review period is the correct consecutive months immediately preceding
- [ ] Renewal review period spans the eligibility period; UI states that any qualifying month counts
- [ ] Multi-month progress reflects the real review period, and `CompletionMessage` is reachable
      **at every `monthsRequired` from 1 to 6** — extended 2026-09-02, because "reachable" as written is
      satisfied by the `monthsRequired === 1` case that already works
- [ ] **`CompletionMessage` renders no verdict**, checked against the project's banned-phrase list by the
      existing no-verdict guard, and asserts no renewal frequency. Added 2026-09-02 as the positive twin
      of the criterion above: making the component reachable without this one ships banned copy
- [ ] Past months are editable and visually distinguished from the current month, and prompt for
      **evidence** rather than for progress toward the threshold — ADR-0005 § 5 as reconciled 2026-09-02
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
