# Gap Analysis: HourKeep vs CMS-2454-IFC

**Date:** August 16, 2026
**Baseline (app):** `docs/audit/codebase-audit-2026-08.md` — commit `75d8e7c`, version 7.2.0
**Baseline (law):** `docs/domain/cms-2454-ifc/rule-extract.md` — 42 CFR §§ 435.550–435.563

Every row is classified by **gap type** and **impact**:

| Gap | Meaning |
|---|---|
| `contradicts` | HourKeep asserts something the rule says is false |
| `missing` | The rule provides for it; HourKeep has nothing |
| `partial` | Present but incomplete or wrong in some cases |
| `stricter` | HourKeep is harsher than the law requires |
| `ok` | Substantially aligned |

| Impact | Meaning |
|---|---|
| `harmful` | Can lead a user to a wrong conclusion about their coverage |
| `blocks` | Prevents a required capability from existing at all |
| `incomplete` | Real gap, low risk of active harm |
| `cosmetic` | Terminology or polish |

### Closure convention

Rows are annotated in place in the **"HourKeep today"** column, because that is the cell a closed row
makes out of date. The `Gap` and `Impact` columns are left at their original values so the record of what
was found stays legible.

| Marker | Meaning |
|---|---|
| ~~struck text~~ · **CLOSED Wx** | No longer true. The annotation names the artifact, so the claim is checkable |
| **PARTIAL Wx** | Genuinely improved, genuinely not finished. **Names what is still open and which wave owns it** |

A row is only marked closed when something runnable, readable, or visible was checked — not when a wave
that intended to close it finished.

**W2a (2026-08-17) closed:** 4.9, 4.10, 5.2, 11.1, 11.2, 11.4, 11.5, 15.7, 15.8, 15.20 — **10 rows**.
**W2a marked partial:** 4.1, 5.1, 5.3, 5.7, 11.3 — **5 rows**.

> **Row 5.7 was itself wrong and is corrected above.** It described the seasonal-worker test as an
> "objective test", which is the framing `validation-findings-2026-08.md` § I7 **retracted** from the
> steering doc as unsupported and restrictive in the user-hostile direction. 26 U.S.C. 45R(d)(5)(B) gives
> **inclusive examples, not a closed test**, and the IFC provides no verification rule for seasonal-worker
> status anywhere. The retraction had been applied to `medicaid-domain-knowledge.md` but not here.

---

## Summary

Counts corrected on validation (2026-08-16). The originals in this table were all understated.

| | Count |
|---|---|
| Total rows | **81** (75 real gaps, 6 `ok`) |
| `contradicts` | **16** — and **every one is also `harmful`**, so the two categories are identical |
| `missing` + `blocks` | **15** |
| `stricter` + `harmful` | **3** |
| `partial` | **26** |
| **Total `harmful`** | **31** |
| **Total `blocks`** | **17** |

The 16 `contradicts` rows: 1.1, 1.3, 2.9, 2.10, 4.1, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.8, 6.3, 8.8, 8.9,
11.1 (the last now fixed).

**Rows added on validation:** see § 15 at the end of this document.

The headline: **HourKeep's income feature, its exemption model, and its education questions are each
wrong in ways that can mislead a user about whether they will keep their coverage.** Those are the
priority. Two whole regimes required by the rule (hardship, noncompliance response) do not exist.

---

