# Validation Findings

**Date:** August 16, 2026
**Method:** five independent adversarial sub-agent reviews — primary-source fact-check, codebase
claim verification, independent landscape research, plan-coherence audit, and a red-team review
instructed to attack the strategic decisions.

This document records everything the validation found, including items already folded into the
planning docs. It is the audit trail for why the plan changed.

---

## Summary

| Review | Outcome |
|---|---|
| **Codebase claims** (23 claims) | 20 confirmed, 1 partially wrong, 2 confirmed with corrections. Dead-code estimate accurate (2,527 actual vs ~2,500 stated). Six additional findings the audit missed |
| **Landscape research** | **Three factual errors in my docs**, including a missing state and a missing Federal Register correction notice. Litigation I didn't know about. A federal tool that produces the same artifact as our export |
| **Plan coherence** | 14 contradictions, 14 traceability gaps, 11 dependency errors, 7 counting errors, 12 omissions. One dependency error breaks three consecutive waves |
| **Red team** | Two decisions break outright. One is understated. Five hold, three of them for better reasons than I recorded |
| **Rule extract fact-check** | Re-run in progress after an initial load failure |

**Net:** the legal analysis holds. The MAGI household reading survived four separate attacks. But the
**scope was wrong**, the **deadline was wrong**, the **wave ordering was wrong**, and one **ADR contains
a bug** that would produce the exact harm another ADR exists to prevent.

---

## A. Factual errors in my documents

### A1. State scope — wrong count, and a missing state

**I wrote:** 43 States = 41 expansion + DC, plus Georgia and Wisconsin.
**Correct:** **44 jurisdictions = 43 States + DC.** My arithmetic double-counted DC, and **Tennessee was
missing entirely.**

In June 2026 CMS published a list of § 1115 waiver programs containing individuals subject to the
requirement. It names **three non-expansion states — Georgia, Tennessee, Wisconsin** — plus § 1115
populations inside five expansion states: **Hawaii, Massachusetts, New York, Oregon, Utah**. The IFC's
own burden estimates repeatedly say "43 States and the District of Columbia."

**Out of scope:** Alabama, Florida, Kansas, Mississippi, South Carolina, Texas, Wyoming. Plus all
territories (§ 435.550).

The 43 figure came from a KFF brief published before CMS released the § 1115 list. KFF has since
revised upward.

**Consequence:** the five expansion states with in-scope § 1115 populations matter — an § 1115 enrollee
there may be subject even though the state also runs a state-plan adult group.

### A2. A Federal Register correction notice exists and I missed it

**C1-2026-11094, 91 FR 39028, published June 29, 2026** republishes **§ 435.557 and § 435.558 in their
entirety** — verification and noncompliance, the two sections the app is built around.

The change is editorial: a block of § 435.557(c)(2) text (the requirements for states electing hardship)
appeared in the wrong position in the June 3 print and was relocated, plus a merged-word typo fix. The
substantive policy is identical.

**But paragraph designations inside § 435.557 shifted.** Practitioners are citing the pair as
"91 Fed. Reg. 33348 (June 3, 2026), as corrected at 91 Fed. Reg. 39028 (June 29, 2026)."

**Consequence:** every § 435.557 paragraph-letter citation taken from the June 3 text needs re-checking,
and the extract should adopt the corrected citation form.

### A3. The documentation-hardening date is not national

**I wrote:** January 1, 2028 documentation hardening, as a global constant.
**Correct:** it is January 1, 2028 *federally*, but **eight states will require medical-frailty
documentation from January 2027**: Arkansas, Idaho, Indiana, Iowa, North Carolina, North Dakota, Ohio,
Utah.

Idaho lets new enrollees attest for six months, then requires documentation at renewal and at each
six-month check. North Carolina statute bars accepting self-attestation as the sole evidence for
eligibility verification. The campaign was driven by the Foundation for Government Accountability.

**Consequence:** `documentationRequiredFrom` must be a policy-profile field, not a constant. For a
quarter of the affected states, document capture is urgent in **four months**, not sixteen.

### A4. Outreach notice timing — most states send September 2026, not July

**I wrote:** notices go out July–September 2026, 4–6 months before implementation.
**Correct:** the window is right, but the mapping matters. § 435.561(b) requires notice **3 months
before the effective date plus the number of application lookback months**:

| Application lookback | Notice due | Months before |
|---|---|---|
| 3 months | July 2026 | 6 |
| 2 months | August 2026 | 5 |
| **1 month (~36 states)** | **September 2026** | 4 |

Only Idaho and Indiana were on the July schedule.

**Two further facts I didn't have:**

1. **The IFC broadens the notice population beyond the statute.** States must notify **all** adult-group
   enrollees and all applicable § 1115 enrollees, not just those actually subject — because states
   cannot yet identify who will be excluded. **So receiving a notice carries almost no signal about
   whether the requirement applies to you.**
2. The notice must state **how many lookback months the state will use at renewal** — a state-specific
   number the app can harvest from the user's own notice.

**Consequence:** the app's "did you get a notice?" question is a binary today. As of August 2026 most
users in most states have not received one **and should not have**. A bare yes/no will generate false
alarm at scale in a population CMS's own research found already confused about whether the rules apply.
It needs a third state — "not yet, and that's expected" — with a state-specific expected-arrival month.

### A5. § 435.603(d) excludes some household members' income

**My steering doc said:** "household income is the total income of everyone in the individual's household."

That is CMS's gloss, not the regulation. **§ 435.603(d) excludes the MAGI-based income of children and
tax dependents who are not expected to be required to file a tax return.** A teenager's part-time wages
generally do not count.

This error is **in the user-unfavorable direction** — it would overstate household income and could tell
someone they've met a threshold they haven't, or make the pathway look unreachable. Precisely the class
of error ADR-0003 exists to prevent, sitting in the document that governs all development.

Two related refinements: household composition is **per-person and asymmetric** (§ 435.603(f)) — there is
no single "the household," only *the applicant's* household. And § 435.603(e) has its own exclusions
(scholarship income used for education, certain AI/AN income, lump sums counted only in the month
received).

**Also:** § 435.603 is not extracted anywhere in this repo. The plan's most load-bearing legal conclusion
rests on regulatory text we don't have locally, which means PRD goal G1 ("every user-facing claim traces
to a citation in `rule-extract.md`") is unsatisfiable for the income claims.

### A6. The floor-versus-ceiling message was half-wrong

**The PRD said:** household income guidance risks being misread as "your spouse's income disqualifies
you," mitigated by "it is a floor, not a ceiling."

It is a floor **for community engagement** and there is separately a ceiling **for eligibility**
(133% FPL plus the 5% disregard). A spouse working full time can push a two-person household over the
ceiling — roughly $2,432/month on 2025 figures, and a spouse at $15/hour full time is about $2,600.

That person does not "fail community engagement." They **exit the adult group**, possibly to marketplace
APTC. Different conversation, different advice.

**The correct message is two-sided:** more household income helps this pathway, up to the point where it
ends your eligibility for this group — and that's a separate question for your agency.

The red team confirmed the underlying inversion attack fails cleanly: § 435.556 makes
applicable-individual status a threshold question, so § 435.552(f) is only ever evaluated for people
already inside the ceiling. CMS's own worked example is exactly this scenario — $650/month household
MAGI, above $580, compliant. But the bounded version above is real and the copy must handle it.

### A7. § 435.552(e)(2)(i) requires allocating hours between household members

The codified text ends: *"provided that the agency must use a reasonable method to allocate work hours
between members of the household."*

So the state does **not** credit `householdIncome ÷ minWage` to the individual. It allocates among
household members by a method HourKeep cannot know. **ADR-0004's proxy formula is an upper bound, not an
estimate**, whenever the household has more than one earner. The proposed copy — "your state may be able
to credit about 52 hours" — overstates it.

