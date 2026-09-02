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

Closed out 2026-09-02. Each verdict names the observable it was checked against.
Measured figures, not estimates: **423 → 525 Vitest tests** across 25 files, **62 → 72
Playwright specs**, lint **4 → 3** warnings, `git diff src/lib/db.ts` empty across all
five commits.

- [x] **Selecting any month updates the summary, activity list, income view, and status
      together.** `e2e/month-scoping.spec.ts` — paging back moves the navigator heading
      (h2), the dashboard heading, the calendar heading (h3) and the activity-list month
      group (h6) together, and the total changes 46 → 84. The two fixture months carry
      different totals precisely so this cannot pass by coincidence. Proven by mutation:
      pinning `monthlySummary` to `currentMonth()` fails 2 specs, pinning the activity
      list alone fails 1.

      **Structurally rather than by care:** five `useState` hooks became derivations of
      `selectedMonth`, so they cannot disagree with it. That is the actual fix; the test
      only proves it.
- [x] ~~No domain function defaults to the current month~~ → **A guard test asserts zero wall-clock month
      derivations anywhere in `src/`, outside one named helper.** Rewritten 2026-09-02, approved before
      implementation. The original is a negative criterion with no positive twin, and
      `engineering-standards.md` requires one: it is satisfiable by editing a single line in
      `calculations.ts` while all ten derivations listed in the corrections note survive — including the
      two that use different mechanisms and can disagree at a month boundary. Those call sites are not
      domain functions, so `tsc` cannot find them and "no function defaults" stays true while the bug
      stays live. The guard must be proven to fail against today's tree before the fix lands.

      **Met.** `src/__tests__/no-wall-clock-month.test.ts`, 13 tests. Proven red against
      all ten original sites before the fix, then green. `src/lib/month.ts` is the single
      exemption, and a test asserts the exemption points at real code so it cannot pass
      vacuously if the helper is renamed away.

      Two things worth recording about its limits, because a guard that oversells itself
      is worse than none. It polices **where** the clock is read, not whether a caller
      picked the right month — mutating `monthlySummary` to `currentMonth()` passes the
      guard and is caught only by the browser suite. And it is line-based, so
      `const now = new Date(); format(now, "yyyy-MM")` across two lines evades it; the
      mitigation is that month-boundary arithmetic is centralised, not that the regex is
      clever. Review also found real duplication it cannot see: `ActivityList.tsx` still
      has its own `formatMonthHeader` and a `localeCompare` month sort. Handed to W6a.

      It also earned its `mustNotFire` fixtures immediately: the first version banned
      `startOfWeek`/`endOfWeek` too and fired on `DuplicateActivityDialog.tsx:35`, which
      reads no clock and uses `parseISO` (local, unlike `new Date("2026-07-01")`).
      Narrowed. Guard over-reach is how the repo-wide policy-literal grep died.