## 1. Status model

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 1.1 | Three tiers: excluded (§ 435.554) / mandatory exception (§ 435.553) / hardship (§ 435.555), each with distinct legal effect | One flat `isExempt: boolean` plus an `exemptionCategory` string | `contradicts` | **harmful** |
| 1.2 | Exclusion status is **per-person and durable**; exceptions are **per-month** and trigger on **part or all** of a month | Single point-in-time determination, no month granularity | `missing` | **blocks** |
| 1.3 | § 435.556(c): State **prohibited** from assessing compliance for excluded individuals | `ComplianceModeSelector` and full tracking UI render for "exempt" users; `tracking/page.tsx:553` has only a code comment acknowledging it | `contradicts` | harmful |
| 1.4 | § 435.553(a)(4): prior exclusion is itself a mandatory exception, so losing exclusion deems you compliant for those months | No representation. A user whose child turns 14 sees no protection | `missing` | **blocks** |
| 1.5 | § 435.557(c)(2): exclusion takes precedence even if compliance is also demonstrated | `calculateExemption` short-circuits first, which happens to match — but by accident, not design | `partial` | incomplete |
| 1.6 | Exclusions have different durability. American Indian status **must not be reverified**; others expire | All treated identically; no expiry, no re-screen prompting despite `nextSteps` copy promising it | `partial` | incomplete |
| 1.7 | Screening results must persist | `saveScreening` / `archiveScreening` have **zero callers**. Settings shows a permanent "Start Screening" empty state; export emits `exemptions: []` | `missing` | **blocks** |

## 2. Exclusion categories (§ 435.554)

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 2.1 | **Former foster care children** — under 26, foster care at 18 in any State, Medicaid-enrolled while in care | **No question exists** | `missing` | **harmful** |
| 2.2 | Caregiver cluster: six definitions (parent, guardian, caretaker relative, family caregiver, dependent child, disabled individual) | Two crude booleans: `hasDependentChild13OrYounger`, `isParentGuardianOfDisabled` | `partial` | **harmful** |
| 2.3 | Family caregiver must meet one of three criteria (A resides-with / B relative-not-resident / C non-relative ≥ 80 hrs) | Not modeled | `missing` | **harmful** |
| 2.4 | § 435.554(c)(3)(ii): multiple adults in one residence may **each** qualify | Not modeled; nothing suggests it | `missing` | incomplete |
| 2.5 | Disabled individual = **ADA definition, 28 CFR 35.108**, need not be Medicaid-eligible on that basis | Question text is vague ("someone with a disability"); no definition surfaced | `partial` | incomplete |
| 2.6 | Medically frail: **functional-impairment gate** + one of five categories | Single boolean `isMedicallyFrail`; no gate, no sub-categories | `partial` | **harmful** |
| 2.7 | SUD qualifies **except** stable recovery (5+ years); includes early and sustained recovery; applies without active treatment | Not modeled at all | `missing` | harmful |
| 2.8 | State must maintain a condition list **and** an off-list request process | Not surfaced. A user not on their State's list is never told they can ask | `missing` | harmful |
| 2.9 | SNAP: **member of a household receiving SNAP who is not exempt from** a SNAP work requirement | Asks "Are you in compliance with SNAP **or TANF** work requirements?" — conflates two categories and inverts the SNAP test | `contradicts` | **harmful** |
| 2.10 | TANF: compliant with § 407 requirements — a **separate** category | Merged with SNAP into one question | `contradicts` | harmful |
| 2.11 | Veteran: **temporary or permanent** disability rated 100% | Asks about "rated as total"; omits temporary | `partial` | incomplete |
| 2.12 | Rehab program per 7 U.S.C. 2012(h); States **may** set a minimum time commitment | Boolean only; no State-minimum awareness | `partial` | incomplete |
| 2.13 | American Indian per 42 CFR 447.51 | Present and substantively correct | `ok` | — |
| 2.14 | Pregnant or entitled to postpartum | Present | `ok` | — |
| 2.15 | Inmate of a public institution | Present, but conflated with the § 435.553(b) 3-month look-back exception | `partial` | incomplete |

## 3. Mandatory exceptions (§ 435.553)

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 3.1 | Under 19 | Modelled as "18 or younger" via DOB — equivalent | `ok` | — |
| 3.2 | Medicare Part A entitled/enrolled or Part B enrolled | Present | `ok` | — |
| 3.3 | Described in **any mandatory group at § 1902(a)(10)(A)(i)(I)–(VII)** | Approximated by a single "non-MAGI Medicaid" question — much narrower | `partial` | harmful |
| 3.4 | Inmate **at any point in the 3-month period ending on the first day** of the assessed month | Conflated into the exclusion question; the look-back window is not modeled | `partial` | incomplete |
| 3.5 | Age 65+ | Treated as an "exemption" | `partial` | cosmetic — 65+ is outside § 435.551 entirely, not excepted |
| 3.6 | Exceptions apply for **part or all** of a month | No month granularity | `missing` | **blocks** |