This is a `contradicts` gap against codified text with **no row in the gap analysis**.

### A8. The renewal-frequency question was not an unresolved conflict

**I wrote:** the IFC says 12-month renewals while its preamble says 6 months; a separate rulemaking is
presumably pending.

**Actual mechanism:** § 71102 of PL 119-21 imposed a moratorium suspending the 2024 Eligibility &
Enrollment final rule's amendments to § 435.916. That left no enforceable renewal regulation to build
on, so the IFC **restores the pre-2024 text** of §§ 431.213(d), 431.231(d), 435.907, 435.911(c),
435.912, 435.916, 435.919, 457.340(d)(1), 457.344, 457.960 — **through October 1, 2034**. The
"12 months and no more frequently" language is simply the restored older regulation.

The 6-month renewal comes from § 1902(e)(14)(L) (added by § 71107), which is **self-executing** and was
implemented by **sub-regulatory guidance — SMD 26-001, March 6, 2026** — not rulemaking. No § 71107
rulemaking exists or is pending.

**Consequence:** 6 months is operative for the adult group (my conclusion was right, my reasoning was
wrong). Two restored regulations matter directly: **§ 435.907** (submission channels) and
**§ 435.916(a)(2)–(3)** (ex parte renewal, pre-populated form, 30 days to respond, reconsideration) are
the **pre-2024 texts**. Any citation to them must be verified against the version printed in the IFC,
not against a current eCFR snapshot.

Practical: 6-month renewals mean roughly twice as many review periods and twice as many chances to be
asked. That is a product cadence assumption, not a footnote.

### A9. Smaller corrections

| Item | Correction |
|---|---|
| MUI major count | Audit says "2 majors"; ADR-0009 says 1. **ADR-0009 is right** — there is no MUI v8. The audit was never annotated |
| Month-pinning count | **6**, not 7, occurrences of `format(new Date(), "yyyy-MM")` in `tracking/page.tsx`. And two components **do** receive a month prop — they're handed hardcoded literals. `IncomeDashboard` already threads it into its queries, so it only needs its caller changed |
| Data-loss bug count | **Four**, not three: DocumentViewer cross-table, income cascade, "Back to Assessment" history destruction, onboarding double-save |
| Onboarding double-save scope | **Onboarding only.** `how-to-hourkeep/page.tsx` has no second `saveAssessmentResult` call. The retake path is fine |
| Early implementers | **Nebraska went first, May 1, 2026** — not July. It has already **disenrolled people**, roughly 200 in the first round. Montana July 1, Arkansas July 1 (soft launch), Iowa December 1 |
| questionId switch count | **Exactly 7**, each enumerating all 12 IDs — not "5–7." Four of the seven are in dead files, so W0's deletion drops it to 3 for free |
| Dead code total | **2,527 lines** confirmed (2,388 in 11 files + 139 in 5 dead exports). Adding `/test-compression` makes it 2,709 |
| Export omissions | **9 of 14 tables**, not 7. I missed `assessmentHistory` and `assessmentProgress` |
| Comment count | Unresolvable. The FR page shows 79,718; the live regulations.gov figure was 44,359 on 2026-08-16. Probably received-vs-posted. **Don't cite a specific number** |

---

## B. The deadline is a month earlier than I stated

§ 435.556(a)(1): the application review period is the **1–3 consecutive months preceding the month of
application**. A state implementing January 1, 2027 assesses **December 2026** for January applicants.

**So the app must be able to hold and export December 2026 activity before December 1, 2026.** The real
national date is roughly **December 1, 2026** — about 3.5 months out, not 4.5.

And for the early states it is **already past**: Nebraska has been live since May 1 and has disenrolled
people; Montana and Arkansas since July 1.

---

## C. Findings that change the plan's shape

### C1. An hours calendar is the wrong primary surface for many users

The strongest finding in the entire validation, and it reframes the product.

$580/month is roughly **32% of the single-person eligibility ceiling** (~$1,800/month on 2025 figures at
138% FPL). Every enrolled adult earning more than a third of their own ceiling demonstrates community
engagement under § 435.552(f)(1) with **zero hours logged** — and their state sees it ex parte through
the same wage data it already used for financial eligibility (§ 435.557(a) names payroll data explicitly).

**This holds at household size 1.** It does not depend on the household argument at all.

CMS's own burden estimate: of the ~20 million in the adult group, about **56% will be verified ex parte**
and the remaining **44% — roughly 8.8 million people — will have to submit information**, at an estimated
**2 hours per beneficiary**. That is HourKeep's addressable population and its benchmark, stated by CMS.

The residual population is defined by **what payroll data misses**: unpaid and in-kind work, family
caregiving below the 80-hour threshold, community service, gig income the state can't match, and
less-than-half-time school. States told CMS they expect to be unable to obtain most volunteer records
and are hand-building forms for it.

Those users don't need a calendar. They need the **community service record schema** (organization name
and address, POC name and contact, activity type, dates, hours) and a **caregiving log**. Both are
currently buried in W6, sixth in the sequence.

**Change:** after screening, fork the user — "your state may already have what it needs" versus "your
state probably can't see this, let's build a record" — and pull the community-service and caregiving
capture surfaces ahead of the general hours calendar.

### C2. The wave ordering was wrong

The red team's argument, which I accept:

**W1 (dependency modernization) at position 2 is indefensible.** Every justification in ADR-0009 is a
cost the *developer* bears — fewer lines to migrate, don't write UI twice, a11y arrives earlier.
Meanwhile the app tells users today that unearned income doesn't count. MUI 7→9 harms nobody. And a
major framework migration is the single item most capable of eating a month with nothing to show.

**W2's dependency on W0 is mostly false.** The threshold refactor needs tests. The **factual copy
corrections do not** — they're text edits with no arithmetic to preserve. Split it: **W2a** (copy, zero
dependencies, ships in days) and **W2b** (policy profile, after W0).

**W5 (month scoping) at position 6 is the worst placement in the plan.** Every use of this app is
retrospective — § 435.556(a)(1) assesses preceding months, § 435.552(g) averages preceding months,
§ 435.553(b) looks back three months, § 435.558 gives ~35 days to document months already past. The user
who most needs HourKeep is holding a notice in February 2027 about December 2026. **If exactly one wave
shipped, it should be W5.**

**W3/W4 (status model and screening) can be demoted.** Under ADR-0003 the app cannot tell the user their
status anyway. The three-tier model's user-visible payoff is better *questions* and better *export
content* — valuable, but not what keeps someone covered in February 2027.

### C3. Scope is not deliverable, and the plan half-admitted it

Two tells: six of eleven waves aren't specified in detail, and "no dates" sits next to a PRD whose
success statement is scoped to a date.

**Minimum viable subset, in order:**

1. **Copy corrections.** Every `contradicts` + `harmful` string. Days.
2. **Remove every verdict string**, plus the render-guard test. Days.
3. **Four data-loss fixes** + `/test-compression` removal.
4. **Month scoping** — lift the month, make the parameter required. Skip `ReviewPeriod`, compound
   indexes, and the `userId` migration.
5. **Print-ready HTML evidence export** including documents, one evaluation path.
6. **Seasonal fix + education half-time cliff + credit-hour conversion.**
7. **Tests alongside 4–6, plus the Dexie migration test.**

**Cut order when time runs short:** W1 entirely (pin versions, note the debt) → ZIP and JSON export →
hardship modeling → medically-frail sub-categorisation → encryption posture. **Never cut:** copy, month
scoping, print export, seasonal fix, education cliff.

PRD goal **G4** ("all ten exclusion categories screenable") does not survive this and shouldn't — most
expensive, least payoff under ADR-0003. **G1 and G2 survive intact**, which is what the PRD's closing
line actually promises.

