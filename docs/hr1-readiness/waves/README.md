# Implementation Waves

**Ordering principle:** risk-weighted value, subject to hard dependencies. Where the dependency graph
conflicts with user harm reduction, **cut the graph.**
**Invariant:** every wave leaves the app shippable and more correct than it started.
**Operative date:** **December 1, 2026** — see `../PRD.md` § 10. Waves above the line ship by then.

**Inputs:** `../gap-analysis.md` · `../PRD.md` · `../decisions/` · `../../audit/validation-findings-2026-08.md`

> ## Reordered on validation (2026-08-16)
>
> The original sequence was pure dependency order with no dates. An adversarial review broke it on three
> counts and I accept all three.
>
> **W1 at position 2 was indefensible.** Every justification in ADR-0009 is a cost the *developer* bears —
> fewer lines to migrate, don't write UI twice, a11y arrives sooner. Meanwhile the app tells users today
> that unearned income doesn't count. MUI 7→9 harms nobody, and a major framework migration is the single
> item most capable of eating a month with nothing to show. **W1 moves to the end.**
>
> **W2's dependency on W0 was mostly false.** The threshold refactor needs tests. The **factual copy
> corrections do not** — they're text edits with no arithmetic to preserve. **Split into W2a** (copy, zero
> dependencies, ships in days) **and W2b** (policy profile, after W0).
>
> **W5 at position 6 was the worst placement in the plan.** Every use of this app is retrospective:
> § 435.556(a)(1) assesses preceding months, § 435.552(g) averages preceding months, § 435.553(b) looks back
> three, § 435.558 gives ~35 days to document months already past. The user who most needs HourKeep is
> holding a notice in February 2027 about December 2026, and the app **cannot represent that month.**
> **If exactly one wave shipped, it should be W5.**
>
> **W3/W4 are demoted.** Under ADR-0003 the app cannot tell the user their status anyway. The status model's
> payoff is better *questions* and better *export content* — valuable, but not what keeps someone covered.
>
> **And the primary surface is wrong for many users.** $580 is roughly **32% of the single-person
> eligibility ceiling**, and CMS estimates **56% of the adult group will be verified ex parte**. The
> residual ~8.8 million are defined by what payroll data misses: unpaid and in-kind work, family caregiving,
> community service, unmatched gig income, less-than-half-time school. **Those users don't need an hours
> calendar.** The community-service record schema and caregiving log move forward out of W6 into **W6a**.

---

## Sequence

```
═══════════ SHIPS BY DECEMBER 1, 2026 ═══════════

W0-slice  Test runner only            ← nothing. An hour of work.
       │   Vitest + fake-indexeddb + testing-library, a `test` script,
       │   the orphaned imageCompression test made to run. Nothing else.
       ▼
W2a  Truth in Copy                    ← W0-slice. Days of work.
       │   every wrong statement corrected, every verdict string removed,
       │   ex parte explained, §435.559(c) reassurance, no-verdict render test
       ▼
W0   Safety Net (scoped down)         ← W0-slice   ✅ DONE 2026-09-01
       │   4 data-loss fixes, /test-compression out, delete-all-data,
       │   characterization tests for all five compliance-critical modules,
       │   dead-code deletion. NO migration test — W0 bumped no Dexie
       │   version, so there was nothing to migrate; that lands with W3's v7
       ▼
W5   Month Scoping                    ← W0            ◀ NEXT
       │   lift the month, make the parameter required, review-period model.
       │   NO Dexie version bump — compound indexes moved to W3's v7 (2026-09-01).
       │   ReviewPeriod uses a hardcoded federal default; W2b moves it to the profile
       ▼
W2b  Policy Profile                   ← W0, W5
       │   FEDERAL_DEFAULT, remove every policy literal
       ▼
W6a  Evidence Capture                 ← W2b
       │   community service record schema, caregiving log,
       │   education half-time cliff + credit-hour conversion,
       │   workProgram type, work broadened
       ▼
W8a  Print Evidence Export            ← W6a
       │   period-scoped, includes documents, one evaluation path,
       │   survives print and fax
       ▼
W7a  Seasonal + Income Corrections    ← W6a
           seasonal window fix, double-counting fix,
           income repositioned to evidence, household framing

═══════════ AFTER THE DATE ═══════════

W3   Status Model            ← W2b          (Dexie v7, consolidated)
W4   Screening Rebuild       ← W3
W7b  Unified Compliance      ← W3, W4, W6a  (mode fork removal, proxy)
W9a  Notice Response         ← W2b, W5      (30+5 countdown, coverage continues)
W9b  Hardship                ← W3, W9a
W8b  ZIP + JSON + Import     ← W8a
W6b  Activity Model Rest     ← W4
W10  Accessibility + Privacy ← W1, W5, W6a
W1   Dependency Modernization ← W0
```

