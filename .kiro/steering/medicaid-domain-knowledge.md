# Medicaid Community Engagement — Domain Knowledge

**Authority:** CMS-2454-IFC (91 FR 33348, June 3, 2026), effective July 31, 2026, implementing
SSA § 1902(xx) as added by § 71119 of Public Law 119-21.
**Codified at:** 42 CFR §§ 435.550–435.563.
**Full cited extract:** `docs/domain/cms-2454-ifc/rule-extract.md` — read that for detail and citations.
**Last revised:** August 16, 2026 (rewritten against the IFC; the prior version was statute-only).

---

## Read this first

Three rules govern all development on HourKeep.

1. **HourKeep does not determine anyone's status.** States determine eligibility, exclusions, and
   compliance. HourKeep helps a person **assemble, organize, and present evidence**. Never write copy
   or logic that asserts a verdict. Say "you may qualify," "here is what to gather," "ask your agency."
2. **Never hardcode a policy value.** Every threshold, lookback length, and averaging window is either
   statutory-but-dynamic or a State election. All of them live in the policy profile module. See
   `docs/hr1-readiness/decisions/ADR-0001-policy-profile-architecture.md`.
3. **Say "community engagement," not "work requirements,"** in code, types, and documentation. CMS
   calls PL 119-21 the "Working Families Tax Cut (WFTC) legislation." User-facing copy may say "work
   requirements" where it genuinely aids comprehension, but the domain model uses CMS terminology.

---

## Timeline

| Date | Event |
|---|---|
| July 31, 2026 | IFC effective. Already in force |
| July–Sept 2026 | States must send initial outreach notices (4–6 months before implementation) |
| **January 1, 2027** | **States must implement.** Some are earlier |
| **January 1, 2028** | **Documentation hardening.** States must require documentation whenever reasonably available |
| December 31, 2028 | Last possible expiry of any good-faith-effort exemption. Cannot be extended |

**Scope:** the 50 States and DC. **Not the territories.**

**44 jurisdictions in scope: 43 States + DC.** Includes three non-expansion States — **Georgia,
Tennessee, Wisconsin** — plus § 1115 populations inside **Hawaii, Massachusetts, New York, Oregon, Utah**.
**Out of scope:** Alabama, Florida, Kansas, Mississippi, South Carolina, Texas, Wyoming.

**Nebraska went live May 1, 2026 and has already disenrolled people.** Montana and Arkansas July 1, 2026
(Arkansas a soft launch, no disenrollment before January 2027). Iowa December 1, 2026.

> **The January 1, 2027 cliff is softer than it looks.** Applications filed **before** the implementation
> date are adjudicated under the prior rules. "Renewal initiated" means when ex parte review begins, and
> CMS explicitly rejected an end-date trigger — so someone whose renewal is due January or February 2027
> may not face community engagement until **mid-2027**. **The population exposed in early 2027 is new
> applicants** (assessed on the months immediately preceding application, i.e. December 2026) **and anyone
> in an early-implementing State.**

**Documentation hardening is per-State, not national.** Federally it is January 1, 2028. But **eight
States will require medical-frailty documentation from January 2027**: Arkansas, Idaho, Indiana, Iowa,
North Carolina, North Dakota, Ohio, Utah.

**Litigation to watch.** *Massachusetts v. Oz* (D. Mass., filed June 2026, 26 plaintiffs) targets the
medically-frail functional gate and the attestation narrowing. Preliminary injunction **denied** July 2026;
**summary judgment hearing October 20, 2026.** No injunction in effect — the rule is operative — but build
medically-frail logic expecting it to move.

---

## Who is subject — the three-tier model

This replaces the old flat "exempt / not exempt" idea. The three tiers have different legal effects.

### Tier 1 — Specified excluded individual (§ 435.554)

**Not an applicable individual at all.** Community engagement is not a condition of eligibility.
The State is **prohibited** from assessing their compliance (§ 435.556(c)).

**Exclusion always wins.** § 435.557(c)(2) requires the State to find exclusion whenever it has
sufficient information, *even if the person also demonstrated compliance*.

The ten categories:

1. **Former foster care children** — under 26; not enrolled in a § 1902(a)(10)(A)(i)(I)–(VII) group;
   in foster care under any State's responsibility at age 18 (or higher State-elected age); enrolled
   in Medicaid in any State while in foster care. CMS applies the SUPPORT Act criteria **regardless of
   when the person turned 18**.
2. **American Indians** — per the definition at 42 CFR 447.51 (Indian, Urban Indian, California
   Indian, IHS-eligible). **States must not reverify this status.**