### C4. ADR-0004's proxy guard is a bug

`workHours === 0` produces the exact harm ADR-0003 exists to prevent. Break it with **CMS's own example**:

A family caregiver provides 55 hours/month to an unrelated non-cohabitant. She fails criterion (C) so
she isn't excluded, but CMS says those hours count as unpaid work. Say she also earns $200 gig income.

- Real position: 55 unpaid hours + ($200 ÷ $7.25 = 27 proxy hours) = **82. Compliant.**
- HourKeep: `workHours = 55 ≠ 0` → `proxyHours = 0` → total 55 → **"short by 25."**

False negative, in the exact population ADR-0004 cites as its reason to exist. Two more breaks: any user
with any unpaid or in-kind hours loses the proxy entirely — and W6 *deliberately broadens* `workHours` to
include those, so **the collision surface grows as the plan is implemented**. And two jobs with hours
documented for only one zeroes the proxy for the other.

**Fix:** guard on **provenance**, not the aggregate. Link income entries to the activity or employer they
came from, then `proxyEligibleIncome = totalIncome − income attributable to logged hours`. If provenance
linking is too much, the safe fallback is **not** `workHours === 0` — it's to show both figures and name
the double-count risk. Under ADR-0003 the app isn't adjudicating, so it doesn't have to pick.

**Also:** ADR-0001's accepted-risk text says defaulting the proxy on costs the user nothing if their
state declines it. Wrong — they lose **the hours they didn't go find**. Keep the default on, but frame it
as belt-and-suspenders: if you can reach 80 without counting on it, do.

### C5. ADR-0003 conflates two different refusals

"Don't assert legal status" is correct — the state decides, it's appealable, and the failure is
asymmetric (a false "you're exempt" gives someone a reason not to respond to a notice).

"Don't compute" was smuggled in alongside it. § 435.552(d)'s credit-hour conversion is **arithmetic CMS
published**. Computing 77.94 from 6 credits is applying a formula, not adjudicating. The state will
compute exactly that number. Refusing to show it isn't humility, it's withholding.

**Replace with a three-way classification** — testable, unlike "never assert a determination":

- **Computed** — deterministic from user inputs via a published formula. Show the number, the formula,
  and the citation. (credit-hour conversion, hours sums, the 30+5 day deadline)
- **Conditional** — deterministic given a state election we don't know. Show it with the election named.
  (the proxy belongs here, not in Computed)
- **Deferred** — depends on facts only the agency holds. Don't compute; ask the screener question, name
  the agency. (medically frail list, household MAGI total, ex parte data)

**And fix the stated reason for refusing household MAGI.** "A wrong number is worse than silence" proves
too much — it would also ban credit-hour conversion. The durable reason is that § 435.603(f) household
composition is asymmetric and per-person, follows tax filing rather than residence, and a tax dependent
inherits the claiming taxpayer's household. You'd have to elicit the user's entire tax filing structure
before summing anything. That's a hard **elicitation** problem, not just missing data.

### C6. The migration ownership conflict breaks three waves

`complianceModes` is called "dead" in ADR-0002 and dropped in W3's migration. **It has five live
readers**, including `lib/storage/income.ts` — one of the five compliance-critical modules. Dropping it
in W3 **breaks the W0 characterization tests** that W2, W5, W6, and W7 all depend on, violating the
"every wave ships" invariant across three consecutive waves.

Compounding: **three waves claim schema changes and two claim version 7.** W3 (new table, `userId`,
indexes, drop 3 tables → v7), W5 (compound indexes → v7 or "pairs with W3"), W6 (education transform →
no version stated).

**Resolution:** consolidate all additive schema changes into **one v7 in W3** — new table, `userId`, all
compound indexes, so W5 needs no migration at all. Keep `complianceModes` alive until **W7**. Give W6 an
explicit **v8** for the education backfill. Note that adding `"workProgram"` to `Activity["type"]` is a
**TypeScript union change, not a schema change** — Dexie indexes `type` but doesn't constrain its values,
so W6's "Dexie migration plus a form option" over-claimed.

### C7. Other dependency errors

| Error | Correction |
|---|---|
| W6 ← W5 is not real; **W6 ← W4 is real and missing** | Nothing in W6 evaluates hours. But W6's caregiving-hours-as-work needs W4's screening answers, and its acceptance criterion is unsatisfiable without them |
| **W9 should split** | Everything except the response package needs W2/W3/W5 and nothing from W7 or W8. "Your coverage continues" — which W9 itself calls the most calming true fact available — sits behind the two largest waves. **W9a** (notice record, countdown, copy) after W5; **W9b** (response package) after W8 |
| **W3 → W9 forward dependency** | ADR-0002's `MonthlyStatus` union requires a `HardshipEvent` type that **is defined nowhere** — not in the ADR, not in the schema, not in `src/` |
| **W10 ← W1 alone is wrong** | Starting W10 after W1 would rebuild the calendar **before W5 makes it controlled**, guaranteeing a second rewrite. W10 also touches both forms, which W6 rewrites. Real edges: W10 ← {W1, W5, W6} |
| **W3/W4 ∥ W5 is not parallelizable** | W5 needs indexes only W3's migration creates |
| **W0 deletes what W4 needs** | W0's "dead type surface" list includes `ExemptionQuestion.options` / `QuestionOption` / `"multipleChoice"` (annotated "UI supports it, no question uses it") and `medicallyFrailDetails`. W4 needs all of them within one or two waves — the family-caregiver criteria and the five medically-frail categories are multiple-choice questions |
| **The `4.33` guardrail conflicts with W6** | W2's no-policy-literals test bans `4.33`, but that's the **Carnegie Unit** constant W6 must implement — statutory arithmetic, not a state election. The list is also inconsistent: it includes `4.33` but not `2.17`, `30`, or `1` |
| W2 ← W1 missing from the table | The graph draws it; the hard-dependency table drops it |

### C8. Counting errors

**Every figure in the gap-analysis summary was wrong.** 81 rows parsed:

| Stated | Actual |
|---|---|
| 7 `contradicts` + `harmful` | **16** |
| 6 `missing` + `blocks` | **15** |
| 2 `stricter` + `harmful` | **3** |
| 11 `partial` | **26** |

Totals: 81 rows, 6 `ok`, 75 real gaps, **31 `harmful`**, **17 `blocks`**. Every `contradicts` row is
also `harmful`, so the two categories are identical — worth stating. ADR-0007 gave a third number
("eight"). The `cosmetic` row mixed an *impact* value into a column of gap-type counts.

Also: `state-options.md`'s schema implements **15** of the 16 state parameters — **good-faith-effort
exemption has no field**, which is the parameter determining whether a user's state is enforcing at all
through December 2028. And `submissionModalities` is in the schema but missing from the federal-default
table, so `FEDERAL_DEFAULT` as documented is not constructible.

### C9. Omissions