## 4. Qualifying activities (§ 435.552)

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 4.1 | **Work** = for money + **in-kind** + **unpaid** (non-community-service) | ~~`activityDefinitions.work` says "Paid employment"; help text lists unpaid internships as **not** counting~~ · **PARTIAL W2a** — definition now names all three components, "Unpaid internships" removed from `counterExamples` and moved to `examples`, in-kind example added. **Still open:** `Activity["type"]` cannot store in-kind or unpaid work distinctly (→ **W6b**, v8) | `contradicts` | **harmful** |
| 4.2 | **Work program** is a qualifying activity type | `Activity["type"]` is `work \| volunteer \| education`. `workProgram` exists in help text, labels, and colors but **cannot be stored** | `missing` | **blocks** |
| 4.3 | **Education at least half-time = compliant with zero hours**, and may **not** be combined | Asks "How many hours per month do you attend school?" — wrong question for most students | `contradicts` | **harmful** |
| 4.4 | Less-than-half-time education: `creditHours × 3 × 4.33` | No conversion exists | `missing` | **blocks** |
| 4.5 | Enrollment status determined **by the school**; term/recess/end rules | Not modeled | `missing` | incomplete |
| 4.6 | Educational program includes high school and State-approved HS equivalency | Help text covers GED loosely; no program-type model | `partial` | incomplete |
| 4.7 | Community service requires a **structured program**, non-partisan, with org tracking incl. **POC who can confirm hours** | Optional free-text `organization` field only | `partial` | **harmful** (evidence will be rejected) |
| 4.8 | States **may not** restrict community service to § 501(c)(3) | Not asserted either way | `ok` | — |
| 4.9 | Court-ordered community service counts | ~~Help text says nothing; a user may assume it doesn't~~ · **CLOSED W2a** — stated in `activityDefinitions.volunteer.definition` and listed in `examples`. Also added: not restricted to § 501(c)(3), and the point-of-contact requirement that makes evidence acceptable | `missing` | incomplete |
| 4.10 | Work program excludes standalone job search but allows it as **subsidiary** under half the hours | ~~Help text flatly says job searching doesn't count — right conclusion, missing nuance~~ · **CLOSED W2a** — the subsidiary-under-half-the-hours nuance and the unemployment-insurance job search route are both stated, in `activityDefinitions.work.edgeCases` and `.workProgram`. Also added: health-provider-operated and Medicaid § 1915(c)/(i) supported employment do **not** qualify | `partial` | incomplete |
| 4.11 | Combination: hours determined separately then summed | `calculateMonthlySummary` sums work/volunteer/education — structurally close | `partial` | incomplete |