**Hard dependencies, corrected**

| Wave | Requires | Why |
|---|---|---|
| **W0-slice** | — | **Vitest installed and a `test` script, nothing else.** See below |
| W2a | **W0-slice** | Text edits need no arithmetic preserved, but W2a ships the no-verdict guard test and touches two Tier-1 modules |
| W0 | W0-slice | Independent otherwise |
| W5 | W0 | W0's characterization tests are what make it safe to change `calculations.ts` — whose optional `month` parameter is the defect W5 exists to fix. **Corrected 2026-09-01:** this said "migration test before touching the schema", which wrongly implied W5 touches schema. It does not; the compound indexes moved to W3's v7. **Confirmed at execution 2026-09-02:** W5 bumped no version and `git diff src/lib/db.ts` is empty |
| W2b | W0, W5 | Tests prove the refactor is behavior-neutral; W5 first avoids a second pass over the same call sites |
| W6a | W2b | Thresholds and the credit-hour constant come from the profile |
| W8a | W6a | Export must carry the corrected record shapes |
| W7a | W6a | Income corrections sit alongside the activity model |
| W3 | W2b | Status resolution reads the profile. **Owns the consolidated Dexie v7** |
| W4 | W3 | Screening writes into the status model |
| W7b | W3, W4, **W6a** | Combination needs status, and the caregiving-hours-as-work rule needs W4's answers |
| W9a | W2b, W5 | Deadline values from the profile; assessed months are a review-period value. **Needs nothing from W7 or W8** |
| W9b | W3, W9a | Hardship resolves into the status model |
| W8b | W8a | |
| W6b | W4 | |
| W10 | W1, **W5, W6a** | W5 makes `Calendar` controlled and W6a rewrites both forms — rebuilding a11y before those guarantees a second rewrite |
| W1 | W0 | Deletion first means less to migrate |

### The W0-slice, and why it exists

**Found on the W2a dry run, 2026-08-16.** The ordering as published was circular. W2a was listed as having
no dependencies, yet it ships the **no-verdict render test** — which ADR-0007 promotes to Tier 1 and
explicitly assigns to W2a — and there is no test runner: `package.json` has no `test` script and no Vitest.
W0 adds the runner, and W0 is sequenced *after* W2a.

Compounding it, W2a's copy corrections reach `lib/exemptions/calculator.ts` (the user-facing `explanation`
strings) and `lib/assessment/recommendationEngine.ts` (which returns `complianceStatus: "compliant"`). Both
are **Tier-1 TDD modules** where `engineering-standards.md` requires a failing test first. That obligation is
unsatisfiable with no runner.

**Resolution: a thin slice of W0 runs first.** Scope, deliberately minimal:

- `vitest`, `@vitest/ui`, `fake-indexeddb`, `@testing-library/react`, `@testing-library/jest-dom` installed
- `vitest.config.ts` and a `test` script in `package.json`
- the orphaned `src/lib/utils/__tests__/imageCompression.test.ts` adapted so it executes
- **nothing else.** No characterization tests, no deletions, no `/test-compression` removal, no delete-all
  feature. Those stay in W0 proper.

This is an ordering correction, not new scope — ADR-0007 already assigns the guard test to W2a. Once the
slice lands, `npm test` in the Definition of Done becomes satisfiable for every subsequent wave.

