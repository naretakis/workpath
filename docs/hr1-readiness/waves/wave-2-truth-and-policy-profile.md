# Wave 2 — Truth in Copy and the Policy Profile

**Depends on:** W0 (tests prove the threshold refactor changes nothing), W1 (write against current APIs)
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

Delete `whatDoesNotCount` in its current form rather than editing around it — it is wrong in structure,
not just in items.

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

| Location | Now | Becomes |
|---|---|---|
| `AssessmentBadge.tsx:161` | "You're Exempt" | "You may not need to track" |
| `export/page.tsx` | "✓ COMPLIANT" / "✗ NOT COMPLIANT" | "Logged: 46 hours · Threshold: 80 hours" |
| `settings/page.tsx` | "Status: Exempt" / "Must Track Hours" | "Based on your answers: you may be excluded" |
| `results/page.tsx` chip | "Easiest for you" | "May be simplest for you" |

Add the ADR-0003 guard test: no rendered string matches `/\b(you are|you're) (exempt|compliant)\b/i`.

### 2.6 Fix the misleading mode dialog

`ComplianceModeSelector`'s confirmation says "only your income will count toward compliance while in
income mode." That is not true of the law — § 435.552(e) requires combination. The selector is removed
entirely in W7; until then, correct the dialog text so it doesn't state something false.

## Out of scope

No data-model changes — that is W3. No new questions — W4. No month scoping — W5. The mode fork itself
survives until W7; this wave only stops it from lying about what it does.

## Acceptance criteria

- [ ] `src/lib/policy/` exists with `FEDERAL_DEFAULT` and a mandatory `source` citation
- [ ] Guardrail test fails if a policy literal appears outside `src/lib/policy/`
- [ ] W0 characterization tests pass **unchanged**
- [ ] No user-facing content states that unemployment, investment, rental income, or SSDI fail to count
- [ ] Income help explains household-based counting and that more household income helps
- [ ] Work is described as including in-kind and unpaid work
- [ ] No activity definition implies a per-activity 80-hour requirement
- [ ] Guard test rejects "you are exempt" / "you're compliant" strings
- [ ] Export prints logged totals and thresholds, not verdicts
- [ ] Georgia and Wisconsin are not described as out of scope anywhere
- [ ] `ComplianceModeSelector`'s dialog no longer claims income-only counting

## Risks

| Risk | Mitigation |
|---|---|
| Corrected income guidance reads as "your spouse's income disqualifies you" | Explicit copy: it is a floor, more helps. Review this wording specifically |
| Threshold refactor silently changes a value | W0 characterization tests must pass unchanged; that is the gate |
| Hedged copy becomes vague and unhelpful | Pair every hedge with a concrete next action — what to gather, who to ask |
| Users mid-flow see changed guidance | No production users; not a concern this cycle |
