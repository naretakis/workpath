# State-Configurable Parameters — Schema and Tracker

Companion to `rule-extract.md` § 10. That section defines each parameter and its federal default.
**This document is the living tracker** for per-State values as we learn them, plus the target schema
for the policy profile module.

**Status:** schema defined · per-State data mostly unknown · federal default is the only complete profile.

---

## Why this exists

The IFC leaves at least sixteen parameters to State election. HourKeep cannot be correct for a given
user without knowing their State's choices, but it also cannot block on collecting 44 jurisdictions' worth
of data. The resolution (ADR-0001) is a `FEDERAL_DEFAULT` profile encoding the least-restrictive
statutory floor, with per-State profiles layered on additively as they become known.

**Every profile must be explicit about its own uncertainty.** A user in a State we have no data for
should be told the app is using federal minimums and that their State may require more.

---

## Target schema

```ts
export interface PolicyProfile {
  /** "federal-default" | "state:AR" | "state:IN" ... */
  id: string;
  /** Human label for display, e.g. "Federal minimum (no state data)" */
  label: string;
  /** ISO date this profile's values took effect */
  effectiveFrom: string;
  /** Where these values came from. Required — no unsourced profiles. */
  source: { citation: string; url?: string; retrievedAt: string };
  /** How much we trust this profile's STATE data. Drives UI hedging. */
  confidence: "statutory-floor" | "state-published" | "third-party-reported";
  /**
   * Separate from `confidence`. Flags values that rest on a CMS *interpretation* a final rule
   * or a court could move — distinct from "we don't know what Idaho elected."
   * Known interpretive risks: the MAGI-household reading of § 435.552(f); the
   * "whether or not consecutive" reading of § 435.556(a)(2); the medically-frail
   * functional-impairment gate (under challenge in Massachusetts v. Oz, SJ hearing 2026-10-20).
   */
  interpretiveRisk?: Array<{ field: string; basis: string; watch: string }>;

  // --- Thresholds (statutory, but dynamic) ---
  federalMinimumWage: number;        // 7.25 — from 29 U.S.C. 206(a)(1)(C)
  requiredHours: number;             // 80
  /** Derived: federalMinimumWage * requiredHours. Never hardcode 580. */
  readonly incomeThreshold: number;

  // --- Review periods (§ 435.556) ---
  applicationLookbackMonths: 1 | 2 | 3;
  renewalMonthsRequired: number;              // >= 1
  moreFrequentVerification: false | { intervalMonths: number; monthsRequired: number };

  // --- Options affecting what counts (§ 435.552) ---
  incomeToHoursProxyAvailable: boolean;       // § 435.552(e)(2)
  seasonalMethod:
    | { kind: "preceding-average"; months: 6 }
    | { kind: "reasonably-predictable-changes"; windowMonths: number; direction: "increases" | "decreases" | "both" };

  // --- Exclusion-affecting options (§ 435.554) ---
  extendedCaretakerRelativeRelationships: boolean;  // § 435.554(a)(iv)
  rehabMinimumTimeCommitmentHours: number | null;   // § 435.554(c)(8)
  medicallyFrailConditionListUrl: string | null;    // § 435.554(c)(5)(ii)

  // --- Hardship (§ 435.555) ---
  shortTermHardshipOffered: boolean;
  unemploymentHardshipEffectuated: boolean;

  // --- Process (§§ 435.557–435.559) ---
  implementationDate: string;
  /**
   * PER-STATE, not a constant. Federally 2028-01-01 (§ 435.557(b)(2)(ii)), but eight States
   * require medical-frailty documentation from January 2027: AR, ID, IN, IA, NC, ND, OH, UT.
   */
  documentationRequiredFrom: string;
  /** § 435.560. Non-null means the State is NOT enforcing yet. Expires no later than 2028-12-31. */
  goodFaithEffortExemptionThrough: string | null;
  noncomplianceResponseDays: number;          // 30
  noticeReceiptPresumptionDays: number;       // 5
  /** § 435.916(a)(3)(iii). 90 is a FEDERAL FLOOR for MAGI; the only election is to elect longer. */
  reconsiderationDays: number;
  renewalIntervalMonths: number;              // 6 for adult group; 12 for AI/AN and most 1115
  submissionModalities: Array<"online" | "phone" | "mail" | "in-person" | "fax" | "electronic">;

  // --- Added on validation (§ 435.558(b), § 435.557) ---
  /** § 435.558(b)(2). Option 1 = notice concurrent with renewal form. Option 2 = notice after it. */
  unableToVerifyAtRenewal: "option-1-concurrent" | "option-2-sequential";
  /** § 435.558(b)(3). Same binary for more-frequent verification. */
  unableToVerifyAtVerification: "option-1-concurrent" | "option-2-sequential" | null;
  /** § 435.557(g)(1). CMS ENCOURAGES States not to use this. */
  skipFurtherInfoOnAttestedException: boolean;
  /** § 435.557(f). At least every 12 months; a State may reverify more often. */
  frailtyReverificationMonths: number;
  /** § 435.554(c)(5)(ii). Two-tier in practice — see Georgia. */
  frailtyListStructure: "unknown" | "flat" | "automatic-plus-case-by-case";
  /** §§ 435.1103(b), 435.1110(c)(2). PE/HPE determinations must rest on ATTESTED information. */
  presumptiveEligibilityForAdultGroup: boolean | null;
}
```

