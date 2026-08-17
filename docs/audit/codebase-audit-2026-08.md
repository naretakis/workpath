# HourKeep Codebase Audit

**Date:** August 16, 2026
**Commit audited:** `75d8e7c` (2026-01-14, 7 months prior)
**Version:** `package.json` 7.2.0 (latest git tag: v7.0.0)
**Verification status:** `tsc --noEmit` clean · `next build` succeeds (13 static routes) · `eslint` 0 errors / 4 warnings

This document is the durable record of a full-codebase investigation. It is the baseline for the
CMS-2454-IFC gap analysis and the wave-based implementation plan.

---

## 1. What the application is

A privacy-first, offline-capable PWA that helps Medicaid expansion adults document compliance with
the HR1 §71119 community engagement requirement. No server, no accounts, no backend API. All data
lives in the browser.

| Concern | Choice |
|---|---|
| Framework | Next.js 16.0.1, App Router, `output: "export"` (fully static) |
| UI | React 19.2.0 (React Compiler enabled via `babel-plugin-react-compiler`), MUI 7.3.4, Emotion |
| Persistence | Dexie 4.2.1 over IndexedDB, DB name `HourKeepDB`, **schema version 6** |
| PWA | `next-pwa` 5.6.0, `register: true`, `skipWaiting: true`, disabled in dev |
| Dates | `date-fns` 4.1.0 |
| Validation | `zod` 4.1.12 (**declared but effectively unused** — see §6) |
| Hosting | GitHub Pages via `.github/workflows/deploy.yml` on push to `main`, custom domain `hourkeep.app` |
| Analytics | Plausible, loaded unconditionally in `layout.tsx` |
| Size | ~23,000 lines under `src/` |

### Routes

| Route | Purpose |
|---|---|
| `/` | Redirect gate: profile exists → `/tracking`, else `/onboarding` |
| `/onboarding` | 3-step: privacy → profile → assessment |
| `/tracking` | The dashboard. Forks on compliance mode |
| `/how-to-hourkeep` | Standalone / retake assessment |
| `/how-to-hourkeep/results` | Saved recommendation detail |
| `/export` | JSON + plain-text report |
| `/settings` | Profile, screening status, storage, privacy, about |
| `/exemptions` | **Redirect stub** → `/how-to-hourkeep` |
| `/test-compression` | **Dev harness shipped to production** |

---

## 2. Data layer

One Dexie database, 14 tables, schema version 6. All migrations are additive; none transform data
except v4, which backfilled profile fields.

| Table | Key + indexes | Notes |
|---|---|---|
| `profiles` | `id` (UUID) | Single-profile app in practice. `dateOfBirth` + `medicaidId` encrypted |
| `activities` | `++id, date, type` | **No `userId`** — implicitly owned by `profiles[0]` |
| `documents` | `++id, activityId, type, createdAt` | Metadata only |
| `documentBlobs` | `++id` | Raw `Blob`, unencrypted |
| `exemptions` | `++id, userId, screeningDate` | **Never written to** |
| `exemptionHistory` | `++id, userId, screeningDate` | **Never written to** |
| `incomeEntries` | `++id, date, userId` | `monthlyEquivalent` denormalized at save |
| `incomeDocuments` | `++id, incomeEntryId, type, createdAt` | Parallel to `documents` |
| `incomeDocumentBlobs` | `++id` | Parallel to `documentBlobs` |
| `complianceModes` | `++id, month, userId` | Per-user-per-month `"hours" \| "income"` |
| `seasonalWorkerStatus` | `++id, userId, month` | Per-user-per-month boolean |
| `assessmentProgress` | `++id, userId, lastUpdatedAt, isComplete` | Write-only; no resume path |
| `assessmentResults` | `++id, userId, completedAt` | At most one live row per user |
| `assessmentHistory` | `++id, userId, completedAt` | Lossy 4-field projection; **no reader** |

No compound `[userId+date]` index anywhere, so month-scoped queries filter `userId` in memory.

### Storage modules (`src/lib/storage/`)

`activities.ts` · `assessment.ts` · `documents.ts` · `exemptions.ts` · `income.ts` ·
`incomeDocuments.ts` · `profile.ts`

Pure domain logic is separated out: `lib/calculations.ts` (hours), `lib/utils/payPeriodConversion.ts`
(income constants + conversion), `lib/exemptions/calculator.ts`, `lib/assessment/recommendationEngine.ts`.

---

## 3. Feature pillars

### 3.1 Assessment — "How to HourKeep"

`src/components/assessment/AssessmentFlow.tsx` (836 lines) is the spine of the app. One shared
component, two hosts:

