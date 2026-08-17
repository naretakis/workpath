# Wave 2a — Truth in Copy

**Split from:** [`wave-2-truth-and-policy-profile.md`](wave-2-truth-and-policy-profile.md). W2a owns
**§§ 2.2–2.6 including the new 2.3b**. It does **not** own § 2.1 — the policy profile is W2b.
**Depends on:** the **W0-slice** only (landed 2026-08-17, commit `5b4b27f`). Copy edits preserve no
arithmetic, but this wave ships the no-verdict guard test, which ADR-0007 promotes to Tier 1 and assigns
here by name, and it touches two Tier-1 TDD modules.
**Blocks:** nothing. W2b, W5, and W3 are independent of it.
**Decision records:** ADR-0003 (load-bearing), ADR-0007.
**Gaps closed:** 5.2, 11.1–11.5, 15.7, 15.8, 15.20; part of 4.1, 4.9, 4.10; part of 5.1 and 5.3
(household framing only).
**User-visible outcome:** the app stops telling users things that are false. Highest harm reduction per
hour in the plan.

---

## Why this wave is first

Gap 5.2 alone: HourKeep tells users that unemployment compensation, investment income, rental income, and
SSDI do not count toward the income threshold. Under § 435.552(f)(2) income is **MAGI-based household
income** per § 435.603(e), and all four generally *do* count. A married user whose spouse works may
already satisfy the income pathway with zero hours. HourKeep currently tells that person they are failing
and sends them looking for 80 hours of volunteering they do not need.

Nothing else in the plan is both this harmful and this cheap to fix.

---

## Provenance of this file

The combined wave-2 file was written before the **W2a dry run** (2026-08-16,
[`validation-findings-2026-08.md`](../../audit/validation-findings-2026-08.md) § I) and revised by it.
It was then re-verified against the codebase on **2026-08-17**, at the start of execution, which found
**nine further problems**. Every one is folded in below and marked **`[F1]`–`[F9]`**. Three corrections
from review are marked **`[C1]`–`[C3]`**.

Every line number and count in this file was computed on 2026-08-17 against commit `5b4b27f`. The § 2.5
table's eleven original line numbers were independently re-checked and **all eleven were accurate**; the
problems were in what the table *omitted*.

---

## Scope

### 2.2 Correct the income content — the single most harmful error

`src/content/helpText.ts` → `incomeDefinitions.threshold`. Fix `definition`, `whatCounts`,
`whatDoesNotCount`, `note`, and `edgeCases`.

**Authority.** § 435.552(f)(2) requires MAGI-based income (§ 435.603(e)) for the MAGI-based household
(§ 435.603(d) and (f)).

> **Cite the regulation, not a summary of it.** Household-income claims cite
> [`docs/domain/supporting-regs/42cfr-supporting-sections.txt`](../../domain/supporting-regs/42cfr-supporting-sections.txt)
> — the **raw eCFR text** — in preference to `supporting-regs/README.md`, and never
> `rule-extract.md`, which carried CMS's preamble gloss "the total income of everyone in the household"
> until dry-run finding I1 removed it. **`[C3]`**
>
> This is the third income error this week in the same direction: **§ A5** (the total-income gloss),
> **§ I1** (the same gloss surviving in the extract), and **`[C3]`** below. All three overstated
> restriction or overstated income — against the user. Treat any income claim as suspect until checked
> against the raw text.

**`whatCounts` gains four items**, each generally in AGI or added back to it by
26 U.S.C. § 36B(d)(2)(B):

| Item | Why it counts |
|---|---|
| Unemployment compensation | In gross income, IRC § 85 → in AGI |
| Interest and dividends — **including tax-exempt interest** | Taxable interest and dividends are in AGI; § 36B(d)(2)(B) adds **tax-exempt interest** back on top |
| Rental income | In AGI, whether or not it is a business |
| Social Security benefits, **including the non-taxable portion** — so SSDI | § 36B(d)(2)(B) adds back the portion of Social Security benefits not included in gross income |

> **`[C3]` "Taxable interest and dividends" understates the rule.** 26 U.S.C. § 36B(d)(2)(B) defines MAGI
> as adjusted gross income **increased by** excluded foreign earned income, **tax-exempt interest**, and
> the portion of Social Security benefits not included in gross income. Tax-exempt interest counts.
> Writing only "taxable" is wrong in the user-unfavorable direction — it tells someone their income is
> lower than the State will find it, which can send them looking for hours they do not need.

**`whatDoesNotCount` is fixed entry by entry. It is not deleted.** `compliance-copy-standards.md` names
this exact field as its example of why deletion is the wrong move, and deletion destroys the entries that
are correct. Dry-run finding I4 resolved the contradiction in the steering doc's favour.

Seven current entries → **three**:

| Current entry | Disposition |
|---|---|
| SSI (Supplemental Security Income) | **Keep.** Title XVI, not a Title II Social Security benefit, not in gross income |
| Child support payments | **Keep.** Not in gross income |
| Gifts or loans from family/friends | **Keep, rewritten and hedged.** See below |
| SSDI (Social Security Disability Insurance) | **Move to `whatCounts`** |
| Unemployment benefits | **Move to `whatCounts`** |
| Investment income or interest | **Move to `whatCounts`**, including tax-exempt interest |
| Rental income (unless it's your business) | **Move to `whatCounts`**; drop the "unless" |

And the field's `description` — currently "Unearned income does not count toward the $580 threshold" —
changes, because that sentence is the actual error.

> **`[F8]` The original criterion was self-contradictory as a test.** It read "contains exactly **2**
> entries (SSI, child support) plus a hedged gifts/loans entry" — two or three? A test asserting
> `length === 2` fails the moment the gifts entry is present. The arithmetic settles it: 7 current − 4
> moved = **exactly 3**. Restated that way in the criteria.

> **`[C2]` The gifts entry is Conditional, and the election is narrower than "gifts."**
> § 435.603(d)(3), raw text: *"In the case of individuals described in paragraph (f)(2)(i) of this
> section, household income may, at State option, also include actually available cash support, exceeding
> nominal amounts, provided by the person claiming such individual as a tax dependent."*
>
> Three limits, all of which the copy must respect. It is a **State option**. It reaches only **cash
> support above nominal amounts from the person claiming the individual as a tax dependent** — a gift from
> a friend or a loan is not in it. And it applies only to individuals described in **(f)(2)(i)**: people
> *other than a spouse or child* who expect to be claimed as a tax dependent. Hedge to that case, name the
> election, and do not imply that money from family generally counts.

**The household message is two-sided.** More household income helps this pathway. Separately, enough
household income ends eligibility for the adult group entirely (133% FPL plus the 5% disregard,
§ 435.603(d)(4)). That is a different conversation that points at marketplace subsidies, **not** a
community-engagement failure. Copy must never imply a spouse's earnings are disqualifying.

**Do not total anything.** Three screener questions — married, claimed as a tax dependent, anyone else
filing with you — then name the agency. The reason is **elicitation, not arithmetic**: § 435.603(f)
composition follows tax filing relationships rather than residence, is asymmetric and per-person, and
§ 435.603(d)(2) excludes some members' income outright on a **filing-threshold test, not an age test**.
Household MAGI is **Deferred**.

**The second edge case is wrong twice over.** `threshold.edgeCases[1]` — "I earn $400 from work and $200
from unemployment", `counts: false`:

1. **Unemployment compensation counts.** $400 + $200 = $600, which is over the threshold. The answer
   flips.
2. **Even at $400 it is not "track hours from zero."** § 435.552(e)(2) lets the State credit
   `monthlyIncome ÷ federalMinimumWage` as work hours and **combine** that with other activities. Hours
   and income are not mutually exclusive. The proxy is a **State election** and, per § 435.552(e)(2)(i),
   the State must allocate hours between household members by a method we cannot know — so it is
   **Conditional** and stated as an **upper bound**: "up to," never "about."

### 2.3 Correct the activity content

- **Work is not just paid employment** (§ 435.552(b)). Three components: work for money; **in-kind** work
  (compensation as housing, meals, utilities); and **unpaid work** other than community service.
  Explicitly includes self-employment, business ownership, independent contracting, unpaid internships,
  unpaid job trial periods, and sub-threshold family caregiving hours.
- **Remove "Unpaid internships" from `activityDefinitions.work.counterExamples`.** It is listed as not
  counting and it counts.
- **Fix the per-activity 80-hour framing.** `activityDefinitions.work`, `.volunteer`, and `.workProgram`
  each say "at least 80 hours per month," implying each activity must independently reach 80. The 80 hours
  is the **monthly total across activities** (§ 435.552(a)(5), (e)(1)). `activityDefinitions.education`
  correctly states no hours and is left alone — at least half-time qualifies with zero hours and **may not
  be combined** (§ 435.552(a)(4), (e)(1)(ii)).
- **Community service:** court-ordered counts as well as voluntary; the organization may be any public or
  nonprofit body, and States **may not** restrict it to § 501(c)(3) organizations; embedded skill-building
  counts.
- **Work program:** keep "job searching doesn't count," add the nuance — standalone supervised job search
  does not qualify, but it may be a **subsidiary** activity within a qualifying program if under half the
  program's required hours, and unemployment-insurance job search can count if conducted consistently with
  work program requirements.

**`[F-extra]` `SeasonalWorkerToggle.tsx:47` states a test the rule does not impose.** Its help content
reads "If you work in an industry where work is typically available for 6 months or less per year" — an
invented threshold. **Seasonal worker** is defined by 26 U.S.C. 45R(d)(5)(B): labour performed on a
seasonal basis as defined by the Secretary of Labor (29 CFR 500.20(s)(1)), **including** retail workers
employed exclusively during holiday seasons. `rule-extract.md` § 2.7 retracts the stricter reading as
unsupported; those two categories are **inclusive examples, not a closed test**, and the IFC provides no
verification rule for seasonal-worker status. The invented test is restrictive in the user-hostile
direction and would tell a qualifying user they are not eligible for a more favourable averaging method.

**W2a fixes the definition text only.** The seasonal **averaging window** is wrong too — § 435.552(g)
averages the 6 months *preceding* the assessed month, excluding it, and HourKeep includes it — but that is
arithmetic and belongs to **W7a** (gaps 5.4, 5.5). Do not fix it here.

### 2.3b Say the reassuring true things — gaps 15.7, 15.8, 15.20

Three facts that are true, reassuring, currently absent, and cost only copy. **New content, not
corrections.** All three rated harmful in the gap analysis; all three had no scope in any wave file until
dry-run finding I3.

- **You are probably not being assessed in January (§ 435.559(c)).** A beneficiary **enrolled as of the
  State's implementation date** has compliance verified at their **first renewal initiated on or after**
  that date — not immediately. "Initiated" means when the State's ex parte review begins; CMS explicitly
  rejected an end-date trigger. For most current enrollees the first review period does not start in
  January 2027. Nothing in the app says this, so it implies a deadline that is not theirs.

- **Your state has to check its own records first (§ 435.557(a)–(b)).** Before requesting anything from
  the individual, the State must use reliable information it already holds or can obtain: payroll data,
  adjudicated claims from the preceding 12 months (paid, pended, or denied), encounter data, SNAP and
  TANF information, incarceration data, and education data. CMS estimates a majority are verified this
  way. **Cite the pair** — (a) defines the reliable-information set, (b) imposes the duty to exhaust it —
  because the June 29 correction notice (91 FR 39028) shifted paragraph designations inside § 435.557.
  This reframes the whole app: HourKeep is the backstop for what payroll data misses, not a mandatory
  chore.

- **Be careful what you volunteer (15.20).** A self-reported "no, I'm not meeting it" can be **accepted at
  face value and support a denial**. So the app must never nudge a casual negative self-report. Anywhere a
  user can assert noncompliance, say what the answer is used for, and surface the exception, hardship, and
  ex parte paths **before** the question, not after.

> **`[F9]` This content has nowhere to land, and the wave file did not say so.** The combined file said it
> goes in `dashboardGuidance`. That is
> `DashboardGuidance = { title: string; steps: { icon, text, action }[] }` — three short steps, rendered
> by `components/help/DashboardGuidance.tsx:219` and `:252`. **There is no prose field.**
>
> So § 2.3b requires a **new content interface and a new exported constant** in `src/content/`, plus a
> component change to render them. Interface additions under `src/content/` are **in scope** — they are
> content structure, not the Dexie data model, which is W3. State this rather than implying a home
> already exists.

### 2.4 Terminology and scope facts (R8.7, gaps 11.1–11.5)

Adopt CMS terminology in the domain model: **community engagement requirement**, and PL 119-21 /
"Working Families Tax Cut (WFTC) legislation" rather than "HR1". User-facing copy may keep "work
requirements" where it genuinely aids comprehension, per `medicaid-domain-knowledge.md`.

Add the missing scope facts:

- **44 jurisdictions — 43 States + DC** — must implement, **including Georgia, Tennessee, and
  Wisconsin** (three non-expansion States with § 1115 populations), plus § 1115 populations inside
  Hawaii, Massachusetts, New York, Oregon, and Utah. The steering doc previously listed Georgia and
  Wisconsin as out of scope and omitted Tennessee entirely (§ A1).
- **The territories are out of scope** (§ 435.550).
- **January 1, 2028** — documentation hardening, federally. Per-State, not national: **eight States
  require medical-frailty documentation from January 2027** (§ A3).
- **December 31, 2028** — the last possible expiry of a good-faith-effort exemption (§ 435.560).

Every `source:` field in `helpText.ts` currently cites `HR1 Section 71119(xx)(...)`. The IFC is now the
operative authority. Re-cite to the CFR, keeping the statutory reference where it adds provenance.

### 2.5 Stop asserting determinations (ADR-0003)

The full repositioning is W7b. The outright verdicts go now, because they are false today.

**Live surfaces — W2a fixes these.** Line numbers computed 2026-08-17 against `5b4b27f`.

| # | Location | Now | Becomes |
|---|---|---|---|
| 1 | `components/assessment/AssessmentBadge.tsx:154` | `You&apos;re Exempt` | "You may not need to track" + next action |
| 2 | `app/export/page.tsx:149`, `:179` | `✓ COMPLIANT` / `✗ NOT COMPLIANT` — **both branches** | `Logged: 46 hours · Threshold: 80 hours · Difference: 34` |
| 3 | `app/settings/page.tsx:205–206` | "Exempt" / "Must Track Hours" | "Based on your answers: you may be excluded" + next action |
| 4 | `app/how-to-hourkeep/results/page.tsx:349` | `label="Easiest for you"` | "May be simplest for you" |
| 5 | `components/assessment/IntroductionScreen.tsx:99` | "Check if you're exempt from work requirements" | Hedge + next action |
| 6 | `components/onboarding/ProfileForm.tsx:198` | "Good news! You may be exempt… due to your age" | **Substantively wrong.** A different sentence, not a hedge — see below |
| 7 | **`components/exemptions/ExemptionHistory.tsx:59`** | `{item.isExempt ? "Exempt" : "Must Track Hours"}` | Past-tense verdicts count too. **`[F1]` — missing from the original table** |
| 8 | `content/helpText.ts` — **12 strings, not 3** | 3 × "automatically meet" + 9 × "you meet requirements" | **`[F3]`** — see below |
| 9 | `lib/exemptions/definitions.ts` ×15 | "…you're exempt from work requirements" | Hedge **plus a next action** |
| 10 | `lib/exemptions/questions.ts` | 4 × "exempt from work requirements", 6 × "you're exempt" | Same |
| 11 | `lib/exemptions/calculator.ts` — **13 `nextSteps` strings** | "You don't need to track hours for Medicaid" | **Tier 1. Failing test first.** See below |

**Dead surfaces — W2a does NOT fix these. W0 deletes them. `[F2]`**

| Location | Renders | Why not fixed |
|---|---|---|
| `components/exemptions/ExemptionBadge.tsx:150`, `:249` | **`You Are Exempt`**, `Must Track Hours` | Zero importers. 308 lines, head of a dead chain. `codebase-audit-2026-08.md` § 5 |
| `components/exemptions/ExemptionDetailsDialog.tsx` | — | Imported only by `ExemptionBadge` |
| `components/exemptions/ExemptionResults.tsx:73` | **`You Are Exempt`** / `You Must Track Hours` | Imported only by `ExemptionDetailsDialog` |
| `components/assessment/AssessmentHistory.tsx:48`, `:57` | "Exempt" chip; "You were exempt from work requirements" | **Zero importers.** `getAssessmentHistory` has no caller |

> **`[F1]` The original § 2.5 table listed a dead file and omitted a live one.** It included
> `AssessmentHistory.tsx` (rows :48 and :57) — which has **zero importers** and which W0 deletes, so W2a
> would have been writing careful hedged copy into a file the next wave removes. And it omitted
> `ExemptionHistory.tsx:59`, which is **live**, imported at `settings/page.tsx:24` — the same page whose
> lines 205–206 the table *did* list.
>
> The shape of the error: someone enumerated `components/assessment/` and stopped. There is a parallel
> `components/exemptions/` tree.

> **`[F2]` Two dead files render the literally banned phrase.** `ExemptionBadge.tsx:150` and
> `ExemptionResults.tsx:73` render **`You Are Exempt`** — verbatim row one of ADR-0003's banned table, and
> the most explicit verdict in the repository. Because they are dead, the right fix is W0's deletion, not
> a rewrite. **But the guard must still fail on them today**, or it is not a guard. See the three-part
> split below.

> **`[F3]` `helpText.ts` has 12 verdict strings, not 3.** The original table said `helpText.ts ×3`,
> meaning `automatically meet` at lines 239, 272, and 380. There are also **9** instances of "you meet
> requirements" / "You meet work requirements" at lines 285, 302, 307, 315, 322, 351, 374, 387, and 393.
> Line 307 is `seasonalWorker.example.result: "You meet work requirements as a seasonal worker"` — a flat
> verdict.
>
> **Scope and criteria contradicted each other.** § 2.2's scope named only
> `incomeDefinitions.threshold`, which holds 4 of the 12. The other 8 sit in `seasonalWorker`,
> `incomeVsHours`, and `gigEconomy` — owned by no section — while the acceptance criterion demanded zero
> `automatically meet` **in `src/`**, and one of the three is `gigEconomy:380`.
>
> **Resolved in favour of the criterion: W2a owns all of `src/content/helpText.ts`,** not just
> `incomeDefinitions.threshold`. A repo-wide criterion needs repo-wide scope.

**`[C1]` `calculator.ts` — 13 `nextSteps` verdicts, plus two substantive errors.** Its `explanation`
strings already hedge ("You may be exempt from work requirements because…"), which is better than the
table implied. Its `nextSteps` strings do not: **13** occurrences of "You don't need to track hours".
This is a **Tier-1 TDD module** — failing test before the change (`engineering-standards.md`, ADR-0007).

Two errors of substance in the same file, both left half-fixed by the original table:

- **`age >= 65` is not an exclusion** (and neither is `ProfileForm:198`, row 6 above). Age 65+ is
  **outside § 435.551's applicable-individual definition entirely** — the adult group at § 435.119 is
  19–64. They are not "excluded within" the requirement, they are not in the group. Gap **15.21**.
  § 435.603(j) confirms the adjacent point: MAGI methods are not used where age 65+ is a condition of
  eligibility. This needs a different sentence, not a hedge.
- **`age <= 18` is mis-tiered.** Under 19 is a **Tier-2 mandatory exception** under § 435.553(a)(1) —
  *deemed to have demonstrated* community engagement for the month — not a Tier-1 specified exclusion
  under § 435.554. Re-tiering the data model is W3/W4; **the copy must stop calling it an exemption
  now.**

**The guard test, in three parts.** The originally specified regex —
`/\b(you are|you're) (exempt|compliant)\b/i` — matches almost none of the live violations
(dry-run finding I6): `You&apos;re Exempt` is an HTML entity in source, `"You were exempt"` is past
tense, `"Exempt"` chips and `✓ COMPLIANT` have no pronoun, and `automatically meet work requirements`
shares no words with the pattern. Replaced by a **token list** — `exempt`, `compliant`,
`automatically meet`, `you qualify`, `you meet`, `not compliant`, `on track` — with HTML entities
normalised first.

One assertion mechanism cannot cover all of it, and a single test would be **red at the end of W2a**
because `You Are Exempt` stays in the tree until W0 deletes those four files. So:

1. **Rendered output**, live component surfaces. `@testing-library/react`, entities normalised, tokens
   asserted against `textContent`. Where a token is legitimately needed — explaining what "exempt" means
   as a term — allow it only in a definition context and say so in the test name.
2. **Content data**, walked recursively over the exported objects in `helpText.ts`, `definitions.ts`, and
   `questions.ts`. These are plain data modules, not components; a data assertion is cheaper, complete,
   and does not need a DOM.
3. **Source scan with an explicit allowlist** of the three dead files that render a verdict, **each entry commented with
   W0 as removal owner**, plus an assertion that **the allowlist is empty after W0**.

Part 3 is why the handoff lives in the test rather than in prose: W0's deletion becomes verifiable rather
than assumed, and a resurrection of the dead chain turns the suite red.

> **`[F5]` AUTHORIZED SCOPE EXCEPTION — extract the export text builder.**
>
> `app/export/page.tsx:149` and `:179` do not render anything. They concatenate into `textContent`, a
> string built inside a `handleExport` closure in a client component that reads Dexie directly and hands
> the result to a download. There is no DOM to assert on and no exported function to call, so
> "the export prints `Logged: N · Threshold: T · Difference: D`" **names no observable.**
>
> W2a therefore extracts the builder into a **pure function** in its own module. This is outside
> "copy and content only" and is authorized deliberately, for three reasons:
>
> 1. An acceptance criterion must name something you can run, read, or see
>    (`engineering-standards.md`). Against a closure, this one cannot be checked at all.
> 2. **ADR-0006** makes the period-scoped evidence package the product's output target and **W8a**
>    rewrites this export as print-ready HTML. A pure builder is work W8a needs regardless, so this is
>    early, not extra.
> 3. The alternative — a jsdom click-through with `fake-indexeddb` and a stubbed
>    `URL.createObjectURL` — is precisely the fragile test that gets disabled by day three. The same
>    reasoning retired the repo-wide policy-literal grep (§ C10).
>
> **Pure extraction, no behaviour change**, beyond the § 2.5 string replacement itself.

### 2.6 Fix the false exclusivity claim — both places it appears

`ComplianceModeSelector` makes it **twice**, not once:

- **line 123** — switching to income mode: "Your hours data will be preserved, but only your income will
  count toward compliance while in income mode."
- **line 132** — switching to hours mode: "Your income data will be preserved, but only your hours will
  count toward compliance while in hours mode."

Neither is true of the law. § 435.552(e)(1) **requires** combination, and § 435.552(e)(2) adds the
income-to-hours proxy on top. Both branches change. The selector is removed entirely in W7b; until then
it must not state something false.

> **`[F4]` The same falsehood is in content, and no section owned it.**
> `incomeDefinitions.incomeVsHours` is titled **"Income OR Hours - You Choose"** (`helpText.ts:329`) and
> its `note` reads **"You only need to meet ONE of these requirements, not both"** (`:345`). That is the
> § 435.552(e) error again, in the content layer. § 2.2's scope covered only
> `incomeDefinitions.threshold`; § 2.6's covered only the dialog. **§ 2.6's theme owns it** — it is the
> same false claim, in the same wave, in the same harm class.
>
> Note what is *not* wrong: needing only one pathway is true (§ 435.552(a) is a disjunction). The error is
> the "You Choose" / "not both" framing, which forecloses combination and the proxy.

---

## Out of scope

| Not here | Wave | Note |
|---|---|---|
| Policy profile, removing policy literals | **W2b** | Every literal left in place is in the handoff table below |
| Dexie schema, `userId`, compound indexes | **W3** | Owns the consolidated v7 |
| New or reworded screening **questions** | **W4** | W2a rewords existing help text; it adds no questions |
| Month scoping, review-period model | **W5** | |
| Seasonal averaging window, double-counting fix | **W7a** | W2a fixes the seasonal *definition text* only |
| Removing the hours/income mode fork; the proxy | **W7b** | W2a only stops the fork from lying |
| Verdicts in **types and return values** | **W7b** | See the handoff below |

### The honest boundary: "every verdict string removed" is true of **strings only**

`engineering-standards.md` is explicit that the no-verdict rule "constrains types and return values, not
only copy," and `compliance-copy-standards.md`'s own concentration table lists
`recommendationEngine.ts` returning `complianceStatus: "compliant"`. Those survive W2a:

| Artifact | Where | Owner |
|---|---|---|
| `complianceStatus: "compliant"` | `lib/assessment/recommendationEngine.ts:24, 53, 63, 68, 73, 91, 102` | **W7b** |
| `Recommendation.complianceStatus` field | `types/assessment.ts` | **W7b** (ADR-0003 removes it) |
| `isExempt: boolean` | `lib/exemptions/calculator.ts`, `types/exemptions.ts`, consumers | **W3** / **W7b** |
| `isCompliant: boolean` | `lib/calculations.ts` → `MonthlySummary` | **W7b** (ADR-0003: → `meetsHoursThreshold`) |

They are not user-visible, and changing them cascades into every consumer. Deferring them is the right
call for a copy wave — but this wave does not close ADR-0003, and should not read as though it does.

---

## W2b handoff — policy literals left in place

Per the wave constraint: where a correction touches a threshold value, **leave the literal and record
it.** Counts computed 2026-08-17 against `5b4b27f`; the table is filled in with exact line numbers as
each file is edited, and the row count must equal the grep count.

**Computed 2026-08-17 at W2a close.** Pattern:
`grep -nE '(^|[^0-9._$A-Za-z])(80|580|7\.25|4\.33)([^0-9%A-Za-z]|$)'`, excluding comment-only lines and
two `width: 80` / `height: 80` CSS values in `results/page.tsx`. **44 lines across 7 files.**

| File | Lines | Count | Notes |
|---|---|---|---|
| `src/content/helpText.ts` | 182, 246, 399, 479, 567, 583, 593, 671, 673, 674, 678, 803 | **12** | Mostly worked examples in prose. `:399` is the `$580 = 80 × $7.25` derivation; `:593` is the § 435.552(e)(2) proxy example; `:803` is in `documentVerificationHelp` |
| `src/lib/assessment/recommendationEngine.ts` | 34, 39, 45, 80, 98, 99, 102, 104, 108, 204 | **10** | Tier 1. Includes the four **threshold comparisons** (`>= 580`, `>= 80`) — logic, not copy |
| `src/app/how-to-hourkeep/results/page.tsx` | 104, 118, 119, 144, 169, 171, 173, 175, 177 | **9** | |
| `src/components/onboarding/GettingStartedContextual.tsx` | 78, 103, 105, 107, 109, 111 | **6** | Near-duplicate of the results page |
| `src/lib/exemptions/calculator.ts` | 213, 307 | **2** | Tier 1 |
| `src/lib/exemptions/definitions.ts` | 158, 328 | **2** | Was 4. Two disappeared when review fixes removed the invented "6 credit hours" rule and the "80 hours per month" framing from `communityEngagement` |
| `src/app/export/page.tsx` | 114 | **1** | The single `thresholds: { hours: 80, income: 580 }` call site |
| `src/lib/export/buildTextReport.ts` | — | **0** | **Takes thresholds as a parameter.** W2b passes the profile straight in |

Row count equals the grep count: 12 + 10 + 9 + 6 + 2 + 2 + 1 + 0 = **42**.
Recounted at wave close, after the review fixes. It was 44 before them.

> **`scripts/compliance-gate.sh` scans only three of these seven files.** Its `targets` array is the five
> Tier-1 modules, of which W2a touched two. It does **not** reach `src/content/`,
> `src/lib/exemptions/definitions.ts`, `src/app/`, or `src/components/`. So **this table is the only
> record** for 32 of the 44, and W2b cannot rely on the gate to find them. The gate currently warns
> **17** literals across its five targets, all pre-existing.

**One structural improvement banked for W2b:** the extracted export builder takes
`thresholds: { hours, income }` as an argument rather than reading literals, so W2b changes one call site
instead of the module. The same shape would work for `recommendationEngine`.

---

---

## Found during execution, 2026-08-17

Nine problems were found by re-verifying the plan before writing code. **Six more only appeared once the
guard test existed and was run.** Recorded here because the pattern is the point: each was invisible to
inspection and visible to execution.

### `[E1]` The § 2.5 table missed five more live files

The phrase scan found verdict strings in **five live files the table did not list**, beyond the
`ExemptionHistory` omission already recorded as `[F1]`:

| File | Sites | What |
|---|---|---|
| `app/how-to-hourkeep/results/page.tsx` | 98, 100, 103, 112, 114, 295 | Six more, in `getExemptMethodMessage` and the accordion. The table listed only `:349` |
| `components/assessment/NoticeQuestion.tsx` | 358 | "We recommend checking if you're exempt first" |
| `components/onboarding/GettingStartedContextual.tsx` | 241, 290 | A **duplicate** of `results/page.tsx:349`, including the same `label="Easiest for you"` |
| `lib/assessment/recommendationEngine.ts` | 166 | A verdict **string** in a Tier-1 module. The table listed only the `complianceStatus` field |
| `app/settings/page.tsx` | 247 | "see if you qualify for an exemption" |

The original scope named **11 sites**. The real live count was **78 lines across 14 files**.

### `[E2]` The ranking-claim family was larger than "Easiest for you"

§ 2.5 named one ranking claim. Running the guard surfaced a whole family in
`getNonExemptMethodMessage` and its duplicate in `GettingStartedContextual`: "this easier method" ×3,
"income tracking is easier", "might be easier for your situation", "might be simpler", "a simpler
option", and "which already meets the threshold" ×2.

`already meets` matters most. For income it is not even arithmetic HourKeep holds — § 435.552(f)(2)
measures against MAGI-based income for the **household**, and the app stores one person's records. Added
to the phrase list.

**Deviation from the wave file, recorded deliberately:** § 2.5 proposed replacing `label="Easiest for
you"` with **"May be simplest for you"**. That is the same ranking claim, hedged. Used **"Closest to what
you told us"** instead — it describes the input rather than asserting a comparative fit.

### `[E3]` The render guard was blind at element boundaries — caught by proving it red

The "prove the guard red" step did what it exists for. With `You&apos;re Exempt` reintroduced at
`AssessmentBadge.tsx:154`, **only the source scan went red. The render test passed.**

Cause: `document.body.textContent` concatenates adjacent elements with no separator, so the heading plus
the next sibling rendered as `You're ExemptR…`, and `\byou're exempt\b` cannot match — `R` is a word
character and kills the trailing boundary. Fixed by walking text nodes with a `TreeWalker` and joining
with a separator. Both layers now catch it.

A guard that cannot go red is not a guard, and this one could not, in the exact case it was written for.

### `[E4]` The either/or test passed against the falsehood it was written to catch

The first version of the `recommendationEngine` combination test asserted
`/\b(add|combine|together|alongside|both)\b/`. It passed against
*"You need **either** 50 more hours **or** $200 more income… **add** more work"* — because "add more
work" contains "add". Rewritten to assert the **absence** of the either/or construction directly.

### `[E5]` A pre-existing timezone bug in the export, surfaced by the extraction

`new Date(month + "-01")` parses as **UTC** midnight, so in any negative-offset timezone the month
heading printed the **previous month**. On a machine in `PDT`, a July record was headed "June 2026".

This is the artifact a user hands a caseworker, mislabelled. Fixed to `+ "-01T00:00:00"`, matching how
per-entry dates were already handled a few lines below. **This is a behaviour change beyond pure
extraction** — recorded rather than folded in silently. `data-migration-standards.md` names this exact bug
class, and the bug was undetectable until the builder became callable.

### `[E7]` Developer documentation was instructing contributors to write the banned phrase

After the TypeScript was clean, three markdown files under `src/lib/exemptions/` still carried it — and
one was not merely stale but **prescriptive**. `DEFINITIONS_README.md:156` gave this as the house style
for Tier-2 help text:

> Include consequences (e.g., "If yes, you're exempt from work requirements")

That is documentation which regenerates the defect. Fixed all three, and **extended the source scan to
`.md` files under `src/`** so the class is guarded rather than remembered. Verified by planting
`you are exempt from work requirements` in that file, observing red, and reverting. The other two
markdown files under `src/` (`HR1_COVERAGE_ANALYSIS.md`, `ACCORDION_UPDATE.md`, `TESTING.md`) are clean,
so the extension added no noise.

### `[E6]` The allowlist is three files, not four

`ExemptionDetailsDialog.tsx` is dead and W0 deletes it, but it **asserts no verdict of its own**, so it
needs no suppression. The allowlist's own anti-rot test rejected it. Allowlist: **`ExemptionBadge.tsx`,
`ExemptionResults.tsx`, `AssessmentHistory.tsx`.**

### How the W0 handoff became testable rather than aspirational

"Assert the allowlist is empty after W0" cannot be asserted while the files still exist. Three tests do
the job instead, and all three are green now:

1. every allowlisted file **must still exist** — after W0 deletes it, this goes red until the entry is
   removed, so the allowlist cannot outlive its subject;
2. every allowlisted file **must still contain a verdict** — a stale entry cannot linger (this is what
   caught `[E6]`);
3. every entry **must name `W0`** as `removalOwner`, typed so nothing else can be allowlisted.

Once all three files are gone the allowlist is empty by construction. Nobody has to remember.

### Deferred, with reasons

| Item | Why not W2a | Owner |
|---|---|---|
| The ~30 `// HR1 Reference:` comments in `questions.ts` | Still accurate as provenance. Replaced the file header with a **statute → CFR → tier mapping table** covering all 14 questions, which is the claim that was missing. W4 rewrites the questions themselves | **W4** |
| `getComplianceMethodLabel("exemption")` returning `"Exemption"` | A category noun, not an assertion about the user. Renaming the `ComplianceMethod` union cascades into stored `assessmentResults` records | **W3** / **W7b** |
| De-duplicating `getNonExemptMethodMessage` / `getMethodMessage` | Real duplication (§ 6 of the audit). Both copies corrected; merging them needs the unified compliance model | **W7b** |
| Seasonal averaging window arithmetic | W2a fixed the *definition text* only, as scoped | **W7a** |
| "Reasonably predictable changes" methodology copy | User-favourable and pure copy, but unauthorized here. Flagged rather than added | **W7a** |

---

---

## Review protocol outcome, 2026-08-17

Two independent reviewers ran against the finished diff: one on domain fidelity against raw regulatory
text, one adversarial on test quality and the export extraction. **Every finding below was confirmed
against the primary source before being accepted**, and the ones that did not survive verification are
named at the end.

**The review caught more than the wave did.** That is the protocol working, and it is worth recording
plainly rather than presenting W2a as having got there on its own.

### `[R1]` The § 435.554 paragraph citations were systematically wrong — 43 sites

**The most serious finding.** § 435.554 is structured **(a)** supporting definitions (caretaker relative,
dependent child, disabled individual, family caregiver, guardian, parent — alphabetical, unnumbered),
**(b)** the operative exclusion sentence, **(c)(1)–(c)(10)** the ten categories.

W2a cited the ten categories as `435.554(a)(1)`–`(a)(10)` throughout. Every one landed on an unrelated
provision. Verified against the IFC preamble: "We define the terms caretaker relative, dependent child,
disabled individual, family caregiver, guardian and parent at **§ 435.554(a)**"; former foster care
"implemented at new **§ 435.554(c)(1)**"; American Indians at "the new **§ 435.554(c)(2)**"; caregivers at
"**§ 435.554(c)(3)**"; inmates at "**§ 435.554(c)(9)**". `rule-extract.md` § 4.1/4.2 had it right —
"Supporting definitions — § 435.554(a)" and "The ten exclusion categories — § 435.554(c)".

**Cause, worth naming so it is not repeated:** the numbering was inferred from
`medicaid-domain-knowledge.md`'s list of the ten categories, which is presented as an unnumbered list. A
list of ten items is not a paragraph structure. This is the source-tier rule failing in a new way — the
steering doc was accurate, and reading a *summary's formatting* as a *citation* still produced 43 wrong
cites.

Also fixed in the same pass:

| Was | Is | Authority |
|---|---|---|
| `435.553(a)(5)` (×4) | **`435.553(b)`** | Preamble: "New § 435.553(b) implements section 1902(xx)(3)(A)(ii) of the Act, which establishes an exception for incarcerated individuals" |
| `435.552(e)(1)(ii)` (×2) | **`435.552(a)(5)`** | (e)(1) is one undivided sentence; the no-combination prohibition is in (a)(5) |
| `435.440.315(f)` | **`42 CFR 440.315(f)`** | Malformed |
| `435.558(b)` for the 30-day window | **`435.558(a)(2)`**, receipt presumption at **`(c)(4)`** | (b) is "Defining 'unable to verify'" |

### `[R2]` Four substantive errors survived in `definitions.ts`, because the file was scoped as hedge-only

W2a treated `definitions.ts` as 15 hedges to rewrite. It is also **content**, and four claims in it were
wrong — three of them contradicting corrections W2a had just made in `helpText.ts`. The app disagreed with
itself.

| Site | Error | Direction |
|---|---|---|
| `educationalProgramHalfTime` | "at least 6 credit hours per semester. **Hours spent in class and studying count toward your 80 hours per month**" — invented a credit-hour test (§ 435.552(c) gives enrollment status to the school), and half-time needs **no** hours and **cannot** be combined. Self-defeating too: 6 credits is 77.94 hours, below 80 | **user-unfavourable** |
| `workProgram` | Generic "job training, workforce development, or employment services", with "Career counseling and **job search assistance**" as a qualifying example. § 435.552(b) is a closed list of five and expressly excludes standalone job search | **user-favourable — the more dangerous one**, since the user logs hours the state then rejects |
| `snap` | "If you're on SNAP and **meeting their work requirements**" — the TANF standard applied to SNAP, where § 435.554(c)(7) asks only whether the household receives SNAP and its work rules apply | **user-unfavourable** |
| `communityEngagement` | Listed half-time school among activities counting toward the 80 hours | **user-unfavourable** |

### `[R3]` `questions.ts` told unsure veterans to answer "No"

> "Are you a veteran with a **100%** disability rating from the VA? … **If you're not sure of your rating,
> select 'No'.**"

Two failures at once. § 435.554(c)(4) covers a disability rated as total, **temporary or permanent**, and
the IFC preamble is explicit that TDIU veterans — paid at the 100 percent rate because their disabilities
prevent them working — "**must be treated by States in the same manner**" as veterans with a combined 100
percent rating. And the file's own header claimed this gap was "hedged in the help text rather than
repeated as fact." It was repeated as fact, then the qualifying answer was suppressed.

**Never tell a user to answer No when unsure on a question that could take them out of the requirement.**

### `[R4]` The engine contradicted the corrected copy

- `"Submit one paystub per month showing **you earn** at least $580"` — contradicts § 435.552(f)(2)
  household MAGI, and reads as not applying to the married user the wave exists to protect.
- `"Log 80 hours per month of work, volunteering, or school"` — drops **work program**, a pathway under
  § 435.552(a)(3).
- `"**Averaged over 6 months**, your seasonal income comes to $X"` where X is a single self-reported
  monthly figure. A **Deferred** number labelled as **Computed** — an ADR-0003 labelling error that no
  layer of the guard can detect, because the sentence contains no banned phrase.
- `exemptionReason: "Meeting work requirements for food stamps (SNAP)…"` — the SNAP error again, in the
  label most likely to be printed in an export.

### `[R5]` Three guard holes, all closed

- **Bare `easiest`.** `"Discover the easiest way to keep your hours"` rendered live in
  `IntroductionScreen`, `AssessmentBadge`, and `ProfileForm`, and the render test exercised two of those
  branches while passing. The phrase list had `easiest for you` / `easiest option` but not `easiest way`.
  Added as `easiest way` rather than bare `easiest`, which would fire on "the part that is easiest to get
  wrong" — prose about the copy, not a ranking.
- **Markdown bullets read as comments.** `isCommentOnly` matched a leading `*`, which in markdown is a
  bullet or `**bold**`. **59 lines under `src/` were silently skipped.** One contained a banned phrase.
  The guard was green for an accidental formatting reason, which is indistinguishable from not being
  green. Comment stripping now applies to `.ts`/`.tsx` only, and the markdown line that quoted the banned
  phrase was reworded to describe it instead.
- **`documentVerificationHelp` was unwatched.** The only data export of `helpText.ts` missing from the
  content walk — ~35 strings across 11 fields, rendered by a component the render test also does not
  cover. A double blind spot, and precisely the failure mode a hand-listed module list invites.

### `[R6]` The allowlist did not assert the property it depends on

Three tests guarded the allowlist: the file exists, still contains a verdict, names W0. **All three stay
true if someone re-imports `ExemptionBadge` into a live page** — at which point `You Are Exempt` renders
to users and the suite stays green. The header claimed a resurrection "turns the suite red"; it did not.

Added a fourth test asserting **no live importer**, with `DEAD_CHAIN` so an import from elsewhere inside
the unreachable chain does not count as liveness. Verified by adding the import, observing red, reverting.

### `[R7]` Five weak tests, including one that could pass with the code deleted

| Test | Defect |
|---|---|
| `buildTextReport` timezone test | `vitest.config.mts` set no `TZ`, so it **passed under UTC with the bug restored** — green on CI, broken for most US users. `TZ` now pinned to `America/New_York`, plus an assertion that the offset is actually negative and a loop over all twelve month boundaries |
| `calculator.copy` explanations | All assertions negative, and an empty string produces no hits — **`explanation: ""` for all 13 branches would have passed.** Added a positive floor: length plus a named mechanism |
| `calculator.copy` 65+ | `/19\|64\|adult/i` — alternation including the substring "adult", so "Medicaid for adults" passed. Now requires both `\b19\b` and `\b64\b` |
| `recommendationEngine` proxy bound | Wrapped in `if (/hours/ && /\$\d/)`, so a copy change made it pass with **zero assertions**, and it never checked that any bound was stated |
| `recommendationEngine` difference | `monthlyWorkHours: 40` asserting `toContain("40")` — but 80 − 40 = 40, so input and difference were the same number. **Deleting the difference entirely would have passed.** Same shape as the "add" bug found mid-wave. Now 30 → asserts `"Difference: 50"` |
| `recommendationEngine` either/or sweep | Full three-pattern check on one fixture, one-word check on the other six. Now all three on all scenarios |
| `recommendationEngine` scenarios | Every scenario passed `exemption: {}`, and the function **short-circuits on exclusion before any pathway logic** — so the highest-stakes branch was never exercised. Added |

### Confirmed and accepted, not fixed

- **The export extraction is faithful.** Verified mechanically, not by reading: 13 fixtures diffed
  old-vs-new across two timezones, zero data or ordering differences. Every difference under
  `America/New_York` was a month heading — the bug being fixed.
- **`[S16]` "Pure extraction, no behaviour change" was over-claimed.** Five output strings changed beyond
  the verdict tokens: the report title, the mode line, the not-a-determination block, the household note,
  and the month-heading fix. All five are intended; the blanket claim was wrong and is now itemised in the
  module header.
- **`[N2]` A count inconsistency inside the guard**: "four files render verdicts and are dead" vs three
  allowlisted. Four files are dead; **three** render verdicts. Fixed in the comments — the exact class of
  error `engineering-standards.md` exists to prevent, in the file that enforces it.

### Deferred with reasons

| Finding | Why not now | Owner |
|---|---|---|
| `complianceStatus: "compliant"` still returned | Named in the wave's scope boundary from the start. Type change cascades into every consumer | **W7b** |
| `calculator.ts` returns `isExempt: true` for 65+, which the engine turns into `primaryMethod: "exemption"` — so the § 435.551 distinction the copy draws is flattened one layer up | Real, and structural. Needs the three-tier model | **W3** / **W7b** |
| Render layer sees text nodes only — `aria-label`, `title`, `alt`, and MUI status icons are invisible. `ExemptionHistory` and `AssessmentBadge` still signal outcome by green tick vs warning icon | A genuine gap in a 5-of-63-component layer, and the icon question is a `component-standards.md` colour-alone issue as much as a verdict one | **W7b** with the badge rework |
| `stripLineComment` can be bypassed by a protocol-relative `//` URL; an unterminated `/*` in a string blanks the rest of a file | Verified **zero live instances** across all 111 scanned files. Latent, and the fix needs a real tokeniser | note only |
| Household note says "your whole tax household", omitting the § 435.603(d)(2) filing-threshold carve-out | Correct finding. Adding it well needs the screener questions | **W4** |
| Three real § 435.603(e) exclusions absent from `whatDoesNotCount`: education scholarships, AI/AN income, lump sums counted only in the month received | Correct finding, user-unfavourable omission | **W4** |
| ~30 `// HR1 Reference:` comments, and two `sourceReference` fields that disagree with the CFR comment above them | Provenance, not operative. The statute→CFR→tier mapping table now covers the claim | **W4** |
| `getComplianceMethodLabel("exemption")` → `"Exemption"` | Category noun. Renaming the union touches stored records | **W3** |

### Not verified — flagged rather than asserted

Both reviewers were asked to say what they could not confirm, and two items matter:

1. **"CMS expects most people to be cleared this way without doing anything"**
   (`requirementFacts.ex-parte-first`). The reviewer searched the IFC text and **could not locate a
   majority estimate**. It is asserted in `compliance-copy-standards.md` but not tied to a Federal
   Register page. It is load-bearing and **user-favourable**, which is the direction that needs the most
   care. **Softened to "CMS expects many people"** pending a page cite — noted here rather than left as an
   unsourced reassurance.
2. **Whether § 435.557(a) names SNAP/TANF and school enrollment specifically.** Adjudicated claims from
   the preceding 12 months and encounter data are confirmed. The other two are stated in the extract's
   preamble discussion; I did not confirm them in the regulatory text. Left in place, flagged.

---

## Acceptance criteria

Every criterion names an observable. Every negative has a positive twin (DoD item 7). Counts in
parentheses were computed on 2026-08-17.

### Income content (§ 2.2)

- [ ] `whatDoesNotCount` **still exists as a field** and contains **exactly 3** entries — SSI, child
      support, and the hedged cash-support entry — **and** its `description` no longer says unearned
      income doesn't count **`[F8]`**
- [ ] The hedged cash-support entry names the **State option** and is scoped to **cash support above
      nominal amounts from the person claiming the user as a tax dependent**, citing § 435.603(d)(3).
      It does **not** say gifts or loans generally count **`[C2]`**
- [ ] `whatCounts` affirmatively lists unemployment compensation, interest and dividends **including
      tax-exempt interest**, rental income, and Social Security **including the non-taxable portion** —
      **grep each of the five** **`[C3]`**
- [ ] No `whatCounts` entry says "only earned income"; the field's `description` affirmatively states
      that earned **and** unearned income count
- [ ] `incomeDefinitions.threshold` states the household basis and the three screener questions,
      **and** contains no summed or computed household figure
- [ ] `threshold.edgeCases[1]` no longer says unemployment doesn't count, **and** affirmatively states
      both corrections: the $600 total, and that income below the threshold may still be credited as
      hours under § 435.552(e)(2)
- [ ] Every proxy reference says **"up to"**, never "about" — § 435.552(e)(2)(i) household allocation
- [ ] Household MAGI is labelled **Deferred**, the proxy **Conditional**, and the credit-hour and
      difference arithmetic **Computed**
- [ ] The two-sided message is present: more household income helps this pathway, and separately there
      is an eligibility ceiling that is a different question. **No copy implies a spouse's income
      disqualifies anyone**

### Verdict strings (§ 2.5)

- [ ] Zero occurrences of `automatically meet` in `src/` **outside `src/__tests__/`** (currently **3**:
      `helpText.ts:239, 272, 380`), **and** each replacement site says the state decides.
      *The exclusion is not a loophole:* the guard's phrase list and its guard-the-guard fixtures must
      contain the banned strings in order to test for them, so a literally repo-wide criterion is
      unsatisfiable
- [ ] Zero occurrences of "you meet requirements" / "You meet work requirements" in `src/content/`
      (currently **9**: lines 285, 302, 307, 315, 322, 351, 374, 387, 393), **and**
      `seasonalWorker.example.result` states the comparison rather than the conclusion **`[F3]`**
- [ ] All **15** `definitions.ts` entries and the `questions.ts` help text (**4** + **6**) pair their
      hedge with a **next action**
- [ ] All **13** `calculator.ts` `nextSteps` strings drop "You don't need to track hours", **and** each
      states what to bring to the agency instead **`[C1]`**
- [ ] `calculator.ts`'s `age >= 65` branch and `ProfileForm.tsx:198` both state that 65+ is **outside**
      the adult group (§ 435.551, § 435.119), not excluded within it — **and** neither uses the word
      "exempt" for that case
- [ ] `calculator.ts`'s `age <= 18` branch describes a **mandatory exception** (§ 435.553(a)(1)), not an
      exclusion
- [ ] **`ExemptionHistory.tsx:59`** renders no guard token **`[F1]`**
- [ ] Every live surface renders or returns none of the guard tokens. **The § 2.5 table's 11 sites were
      an undercount: the real figure was 78 lines across 14 live files** — see `[E1]`. The criterion is
      the scan passing, not a site list, precisely because the list was wrong twice
- [ ] The export builder emits `Logged: N · Threshold: T · Difference: D` for **both** the hours and the
      income block, asserted by calling the extracted pure function **`[F5]`**
- [ ] The extracted builder is a **pure function** — no Dexie access, no React, no DOM — and
      `app/export/page.tsx` calls it rather than duplicating the logic
- [ ] `hoursNeeded` / difference arithmetic **survives** as neutral arithmetic. A difference is not a
      verdict

### The guard test (§ 2.5)

- [ ] The guard is a **token list against normalised output**, not the original pronoun regex, **and**
      **both** parts 1 and 3 fail when `You&apos;re Exempt` is reintroduced at
      `AssessmentBadge.tsx:154` — demonstrated by reintroducing it, observing red, and reverting.
      *This step found a real hole:* on the first attempt only part 3 went red — see `[E3]`
- [ ] The guard has guard-the-guard tests in both directions: it catches every form W2a removed
      (entity, past tense, no pronoun) **and** does not fire on identifiers, citations, or comments
- [ ] Part 1 asserts **rendered** output for the live component surfaces
- [ ] Part 2 walks the **exported content objects** of `helpText.ts`, `definitions.ts`, and
      `questions.ts` recursively, so a new string field is covered without editing the test
- [ ] Part 3 is a **source scan with an allowlist of exactly 3 files** — `ExemptionBadge.tsx`,
      `ExemptionResults.tsx`, `AssessmentHistory.tsx`, each with `removalOwner: "W0"` **`[F2]`**,
      **`[E6]`**
- [ ] Three tests keep the allowlist honest and **all are green now**: every entry still exists (so it
      goes red when W0 deletes the file), every entry still contains a verdict (so it cannot rot), every
      entry names W0. No `it.skip`
- [ ] `npm test` is **green** at the end of W2a. The dead-file tokens are accounted for by the
      allowlist, not by a failing test left red

### Activity content (§ 2.3)

- [ ] `activityDefinitions.work.counterExamples` no longer contains "Unpaid internships", **and**
      `.definition` names in-kind and unpaid work with a § 435.552(b) citation comment
- [ ] No `activityDefinitions.*.definition` contains "80 hours" (currently **3** do: `work`,
      `volunteer`, `workProgram`), **and** exactly one place states it as a monthly total across
      activities
- [ ] `activityDefinitions.education` still states that at least half-time needs no hours, **and**
      affirmatively states that it may **not** be combined (§ 435.552(e)(1)(ii))
- [ ] Community service content affirmatively states that court-ordered counts and that the
      organization need not be a § 501(c)(3)
- [ ] Work program content keeps the job-search exclusion **and** states the subsidiary-activity nuance
- [ ] `SeasonalWorkerToggle.tsx:47` no longer states the invented "6 months or less per year" test,
      **and** affirmatively describes 26 U.S.C. 45R(d)(5)(B) as covering seasonal-basis labour and
      holiday retail **as examples**, not as a closed test

### Reassurance (§ 2.3b)

- [ ] Content affirmatively states **§ 435.559(c)** — enrolled beneficiaries are assessed at their first
      renewal *initiated* on or after the implementation date — with a citation comment
- [ ] Content affirmatively states **§ 435.557(a)–(b)** ex parte, **citing the pair**, and names at least
      payroll data, adjudicated claims from the preceding 12 months, SNAP/TANF, and education data
- [ ] Content affirmatively states the **15.20** caution, **and** no question in the app invites a bare
      negative self-report without first naming what the answer is used for and surfacing the exception,
      hardship, and ex parte paths
- [ ] The new content is **rendered**, not merely exported — a component displays it, verified in the
      browser **`[F9]`**

### Terminology and scope (§ 2.4)

- [ ] Georgia, Tennessee, and Wisconsin are affirmatively listed **in** scope; **44 jurisdictions
      (43 States + DC)** stated
- [ ] The territories are affirmatively stated to be **out** of scope
- [ ] **January 1, 2028** documentation hardening and **December 31, 2028** good-faith ceiling both
      appear
- [ ] No `source:` field in `helpText.ts` cites only `HR1 Section 71119` — each carries the CFR section

### Wave hygiene

- [ ] No **new** policy literal is introduced; every literal left in place is in the W2b handoff table
      with file and line, **and the row count equals the grep count**
- [ ] Gap rows 5.2, 11.1–11.5, 15.7, 15.8, 15.20 struck in `gap-analysis.md` with **W2a**; rows 4.1,
      4.9, 4.10, 5.1, 5.3 struck with **two** wave numbers
- [ ] `npx tsc --noEmit` clean · `npm run lint` no new warnings (**4** pre-existing) ·
      `npm run format:check` clean · `npm run build` succeeds · `npm test` green
- [ ] The review protocol (`.kiro/hooks/wave-review.kiro.hook`) has been run, four reviewers in
      parallel, **and every finding confirmed against the files before being accepted**
- [ ] `CHANGELOG.md` updated · manual smoke test on a phone viewport, offline

---

## Risks

| Risk | Mitigation |
|---|---|
| Corrected income guidance reads as "your spouse's income disqualifies you" | Two-sided copy: a floor for this pathway, a separate ceiling for eligibility. Review this wording specifically, and name marketplace subsidies as the other conversation |
| A fourth income error in the same direction | Check every income claim against the **raw** § 435.603 text. Three have now shipped from summaries **`[C3]`** |
| Hedged copy becomes vague and unhelpful | Every hedge pairs with a concrete next action — what to gather, who to ask. An unactionable hedge transfers anxiety without transferring capability |
| The guard test is written to pass rather than to catch | Prove it red by reintroducing `You&apos;re Exempt`, then revert. A guard never observed failing is not a guard |
| The dead-file allowlist becomes permanent | Part 3 asserts it empties. W0 makes that test pass; nobody has to remember |
| Deleting a wrong section destroys what was true in it | `whatDoesNotCount` is fixed entry by entry — 3 kept, 4 moved. Nothing is dropped |
| The export extraction grows into a rewrite | Pure extraction only. Same output apart from the § 2.5 string change. W8a owns the rewrite |
| Users mid-flow see changed guidance | Copy changes are non-destructive. User count is **structurally unverifiable** — see ADR-0002 — so this is not leaned on as a justification for anything |