3. **Parent, guardian, caretaker relative, or family caregiver** of a dependent child 13 or under, or
   of a disabled individual. See the caregiver cluster below.
4. **Veteran with a disability rated as total** — temporary *or* permanent, rated 100% under
   38 U.S.C. 1155.
5. **Medically frail or otherwise has special medical needs** — see below.
6. **Compliant with TANF work requirements** under SSA § 407.
7. **Member of a household receiving SNAP who is not exempt from a SNAP work requirement.**
   Note the construction: the test is being *subject to* SNAP work requirements, **not complying with
   them**, and it keys on **household** SNAP receipt.
8. **Participating in a drug addiction or alcoholic treatment and rehabilitation program**
   (7 U.S.C. 2012(h)). States may set a minimum time commitment.
9. **Inmate of a public institution** (§ 435.1010).
10. **Pregnant or entitled to postpartum coverage** (SSA § 1902(e)(5) or (16)).

### Tier 2 — Mandatory exception (§ 435.553)

Still an applicable individual, but **deemed to have demonstrated** community engagement for a month.
Triggered by **part or all** of a month.

- under age 19;
- entitled to or enrolled for Medicare Part A, or enrolled for Part B;
- described in any mandatory coverage group at § 1902(a)(10)(A)(i)(I)–(VII);
- **was a specified excluded individual**; or
- was an **inmate of a public institution at any point in the 3-month period ending on the first day
  of that month**.

**The transition protection that matters:** because prior exclusion is itself a mandatory exception,
someone who *loses* exclusion status is deemed compliant for every month in the review period during
which they were excluded. A parent whose child turns 14 mid-period is protected.

### Tier 3 — Optional short-term hardship exception (§ 435.555)

**State option.** If elected, the State must offer **all four** event types — no subsets. Must not be
applied to specified excluded individuals.

| Event | Request required? |
|---|---|
| Receiving inpatient/institutional or similar-acuity services | **Yes** |
| County with a Presidentially declared emergency or disaster | **No — automatic** |
| County unemployment at or above the lesser of 8% or 1.5× national | **No — automatic** |
| Travel outside the community for an extended period for a serious/complex condition | **Yes** |

The travel event covers the individual **or their dependent**. If the dependent travels alone, the
individual must show they took leave or absented themselves for related reasons.

### Applicable individual (§ 435.551)

Someone who is **not** excluded and who is enrolled or eligible under § 435.119 (the expansion/adult
group), or under a § 1115(a)(2) demonstration providing minimum essential coverage and is 19–64, not
pregnant, not on Medicare, and not otherwise eligible under the State plan.

> **The adult group is not "single adults."** It is the ACA expansion group: adults 19–64 at or below
> 133% FPL not described in a mandatory group. It includes **parents** whose income exceeds the
> § 435.110 threshold. A parent whose youngest child is 14 or older is an applicable individual.

---

## The caregiver cluster (§ 435.554(a) and (c)(3))

Six interlocking definitions. HourKeep must not collapse these into one question.

- **Dependent child** — a child **13 or under** who relies on another individual for care.
- **Disabled individual** — meets the **ADA definition at 28 CFR 35.108**. Explicitly **need not** be
  Medicaid-eligible on the basis of disability.
- **Parent** — legal mother or father, including by adoption, **who provides some level of care**.
- **Guardian** — an adult **appointed by a court**.
- **Caretaker relative** — a relative by blood, adoption, or marriage **living with** the person and
  **assuming primary responsibility** for their care, drawn from an enumerated relationship list.
  States may optionally extend the list (§ 435.554(a)(iv)).
- **Family caregiver** — an adult family member **or other individual** with a significant
  relationship who provides a broad range of assistance.

**Family caregivers must additionally meet one of three criteria:**

| | Resides with? | Related? | Requirement |
|---|---|---|---|
| (A) | Yes | — | Assistance on a regular basis, not solely incidental |
| (B) | No | Yes | Assistance on a regular basis, not solely incidental |
| (C) | No | No | **≥ 80 hours per month** of non-incidental assistance |

**Multiple adults in one residence may each qualify** (§ 435.554(c)(3)(ii)).

**Important interaction:** a family caregiver who fails (C) because they provide fewer than 80 hours
to an unrelated person they don't live with **still counts those hours as unpaid work** under
§ 435.552(b). CMS's example: 55 caregiving hours + 25 other hours = compliant.

---

## Medically frail (§ 435.554(c)(5))

**Two-part test. The gate is functional, not diagnostic.**

*Gate:* the individual's physical, mental, or other behavioral health condition **significantly
impairs their ability to comply with the community engagement requirement**. CMS is explicit that
diagnosis alone is insufficient — someone who can perform 80 hours per month despite their condition
does not qualify.