## 5. Income (§ 435.552(f)–(g)) — the largest cluster

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 5.1 | Income = **MAGI-based income for the MAGI-based household** (§ 435.603(d)(e)(f)) | Individual earned income from pay stubs · **PARTIAL W2a** — copy now states the household basis, asks the three screener questions, and defers the total. **Still open:** no household concept in the data model, by design (→ **W4** questions, and the total stays Deferred permanently per ADR-0003) | `contradicts` | **harmful** |
| 5.2 | Countable income includes **unearned** income — unemployment, taxable interest/dividends, rental, SSDI | ~~`helpText.ts:incomeDefinitions.threshold.whatDoesNotCount` lists SSDI, unemployment, investment, and rental income as **not counting**~~ · **CLOSED W2a** — all four moved to `whatCounts`, **plus tax-exempt interest**, which the rule text adds back under 26 U.S.C. 36B(d)(2)(B) and this row itself understated by saying only "taxable". `whatDoesNotCount` kept, fixed entry by entry, now exactly 3 entries | `contradicts` | **harmful** |
| 5.3 | Household-wide: a spouse's income counts; a tax dependent uses the claiming taxpayer's household | No household concept · **PARTIAL W2a** — the married-spouse false negative is now surfaced as an explicit edge case, and the two-sided message (floor for this pathway, separate 133% FPL ceiling → Marketplace) is stated. **Still open:** the screener questions themselves (→ **W4**) | `contradicts` | **harmful** — produces false negatives for married users |
| 5.4 | No pay-period conversion exists in the rule. States determine a monthly figure via existing MAGI methodology | `PAY_PERIOD_MULTIPLIERS` = `{daily: 30, weekly: 4.33, "bi-weekly": 2.17, monthly: 1}`, applied per entry | `contradicts` | **harmful** |
| 5.5 | — | Monthly total sums `monthlyEquivalent` **across every entry**, so four weekly paychecks report ~$2,598 instead of ~$650 | `contradicts` | **harmful** |
| 5.6 | Threshold = `federalMinimumWage × 80`, dynamic; tipped/youth/State wages prohibited | `INCOME_THRESHOLD` derives correctly from constants, but `580` is also hardcoded in the engine, results page, `GettingStartedContextual`, and export | `partial` | incomplete |
| 5.7 | Seasonal worker per 26 U.S.C. 45R(d)(5)(B) / 29 CFR 500.20(s)(1) — seasonal-basis labour **and** holiday retail, as **inclusive examples, not a closed test**. The IFC sets **no verification rule** for seasonal-worker status | ~~Self-declared toggle plus a question about "seasonal work (construction, agriculture, tourism)"~~ · **PARTIAL W2a** — `SeasonalWorkerToggle.tsx:47` invented a "6 months or less per year" threshold that is nowhere in the rule; removed. **Still open:** the averaging window includes the assessed month (→ **W7a**, rows 5.4/5.5) | `partial` | harmful |
| 5.8 | Average over the **6 months preceding** the assessed month — assessed month **excluded** | `getLast6Months` returns the current month **plus five prior** | `contradicts` | **harmful** |
| 5.9 | Divisor is 6, but most States instead use a **reasonably-predictable-changes proration** | Always divides by 6, including months with no data — a 6× understatement in month one, shown as `$0.00` rows as though verified | `partial` | harmful |
| 5.10 | Income evaluated **per month of the review period** | Only the current month | `partial` | blocks |
| 5.11 | **Income-to-hours proxy**: `income ÷ FMW` credited as work hours, combinable | Not implemented. Hours and income are mutually exclusive per month | `stricter` | **harmful** |

## 6. Compliance evaluation

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 6.1 | Seven pathways, **all** must be available, combinable | Per-month binary mode: `"hours"` or `"income"` | `stricter` | **harmful** |
| 6.2 | — | A user with 40 hours and $300 fails both modes; the app never evaluates both to pick the qualifying one | `stricter` | harmful |
| 6.3 | Exclusions and exceptions determine whether compliance is assessed at all | Neither `calculateMonthlySummary` nor `getMonthlyIncomeSummary` consults exclusion or assessment state | `contradicts` | harmful |
| 6.4 | Compliance is assessed **per month across a review period** | Pinned to `new Date()` in seven call sites; `Calendar` owns month state and never lifts it | `missing` | **blocks** |

## 7. Review periods and lookback (§ 435.556)

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 7.1 | Application: 1–3 **consecutive** months **immediately preceding** the application month | `monthsRequired` captured from the notice question (1/2/3/6) with "not sure" silently mapped to 1; never used as a review period | `partial` | blocks |
| 7.2 | Renewal: ≥ 1 month, **not necessarily consecutive**, and States may **not** dictate which months | Not modeled. Nothing tells the user any qualifying month counts | `missing` | **blocks** |
| 7.3 | Multi-month goal tracking | `monthlyCompliance` holds a single current-month entry (`"For now, just check current month"`), so `CompletionMessage` is unreachable for `monthsRequired > 1` | `partial` | incomplete |
| 7.4 | Mid-period transition review period ends the month before entering the CE group | Not modeled | `missing` | incomplete |

