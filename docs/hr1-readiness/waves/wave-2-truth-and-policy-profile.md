# Wave 2 — Truth in Copy and the Policy Profile

**Depends on:** **W2a** needs only the **W0-slice** (a test runner — see `README.md`). **W2b** needs W0 in
full (characterization tests prove the threshold refactor changes nothing) and W5.
**Superseded header:** this file originally declared "Depends on: W0, W1." W1 is now sequenced **last**, so
neither half depends on it. Write against MUI 7 and migrate in W1.
**Blocks:** W3, W5 — both read policy values from the profile
**Decision records:** ADR-0001, ADR-0003
**User-visible outcome:** the app stops telling users things that are false. Highest harm-reduction per
hour in the whole plan.

## Why now

Two things travel together here.

The **factual corrections** are mostly content edits with no data-model dependency, and they close the
highest-impact gaps in the analysis. Gap 5.2 alone — HourKeep telling users that unemployment,
investment, rental income, and SSDI don't count toward the income threshold — is materially misleading and
fixable in an afternoon.

The **policy profile** has to land before W3 and W5, and it is the natural home for the threshold values
those corrections touch. Doing both at once means editing each file's policy references exactly once.

## Scope

### 2.1 Policy profile module (ADR-0001)

Create `src/lib/policy/` with the `PolicyProfile` interface and the `FEDERAL_DEFAULT` profile. Schema and
values are specified in `../../domain/cms-2454-ifc/state-options.md` — implement it as written, including
mandatory `source` and the `confidence` discriminator.

Then remove every policy literal:

| File | Literals to replace |
|---|---|
| `lib/calculations.ts` | `80` ×2 |
| `lib/assessment/recommendationEngine.ts` | `580` ×3, `80` ×2 |
| `components/Dashboard.tsx` | `80` |
| `app/export/page.tsx` | `80`, `580` |
| `components/onboarding/GettingStartedContextual.tsx` | `580`, `80` |
| `app/how-to-hourkeep/results/page.tsx` | `580` ×2, `80` ×2 |
| `components/income/IncomeEntryForm.tsx` | multiplier captions `4.33`, `2.17` |

`incomeThreshold` is derived, never stored.

> **The guardrail test needs narrowing, corrected on validation.** A naive grep for `80` matches
> `width: 80`, `maxWidth: 480`, `1980`, and the documented `1920×1080` camera constraint — noise on day one,
> disabled by day three. Make it a **lint rule scoped to the five domain modules with an explicit
> allowlist**, not a repo-wide string search.
>
> **And `4.33` must not be banned.** It is the **Carnegie Unit** constant in § 435.552(d)'s
> `creditHours × 3 × 4.33`, which W6a has to implement. That is *statutory arithmetic*, not a State
> election, so it does not belong in the policy profile. Ban the **policy** values — `80`, `580`, `7.25`,
> and the pay-period multipliers `30` / `4.33` / `2.17` **as multipliers** — and keep the Carnegie constant
> in the education module with a citation comment. The original list was also inconsistent: it banned
> `4.33` but not `2.17`, `30`, or `1`.

The characterization tests from W0 must pass **unchanged**. That is the proof this refactor is behavior-neutral.

### 2.2 Correct the income content — the single most harmful error

`src/content/helpText.ts` → `incomeDefinitions.threshold` currently lists as **not counting**: SSI, SSDI,
unemployment benefits, child support, gifts, investment income, and rental income. Under § 435.552(f)(2),
income is **MAGI-based household income** per § 435.603(e), which includes countable **unearned** income.

Corrected content:

- **Generally counts:** wages, self-employment, tips, gig work, **unemployment compensation**, **taxable
  interest and dividends**, **rental income**, and **Social Security benefits including the non-taxable
  portion** (so SSDI).
- **Does not count:** SSI, child support.
- **It's your household, not just you.** Following tax filing relationships — a spouse's income counts, and
  someone claimed as a tax dependent has the claiming taxpayer's household income counted.
- **More household income helps this pathway.** It is a floor, not a ceiling. Copy must not imply a
  spouse's earnings are disqualifying.
- **Your state calculates this.** HourKeep organizes pay stubs; it does not compute the figure.