| # | Omission | Why it matters |
|---|---|---|
| O1 | **§ 435.559(c): beneficiaries enrolled as of the implementation date aren't assessed until their first renewal on or after it** | In no gap row, no requirement, no wave, not in the steering timeline. One of the most reassuring true facts in the rule — most current enrollees are not assessed in January 2027 — and it determines when a user's first review period even exists |
| O2 | **No representation for "outside § 435.551 entirely"** | Age 65+ isn't excluded or excepted, it's out of scope. ADR-0002's four-variant union can't express it. Gap 3.5 flags it; no wave claims it |
| O3 | **Ex parte is never explained to the user** | § 435.557(b) requires the state to exhaust payroll, 12 months of claims, and encounter data **before asking**. The single largest driver of a user needing to do nothing, and it's nearly free in W2's copy work. Also absent: National Student Clearinghouse verification for students, and § 435.557(g)'s state option not to seek further information on an attested mandatory exception |
| O4 | **Appeal and fair-hearing rights appear nowhere** | ADR-0003 uses appealability as a *justification*, but no wave tells the user they can appeal. For someone just denied, that's the most actionable fact available |
| O5 | **§ 435.558(d)(1): the state must consider all other bases of eligibility before denying** | Cheap, high-value reassurance. No row, no requirement, no wave |
| O6 | **The notice's APTC/PTC consequence** | § 435.558(c)(1)(v) requires it. Losing Medicaid may open Exchange subsidies. W9 omits it |
| O7 | **Medically-frail reverification cadence** | § 435.557(f): reverify at least every 12 months, and from 2028 attestation is once per period of enrollment. Nothing models the expiry |
| O8 | **No import path makes W0's mitigation hollow** | W0 mitigates an irreversible delete-all with "offer an export first." There is no importer anywhere in `src/`. An export that can't be restored isn't a mitigation |
| O9 | **W9 ignores `unemploymentHardshipEffectuated`** | It's automatic *for the individual* but requires state request plus CMS approval, so a state could elect hardship and still have no unemployment event available |
| O10 | **Nothing addresses the outreach notice** | Most users' first contact with this regime is a § 435.561 outreach notice, not a § 435.558 noncompliance notice. That's the actual acquisition event and it's happening now |
| O11 | **"No production users" is asserted three times and never verified** | Load-bearing justification for W3's table drops and W0's delete-all. Plausible has the data. Check before W3 |
| O12 | **Loose ends** | `assessmentHistory` keeps a writer after W0 deletes its only reader; `/exemptions` redirect stub has no disposition; `zod` stays declared and unused |

### C10. Weak acceptance criteria

The plan-coherence review flagged 20. The pattern worth fixing globally: **negative-only criteria pass
by deletion.** W2's "no content states that unemployment fails to count" is satisfied by deleting the
section — destroying the two *true* entries (SSI, child support) along with it. Same for "Georgia and
Wisconsin are not described as out of scope." Every negative criterion needs a positive twin.

