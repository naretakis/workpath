# Wave 4 — Screening Rebuild

**Depends on:** W3 (screening writes into the status model)
**Blocks:** W7
**Detail level:** goals and scope. Task breakdown when the wave starts.

## Goal

Screen all ten § 435.554 exclusion categories and all five § 435.553 mandatory exceptions with correct
definitions, and add the household-composition screener.

## Scope

### New and corrected categories

- **Former foster care children** (§ 435.554(c)(1)) — no question exists today. Under 26; not enrolled in a
  § 1902(a)(10)(A)(i)(I)–(VII) group; in foster care under **any** State's responsibility at 18 (or higher
  State-elected age); Medicaid-enrolled while in care. CMS applies SUPPORT Act criteria regardless of when
  the person turned 18. Reference: `former_foster_care.rb` per ADR-0008.
- **Caregiver cluster** (§ 435.554(a), (c)(3)) — replace two booleans with the six definitions and the
  three family-caregiver criteria: (A) resides with, (B) relative not residing with, (C) neither, requiring
  ≥ 80 hours/month. Surface that **multiple adults in one residence may each qualify**. Define disabled
  individual by the **ADA standard at 28 CFR 35.108**, and say plainly that Medicaid disability eligibility
  is not required.
- **Medically frail** (§ 435.554(c)(5)) — add the functional gate ("significantly impairs your ability to
  do 80 hours a month") **before** the five categories. Model the SUD carve-out: qualifies unless in stable
  recovery of 5+ years; includes early and sustained recovery; no active treatment required. Surface the
  State's off-list consideration request path (§ 435.554(c)(5)(ii)) — a user whose condition isn't on their
  State's list must be told they can ask. Handling this data engages HIPAA and **42 CFR part 2**.
- **Split SNAP and TANF.** SNAP (§ 435.554(c)(7)) is "member of a household receiving SNAP who is **not
  exempt from** a SNAP work requirement" — the current question asks about *complying with*, which inverts
  it. TANF (§ 435.554(c)(6)) is a separate category: compliant with § 407 requirements.
- **Disabled veteran** (§ 435.554(c)(4)) — add "temporary or permanent," currently omitted.
- **Rehab program** (§ 435.554(c)(8)) — note that States may set a minimum time commitment.
- **Mandatory coverage groups** (§ 435.553(a)(3)) — the current single "non-MAGI Medicaid" question is much
  narrower than subclauses (I)–(VII). Broaden it.

### Household screener (ADR-0003)

Three questions, no income figures: are you married; are you claimed as someone's tax dependent; does
anyone else file taxes with you. Used **only** to tell the user the income pathway counts their whole
household and may already be met, and to direct them to their agency. **No MAGI computation.**

### Flow architecture

Collapse the 12-way `questionId` switch that currently appears **five to seven times** across
`AssessmentFlow`, `questionFlow.ts`, and `QuestionFlow.tsx` into a single `responseField` declaration per
question. Adding a category should mean touching one place. Add exhaustiveness checking so a missing case
is a compile error.

Extend the three-tier terminology architecture to the new categories: authoritative wording, plain-language
help, definitions accordion. Add CFR citations alongside the existing HR1 ones.

## Acceptance criteria

- [ ] All ten § 435.554 categories and all five § 435.553 exceptions are screenable
- [ ] Former foster care children has a question with correct criteria
- [ ] Family caregiver correctly distinguishes the three criteria, including the ≥ 80-hour case
- [ ] Multiple-adults-in-a-residence is surfaced
- [ ] Medically frail applies the functional gate before the categories, and handles stable recovery
- [ ] The off-list request path is surfaced
- [ ] SNAP and TANF are separate, and the SNAP test is not inverted
- [ ] Household screener asks three questions and computes nothing
- [ ] Question-to-field mapping exists in exactly one place, with exhaustiveness checking
- [ ] Every question carries a CFR citation

## Risks

| Risk | Mitigation |
|---|---|
| Question count grows enough to cause abandonment | Keep early termination; order by prevalence; make progress honest |
| The caregiver cluster is genuinely hard to ask plainly | Draft and review copy separately from implementation; it may need several passes |
| Users self-assess medically frail incorrectly in either direction | The functional gate is the question, not the diagnosis; hedge per ADR-0003; always mention the request path |
| 42 CFR part 2 obligations on SUD data | Data stays local; document the reasoning; do not include SUD detail in exports without explicit consent |

---

## Inherited from W0 § 0.4 — the skip-answered logic, recorded before deletion

W0 deleted `src/lib/exemptions/questionFlow.ts` (324 lines) as dead code: its only
importer was the equally dead `components/exemptions/QuestionFlow.tsx`. The audit
noted it "ironically implements the skip-answered logic the live flow lacks," and
W0's § 0.4 required that logic be ported or recorded before removal. It is recorded
here rather than ported, because W4 rebuilds the question set and porting into a
flow that is about to be replaced would be work done twice.

Two mechanisms worth having. Both are reconstructable from this note; the deleted
file is in git history at `132ceff~1` if the original is wanted.

**1. Short-circuit on exclusion.** `getNextQuestion` called `calculateExemption` on
the answers so far and returned `null` the moment anything matched, stopping the
questionnaire. The live `AssessmentFlow` does the same thing by a different route
(`handleExemptionContinue` calls `completeAssessment` on a match), so this part is
not actually missing — the audit's phrasing overstates it. Verified 2026-09-01.

**2. Resume without re-asking.** This part IS missing from the live flow.
`getNextQuestion(responses, currentQuestionId)` scanned forward from the current
question and returned the first one whose answer was still `undefined`, so a
returning user was never asked something they had already answered.
`AssessmentFlow` instead walks a fixed index (`exemptionQuestionIndex`) and re-asks
everything from the top.

The predicate was a 12-arm switch mapping question id to response field, with a
silent `default: return false`:

| Question id | Response field |
|---|---|
| `age-dob` | `dateOfBirth` |
| `family-pregnant` | `isPregnantOrPostpartum` |
| `family-child` | `hasDependentChild13OrYounger` |
| `family-disabled-dependent` | `isParentGuardianOfDisabled` |
| `health-medicare` | `isOnMedicare` |
| `health-non-magi` | `isEligibleForNonMAGI` |
| `health-disabled-veteran` | `isDisabledVeteran` |
| `health-medically-frail` | `isMedicallyFrail` |
| `program-snap-tanf` | `isOnSNAPOrTANFMeetingRequirements` |
| `program-rehab` | `isInRehabProgram` |
| `other-incarcerated` | `isIncarceratedOrRecentlyReleased` |
| `other-tribal` | `hasTribalStatus` |

**Three things to fix rather than reproduce.**

- **This is the fifth copy of that mapping.** Audit § 6 counts the same 12-way
  switch 5–7 times across `AssessmentFlow` (×3), `questionFlow.ts` (×2), and
  `QuestionFlow.tsx` (×2), none exhaustiveness-checked and all with a silent
  `default`. Deleting two files removed two copies. W4's acceptance criterion
  already requires the mapping to exist in exactly one place with exhaustiveness
  checking — that criterion is what makes reproducing this note's table wrong.
- **`!== undefined` cannot distinguish "answered no" from "never asked."** W0's
  characterization tests pinned that `calculateExemption`'s guards are bare
  truthiness checks, so `false` and `undefined` behave identically there. The
  skip logic used `!== undefined` and so was *more* precise than the calculator it
  fed. Under 42 CFR 435.554(c)(5)(ii) states must offer a route to have an off-list
  condition considered, and "I said no" versus "nobody asked me" are different
  evidentiary positions. W4 should keep the three-state distinction end to end.
- **`getPreviousQuestion` took a `questionHistory: string[]`** and read the last
  entry, i.e. back-navigation was a caller-maintained stack rather than derived.
  `AssessmentFlow` already keeps a `stepHistory` array; one history mechanism, not
  two.
