---
inclusion: fileMatch
fileMatchPattern: 'src/content/**'
---

# Compliance Copy Standards

Rules for every string a user reads. Operationalizes
`docs/hr1-readiness/decisions/ADR-0003-evidence-not-adjudication.md`.

These rules bind wherever user-facing text lives, not only under `src/content/`. Today the heaviest
concentrations are `src/lib/exemptions/definitions.ts` (15 occurrences of "exempt from work requirements"),
`src/lib/exemptions/questions.ts` (7), and `src/lib/assessment/recommendationEngine.ts`, which returns
`complianceStatus: "compliant"` outright.

## Label every number

One of three labels applies to every figure shown to a user. This is the testable form of "never assert a
determination."

| Label | Rule | Examples |
|---|---|---|
| **Computed** | Deterministic from the user's own inputs by a published formula. **Show the number, the formula, and the citation.** | Hours sums; credit-hour conversion (§ 435.552(d)); the 30-plus-5-day deadline; a 6-month average over months the user recorded |
| **Conditional** | Deterministic *given a state election we don't know.* **Show it, and name the election.** | The income-to-hours proxy; review-period length; whether hardship is offered at all |
| **Deferred** | Depends on facts only the agency holds. **Don't compute. Ask the screener question and name the agency.** | Household MAGI total; whether a condition is on the state's medically-frail list; what ex parte data the state already has |

**Legal status is always Deferred.** No exceptions.

Computing is not adjudicating. Refusing to show arithmetic CMS published is not humility, it's withholding —
the state will compute that exact number. The line is between applying a formula and reaching a verdict.

## Banned, and what to write instead

| Never | Instead |
|---|---|
| "You are exempt" / "you're exempt from work requirements" | "Based on your answers, you may not have to do this. Here's what to tell your state." |
| "You are compliant" / "✓ COMPLIANT" | "You've logged 82 hours. The threshold is 80." |
| "✗ NOT COMPLIANT" | "Logged: 46 hours. Threshold: 80 hours. Difference: 34." |
| "You automatically meet work requirements" | "This may be enough on its own. Your state decides." |
| "This income doesn't count" | "This may not count toward the threshold — § 435.603(d)." |

`hoursNeeded` survives as neutral arithmetic. A difference is not a verdict.

## Every hedge carries a next action

A hedge with nothing after it is worse than a verdict — it transfers anxiety without transferring
capability. "You may be exempt" ends the sentence badly. "You may not have to do this. Bring this summary
to your caseworker and ask them to check your exclusion status" ends it well.

If you can't name the next action, the copy isn't finished.

## Income is household MAGI, and the message is two-sided

The single most harmful copy in the app today. `incomeDefinitions.threshold` in `src/content/helpText.ts`
says only earned income counts and lists SSDI, unemployment, investment, and rental income as excluded.
Under § 435.552(f)(2) income is **MAGI-based household income**, so all four generally *do* count. Of the
seven items in that list, SSI and child support are the ones actually excluded.

Consequences for copy:

- **A user may already qualify with zero hours.** A married user whose spouse works is the case that
  matters. Telling them they're failing sends them looking for 80 hours of volunteering they don't need.
- **State the two sides.** More household income helps this pathway — up to the point where it ends
  eligibility for the adult group entirely (133% FPL plus the 5% disregard). That is a *different*
  conversation, not a community-engagement failure, and it points at marketplace subsidies. Never imply a
  spouse's income disqualifies anyone.
- **Don't total anything.** § 435.603(f) household composition follows tax filing relationships rather than
  residence, is asymmetric and per-person, and § 435.603(d) excludes some members' income outright. The
  hard part is *elicitation*, not arithmetic. Ask the three screener questions — married, claimed as a tax
  dependent, anyone else filing with you — and point at the agency.
- **The proxy is an upper bound.** § 435.552(e)(2)(i) requires the state to allocate hours between
  household members by a method we can't know. Say "up to," never "about."

Authoritative text: `docs/domain/supporting-regs/`. The IFC's characterization of § 435.603 is not
§ 435.603.

## Say the reassuring true things

Under-communicated and free. CMS estimates most users will be verified without doing anything
(§ 435.557(b) ex parte). Beneficiaries enrolled as of the implementation date aren't assessed until their
first renewal on or after it (§ 435.559(c)). The state must consider every other basis of eligibility
before denying (§ 435.558(d)(1)). Determinations are appealable (§ 431.220(a)(1)).

## When you delete, replace

Deleting a wrong section satisfies "no copy says X" while destroying whatever was true in it. The
`whatDoesNotCount` list is the live example: four wrong entries, two right ones, one defensible. Fix it
entry by entry.

## Mechanics

- Plain language. Sixth-to-eighth grade reading level. "Work, volunteer, or go to school for 80 hours a
  month," not "engage in qualifying community engagement activities."
- Cite in the source, not on screen. A CFR reference in a code comment or `citation` field; plain language
  in the UI.
- No policy literals in strings — interpolate from the policy profile so `$580` updates with the minimum
  wage.
- Name the actor. "Your state decides," not "it is determined."
- Uncertainty is content. "We don't know what your state chose" is a real answer and better than a
  confident guess.
