# PRD — HourKeep HR1 Readiness

**Status:** Draft for build
**Date:** August 16, 2026
**Deadline driver:** States must implement the community engagement requirement by **January 1, 2027**
**Inputs:** `gap-analysis.md` · `../domain/cms-2454-ifc/rule-extract.md` · `../audit/codebase-audit-2026-08.md`

---

## 1. Problem

Roughly 20 million adults in 44 jurisdictions must, starting January 1, 2027, prove to their State Medicaid
agency that they worked, volunteered, trained, studied, or earned enough — or that a rule excuses them —
or lose their health coverage.

The State does the deciding. The State does the data matching. But when the State's data comes up
short, the burden lands on the individual: a notice arrives, and they have roughly 35 days to assemble
evidence about months that may already be behind them, against definitions written in statutory language.

That is the problem HourKeep exists to solve. Not to decide anything. To make sure that when someone is
asked, they already have the answer organized and ready to hand over.

**HourKeep today cannot do that job, and in several places would actively mislead them.** Its income
model contradicts the rule. Its exemption model collapses three legally distinct statuses into one
boolean. It asks students the wrong question. It tells users that income types which do count don't.
It has no concept of the review period that all of this is measured against.

---

## 2. Product position

> **HourKeep helps a person build and organize the evidence their State will ask for, and hand it over
> in a form the State can accept. It does not determine anyone's status.**

This is the load-bearing decision. Everything else follows from it.

**What that means concretely:**

| HourKeep does | HourKeep does not |
|---|---|
| Log activities and hours with the detail the rule requires | Declare a month compliant or non-compliant |
| Capture and organize documents against months and activities | Determine that someone is excluded or exempt |
| Explain what may qualify, in plain language, with citations | Compute a household MAGI income figure |
| Show a running total against the 80-hour threshold as *information* | Tell someone they will lose coverage |
| Produce an evidence package for any month or review period | Transmit any user data anywhere |
| Track a notice deadline and help assemble a response | Replace the State's determination or a caseworker |

**Why this is right, not just cautious.** The rule assigns the determination to the State and makes it
appealable. Several definitions turn on facts HourKeep cannot see — household composition, State
condition lists, ex parte data the agency already holds. An app that guesses and is wrong does more
damage than an app that organizes and defers. And an app that says "you're exempt" when the State later
disagrees has done the user real harm.

---

## 3. Users

**Primary — the applicable individual.** 19–64, in the expansion group, subject to the requirement.
Likely on a phone, possibly with intermittent connectivity. Not a policy expert. Often working
irregular hours, caregiving, in school, or some combination. Meaningful likelihood of a disability —
several exclusion categories are disability-based, which means accessibility is a functional
requirement, not polish.

**Secondary — someone acting on their behalf.** § 435.557(b)(4) explicitly permits an adult in the
household or family, an authorized representative, or someone acting responsibly for an incapacitated
person to submit information. HourKeep should not assume the user and the beneficiary are the same
person forever.

**Not a user — the caseworker.** They receive HourKeep's output. They never use the app. Output design
should respect their workflow without building for them.

---

## 4. Goals

| # | Goal | How we know |
|---|---|---|
| G1 | **Nothing HourKeep states is factually wrong under the IFC** | Every user-facing claim traces to a citation in `rule-extract.md`; the gap analysis has zero open `contradicts` rows |
| G2 | **HourKeep never asserts a determination it cannot support** | No copy anywhere declares status or compliance; all framing is "may qualify / here's what to gather / ask your agency" |
| G3 | **A user can produce an evidence package for any month or review period** | Export covers activities, documents, exclusion responses, and income evidence for an arbitrary month range |
| G4 | **All ten exclusion categories and all five mandatory exceptions are screenable** | Screening covers § 435.554(c)(1)–(10) and § 435.553(a)–(b) with correct definitions |
| G5 | **All seven qualifying pathways are representable and combinable** | § 435.552(a)(1)–(7) including the income-to-hours proxy |
| G6 | **Policy values are configurable, never hardcoded** | Zero threshold literals outside the policy profile; adding a State is additive |
| G7 | **A user facing a notice knows what to do and how long they have** | Notice workflow with the 30+5 day window, coverage-continues messaging, and a response package |
| G8 | **Compliance-critical math is covered by tests** | The five domain modules have executable tests; changes to them require a failing test first |
| G9 | **The app is usable by people with disabilities** | Keyboard-operable throughout, WCAG AA contrast, screen-reader labels on all interactive elements |
| G10 | **The privacy promise is kept literally** | Data deletion exists; no claim in the privacy notice is unmet |