- [x] `ReviewPeriod` drives evaluation, derived from a **single named federal-default constant** in the
      review-period module, commented as W2b's to move into `src/lib/policy/`. Reworded 2026-09-01: the
      policy profile does not exist yet and W2b comes after W5 — see the note at the top of this file.

      **Met.** `FEDERAL_DEFAULT_REVIEW_PERIOD` in `src/lib/reviewPeriod.ts`: one object,
      one export, every consumer takes it as an optional parameter, so W2b's move is a
      two-line diff. Six numeric literals, all inside it. Zero occurrences of `80`,
      `580`, `7.25` or `4.33` in added non-test source — and W5 **removed** one
      (`hoursNeeded: 80` from the page's initial state).

      Review found **one** literal that escaped: the copy said "We've assumed six",
      spelling the contested `renewalPeriodMonths` as an English word where no numeric
      scan could see it. Fixed — interpolated. Ironic, because this wave deleted the same
      figure from `CompletionMessage` for exactly that reason.

      One caveat the domain reviewer raised and I accept: `monthlyThreshold` is derived
      as `calculateMonthlySummary([], month).hoursNeeded`, which **relocates** rather
      than removes `calculations.ts`'s `80`. It is correct today only because
      `hoursNeeded` is `isCompliant ? 0 : 80 - totalHours`, and it would go silently
      wrong if that were ever given a zero-activity special case. W2b should export a
      named threshold instead.
- [x] Application review period is the correct consecutive months immediately preceding.

      **Met, and independently verified against the raw rule text.** § 435.556(a)(1) at
      91 FR 33473: "at least one, but not more than 3 consecutive months, as specified in
      the State plan, immediately preceding the month of application." The application
      month is excluded — corroborated three times in the source, including CMS's own
      seasonal example ("applies in July… the relevant review period is the month of
      June"). 11 tests; mutation including the application month fails 6.

      Browser-verified end to end: application month October 2026 → July, August,
      September, with October absent.

      **One finding, fixed.** A notice naming more than 3 months was silently clamped,
      showing a shorter period than the user's own letter. Under-scoping is the direction
      that costs coverage. Now surfaced with a route to the renewal path.
- [x] Renewal review period spans the eligibility period; UI states that any qualifying month counts.

      **Met.** § 435.556(a)(2)(i) verified verbatim. The non-consecutive rule is stated on
      screen and cited to **91 FR 33389** — page number confirmed by locating the nearest
      preceding `[[FR p.]]` marker, not recalled.

      **Partial, and flagged rather than glossed:** the period *span* is an assumption.
      § 435.556(a)(2)(i) measures from the last redetermination's effective date, which
      nothing in HourKeep stored, so the start is derived from an assumed 6-month renewal
      frequency — a figure that comes from § 1902(e)(14)(L) by way of the preamble, not
      from this rule, which says 12 months at § 435.916. Both halves of that conflict were
      verified in the raw text. It lives in `renewalPeriodMonthsSource` with the caveat
      attached, a test asserts the caveat cannot travel without it, and the UI says
      "we've assumed N, but yours may count a different stretch — some states renew every
      12 months rather than every 6."
- [x] Multi-month progress reflects the real review period, and `CompletionMessage` is reachable
      **at every `monthsRequired` from 1 to 6** — extended 2026-09-02, because "reachable" as written is
      satisfied by the `monthsRequired === 1` case that already works.

      **Met.** The one-entry `Map<string, boolean>` and its "For now, just check current
      month" comment are gone; progress is computed across `monthsInReviewPeriod`. The
      replacement carries **hours**, not `summary.isCompliant`, so W7b has less to unpick.
- [x] **`CompletionMessage` renders no verdict**, checked against the project's banned-phrase list by the
      existing no-verdict guard, and asserts no renewal frequency. Added 2026-09-02 as the positive twin
      of the criterion above: making the component reachable without this one ships banned copy.

      **Met, but only after review caught that my replacement was also wrong.** "Goal
      Complete!" and "completed all N required months" went, and so did "Renewals happen
      every 6 months". What I wrote instead — "Your record covers every month" — is a
      quantifier over the period that nothing computed, and **false in the default
      configuration**: a renewal period is six months long and requires one, so a user
      with one qualifying month and five empty was told their record covered every month.
      Now "{N} of {M} months at or over {T} hours", with the denominator passed in.

      The § 435.557(a)/(b) ex parte pair and the § 435.556(d) notice duty are now cited
      too; review found those claims stated without citations.
- [x] Past months are editable and visually distinguished from the current month, and prompt for
      **evidence** rather than for progress toward the threshold — ADR-0005 § 5 as reconciled 2026-09-02.

      **Met.** `MonthNavigator` marks a past month with a word as well as a colour
      (WCAG 1.4.1), prompts "you can still add hours you worked in December, or find proof
      for hours you already logged", and offers a way back. Nothing is disabled or hidden
      in either direction: restricting navigation would assert which months matter.
      Verified at 375×812 in a browser and by two e2e specs.
- [~] ~~Compound indexes exist; month queries no longer filter `userId` in memory~~ — **struck
      2026-09-01, handed to W3.** Needs a Dexie version bump W5 does not own. W3's v7 adds
      `[userId+date]` on activities and income and `[userId+month]` on status, alongside the `userId`
      column it already adds to `Activity`
- [x] **W5 bumps no Dexie version and adds no migration** — `git diff` on `src/lib/db.ts` is empty.

      **Met, three ways.** `git diff 38fe90b..HEAD -- src/lib/db.ts` is empty. The browser
      reports `HourKeepDB` still at version 60 (Dexie v6) *after* the new anchor field is
      written. And `e2e/month-scoping.spec.ts` asserts `db.version` is identical before
      and after, because an empty diff proves nobody edited the schema file — not that
      storing a field inside an unindexed nested object leaves the version alone.

## Risks

| Risk | Mitigation |
|---|---|
| Wide mechanical change touching most tracking components | Required parameters make it compiler-guided; W0 tests catch behavior drift |
| Month navigation crowds a phone screen | Compact selector; the review period is the organizing frame, not a free calendar browse |
| Users backfill months they weren't enrolled for | Record the data; don't assert what it means. Consistent with ADR-0003 |

---

## Found during execution

Four planning-doc errors are in the corrections note at the top. These are the things the
code turned out to be, which no document said.

1. **The wave is smaller in `src/lib/` and larger in `src/app/` than its scope section
   implies.** One function had an optional month, with one caller. The real work was ten
   wall-clock derivations at call sites the compiler cannot find — which is why criterion
   2 had to be rewritten as a guard test.

2. **The app held two different mechanisms for "what month is it", and one was wrong.**
   Nine sites used local `format(new Date(), "yyyy-MM")`; `how-to-hourkeep/results/page.tsx:117`
   used `new Date().toISOString().slice(0, 7)`, which is UTC. In any negative-offset zone
   UTC runs ahead, so late on the last day of a month that site wrote the tracking-mode
   row into the **following** month while the tracking page read the current one. To the
   user their choice simply had not saved. No test could have caught it: both mechanisms
   were individually self-consistent. `wave-5-month-scoping.md` never mentioned that site.

3. **`getComplianceMode` collapses "no preference" into "hours"**, which is fine for one
   fixed month and a defect the moment the page follows a selected month: a user tracking
   income who paged to a month they had never opened would have the whole surface flip to
   hours tracking, silently, with their income entries apparently gone. Added
   `getStoredComplianceMode`, which returns `undefined`. Added *alongside* rather than
   replacing, because `data-migration-standards.md` forbids tidying `complianceMode`
   before W7b.

4. **`vitest.config.mts` already pins `TZ=America/New_York`**, added by the W0-slice with
   exactly the right reasoning. Worth knowing because it means UTC runs **ahead** of local
   in tests, so a UTC month derivation diverges at the **end** of a local month, not the
   start. Getting that direction backwards made one of my tests insensitive — see Process
   notes.

5. **`handleAddMonth` was still there.** W0 § 0.4 listed it for deletion; it survived,
   zero-caller, still raising a lint warning. Swept up. Lint warnings 4 → 3.

6. **Two verdicts were live on the primary tracking surface**, and W2a's no-verdict guard
   could not see either. `Dashboard.tsx` and `IncomeStatusIndicator.tsx` both rendered
   **`Compliant`** in green beside a tick, over "You've met the $N requirement!". The
   guard lists `COMPLIANT` **case-sensitively**, to spare the `isCompliant` identifier
   from matching — and that carve-out also spared title case. Every other banned phrase
   carries a pronoun, so nothing came close.

   **Found by opening the built app in a browser at 375px.** Not by 509 passing tests, not
   by reading the code. `Compliant` and `you've met` are now separate case-sensitive
   entries; word boundaries mean `\bCompliant\b` still does not match inside
   `isCompliant`.

7. **`monthToDate` mapped years 0–99 into the 1900s**, because that is what the numeric
   `Date` constructor does: `new Date(50, 2, 1)` is 1950. So `calendarGridDays("0050-03")`
   produced a grid where every cell failed `inMonth` and no day was clickable. Reachable,
   because `<input type="month">` accepts a two-digit year and W5 persists what it
   produces. Found by the semantic reviewer.

8. **A malformed stored month could brick the tracking page.** The review period is built
   in the page's **render body**, the constructors throw on anything that is not strict
   `YYYY-MM`, and there is no error boundary anywhere in `src/` — so the page holding the
   only control that could clear the value was the page that would crash.
   `<input type="month">` is a real widget in Chromium and degrades to a free-text field
   in Firefox. Now validated before persisting **and** wrapped on read.

9. **Retaking the assessment silently destroyed the new anchor.**
   `how-to-hourkeep/page.tsx` built a fresh `OnboardingContext` literal and wrote it
   through `updateProfile`, and Dexie's `update()` with a nested key **replaces** rather
   than merges. The literal was exhaustive over four fields, so it lost nothing before this
   wave. W5 added a fifth, and because it is optional `tsc` cannot see the omission — an
   object literal missing an optional field still satisfies the interface. Exactly the case
   `data-migration-standards.md` closes with. Now spreads first.

   Checked `onboarding/page.tsx`, which builds the same kind of literal. **Not a bug** — it
   feeds `saveProfile` on a create path, so there is no existing anchor to lose.

## Deviations from the plan, and why

Nine. Two were approved before implementation; the rest are recorded here.

1. **Four review-period arms, not ADR-0005's three.** § 435.556(a)(2)(iii) — became an
   applicable individual mid-period — has a distinct end-month computation ("the end of
   the month prior") and its own row in the steering doc's table. Omitting it would mean
   reopening the module in W3 or W9a, and the type could not express a real user's
   situation. *Cost:* two arms have no non-test caller yet, which the semantic reviewer
   fairly flagged as speculative.

2. **Every arm carries `months[]` and `monthsRequired`**, which ADR-0005's union puts only
   on some. Additive — every field it names is still present. Computed once at
   construction so two call sites cannot derive the month list differently, and so the
   value stays serializable for W8a's evidence export.

3. **`CompletionMessage`'s copy was rewritten.** *Approved before implementation.* Making
   it reachable without this would have shipped banned copy to five of six valid
   `monthsRequired` values.

4. **`Dashboard` and `IncomeStatusIndicator` copy, plus the guard hole that hid it.**
   *Not* pre-approved — found in the browser mid-wave. Fixing `CompletionMessage` while
   leaving an identical verdict in the component directly above it would have been
   incoherent. `Dashboard` also gained a required `threshold` prop, removing three
   literals of `80`.

5. **`getStoredComplianceMode` added to `storage/income.ts`.** See Found during execution
   § 3. Reviewer 3 notes it duplicates `getComplianceMode`'s query verbatim and that
   `getComplianceMode = (…) ?? "hours"` would make divergence impossible. Fair; left as-is
   because both disappear together in W7b.

6. **`handleAddMonth` deleted** — a W0 § 0.4 leftover.

7. **`parseISO` replaced a hand-rolled `new Date(str + "T00:00:00")`** in
   `handleEditActivity`. Both are local-safe; the codebase had three idioms for one
   operation and now has two.

8. **`Dashboard`'s heading became `component="h3"`.** MUI maps variant `h5` to an `<h5>`
   element, so the page skipped from its h2s straight to h5.
   `component-standards.md` requires heading levels to nest correctly regardless of visual
   size. Small, and it forced an `exact: true` on an e2e locator.

9. **The `<input type="month">` anchor form seeds from the stored anchor.** Found by the
   semantic reviewer: the draft state was initialised once at mount and never synced, so a
   renewal user pressing "Change these dates" saw "I'm applying" preselected with today's
   month — and saving **silently converted their anchor kind**, which computes a different
   set of months. A data-correctness bug, not a cosmetic one.

## Review protocol outcome

**Run 2026-09-02 against `git diff 38fe90b..HEAD` (25 files, +3913/−322).**

### Four of four reviewers ran — the first time on this project

W2a lost two of four to sub-agent failures; W0 lost all four to stream stalls and
hand-ran the checklists, which is self-review. **Data integrity and semantic review had
never once run independently**, and both found blocking defects here that self-review had
not. The readiness README's carried-forward item 2 can close.

That is the headline finding of this wave. Four independent reviewers found **four
blocking** issues in work that had already passed 509 tests, six mechanical gates, and a
manual browser pass.

### The four blocking findings

1. **`ReviewPeriodPanel` told income-pathway users they were failing.** It sits above the
   hours/income fork, and its per-month rows are built from logged activities — so an
   income user saw "Logged: 0 hours. Threshold: 80 hours. Difference: 80." for every month
   of their review period. That is the harm ADR-0003 § Context names in as many words:
   *"HourKeep, seeing only their own pay stubs, would tell them they're failing and send
   them looking for 80 hours of volunteering."* Systematic, not incidental.

   Fixed with a `pathway` prop. The months stay visible for everyone — income users need
   them too — and only the hours arithmetic is scoped, with § 435.552(e)(2)'s combination
   rule stated so the hours figure does not read as a target being missed.

2. **`CompletionMessage` claimed a completeness it never computed.** See the criterion
   above.

3. **Retaking the assessment destroyed the anchor.** Found during execution § 9.

4. **A malformed month could brick the page.** Found during execution § 8.

### Why two of them got through, which matters more than the fixes

W5 rewrote or created **five** month-scoped components and put **none** of them in
`no-verdict.render.test.tsx`. Worse, `CompletionMessage`'s rendered branch was unreachable
in *every* suite: the e2e fixture sets `monthsRequired: 2` with one qualifying month, so
it returned `null` there, and a source scan cannot see a phrase it does not have.

A component whose only output nobody renders is a component whose copy nobody checks.

All five are now in the render guard, **including the celebratory branches**, because that
is where the temptation to assert lives. 19 → 35 tests in that file. The e2e verdict scan
also imported the canonical `VERDICT_PHRASES` — 29 entries — instead of hand-rolling three
patterns, which review pointed out would not have caught finding 2 either.

### Findings accepted and fixed beyond the blocking four

- The household-MAGI disclosure was on the **at-or-over** branch, a caution, and absent
  from the under-threshold branch where `compliance-copy-standards.md` says the married
  user whose spouse works is *"the case that matters"*. Moved, and phrased so a spouse's
  income never reads as a disqualifier.
- The notice figure was clamped to 3 months in silence. Surfaced.
- "We've assumed six" spelled a contested policy value as a word. Interpolated.
- § 435.557(a)/(b) and § 435.556(d) citations added to `CompletionMessage`.
- "add hours you worked **this month**" said that about a *past* month, under a chip
  reading "Past month". Names the month now.
- `monthToDate`'s year 0–99 bug, plus the test that was missing.
- A review-period chip truncated to "Your state may review this…" at 375px. A truncated
  hedge reads as a truncated claim; shortened.

### Two leads dropped after verification, so the count is honest

- **`onboarding/page.tsx` also builds a bare `OnboardingContext` literal** — but on a
  create path via `saveProfile`, so there is no existing anchor to lose. Not a bug.
- **The semantic reviewer said `ActivityList` "still holds its own `monthOfDate`,
  `compareMonths` and `formatMonthLong`".** Those functions do not exist in that file.
  What is really there is `formatMonthHeader` duplicating `formatMonthLong`'s job and a
  `localeCompare` sort duplicating `compareMonths`. Substance right, specifics invented —
  which is precisely why the protocol says a sub-agent finding is a lead, not a finding.

### Recorded, not fixed

Deferred deliberately, with the wave that owns each.

| Finding | Owner |
|---|---|
| `verificationReviewPeriod`'s `since` is inclusive, so it re-includes the boundary month against CMS's example at 91 FR 33390. User-favourable — extra months in scope plus "any month counts" can only help — but undocumented | W9a |
| "Lesser of" cited to `rule-extract.md` when a preamble page (91 FR 33391) exists. Source-tier label, not a wrong claim | W3 |
| § 435.556(a)(2)(iii)'s rule-text and preamble end-triggers differ ("becomes an applicable individual" vs "enrolls in coverage"); both cited, difference unnoted | W3 |
| Displayed compliance mode can diverge from stored, and the export reads stored — so a month could show income tracking and export as "Hours" | W7b |
| Mode and seasonal status resolve from different months on an untouched month: mode carries over, seasonal resets to `false` | W7b |
| `getStoredComplianceMode` duplicates `getComplianceMode`'s query | W7b |
| `currentMonth()` is called in the render body — an impure clock read under the React Compiler. Observable only across a month boundary mid-session | W10 |
| `describePeriod`'s `verification` and `newlyApplicable` arms are unreachable prose | W9a |
| `ActivityList`'s duplicated month logic, invisible to the guard | W6a |
| "qualifying" and "within limits" read above 8th grade | W10 |
| `calendarGridDays` is arguably a UI concern living in a domain module, and `isToday` is a second clock read in a module claiming one | — noted; the alternative was a guard that cannot ban `startOfMonth` |
| `ReviewPeriodPanel` does three jobs in ~450 lines | W9b, which adds hardship to the same surface |
| No real-browser upgrade test from an independently-created v6 database | W3 |

### Verified clean

- **No policy literal outside the one authorised constant**, after the "six" fix. Zero
  `80`/`580`/`7.25`/`4.33` in added non-test source; three remain in e2e assertions and
  will need updating when W2b changes the threshold.
- **All 95 CFR citation occurrences across 20 distinct strings check out**, including both
  Federal Register page numbers, verified by locating the nearest preceding `[[FR p.]]`
  marker rather than by recall. W0's review found two citation errors; this one found zero.
- **No `isCompliant` added in executable code.** Ten added mentions, all in comments or
  markdown. Six removed. `Dashboard` replaced it with a local `meetsThreshold`.
- **Behaviour asserts nothing.** Navigation is unrestricted in both directions, the anchor
  always has a way to change or clear, and `CompletionMessage` returning `null` hides no
  information — the per-month facts live in a panel that renders unconditionally.
- **Month arithmetic cannot drift.** 509 tests pass identically under UTC+14, UTC−11,
  UTC+5:45 and America/Los_Angeles; 48 calendar grids across 6 months × 8 timezones,
  including both 2026 DST transitions, produce no duplicated or skipped day.
- **Performance measured, not guessed.** The derived block costs 0.05 ms at 200
  activities, 0.29 ms at 2000, 1.1 ms at 10,000 on desktop Node — roughly 1.5–3 ms on a
  low-end phone against a 16 ms frame budget.

### Mechanical checks

`npx tsc --noEmit` clean · `npm test` **525/525** across 25 files · `npm run lint` 0
errors and 3 pre-existing warnings (4 at baseline) · `npm run format:check` clean ·
`npm run build` 12 static pages · `npm ci` exit 0 with only the pre-existing `jsdom`
`EBADENGINE` warning W0 recorded · `npm run test:e2e` **72/72** ·
`git diff src/lib/db.ts` empty.

### Negative-criterion check

Three criteria could have been satisfied by deletion. None were.

- **"`CompletionMessage` renders no verdict"** is satisfiable by deleting the component,
  or by leaving it unreachable. It is now reachable at every `monthsRequired` from 1 to 6
  *and* rendered in the guard.
- **"No hours shortfall shown to income users"** is satisfiable by suppressing the hours
  comparison for everyone. A positive twin asserts the hours pathway still gets
  "Logged: 46 hours. Difference: 34."
- **The guard test** is satisfiable by exempting more files. It exempts exactly one, and a
  test asserts that file really contains `currentMonth` and `calendarGridDays`, so
  renaming the helper away cannot make the guard pass vacuously.

## Process notes worth keeping

Three, all about mutation testing, and all cost real time.

1. **Verify the REVERT, not just the mutation.** W0 recorded that a mutation which does
   not apply looks exactly like a test that does not care. The mirror image is worse: my
   first harness reverted with `git checkout --`, which **cannot restore an untracked
   file**. Every mutation persisted, so each failure count after the first was cumulative
   garbage — and entirely plausible-looking. Now snapshots with `cp` and `diff`s back
   after every case.

2. **A browser suite can be mutation-proof for the wrong reason.**
   `playwright.config.ts` sets `reuseExistingServer`, and its `webServer` command is
   `npm run build && serve out`. With a server already on the port, Playwright skips the
   build and serves the **previous** export — so every mutation returns insensitive
   because the test never saw the change. The harness now frees the port, builds
   explicitly, and greps `out/` to prove the mutation reached the shipped bundle.

3. **Mutation testing found two of my assertions worthless.** `expect(locator).not.toHaveText(regex)`
   is a **whole-string** match, so `not.toHaveText(/\bCompliant\b/)` against `<body>`
   passes for any page containing anything else — which is every page. And an income-mode
   assertion matched the phrase "tracking income", which appears in the per-month rows
   too, so deleting the entire explanation left it green. Both read perfectly well.

   Across the wave: **29 mutations, 6 insensitive on first run, 0 after fixing.** Every
   one of the six was a real gap in a test, not a quirk of the harness.
