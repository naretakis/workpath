# Research Plan: Establishing an Updated Source of Truth

**Objective:** Replace HourKeep's HR1-statute-only understanding of the community engagement
requirement with an authoritative, citable model grounded in CMS-2454-IFC, then measure HourKeep
against it.

**Status:** ✅ Complete. All six deliverables produced. Retained as the record of how the research was
scoped and which sources were treated as authoritative. Outputs:
[`rule-extract.md`](../domain/cms-2454-ifc/rule-extract.md) ·
[`state-options.md`](../domain/cms-2454-ifc/state-options.md) ·
[`medicaid-domain-knowledge.md`](../../.kiro/steering/medicaid-domain-knowledge.md) ·
[`gap-analysis.md`](../hr1-readiness/gap-analysis.md) ·
[`PRD.md`](../hr1-readiness/PRD.md) ·
[`waves/`](../hr1-readiness/waves/)

Deviation from plan: the landscape sweep (§ 3.K) was narrower than scoped — enough to validate the
policy-profile approach and correct the Georgia/Wisconsin error, but per-State election data remains
largely ungathered. Tracked in `state-options.md` § "Open data gaps".

---

## 1. Why this is needed now

HourKeep's domain model was built from the statute (HR1 §71119, now Public Law 119-21, codified at
SSA §1902(xx)). CMS has since issued an interim final rule that **interprets and operationalizes**
that statute, and it is already binding law.

| Fact | Value |
|---|---|
| Document | CMS-2454-IFC, RIN 0938-AV98 |
| Published | June 3, 2026 (91 FR 33348–33482) |
| **Effective** | **July 31, 2026** — already in force |
| Comment period | Closed July 31, 2026 · 79,718 comments received |
| State implementation deadline | **January 1, 2027** (~4.5 months from today) |
| Creates | 42 CFR §§ 435.550–435.563 (14 new sections) |
| Amends | 42 CFR §§ 431.213, 431.231, 435.3, 435.119, 435.907, 435.911, 435.912; Parts 438, 457, 600 |

Two consequences for this project:

1. The IFC introduces a **three-tier structure** where HourKeep has one flat "exemption" concept:
   mandatory exceptions (§ 435.553, deemed compliant), specified excluded individuals (§ 435.554),
   and optional short-term hardship exceptions (§ 435.555). These have different legal effects,
   different verification rules, and different user consequences.
2. Because the comment period is closed and a final rule will follow, anything the IFC leaves to
   state option is a **configuration axis**, not a fixed value. HourKeep currently hardcodes several
   of these.

---

## 2. Source hierarchy

Research findings will be tagged with their authority tier. Only Tier 1 may drive compliance logic;
Tier 3 may only inform UX and copy.

| Tier | Sources | Use |
|---|---|---|
| **1 — Binding** | The regulatory text of CMS-2454-IFC (42 CFR §§ 435.550–435.563 and amended sections); Public Law 119-21 § 71119 / SSA § 1902(xx) | Drives calculation logic, data model, required fields |
| **2 — Official interpretive** | IFC preamble (§§ II.A–II.O); CMS fact sheet; medicaid.gov *Community Engagement* guidance page; medicaid.gov IFC overview deck (July 2026); any CMS SPA templates, verification-plan templates, or State Health Official letters | Resolves ambiguity, supplies CMS's own worked examples and intent |
| **3 — Secondary / contextual** | State implementation plans and vendor announcements; policy analyses (KFF, CBPP, Georgetown CCF, AEI, NORD); public comments on the docket; trade press | Informs UX, export formats, and prioritization only. Never cited as a rule |

**Local copies already acquired:**
`docs/domain/cms-2454-ifc/2026-11094.xml` (945 KB) ·
`2026-11094.txt` (plain text, 4,883 lines) ·
`SECTION-INDEX.txt` (184 headings with line numbers for navigation)

---

## 3. Research questions

Grouped to map directly onto HourKeep's subsystems. Each answer must carry a CFR or FR-page citation.

### A. Scope — who is subject (§ 435.551, § 435.119)
- A1. Exact definition of "applicable individual," including the age boundaries and how age is
  determined at the month level.