| Host | `showIntro` | `saveProgress` |
|---|---|---|
| `/onboarding` (step 3) | `false` | `false` |
| `/how-to-hourkeep` | `true` | `true` |

**Step machine** (manual stack, not declarative): `intro → notice → noticeDetails →
noticeFollowUpWithNotice \| notice-followup → exemption (×12) → work-job → work-income \|
work-income-seasonal → work-hours → activities → activities-volunteer \| -school \| -workprogram →
gettingStarted`

Navigation is a `stepHistory: AssessmentStep[]` stack with `advanceStep()` / `handleBack()`.
`exemptionQuestionIndex` is tracked **outside** that stack, requiring a special case at index 0.

**Recommendation engine** (`lib/assessment/recommendationEngine.ts`) is a pure function with a
four-gate ladder:

1. **Exemption short-circuit** — `calculateExemption(responses.exemption)`; if exempt, returns
   `primaryMethod: "exemption"`, `alternativeMethods: []` (always empty), `complianceStatus: "compliant"`.
2. **Viability set** — `monthlyIncome >= 580` → `income-tracking`; `isSeasonalWork && >= 580` →
   `seasonal-income-tracking`; `totalHours >= 80` → `hour-tracking`.
3. **Priority ladder** — seasonal income > income > hours > fallback (`hour-tracking` +
   `needs-increase` + `high` effort).
4. **Alternatives** — `viableMethods.filter(m => m !== primaryMethod)`.

`complianceStatus: "unknown"` is declared but never produced. `seasonal-income-tracking` is a strict
subset of `income-tracking` and can never be viable alone.

**Persistence** — `saveAssessmentResult` archives-then-inserts, so `assessmentResults` holds at most
one live row per user and `assessmentHistory` accumulates lossy projections that nothing reads.

### 3.2 Exemption screening

Absorbed into the assessment. `/exemptions` is now a redirect stub.

`lib/exemptions/calculator.ts` — `calculateExemption()` is a **first-match-wins ordered cascade** of
12 checks returning `{isExempt, exemptionCategory?, exemptionReason?, explanation, nextSteps}`.
No confidence field, no structured HR1 citation in the output, no "not sure" state.

**The 12 questions** (`lib/exemptions/questions.ts`, `allQuestions`), in fixed order:

| # | ID | Category | Response field |
|---|---|---|---|
| 1 | `age-dob` | age | `dateOfBirth` (type `date`) |
| 2 | `family-pregnant` | family-caregiving | `isPregnantOrPostpartum` |
| 3 | `family-child` | family-caregiving | `hasDependentChild13OrYounger` |
| 4 | `family-disabled-dependent` | family-caregiving | `isParentGuardianOfDisabled` |
| 5 | `health-medicare` | health-disability | `isOnMedicare` |
| 6 | `health-non-magi` | health-disability | `isEligibleForNonMAGI` |
| 7 | `health-disabled-veteran` | health-disability | `isDisabledVeteran` |
| 8 | `health-medically-frail` | health-disability | `isMedicallyFrail` |
| 9 | `program-snap-tanf` | program-participation | `isOnSNAPOrTANFMeetingRequirements` |
| 10 | `program-rehab` | program-participation | `isInRehabProgram` |
| 11 | `other-incarcerated` | other | `isIncarceratedOrRecentlyReleased` |
| 12 | `other-tribal` | other | `hasTribalStatus` |

All are `boolean` except #1. Exemption is re-evaluated **after every answer** against a slice of
answers 0..currentIndex, so the first `true` short-circuits to `completeAssessment` and skips all
work/income questions.

**Three-tier terminology architecture** (from the `exemption-terminology-realignment` spec):
Tier 1 = question `text` uses authoritative HR1 wording; Tier 2 = `helpText` is 8th-grade plain
language; Tier 3 = `definitions.ts` holds 21 `TermDefinition` records mapped per question via
`questionDefinitionMap`, rendered by `DefinitionsAccordion`.

### 3.3 Tracking

`src/app/tracking/page.tsx` (676 lines) holds 17 pieces of state and one loader, `loadActivities()`,
re-triggered by the `activities-updated` and `assessment-completed` window events.

Renders in order: header → `DashboardGuidance` → `AssessmentBadge` → `ComplianceModeSelector` → then
a hard fork:

- **hours mode**: `CompletionMessage` → `Dashboard` → `ActivityList` → `Calendar` → add FAB
- **income mode**: `IncomeDashboard` only

**Hours math** (`lib/calculations.ts`): filter by `date.startsWith(targetMonth)`, sum into
`workHours` / `volunteerHours` / `educationHours`, `isCompliant = totalHours >= 80`,
`hoursNeeded = isCompliant ? 0 : 80 - totalHours`.

