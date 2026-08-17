# Wave 0 — Safety Net, Deletion, and Data-Loss Fixes

**Depends on:** nothing
**Blocks:** everything
**User-visible outcome:** the app stops losing data, and you can finally delete your data. Otherwise quiet.

## Why first

Three reasons, in order.

1. **We are about to change compliance math with zero test coverage.** Five modules decide whether a user
   believes they will keep their coverage, and none of them have an executable test. Changing them blind
   is how you ship a bug that says "you're fine" to someone who isn't. See ADR-0007.
2. **Three confirmed data-loss bugs are live.** The worst deletes an unrelated document.
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
- Remove the four `console.log` calls in `DocumentMetadataFormSimple.tsx`.
- Fix `APP_CONFIG.version` falling back to `"4.2.0"`.
- Fix the `useActivityDocumentCounts` dependency array so the Dexie query stops re-running every render.
- Fix `CHANGELOG.md`'s 7.2.0 date (`2025-01-14` → `2026-01-14`).
- Make document blob + metadata writes transactional in `saveDocument` and `saveIncomeDocument` so a
  mid-write failure can't orphan a blob.

## Out of scope

No behavior changes to compliance math. No copy changes. No dependency upgrades. No new features. This
wave establishes the floor; W2 starts correcting content.

## Acceptance criteria

- [ ] `npm test` runs and passes; CI gates deploy on it
- [ ] All five compliance-critical modules have characterization tests, with known-wrong behaviors
      annotated and referencing the wave that fixes them
- [ ] Viewing and deleting an income document affects **only** income tables — proven by test
- [ ] Deleting an income entry removes its documents and blobs — proven by test
- [ ] Every listed dead file is gone; `tsc --noEmit` and `npm run build` still pass
- [ ] Post-compression size check exists in both live document paths
- [ ] A user can delete all their data from Settings, and the encryption key is removed with it
- [ ] `/test-compression` is not in the production build output
- [ ] Settings → About shows the real version
- [ ] Line count in `src/` drops by roughly 2,500

## Risks

| Risk | Mitigation |
|---|---|
| A "dead" file turns out to be referenced dynamically | Grep for string-literal imports and `import()` before each deletion; build after each |
| Characterization tests calcify bugs into expectations | Every known-wrong test is annotated with its CFR citation and the fixing wave |
| Delete-all is irreversible | Type-to-confirm, plus an export prompt first |