- A2. Which eligibility groups are in scope; how § 435.119 changed.
- A3. How the rule treats someone who becomes newly subject mid-enrollment.
- A4. Does anything here contradict HourKeep's 19–64 assumption or its 16-year age gate?

### B. Qualifying activities and thresholds (§ 435.552)
- B1. Definitive list of qualifying activities and their regulatory definitions: work, community
  service, work program, educational program.
- B2. Is 80 hours the total across activities, or per activity? Confirm the combination rule.
- B3. **Educational program: half-time vs less-than-half-time.** The IFC treats these separately
  (preamble §§ II.C.5 and II.C.6). What does less-than-half-time enrollment yield?
- B4. **Monthly income pathway**: exact threshold, how it is defined (is it $580 flat? tied to the
  federal minimum wage? MAGI-based?), what income counts, and what period it is measured over.
- B5. **Average monthly income for seasonal workers** (§ II.C.8): who qualifies as seasonal, what
  averaging window, what divisor, and how partial history is handled.
- B6. Any rounding, minimum-increment, or attestation rules for hours.
- B7. Is there a "deemed compliant via SNAP/TANF" mechanic distinct from the exclusion?

### C. Mandatory exceptions (§ 435.553)
- C1. Full enumerated list.
- C2. What "deemed compliant" means operationally versus being excluded.
- D-cross: how the app should present the difference to a user.

### D. Specified excluded individuals (§ 435.554)
- D1. Full enumerated list with regulatory definitions.
- D2. **Former foster care children** — a category HourKeep entirely lacks. Definition and age bounds.
- D3. **American Indians** — how the IFC defines the class (Indian, Urban Indian, California Indian,
  IHS-eligible) and any verification specifics.
- D4. **The caregiver cluster** — separate definitions for caretaker relative, parent, guardian,
  family caregiver, dependent child, disabled individual (§§ II.E.3.a–h). HourKeep collapses all of
  this into two yes/no questions.
- D5. **Multiple individuals in a residence** (§ II.E.3.g) — can more than one adult claim the same
  dependent? What is the rule?
- D6. **Criteria for the family caregiver exclusion** (§ II.E.3.h).
- D7. **Medically frail** — the full definition (§ II.E.5.b runs ~155 lines). Enumerate every
  sub-category.
- D8. Veteran with disability rated as total — exact standard.
- D9. TANF-compliant vs "not exempt from SNAP work requirements" — note the asymmetric phrasing;
  HourKeep asks a single conflated question.
- D10. Drug/alcohol rehabilitation participant, inmate of a public institution (including the
  post-release window), pregnant or entitled to postpartum coverage.
- D11. For each: does the exclusion expire, and does anything trigger re-screening?

### E. Short-term hardship exceptions (§ 435.555)
- E1. Is this a state option? If a state does not elect it, what happens?
- E2. The four event types: medical institution / outpatient services; emergency and disaster areas;
  areas with certain unemployment levels; travel outside community for serious or complex condition.
- E3. Which are automatic (geographic) versus request-based.
- E4. Request procedures, accepted channels, duration, and documentation.
- E5. How a hardship interacts with the monthly compliance determination.

### F. Assessing compliance (§ 435.556)
- F1. **Lookback at application** — how many months, and is it state-configurable?
- F2. **Lookback at renewal** — the two options described in the preamble.
- F3. More-frequent-verification option and what it changes.
- F4. Prohibition on assessing compliance for specified excluded individuals (§ II.H.3.c) — this
  implies the app should suppress tracking UI for excluded users, which HourKeep does not do.
- F5. Changes in circumstances handling.

### G. Verification (§ 435.557)
- G1. Ex parte verification requirement and what data sources states must try first.
- G2. What states must **accept** from beneficiaries (§ II.I.3.a) — this defines HourKeep's target
  output format.
- G3. Per-activity verification specifics: hours of work, hours for certain caregivers, community
  service, work program, educational enrollment, combination, monthly income.