> #### W0-slice status: COMPLETE — 2026-08-17, commit `5b4b27f`
>
> The slice has no wave file of its own; this is its completion record. Verified at closeout, not from
> memory.
>
> | Deliverable | Status | Observable |
> |---|---|---|
> | Five packages installed | **Done, plus one** | `vitest` 4.1.10, `@vitest/ui` 4.1.10, `fake-indexeddb` 6.2.5, `@testing-library/react` 16.3.2, `@testing-library/jest-dom` 7.0.1 — all pinned exact. **`jsdom` 30.0.1 was missing from this list** and is required: the code under test uses `FileReader`, `Image`, and `canvas`, and RTL brings no DOM |
> | Config and `test` script | **Done, as `.mts`** | `vitest.config.mts`, `test` = `vitest --run`, plus `test:watch` and `test:ui`. `.mts` rather than `.ts` avoids Vite's native config-loader CJS/ESM warning without making the package ESM, which would break `next.config.ts` and `scripts/*.js` |
> | Orphaned test executes | **Done** | `npm test -- src/lib/utils` → **10 passed**. It had only ever typechecked |
> | Nothing else | **Held, with one authorized addition** | `@types/jest` was **removed** — it existed solely to make that non-executing file typecheck and declared the same globals as Vitest with incompatible shapes, breaking `npx tsc --noEmit`. Approved explicitly rather than taken as licence |
>
> **Gates at closeout:** `npm test` 10/10 and **exits 1 on failure** — proven with a throwaway failing
> test, since a runner that cannot go red gates nothing · `npx tsc --noEmit` clean · `npm run lint`
> 0 errors, 4 pre-existing warnings · `npm run format:check` clean · `npm run build` succeeds.
>
> **Two defects this slice introduced and did not catch**, both fixed later in `f45080a`:
>
> 1. **The lockfile was not resolvable by CI's npm.** `yaml@^2.4.2` is an *optional peer* of `vite` 8.2.1
>    and conflicts with the `yaml@1.10.x` hoisted for `cosmiconfig`; npm 10 and npm 11 resolve that
>    differently, so `npm ci` failed on Actions with `Missing: yaml@2.9.0`. **Every other gate passed
>    against a tree npm itself reported as `invalid`**, because none of them read the lockfile. `npm ci`
>    is now in the Definition of Done for exactly this reason.
> 2. **The new test toolchain requires Node ≥ 22 and CI ran Node 20.** `EBADENGINE` is a warning npm does
>    not fail on, so the install looked clean and the tests would have broken at runtime. The `undici`
>    warning was visible during the original install and went unactioned.

**Corrections to the original graph:** W6 → W5 was not a real dependency (nothing in W6 evaluates hours);
W6 → W4 **was** real and missing; W9 needed W2/W3/W5, not W8; W10 needed W5 and W6; W3/W4 ∥ W5 was **not**
parallelizable because W5 needed indexes only W3's migration created — resolved by consolidating all
additive schema work into W3's v7 and having W5 need no migration.

**Migration ownership.** One **v7 in W3** (new table, `userId` on `Activity`, all compound indexes, drop the
genuinely dead `exemptions` / `exemptionHistory`). **`complianceModes` drops in W7b, not W3** — `complianceMode`
is referenced in **four files**: `lib/db.ts` (definition) plus three consumers, `lib/storage/income.ts`,
`app/tracking/page.tsx`, and `app/export/page.tsx`. (An earlier note said "five live readers"; that count is
not reproducible — verified 2026-08-16.) W6b takes **v8** for the education backfill.

## If time runs short

Cut in this order. Everything below the line above is already post-deadline.

1. **W1 entirely.** Pin versions, record the debt. Removes the most schedule risk for zero user-facing loss.
2. **W8b** — ZIP and JSON. A caseworker takes paper or a portal upload.
3. **W9b hardship modeling.** Two of four events are automatic and need no user action; the other two are
   "ask your agency." That's a paragraph, not a feature.
4. **W4 medically-frail sub-categorisation.** Down to one question plus the off-list request path.
5. **W10 encryption posture.** Keep keyboard, contrast, and labels — several exclusion categories are
   disability-based, which makes accessibility legal exposure, not polish.

**Never cut:** W2a copy, W5 month scoping, W8a print export, and the seasonal and education arithmetic fixes.

---

## Wave summaries

Detail lives in the individual wave files. Waves 0–2 are specified in full because they are next. Waves
3+ carry goals, scope, and acceptance criteria, and get task-level detail when they come up — planning
detail decays with distance, and pretending otherwise produces documents that drift.

