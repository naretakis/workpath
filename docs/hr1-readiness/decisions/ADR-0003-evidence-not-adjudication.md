# ADR-0003 — Evidence Organization, Not Adjudication

**Status:** Accepted
**Date:** 2026-08-16
**Scope:** The product's core posture. Constrains every other decision.

## Context

HourKeep currently tells users things it cannot know. `AssessmentBadge` renders "You're Exempt."
`recommendationEngine` returns `complianceStatus: "compliant"`. `calculateMonthlySummary` returns
`isCompliant: boolean`. The export prints "✓ COMPLIANT".

Three reasons this is untenable under the IFC:

1. **The determination belongs to the State** and is appealable (§ 431.220(a)(1)). The State must first
   exhaust ex parte data HourKeep cannot see — payroll records, adjudicated claims from the prior 12
   months, encounter data (§ 435.557(a)).
2. **Several definitions turn on facts HourKeep cannot evaluate.** Income is MAGI-based household income
   (§ 435.552(f)(2)). Medically frail depends on a State-maintained condition list
   (§ 435.554(c)(5)(ii)). Enrollment status is determined by the school (§ 435.552(c)).
3. **Being confidently wrong causes harm.** A married user whose spouse works may already satisfy the
   income pathway with zero hours worked. HourKeep, seeing only their own pay stubs, would tell them
   they're failing and send them looking for 80 hours of volunteering.

v7.1.0 already softened some copy to "you may be exempt." This ADR makes that a rule rather than a
preference.

## Decision

**HourKeep organizes evidence. It does not determine status.**

Enforced concretely:

| Banned | Required instead |
|---|---|
| "You are exempt" | "Based on your answers, you may not have to do this. Here's what to tell your state." |
| "You are compliant" | "You've logged 82 hours this month. The threshold is 80." |
| "✗ NOT COMPLIANT" | "Logged: 46 hours. Threshold: 80 hours." |
| `isCompliant: boolean` | `hoursLogged`, `threshold`, and a neutral `meetsThreshold` used for display only |
| A household MAGI figure | The three screener questions and a pointer to the agency |

Type-level consequences:

- `MonthlySummary.isCompliant` becomes `meetsHoursThreshold`, documented as informational.
- `Recommendation.complianceStatus` is removed. It encoded a verdict.
- `MonthlyStatus` variants (ADR-0002) are rendered as *apparent* status with their citation visible.
- The export states what was logged and what the threshold is. It does not conclude.

**Income specifically.** We do not compute household MAGI. We ask three questions — are you married, are
you claimed as a tax dependent, does anyone else file with you — and use the answers only to tell the
user the pathway is household-based and may already be met. Pay stubs are captured as *evidence*. Any
pay-period arithmetic is retained only as an optional, clearly labeled personal estimate, never as a
compliance input.

## Refinement: "don't assert status" ≠ "don't compute"

Added on validation. The banned-list above put "a household MAGI figure" next to "You are exempt" as
though they were the same category of sin. They aren't, and conflating them means the app withholds
arithmetic it should show.

§ 435.552(d)'s credit-hour conversion is **arithmetic CMS published**. Computing 77.94 from 6 credits is
applying a formula, not adjudicating — and the State will compute exactly that number. Refusing to show it
isn't humility, it's withholding.

**Every user-facing number carries one of three labels.** This is testable, unlike "never assert a
determination," which every copy review re-litigates.

| Label | Meaning | Examples |
|---|---|---|
| **Computed** | Deterministic from the user's own inputs via a published formula. **Show the number, the formula, and the citation.** | Credit-hour conversion; hours sums; the 30+5 day deadline; the seasonal 6-month average over months the user recorded |
| **Conditional** | Deterministic *given a State election we don't know.* **Show it with the election named.** | The income-to-hours proxy; the review-period length; whether hardship exists |
| **Deferred** | Depends on facts only the agency holds. **Don't compute. Ask the screener question, name the agency.** | Household MAGI total; whether a condition is on the State's medically-frail list; what ex parte data the State already has |

Legal *status* is always Deferred. That part of the original decision is unchanged.

**And the stated reason for refusing household MAGI needs replacing.** "A wrong number is worse than
silence" proves too much — it would also ban credit-hour conversion. The durable reason is that
**§ 435.603(f) household composition is asymmetric and per-person**: it follows tax filing relationships
rather than residence, two adults in one dwelling can have different households, a tax dependent inherits
the claiming taxpayer's household, and § 435.603(d) excludes some members' income entirely. You would have
to correctly elicit the user's whole tax filing structure before summing anything. That is a hard
**elicitation** problem, not merely missing data.

**Behavioral consequences count too.** W3 suppresses tracking UI based on apparent exclusion. Removing a
capability is a stronger assertion than a hedged sentence, so it needs the same discipline: always offer a
"this doesn't sound right" path back to screening.

**`hoursNeeded` survives** as neutral arithmetic ("Logged: 46. Threshold: 80. Difference: 34"), consistent
with the Computed label. It is not a verdict.

## Consequences

**Good**

- Removes the whole class of harmful false negatives, of which the married-user case is the worst.
- Makes the app defensible. It cannot be wrong about a determination it never makes.
- Simplifies logic. Several hard problems — household composition, State condition lists, ex parte
  data — stop being our problem.
- Produces the app's most valuable single message: some users may not need to track anything.

**Costs**

- Weaker-feeling UX. "You may qualify" is less satisfying than "You're exempt." Mitigated by being
  concrete about *what to do next*, which is more useful anyway.
- Rewrites the results surfaces: `AssessmentBadge`, `how-to-hourkeep/results`,
  `GettingStartedContextual`, and the export.
- Loses the recommendation engine's confident framing. It becomes a "pathways that may fit you"
  explainer rather than a verdict machine.

**Explicitly accepted**

- Users will still read HourKeep as authoritative to some degree. Hedged copy reduces but does not
  eliminate this. Copy review is part of every wave's definition of done, not an afterthought.

## Alternatives rejected

- **Keep determinations, add a disclaimer.** Disclaimers don't undo a headline that says "You're Exempt."
- **Build a household MAGI estimator.** Requires household composition and tax data HourKeep has no
  business holding, and a wrong number is worse than silence. See ADR-0008 for the related API rejection.
- **Show determinations only when confidence is high.** There is no reliable confidence signal, because
  the missing inputs are missing by design.
