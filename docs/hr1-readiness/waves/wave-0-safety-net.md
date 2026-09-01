# Wave 0 — Safety Net, Deletion, and Data-Loss Fixes

**Depends on:** nothing
**Blocks:** everything
**User-visible outcome:** the app stops losing data, and you can finally delete your data. Otherwise quiet.

## Why first

Three reasons, in order.

1. **We are about to change compliance math with zero test coverage.** Five modules decide whether a user
   believes they will keep their coverage, and none of them have an executable test. Changing them blind
   is how you ship a bug that says "you're fine" to someone who isn't. See ADR-0007.
2. **Four confirmed data-loss bugs are live.** The worst deletes an unrelated document. (Was "three"
   here while § 0.3 listed four; corrected during execution.)
3. **~2,500 lines of dead code slows everything downstream** and includes a parallel, unused exemption
   flow that is easy to edit by mistake. Deleting now means less to migrate in W1.

## Scope

### 0.1 Test harness (ADR-0007)

- Add `vitest`, `@vitest/coverage-v8`, `fake-indexeddb`. Add `"test": "vitest --run"` and
  `"test:watch": "vitest"`.
- Adapt `src/lib/utils/__tests__/imageCompression.test.ts` from Jest to Vitest syntax so it actually runs.
- Remove `@types/jest`.
- Wire `npm test` into `.github/workflows/deploy.yml` as a gate before build.

### 0.2 Characterization tests — the highest-value task in this wave

Capture **current** behavior of the five compliance-critical modules, bugs included, so later diffs prove
which changes were intentional. Do not fix anything here; just pin it down.

| Module | Pin at minimum |
|---|---|
| `lib/calculations.ts` | per-type sums; `>= 80`; `hoursNeeded`; `startsWith` month filtering |
| `lib/utils/payPeriodConversion.ts` | all four multipliers; `580`; rounding |
| `lib/storage/income.ts` | the `monthlyEquivalent` summing bug; the current `getLast6Months` window; divide-by-6 |
| `lib/exemptions/calculator.ts` | first-match-wins order across all 12 checks; `calculateAge` boundaries |
| `lib/assessment/recommendationEngine.ts` | the four-gate ladder; `alternativeMethods: []` for exempt |

Name each test for the behavior, and mark known-wrong ones explicitly:

```ts
// CHARACTERIZATION: current behavior is incorrect per § 435.552(g).
// The assessed month must be EXCLUDED. Corrected in W7.
it("currently includes the assessed month in the 6-month window", () => { ... });
```

### 0.3 Data-loss fixes

**`DocumentViewer` resolves income document IDs against activity tables.** `IncomeEntryForm` passes ids
from `db.incomeDocuments` into a viewer that imports `getDocument`/`getDocumentBlob`/`deleteDocument` from
`@/lib/storage/documents`. Independent `++id` sequences, so viewing shows an unrelated document and
**Delete destroys it**. Fix: give `DocumentViewer` a `context: "activity" | "income"` prop and dispatch to
the right storage module. Test both paths.

**Income entry deletion has no cascade.** `deleteIncomeEntry` is a bare `db.incomeEntries.delete(id)`,
orphaning `incomeDocuments` and their blobs. Add `deleteIncomeEntryWithDocuments`, mirroring
`deleteActivityWithDocuments`, plus a confirmation dialog matching the activity flow.

**"Back to Assessment" destroys history.** `results/page.tsx` calls `db.assessmentResults.delete()`
directly instead of `archiveAssessmentResult`. Meanwhile the adjacent "Start Fresh" button doesn't delete
at all — the two labels describe the opposite of what they do. Route both through the storage layer and
relabel to match behavior.

**Onboarding double-saves the assessment.** `AssessmentFlow.completeAssessment` writes the result, then
`onboarding/page.tsx:106` writes it again; because `saveAssessmentResult` archives-then-inserts, every
onboarding manufactures a spurious history entry, and the surviving row loses `noticeContext`. Remove the
duplicate call and pass `finalResponses` rather than `responses`.

### 0.4 Delete dead code

Verified zero-importer. Delete files entirely:

`components/tracking/GoalProgress.tsx` · `components/income/IncomeHelp.tsx` ·
`components/documents/DocumentMetadataForm.tsx` · `components/exemptions/ExemptionBadge.tsx` ·
`components/exemptions/ExemptionDetailsDialog.tsx` · `components/exemptions/ExemptionResults.tsx` ·
`components/exemptions/QuestionFlow.tsx` · `lib/exemptions/questionFlow.ts` ·
`components/exemptions/DefinitionTooltip.tsx` · `components/assessment/AssessmentHistory.tsx` ·
`lib/validation/documents.ts`

Also remove the orphaned exports and dead type surface listed in `../../audit/codebase-audit-2026-08.md` § 5,
plus `tracking/page.tsx`'s `handleAddMonth` and the empty `handleContinueTracking`.

**Before deleting `DocumentMetadataForm.tsx`**, note it is the only place that re-checks file size **after**
compression — a check the live paths dropped. Port that check into `ActivityForm` and `IncomeEntryForm`.
Note also that `DocumentMetadataFormSimple.tsx` is a **different, live** file — delete by exact path.

> **Do not delete these three, corrected on validation.** The "dead type surface" list includes
> `ExemptionQuestion.options` / `QuestionOption` / `"multipleChoice"` (annotated "UI supports it, no question
> uses it") and `ExemptionResponses.medicallyFrailDetails`. **W4 needs all of them** — the three
> family-caregiver criteria and the five medically-frail categories are multiple-choice questions, and
> frailty detail capture is exactly what `medicallyFrailDetails` is for. Retain them, or record them
> explicitly as W4 re-adds.
>
> Also: `lib/exemptions/questionFlow.ts` **implements the skip-answered logic the live flow lacks.** Port or
> record it before deleting.
>
> Deleting the four dead files that contain `questionId` switches drops the count from **7 to 3** for free,
> which is most of W4's de-duplication work done as a side effect.

Delete the three stale in-code docs that instruct readers to test at `/exemptions` (now a redirect stub):
`lib/exemptions/DEFINITIONS_SUMMARY.md`, `components/exemptions/ACCORDION_UPDATE.md`, and the stale
sections of `DEFINITIONS_README.md`.

### 0.5 Honor the privacy promise

`PrivacyNotice.tsx` and `settings/PrivacyPolicy.tsx` both promise "Export or delete anytime." There is no
delete-all anywhere in `src/`.

Add a Settings → Privacy & Data destructive action: a clear explanation of what will be removed, a
type-to-confirm gate, then delete all Dexie tables, remove the `hourkeep-encryption-key` from
`localStorage`, clear the guidance-dismissal keys, and route to `/onboarding`. Offer an export first.

### 0.6 Housekeeping

- Remove `/test-compression` from the production build — it is publicly reachable at
  `hourkeep.app/test-compression` and precached by the service worker. Either delete the route or gate it
  on `NODE_ENV !== "production"`.
- Remove the four `console.log` calls in `DocumentMetadataFormSimple.tsx`. (There was a fifth, in
  `IncomeEntryForm.handleDocumentCaptured`, that no list had counted. Removed too.)
- Fix `APP_CONFIG.version` falling back to `"4.2.0"`.
- Fix the `useActivityDocumentCounts` dependency array so the Dexie query stops re-running every render.
- Fix `CHANGELOG.md`'s 7.2.0 date (`2025-01-14` → `2026-01-14`).
- Make document blob + metadata writes transactional in `saveDocument` and `saveIncomeDocument` so a
  mid-write failure can't orphan a blob.

## Out of scope

No behavior changes to compliance math. No copy changes. No dependency upgrades. No new features. This
wave establishes the floor; W2 starts correcting content.

## Acceptance criteria

Closed out 2026-09-01. Each is checked against a named observable; three were rewritten because as
drafted they named nothing checkable, and one was unmeetable as written.

- [x] **`npm test` runs and passes; CI gates deploy on it.**
      `npm test` → 423 passing across 22 files, run twice for stability. `deploy.yml:63` runs `npm test`
      between the type check and lint. Was already true from the W0-slice; re-verified.
- [x] **All five compliance-critical modules have characterization tests, with known-wrong behaviours
      annotated and referencing the wave that fixes them.**
      `calculations.ts` (16), `payPeriodConversion.ts` (23), `storage/income.ts` (36) are new;
      `exemptions/calculator.ts` (43→64) and `assessment/recommendationEngine.ts` (45→70) extend W2a's
      files rather than duplicating their fixtures. Every known-wrong test names its CFR section and its
      owning wave. Coverage report confirms the first three had **zero** coverage before — they did not
      appear in it at all.
- [x] **Viewing and deleting an income document affects only income tables — proven by test.**
      Two layers, because neither alone is sufficient: `documentAccess.test.ts` (19) proves the dispatch
      under a constructed id collision, and `DocumentViewer.context.test.tsx` (6) proves the component
      threads the prop — a viewer that accepted `context` and ignored it would leave the first suite
      green. Both proven red by reintroducing the original bug (6 and 4 failures).
- [x] **Deleting an income entry removes its documents and blobs — proven by test.**
      `deleteIncomeEntryWithDocuments.test.ts` (7). Plus `IncomeDashboard.deleteConfirm.test.tsx` (7) for
      the confirmation gate, which was not optional: making the delete cascade without a gate would have
      made this wave strictly more destructive than the bug it fixed.
- [x] **Every listed dead file is gone; `tsc --noEmit` and `npm run build` still pass.**
      14 files removed. Deadness re-verified at deletion time with a resolved import graph, not the
      audit's list — see "Found during execution" for why that mattered. Both gates clean.
- [x] **Post-compression size check exists in ~~both~~ all five live document paths.**
      Criterion undercounted the sites: there are five, not two — `ActivityForm.tsx` ×3 and
      `IncomeEntryForm.tsx` ×2. All five now route through `compressForStorage`, verified by grep at 5
      call sites and 0 remaining `compressImage` uses in those files. 11 tests.
- [x] **A user can delete all their data from Settings, and the encryption key is removed with it.**
      `deleteAllData.test.ts` (11), `DeleteAllDataDialog.test.tsx` (13),
      `deleteAllReachable.test.tsx` (4) — the last exists because "reachable from Settings" needed its own
      observable; a dialog nobody can open satisfies the other two suites.
- [x] **`/test-compression` is not in the production build output.**
      Absent from `npm run build`'s route list, from `out/`, and from the service worker precache. Route
      deleted rather than gated on `NODE_ENV`, since a gated route still ships a file the service worker
      can precache.
- [x] **Settings → About shows the real version.**
      Fallback was `"4.2.0"` against a `package.json` of `7.2.0`. Now `"unknown"`.
      `next.config.ts:27` already injects `packageJson.version`, so the fallback rarely fires — it was a
      trap rather than a live bug, and a fallback that lies is still worse than one that admits it.
- [x] ~~Line count in `src/` drops by roughly 2,500~~ → **Deletion removes at least 2,500 lines of
      non-test code, measured against a stated baseline.**
      Rewritten: the original had no baseline and was unmeetable, because this wave adds far more test
      code than it deletes. Measured — deletion removed **2,566** lines of `src/` ts+tsx plus **358**
      lines of markdown. Total `src/` ts+tsx went **26,300 → 29,721**, up 3,421, because tests under
      `__tests__` went **2,235 → 7,397**. Non-test code fell from 24,065 to 22,324.

### Added during closeout — § 0.6 items the criteria never checked

- [x] **No `console.log` in production component code.** Five removed. `grep` finds none outside
      `db.ts`'s `.upgrade()` callbacks, which are left deliberately: migration logging is defensible and
      W3 rewrites them.
- [x] **`CHANGELOG.md` dates are internally consistent.** 7.2.0 was `2025-01-14`, which placed it before
      7.1.0's `2025-11-18`. Real date `2026-01-14`, established from git rather than guessed. All 13
      dated entries checked for ordering: 1 violation before, 0 after.
- [x] **A document write cannot orphan a blob.** `documentWritesAreAtomic.test.ts` (8), proven red by
      unwrapping both transactions (5 failures). A test also proves orphans *accumulate* — three retries
      left three unreachable blobs.
- [x] **The `useActivityDocumentCounts` effect runs once per id set, not once per render.**
      `useActivityDocumentCounts.test.tsx` (7). See "Found during execution" — this was not the nit the
      criterion implied.

### Not met

- [x] **Phone-viewport check on the delete-all flow.** ~~Not met at closeout~~ — **closed 2026-09-01**,
      after the wave, by `e2e/delete-all-mobile.spec.ts`.

      Recorded unmet at the time because it was the one criterion needing a person rather than a command:
      § 0.5 ships a destructive Settings action and the worst place to ship one unseen is a 375px
      viewport. Now a runnable observable — 10 specs at 375×812 asserting the control is reachable
      without horizontal scroll, that touch targets clear the project's 44px standard, that the dialog
      actually goes full-screen (a `fullScreen`/`noSsr` prop with no observable effect in jsdom), that
      both choices stay in the viewport, and that the full flow deletes and lands on onboarding while
      cancelling keeps everything — verified against a **real** IndexedDB, not `fake-indexeddb`.

      Worth noting what closing it took: a browser. `engineering-standards.md` asks every criterion to
      name an observable, and this one could not until the tooling existed. Two waves carried it as debt.

## Risks

| Risk | Mitigation |
|---|---|
| A "dead" file turns out to be referenced dynamically | Grep for string-literal imports and `import()` before each deletion; build after each |
| Characterization tests calcify bugs into expectations | Every known-wrong test is annotated with its CFR citation and the fixing wave |
| Delete-all is irreversible | ~~Type-to-confirm, plus an export prompt first~~ → **Type-to-confirm only.** `gap-analysis.md:298` (gap 15.27) rates "export first" `harmful`: there is no import path, so an export cannot restore anything. Calling it a mitigation would be an unverified claim. See "Found during execution" § 11 |

---

## Found during execution

Same pattern W2a reported: the legal analysis held, the bookkeeping around it did not. Ten items, each
verified against code or a command rather than inferred.

### The wave file was wrong in four places

1. **"Three confirmed data-loss bugs" in § "Why first" vs four in § 0.3.** Corrected above.

2. **§ 0.3.4's prescribed fix could not be applied.** It said to "pass `finalResponses` rather than
   `responses`" at `onboarding/page.tsx:106`. `finalResponses` is a local `const` inside
   `AssessmentFlow.completeAssessment` and that identifier does not appear anywhere in
   `onboarding/page.tsx`. The real loss site was `AssessmentFlow.tsx:378`.

3. **"Post-compression size check in both live document paths" undercounted.** Five sites, not two. And a
   **sixth** compression site exists that no document mentions — `FileUpload.tsx`, live via
   `DocumentCapture`. It needs no change, because its output flows through `DocumentCapture.onCapture`
   into the five guarded sites, so `compressForStorage` covers the upload path downstream. Verified the
   chain rather than assuming it.

4. **The line-count criterion had no baseline and was unmeetable.** Rewritten above with measured figures.

### The audit was wrong in three places

5. **`INCOME_THRESHOLD` is not unused.** Audit § 6 says "`REQUIRED_HOURS` and `INCOME_THRESHOLD` sit
   unused in `payPeriodConversion.ts`". `INCOME_THRESHOLD` has three live importers —
   `storage/income.ts:9`, `IncomeStatusIndicator.tsx:11`, `SeasonalWorkerView.tsx:16`. Only
   `REQUIRED_HOURS` and `FEDERAL_MINIMUM_WAGE` are module-internal. **W2b needs the real number.**

6. **`AssessmentHistory.tsx` was 64 lines, not ~180.**

7. **The audit's "12-way exemption switch" is not the calculator's branch count.** `calculator.ts` has
   **13** returning branches plus a fall-through (14 `nextSteps` strings). The audit's 12 counts question
   IDs in `AssessmentFlow`, a different file. § 0.2's "all 12 checks" inherited the wrong number.

8. **`questionFlow.ts` did not implement a short-circuit the live flow lacks.** The audit says it
   "ironically implements the skip-answered logic the live flow lacks." Half right: the live flow *does*
   short-circuit on exclusion, by a different route. What it genuinely lacks is
   resume-without-re-asking. Recorded in `wave-4-screening-rebuild.md`.

### Two § 0.6 items were not housekeeping

9. **The `useActivityDocumentCounts` dependency array was a render loop.** Both the audit and § 0.6
   described it as a query re-running each render. It is worse: the effect ends in
   `setCounts(new Map(...))`, a fresh object that never bails out of re-rendering, which produces a fresh
   `activityIds` identity, which re-runs the effect — unbounded, paced only by IndexedDB. The primary
   symptom is battery and heat on an old phone, which is why nobody saw it. Found by writing the test:
   the Vitest worker died after 83 seconds.

   **`exhaustive-deps` cannot catch this.** The rule reports *missing* dependencies; this array was
   over-specified, which satisfies it. Measured against `eslint-plugin-react-hooks` 7.1.1 with inline
   disables ignored — 11 errors across 8 files — and this hook raised none of them.

10. **Document saves orphaned blobs, and the orphans accumulate.** `saveDocument` and
    `saveIncomeDocument` wrote blob then metadata as two independent awaits. A failed metadata write left
    a blob nothing could reach: invisible to the UI, uncounted by `StorageInfo`, and unreachable by every
    delete path, since all of them start from the metadata row to find the `blobId`.
    `cleanupOrphanedDocuments` cannot reclaim these — it scans `db.documents` against `db.activities`, so
    it finds documents whose activity is gone, not blobs whose document never existed. There is no income
    counterpart at all. A test proves three retries left three unreachable blobs.

### Contradiction between documents, surfaced rather than resolved quietly

11. **§ 0.5's "export first" mitigation contradicts gap 15.27.** The Risks table said "Type-to-confirm,
    plus an export prompt first." `gap-analysis.md:298` rates the same idea `harmful`, because **there is
    no import path** — an export is a printout, not a backup. The type-to-confirm gate is therefore the
    entire protection. A test asserts the dialog never says backup, restore, or recover; it does say to
    save or print an export if the information may still be needed for the state, which is true without
    being a promise.

---

## Deviations from the plan, and why

Four, all deliberate.

1. **`payPeriodConversion` pins the arithmetic contract, not the constants.** § 0.2 asked for "all four
   multipliers; `580`". Those are exactly the policy literals ADR-0001 moves to `src/lib/policy/` in W2b,
   and ADR-0007 warns against pinning behaviour we intend to change. Split instead into a contract block
   that references `PAY_PERIOD_MULTIPLIERS` rather than restating it, and a named
   `W2b POLICY-LITERAL SNAPSHOT` block. Proven to work as intended: changing `weekly` 4.33 → 4.35 fails 3
   snapshot tests and 0 contract tests; changing `Math.round` → `Math.floor` fails 3 contract tests and 0
   snapshot tests. After W2b a snapshot failure means the refactor did its job; a contract failure means
   it broke something. *Approved before implementation.*

2. **The narrow `deleteIncomeEntry` export was removed, not kept.** § 0.3.2 implied a cascading sibling
   alongside it. But `activities.ts` exports only `deleteActivityWithDocuments` and keeps its bare
   `db.activities.delete` internal — so once `IncomeDashboard` switched over, the narrow export had zero
   production callers and was a trap: same single-number argument, reads as the obvious choice, silently
   orphans blobs. Two tests now assert each storage module exposes exactly one `delete*` export.

3. **The income delete confirmation is an MUI `Dialog`, not `window.confirm`.** § 0.3.2 said "matching
   the activity flow". This matches its *message* — the photo count, which is the fact that changes
   someone's mind — but not its primitive. `window.confirm` is unstylable, cannot go full-screen on a
   phone, and offers nowhere to report the partial-failure case this cascade needs. MUI dialogs are
   already the income idiom.

4. **The post-compression check became a shared helper rather than five copies.** Audit § 6 lists this
   codebase's duplication as a defect in its own right and those five blocks were already
   near-identical; six copies of one rule would have drifted.

Also, two things the closeout did that § 0.4 did not ask for, both small and both because leaving them
would have been incoherent: the results page's two `db.profiles.toArray()` reads were swapped for the
existing `getFirstProfile()` (leaving a direct Dexie read beside a comment about routing through the
storage layer made no sense), and three income document type labels were added to
`DOCUMENT_TYPE_LABELS` (before § 0.3.1 an income document never resolved, so its label was never reached;
now that it renders, the fallback would print the raw key `pay_stub`).

---

## Handoffs

### To W1 — the ten remaining React Compiler errors

**Measured, not recalled.** Installed `eslint-plugin-react-hooks@7.1.1` out-of-tree and ran it against
`src/` with inline disables respected: **11 errors across 8 files** — 6 `set-state-in-effect`, 5
`immutability`. `eslint-config-next` wants `^7.0.0`; `package.json`'s `overrides` pins 7.0.1, which is
what keeps them invisible today.

W0 removed **one** for free by deleting `DocumentMetadataForm.tsx`. **Ten remain**, in
`app/settings/page.tsx`, `app/tracking/page.tsx`, `ActivityForm.tsx`, `DocumentViewer.tsx`,
`IncomeDashboard.tsx`, `IncomeEntryForm.tsx`, `StorageInfo.tsx`.

Left to W1 deliberately: they produce zero output today, fixing them changes render timing in a wave
scoped "no behavior changes", and every affected file is rewritten by W5 or W6a. W1 owns lifting the pin.

Note `exhaustive-deps` is a *warning* under 7.1.1, not an error — and finding 9 above is the case it
cannot see at all.

### To W3 — `fake-indexeddb` does not preserve `Blob`

Probed 2026-08-17: a `Blob` written and read back arrives as a plain `Object` — `instanceof Blob` is
`false`, and `size`, `type`, `text()` and `arrayBuffer()` are all absent. **Any assertion on blob content
under this harness asserts on nothing.**

`data-migration-standards.md` requires the v6 → v7 migration test to assert "blobs survived". Under
`fake-indexeddb` that can only mean *the row is still reachable and its `blobId` still resolves*.

> **SUPERSEDED IN PART, 2026-09-01.** This originally said to state the limit and confirm blob survival by
> hand in DevTools. **Do not do that** — Playwright landed after W0 closed and removes the need.
> `e2e/browser-capabilities.spec.ts` proves a real `Blob` survives both a round trip and a version upgrade
> with its bytes intact, in a real browser against a real IndexedDB.
>
> So W3 should split the migration test across both harnesses:
>
> - **Vitest / `fake-indexeddb`** — row counts per table, every seeded field reachable, new fields hold
>   their defaults, upgrade is idempotent. Fast, runs on every change. Cannot speak to blob bytes.
> - **Playwright** — that a photographed pay stub still decodes to the same bytes after the v6 → v7
>   upgrade. Slow, runs on demand, and the one thing worth running twice: there is no server and no
>   backup, and this is the evidence a user hands an agency under 42 CFR 435.557.
>
> ADR-0007 Tier 2 has been amended to say the same. The two harness facts below still stand and still
> matter for the Vitest half.

Two more harness facts, both learned the hard way:

- **`clear()` does not reset autoincrement counters**, and tables advance independently. Use explicit ids
  (`put` with an `id`) when a fixture needs a collision; a first version hardcoded `1` and silently
  stopped colliding.
- **jsdom needs stubs for `URL.createObjectURL`, `URL.revokeObjectURL` and `ResizeObserver`** (the last
  for `react-zoom-pan-pinch` inside `DocumentViewer`).

### To W7a — three summing sites, not one

Found by mutation while pinning the `monthlyEquivalent` double-count. Replacing both `reduce`
accumulators in `storage/income.ts` (lines 103 and 142) left the per-source breakdown still inflated,
because `incomeBySource` accumulates separately via `existing.monthlyEquivalent +=` (lines ~152-154). A
fix applied only to the reduces leaves wrong the number a user reads when deciding which pay stub to
photograph. Grep `monthlyEquivalent`; do not trust the type checker.

Also pinned, and user-unfavourable: `recommendationEngine`'s seasonal gate is
`isSeasonalWork && monthlyIncome >= 580`, so 42 CFR 435.552(g) averaging is offered **only** to workers
whose single month already clears the threshold — inverting its purpose, since averaging exists for the
worker whose months are uneven.

### Smaller things, recorded so they are not rediscovered

- **Four pages still read `db.profiles` directly**, against `data-migration-standards.md`:
  `app/page.tsx`, `tracking/page.tsx`, `export/page.tsx`, `how-to-hourkeep/page.tsx`. `getFirstProfile()`
  already exists. The results page was fixed because W0 was already in it.
- **Activity deletion from the *form* has no confirmation** (`tracking/page.tsx` `handleDeleteActivity`)
  while the *list* path does. Not among § 0.3's four bugs; now the only unconfirmed destructive path left.
- **`hasJob` is read by nothing** in `recommendationEngine`. Passed by every caller, branched on nowhere,
  and absent from the audit's dead-type-surface list. Matters to W4, which rewrites the questions.
- **`complianceStatus` never returns its declared `"unknown"` variant** — confirms an audit entry.
- **An explicit `false` answer is indistinguishable from no answer** in `calculator.ts` (bare truthiness
  guards). Matters under 42 CFR 435.554(c)(5)(ii), where "I said no" and "nobody asked me" are different
  evidentiary positions.
- **`archiveAssessmentResult` is lossy** — it keeps four scalars and discards `responses` and the full
  `recommendation`. Better than the hard delete it replaced, but "archive" overstates it. Widening the
  history record is a schema change, so W3.
- **Pre-existing `EBADENGINE`, not introduced here.** `jsdom@30.0.1` requires
  `^22.22.2 || ^24.15.0 || >=26.0.0` and its `undici@8.10.0` requires `>=22.19.0`; local Node is
  v22.18.0 and `package.json` `engines` says only `>=22`. Latent — tests pass — but it is the same class
  the W0-slice recorded as fixed, and `engines: ">=22"` was insufficient for jsdom's floor.
- **After deleting a route, `tsc` reports stale errors** from `.next/types/validator.ts` until you
  `rm -rf .next` and rebuild. The gate lies to you otherwise.

---

## Process notes worth keeping

Three things that cost real time and would cost it again.

1. **A mutation that does not apply looks exactly like a test that does not care.** Proving the
   "export is not a backup" assertion, the mutation silently failed because Prettier had line-wrapped the
   string being searched for — so the test stayed green and appeared insensitive. Always assert the edit
   changed the file before believing a green result.

2. **A failing test never reaches its own `spy.mockRestore()`.** A throw-stub survived into the next test
   and broke it too, reporting one real failure as two with the second pointing at innocent code.
   `vi.restoreAllMocks()` now runs in `afterEach` in every file that uses spies.

3. **A test can pass for the wrong reason and look right.** Asserting `toBe("2026-07")` against a July
   fake clock stayed green when the wall-clock default was replaced by a hardcoded `"2026-07"`. Derive
   the expectation from the input, not from a literal that happens to match. A second instance: an
   equivalence sweep over 2026 was insensitive until extended to 2027, where the fixtures straddle the
   boundary that matters.

And one dead end, recorded so nobody repeats it: **three attempts to make the render-loop regression fail
cleanly all failed.** A render counter is rejected by `react-hooks/globals` as a side effect in render; a
throwing query spy is swallowed by the hook's own `catch`, which then re-triggers the loop; and a short
per-test timeout never fires because the loop starves the event loop. A regression does fail CI (exit 1)
after ~95 seconds with "Worker exited unexpectedly" — a gate, but not a diagnosis. The reasoning is in
the test file header.

---

## Review protocol outcome

**Run 2026-09-01 against `git diff c32885f..HEAD` (59 files, +7485/-3186).**

### Zero of four reviewers ran

All four sub-agents failed with `Model stream stalled: no data received for 300000ms`, on the initial
parallel fan-out and again on a retry with a shortened prompt. The four checklists were therefore
**run by hand**, and this section is labelled accordingly — it is self-review, which is precisely what
the protocol exists to avoid.

This is worse than W2a, which lost two of four. Between the two waves, **data integrity and semantic
review have now never been run by an independent reviewer**, and W0 is the wave that ships a
delete-everything button. That is the single biggest gap in this wave's verification and it is carried
forward in the readiness README.

### What the hand-run review actually found

Two real citation errors, both mine, both fixed:

1. **`42 CFR 435.552(f)(1)` does not exist in any source.** I used it twice in
   `payPeriodConversion.characterization.test.ts` for the wage × 80 threshold. `rule-extract.md` writes
   § 435.552(f) for the threshold and (f)(2) only for the § 435.603 cross-reference; `(f)(1)` appears
   **zero** times in the extract, zero times in the steering doc, and the rest of `src/` cites
   § 435.552(f). Corrected to § 435.552(f).

2. **`42 CFR 435.552(a)(5)` was cited for a prohibition it does not contain.** I wrote that (a)(5)
   "forbids combining" at-least-half-time education. (a)(5) is the combination *pathway*. The
   prohibition is in **§ 435.552(e)**, and `rule-extract.md` § 2.5 attributes the reason to (a)(4)
   already being satisfied. W2a's `no-verdict.content.test.ts` had already established the more precise
   `(a)(4), (e)(1)(ii)` form; mine was less accurate than the convention already in the repo. Corrected
   across three sites in two files.

Worth noting what this implies about the rest: `435.553(a)(1)`, `435.552(a)(4)` and `435.552(d)` were
**already established by W2a** across `calculator.ts`, `definitions.ts`, `questions.ts` and
`helpText.ts`, and W2a's review scrutinised exactly this surface (it corrected 43 wrong citations). W0's
use of them follows that vetted convention. The two errors above are both places where I departed from it.

### Verified clean

- **No verdict-shaped addition outside tests.** Every added `isCompliant` / `complianceStatus` /
  `isExempt` line is inside a `__tests__` file, pinning existing behaviour and annotated as W7b's to
  remove. Checked by filtering added lines with `:(exclude)*__tests__*` — empty result.
- **No new user-facing verdict copy.** `DeleteAllDataDialog`, the income delete dialog, the results-page
  dialog and `compressForStorage`'s error message are all clean against the project's banned-phrase list.
- **`src/lib/db.ts` untouched** — no Dexie version bump, confirmed by an empty diff and by a test
  asserting `db.verno` is unchanged after `deleteAllData`.
- **Quota checks precede the new transactions** in both `saveDocument` and `saveIncomeDocument`
  (checks at lines 7–22 of the function, transaction opens at 37).
- **The cascade cannot half-complete destructively**: documents are deleted first, and a failure throws
  before `db.incomeEntries.delete`.
- **`context` is a required prop** on `DocumentViewer`, so `tsc` — not vigilance — enforces both call
  sites naming a table.
- **Credit-hour formula matches the extract**: `creditHours × 3 × 4.33`, rule-extract lines 173–174.
- **No raw `Date` month arithmetic added.** The only `new Date()` additions are `createdAt` timestamps in
  fixtures.
- **The blob tests do not give false confidence.** Given `fake-indexeddb` discards `Blob`, every blob
  assertion in this wave is a row count or a `createdAt` identity check — never content. Verified by
  grepping the three relevant test files for content assertions: none.

### One finding recorded, not fixed

**A failed assessment save is silent.** `AssessmentFlow.completeAssessment`'s `catch` logs to the console
and does nothing else: `advanceStep("gettingStarted")` never runs, so the user sits on the last question
with no message and a button that appears dead.

Traced carefully, because W0 removed the duplicate write and the obvious worry is that it made this
worse. It did not: `advanceStep` was already inside the same `try` after the save, so pre-W0 a failed
first write also blocked the flow, meaning `onComplete` never fired and onboarding's second write was
unreachable. The removed write was redundant *precisely when it would have mattered*. Outcome identical
before and after — a pre-existing gap, neither caused nor closed here.

Left alone because a fix means new error UI, which is out of a wave scoped "no behaviour changes to
compliance math, no copy changes". Belongs with W4's screening rebuild.

### Mechanical checks

`npx tsc --noEmit` clean · `npm test` 423/423 across 22 files, run twice · `npm run lint` 0 errors and
the 4 pre-existing unused-import warnings · `npm run format:check` clean · `npm run build` compiles ·
`npm ci` clean.

### Negative-criterion check

Two criteria could have been satisfied by deletion. Neither was:

- **"Every listed dead file is gone"** would be satisfied by deleting the post-compression size check
  along with `DocumentMetadataForm.tsx`. It was rescued into `compressForStorage` first, and the
  criterion was rewritten to name all five live sites rather than the two it originally claimed.
- **"The allowlist is empty"** would be satisfied by deleting the tests that police it. The entries went;
  the tests stayed, with the meta-test inverted to assert emptiness — so adding a new entry is still a
  deliberate, visible act.

One thing genuinely was lost and is recorded rather than glossed: `questionFlow.ts`'s
resume-without-re-asking logic. Not ported, because W4 replaces the flow it would have been ported into.
Captured in `wave-4-screening-rebuild.md` with the reasoning and three things W4 should fix rather than
reproduce.