---

## 5. Non-goals

- **Not an eligibility determination engine.** See § 2.
- **Not a household MAGI calculator.** Rejected in ADR-0003. We ask three screener questions and defer.
- **Not a submission channel.** HourKeep produces artifacts the user submits through their State's
  channels. It does not integrate with State systems, and § 438.58(b) plus the privacy posture make
  that undesirable anyway.
- **Not multi-user or household management.** Representative *support* is in scope eventually
  (§ 4 secondary user); a household dashboard is not.
- **No cloud sync, accounts, or transmission of user data.** Unchanged from the existing roadmap.
  *Caveat for accuracy:* the app does load **Plausible analytics** from `layout.tsx`, currently before the
  user accepts the privacy notice. No user data is transmitted, but "transmits nothing" was an overstatement
  and ADR-0008 leaned on it. W10 resolves the consent ordering.
- **Not SNAP.** Adjacent and tempting; out of scope.
- **Not a caseworker tool.**

---

## 6. Requirements

Grouped by capability. Each maps to gap-analysis rows and a wave.

### 6.1 Status and screening

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R1.1 | Model three distinct statuses — specified excluded, mandatory exception, short-term hardship — with correct legal effects | 1.1 | W3 |
| R1.2 | Track status **per month**, supporting "part or all of a month" triggers | 1.2, 3.6 | W3 |
| R1.3 | Suppress activity tracking UI for users who appear excluded, replacing it with "you likely don't need to track — here's what to keep anyway" | 1.3 | W3 |
| R1.4 | Represent prior-exclusion-as-exception so a user losing exclusion sees the protection | 1.4 | W3 |
| R1.5 | Persist screening results and history; surface them in Settings and export | 1.7 | W3 |
| R1.6 | Distinguish durable exclusions (never reverified) from expiring ones, and prompt re-screening | 1.6 | W4 |
| R1.7 | Screen all ten § 435.554 categories, including former foster care children | 2.1 | W4 |
| R1.8 | Model the caregiver cluster: six definitions, the three family-caregiver criteria, and the multiple-adults rule | 2.2–2.5 | W4 |
| R1.9 | Model medically frail with the functional gate, five categories, and the stable-recovery carve-out | 2.6, 2.7 | W4 |
| R1.10 | Surface the State's off-list consideration request path | 2.8 | W4 |
| R1.11 | Split SNAP and TANF into separate questions with the correct SNAP test | 2.9, 2.10 | W4 |
| R1.12 | Screen the five § 435.553 mandatory exceptions, including the 3-month inmate look-back | 3.3, 3.4 | W4 |
| R1.13 | Ask the household-composition screener (married / tax dependent / others in tax household) | 5.3 | W4 |

### 6.2 Activities and hours

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R2.1 | Broaden work to money, in-kind, and unpaid; correct the help content | 4.1 | W6 |
| R2.2 | Add `workProgram` as a storable activity type | 4.2 | W6 |
| R2.3 | Replace the school-hours question with half-time status, and add credit-hour conversion for less-than-half-time | 4.3, 4.4 | W6 |
| R2.4 | Model enrollment status as school-determined, with term and recess rules | 4.5, 4.6 | W6 |
| R2.5 | Capture the community service record schema: org name and address, POC name and contact, activity type, dates, hours | 4.7 | W6 |
| R2.6 | Note that court-ordered service counts, and the job-search subsidiary nuance | 4.9, 4.10 | W6 |
| R2.7 | Count sub-threshold family caregiving hours as unpaid work | 2.3 | W6 |
| R2.8 | Validate per-day cumulative hours and guard future dates | audit 4.13 | W6 |