## 8. Verification and evidence (§ 435.557)

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 8.1 | Must accept submissions via online, phone, mail, in person, other electronic | Export produces JSON and a plain-text report only. No print-ready or mail-ready artifact | `partial` | incomplete |
| 8.2 | An adult in the household or family, or an authorized representative, may submit | Single-profile app, no representative concept | `missing` | incomplete |
| 8.3 | **From Jan 1, 2028** documentation is required when reasonably available | No awareness of the date; no escalation of document prompting | `missing` | incomplete |
| 8.4 | Named reasonably-available documents: paystubs, community service letter, transcript/class schedule, VA document, SNAP/TANF approval | Document types are `pay-stub`, `volunteer-verification`, `school-enrollment`, `medical-documentation`, `other` — close but missing VA and SNAP/TANF types | `partial` | incomplete |
| 8.5 | Exclusion documentation | No exclusion-linked document capture. The `exemption-documentation` spec is 0/12 complete | `missing` | **blocks** |
| 8.6 | Ex parte first; user only asked when data is unavailable | HourKeep can't know what the State has, but it also never explains ex parte, so users may over-collect | `missing` | cosmetic |
| 8.7 | Export must carry the evidence | `assessmentResults`, all four document tables, `exemptionHistory`, and `seasonalWorkerStatus` are **absent from both export paths** | `missing` | **blocks** |
| 8.8 | — | JSON reads `db.profiles` directly, shipping `dateOfBirth` and `medicaidId` as ciphertext with no key | `contradicts` | harmful |
| 8.9 | — | Readable report re-hardcodes `>= 80` / `>= 580`, **skips seasonal averaging**, and renders only one mode per month — so the report can contradict the UI | `contradicts` | **harmful** |

## 9. Noncompliance (§ 435.558)

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 9.1 | 30 days from receipt; notice **deemed received 5 days after its date** (~35 days) | Domain doc mentioned 30 days; **no workflow, no countdown, no notice record** | `missing` | **blocks** |
| 9.2 | Coverage continues during the window | Not communicated. This is the single most reassuring fact available to a frightened user | `missing` | harmful |
| 9.3 | May show **either** compliance **or** non-applicability | No response-package concept | `missing` | blocks |
| 9.4 | 90-day reconsideration without a new application; no restriction on reapplying | Not communicated | `missing` | harmful |
| 9.5 | Notice states which months are assessed | Not captured | `missing` | incomplete |

## 10. Hardship (§ 435.555)

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 10.1 | Four event types, State option, all-or-none | **Nothing exists.** Listed as "Next" on the roadmap | `missing` | **blocks** |
| 10.2 | Two are automatic (disaster, unemployment) by county; two require a request | — | `missing` | blocks |
| 10.3 | Travel event covers the individual **or their dependent** | — | `missing` | blocks |

## 11. Scope and terminology