> **Corrected on the W2a dry run: fix `whatDoesNotCount` entry by entry. Do not delete it.**
>
> This section previously said "delete `whatDoesNotCount` in its current form rather than editing around it."
> That contradicts `.kiro/steering/compliance-copy-standards.md`, which names this exact field as its live
> example of why deletion is the wrong move. **The steering doc wins.** Of the seven current entries, **two
> are correct** — SSI (Title XVI, not a Title II Social Security benefit) and child support — and deleting
> the field destroys them. One, gifts and loans, is defensible but needs hedging.
>
> The field keeps its name and structure. Its `description` changes from "unearned income does not count,"
> which is the actual error, and four entries move to `whatCounts`. This is also DoD item 7: the negative
> criterion needs a positive twin.
>
> **Authority for the household claims is `docs/domain/supporting-regs/README.md` § 1, not
> `rule-extract.md`.** The extract carried CMS's preamble gloss ("the total income of everyone in the
> household"), which overstates income; it is corrected and marked as of 2026-08-16.

### 2.3 Correct the activity content

- **Work is not just paid employment** (§ 435.552(b)). It includes in-kind work — compensation as housing,
  meals, or utilities — and **unpaid work** other than community service: unpaid internships, unpaid job
  trial periods. Remove "Unpaid internships" from `counterExamples`; it is listed as not counting and it
  does.
- **Fix the per-activity 80-hour framing.** `activityDefinitions.work`, `.volunteer`, and `.workProgram`
  each say "at least 80 hours per month," implying each activity must independently reach 80. The 80 hours
  is the **monthly total across activities** (§ 435.552(a)(5)).
- **Community service:** court-ordered counts; the organization may be any public or nonprofit, not only
  a § 501(c)(3); embedded skill-building counts.
- **Work program:** keep "job searching doesn't count" but add the nuance — it may be a **subsidiary**
  activity within a qualifying program if under half the required hours, and unemployment-insurance job
  search can count if conducted consistently with work program requirements.

### 2.3b Say the reassuring true things — gaps 15.7, 15.8, 15.20

> **Added on the W2a dry run.** `waves/README.md` assigned rows **15.7, 15.8, and 15.20** to W2a, and listed
> "ex parte explained" and "§ 435.559(c) reassurance" among what it ships — but no wave file contained any
> scope for them. All three are rated **harmful**. Three orphaned rows, now homed.

Three facts that are true, reassuring, currently absent, and cost only copy. New content, not corrections.

- **You are probably not being assessed in January (§ 435.559(c)).** Beneficiaries enrolled as of the State's
  implementation date are not assessed until their **first renewal initiated on or after** it. "Initiated"
  means when the State's ex parte review begins. For most current enrollees the first review period does not
  start in January 2027. Currently nothing tells them this, so the app implies a deadline that isn't theirs.

- **Your state has to check its own records first (§ 435.557(b)).** Before asking anything of the individual,
  the State must exhaust reliable information it already holds or can obtain — payroll data, adjudicated
  claims from the preceding 12 months, encounter data, SNAP and TANF enrollment, incarceration data, and
  education data (§ 435.557(a) defines the set; (b) imposes the obligation — **cite the pair**, the June 29
  correction shifted designations inside this section). CMS estimates a majority are verified this way. This
  reframes the whole app: HourKeep is the backstop for what payroll data misses, not a mandatory chore.

- **Be careful what you volunteer (15.20).** A self-reported "no, I'm not meeting it" can be **accepted at
  face value and support a denial**. So the app must never nudge a casual negative self-report. Anywhere a
  user could assert noncompliance, say what the answer is used for first, and route them to the exception,
  hardship, and ex parte paths *before* the question, not after.

Where this lands: `dashboardGuidance` and the onboarding introduction for the first two; a review of every
question that lets a user assert a negative for the third.

### 2.4 Terminology (R8.7)

Adopt CMS terminology in the domain model: **community engagement requirement**, and PL 119-21 /
"Working Families Tax Cut legislation" rather than "HR1". User-facing copy may keep "work requirements"
where it genuinely aids comprehension, per the steering doc.

Add the missing scope facts: **44 jurisdictions (43 States + DC), including Georgia, Tennessee, and
Wisconsin**, plus § 1115 populations in Hawaii, Massachusetts, New York, Oregon, and Utah; the
**territories are out of
scope**; **January 1, 2028** documentation hardening; **December 31, 2028** good-faith-effort ceiling.

### 2.5 Stop asserting determinations (ADR-0003)

The full repositioning is W7, but the outright verdicts go now, because they are false today:

Line numbers verified 2026-08-16.