### 6.3 Income

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R3.1 | Reposition income from adjudication to evidence organization | 5.1 | W7 |
| R3.2 | Correct the help content: unearned income counts; SSDI generally counts; SSI and child support do not | 5.2 | W2 |
| R3.3 | Explain that the pathway is household-based and may already be satisfied; direct the user to their agency | 5.3 | W7 |
| R3.4 | Remove pay-period multiplication as a compliance input; retain it only as an optional user-facing estimate, clearly labeled | 5.4, 5.5 | W7 |
| R3.5 | Fix the double-counting semantics | 5.5 | W7 |
| R3.6 | Derive the threshold from the policy profile everywhere | 5.6 | W2 |
| R3.7 | Present the seasonal test as an objective legal standard, not self-declaration | 5.7 | W7 |
| R3.8 | Correct seasonal averaging to the 6 months **preceding** the assessed month | 5.8 | W7 |
| R3.9 | Handle insufficient history explicitly instead of dividing by 6 and showing `$0.00` | 5.9 | W7 |
| R3.10 | Support the reasonably-predictable-changes alternative via the policy profile | 5.9 | W7 |

### 6.4 Compliance evaluation

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R4.1 | Remove the per-month hours/income mode fork; single combined view | 6.1, 6.2 | W7 |
| R4.2 | Implement § 435.552(e) combination, and the income-to-hours proxy | 5.11 | W7 |
| R4.3 | Make evaluation aware of exclusion and exception status | 6.3 | W3 |
| R4.4 | Evaluate any month, not only the current one | 6.4 | W5 |

### 6.5 Review periods

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R5.1 | Model the application review period: 1–3 consecutive months immediately preceding | 7.1 | W5 |
| R5.2 | Model the renewal review period, and tell the user any qualifying month counts | 7.2 | W5 |
| R5.3 | Fix multi-month progress tracking | 7.3 | W5 |
| R5.4 | Support browsing, editing, and evaluating past months | 6.4 | W5 |

### 6.6 Evidence and export

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R6.1 | Export activities, documents, exclusion responses, income evidence, and assessment results | 8.7 | W8 |
| R6.2 | Never export ciphertext; decrypt or omit | 8.8 | W8 |
| R6.3 | Frame the export around a review period, with a document manifest | 8.1, 8.9 | W8 |
| R6.4 | Produce a print-ready artifact suitable for mail or in-person submission | 8.1 | W8 |
| R6.5 | Attach documents to exclusion responses | 8.5 | W8 |
| R6.6 | Add VA and SNAP/TANF document types | 8.4 | W6 |
| R6.7 | Escalate document prompting as January 1, 2028 approaches | 8.3 | W8 |
| R6.8 | Never let export and UI disagree — one evaluation path | 8.9 | W7 |

### 6.7 Notice and hardship

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R7.1 | Record a notice of noncompliance and run a 30-day countdown from a receipt date defaulting to notice date + 5 | 9.1, 9.5 | W9 |
| R7.2 | State prominently that coverage continues during the window | 9.2 | W9 |
| R7.3 | Support both response paths — showing compliance, or showing non-applicability | 9.3 | W9 |
| R7.4 | Explain the 90-day reconsideration and the absence of any reapplication restriction | 9.4 | W9 |
| R7.5 | Report the four hardship event types, distinguishing automatic from request-based | 10.1, 10.2 | W9 |
| R7.6 | Support the dependent-travel case | 10.3 | W9 |

### 6.8 Cross-cutting

| ID | Requirement | Gaps | Wave |
|---|---|---|---|
| R8.1 | Policy profile module; no policy literals outside it | audit §6 | W2 |
| R8.2 | Executable tests on the five compliance-critical modules; TDD for all domain changes | audit §7 | W0 |
| R8.3 | Delete dead code | audit §5 | W0 |
| R8.4 | Fix confirmed data-loss defects | audit 4.2, 4.14 | W0 |
| R8.5 | Data deletion control | audit 4.6 | W0 |
| R8.6 | Modernize dependencies | audit §7 | W1 |
| R8.7 | Adopt CMS terminology in the domain model | 11.3 | W2 |
| R8.8 | Keyboard operability, WCAG AA contrast, screen-reader labels | audit 4.14 | W10 |
| R8.9 | Resolve the encryption posture honestly | audit 4.5 | W10 |
| R8.10 | Remove `/test-compression` from the production build | audit 4.14 | W0 |

---

## 7. Principles

1. **Correct beats complete.** Ship fewer accurate statements rather than more approximate ones.
2. **Cite or cut.** Every domain claim carries a CFR citation in code comments and, where useful, in the UI.
3. **Defer, don't guess.** When HourKeep cannot know, say so and point to the agency.
4. **Every wave ships.** No wave leaves the app broken or less correct than it started.
5. **Test the math first.** Failing test, then fix, for anything in the five compliance-critical modules.
6. **Prefer the user-favorable reading.** Where the rule permits a State option that helps the user,
   default to it and surface it.
