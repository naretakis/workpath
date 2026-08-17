# ADR-0002 — Three-Tier Status Model

**Status:** Accepted
**Date:** 2026-08-16
**Replaces:** `ExemptionResult.isExempt: boolean` and the `exemptions` / `exemptionHistory` tables

## Context

HourKeep models exemption as one boolean plus a category string. The IFC has three legally distinct
statuses with different effects:

| Tier | CFR | Effect |
|---|---|---|
| **Specified excluded individual** | § 435.554 | Not an applicable individual. The State is **prohibited** from assessing compliance (§ 435.556(c)) |
| **Mandatory exception** | § 435.553 | Still applicable, but **deemed compliant** for a month — triggers on **part or all** of a month |
| **Short-term hardship** | § 435.555 | Deemed compliant, **State option**, must not apply to excluded individuals |

Three additional facts the boolean cannot express:

1. **Exclusion takes precedence** (§ 435.557(c)(2)) even when compliance is also demonstrated.
2. **Exceptions are per-month**, and prior exclusion is itself an exception (§ 435.553(a)(4)) — so
   losing exclusion status retroactively protects the months you held it. This is the rule's main
   transition protection and HourKeep can't represent it.
3. **Durability differs.** American Indian status **must not be reverified**; a dependent-child
   exclusion ends when the child turns 14.

Separately, the existing storage layer is dead: `saveScreening` and `archiveScreening` have zero
callers, so nothing is persisted at all.

## Decision

Replace the boolean with an explicit status model, evaluated per month.

```ts
type ExclusionCategory =
  | "former-foster-care" | "american-indian" | "caregiver"
  | "disabled-veteran"   | "medically-frail" | "tanf-compliant"
  | "snap-non-exempt"    | "rehab-program"   | "inmate" | "pregnant-postpartum";

type ExceptionCategory =
  | "under-19" | "medicare" | "mandatory-coverage-group"
  | "was-excluded" | "recent-inmate";

type MonthlyStatus =
  | { kind: "excluded";   category: ExclusionCategory; citation: string;
      durability: "permanent" | "reviewable"; expiresAfter?: string }
  | { kind: "excepted";   category: ExceptionCategory; citation: string }
  | { kind: "hardship";   event: HardshipEvent; requested: boolean; citation: string }
  | { kind: "applicable" };
```

Rules that follow from the model:

- Resolution order is **excluded → excepted → hardship → applicable**, mirroring § 435.557(c)(2).
- Status is resolved **per month**, so "part or all of a month" is expressible.
- `durability: "permanent"` on `american-indian` encodes the no-reverification rule.
- `expiresAfter` drives re-screen prompting, which the current `nextSteps` copy promises but never delivers.
- Every variant carries a `citation`, so the UI can show its basis and the export can justify itself.

Persistence moves to a new `complianceStatus` table keyed by `[userId+month]`, introduced in **Dexie v7**.

**Migration ownership, corrected on validation.** One consolidated **v7 in W3**: add `complianceStatus`,
add `userId` to `Activity`, add **all** compound indexes (so W5 needs no migration of its own), and drop
the genuinely dead `exemptions` and `exemptionHistory` tables.

> **`complianceModes` is NOT dead and must not be dropped here.** An earlier version of this ADR called it
> dead. It has **five live readers**, including `lib/storage/income.ts` — one of the five
> compliance-critical modules. Dropping it in W3 would break the W0 characterization tests that W2, W5, W6,
> and W7 all depend on, violating the "every wave ships" invariant across three consecutive waves.
> **It drops in W7**, after ADR-0004's code removal. W6 takes a separate **v8** for the education-status
> backfill.
>
> Also: adding `"workProgram"` to `Activity["type"]` is a **TypeScript union change, not a schema change** —
> Dexie indexes `type` but does not constrain its values.

**`HardshipEvent` is deferred to W9.** An earlier version of this ADR required the `hardship` variant while
its payload type was defined nowhere. W3 either imports it as a forward reference or omits the variant until
W9. Either way, W3's precedence test covers **three of four** kinds and its acceptance criterion must say so.

**Missing variant.** Age 65+, pregnancy, and Medicare place someone **outside § 435.551 entirely** — neither
excluded nor excepted. The four-variant union cannot express that. Add a fifth,
`{ kind: "not-applicable"; basis: ... }`, or document why 65+ collapses into `excluded`.

Because HourKeep does not adjudicate (ADR-0003), the UI presents these as *apparent* status — "based on
your answers, you may be excluded" — never as determinations.

## Consequences

**Good**

- The transition protection in § 435.553(a)(4) becomes representable, which is the difference between a
  parent panicking and a parent being reassured.
- § 435.556(c) becomes enforceable in the UI: excluded users stop seeing tracking as an obligation.
- Re-screen prompting becomes possible.
- Citations travel with status, which the evidence package needs.

**Costs**

- Dexie v7 migration. Acceptable — no production users.
- Screening becomes a maintained profile rather than a one-shot questionnaire, which is a larger change
  to `AssessmentFlow` than adding questions would have been.
- More states to render. The UI must handle four kinds, not two.

## Alternatives rejected

- **Keep the boolean, add a second flag for exceptions.** Doesn't give per-month granularity and can't
  express precedence or durability.
- **Model status only at screening time.** Loses the per-month deeming that makes § 435.553 protective.
- **Keep the `exemptions` tables and wire them up.** They're shaped for the old model, and their
  `ExemptionHistory` projection discards the responses we need for the evidence package.