| # | Rule | HourKeep today | Gap | Impact |
|---|---|---|---|---|
| 11.1 | **44 jurisdictions (43 States + DC)** in scope, including **Georgia, Tennessee, Wisconsin** plus § 1115 populations in HI, MA, NY, OR, UT | ~~Steering doc listed GA and WI as out of scope; my first correction said 43 and still omitted Tennessee~~ · **CLOSED W2a** — `content/helpText.ts` `programScope.jurisdictions`, rendered by `components/help/RequirementFacts.tsx` | `contradicts` | harmful (fixed on validation) |
| 11.2 | Territories entirely out of scope | ~~Not mentioned~~ · **CLOSED W2a** — `programScope.territories`, § 435.550 | `missing` | cosmetic |
| 11.3 | "Community engagement requirement"; PL 119-21 = "WFTC legislation" | ~~Uses "work requirements" and "HR1" throughout~~ · **PARTIAL W2a** — `TermDefinition.source` union re-cited to `42 CFR 435.550-435.563` (20 fields), file headers rewritten with a statute → CFR → tier mapping. **Still open:** ~30 `// HR1 Reference:` comments in `questions.ts` (→ **W4**, which rewrites those questions) and `getComplianceMethodLabel("exemption")` returning `"Exemption"` (→ **W3**, the union is stored in `assessmentResults`) | `partial` | cosmetic |
| 11.4 | Adult group includes parents | ~~Not stated; the app implies a childless-adult framing~~ · **CLOSED W2a** — `programScope.whoItReaches`, § 435.119; names the 14-or-older case explicitly | `partial` | cosmetic |
| 11.5 | Jan 1, 2027 implementation; Dec 31, 2028 good-faith ceiling | ~~2027 known; 2028 dates absent~~ · **CLOSED W2a** — `programScope.keyDates` carries all three, each with a CFR citation. Jan 1 2028 is stated **with** the "cannot deny solely for missing documentation" caveat | `partial` | cosmetic |
| 11.6 | Renewal every 6 months for the adult group | Steering doc had this from § 71107; unchanged and still broadly right | `ok` | — |

---

## 12. Technical defects that block domain work

From the audit. Listed here because several domain gaps **cannot be closed** until these are fixed.

| Defect | Blocks |
|---|---|
| Month state pinned to `new Date()`; `Calendar` owns its own month | 6.4, 7.1, 7.2, 7.3, 8.7 — all review-period work |
| `Activity["type"]` has no `workProgram` | 4.2 |
| No test runner; zero coverage on the five compliance-critical modules | Every change in sections 4, 5, 6 |
| `DocumentViewer` resolves income document IDs against activity tables (**data loss**) | 8.5, 8.7 — evidence integrity |
| Exemption storage layer has no callers | 1.7, 8.5, 8.7 |
| Export omits documents and assessment results | 8.7 |
| ~2,500 lines of dead code, incl. a parallel unused exemption flow | Slows everything; risks editing the wrong module |
| Thresholds duplicated across 4+ files | ADR-0001 policy profile |
| No data deletion despite the privacy promise | Trust |
| Encryption key in `localStorage`; silent corruption of `dateOfBirth` on key loss | 1.x — DOB feeds age determination |

---

## 13. What HourKeep already gets right

Worth preserving deliberately.

- **Offline-first, local-only storage.** Directly aligned with the population's constraints, and no part of the rule requires transmission.
- **Document capture pipeline.** Camera, compression, metadata, blob storage. This is the core of the evidence mission and it works.
- **Three-tier terminology architecture** (authoritative text → plain language → definitions accordion). The right pattern; it just needs correct content.
- **HR1 citations already in `questions.ts`.** Extending to CFR citations is incremental.
- **`HelpTooltip`** — tooltip on desktop, bottom sheet on mobile, required `ariaLabel`. Good accessible primitive.
- **Softened language from v7.1.0** ("you may be exempt"). Already moving toward the non-adjudication posture.
- **Nine of the ten exclusion categories** have a question, even if several need correcting.
- **Dexie schema versioning** is clean and additive, so a v7 migration is straightforward.
- **`INCOME_THRESHOLD` derived from constants** rather than a literal — the right instinct, just not used consistently.

---

## 14. Ordering conclusion

Three findings drive the wave sequence:

1. **Nothing in sections 4, 5, or 6 can be safely changed without tests.** Those modules decide whether
   a user believes they will keep their coverage.
2. **Month scoping gates roughly a third of the remaining gaps.** It is a technical fix with the largest
   domain unlock.
3. **The factually-wrong copy is cheap to fix and the highest harm-per-hour.** Section 5.2 alone is a
   content edit that removes a materially misleading statement.

That yields: safety net → modernize → correct the copy → policy profile → status model → screening →
month scoping → activity model → income repositioning → unified compliance → export → noncompliance and
hardship → accessibility and privacy.

Detail in `waves/README.md`.

---

## 15. Rows added on validation (2026-08-16)

Full detail in `../audit/validation-findings-2026-08.md`.