Design notes:

- `incomeThreshold` is **derived**, never stored. The FLSA can be amended.
- `confidence` exists so the UI can hedge honestly. A `statutory-floor` profile should produce copy
  like "your state may require more than this."
- `source` is mandatory. A profile without a citation is a guess, and guesses do not belong in
  compliance logic.
- `seasonalMethod` is a discriminated union because the two paths produce genuinely different numbers,
  and most States elect the second.

---

## Federal default profile

The least-restrictive statutory floor. Safe to show any user, and honest as long as we say it is a floor.

| Parameter | Value | Basis |
|---|---|---|
| `federalMinimumWage` | 7.25 | 29 U.S.C. 206(a)(1)(C) |
| `requiredHours` | 80 | § 435.552(a) |
| `incomeThreshold` | 580 | derived |
| `applicationLookbackMonths` | 1 | § 435.556(a)(1) minimum |
| `renewalMonthsRequired` | 1 | § 435.556(a)(2) minimum |
| `moreFrequentVerification` | false | State option, default decline |
| `incomeToHoursProxyAvailable` | true | § 435.552(e)(2), user-favorable |
| `seasonalMethod` | preceding-average, 6 months | § 435.552(g) statutory fallback |
| `extendedCaretakerRelativeRelationships` | false | base list only |
| `rehabMinimumTimeCommitmentHours` | null | no State-imposed minimum |
| `medicallyFrailConditionListUrl` | null | unknown per State |
| `shortTermHardshipOffered` | false | State option |
| `unemploymentHardshipEffectuated` | false | requires State request + CMS approval |
| `implementationDate` | 2027-01-01 | § 435.559(a) |
| `documentationRequiredFrom` | 2028-01-01 | § 435.557(b)(2)(ii) — **but 2027-01-01 in eight States** |
| `goodFaithEffortExemptionThrough` | null | § 435.560. CMS expects ~10 States to request one |
| `noncomplianceResponseDays` | 30 | § 435.558(a)(2) |
| `noticeReceiptPresumptionDays` | 5 | § 435.558(c)(4) |
| `reconsiderationDays` | 90 | § 435.916(a)(3)(iii) — federal floor |
| `renewalIntervalMonths` | 6 | § 1902(e)(14)(L), adult group |
| `submissionModalities` | `["online","phone","mail","in-person","fax","electronic"]` | § 435.907(a). **Fax is real** — Missouri accepts it |
| `unableToVerifyAtRenewal` | `option-2-sequential` | § 435.558(b)(2). Assumed because it is more protective — two windows rather than one |
| `unableToVerifyAtVerification` | null | No more-frequent verification assumed |
| `skipFurtherInfoOnAttestedException` | false | § 435.557(g)(1). CMS **encourages States not to use it** |
| `frailtyReverificationMonths` | 12 | § 435.557(f)(1)(iii) minimum |
| `frailtyListStructure` | `unknown` | § 435.554(c)(5)(ii). Georgia's is `automatic-plus-case-by-case` |
| `presumptiveEligibilityForAdultGroup` | null | Unknown per State |

> **Note on `incomeToHoursProxyAvailable: true`.** This is a State option we default to *on* because it
> can only help the user, and because HourKeep never adjudicates — it surfaces the possibility and
> tells the user to raise it with their agency. If a State declines it, the user has lost nothing.