*And* one of:

- **(A)** blind or disabled per SSA § 1614;
- **(B)** substance use disorder, **excluding individuals in stable recovery** (5+ years). Applies
  regardless of active treatment; includes early (< 1 yr) and sustained (1–5 yr) recovery. States must
  allow self-identification **including after a relapse**;
- **(C)** disabling mental disorder;
- **(D)** physical, intellectual, or developmental disability significantly impairing **one or more
  activities of daily living**;
- **(E)** serious or complex medical condition (an extensive qualifier list — see the rule extract).

**States must** maintain an auditable, regularly revised list of qualifying conditions **and** a
process for people whose condition is not on the list to request consideration. HourKeep should tell
users that this request path exists.

Distinct from the Alternative Benefit Plan medically-frail definition at § 440.315(f). Do not conflate.
Handling this data triggers HIPAA and **42 CFR part 2** (substance use disorder records).

---

## Demonstrating community engagement (§ 435.552)

Seven pathways. **States must make all seven available.**

| Pathway | Threshold |
|---|---|
| Work | ≥ 80 hours |
| Community service | ≥ 80 hours |
| Work program | ≥ 80 hours |
| Educational program **at least half-time** | **no hours required** |
| Combination of the above | ≥ 80 hours total |
| Monthly income | ≥ federal minimum wage × 80 |
| Seasonal worker average monthly income over the **preceding 6 months** | ≥ federal minimum wage × 80 |

### Work is broad

Three components: work for money; **in-kind work** (compensation as housing, meals, utilities);
and **unpaid work** other than community service. Includes self-employment, business ownership,
independent contracting, unpaid internships, unpaid job trial periods, and sub-threshold family
caregiving hours.

### Community service has a record schema

Must be with a **structured program**, for the direct benefit of the community, under public or
nonprofit auspices, **non-partisan**. Voluntary **or court-ordered** both count. Embedded
skill-building counts. **States may not restrict this to § 501(c)(3) organizations.**

The organization must track: **activity type, dates, hours, and a point of contact who can confirm
the hours.** CMS's verification guidance adds **organization name and address** and the POC's
**phone and/or email**. This is HourKeep's target capture schema.

Does *not* count: helping one specific person outside a broader community effort; attending your own
child's school events; recreational clubs; partisan campaigning.

### Work program is a closed list of five

WIOA title I; Trade Act § 236; State/local employment and training meeting Governor-approved standards
(including SNAP E&T); DOL or VA veterans programs; SNAP workforce partnerships.

**Standalone supervised job search or job search training does not qualify** — but may be a
**subsidiary** activity if under half the program's required hours. Unemployment-insurance job search
can count if conducted consistently with work program requirements. Health-provider-operated programs
and Medicaid § 1915(c)/(i) supported employment do **not** qualify.

### Education: half-time is a cliff, not a slope

- **At least half-time → compliant, zero hours required, and may NOT be combined** with other activities.
- **Less than half-time → convert to hours and combine.**

Enrollment status is **determined by the school**, not the State or the user. It begins the first day
of term, continues through vacation and recess at the pre-break status, and ends at the end of the
month of expulsion, withdrawal, non-registration, or graduation.

Credit-hour conversion (Carnegie Unit):

```
monthlyHours = creditHours × 3 × 4.33
```

1 credit = 12.99 hrs · 3 credits = 38.97 hrs · 6 credits = 77.94 hrs

Non-credit-hour programs count actual class and activity hours 1:1.

Qualifying programs: institutions of higher education; career and technical education; **high school**;
**State-approved high school equivalency (GED)** programs. Independent self-study outside a
State-approved program does not qualify.

### Income is MAGI-based household income

> This is the single most misunderstood part of the rule. Read carefully.

§ 435.552(f)(2) requires **MAGI-based income (§ 435.603(e)) for the MAGI-based household
(§ 435.603(d) and (f))**. That means:

- **Earned *and* countable unearned income.** Unemployment compensation, taxable interest and
  dividends, rental income, and Social Security benefits including the non-taxable portion (so SSDI)
  generally count. **SSI does not. Child support does not.** § 435.603(e) has its own exclusions —
  scholarship income used for education, certain AI/AN income, lump sums counted only in the month received.
- **Household-based**, following **tax filing relationships**, not residence. A spouse's income counts. A
  person claimed as a tax dependent has the claiming taxpayer's household income counted.
- **But not literally everyone.** § 435.603(d) **excludes** the MAGI-based income of children and tax
  dependents who are not expected to be required to file a tax return. A teenager's part-time wages
  generally do not count. An earlier version of this document said "the total income of everyone in the
  household" — that was wrong, and wrong in the direction that overstates income.