| # | Rule | HourKeep today | Gap | Impact | Wave |
|---|---|---|---|---|---|
| 15.1 | § 435.552(e)(2)(i): the agency must use a reasonable method to **allocate work hours between household members** when converting income to hours | ADR-0004's proxy formula credits the full `income ÷ minWage` to the individual — an upper bound, not an estimate | `contradicts` | **harmful** | W7 |
| 15.2 | **TDIU veterans qualify** — 100% compensation for individual unemployability, even with a combined rating below 100% | Question asks about "rated as total" only | `contradicts` | **harmful** | W4 |
| 15.3 | § 435.555(d)(3) unemployment hardship is a **second independent State election** on top of electing hardship | Not modeled; earlier docs said all-four-or-none | `missing` | harmful | W9 |
| 15.4 | § 435.558(b)(2)/(b)(3): "unable to verify" is a **binary State-plan election** (notice concurrent with the renewal form, or after it) | Not modeled. Determines whether the user gets one ~35-day window or two | `missing` | **blocks** | W9 |
| 15.5 | **Option 2 carve-out**: if the renewal form isn't returned and other factors are also unverified, the § 435.558(a) protections **do not apply** | Not modeled. Undercuts the "coverage continues" reassurance | `missing` | **harmful** | W9 |
| 15.6 | § 435.915: applications filed **before** implementation are adjudicated under prior rules | Not modeled. **Reassigned W5 → W2b on 2026-09-02**, see note below | `missing` | incomplete | ~~W5~~ **W2b** |
| 15.7 | § 435.559(c): "renewal **initiated**" = when ex parte review begins; existing enrollees aren't assessed until then | ~~Not modeled, not stated to users. One of the most reassuring facts in the rule~~ · **CLOSED W2a (copy)** — `requirementFacts.already-enrolled-timing`, rendered above the tracking UI. Data modelling **reassigned W5 → W2b on 2026-09-02**, see note below | `missing` | **harmful** | W2a (copy) · **W2b** (data) |