**Income math** (`lib/utils/payPeriodConversion.ts` + `lib/storage/income.ts`):

```
FEDERAL_MINIMUM_WAGE = 7.25
REQUIRED_HOURS       = 80
INCOME_THRESHOLD     = 7.25 * 80 = 580
PAY_PERIOD_MULTIPLIERS = { daily: 30, weekly: 4.33, "bi-weekly": 2.17, monthly: 1 }

monthlyEquivalent = round(amount * multiplier * 100) / 100
totalIncome       = sum(entry.monthlyEquivalent)          // per month
effectiveIncome   = isSeasonalWorker ? seasonalAverage : totalIncome
isCompliant       = effectiveIncome >= 580
seasonalAverage   = sum(last 6 months totals) / 6         // fixed divisor
```

**Activity types**: `"work" | "volunteer" | "education"` only.

### 3.4 Documents

Capture pipeline: `DocumentCapture` (select → camera | upload) → `CameraCapture`
(`facingMode: "environment"`, 1920×1080 ideal, canvas re-encode JPEG q=0.95, auto-rotate landscape)
or `FileUpload` (reject >50MB, then `validateFile(file, 10)`, auto-compress above 5MB) →
`compressImage` (max dimension 1920, quality 0.8, always re-encodes to JPEG) →
`DocumentMetadataFormSimple` → held as `pendingDocument` → written by `ActivityForm` /
`IncomeEntryForm` after the parent row exists.

`saveDocument` gates on `navigator.storage.estimate()` requiring ≥50MB free.

**Encryption** (`lib/utils/encryption.ts`): AES-GCM-256 via Web Crypto, fresh 12-byte IV per message,
IV prepended to ciphertext, base64 encoded. Applied to exactly two fields — `dateOfBirth` and
`medicaidId` — in `lib/storage/profile.ts`.

---

## 4. Confirmed defects, ranked

Each item below was verified by reading the code and, where noted, by grep.

### 4.1 Income double counting — highest severity