| Wave | Theme | Ships | Gaps closed |
|---|---|---|---|
| **W0-slice** | **Test runner** | Vitest, `fake-indexeddb`, testing-library, a `test` script, the orphaned test made to run | — (unblocks W2a) |
| **W2a** | **Truth in copy** | Every wrong statement corrected; every verdict string gone; ex parte explained; § 435.559(c) reassurance; no-verdict render test | 5.2, 11.1–11.5, 15.7, 15.8, 15.20, part of 4.1/4.9/4.10, **part of 5.1/5.3** (household framing) |
| **[W0](wave-0-safety-net.md)** | Safety net, deletion, **4** data-loss fixes | Test harness incl. migration test; ~2,700 lines gone; delete-all-data; `/test-compression` out | audit §4.2, §4.6, §4.9, §4.14, §5, §7 |
| **[W5](wave-5-month-scoping.md)** | Month scoping + review periods | Any month viewable, editable, evaluable; review-period model | 6.4, 7.1–7.4, 15.6 |
| **W2b** | **Policy profile** | `FEDERAL_DEFAULT`; zero policy literals | 5.6, R8.1 |
| **W6a** | **Evidence capture** | Community service record schema; caregiving log; education half-time cliff + credit conversion; `workProgram`; work broadened | 4.1–4.7, 4.9–4.11, 8.4, 15.23, 15.24 |
| **W8a** | **Print evidence export** | Period-scoped, includes documents, one evaluation path, survives print and fax | 8.1, 8.4, 8.5, 8.7–8.9 |
| **W7a** | **Seasonal + income corrections** | Seasonal window fix; double-counting fix; income repositioned to evidence; household framing | 5.1, 5.4, 5.5, 5.7–5.10 |
| **[W3](wave-3-status-model.md)** | Three-tier status model | Per-month status; **consolidated Dexie v7**; tracking suppressed for excluded users | 1.1–1.7, 3.6, 6.3, 15.15, 15.21 |
| **[W4](wave-4-screening-rebuild.md)** | Screening rebuild | 10 exclusions incl. former foster care and **TDIU**; caregiver cluster; medically frail; SNAP/TANF split; household screener; **who signs frailty docs**; **reasonable modifications** | 2.1–2.12, 3.3, 3.4, 5.3, 15.2, 15.9–15.14, 15.22 |
| **W7b** | **Unified compliance** | Mode fork removed; combination + **provenance-guarded** proxy | 5.11, 6.1, 6.2, 15.1 |
| **W9a** | **Notice response** | 30+5 countdown; coverage-continues; both response paths; **appeal rights**; all-other-bases; APTC/PTC | 9.1–9.5, 15.4, 15.5, 15.16–15.18 |
| **W9b** | **Hardship** | Four events, automatic vs request, **unemployment as a second election** | 10.1–10.3, 15.3, 15.19 |
| **W8b** | ZIP + JSON + **import** | Portal upload and a real restore path | 15.27 |
| **W6b** | Activity model remainder | Enrollment-period rules, validation, `captureMethod` | 4.5, 4.8 |
| **[W10](wave-10-accessibility-privacy.md)** | Accessibility + privacy | Keyboard operability, WCAG AA text/large-text/non-text, encryption posture | audit §4.5, §4.14, R8.8, R8.9, 15.26 |
| **[W1](wave-1-modernization.md)** | Dependency modernization | MUI 9, Next 16.3, Tailwind removed, Inter loaded | audit §7, dark-mode bug |

> Wave files for W2a, W2b, W6a, W6b, W7a, W7b, W8a, W8b, W9a, W9b are not yet written — the existing
> `wave-2`, `wave-6`, `wave-7`, `wave-8`, `wave-9` files hold the combined scope and are the source for the
> split. Write each half when it starts.

---

## Definition of done, every wave

1. `npm run build` succeeds and `npx tsc --noEmit` is clean.
2. `npm test` passes. Domain changes have tests written **first** (ADR-0007 Tier 1).
   *Satisfiable from the W0-slice onward; there is no `test` script before it.*
3. `npm run lint` has no new warnings, and `npm run format:check` is clean.
4. **Copy review:** no new user-facing text asserts a determination (ADR-0003), and every number carries a
   Computed / Conditional / Deferred label. No new policy literals (ADR-0001).
5. Any new domain claim carries a **CFR citation plus FR page** in a code comment — the IFC has internal
   cross-reference drift, so a paragraph letter alone can go stale.
6. Gap-analysis rows closed by the wave are struck through with the wave number. **Rows split across waves
   may be struck with two numbers** — 2.3, 4.1, 4.9, 4.10, **5.1**, 5.3, 5.6, 8.4, and 8.9 are all split.
7. **Every negative acceptance criterion has a positive twin.** "No content says X" is satisfied by deleting
   the section; pair it with "content affirmatively says Y."
8. **The review protocol has been run** — `.kiro/hooks/wave-review.kiro.hook`, four independent reviewers,
   findings confirmed against the files before they count.
9. Manual smoke test on a phone viewport, offline.
10. `CHANGELOG.md` updated.

---

## Tracking

Status lives in `../README.md`. Update it when a wave starts and finishes rather than maintaining status
in two places.