Specific ones to fix: W0's "line count drops by ~2,500" (unverifiable — the same wave adds code);
W1's "alters no behavior" (it changes fonts and CSS deliberately); W3's precedence test (untestable
while hardship doesn't exist); W10's blanket "WCAG AA 4.5:1" (wrong threshold — AA is 3:1 for large text
under 1.4.3 and 3:1 for UI components under 1.4.11, and non-text contrast is exactly the
`OfflineIndicator` case W10 is trying to fix).

**And the policy-literal test won't work as specified.** Grepping for `80` matches `width: 80`,
`maxWidth: 480`, `1980`, and the documented `1920×1080` camera constraint. Noise on day one, disabled by
day three. Make it a lint rule scoped to the five domain modules with an allowlist, or drop it — but
don't book it as mechanical enforcement of ADR-0001.

### C11. ADR-0003 violation inside the plan

**W5's acceptance criteria carry a compliance verdict.** "Multi-month progress reflects the real review
period, and `CompletionMessage` is reachable" — `monthsCompleted` is a per-month pass/fail and
`CompletionMessage` renders a "you're done" conclusion.

Worse, W5 sits before W3 and W7, so shipping "months completed" produces a count that **under-reports**
for excepted users, married users on the income pathway, and anyone combining hours with the proxy. For
those users the new multi-month figure is **more wrong than today's single-month view** — a direct breach
of the "every wave ships more correct" invariant.

Related: removing `isCompliant` leaves **`hoursNeeded`** undefined (`= isCompliant ? 0 : 80 - total`).
It's user-facing and survives into W7's proxy example ("needing 28 more"). Decide explicitly.

### C12. Test priorities were wrong

**Characterization tests on the five modules are lower value than I claimed.** A characterization test
proves *unintended* changes didn't happen — but we intend to change essentially all behavior in all five.
`calculations.ts` is 55 lines with three activity types and W6 replaces the type set;
`payPeriodConversion` gets demoted out of compliance logic; `recommendationEngine.complianceStatus` is
deleted. Pinning behavior we've decided to discard produces a diff with no signal.

**Promote to Tier 1:** the **Dexie v6→v7 migration test** — the one place where being wrong destroys data
irreversibly and where correct behavior *is* "nothing changes." And the **no-verdict render test**,
currently filed under Tier 3 "encouraged," which mechanically enforces ADR-0003 forever and is the
cheapest high-value test in the plan.

---

## D. New external facts that change design

### D1. CMS ships a tool that produces our artifact

**Emmy App** ([cms.gov/medicaid-chip/community-engagement-support/eligibility-made-easy](https://www.cms.gov/medicaid-chip/community-engagement-support/eligibility-made-easy)) —
open-source, federal, free, "numerous states have successfully piloted." Repo:
[DSACMS/iv-cbv-payroll](https://github.com/DSACMS/iv-cbv-payroll), Rails, actively developed, releases
on a two-week cadence.

Its stated output: guides users through reporting community engagement activities and income, connects
to trusted data sources to avoid re-asking, and **generates a standardized, audit-ready evidence package
for the state.** That is the same artifact ADR-0006 designs.

**Emmy API** (`CMSgov/emmy-api`) connects states to **VA Lighthouse** (veteran disability, free to
states) and the **National Student Clearinghouse**. Folded into the Federal Data Services Hub in July 2026.

**Change:** read Emmy's docs before freezing the export schema. Target its evidence-package shape where a
state has adopted it rather than inventing a format.

### D2. There is active litigation aimed at the hardest part of our screener

**Commonwealth of Massachusetts et al. v. Oz et al.**, No. 1:26-cv-12962 (D. Mass.), filed June 29, 2026.
26 plaintiffs including Wisconsin — further confirmation it's in scope. Claims: APA contrary to law, APA
arbitrary and capricious, Spending Clause.

**Target: the medically frail provisions** — specifically the functional-impairment gate layered on top
of a qualifying condition, and the narrowing of self-attestation.

**Preliminary injunction denied July 29–30, 2026** (Judge Stearns). **Summary judgment hearing set for
October 20, 2026** — before the January 1 deadline.

**No injunction is in effect; the rule is fully operative.** But build the medically-frail logic behind
the policy profile expecting it to move.

### D3. A direct competitor exists

**WorkTrack360** — sold to states and MCOs. Member-facing flow overlapping HourKeep almost completely:
multichannel nudges, guided documentation by activity category, timesheet logging, **OCR of pay stubs**,
batch entry for multiple employers, progress against threshold, exemption request routing, and an
exportable case-level evidence packet with a timestamped audit trail.

It's sold to agencies, not individuals — **that's the differentiation.** Also: its marketing lists a
domestic violence exemption, which **does not exist in the federal rule.** Vendor category lists are
unreliable.

### D4. What states actually accept, and it includes fax

Missouri is the most explicit: **portal upload, mail, fax, or in person.** No state publishes MIME types
or size limits.

**Change:** the export must survive **print and fax**, not just portal upload. A single flat
black-and-white-legible PDF per month, no color dependency, no multi-file bundle, each page
self-identifying with name, case number, month, and activity type.

### D5. What states will already have, and what they won't

Data sources states are wiring up: existing SNAP/TANF (31 states), quarterly wage data (25), Equifax
Work Number (25), state unemployment (23), BENDEX/SDX (22). New: National Student Clearinghouse (10),
VA Benefit Summary Letter (11), corrections data (10), consent-based payroll (8), gig-platform and bank
connections (7), TANF community service hours (7).

State focus groups estimated data matching resolves only **60–80%** of enrollees, with claims data
unavailable for new applicants and probably at the first six-month renewal.

**So: W-2 payroll income is largely solved by the state. Community service, family caregiving, in-kind
work, unpaid work, and self-employment are not.** Weight the product there. This independently confirms C1.

### D6. Two CMS artifacts postdating my research

- **IFC Overview Slide Deck**, posted 07/27/2026 (`medicaid.gov/medicaid/downloads/ce-requirement-ifc-deck.pdf`)
- **Beneficiary message guidance grounded in qualitative research**
  (`medicaid.gov/.../community-engagement/resources/Community-Engagement-messaging.pdf`, created May 2026,
  not linked from the main CE page). Contains a **"Language to Avoid"** section, and research findings
  that participants lacked awareness and **could not determine whether they qualified for exemptions**.
  Directly usable for copy work, and it validates the three-tier question architecture.

**Still not published:** the SPA/election template (draft PRA package only), the verification-plan
template (draft CE supplement to the MAGI plan), and — loudest gap — **any medically-frail condition list
guidance.** States are explicitly waiting on it.

### D7. One real state medically-frail list exists

**Georgia's Board of Community Health approved one the week of August 11–13, 2026.** Two-tier structure
worth copying conceptually: **automatic** exemption for some conditions, **case-by-case** consideration
for others. HIV was **omitted from the first draft** and added only after advocacy pressure.

**Two implications:** "is my condition on the list?" is not a yes/no — surface the case-by-case path. And
Georgia's initial omission is concrete evidence that telling users the off-list request path exists is
the right call.

Ten states have identified ICD-10 and CPT codes for claims-based frailty detection, but those are
internal data-matching specs, not the published auditable lists § 435.554(c)(5)(ii) requires.

### D8. A state agency has already stated our product thesis

Missouri's public FAQ tells members, in substance: don't send anything now; keep records of work,
self-employment, school, training, volunteer service and income; keep records of why you may be excluded;
wait for a letter.

**Frame the app as "be ready for when they ask," not "report your hours."**

### D9. Georgia's scope is unsettled

The IFC forces Georgia to add exclusions Pathways never had — parents of children 13 and under, former
foster youth, medically frail — and DCH projects enrollment rising by ~100,000 against ~20,000 currently
covered. It is asking CMS to raise the federal match from ~67% to 90%. Pathways' extension **expires
December 31, 2026**; public comment on a waiver modification is open through **September 14, 2026**.

### D10. Ground truth from a live implementation

From an August 2026 Nebraska Appleseed panel: 90-minute call-center waits, no added staff, a pregnant
applicant wrongly denied because pregnancy was missed, advocates unable to explain the rules.

**And a caution:** that coverage reported the IFC bars attestation-based frailty exemptions. **It does
not** — a penalty-of-perjury statement is permitted each time through 2027 and once per enrollment period
from January 1, 2028. Even advocacy organizations are getting this wrong, which raises the bar on our
copy accuracy.

---

## E. What survived

Recorded because it's as important as what broke.

| Decision | Verdict |
|---|---|
| **The MAGI household reading** | **Airtight.** Four separate attacks failed: the individual-income reading (killed by two preamble passages and the § 1902(e)(14)(A) chain), the § 435.603 subtlety, the statutory-text argument, and the ineligibility inversion. What would change it: a final rule adding an (f)(3) carve-out, or a court vacating |
| **Ban on status assertions** (ADR-0003, in part) | Holds. § 431.220(a)(1) appealability, § 435.557(a) data we can't see, and the asymmetric failure mode — a false "you're exempt" gives someone a reason not to respond to a notice |
| **Removing the hours/income mode fork** (ADR-0004) | Holds. § 435.552(e) requires summation and (e)(2) permits income→hours. The fork is stricter than the law |
| **Tests before compliance-math changes** (ADR-0007) | Holds. `income.ts:110` — `totalIncome / 6` over a window documented as *including* the current month, producing a too-low average. Change that without a test and you can't tell whether you fixed it or moved it |
| **Rejecting the MAGI API** (ADR-0008) | Holds, but **on different grounds.** The offline-first argument I led with is self-imposed and one policy reversal from void. What actually settles it: it tests the eligibility *ceiling* not the CE *floor*, and `Medicaid Household` / `Calculated Income` are **inputs** — it doesn't do the hard part. Reorder the reasons and drop the stale-FPL reason, which the ADR itself concedes does no work |
| **The audit's 23 code claims** | 20 confirmed outright, 2 confirmed with corrections, 1 partially wrong (the month-pinning count) |
| **The dead-code estimate** | 2,527 actual against ~2,500 stated — accurate to within 1% |
| **Steering doc vs rule extract** | No contradictions across every substantive claim checked. In one place the steering doc is **more faithful than the ADRs** — it states the proxy's "and the agency lacks hours documentation" condition that ADR-0004 approximates as `workHours === 0` |

---

## F. Also worth knowing

**Six findings the audit missed**, from the codebase review:

1. `/test-compression` ships to production with no `NODE_ENV` guard — 182 lines, publicly reachable,
   precached by the service worker, and it counts as an App Router entry point.
2. **Zod validation never runs on profile input.** `profileSchema` being dead means there's a 56-line
   declarative contract for the app's most sensitive input (DOB, Medicaid ID) that is never enforced.
   Framing it as "unused export" undersells it — it's a missing validation boundary.
3. The DocumentViewer bug is **worse than described**: because both tables are independent `++id`
   sequences starting at 1, it doesn't throw "not found" — it reliably resolves to a *real, unrelated*
   document. And `IncomeEntryForm`'s `onDelete` optimistically removes the income document from local
   state, so the user sees "deleted," the income document survives, and an activity document is gone.
4. Income-entry deletion leaks **blobs**, not just metadata — an unbounded quota leak on a device where
   `saveIncomeDocument` already refuses below 50MB free.
5. `getMonthlyIncomeSummary` is an **N+1** — six sequential IndexedDB queries per summary on the
   seasonal path, called on every mount and after every save.
6. The `localStorage` key and IndexedDB ciphertext have **different eviction semantics in every major
   browser** (Safari ITP evicts `localStorage` after 7 days of inactivity while IndexedDB persists
   longer; several "clear site data" paths hit one but not the other). When they diverge, `getProfile`
   silently returns ciphertext as a date of birth.

**Citation hygiene:** the IFC itself has internal cross-reference drift — the medically-frail definition
lives at § 435.554(c)(5) but is internally cross-referenced as `(a)(5)(i)(A)`–`(E)`, and the
family-caregiver criteria at `(c)(3)` are cross-referenced as `(c)(1)(i)(A)`–`(C)`. Since ADR-0007 makes
CFR citations in test names the audit trail, pin **citation plus FR page** so a renumbering in the final
rule is a diff rather than silent divergence.

**ADR-0006's attestation block invites a problem.** It cites § 435.557(f)(1)'s penalty-of-perjury
statements to justify a signature line. But from January 1, 2028 a self-attestation is accepted **only
once per period of enrollment**. A generic signature line framed as an attestation could burn a user's
one permitted attestation on the wrong document. Make it a plain signature-and-date line with no
attestation language.

**ADR-0005 has the past/present distinction backwards.** It says the app shouldn't imply a past month can
be "improved." But a past month *can* be improved — not by working more hours, but by **finding evidence
for hours already worked**, which is exactly what a § 435.558 notice asks for. Past months should be
**more** actionable, not less.

**Sixteen state-election hedges will make the app unreadable.** Cap the deferrals per screen and hedge
only the elections that change user behavior — lookback length, hardship availability, proxy
availability — not all sixteen.

**Audit defect IDs collide with gap-analysis row IDs.** Both documents have a section 4 numbered `4.N`,
and the disambiguating "audit " prefix is trivially dropped. Renumber the audit defects.

---

## G. Rule-extract fact-check (re-run)

The dedicated primary-source check completed on re-run. It verified an extensive list of claims
verbatim — including the § 435.556 "whether or not consecutive" interpretation, § 435.559(c),
§ 435.552(e)(2)(i) with its household-allocation proviso, all eight reliable-information sources, the
full medically-frail construction, the Carnegie Unit formula, and every seasonal worked example.

It also found **four substantive errors, two unsupported claims, and 27 omissions.**

### G1. Errors

**The veteran exclusion is under-inclusive — this one produces false negatives.**
I wrote "a temporary or permanent disability rated 100 percent (total)." The IFC adds a category I
dropped: **TDIU — total disability based on individual unemployability.** A veteran who receives 100%
compensation through TDIU qualifies **even though their combined rating is below 100%**, and must be
treated the same as veterans with a 100% combined rating.

A screener asking "is your rating 100%?" **wrongly excludes TDIU veterans.** Also missed: a
permanent-and-total rating **may not be reverified**, while a **temporary** total rating **must be
reverified at least every 12 months.**

**"All four hardship events or none" is wrong for the unemployment event.**
The all-or-nothing rule bars a state from making one circumstance the *exclusive* basis. But
§ 435.555(d)(3) is a **second, independent election on top of** the hardship election: the IFC says a
state that has elected hardship "is not required to implement the unemployment-related exception when
conditions are present," and that implementing it "is optional for States that elect the short-term
hardship exception."

My § 5 and my own § 10 row contradicted each other. **Never tell someone in an 8%-unemployment county
that an exception applies.**

**§ 435.558(b)(2) and (b)(3) are State-plan options, not disjunctive triggers.**
I described the renewal "unable to verify" test as "reliable information insufficient **or** the form
isn't returned." It is actually a **binary state election documented in the State plan**:

- **Option 1** — the noncompliance notice goes out **concurrently with** the renewal form.
- **Option 2** — the notice goes out **only after** the form period elapses.

Not cosmetic: under Option 1 the 30-day clock starts with the renewal form; under Option 2 the person
gets **two sequential ≥30-day windows**. Two missing state options (renewal and more-frequent
verification each have the same binary).

**§ 435.556(b) is scoped to enrolled beneficiaries only.** It caps the period at (a)(2)(i)/(ii)/(iii) —
it does **not** reach (a)(1) applications. My phrasing implied a cap on the application lookback that
the text doesn't place there.

### G2. Unsupported claims

**"Seasonal worker is an objective legal test, not self-declaration."** Nothing supports this. The
26 U.S.C. 45R(d)(5)(B) categories are **inclusive examples**, not a closed test, and CMS provides **no
verification rule for seasonal-worker status anywhere.** I overstated it, and the correction is
user-favorable — the category is broader and softer than I described.

**The § 10 "federal default" column is my invention, not the rule.** The rule states no defaults. Two of
mine are affirmatively counter-indicated: the documentation posture (CMS says documentation "will
generally be available" and **encourages** states to require it rather than use the § 435.557(g)(1)
option), and the income-to-hours proxy default. Relabel the column **"assumption pending State data."**

### G3. Omissions that change product design

| # | Omission | Why it matters |
|---|---|---|
| **G3.1** | **Applications filed before the implementation date are adjudicated under the prior rules** (§ 435.915). CMS's example: filed Dec 15 2026, decided Jan 15 2027 → the state **must not** evaluate community engagement for November 2026 | Directly qualifies the "deadline is December 1, 2026" conclusion in § B. Someone who applies in December 2026 is not assessed on December activity |
| **G3.2** | **"Renewal initiated" means when the state begins ex parte review**, not when the eligibility period ends. CMS explicitly rejected an end-date trigger because renewals due January 31, 2027 would otherwise start as early as **November 2026** | A beneficiary whose renewal is due January or February 2027 may not face community engagement until **mid-2027**. Combined with G3.1, the January 1 cliff is much softer than the plan assumes |
| **G3.3** | **Who can sign medical-frailty documentation**: physicians, nurse practitioners, physician assistants, psychologists, counselors and therapists, clinical social workers, and others credentialed by the state | The reviewer called this "the single most actionable line in the rule for a 'what do I go get?' flow." It was entirely absent |
| **G3.4** | **Absence of claims cannot defeat the frailty exclusion.** Neither missing claims generally, nor missing particular claim types, may be used to find someone ineligible. And states **may not consider information older than 12 months** | Removes a fear a user would reasonably have — "I haven't been to a doctor, so I can't prove it" |
| **G3.5** | **Reasonable modifications are required** for disabled individuals who do **not** qualify for an exclusion, under § 504, § 1557, and the ADA. "We remind States that they are required to provide such reasonable modifications" | This is the fallback for every user who screens out of both exclusion and exception. Nothing in the plan mentioned it |
| **G3.6** | **Pregnancy is verified by attestation** — the state **must accept** it unless it holds inconsistent information | A user needs no document for this |
| **G3.7** | **Paid family caregivers qualify.** The criteria apply "regardless of whether the individual is a paid or an unpaid family caregiver" | My silence invited the wrong inference |
| **G3.8** | **The exclusion has no monthly-duration requirement.** "There is no requirement that an individual who is a specified excluded individual meet that definition for the required number of months during the review period" | The cleanest statement of why Tier 1 is categorically different from Tier 2 |
| **G3.9** | **Self-reported noncompliance at application can be accepted at face value.** A state may accept a declaration under penalty of perjury that the person does *not* meet the criteria, and be considered to have verified noncompliance | A user who answers "no, I didn't have 80 hours" **can be denied on that answer.** The app must not encourage casual self-reporting of noncompliance |
| **G3.10** | **The Option 2 carve-out strips the 30-day window.** If the renewal form isn't returned and factors *other than* community engagement are also unverified, the § 435.558(a) noncompliance procedures **do not apply** — disenrollment happens for procedural reasons with no notice and no 30-day window | Undercuts the reassurance in W9. Returning the renewal form matters more than the app currently implies |
| **G3.11** | **Guardianship requires a court order** — the pre-2028 latitude to accept non-documentary information explicitly **does not apply** to verifying guardianship | The one exclusion basis where a document is mandatory now |
| **G3.12** | **Hardship expiration and loss of exclusion are each an "action"** under § 431.201, requiring ≥10 days advance notice and fair-hearing rights, with § 435.561(c) outreach content attached | I listed loss-of-exclusion only as an outreach trigger |
| **G3.13** | **Automatic hardship is stronger than "no request required"**: the state must apply it "without requesting any additional information" and "without conducting any evaluation of the extent to which any such applicable individuals are affected" | Stronger reassurance than I recorded |
| **G3.14** | **FFCC prong 2 qualifier**: not *enrolled* in a group described in (I)–(VII) "**even if they meet the eligibility requirements for such group**" | User-favorable; I dropped it |
| **G3.15** | **Work program (iv) is broader than its SNAP source.** "Any employment and training program of the Department of Labor or Veterans Affairs that serves veterans must be an approved work program" — CMS dropped the USDA-approval condition | Every DOL/VA veterans program qualifies without further approval |
| **G3.16** | **States must require** SNAP and TANF information, **incarceration data** from correctional facilities, and **education information** from state colleges, community colleges, high school equivalency programs, and high schools | Tells a user what the state should already have and shouldn't be asking them for. Feeds the ex parte explanation |
| **G3.17** | **Community-service capture schema is larger than the reg text**, and the state must verify hours "in an **auditable manner** — a manner that yields records that can be produced for audit" | Confirms the wider schema and adds the auditability standard |
| **G3.18** | **Presumptive eligibility**: community engagement applies to PE/HPE for the adult group, but determinations "**must continue to be based on attested information from the applicant**" | An entire pathway the extract never mentioned |
| **G3.19** | **Noncompliance notice accessibility**: § 435.905(b) (limited English proficiency, disabilities) and, if electronic, § 435.918(b) | Reinforces that accessibility is a legal requirement, not polish |
| **G3.20** | **§ 435.557(f)(1)(ii)(B)**: declaring frailty on a **new basis** in the same enrollment period after using an attestation requires verification — no second attestation. Reverification "could be 6 months" even in a 12-month state | The attestation budget is tighter than I described |

### G4. Eight missing state options

Beyond the two Option 1 / Option 2 elections above:

- **§ 435.557(g)(1)** election not to seek further information on an attested mandatory exception — in my
  § 7.8 prose but missing from the table that feeds the policy profile. CMS **encourages states not to
  use it**.
- **The state determines which activities qualify as community service** — a material per-state variable
  for a volunteering tracker.
- **The state determines what non-documentary information is "sufficient."**
- **Reconsideration period for non-MAGI enrollees** is a state option; my table treated reconsideration
  as uniform.
- **PE for the adult group / HPE for § 1115 populations.**
- **States may reverify medical frailty more often than every 12 months** (e.g. at each renewal).

And two rows in my table are **not** state elections at all: the **federal minimum wage** (statutory) and
the **90-day reconsideration period** (a federal floor — the only election is to elect *longer*).

### G5. Worked examples worth lifting into copy

- **Education recess.** High-school graduate May 15 → community college starts August 21 → applies July 1
  with a 1-month lookback → June is recess → pre-break full-time status governs → **compliant.** The best
  available illustration of the § 435.552(c)(2) rule.
- **Combination with mixed evidence.** 40 work hours verified ex parte + 42 community-service hours from
  user-submitted documents = 82 → compliant. And the state **must not request** documentation when the
  ex parte hours already suffice.
- **More-frequent verification.** Verification in month 3 of a 6-month period → review period is months
  1–3 → the individual may qualify by demonstrating in **any one** of the three.
- **The RPC inversion.** Employed April–September at $1,500/month: under a 12-month
  reasonably-predictable-changes methodology the monthly figure is **$750** and clears $580; with no RPC
  election, the July → June → December–May average is **$500** and fails. **Same person, opposite answer,
  depending purely on a state election.** My § 2.7 presented both paths without showing they invert — and
  that inversion is the whole point for a seasonal worker deciding what to track.

### G6. Citation hygiene

The § 435.552(f)(2) and (g)(2) regulatory text says only "as defined at § 435.603" — **no subsection.**
The `(e)` / `(d) and (f)` breakdown is **preamble**, and the preamble itself miscites "(g)(3)," a
paragraph that does not exist. My extract presented the preamble breakdown in a form that implies
regulatory text. Keep the substance, label the source.

The IFC also contains internal cross-reference drift: § 435.554(c)(3) points to "(c)(1)(i)(A) through
(C)" when it means (c)(3)(i); § 435.554(c)(5)(ii) points to "(a)(5)(i)(A) through (E)" when it means
(c)(5)(i); and one passage says "January 31, 2027" where it means December 31, 2027.

---

## H. Post-validation corrections and a second look at Emmy (2026-08-16, later same day)

### H1. Emmy: the "actively developed" characterization was too strong, and the "being canned" rumor doesn't match the commit log

A rumor surfaced that Emmy is being discontinued, with "no commits in three months" cited. **Checked both
repos directly via the GitHub API.** The commit-count claim is wrong; the underlying concern may not be.

| | `DSACMS/iv-cbv-payroll` (Emmy App) | `CMSgov/emmy-api` |
|---|---|---|
| Last push | **2026-08-14** (two days ago) | 2026-08-03 |
| Latest release | **v0.2.0, 2026-08-12** | — |
| Commits, last 8 weeks | 18, 21, 15, 15, 11, 14, 6, **27** | steady but lighter |
| Archived / disabled | no / no | no / no |
| Open issues | 27 | — |

Recent commit subjects are squarely community-engagement work: *"Send activity documents over HTTP,"*
*"Implement shared event filing for Emmy CE,"* *"Support sending documents to agencies via S3,"* *"Enable CMS
dev/test deployments."* That is someone actively building the CE document-submission pipeline and deploying
it to CMS Cloud. **Not a project being wound down in code.**

**But the earlier characterization was still overstated.** CMS's own repo description reads: *"Eligibility
Made Easy (Emmy) using Consent-Based Verification (CBV) is a **prototype** that allows benefit applicants to
verify their income directly using payroll providers. It is **currently being piloted for testing and
validation purposes**."*

The first research pass reported "numerous states have successfully piloted," which implied production
readiness. **A prototype in pilot is exactly the class of federal project that gets cancelled**, and heavy
commit activity right up to the cancellation date is the normal shape of that outcome. Both the activity data
and the rumor can be true simultaneously.

**What I can verify:** commit activity through 2026-08-14. **What I cannot verify:** internal CMS
programmatic decisions. Treat the rumor as live and unresolved.

**Design consequence, folded into ADR-0006.** Read Emmy's schema as prior art — matching an emerging federal
field convention costs nothing. **Do not couple to it.** Target the **§ 435.907(a) channels States must
accept**, which are statutory and survive either outcome. Recheck the repos before W8a starts.

### H2. Eight validation findings had not been folded in on the first pass

Found by auditing the docs against this document rather than assuming. All now addressed:

| # | Finding | Fix |
|---|---|---|
| 1 | `goodFaithEffortExemptionThrough` missing from the schema — the parameter determining whether a user's State is enforcing **at all** through 2028 | Added |
| 2 | `documentationRequiredFrom` documented as a constant | Now a per-State field, with the eight January-2027 States named |
| 3 | `submissionModalities` in the schema but absent from the federal-default table, so `FEDERAL_DEFAULT` was not constructible | Added, **including `fax`** |
| 4 | Tennessee missing from the per-State tracker; Nebraska's May 1 live date wrong | Tracker rebuilt: 17 States, KFF aggregates, the eight documentation States, the three States declining specific hardship events |
| 5 | No way to distinguish "we don't know Idaho's election" from "CMS's interpretation could move" | Added `interpretiveRisk`, seeded with the MAGI-household reading, the consecutive-months reading, and the medically-frail gate under challenge in *Massachusetts v. Oz* |
| 6 | ADR-0001's accepted-risk text said the user "loses nothing" if their State declines the proxy | Corrected — they lose the hours they didn't go find |
| 7 | The `4.33` guardrail banned the **Carnegie Unit constant** W6a must implement, and the literal list was inconsistent | Narrowed to a lint rule scoped to the five domain modules with an allowlist; Carnegie constant explicitly exempt |
| 8 | ADR-0005 had the past-month framing backwards | Reversed — past months are the **primary** case and should prompt harder, since that is what a § 435.558 notice asks for |

Also added on this pass: **five new State options** to the schema (`unableToVerifyAtRenewal`,
`unableToVerifyAtVerification`, `skipFurtherInfoOnAttestedException`, `frailtyReverificationMonths`,
`frailtyListStructure`, `presumptiveEligibilityForAdultGroup`), and ADR-0006's "attestation block" replaced
with a **plain signature line** — because from January 2028 (January 2027 in eight States) a self-attestation
of medical frailty is accepted only **once per period of enrollment**, and a generic attestation block could
burn it on the wrong document.

### H3. Still outstanding — carry into the waves

Not defects, but real gaps I am choosing not to close in planning:

1. ~~**`§ 435.603` is still not extracted.**~~ — **done, commit `b9b9594`.** But see **§ I1**: extracting it
   was not sufficient, because `rule-extract.md` kept the retracted gloss and is what the wave prompt points
   at. Household claims cite `supporting-regs/README.md` § 1.
2. **PRD requirement-to-wave traceability** still has the mismatches the coherence review found (R1.6 → W3
   not W4; R6.3/R6.8 both citing gap 8.9; R8.2's TDD clause spanning waves; R1.5 assigning export work to
   W3; 2.11 and 2.12 with no acceptance criteria). Cosmetic for execution, worth a pass before W3.
3. **The ten specific weak acceptance criteria** the review named are still weak. A global rule was added to
   the Definition of Done ("every negative criterion needs a positive twin"), but the individual criteria in
   W3, W4, W5, W6, W8, W9, and W10 were not rewritten. Fix each when its wave starts.
4. **The split wave files** (W2a/W2b, W6a/W6b, W7a/W7b, W8a/W8b, W9a/W9b) do not exist. The combined
   `wave-2`, `wave-6`, `wave-7`, `wave-8`, `wave-9` files are the source. Write each half at its start.
5. **"No production users" is still unverified.** Plausible has the data. **Check before W0's delete-all and
   W3's table drops** — both are destructive if the assumption is wrong.

---

## I. W2a dry run (2026-08-16, later still)

**Method:** the W2a kickoff prompt was handed to an independent sub-agent under a read-only constraint,
instructed to do the reading, form the plan, and attack the prompt, the steering docs, and the wave ordering.
No files were modified. Every finding below was then re-verified against the files before being accepted —
two were rejected.

**Why it mattered:** twelve real problems, one of which would have written a legally wrong statement into the
most harmful field in the app. The steering docs' verification discipline is what found it, applied to the
document the steering docs point at.

### I1. `rule-extract.md` carried the retracted household-income claim — **highest severity**

Line 217 read: "Household income under § 435.603(d) and (f) is the **total income of everyone in the
household**." That is the exact claim § A5 above identified as wrong and user-unfavorable. It survived because
§ A5's correction was applied to the **steering doc** and never to the **extract** — and the extract is what
the W2a prompt designated as "the authority. Every claim you write traces to a citation here."

The line is a faithful quote of CMS's preamble at `2026-11094.txt:674`, which makes it a **source-tier**
error, not a transcription error: preamble gloss presented as regulatory text.

**Fixed.** § 2.6 now states (d)(1) plus the (d)(2) filing-threshold exclusion and (f)'s asymmetry, carries a
source-tier warning, and routes household claims to `supporting-regs/README.md` § 1. The header caveat, which
still said § 435.603 was "not present in this repo," is corrected too.

### I2. The wave ordering was circular

`waves/README.md` listed W2a as having **no dependencies**. It also listed W2a as shipping the
**no-verdict render test**, which ADR-0007 promotes to Tier 1 and assigns explicitly to W2a. There is no test
runner — W0 adds it, and W0 is sequenced *after* W2a.

Compounding: W2a's copy work reaches `lib/exemptions/calculator.ts` and
`lib/assessment/recommendationEngine.ts`, both Tier-1 TDD modules where a failing test is required first.

**Fixed** by extracting a **W0-slice** — Vitest, `fake-indexeddb`, testing-library, a `test` script, and the
orphaned `imageCompression.test.ts` made to run. Nothing else. Recorded in `waves/README.md`, ADR-0007, and
the wave-2 header.

### I3. Three harmful gap rows had no scope anywhere

`waves/README.md:141` assigned **15.7** (§ 435.559(c) — existing enrollees aren't assessed until their first
initiated renewal), **15.8** (§ 435.557(a)–(b) ex parte first), and **15.20** (self-reported noncompliance can
support a denial) to W2a, and listed "ex parte explained" and "§ 435.559(c) reassurance" among what it ships.
Grepping the wave-2 file for all three returned **zero hits**. All three are rated harmful.

**Fixed:** new wave-2 § 2.3b writes the scope, including the 15.20 consequence — never nudge a casual negative
self-report.

### I4. The steering doc and the wave file gave opposite orders

Wave-2 § 2.2 said **delete** `whatDoesNotCount`; `compliance-copy-standards.md` says **fix it entry by entry**
and names that exact field as its example. Deleting destroys the two correct entries (SSI, child support).

**Fixed:** the steering doc wins, stated explicitly in the wave file.

### I5. `compliance-copy-standards.md` didn't load where the work is

Its `fileMatchPattern` was `src/content/**`. Its own second sentence named
`src/lib/exemptions/definitions.ts`, `questions.ts`, and `recommendationEngine.ts` as the heaviest
concentrations of verdict language. **None match the pattern.** The rules governing most of W2a's work would
not have loaded.

**Fixed:** promoted to `inclusion: always`. Copy is spread across five directories; no single pattern catches
it. Accepted cost: always-on steering grows.

### I6. The specified guard regex caught almost nothing

Wave-2 § 2.5 specified `/\b(you are|you're) (exempt|compliant)\b/i`. Against the actual code it misses
`You&apos;re Exempt` (HTML entity, `AssessmentBadge:154`), `"You were exempt…"` (past tense,
`AssessmentHistory:57`), bare `"Exempt"` chips, `✓ COMPLIANT` / `✗ NOT COMPLIANT`, and
`automatically meet work requirements` (×3, banned by name in the copy standard).

**Fixed:** respecified as a token list against rendered output with entities normalised, in both wave-2 § 2.5
and ADR-0007.

### I7. Stale claims in always-on steering

- `medicaid-domain-knowledge.md` called the seasonal test "an objective legal test… **Not self-declaration**,"
  which `rule-extract.md` § 2.7 retracts as unsupported. The steering doc was **stricter than the law, against
  the user.** `PRD.md` R3.7 carried the same retracted claim as a requirement. Both fixed.
- The same doc said § 435.603 "is not extracted in this repo" — stale since commit `b9b9594`. Fixed, and the
  `README.md` known-gap entry is struck.
- It justified refusing household MAGI with "a confidently wrong number is worse than silence," which ADR-0003
  had already replaced because that reason **proves too much** — it would also ban the credit-hour conversion.
  Fixed to the elicitation reason.

### I8. Smaller confirmed items

| Item | Status |
|---|---|
| `AssessmentBadge` verdict is line **154**, not 161 (161 is `{recommendation.reasoning}`) | fixed in wave-2 |
| `ComplianceModeSelector` states the false exclusivity claim **twice** (123, 132); wave-2 named one | fixed |
| `waves/README.md` numbered **two** DoD items 7 | fixed; renumbered to 10, review protocol added as 8 |
| DoD item 2 (`npm test` passes) was unsatisfiable — no `test` script | fixed with a W0-slice caveat |
| `complianceMode` "five live readers" not reproducible — it is **four files**: `db.ts` plus three consumers | fixed |
| `compliance-copy-standards.md` said `questions.ts` (7) — actually **4** exact-phrase, **6** "you're exempt" | fixed |
| Wave-2 header declared a W1 dependency; W1 is now last | fixed |
| Gap 5.1 household framing partly belongs to W2a; the split-row list omitted it | fixed |
| Acceptance criteria were largely negative-only | rewritten, split W2a/W2b, each with a positive twin |

### I9. Two findings rejected on verification

- **"`wave-review.kiro.hook` names `general-task-execution`, which doesn't exist."** It exists for the *main*
  agent, which is what executes an `askAgent` hook. The sub-agent generalised from its own narrower roster.
  No change.
- **"ADR-0003 cites § 435.557(a); the copy standard cites (b) — one is wrong."** Both are right and cite
  different provisions: (a) defines the reliable-information set, (b) imposes the duty to exhaust it. Changed
  both to **cite the pair**, per the extract's own warning that the June 29 correction shifted designations
  inside § 435.557.

### I10. What the dry run says about the method

Every significant finding came from a discipline this repo wrote down for itself — the source-tier rule, the
computed-counts rule, the negative-criterion rule. The failure mode was narrow and worth naming: **corrections
landed in the steering docs and the audit record but not in the two artifacts an executing agent reads first,**
`rule-extract.md` and the wave files. Worth re-running this dry run at the start of any wave whose copy makes
legal claims.