- **Composition is per-person and asymmetric** (§ 435.603(f)). There is no single "the household," only
  *the applicant's* household. Two adults in one dwelling can have different MAGI households.
- Evaluated **for each month of the review period**, not the month of application.

> **§ 435.603 is pre-existing regulation and is not extracted in this repo.** These claims trace to the
> IFC's characterization of it. Verify against § 435.603 itself before relying on any specific inclusion or
> exclusion in user-facing copy.

CMS explicitly **considered and rejected** counting only earned income.

**Consequence HourKeep must surface:** a married applicable individual whose spouse works may already
satisfy the income pathway **without working a single hour**. Telling that person to go find 80 hours
of volunteering is a harmful false negative.

**HourKeep must not compute a household MAGI figure.** It lacks household composition and tax data,
and a confidently wrong number is worse than silence. Ask the three screener questions (married?
claimed as a tax dependent? others in your tax household?), explain that the pathway is household-based,
and direct the user to ask their agency.

**Threshold:** `federalMinimumWage × 80`. In 2026 that is **$7.25 × 80 = $580**. The value is dynamic
if the FLSA is amended. States **may not** use the tipped wage, the $4.25 youth wage, or a State
minimum wage even if higher.

### Seasonal workers

**Seasonal worker** is an objective legal test under 26 U.S.C. 45R(d)(5)(B) → 29 CFR 500.20(s)(1):
labor exclusively performed at certain seasons or periods of the year that by its nature may not be
continuous, plus retail workers employed exclusively during holiday seasons. **Not self-declaration.**

Two computation paths:

1. **State elects a "reasonably predictable changes" methodology** (§ 435.603(h)(3)) — most do.
   Income is prorated across up to 12 months.
2. **State does not** — average the **6 months preceding the month being assessed**. The assessed
   month is **excluded**.

CMS example: apply in July with a 1-month review period → review month is June → average December
through May.

### The income-to-hours proxy

§ 435.552(e)(2): when income is **below** the threshold and the agency lacks hours documentation, it
**may** credit `workHours = monthlyIncome ÷ federalMinimumWage` and combine with other activities.
CMS example: $380 ÷ $7.25 = 52 hours, needing 28 more.

**This means hours and income are not mutually exclusive.** Any HourKeep design that forces an
either/or choice is stricter than the law and against the user's interest.

---

## Review periods (§ 435.556)

**Threshold question first:** excluded or applicable? Determined as of the month of application, or
when the State processes the renewal. If excluded, the State must not assess any prior month.

| Context | Review period | Months required |
|---|---|---|
| **Application** | The **1–3 consecutive months immediately preceding** the month of application, per the State plan | All elected months |
| **Renewal** | The eligibility period | ≥ 1, **not necessarily consecutive** |
| **More frequent verification** (State option) | Between verifications | ≥ 1, **not necessarily consecutive** |
| **Became applicable mid-period** | Last determination → **end of the month before** they enter the CE-subject group | Lesser of elected months or months available |

**"Whether or not consecutive" is not State discretion.** CMS interprets it to forbid States from
requiring consecutive months at renewal *or* dictating which specific months count. Any qualifying
month in the review period counts — user-favorable, and HourKeep should say so.

---

## Verification (§ 435.557)

**Ex parte always first.** The State must exhaust "reliable information available to the State" before
asking the individual for anything. That includes payroll data, **adjudicated claims from the preceding
12 months (paid, pended, or denied)**, and **encounter data**.

**Documentation posture:**

| Period | Rule |
|---|---|
| Through Dec 31, 2027 | The State **may** require documentation **or** accept other information |
| **From Jan 1, 2028** | The State **must require documentation whenever reasonably available** |

Always: the State **must accept other information** when no documentation is reasonably available, and
**may not deny or terminate solely** because someone cannot produce documentation that doesn't exist.

**Documentation CMS names as reasonably available:** paystubs; a document from a community service
organization; transcripts or class schedules; a VA disability document; SNAP or TANF approval notices.

**Documentation CMS says often doesn't exist:** family caregiving (outside any employment or
contractual relationship); records lost to fire or flood.

**Submission channels (§ 435.907(a)):** online, telephone, mail, in person, and other commonly
available electronic means. **Who may submit:** the individual; an adult in their household or family;
an authorized representative; or someone acting responsibly if they are incapacitated.

**Medically frail verification:** claims and encounter data first. A penalty-of-perjury statement may
be accepted each time through 2027, but **only once per period of enrollment** from January 1, 2028.
Must be reverified at least every 12 months.