7. **Uncertainty is content.** "We don't know your state's rule" is useful information, not a gap to paper over.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| **A final rule changes IFC interpretations** — 79,718 comments were filed | Policy profile is versioned with `effectiveFrom`; rule extract is a citable artifact that can be diffed |
| **We don't know most States' elections** | Federal-default profile with explicit `confidence`; UI hedges accordingly |
| **Scope sprawl turns this into a refactor that never ships** | Dependency-ordered waves, each independently shippable |
| **Changing income math introduces a new wrong answer** | Characterization tests first (W0), then change with tests |
| **Users read HourKeep as authoritative regardless of hedging** | Non-adjudication is enforced in copy review, not just intent; no status assertions anywhere |
| **The Jan 1, 2028 documentation shift arrives before we're ready** | R6.7 escalation, planned in W8 |
| **Household income guidance is misunderstood** | The message is **two-sided** and both halves are required. More household income helps *this pathway* (it is a floor at $580), **up to the point where it ends eligibility for the adult group** (a separate ceiling at 133% FPL + the 5% disregard). A spouse working full time can push a two-person household over the ceiling. That person does not "fail community engagement" — they **exit the group**, possibly to marketplace APTC. Different question, different advice. An earlier version of this row said only "it is a floor, not a ceiling," which swapped one misunderstanding for another |

---

## 9. Out of scope for this effort, tracked for later

- Per-State policy profiles beyond the federal default (needs source data)
- Authorized representative and multi-beneficiary support
- OCR of pay stubs and documents
- Notification and reminder scheduling
- Spanish and other translations
- SNAP work requirements
- Compliance history analytics and forecasting

---

## 10. Dates and the committed subset

Added on validation. The earlier version of this document asserted a January 1, 2027 success statement
while the wave plan explicitly refused to carry dates. That contradiction is resolved here.

### The operative date is earlier than January 1, 2027

§ 435.556(a)(1) assesses the **1–3 consecutive months immediately preceding** the month of application. A
State implementing January 1, 2027 assesses **December 2026** for January applicants. So the app must be
able to hold and export December 2026 activity **before December 1, 2026**.

Three provisions soften this for *existing enrollees* — pending applications are grandfathered under
§ 435.915, "renewal initiated" means when ex parte review begins, and § 435.559(c) defers assessment to
that first renewal. Someone whose renewal is due January or February 2027 may not face the requirement
until mid-2027.

**But that softening does not apply to new applicants, and it does not apply at all in Nebraska (live
since May 1, 2026, already disenrolling), Montana or Arkansas (July 1), or Iowa (December 1).**

**Plan against December 1, 2026 — roughly 3.5 months.**

### Committed subset

These ship by December 1, 2026. Everything else is explicitly post-deadline.

1. **Every factually wrong statement corrected.** All 16 `contradicts` rows.
2. **Every verdict string removed**, with a render-guard test.
3. **Four data-loss fixes** and `/test-compression` out of the production build.
4. **Month scoping** — any month viewable, editable, exportable.
5. **Print-ready evidence export** including documents, through one evaluation path.
6. **Three arithmetic corrections** — seasonal window, education half-time cliff, credit-hour conversion.
7. **Tests** for 4–6, plus the Dexie migration test.

### Explicitly post-deadline

Dependency modernization (W1) · three-tier status model (W3) · full screening rebuild (W4) · hardship
modeling · ZIP and JSON export · encryption posture · the accessibility wave beyond keyboard, contrast,
and labels.

**Goal G4 does not survive this and shouldn't.** "All ten exclusion categories screenable" is the most
expensive goal with the least payoff, because under ADR-0003 the app cannot tell the user the answer
either way. **G1 and G2 survive intact**, which is what the success statement below actually turns on.

### Success statement

**By December 1, 2026**, a person in any of the 44 affected jurisdictions can open HourKeep, understand in
plain language whether the requirement is likely to apply to them and whether their State probably already
has what it needs, record the activities and income evidence the IFC recognizes for **any month**, keep
documents organized against the months that matter, and produce a complete, accurately framed evidence
package for a review period.

And nothing the app tells them along the way is wrong.