| Location | Now | Becomes |
|---|---|---|
| `AssessmentBadge.tsx:154` | `You&apos;re Exempt` | "You may not need to track" |
| `export/page.tsx:149`, `:179` | "✓ COMPLIANT" / "✗ NOT COMPLIANT" — **both branches** | "Logged: 46 hours · Threshold: 80 hours · Difference: 34" |
| `settings/page.tsx:205–206` | "Exempt" / "Must Track Hours" | "Based on your answers: you may be excluded" |
| `results/page.tsx:349` | `label="Easiest for you"` | "May be simplest for you" |
| `helpText.ts` ×3 | "you automatically meet work requirements" | "This may be enough on its own. Your state decides." |
| `definitions.ts` ×15 | "…you're exempt from work requirements" | Hedge **plus a next action**, per the copy standard |
| `questions.ts` | 4 × "exempt from work requirements", 6 × "you're exempt" | Same |
| `AssessmentHistory.tsx:48`, `:57` | "Exempt" chip; "You were exempt from work requirements" | Past-tense verdicts count too |
| `IntroductionScreen.tsx:99` | verdict framing | Hedge plus next action |
| `ProfileForm.tsx:198` | "Good news! You may be exempt… due to your age" | **Also substantively wrong** — 65+ are *outside* § 435.551's adult group, not excluded within it. Different sentence, not a hedge |

> **The originally specified guard regex does not work.** It was
> `/\b(you are|you're) (exempt|compliant)\b/i`, and against the code above it matches **almost nothing**:
> `You&apos;re Exempt` is an HTML entity in source, `"You were exempt"` is past tense, `"Exempt"` chips have
> no pronoun, `✓ COMPLIANT` has no pronoun, and `automatically meet work requirements` shares no words with
> the pattern.
>
> **Write it as a token list instead**, run against rendered output with HTML entities normalised first:
> `exempt`, `compliant`, `automatically meet`, `you qualify`, `you meet`, `not compliant`, `on track`. Assert
> the *rendered* text of each surface in the table above. Where a token is legitimately needed — explaining
> what "exempt" means as a term — allow it only inside a definition context, and say so in the test name.

### 2.6 Fix the misleading mode dialog

`ComplianceModeSelector` makes the false exclusivity claim **twice**, not once — verified 2026-08-16:

- **line 123:** "Your hours data will be preserved, but only your income will…" (switching to income mode)
- **line 132:** "Your income data will be preserved, but only your hours will…" (switching to hours mode)

Neither is true of the law — § 435.552(e) **requires** combination, and § 435.552(e)(2) adds the
income-to-hours proxy on top. Both branches change. The selector is removed entirely in W7b; until then it
must not state something false.

## Out of scope

No data-model changes — that is W3. No new questions — W4. No month scoping — W5. The mode fork itself
survives until W7; this wave only stops it from lying about what it does.

## Acceptance criteria

> **Rewritten on the W2a dry run.** The originals were largely **negative-only**, which DoD item 7 forbids:
> "no content states that unemployment fails to count" is satisfied by deleting the section, destroying the
> two entries that are correct. Each criterion below pairs a negative with a positive twin and names an
> observable. Split by half.

**W2a — truth in copy · SUPERSEDED. The 13 criteria that were here are closed out in
[`wave-2a-truth-in-copy.md`](wave-2a-truth-in-copy.md), which carries 46 and reports 44 met.**

They are removed rather than ticked, because leaving them would leave two traps:

1. **One of them was wrong.** It required `whatDoesNotCount` to contain "exactly **2** entries (SSI, child
   support) **plus** a hedged gifts/loans entry" — two or three? A test asserting `length === 2` fails the
   moment the gifts entry exists. The arithmetic settles it at **3**, and the split file states that.
2. **Several undercounted the work.** "Every surface in the § 2.5 table" was 11 sites; the real figure was
   **78 lines across 14 live files**, and the table both named a dead file and omitted a live one.

W2a is **complete as of 2026-08-17** (`de36a3d`). Two criteria are recorded unmet there: the review
protocol ran with two of four reviewers, and the phone-viewport smoke test still needs a person.

**W2b — policy profile**

- [ ] `src/lib/policy/` exists with `FEDERAL_DEFAULT`, a mandatory `source` citation, and the `confidence`
      discriminator
- [ ] The scoped policy-literal check (`scripts/compliance-gate.sh`) reports **zero** hits across the five
      compliance-critical modules
- [ ] W0 characterization tests pass **unchanged** — the proof the refactor is behavior-neutral
- [ ] The Carnegie constant `4.33` remains in the education module with its § 435.552(d) citation and is
      **not** moved into the profile

## Risks

| Risk | Mitigation |
|---|---|
| Corrected income guidance reads as "your spouse's income disqualifies you" | Two-sided copy: it is a floor for this pathway, and separately there is a ceiling for eligibility. Review this wording specifically |
| Threshold refactor silently changes a value | W0 characterization tests must pass unchanged; that is the gate |
| Hedged copy becomes vague and unhelpful | Pair every hedge with a concrete next action — what to gather, who to ask |
| Users mid-flow see changed guidance | Copy changes are non-destructive, so this is low risk regardless of user count. Note that user count is **structurally unverifiable** — see ADR-0002 |