> ### 15.6 and 15.7 were assigned to W5 and W5 could not do them — reassigned to W2b, 2026-09-02
>
> Recorded rather than quietly reassigned, because "the wave closed with all criteria met"
> and "the wave closed the gap rows assigned to it" turned out to be different statements,
> and only the first was true.
>
> **Neither row appears anywhere in `wave-5-month-scoping.md`'s scope or criteria.** W5 was
> scoped as month state, the review-period model, multi-month progress and month
> navigation. The transition rules were never in it. This is an instance of the
> traceability mismatch the readiness README already lists as known gap 2.
>
> **And W5 could not have done them anyway, because both turn on a date W5 has no access
> to.** § 435.915 asks whether an application was filed *before the State's implementation
> date*, and § 435.559(c) asks whether a renewal is the first *initiated on or after* it.
> The implementation date is a **State election** — `state-options.md` lists it, ranging
> from Nebraska's May 1 2026 to the January 1 2027 default — so both comparisons need the
> policy profile that W2b creates. There is nothing to compare against until then.
>
> **Two design notes W2b should carry, both discovered in W5:**
>
> 1. **W5's anchor stores a MONTH (`YYYY-MM`), and § 435.915 turns on a filing DATE.**
>    CMS's own example is an application filed December 15, 2026 and decided January 15,
>    2027, where the State must not evaluate November 2026. A month-granular anchor cannot
>    express "the 15th", so W2b needs either a date-granular filing field or an explicit
>    decision that month granularity is sufficient and why.
> 2. **"Renewal due" and "renewal initiated" are different months, and W5 stores the
>    former.** `ReviewPeriodAnchor.kind === "renewal"` holds the month the renewal is
>    *due*, which is what a user knows. § 435.559(c) triggers on *initiation*, which CMS
>    notes can precede the due date by 60–90 days — so a January 2027 due date can mean a
>    November 2026 initiation. Comparing the stored anchor directly against an
>    implementation date would give the wrong answer in the user-unfavourable direction.
| 15.8 | § 435.557(b): **ex parte first** — States must require SNAP/TANF, incarceration, and education data before asking the individual | ~~Never explained. Users may over-collect, or panic unnecessarily~~ · **CLOSED W2a** — `requirementFacts.ex-parte-first`, citing **§ 435.557(a)–(b)** as a pair because the June 29 2026 correction (91 FR 39028) shifted paragraph designations. Also printed on the export artifact | `missing` | harmful | W2a |
| 15.9 | Medical-frailty documentation may be signed by physicians, NPs, PAs, psychologists, counselors, therapists, clinical social workers, and others credentialed by the State | Not surfaced. Most actionable "what do I go get?" line in the rule | `missing` | harmful | W4 |
| 15.10 | **Absence of claims cannot defeat** the frailty exclusion; States may not consider information older than 12 months | Not surfaced | `missing` | harmful | W4 |
| 15.11 | **Reasonable modifications** required under § 504 / § 1557 / ADA for disabled individuals who do *not* qualify for an exclusion | Nothing. The fallback for everyone who screens out of both tiers | `missing` | **harmful** | W4 |
| 15.12 | **Pregnancy is verified by attestation** — the State must accept it | Not surfaced; user may think they need a document | `missing` | incomplete | W4 |
| 15.13 | **Paid family caregivers qualify** | Silent, inviting the wrong inference | `missing` | harmful | W4 |
| 15.14 | **Guardianship requires a court order** — no pre-2028 latitude | Not surfaced | `missing` | incomplete | W4 |
| 15.15 | The **exclusion has no monthly-duration requirement** | Not modeled | `missing` | incomplete | W3 |
| 15.16 | § 435.558(d)(1): the State must **consider all other bases of eligibility** before denying | Not surfaced | `missing` | harmful | W9a |
| 15.17 | **Appeal and fair-hearing rights** (§ 431.220(a)(1)); ≥10 days advance notice | Nothing anywhere. For someone just denied, the most actionable fact available | `missing` | **harmful** | W9a |
| 15.18 | Notice must state **APTC/PTC consequences** — losing Medicaid may open Exchange subsidies | Not captured | `missing` | harmful | W9a |
| 15.19 | **Hardship expiration** and **loss of exclusion** are each an "action" under § 431.201 requiring notice and fair-hearing rights | Only deselection was noted | `partial` | incomplete | W9 |
| 15.20 | Self-reported **noncompliance** at application can be accepted at face value and support a denial | ~~The app could encourage casual self-reporting of a "no"~~ · **CLOSED W2a** — `requirementFacts.careful-what-you-report`, rendered before the tracking UI. `NoticeQuestion.tsx:358` reframed so the reason to screen first is protective rather than time-saving | `missing` | **harmful** | W2a |
| 15.21 | **Outside § 435.551 entirely** (age 65+) is neither exclusion nor exception | ADR-0002's four-variant union cannot express it | `missing` | cosmetic | W3 |
| 15.22 | § 435.557(f): medically-frail reverification at least every 12 months; attestation once per enrollment period from 2028 | No expiry modeled | `missing` | incomplete | W4 |
| 15.23 | § 435.552(b) work program (iv): **any** DOL or VA veterans program qualifies — CMS dropped the USDA-approval condition | Not surfaced | `missing` | incomplete | W6 |
| 15.24 | Community service must be verifiable **in an auditable manner** | Not modeled | `missing` | incomplete | W6 |
| 15.25 | **Presumptive eligibility**: CE applies to PE/HPE but determinations must rest on **attested** information | Entire pathway unaddressed | `missing` | incomplete | later |
| 15.26 | Noncompliance notice must meet § 435.905(b) accessibility and § 435.918(b) if electronic | Reinforces that accessibility is legal, not polish | `missing` | cosmetic | W10 |
| 15.27 | No **import** path exists, so "export before deleting" is not a recovery mitigation | `deleteAll` in W0 is mitigated by an export that cannot be restored | `missing` | harmful | W0 / W8 |