`getMonthlyIncomeSummary` (`lib/storage/income.ts:142-145`) sums `monthlyEquivalent` across every
entry in a month, but `IncomeEntryForm` is explicitly per-paycheck ("Payday" / "When did you get
paid?"). Four $150 weekly paychecks report `4 × 649.50 = $2,598/month` instead of ~$650.

Only a user who logs exactly one entry per month gets a correct figure. Nothing warns. The export
inherits the same total. **This can tell a user they are compliant when they are not.**

Related: `daily: 30` assumes payment every calendar day. A $100/day, 3-days-a-week worker is credited
$3,000/month. There is no days-worked input.

### 4.2 DocumentViewer resolves income document IDs against activity tables

`IncomeEntryForm` loads documents via `getDocumentsByIncomeEntry` → `db.incomeDocuments`, stores the
id in `viewingDocumentId`, and passes it to `<DocumentViewer documentId={...}>`. But
`DocumentViewer.tsx:27-31` imports `getDocument` / `getDocumentBlob` / `deleteDocument` from
`@/lib/storage/documents` — the **activity** tables.

Since `documents` and `incomeDocuments` are independent `++id` sequences, viewing an income document
either 404s or displays an unrelated activity document. `DocumentViewer.handleDelete` then deletes
that unrelated activity document and its blob. **Data loss.**

### 4.3 Exemption screenings are never persisted

`saveScreening` and `archiveScreening` (`lib/storage/exemptions.ts`) have **zero callers** (verified
by grep). Consequences:

- Settings → "Exemption Screening" permanently shows the "Start Screening" empty state
- Settings → "Screening History" never renders
- JSON export always emits `exemptions: []`

Exemption state actually lives in `assessmentResults.responses.exemption` plus
`recommendation.primaryMethod === "exemption"`.

### 4.4 Export is not fit for agency submission

Verified by grep: `assessmentResults`, `documents`, `documentBlobs`, `incomeDocuments`,
`incomeDocumentBlobs`, `exemptionHistory`, and `seasonalWorkerStatus` are **all absent** from both
export paths.

- JSON reads `db.profiles.toArray()` directly, bypassing `getProfile`, so `dateOfBirth` and
  `medicaidId` ship as AES-GCM ciphertext with no key. Permanently unreadable elsewhere.
- The readable report re-hardcodes `>= 80` and `>= 580` and **omits seasonal averaging entirely**, so
  the UI and the exported report can disagree on compliance.
- Renders only one mode per month, so a month with both hours and income loses half the record.
- No Medicaid ID, DOB, contact info, exemption status, document manifest, lookback framing,
  attestation, or ✓/✗ legend.
- No import path exists anywhere, so the JSON is not a restorable backup despite being labelled
  "Backing up your data".

### 4.5 Encryption is obfuscation, not protection

The construction is correct, but `storeKey` (`encryption.ts:80-92`) writes the **extractable** key
base64-encoded into plain `localStorage` under `hourkeep-encryption-key` — same origin, right beside
the ciphertext in IndexedDB.

- XSS, local malware, filesystem/forensic access, or another user on the same OS account: complete break in two lines of JS.
- Stops only a curious user browsing IndexedDB in DevTools.
- The doc comment claims the key is stored in IndexedDB. It is not. `getStoredKey` wraps a plain
  `localStorage.getItem` inside a pointless Dexie read transaction.
- **Key loss is silently corrupting**: browsers can evict `localStorage` independently of IndexedDB.
  A new key is then generated, old ciphertext becomes undecryptable, and `getProfile` keeps the
  ciphertext with only a `console.error`. `dateOfBirth` feeds age-based exemption screening, so this
  is a correctness failure in a compliance-critical field.
- `updateProfile` unconditionally re-encrypts, so a passthrough ciphertext gets double-encrypted.
- Nothing calls `navigator.storage.persist()`, so all evidence is evictable under storage pressure.

### 4.6 "Export or delete anytime" is an unmet promise

Both `PrivacyNotice.tsx:71` and `settings/PrivacyPolicy.tsx:77` make this claim. Verified by grep:
there is **no** delete-all, no profile deletion, no DB drop, no localStorage clear anywhere in `src`.
Users can delete individual activities, income entries, and documents, and orphaned documents from
`StorageInfo` — but there is no wipe.

### 4.7 Everything is pinned to the current month

`Calendar.tsx:57` owns `currentMonth` in local state and never lifts it. Meanwhile seven call sites
in `tracking/page.tsx` hardcode `format(new Date(), "yyyy-MM")`.

Paging the calendar back re-paints the grid and lets you log or edit hours in a past month, but
`Dashboard`, `ActivityList`, `ComplianceModeSelector`, seasonal status, and `IncomeDashboard` all stay
pinned to today. Per-month `complianceModes` / `seasonalWorkerStatus` rows can therefore only ever be
written for the current month, even though the schema and the export read them per-month.

This directly blocks the lookback periods the statute requires.

### 4.8 `workProgram` is half-implemented

`Activity["type"]` is `"work" | "volunteer" | "education"`. But `workProgram` exists in
`helpText.ts:186` (`activityDefinitions.workProgram`), `ActivityFormHelp.tsx:13,87`,
`HourTrackingHelp.tsx:131-140`, `exemptions/definitions.ts:120`, and both
`activityTypeColors` / `activityTypeLabels` in `ActivityList.tsx:27-40`.

The form offers no such button and `calculateMonthlySummary` has no case for it. **A qualifying
activity category cannot be recorded**; job-training hours must be mis-filed as work or education.

### 4.9 Onboarding saves the assessment twice

`AssessmentFlow.completeAssessment` writes the result (`AssessmentFlow.tsx:355`), then
`onboarding/page.tsx:106` writes it again. Because `saveAssessmentResult` archives-then-inserts,
**every onboarding run manufactures a spurious `assessmentHistory` entry**.

Worse, the surviving row is built from the callback payload. `handleStartTracking` passes
`responses`, not `finalResponses`, so the persisted record **loses `noticeContext`** and the
finalized exemption object.

### 4.10 Multi-month goals can never complete

`monthlyCompliance` is populated with a single current-month entry
(`tracking/page.tsx:161-167`, comment: *"For now, just check current month"*), while
`CompletionMessage` early-returns unless `monthsCompleted >= monthsRequired`. For
`monthsRequired > 1` the completion path is unreachable.

### 4.11 Exemptions never affect compliance calculations

Neither `calculateMonthlySummary` nor `getMonthlyIncomeSummary` consults exemption screening or
assessment results. `ComplianceModeSelector` renders for exempt users with only a code comment
acknowledging they do not need to track.

### 4.12 Hours and income treated as mutually exclusive

The app forces a per-month mode choice. The statute says 80 hours **or** the income threshold. A user
at 40 hours and $300 fails in both modes, and the app never evaluates both to pick whichever
qualifies. This is stricter than the law.

### 4.13 Date handling defects

- `IncomeEntryForm` compares `new Date("YYYY-MM-DD")` (UTC midnight) against local `new Date()`,
  an off-by-one near timezone boundaries. The rest of the codebase uses the `+ "T00:00:00"` idiom.
- `oneMonthFuture.setMonth(today.getMonth() + 1)` overflows (Jan 31 → Mar 3).
- `ProfileEditor` / `ProfileDisplay` parse DOB without the `T00:00:00` guard, so the displayed day can
  shift west of UTC. The export page guards correctly; the profile paths do not.
- Activities have **no future-date guard** at all.
- No cumulative daily cap: three 10-hour entries on one date pass validation and the calendar reads `30h`.

### 4.14 Other correctness and UX issues

- **Income deletion has no confirmation and no cascade.** `deleteIncomeEntry` is a bare
  `db.incomeEntries.delete(id)`, orphaning `incomeDocuments` and their blobs.
  `cleanupOrphanedDocuments` only covers activity documents, and only by `activityId` — it never
  scans for blobs with no metadata row.
- **Document writes are not transactional.** `saveDocument` and `saveIncomeDocument` add the blob,
  then the metadata. A failure between the two orphans the blob permanently and uncollectably.
- **`captureMethod` is hardcoded `"camera"`** at `ActivityForm.tsx:229,288,902` and
  `IncomeEntryForm.tsx:275,760`. Uploaded files are recorded and displayed as camera captures.
- **Seasonal average always divides by 6**, including months with no data, so a first-month user sees
  a 6× understatement with no "insufficient history" state. `SeasonalWorkerView` lists empty months
  as `$0.00` as though verified.
- **Duplicating an income entry copies `monthlyEquivalent`**, so duplicating a `$580/monthly` entry
  to three dates reports $2,320.
- **`IncomeEntryList` receives 6 months of entries** while `IncomeStatusIndicator` counts only the
  current month — the list shows months the summary does not count.
- **`0` conflates "not sure" with a real zero** across all `NumberInputQuestion` steps. In the
  seasonal step a 6-month total of $1–$2 rounds to `Math.round(2/6) === 0`, flipping the not-sure
  checkbox on and disabling the field.
- **Unchecking an activity does not clear its hours**, and `calculateTotalHours` sums whatever is
  present. Backing up and unchecking "Volunteer" keeps volunteer hours in the total.
- **Back navigation loses answers** on the notice steps: each holds its radio value in local
  `useState("")` with no `value` prop, so remounting resets it.
- **`monthsRequired` "I'm not sure" silently maps to 1** (`NoticeDetailsQuestion.tsx:44`) — a policy
  assumption buried in a UI handler with no record of the uncertainty.
- **Age gate is 16** in `ProfileForm` and the unused Zod schema, which does not match the statute's
  19–64 applicable-individual range.
- **A Dexie write per keystroke**: the assessment auto-save effect depends on `responses` object
  identity, so typing "1900" issues four `assessmentProgress` upserts. No debounce.
- **Silent failure paths**: `completeAssessment`'s catch only `console.error`s, and `advanceStep` is
  inside the `try`, so a Dexie failure parks the user on the last question with no error surfaced.
  Onboarding save errors and settings load errors behave the same way.
- **"Back to Assessment" destroys history**: `results/page.tsx:444-451` calls
  `db.assessmentResults.delete(result.id)` directly instead of `archiveAssessmentResult`. The
  adjacent "Start Fresh" button navigates to the same route **without** deleting — the two labels
  describe the opposite of what they do.
- **`useActivityDocumentCounts`** lists both `activityIds` (new array identity each render) and
  `activityIdsKey` in its dep array, so the Dexie query re-runs on every parent render.
- **Calendar is mouse/touch only**: `DayCell`s are `Box`es with `onClick` and no `role="button"`,
  `tabIndex`, keyboard handler, or `aria-label`.
- **`StorageInfo` never queries `incomeDocumentBlobs`**, so income document images are invisible in
  the storage breakdown, and non-document data is estimated as `activityCount * 200` bytes.
- **Four `console.log` calls** ship in `DocumentMetadataFormSimple.tsx`.
- **Plausible loads before consent** — injected unconditionally in `layout.tsx`, so it fires on
  `/onboarding` before the user accepts the privacy notice.
- **`/test-compression` is publicly reachable** in production and precached by the service worker.
- **`APP_CONFIG.version` falls back to `"4.2.0"`** when `NEXT_PUBLIC_APP_VERSION` is unset.
- **`OfflineIndicator`** paints `warning.main` (#D97D54) with white text, roughly 2.9:1 — likely
  fails WCAG AA 4.5:1.

---

## 5. Dead code

All verified as zero-importer by precise import grep.

| Item | Lines | Note |
|---|---|---|
| `components/tracking/GoalProgress.tsx` | 215 | `handleAddMonth` exists only to feed it; `handleContinueTracking` is empty |
| `components/income/IncomeHelp.tsx` | 356 | Exports `IncomeHelp` + `CompactIncomeHelp` |
| `components/documents/DocumentMetadataForm.tsx` | 392 | Superseded by `...FormSimple`. Only place that re-checks size **after** compression |
| `components/exemptions/ExemptionBadge.tsx` | 308 | Head of a dead chain ↓ |
| `components/exemptions/ExemptionDetailsDialog.tsx` | 56 | Imported only by `ExemptionBadge` |
| `components/exemptions/ExemptionResults.tsx` | 195 | Imported only by `ExemptionDetailsDialog` |
| `components/exemptions/QuestionFlow.tsx` | 265 | Head of a dead chain ↓ |
| `lib/exemptions/questionFlow.ts` | 324 | Imported only by `QuestionFlow`. Ironically implements the skip-answered logic the live flow lacks |
| `components/exemptions/DefinitionTooltip.tsx` | 144 | Both `DefinitionTooltip` and `InlineDefinition` |
| `components/assessment/AssessmentHistory.tsx` | ~180 | Nothing renders it; `getAssessmentHistory` has no caller |
| `lib/validation/documents.ts` | ~70 | Entire Zod module unused; document metadata is never validated at the storage boundary |

Plus unused exports: `profileSchema` (`lib/validation/profile.ts`), `saveScreening`,
`archiveScreening`, `deleteAssessmentProgress`, `getQuestionById`, `getDefinition`,
`getDefinitionsByCategory` (a stub returning all definitions), `searchDefinitions`,
`resetDashboardGuidance`, `isDashboardGuidanceDismissed`, `CompactDefinitionsAccordion`,
`CompactHelpSection`, `InlineEdgeCaseExample`, `ActivityFormHelpWithEdgeCases`,
`useCamera.requestCameraPermission`, `cameraUtils.getPreferredCameraFacingMode`,
`cameraUtils.isMobileDevice`.

Unused type surface: `AssessmentResponses.skipToWorkQuestions`, `.paymentFrequency`, the whole
`PayFrequency` type, `Recommendation.complianceStatus: "unknown"`, `AssessmentProgress.isComplete`
(never set true — `completeAssessmentProgress` deletes instead), `AssessmentResult.version`,
`ExemptionScreening.version`, `ExemptionResponses.age`, `.medicallyFrailDetails`,
`ExemptionQuestion.options` / `QuestionOption` / `"multipleChoice"` (UI supports it, no question uses it),
`ExemptionQuestion.required`, `CompressionOptions.maxSizeMB` (**passed by all four call sites, never read**),
`ProfileForm.onSkip` / `.showDeadlineField` / `.initialDeadline`,
`GettingStartedContextual.monthsRequired`, `ComplianceModeSelector.currentMonth`,
and every `action` in `dashboardGuidance` (all `null`, making the click-to-navigate branch unreachable).

Estimated removable: **~2,500 lines**.

---

## 6. Structural duplication

| Duplicated thing | Copies | Locations |
|---|---|---|
| 12-way exemption question-ID switch | **5–7** | `AssessmentFlow` ×3 (`handleExemptionAnswer`, `handleExemptionContinue`, `getExemptionValue`), `questionFlow.ts` ×2, `QuestionFlow.tsx` ×2. None exhaustiveness-checked; all have silent `default` |
| `80` / `580` thresholds | 4+ each | `recommendationEngine.ts`, `calculations.ts`, `Dashboard.tsx`, `export/page.tsx`, `GettingStartedContextual.tsx` — while `REQUIRED_HOURS` and `INCOME_THRESHOLD` sit unused in `payPeriodConversion.ts` |
| Compliance-mode switch | 3 | `how-to-hourkeep/page.tsx`, `onboarding/page.tsx`, `results/page.tsx` |
| `calculateTotalHours` | 3 | `recommendationEngine.ts`, `results/page.tsx` ×2, `GettingStartedContextual.tsx` |
| `getCategoryLabel` | 5 variants, inconsistent copy | `ExemptionResults`, `settings/page.tsx`, `ExemptionBadge`, `ExemptionHistory` (terse), `QuestionFlow` / `questionFlow.ts` |
| 51-entry US states list | 3 | `ProfileForm`, `ProfileEditor`, `ProfileDisplay` (as code→name) |
| `calculateAge` | 2 byte-identical | `calculator.ts`, `QuestionFlow.tsx` |
| `formatFileSize` | 3 | `imageCompression.ts`, `validation/documents.ts` (dead), `StorageInfo.tsx` (inline) |
| Privacy policy copy | 2 verbatim | `PrivacyNotice.tsx`, `settings/PrivacyPolicy.tsx` |
| Profile validators | 2 near-identical | `ProfileForm`, `ProfileEditor` |
| Pay-period multipliers | 2 | `payPeriodConversion.ts`, `IncomeEntryForm.tsx:493-503` as caption literals |
| Alternative-methods UI | 2 divergent | `results/page.tsx` (4 methods, exempt-aware), `GettingStartedContextual.tsx` (3 methods, hidden when exempt) |
| Month grouping + `formatMonthHeader` | 2 | `ActivityList.tsx`, `IncomeEntryList.tsx` |
| Nav-button footer | 5+ | `NumberInputQuestion`, `SingleChoiceQuestion`, `MultipleChoiceQuestion`, all three `NoticeQuestion` exports — despite `QuestionWrapper.tsx` existing for exactly this and being used by one component |

Type-name collisions force aliasing: `ExemptionQuestion` is both an interface (`questions.ts`) and a
component, declared **twice** with different shapes (`category: ExemptionCategory` vs
`category: string`). `ExemptionHistory` is both a type and a component.

---

## 7. Testing and tooling state

- **No test runner.** `package.json` scripts are `dev`, `build`, `start`, `lint`, `format`,
  `format:check`. No `test` script, no jest/vitest/testing-library dependency, no config file
  anywhere in the repo.
- `@types/jest` is in devDependencies, which is the only reason
  `src/lib/utils/__tests__/imageCompression.test.ts` (12 Jest-syntax cases) typechecks. **It cannot execute.**
- `src/lib/utils/TESTING.md` presents manual browser testing via `/test-compression` as the strategy.
- Zero coverage for `calculations.ts`, `payPeriodConversion.ts`, `storage/income.ts`,
  `exemptions/calculator.ts`, or `recommendationEngine.ts` — every piece of compliance-critical math.

### Dependency currency (as of 2026-08-16)

| Package | Current | Latest | Gap |
|---|---|---|---|
| `@mui/material`, `@mui/icons-material` | 7.3.4 | 9.3.1 | **1 major** — there is no v8. Corrected; see § 10 |
| `next` | 16.0.1 | 16.3.1 | 3 minors |
| `eslint-config-next` | 16.0.1 | 16.3.1 | 3 minors |
| `eslint` | 9.39.0 | 10.8.1 | 1 major |
| `@types/node` | 20.19.24 | 26.2.0 | 6 majors |
| `react` / `react-dom` | 19.2.0 | 19.2.8 | patches |
| `dexie` | 4.2.1 | 4.4.5 | minors |
| `date-fns` | 4.1.0 | 4.4.0 | minors |
| `prettier` | 3.6.2 | 3.9.6 | minors |
| `@tailwindcss/postcss`, `tailwindcss` | 4.1.16 | 4.3.3 | minors |

Note: `tailwindcss` + `@tailwindcss/postcss` are installed and `postcss.config.mjs` exists, but the
app is styled entirely with MUI `sx`. Worth confirming whether Tailwind is actually used at all.

---

## 8. Spec and doc state

`.kiro/specs/` holds 13 specs. Task completion by checkbox count:

| Spec | Done | Open |
|---|---|---|
| `workpath-medicaid-mvp` | 39 | 0 |
| `find-your-path` | 20 | 0 |
| `assessment-flow-alignment` | 14 | 0 |
| `activity-definitions-help` | 49 | 1 |
| `workpath-document-management` | 43 | 4 |
| `income-tracking` | 21 | 4 |
| `analytics-integration` | 19 | 4 |
| `workpath-exemption-screening` | 31 | 9 |
| `hourkeep-rebrand` | 12 | 11 |
| `onboarding-redesign` | 10 | 9 |
| `exemption-terminology-realignment` | 21 | 16 |
| `workpath-enhanced-onboarding` | 28 | 19 |
| `exemption-documentation` | 0 | 12 |

`.kiro/steering/` has two active files (`getting-started.md`, `medicaid-domain-knowledge.md`); five
more are archived under `archive-steering/`.

Stale in-code docs: `src/lib/exemptions/DEFINITIONS_SUMMARY.md`,
`src/components/exemptions/ACCORDION_UPDATE.md`, and `DEFINITIONS_README.md` all instruct readers to
test at `/exemptions`, which is now a redirect stub. `DEFINITIONS_SUMMARY.md` also quotes
pre-realignment question text. `DEFINITIONS_README.md` points at the superseded
`.kiro/specs/workpath-exemption-screening/`.

`CHANGELOG.md` dates 7.2.0 as "2025-01-14" while 7.1.0 and 7.0.0 are both "2025-11-18" — the 7.2.0
entry corresponds to the 2026-01-14 commit, so the year is a typo.

---

## 9. Design system

`src/theme/theme.ts`, 110 lines. Palette: primary `#6B4E71` muted purple, secondary `#D4A574` tan,
success `#5C8D5A`, warning `#D97D54`, error `#C85A54`, background `#FAF9F7`, text `#2D2D2D` / `#6B6B6B`.
Inter → Roboto. `shape.borderRadius: 16`, pill chips, `textTransform: "none"` buttons,
`MuiLinearProgress` height 12. Breakpoints explicitly override `md` to 960 (MUI default is 900).

Only `primary` declares `contrastText`. No dark mode, no `responsiveFontSizes`, no
`prefers-reduced-motion` handling, no `focus-visible` customization. Touch targets are applied ad hoc
per component (`sx={{ minHeight: 44 }}` / `48`) rather than centrally — and the export page's two
primary buttons omit them.

Good patterns worth preserving: `HelpTooltip` swaps to a bottom-sheet `Dialog` below `sm` and requires
an `ariaLabel`; `DashboardGuidance` labels all icon buttons; mobile-first `px`/`py` responsive objects
are used consistently.

---

## 10. Validation corrections (2026-08-16)

An independent review verified 23 claims from this document against the source. **20 confirmed, 2 confirmed
with corrections, 1 partially wrong.** Full record: `validation-findings-2026-08.md`.

### Corrections to this document

| § | Claim | Correction |
|---|---|---|
| §7 | `@mui/material` gap "**2 majors**" | **1 major.** There is no MUI v8 — they went 7 → 9 to realign with MUI X |
| §4.7 | "seven places" hardcode `format(new Date(), "yyyy-MM")` | **Six**: lines 71, 150, 378, 391, 557, 638. Two components (`ComplianceModeSelector`, `IncomeDashboard`) **do** receive a month prop — they're handed hardcoded literals. `IncomeDashboard` already threads it into its queries, so it needs only its caller changed |
| §4.9 | Onboarding double-save | **Onboarding only.** `how-to-hourkeep/page.tsx` has no second `saveAssessmentResult` call. And the surviving row is the *degraded* one — the archive-then-insert order archives the good record and keeps the one missing `noticeContext` |
| §4.4 | Export omits 7 tables | **9 of 14.** Also missing: `assessmentHistory`, `assessmentProgress` |
| §6 | questionId switch appears "5–7 times" | **Exactly 7**, each enumerating all 12 IDs. Four are in dead files, so deletion drops it to 3 |
| §5 | ~2,500 lines removable | **2,527 confirmed** (2,388 in 11 files + 139 in 5 dead exports). **2,709** including `/test-compression` |
| §4.2 | DocumentViewer cross-table | **Worse than described.** Both tables are independent `++id` sequences starting at 1, so it doesn't 404 — it resolves to a *real, unrelated* document. And `IncomeEntryForm`'s `onDelete` optimistically removes the income document from local state, so the user sees "deleted," the income document survives, and an activity document is gone |
| §4.14 | Income deletion orphans documents | Orphans **blobs** too — an unbounded quota leak on a device where `saveIncomeDocument` already refuses below 50MB free |

### Findings this audit missed

1. **`/test-compression` is an App Router entry point**, 182 lines, no `NODE_ENV` guard, statically emitted,
   publicly reachable, and precached by the service worker.
2. **Zod validation never runs on profile input.** `profileSchema` being dead means a 56-line declarative
   contract for the app's most sensitive inputs (DOB, Medicaid ID) is never enforced. This is a **missing
   validation boundary**, not merely an unused export.
3. **`getMonthlyIncomeSummary` is an N+1** — six sequential IndexedDB queries per summary on the seasonal
   path, called on every mount and after every save.
4. **The encryption failure mode is concrete.** `localStorage` and IndexedDB have **different eviction
   semantics in every major browser** — Safari ITP evicts `localStorage` after 7 days of inactivity while
   IndexedDB persists longer, and several "clear site data" paths hit one but not the other. When they
   diverge, `getProfile` silently returns ciphertext as a date of birth.
5. **No income-side equivalent of `useActivityDocumentCounts`** — `IncomeDashboard` reimplements it inline.
   Same copy-and-drift pattern that produced the DocumentViewer bug.
6. **The app writes compliance verdicts** — `✓ COMPLIANT` / `✗ NOT COMPLIANT` into the report a user hands a
   caseworker, plus `isCompliant` on both summary types. Combined with the seasonal omission and the 4.33×
   inflation, a user could read `NOT COMPLIANT` for a month where they actually satisfy the household-income
   pathway, and not respond to a notice they could have answered.

### Note on defect numbering

This document's § 4 defects are numbered `4.N`, which **collides with gap-analysis § 4 row IDs**. `audit 4.2`
is the DocumentViewer bug; `gap 4.2` is the missing `workProgram` type. Always write **`audit §4.N`** with the
section symbol, or renumber these to `D1`–`D14`.