---

## Per-State tracker

Sources so far are third-party reported (KFF's survey of Medicaid officials, fielded January–March
2026). Treat every row as `confidence: "third-party-reported"` until we find State-published material.

| State | Implementation | App. lookback | Renewal months | More frequent | Hardship | Frailty docs from | Source |
|---|---|---|---|---|---|---|---|
| **Modal case** (~34 States) | 2027-01-01 | 1 | 1 | decline | all four | 2028-01-01 | KFF survey |
| **Nebraska** | **LIVE 2026-05-01 — first State to disenroll** | ? | ? | ? | ? | **2027-01** | KFF, state press |
| **Montana** | **LIVE 2026-07-01** | ? | ? | ? | ? | ? | KFF |
| **Arkansas** | **LIVE 2026-07-01** soft launch, no disenrollment before 2027-01-01 | ? | **3** | decline | ? | **2027-01** | AR DHS |
| **Iowa** | **2026-12-01** | ? | ? | ? | **none** | **2027-01** | Iowa HHS |
| Georgia | already live (Pathways § 1115); converts 2027-01-01. **Waiver expires 2026-12-31** | ? | ? | ? | ? | ? | GA DCH |
| Idaho | 2027-01-01 | **3** | ? | ? | ? | **2027-01** (6-mo attestation for new enrollees) | KFF, legislation |
| Indiana | 2027-01-01 | **3** | every month | **quarterly** | **none** | **2027-01** | KFF, legislation |
| New Hampshire | 2027-01-01 | 1 | every month | **quarterly** | ? | ? | KFF, enacted text |
| North Carolina | 2027-01-01 | ? | ? | ? | ? | **2027-01** (statute bars attestation as sole evidence) | Politico |
| North Dakota | 2027-01-01 | ? | ? | ? | ? | **2027-01** | Politico |
| Ohio | 2027-01-01 | ? | ? | ? | ? | **2027-01** | Politico |
| Utah | 2027-01-01 | ? | ? | ? | ? | **2027-01** | Politico |
| Missouri | 2027-01-01 | ? | ? | ? | **no unemployment event** | ? | MO DSS FAQ |
| Oklahoma | 2027-01-01 | ? | ? | ? | **no unemployment or disaster event** | ? | KFF |
| New York | 2027-01-01 | ? | ? | ? | **no medical-travel event** | ? | KFF |
| Tennessee | 2027-01-01 (§ 1115) | ? | ? | ? | ? | ? | TennCare notices |

**Aggregate from the KFF survey of all 44:** 34 verify every six months at renewal · 36 use a 1-month
application lookback · 34 use 1 month at renewal · **29 plan at least one hardship exception, and all but
three of those take all four.**

**In scope (44 = 43 States + DC):** the expansion States and DC, **plus Georgia, Tennessee, and Wisconsin**
(§ 1115), plus § 1115 populations inside **Hawaii, Massachusetts, New York, Oregon, and Utah**.
**Out of scope:** Alabama, Florida, Kansas, Mississippi, South Carolina, Texas, Wyoming — and **all
territories** (§ 435.550).

*Content in this section was rephrased for compliance with licensing restrictions. Source:
[KFF, An Early Look at Policy Decisions as States Get Ready to Implement Work Requirements](https://www.kff.org/medicaid/an-early-look-at-policy-decisions-as-states-get-ready-to-implement-work-requirements/).*

---

## Open data gaps

1. **Exact lookback values** for Idaho, Indiana, New Hampshire, Arkansas — reported as "more than one"
   without specifics.
2. **Hardship elections.** No State's election is confirmed. This is the largest gap, because it
   determines whether an entire feature is relevant to a given user.
3. **Medically frail condition lists.** Every State must publish one. None catalogued.
4. **Reasonably-predictable-changes elections.** CMS says most States elect it and most elect both
   directions, but per-State values are unknown — and this changes the seasonal calculation outright.
5. **SPA / State plan election material.** CMS said the template was "currently under development."
   That document, once published, is the authoritative source for most of this table.

## How to add a State

1. Find a State-published source — SPA, verification plan, State plan amendment, agency guidance page.
2. Add a profile with `confidence: "state-published"` and a real `source` citation.
3. Leave anything you cannot source as the federal default. **Do not infer.**
4. Add a regression test asserting the profile's values, so a later refactor cannot silently change them.