- G4. Per-exclusion verification specifics.
- G5. Self-attestation — where is it permitted, and where is documentation required?

### H. Noncompliance (§ 435.558)
- H1. Notice of noncompliance: trigger, content, timing.
- H2. The response window — confirm the 30-day figure and when the clock starts.
- H3. What constitutes a "satisfactory showing."
- H4. Consequences, reenrollment, and reconsideration periods.
- H5. Coverage continuation during the window.

### I. Timing, options, and state variation (§§ 435.559, 435.560, 435.563)
- I1. Implementation date mechanics and treatment of beneficiaries enrolled at implementation.
- I2. Good faith effort exemption: criteria, duration, and which states are likely to use it.
- I3. § 435.563 prohibition of waivers — what it forecloses.
- I4. **Consolidated list of every state-configurable parameter.** This becomes HourKeep's
  configuration schema.

### J. Outreach and notices (§ 435.561)
- J1. What states must tell beneficiaries and through which channels.
- J2. What a real notice will look like, so HourKeep's "did you get a notice?" flow matches reality.

### K. Practical implementation landscape (Tier 3)
- K1. Which states have published implementation plans, and what choices did they make on the
  configurable parameters?
- K2. What vendors are building, and what beneficiary-facing submission formats are emerging?
- K3. Are any states electing early implementation before January 1, 2027?
- K4. Known friction points from the 79,718 comments and from the Georgia/Arkansas/New Hampshire
  precedents.

---

## 4. Extraction schema

Every Tier 1/2 finding gets recorded in this shape so the gap analysis is mechanical rather than
impressionistic:

```
- id:              stable slug, e.g. "excl-former-foster-care"
  tier:            1 | 2 | 3
  citation:        "42 CFR 435.554(a)(3)" + FR page
  category:        scope | activity | mandatory-exception | exclusion | hardship |
                   assessment | verification | noncompliance | config | outreach
  rule:            what the law requires, in precise terms
  plain_language:  8th-grade rendering for UI copy
  state_option:    true | false  (+ the permitted range if true)
  hourkeep_today:  what the app currently does
  gap:             none | partial | missing | contradicts
  impact:          blocks-compliance | misleads-user | incomplete | cosmetic
  affected_code:   file paths
```

---

## 5. Deliverables

| # | Artifact | Path |
|---|---|---|
| 1 | Authoritative rule extract, section by section with citations | `docs/domain/cms-2454-ifc/rule-extract.md` |
| 2 | Consolidated state-configurable parameter list | `docs/domain/cms-2454-ifc/state-options.md` |
| 3 | Implementation landscape notes (Tier 3) | `docs/domain/cms-2454-ifc/landscape.md` |
| 4 | Rewritten domain steering doc | `.kiro/steering/medicaid-domain-knowledge.md` (with a changelog of what the IFC changed vs the statute-only reading) |
| 5 | Gap analysis: HourKeep vs source of truth | `docs/audit/gap-analysis-2026-08.md` |
| 6 | Wave-based implementation plan | `docs/audit/implementation-waves.md` |

---

## 6. Method

1. **Regulatory text first.** Read `2026-11094.txt` lines ~3700–4802 — the binding CFR text — before
   any preamble. Build the rule extract skeleton from it.
2. **Preamble for interpretation.** Work through §§ II.A–II.O to fill in definitions, CMS's worked
   examples, and rationale. This is where the caregiver and medically-frail detail lives.
3. **Cross-check against Tier 2** official summaries to catch anything misread.
4. **Landscape sweep** (Tier 3) via targeted web research.
5. **Gap analysis** by walking the extraction schema against the audit at
   `docs/audit/codebase-audit-2026-08.md`.
6. **Wave plan**, interleaving domain-compliance work with the technical debt from the audit, since
   several domain changes are blocked by technical defects (for example, lookback periods cannot be
   built while the app is pinned to the current month).

---

## 7. Explicit non-goals

- Not drafting a public comment on the docket (the period has closed).
- Not implementing anything during the research phase.
- Not attempting to make HourKeep a system of record or to claim it determines eligibility. It
  remains a beneficiary-side documentation aid.