---

## Noncompliance (§ 435.558)

- **30 calendar days** from **receipt** of the notice, and the notice is **deemed received 5 days
  after its date** — so roughly **35 days** from the notice date.
- **Coverage continues** until the person is determined ineligible.
- The person may show **either** compliance/deemed compliance **or** that the requirement doesn't
  apply to them (not an applicable individual / is excluded).
- The notice must state **which months** are being assessed, how to show compliance, the deadline, how
  to submit, consequences for Medicaid **and APTC/PTC**, and how to reapply.
- Before denial, the State must **consider all other bases of eligibility**.
- Disenrollment happens **no later than the end of the month following** the month the 30-day period ends.
- **No restriction on reapplying.**
- **90-day reconsideration** without a new application if the missing information is submitted.

---

## Renewal frequency — a known ambiguity

The IFC revises § 435.916 to say MAGI renewals happen every 12 months and no more often. Its own
preamble says the adult group is subject to **6-month** renewals from January 1, 2027 under
§ 1902(e)(14)(L) — a different section of PL 119-21 that this rule does not implement, and which does
**not** apply to American Indians or most § 1115 enrollees.

Treat 6 months as operative for the adult group, flag it as sourced elsewhere, and watch for the
reconciling rulemaking.

---

## State-configurable parameters

Full table with ranges and defaults: `docs/domain/cms-2454-ifc/state-options.md`.
Never hardcode any of these. They belong in the policy profile.

Headline elections: application lookback (1–3 months); renewal months required (≥ 1); more frequent
verification (elect/decline + frequency); short-term hardship (all four or none); income-to-hours
proxy; reasonably-predictable-changes methodology; optional caretaker relative relationships; the
medically frail condition list; rehab minimum time commitment; implementation date.

**What most States chose:** the least restrictive configuration — 1-month lookback at both application
and renewal. Idaho, Indiana, and New Hampshire legislated longer lookbacks; Indiana and New Hampshire
also do quarterly checks.

---

## Constraints worth remembering

- **§ 435.563:** CMS will not approve any § 1115 waiver of the community engagement provisions, in
  whole or in part. There is no waiver path.
- **§ 438.58(b):** a State may not use an MCO or contractor to determine compliance unless that entity
  has no financial relationship with an MCO serving its enrollees.
- **§ 435.562:** States must report population counts of individuals subject to the requirement **and
  their manner of compliance**.

---

## Writing for users

Plain language, around an 8th-grade reading level. The three-tier architecture from the terminology
realignment still applies: authoritative wording in the question, plain-language translation in help
text, full definitions in an expandable callout.

**Do**
- "You may not have to do anything — let's check."
- "Work, volunteering, school, or job training — 80 hours a month total."
- "If you're in school at least half-time, that's enough on its own."
- "Your state counts your whole household's income here, not just yours. Ask them what they have on file."
- "Take a photo of your pay stub."
- "You have about 35 days to respond. Your coverage continues while you do."

**Don't**
- "You are exempt." → HourKeep cannot determine this.
- "You are compliant." → the State determines this.
- "Engage in qualifying community engagement activities for 80 hours monthly."
- "Exclusion criteria per 42 CFR 435.554(c)(5)(i)(B)."
- "Only earned income counts." → factually wrong.

---

## What changed from the previous version of this document

The prior version was built from the statute alone. Corrections:

1. **Income is MAGI-based household income**, not individual earned income. The old "what counts /
   what doesn't" list was wrong — unemployment, investment, and rental income count; SSDI generally counts.
2. **Georgia and Wisconsin are in scope.** They were previously listed among non-expansion states.
   **44 jurisdictions (43 States + DC)** must implement, and **Tennessee** was also missing.
3. **One "exemption" concept became three tiers** with different legal effects.
4. **Former foster care children** is an exclusion category that was entirely missing.
5. **Education at least half-time requires no hours** and cannot be combined. Less-than-half-time has
   a specific credit-hour formula.
6. **Work includes in-kind and unpaid work**, not just paid employment.
7. **Seasonal averaging excludes the assessed month**, and "seasonal worker" is an objective test.
8. **Hours and income can combine** via the income-to-hours proxy.
9. **The SNAP test is "not exempt from," not "complying with,"** and it is household-based.
10. **Medically frail has a functional-impairment gate** and excludes SUD in stable recovery of 5+ years.
11. **New dates:** January 1, 2028 documentation hardening; December 31, 2028 good-faith-effort ceiling.
12. **The 30-day response window is effectively 35** because of the 5-day receipt presumption.
13. **The territories are out of scope entirely.**
