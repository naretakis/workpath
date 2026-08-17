# CMS-2454-IFC — Authoritative Rule Extract

**Source:** Medicaid Program; Community Engagement Requirement for Certain Individuals
**Citation:** 91 FR 33348–33482 (June 3, 2026) · FR Doc. 2026-11094 · RIN 0938-AV98
**As corrected at:** **91 FR 39028 (June 29, 2026), FR Doc. C1-2026-11094** — republishes **§ 435.557 and
§ 435.558 in their entirety.** The change is editorial (a misplaced § 435.557(c)(2) block relocated, one
merged-word typo), but **paragraph designations inside § 435.557 shifted.** Cite the pair.
**Effective:** July 31, 2026 (already in force)
**Comment period:** Closed July 31, 2026 · Docket CMS-2026-2047
**Implements:** SSA § 1902(xx), added by § 71119 of Public Law 119-21
**Creates:** 42 CFR §§ 435.550–435.563
**Local source:** `2026-11094.txt` (plain text) · `SECTION-INDEX.txt` (navigation)
**Validated:** August 16, 2026 — see `../../audit/validation-findings-2026-08.md` § G for the corrections
folded in and for content this extract still omits.

> **Two caveats on using this document.**
> 1. It extracts the **IFC only.** The income pathway depends on **§ 435.603** (MAGI methodology), which is
>    pre-existing regulation. **Its text is now extracted at
>    [`../supporting-regs/README.md`](../supporting-regs/README.md) § 1** (added 2026-08-16, commit
>    `b9b9594`). **For any household-income or countable-income claim, cite that document, not this one.**
>    Anything § 435.603-related in this file is the IFC's *characterization* of § 435.603 and is one source
>    tier down.
> 2. Where this document breaks out § 435.603 into `(d)`, `(e)`, `(f)`, that breakdown is **preamble**.
>    The regulatory text at § 435.552(f)(2) and (g)(2) says only "as defined at § 435.603."
>    One such gloss — "the total income of everyone in the household" — was **wrong and user-unfavorable**,
>    and is corrected in § 2.6 below. Treat every other (d)/(e)/(f) breakdown here with the same suspicion.

> **Terminology note.** CMS calls Public Law 119-21 the "Working Families Tax Cut (WFTC) legislation."
> The requirement is the **community engagement requirement**, not "work requirements." Use CMS
> terminology in code and docs; "work requirements" is acceptable in user-facing copy where it aids
> comprehension.

---

## 0. The three-tier status model

This is the single most important structural fact. HourKeep currently has one flat `isExempt`
boolean. The rule has **three legally distinct statuses** with different effects.

| Tier | CFR | Term | Legal effect | Key consequence |
|---|---|---|---|---|
| 1 | § 435.554 | **Specified excluded individual** | **Not an applicable individual at all.** Community engagement is not a condition of eligibility | State is **prohibited** from assessing compliance (§ 435.556(c)). Takes precedence over everything |
| 2 | § 435.553 | **Mandatory exception** | Still an applicable individual, but **deemed to have demonstrated** community engagement for a month | Applies per-month, for **part or all** of a month |
| 3 | § 435.555 | **Optional short-term hardship exception** | Deemed to have demonstrated, **at State option only** | Must not be applied to specified excluded individuals (§ 435.555(f)) |

Ordering rule (§ 435.557(c)(2)): the agency **must** determine specified excluded status whenever it
has sufficient information, **regardless of whether the individual also demonstrates community
engagement** or meets an exception. Exclusion always wins.

Interaction (§ 435.553(a)(4)): being a specified excluded individual **is itself** a mandatory
exception. So when someone loses exclusion status, they are deemed compliant for every month in the
review period during which they were excluded. This is the rule's main transition protection.

---

## 1. Applicable individual — § 435.551

An applicable individual is someone who **is not** a specified excluded individual (§ 435.554) **and** who is:

- (a) eligible to enroll or enrolled under the State plan at § 435.119 (the adult/expansion group); **or**
- (b) otherwise eligible to enroll or enrolled in a § 1115(a)(2) demonstration providing minimum
  essential coverage, **and** is:
  1. at least 19 and under 65 years of age;
  2. not pregnant;
  3. not entitled to or enrolled for Medicare Part A, or enrolled for Part B; and
  4. not otherwise eligible to enroll under the State plan.

**Scope:** applies to the 50 States and DC. **Does not apply to the territories** (§ 435.550).

**44 jurisdictions are in scope: 43 States + DC.** In June 2026 CMS published a list of § 1115 waiver
programs containing subject individuals, naming three non-expansion States — **Georgia, Tennessee, and
Wisconsin** — plus § 1115 populations inside five expansion States: **Hawaii, Massachusetts, New York,
Oregon, and Utah**. An § 1115 enrollee in those five may be subject even though the State also runs a
state-plan adult group.

**Out of scope:** Alabama, Florida, Kansas, Mississippi, South Carolina, Texas, Wyoming — and all
territories.

> Note the structural consequence: age 65+, pregnancy, and Medicare enrollment place a person
> **outside the definition entirely** rather than granting an "exemption." Age under 19 and Medicare
> also appear as mandatory exceptions in § 435.553, so there is deliberate belt-and-braces overlap.

---

## 2. Demonstrating community engagement — § 435.552

### 2.1 The seven pathways — § 435.552(a)

An applicable individual demonstrates community engagement **for a month** by meeting one or more of:

| # | Pathway | Threshold |
|---|---|---|
| 1 | Work | ≥ 80 hours |
| 2 | Community service | ≥ 80 hours |
| 3 | Work program participation | ≥ 80 hours |
| 4 | Enrolled in an educational program **at least half-time** | no hours required |
| 5 | Any combination of (1)–(4) | ≥ 80 hours total |
| 6 | Monthly income | ≥ federal minimum wage × 80 |
| 7 | Seasonal worker average monthly income over the **preceding 6 months** | ≥ federal minimum wage × 80 |

**States must make all seven available.** They may not offer only a subset.

### 2.2 Definitions — § 435.552(b)

**Work** — three components, any combination:
1. work in exchange for money;
2. work in exchange for goods or services ("in-kind" work);
3. **unpaid work**, other than community service.

Explicitly included: self-employment, business ownership, independent contracting; in-kind
compensation such as free or reduced rent for a property manager; unpaid internships; unpaid trial
periods when applying for a job; and **caregiving hours by a family caregiver who does not qualify
for the exclusion**.

**Community service** — unpaid work, voluntary **or court-ordered**, with a *structured program*,
for the direct benefit of the community, under the auspices of public or nonprofit organizations.
Includes embedded skill-building activities needed to perform the service.

The organization **must**:
- provide oversight of the activity;
- not serve a partisan purpose; and
- have a process to track: **activity type, dates, hours, and a point of contact who can confirm the hours**.

States **may not** restrict community service to § 501(c)(3) organizations. Local government
agencies, religious nonprofits, and small social service providers all qualify.

Does **not** include: helping a specific individual outside a broader community effort (helping a
friend move, a neighbor's yard work); attending your own child's parent-teacher conference or school
events; recreational clubs; partisan campaigning.

**Work program** — exactly five types:
1. Title I of WIOA (29 U.S.C. 3111 et seq.);
2. § 236 of the Trade Act of 1974;
3. State/political-subdivision employment and training program meeting Governor-approved standards,
   including SNAP E&T under § 6(d)(4) of the Food and Nutrition Act — **other than** a supervised job
   search or job search training program. Job search **may** be a subsidiary activity if it is **less
   than half** the program's required hours;
4. DOL or VA employment and training program serving veterans;
5. Workforce partnership under § 6(d)(4)(N) of the Food and Nutrition Act.

Excluded: programs operated by health providers; Medicaid § 1915(c)/§ 1915(i) supported employment
services (these do not independently satisfy the requirement). Unemployment-insurance job search
**can** count if conducted consistently with work program requirements.

**Educational program** — four types:
1. institution of higher education (HEA § 101, 20 U.S.C. 1001);
2. career and technical education program (Perkins § 3(5), 20 U.S.C. 2302(5));
3. **high school** (ESEA title VIII, 20 U.S.C. 7801 — grants a diploma, includes at least grade 12);
4. **State-approved program of study leading to a certificate of high school equivalence** (GED) for
   someone without a diploma.

Independent study and self-paced online preparation **outside** a State-approved program do **not**
qualify. Non-in-person State-approved programs must be able to monitor and document hours.

### 2.3 Enrollment status — § 435.552(c)

**Determined by the school or institution**, not the State. Full-time / half-time / less than half-time.

- Begins the **first day of the school term**.
- Continues through normal attendance, vacation, and recess. During breaks, status is based on the
  status **just prior to the break**.
- Ends at the **end of the month** in which the student is expelled, withdraws, completes the term
  without registering for the next one (excluding optional winter/summer sessions), or graduates
  (unless enrolled in another educational program).

Verification data source: the **National Student Clearinghouse** (states may connect or purchase).

### 2.4 Less-than-half-time education hours — § 435.552(d)

**Credit-hour programs** (Carnegie Unit standard):

```
weeklyHours  = creditHours × 3          // 1 hr instruction + 2 hrs out-of-class
monthlyHours = weeklyHours × 4.33       // 52 weeks ÷ 12 months
```

| Credit hours | Monthly hours |
|---|---|
| 1 | 12.99 |
| 2 | 25.98 |
| 3 | 38.97 |
| 4 | 51.96 |
| 5 | 64.95 |
| 6 | 77.94 |

**Non-credit-hour programs**: actual hours attending class and participating in educational
activities count 1:1 (1 hour instruction = 1 hour, 3 hours lab = 3 hours, etc.).

### 2.5 Combination of activities — § 435.552(e)

- Work, community service, and work program hours are **determined separately** based on time spent
  on the specific activity in that month, then **added together**.
- Education hours are combined **only if enrolled less than half-time**. If enrolled at least
  half-time, the individual has already demonstrated compliance under (a)(4) and combination is
  **not permitted**.
- **Income-to-hours proxy** — § 435.552(e)(2)(i)–(ii): if monthly income is **below** the threshold
  **and** the agency lacks hours documentation, the agency **may** credit work hours as:

  ```
  workHours = monthlyIncome ÷ federalMinimumWage
  ```

  CMS worked example: $380 ÷ $7.25 = 52 hours → individual needs 28 more hours from other
  activities. The agency must use a reasonable method to allocate hours **between household members**.
  This option may be used **only** when income is below the threshold and hours are unknown.

### 2.6 Monthly income — § 435.552(f) · **the largest divergence from HourKeep**

The threshold is `applicable federal minimum wage × 80`. In 2026 that is **$7.25 × 80 = $580**.

- The minimum wage is the one **in effect when the State applies the threshold** — so the value is
  dynamic if the FLSA is amended.
- States **may not** use the tipped wage (FLSA § 3(m)), the $4.25 youth introductory wage (FLSA
  § 6(g)), or a **State** minimum wage, even if higher. Only 29 U.S.C. 206(a)(1)(C).

**Income is MAGI-based household income**, not individual earned income:

> States must use the individual's MAGI-based income as defined at § 435.603(e), for their MAGI-based
> household as defined at § 435.603(d) and (f).

- Countable income under § 435.603(e) includes **earned income and countable unearned income**.
- Household income under § 435.603(d)(1) is the **sum of the MAGI-based income of every individual included
  in that individual's household** — **but (d)(2) excludes** the income of a child or tax dependent who **is
  not expected to be required to file a return** under IRC § 6012(a)(1), whether or not they actually file.
  And under § 435.603(f) composition follows **tax filing relationships rather than residence**, so it is
  **asymmetric and per-person**: two adults in one dwelling can have different households, and there is no
  "the household," only *this individual's* household.

  > ⚠️ **Source tier.** An earlier version of this line read "the total income of everyone in the household."
  > That is **CMS's preamble gloss** (91 FR 33348, at `2026-11094.txt:674`), **not the regulation**, and it
  > overstates income — the user-unfavorable direction, and exactly the error ADR-0003 exists to prevent. The
  > regulatory text is extracted at
  > [`../supporting-regs/README.md` § 1.1](../supporting-regs/README.md). **Cite that, not this section, for
  > any household-income claim.**
  >
  > This is also why HourKeep must not compute a household figure: the blocker is **eliciting** the user's
  > tax filing structure, not summing. See ADR-0003.
- CMS explicitly **considered and rejected** counting only earned income, reasoning that
  § 1902(e)(14)(A) mandates MAGI for "any other purpose applicable under the plan for which a
  determination of income is required," and § 1902(xx) does not override it.
- The income is evaluated **for each month of the review period**, not the month of application
  (§ 435.552(f)(2), applying § 435.603(h) to the review month).

### 2.7 Seasonal workers — § 435.552(g)

**Seasonal worker** is defined by 26 U.S.C. 45R(d)(5)(B): a worker performing labor or services on a
seasonal basis **as defined by the Secretary of Labor**, *including* workers whose employment "pertains to
or is of the kind exclusively performed at certain seasons or periods of the year and which, from its
nature, may not be continuous or carried on throughout the year" (29 CFR 500.20(s)(1)), **and** retail
workers employed exclusively during holiday seasons.

> **Those two categories are inclusive examples, not a closed test**, and the IFC provides **no
> verification rule for seasonal-worker status anywhere.** An earlier draft of this extract called it "an
> objective legal test, not self-declaration" — that was unsupported. The category is broader and softer
> than that, which is user-favorable.

**Two computation paths, depending on State election:**

1. **State elects a "reasonably predictable changes" methodology** (§ 435.603(h)(3)) — most states do.
   Income is prorated across up to 12 months. CMS example: $500 steady + $1,200 expected Oct–Dec
   → $1,200/12 = $100/month prorated → $600/month in every month of the year.

2. **State does not elect it** — use the **average over the 6 months preceding the month being
   assessed**. The assessed month is **not** included.

   CMS worked example: applicant files in **July**, State has a 1-month review period → review month
   is **June** → average income from **December through May**. With 2 months at $1,500:
   `$3,000 ÷ 6 = $500`, which is below $580 → **not** compliant for June.

   At renewal the window slides per month: assess July → average Jan–Jun; assess August → average
   Feb–Jul; assess September → average Mar–Aug.

---

## 3. Mandatory exceptions — § 435.553

A State **must deem** an applicable individual to have demonstrated community engagement for a month if:

**(a) for part or all of that month**, the individual was:
1. under the age of 19;
2. entitled to or enrolled for Medicare Part A, or enrolled for Part B;
3. described in **any mandatory coverage group in subclauses (I) through (VII) of § 1902(a)(10)(A)(i)**;
4. a **specified excluded individual** as defined at § 435.554.

**(b)** at any point during the **3-month period ending on the first day of that month**, the
individual was an **inmate of a public institution**.

Note the asymmetry: (b) is a **look-back** window, unlike (a) which is same-month.

CMS worked example for (b): released March 15; applies June 1; State has 1-month review period →
review month is May → check whether the individual was an inmate at any point in February, March, or
April → yes (March) → deemed compliant.

"A month" and "such month" mean **any month in the State's review period**.

---

## 4. Specified excluded individuals — § 435.554

### 4.1 Supporting definitions — § 435.554(a)

**Dependent child** — a child **13 years of age or under** who relies on another individual for care.

**Disabled individual** — meets the **ADA definition of disability at 28 CFR 35.108**. Explicitly
**need not** be eligible for Medicaid or any federal program on the basis of disability.

**Parent** — legal status of mother or father, including by adoption, under State law, **who provides
some level of care** to a dependent child or disabled individual.

**Guardian** — an adult **appointed by a court** to care for and make personal decisions for a
dependent child or disabled individual who cannot care for themselves.

**Caretaker relative** — a relative by blood, adoption, or marriage **with whom** the child or
disabled individual is living, who **assumes primary responsibility** for their care, and who is:
- (i) the dependent child's or disabled individual's father, mother, grandfather, grandmother,
  brother, sister, stepfather, stepmother, stepbrother, stepsister, uncle, aunt, first cousin,
  nephew, or niece;
- (ii) the disabled individual's husband, wife, son, daughter, stepson, stepdaughter, grandson, or
  granddaughter;
- (iii) the spouse of such parent or relative, **even after the marriage ends** by death or divorce;
- (iv) **at State option**, another relative by blood (including half-blood), adoption, or marriage;
  the domestic partner of the parent or other caretaker relative; or an adult with whom the person is
  living who assumes primary responsibility for their care. A State's elections for § 435.110 carry
  over here.

**Family caregiver** — an adult family member **or other individual** who has a significant
relationship with, and provides care within a broad range of assistance to, a dependent child or a
disabled individual.

### 4.2 The ten exclusion categories — § 435.554(c)

**(1) Former foster care children.** Meets the FFCC group description at § 1902(a)(10)(A)(i)(IX) as
amended by the SUPPORT Act (PL 115-271), **regardless of whether the individual turned 18 on or
after January 1, 2023**. Operative criteria: under age 26; not enrolled in a group described in
§ 1902(a)(10)(A)(i)(I)–(VII); was in foster care under the responsibility of **any** State upon
attaining age 18 (or higher State-elected age); and was enrolled in Medicaid in **any** State while
in foster care.

**(2) American Indians.** Meets the definition of "Indian" at **42 CFR 447.51**, which incorporates
Indian, Urban Indian, California Indian, and IHS-eligible. **States must not reverify this status** —
it is not subject to change.

**(3) Parent, guardian, caretaker relative, or family caregiver** of a dependent child 13 and under
or a disabled individual.

**Paid caregivers qualify.** The criteria apply "regardless of whether the individual is a paid or an
unpaid family caregiver," because the exclusion recognizes the time and responsibility, not the
compensation.

**Guardianship is the one basis where a document is mandatory now.** The pre-2028 latitude to accept
non-documentary information **does not apply** to verifying guardianship status — a court order or other
legal instrument is required.

For **family caregivers** specifically, one of three criteria at § 435.554(c)(3)(i) must be met:
- **(A)** primarily resides with the dependent child or disabled individual, providing assistance
  that occurs **on a regular basis and is not solely incidental**;
- **(B)** is a relative (per the caretaker relative list, but **without** the live-with and
  primary-responsibility requirements), provides regular non-incidental assistance, and **does not
  reside** with them;
- **(C)** **neither resides with nor is related to** the person, and provides **≥ 80 hours per month**
  of non-incidental assistance.

§ 435.554(c)(3)(ii): in residences with more than one parent, guardian, caretaker relative, or family
caregiver, **multiple individuals may each qualify**.

**Important interaction:** a family caregiver who fails (C) because they provide fewer than 80 hours
to a non-relative they do not live with **still counts those hours as unpaid work** under § 435.552(b)
and needs only enough additional activity to reach 80. CMS example: 55 caregiving hours + 25 other
hours = compliant.

**(4) Veteran with a disability rated as total.** A **temporary or permanent** disability from the VA
rated **100 percent (total)** under 38 U.S.C. 1155.

> **Includes TDIU.** Veterans receiving total disability based on **individual unemployability** — 100%
> compensation because they cannot secure or maintain substantial gainful employment — qualify **even
> though their combined rating is below 100%**, and must be treated the same as veterans with a 100%
> combined rating. **A screener asking only "is your rating 100%?" wrongly excludes them.** Ask about
> 100% *compensation*, not the combined rating alone.
>
> Reverification differs by type: a **permanent and total** rating **may not be reverified**; a
> **temporary** total rating **must be reverified at least every 12 months**.

**(5) Medically frail or otherwise has special medical needs.** Two-part test.

*Gate:* the individual's physical, mental, or other behavioral health condition **significantly
impairs their ability to comply with the community engagement requirement**. CMS is explicit that
diagnosis alone is insufficient — if a person can perform 80 hours per month notwithstanding their
condition, they do not qualify.

*And* one of:
- **(A)** blind or disabled as defined in SSA § 1614. (Blind = central visual acuity 20/200 or less
  in the better eye with a correcting lens. Disabled = unable to engage in any substantial gainful
  activity by reason of a medically determinable impairment expected to result in death or lasting
  ≥ 12 continuous months.)
- **(B)** has a substance use disorder, **excluding individuals in stable recovery**, defined as
  **in recovery for 5 or more years**. Applies **regardless of whether in active treatment**, and
  includes early recovery (< 12 months) and sustained recovery (1 to < 5 years). States must have
  reasonable processes for people to self-identify, **including after a relapse**.
- **(C)** has a disabling mental disorder.
- **(D)** has a physical, intellectual, or developmental disability that significantly impairs their
  ability to perform **one or more activities of daily living**.
- **(E)** has a **serious or complex medical condition** — life threatening; or seriously disabling
  without being life threatening; or causing significant pain or discomfort that seriously interrupts
  life activities; or requiring major time or effort from caregivers for a substantial period; or
  requiring frequent monitoring; or associated with severe or negative consequences for someone else;
  or affecting multiple organ systems; or requiring management to tight physiological parameters; or
  requiring coordination of multiple specialties; or requiring treatment carrying a risk of serious
  complications; or requiring adjustment in non-medical environments.

*State obligations* — § 435.554(c)(5)(ii): the State **must** develop an **auditable, justifiable**
list of diseases, diagnoses, disorders, or health conditions mapping to (A)–(E); **revise it
regularly**; and maintain **reasonable processes and criteria for individuals not on the list to
request consideration**.

CMS declined to let States add categories beyond the five. Homelessness alone does not qualify,
though a homeless person's SUD or disabling mental disorder may.

This definition is **distinct from** the Alternative Benefit Plan medically-frail definition at
§ 440.315(f) — do not conflate them.

**(6)** Compliant with State requirements imposed under **SSA § 407** (TANF work requirements).

**(7)** A **member of a household that receives SNAP** benefits under 7 U.S.C. 2015 **and is not
exempt from** a SNAP work requirement.
*Note the construction: the test is being **subject to** (not exempt from) SNAP work requirements —
not complying with them. And it keys on **household** SNAP receipt.*

**(8)** Participating in a **drug addiction or alcoholic treatment and rehabilitation program** as
defined in § 3(h) of the Food and Nutrition Act of 2008 (7 U.S.C. 2012(h)). **States may establish a
minimum time commitment** consistent with clinical guidelines. Distinct from the SUD medically-frail
exclusion, which does not require active treatment.

**(9)** An **inmate of a public institution** as defined at § 435.1010.

**(10) Pregnant or entitled to postpartum** medical assistance under SSA § 1902(e)(5) or (16).
**Verified by attestation** — under § 435.956(e) the State **must accept** an attestation of pregnancy or
postpartum entitlement unless it holds information that is not reasonably compatible with it. No document
needed.

> **§ 435.554(c)(1) qualifier worth stating:** the former-foster-care test requires that the person is not
> **enrolled** in a group described in § 1902(a)(10)(A)(i)(I)–(VII) — **"even if they meet the eligibility
> requirements for such group."** User-favorable.

---

## 5. Optional short-term hardship exceptions — § 435.555

**State option.** Elected and deselected via State plan / SPA.

**Two nested elections, not one.** The all-or-nothing rule bars a State from making a single circumstance
the **exclusive** basis for hardship — so an electing State cannot offer *only* the disaster event. But
**§ 435.555(d)(3), the unemployment event, is a second independent election on top of that.** The IFC is
explicit: a State that has elected hardship "is not required to implement the unemployment-related
exception when conditions are present," and implementing it "is optional for States that elect the
short-term hardship exception."

**Consequence: never tell someone in an 8%-unemployment county that an exception applies.** Two separate
State facts must both be true.

**Deselection *and expiration* are each an "action"** under § 431.201, requiring ≥ 10 days advance notice
and fair-hearing rights, with the § 435.561(c) outreach content attached. **Loss of specified excluded
individual status is also an "action"** with the same requirements.

**Dependent** (for this section only) — § 435.555(b)(1): a minor child of the applicable individual
living with them; **or** a tax dependent (whether or not a minor or resident); **or** someone for whom
the individual has been appointed guardian by a court.

### The four event types — § 435.555(d)

| # | Event | Request required? |
|---|---|---|
| 1 | Receiving institutional or similar-acuity services | **Yes** |
| 2 | County with Presidentially declared emergency or disaster | **No — automatic** |
| 3 | County with unemployment at or above the lesser of 8% or 1.5× national | **No — automatic** |
| 4 | Travel outside community for extended period for serious/complex condition | **Yes** |

**(1) Services** — inpatient hospital (§ 440.10); nursing facility (§ 440.155); ICF/IID (§ 440.150);
inpatient psychiatric including § 440.160 services for under-21 regardless of IMD status. Plus
"other services of similar acuity": critical access hospital inpatient (§ 440.170(g)); emergency
hospital inpatient (§ 440.170(e)); IMD inpatient; inpatient at other State-recognized non-Medicaid
facilities; and **(E) noninstitutional services that, but for their receipt, would likely have
resulted in the individual receiving the above** — regardless of setting. Use the § 440.2 definition
of "inpatient."

**(2) Emergency/disaster** — declared by the President under the National Emergencies Act
(50 U.S.C. 1601 et seq.) or the Stafford Act (42 U.S.C. 5121 et seq.). For NEA declarations the
emergency must affect the ability to demonstrate community engagement in the county, multiple
counties, or statewide; the State must notify CMS of its plan, and CMS reviews use.
**Duration** for Stafford Act events: first month the incident period begins through **at least** the
end of the month it ends, extendable with CMS approval on State request showing persisting barriers.

**(3) Unemployment** — requires a **State request to CMS** and a CMS determination, based on BLS data
or another reliable source such as a State labor department. Threshold: **lesser of** 8% or 1.5× the
national rate.

**(4) Travel** — the individual **or their dependent** must travel outside their community of
residence for an extended period (part or all of a month, or longer) for medical services to treat a
serious or complex medical condition (as defined at § 435.554(c)(5)(i)(E)) not available locally.

If the **dependent travels without the individual**, the individual must demonstrate having taken
leave from employment or absented themselves from community engagement activities for reasons
related to the dependent's condition or travel — for example taking the dependent to local
appointments in preparation, handling travel logistics, or maintaining primary responsibility for
communicating with the dependent's providers.

### Procedures — § 435.555(c)

For request-based events (1) and (4), the State must provide: notice of the request method; notice of
the request timeframe; a timely determination process; notice of the determination **including the
anticipated end date**; and an appeal process for adverse determinations.

§ 435.555(e): the State **must not** require a request for events (2) and (3).
§ 435.555(f): the State **must not** apply hardship to specified excluded individuals.

---

## 6. Assessing compliance — § 435.556

**Threshold question first:** is the person a specified excluded individual or an applicable
individual? Determined as of the **month of application**, or when the State **processes the renewal**.
If excluded, the State **must not** assess compliance for any prior month.

### Review periods

| Context | Review period | Months required |
|---|---|---|
| **Application** — § 435.556(a)(1) | The **1–3 consecutive months immediately preceding the month of application**, as specified in the State plan | All of the State-elected months |
| **Renewal, no more-frequent verification** — (a)(2)(i) | The **eligibility period**: effective date of most recent determination/redetermination at renewal → renewal due date | ≥ 1 month, State-specified, **not necessarily consecutive** |
| **Renewal, with more-frequent verification** — (a)(2)(ii) | Between the most recent demonstration and the next one due | ≥ 1 month, **not necessarily consecutive** |
| **Became applicable mid-period** — (a)(2)(iii) | Most recent determination/redetermination → **end of the month prior** to the month they enroll in the CE-subject group | Lesser of State-elected months or months in the review period |

**§ 435.556(b):** a State must not require demonstration for a period exceeding the review period —
**but this caps only (a)(2)(i), (ii), and (iii)**, i.e. enrolled beneficiaries. It does **not** reach
(a)(1) applications.

**The exclusion has no monthly-duration requirement.** "There is no requirement that an individual who is
a specified excluded individual meet that definition for the required number of months during the review
period." This is the cleanest statement of why Tier 1 differs categorically from Tier 2.

**"Whether or not consecutive" is not a grant of State discretion.** CMS interprets it to mean States
may **not** require consecutive months at renewal, and may **not** dictate *which* specific months.
Any qualifying month(s) in the review period count.

**§ 435.556(c):** a State **may not** apply these requirements to specified excluded individuals.

**§ 435.556(d):** the determination notice must specify whether the individual (1) meets specified
excluded individual criteria, or (2) is an applicable individual and whether they demonstrated or
were deemed to have demonstrated community engagement for the specified month(s).

---

## 7. Verification — § 435.557

### 7.1 Reliable information available to the State — § 435.557(a)

Information the agency has or **should have** access to, including but not limited to:
(i) approved electronic data sources documented in the verification plan; (ii) other State or local
agencies; (iii) federal data via the electronic service under § 435.949; (iv) the State eligibility
system; (v) the individual's case record; (vi) **payroll data**; (vii) **adjudicated claims from the
preceding 12 months — paid, pended, or denied**; (viii) **encounter data for the preceding 12 months**.

**Period of enrollment** — a continuous period of enrollment without disenrollment, regardless of the
number of eligibility periods, redeterminations, renewals, or transitions between eligibility groups.

### 7.2 Ex parte first — § 435.557(b)

The agency **must** use reliable information available to the State **before requesting anything from
the individual**.

> **This is the single largest driver of a user needing to do nothing, and it should be explained to them.**
> States **must** require SNAP and TANF information, **incarceration data** from correctional facilities,
> and **education information** from State colleges, community colleges, high school equivalency programs,
> and high schools. Combined with payroll data, 12 months of adjudicated claims, and encounter data, a
> large share of users will never be asked for anything.
>
> Corollary from § II.I.6.e: the State **must not request** documentation when the hours already visible in
> its own data are sufficient.
>
> **Reasonable modifications (§ 504, § 1557, ADA).** For applicable individuals who meet the definition of
> a person with a disability but do **not** qualify for an exclusion or exception, the IFC reminds States
> they **are required to provide reasonable modifications** to comply with the requirement. This is the
> fallback for every user who screens out of both Tier 1 and Tier 2, and it belongs in the UI. It must identify data sources, may deem a connection ineffective only after weighing
administrative cost against program integrity and the risk of eligible people being denied, must
document all of this in its **verification plan** under § 435.945(j), and must actually request and
use the documented sources.

### 7.3 The January 1, 2028 hardening date — § 435.557(b)(2)

| Period | Rule |
|---|---|
| **Through December 31, 2027** | The agency **may** require documentation **or** accept other information, even if documentation is reasonably available |
| **Beginning January 1, 2028** | The agency **must require documentation whenever documentation is reasonably available** |

Always, per § 435.557(b)(2)(iii):
- (A) the agency **must accept information other than documentation** when no documentation is
  reasonably available; and
- (B) the agency **may not deny or terminate eligibility solely because the individual cannot produce
  documentation that does not exist or is not reasonably available**, though it may specify what
  information it considers sufficient instead.

CMS's own examples of "reasonably available documentation": **paystubs** (work hours or income); a
**document from a community service organization** showing hours volunteered; **transcripts or class
schedules** (half-time enrollment); a **VA document** showing disability status; **SNAP or TANF
approval notices**.

CMS's examples of when documentation does **not** exist: family caregiving, which "often occurs
outside of an employer/employee or other contractual relationship"; and loss of documents to a house
fire or flood.

### 7.4 Submission — § 435.557(b)(4) · **this defines HourKeep's output target**

The State must accept information and documentation via **all** the modalities through which it must
accept applications under § 435.907(a): **online, by telephone, by mail, in person, and via other
commonly available electronic means**.

**Who may submit:** the individual; **an adult in the individual's household** (§ 435.603(f)) **or
family** (IRC § 36B(d)(1)); an **authorized representative**; or, if the individual is incapacitated,
someone acting responsibly for them.

### 7.5 Sequencing rules — § 435.557(c)

- **(c)(1)** The State **may not limit** which activities or statuses it checks. It must keep checking
  until it verifies compliance, deemed compliance, or exclusion. Only after exhausting all reliable
  information may it request information from the individual or start noncompliance procedures.
- **(c)(1)(ii)** Once verified, the State need not keep checking — **unless** it has information
  suggesting the person may qualify for an exclusion.
- **(c)(2)** The State **must** apply an exclusion whenever it has sufficient information, even if
  compliance is already verified.
- **(c)(3)** If compliance is verified but exclusion needs more information, the State **must enroll
  promptly** and verify the exclusion **post-enrollment**. It may not delay enrollment.

CMS guidance on ordering: prefer longer-lasting exclusions. If someone is both an American Indian and
a parent of a dependent child, apply the American Indian exclusion, because it never needs reverifying.

### 7.6 More frequent verification — § 435.557(d) · State option

- Must apply the **full** ex parte process, not an abbreviated one.
- **(d)(2)** Must first check whether the individual **newly qualifies as excluded** before assessing compliance.
- **(d)(3)** Must attempt to verify via all reliable information for all relevant months before
  requesting information or starting noncompliance procedures — regardless of how the person
  previously demonstrated compliance.
- **(d)(4)** **May not reverify** specified excluded status between regularly scheduled
  redeterminations unless the State has information indicating the status changed (for example, an
  anticipated change like turning 19).

### 7.7 Medical frailty verification and privacy — § 435.557(f)

Must attempt verification using reliable information **including adjudicated claims from the preceding
12 months and encounter data**. States **may not consider information older than 12 months**.

> **Three user-facing facts that belong in the UI.**
>
> **Who can sign the documentation.** States may accept provider documentation from **physicians, nurse
> practitioners, physician assistants, psychologists, counselors and therapists, clinical social workers,
> and other practitioners credentialed by the State.** This is the most directly actionable line in the
> rule for a "what do I go get?" flow.
>
> **Absence of claims cannot be used against you.** Neither the absence of adjudicated claims altogether,
> nor the absence of particular claims or claim types, may be used to find someone ineligible for the
> exclusion — and someone may not be found not-medically-frail merely because their condition maps to a
> non-listed diagnosis code.
>
> **A new basis burns no second attestation.** Under § 435.557(f)(1)(ii)(B), declaring frailty on a **new
> basis** within the same period of enrollment after having used a penalty-of-perjury statement requires
> verification by reliable information or documentation. And the 12-month reverification "could be
> **6 months**" from the last verification even in a State that otherwise reverifies annually.

| Period | Statement under penalty of perjury |
|---|---|
| Through Dec 31, 2027 | May accept **each time** frailty is verified |
| From Jan 1, 2028 | May accept **only once during the beneficiary's period of enrollment** |

- At the first regularly scheduled redetermination after a penalty-of-perjury determination, the
  agency **must** verify using reliable information, or documentation if that is insufficient.
- After verifying by reliable information or documentation, the agency **must reverify at least every
  12 months**.
- **§ 435.557(f)(2):** must comply with SSA § 1902(a)(7), 42 CFR part 431 subpart F, HIPAA, and
  **42 CFR part 2** (substance use disorder records) when handling frailty or rehabilitation data.

### 7.8 Mandatory exception verification — § 435.557(g)

If the individual indicated on an application, renewal, other State form, or change report that they
qualify for a mandatory exception and there is **no reliable information available**, the State **may
elect** the option under § 1902(xx)(3)(A) **not to seek further information**.

### 7.9 Federal data services — § 435.557(e)

Must obtain information through the Secretary's electronic service (the **Federal Data Services Hub**)
where available. New data sources must be connected **as soon as practicable, no later than 12 months**
after first becoming available. Named forthcoming sources: **National Student Clearinghouse**, **VA**,
and the **Eligibility Made Easy (Emmy)** tool/API.

---

## 8. Noncompliance procedures — § 435.558

### Trigger — "unable to verify" — § 435.558(b)

**At application:** insufficient information after reviewing what the individual provided **and** the
reliable information available to the State.

**At renewal and at more frequent verification: this is a binary State election, not a disjunctive test.**
The State must document its choice in the State plan.

| | When the noncompliance notice goes out |
|---|---|
| **Option 1** | **Concurrently with** the renewal form |
| **Option 2** | **Only after** the renewal-form period elapses |

This materially changes the user's timeline. Under Option 1 the 30-day clock starts alongside the renewal
form. Under Option 2 the person gets **two sequential windows of ≥ 30 days each.** § 435.558(b)(3) has the
same binary for more-frequent verification.

> **The Option 2 carve-out removes the protection entirely.** If the renewal form is not returned **and**
> factors *other than* community engagement are also unverified, the § 435.558(a) noncompliance procedures
> **do not apply** — the person is disenrolled for procedural reasons at the end of the eligibility period
> with **no community engagement notice and no 30-day window.** Returning the renewal form matters more
> than the 30-day protection implies.

**Self-reported noncompliance can be accepted at face value.** A State may accept a declaration under
penalty of perjury on the application that the person does *not* meet the criteria, and be considered to
have verified noncompliance without further checking. **A user who answers "no, I didn't have 80 hours"
can be denied on that answer.**

### The response window — § 435.558(a)

- Provide the notice of noncompliance.
- Provide **30 calendar days beginning on the date the notice is received**.
- **§ 435.558(c)(4): the notice is deemed received 5 days after the notice date**, unless the
  individual shows otherwise. Effective window ≈ **35 days from the notice date**.
- **Continue furnishing Medicaid** for an enrolled beneficiary until determined ineligible
  (§ 435.930(b)).

The individual may make a satisfactory showing either of **compliance / deemed compliance** for each
required month, **or** that the requirement **does not apply** because they are not an applicable
individual, including by meeting a specified excluded individual category.

### Notice content — § 435.558(c)(1)

Must clearly state:
1. how to make a satisfactory showing of compliance, including **(A) which month(s) the State will
   assess**, (B) how to show demonstration under § 435.552, and (C) how to show deemed compliance
   under § 435.553 or § 435.555;
2. how to show the requirement does not apply (not an applicable individual / is excluded);
3. the **deadline**;
4. **how to submit** via any § 435.907(a) modality;
5. consequences for Medicaid **and for APTC/PTC** eligibility on an Exchange;
6. how to **reapply**;
7. short-term hardship information, if the State elected it.

### If no satisfactory showing — § 435.558(d)

1. **Consider all other bases of eligibility** first (§§ 435.911, 435.916(f)).
2. Deny with written notice and fair hearing rights, or **disenroll no later than the end of the
   month following the month in which the 30-day period ends**, after ≥ 10 days advance notice and
   fair hearing rights.
3. The reason statement must identify failure to show both compliance **and** non-applicability.
4. Determine potential eligibility for other insurance affordability programs (§ 435.1200(e)).

### After termination

- **§ 435.558(e):** **no restriction** may be imposed on reapplying or on receiving coverage if found
  eligible on reapplication.
- **§ 435.558(f):** **reconsideration** — if a MAGI-based beneficiary was disenrolled for failing to
  submit requested information and submits it during the reconsideration period
  (§ 435.916(a)(3)(iii): **90 days** after termination, or longer if the State elects), the State must
  reconsider **without a new application**.
- **§ 435.912(e)(3):** the 30-day window is an accepted reason for exceeding normal application
  timeliness standards.

---

## 9. Timing, options, and constraints

### Implementation — § 435.559

- **(a)** Required for medical assistance furnished **on or after January 1, 2027**.
- **(b)** States **may** implement earlier via State plan or § 1115 demonstration. Nebraska went live
  **May 1, 2026** and has already disenrolled people; Montana and Arkansas July 1, 2026; Iowa December 1, 2026.
- **(c)** For a beneficiary **enrolled as of the implementation date**, verify compliance at their
  **first renewal initiated on or after** that date — not immediately.

> **The January 1 cliff is much softer than it looks. Three provisions push most people later.**
>
> **1. Pending applications are grandfathered.** Applications filed **before** the implementation date are
> adjudicated under the rules in effect on the filing date (§ 435.915). CMS's example: filed December 15,
> 2026, decided January 15, 2027 → the State **must not** evaluate community engagement for November 2026.
> Community engagement then applies at the next periodic renewal.
>
> **2. "Renewal initiated" means when ex parte review begins**, not when the eligibility period ends. CMS
> explicitly rejected an end-date trigger, noting that a January 31, 2027 renewal due date would otherwise
> force verification at renewals initiated as early as **November 2026**. With 60–90 day renewal cycles, a
> beneficiary whose renewal is due January or February 2027 **may not face community engagement until
> mid-2027**.
>
> **3. Existing enrollees are not assessed on day one at all** — only at that first initiated renewal.
>
> **Who *is* exposed in early 2027:** new applicants in January 2027 and later (assessed on the 1–3 months
> **immediately preceding** application, so December 2026 activity), and anyone in an early-implementing
> State. That is the population to design for first.

### Good faith effort exemption — § 435.560

CMS may temporarily exempt a State on request. Criteria: actions taken toward implementation;
significant barriers (funding, design, development, procurement, installation); a detailed plan with
timeline and milestones; and exigent circumstances.

- **Expires no later than December 31, 2028** and **may not be renewed** beyond that date.
- Initial grants **≤ 6 months**; extensions possible.
- Requires **quarterly** milestone reporting; CMS may terminate early for reporting failure or lack of
  continued good faith effort.

### Outreach — § 435.561

**Timing** — § 435.561(b): notice must go out **3 months plus the number of months specified under
§ 435.556(a)(1)** before implementation. A State with a 3-month application lookback therefore had to
notify by **July 1, 2026**. Also upon enrollment between initial outreach and implementation; and
periodically at determination/redetermination/renewal/change in circumstances, when the State elects
or deselects hardship, when a hardship becomes available or is anticipated to expire, when a
beneficiary **loses specified excluded individual status**, and upon CMS request.

**Content** — § 435.561(c): how to comply; explanation of exceptions **and** exclusions; who is an
applicable individual; the number of months required at renewal; how often the State verifies if it
elected more frequent verification; consequences for Medicaid **and APTC/PTC**; and **how to report
status changes** affecting exceptions, hardship, or exclusion.

**Modalities** — § 435.561(d): regular mail (or electronic if the individual elects), **plus at least
one of**: the individual's electronic account, telephone, text message, or other commonly available
electronic means. MCOs/PIHPs/PAHPs/PCCMs may be used to deliver notice.

### Monitoring — § 435.562

States must submit timely, complete, sufficient-quality data on: enrollment totals; application and
renewal processing and timeliness; determination and redetermination outcomes; **population counts of
individuals subject to the requirement and their compliance, including their manner of compliance**;
and anything else CMS specifies. Failure can trigger corrective action under SSA § 1904.

### No waivers — § 435.563

CMS **will not approve** a § 1115 demonstration that waives the community engagement provisions in
whole or in part. A State implementing via § 1115 must comply with every requirement of § 1902(xx).

### Conflict of interest — § 438.58(b)

A State **may not use** an MCO, PIHP, PAHP, or other contractor to determine beneficiary compliance
**unless** that entity has no direct or indirect financial relationship with an MCO/PIHP/PAHP
responsible for providing or arranging covered services for its enrollees.

### Renewal frequency — a cross-cutting caution

The IFC revises § 435.916(a)(1) to say MAGI eligibility is renewed **once every 12 months and no more
frequently**. But the preamble (§ II.I.6) states:

> effective January 1, 2027, most of the population required to demonstrate community engagement is
> also subject to a new **6-month renewal** requirement for the adult group under § 1902(e)(14)(L).

That 6-month requirement comes from a **different** section of PL 119-21 and is **not implemented by
this rule**. It **does not apply** to American Indians or to most § 1115 demonstration enrollees, who
remain on 12-month renewals. Treat the 6-month figure as operative but sourced elsewhere, and watch
for the separate rulemaking that reconciles § 435.916.

Practical note from the preamble: most States take 60–90 days to process a renewal cohort, so someone
on 6-month renewals may be only ~3 months into an eligibility period when the next renewal starts.

---

## 10. Consolidated state-configurable parameters

These are the axes for HourKeep's policy-profile module.

> **Two corrections to how this table reads.** First, **the rule states no defaults** — the final column is
> *our assumption pending State data*, not law. Two assumptions are affirmatively counter-indicated: CMS
> says documentation "will generally be available" and **encourages** States to require it, and the
> income-to-hours proxy default is a guess. Second, **not every row is a State election** — the federal
> minimum wage is statutory, and the 90-day reconsideration period is a **federal floor** where the only
> election is to elect *longer*.
>
> **Eight further State options were missing from this table** and are listed after it.

| Parameter | CFR | Range / options | Assumption pending State data |
|---|---|---|---|
| Application lookback months | § 435.556(a)(1) | 1–3 consecutive | **1** (statutory minimum) |
| Renewal months required | § 435.556(a)(2) | ≥ 1, non-consecutive | **1** |
| More frequent verification | § 435.557(d) | elect / decline; frequency | **decline** |
| Months required per more-frequent verification | § 435.556(a)(2)(ii) | ≥ 1 | **1** |
| Short-term hardship exception | § 435.555(a) | elect / decline (all four or none) | **decline** (conservative) |
| Unemployment hardship effectuation | § 435.555(d)(3) | requires State request + CMS approval | **not effectuated** |
| Income-to-hours proxy | § 435.552(e)(2)(i) | may / may not use | **may** (user-favorable) |
| Reasonably predictable changes methodology | § 435.603(h)(3) | elect increases / decreases / both / none; window up to 12 months | **not elected** → 6-month preceding average |
| Caretaker relative optional relationships | § 435.554(a)(iv) | State elections carry from § 435.110 | **base list only** |
| Medically frail condition list | § 435.554(c)(5)(ii) | State-developed, auditable | **unknown — must be requested from the State** |
| Rehab program minimum time commitment | § 435.554(c)(8) | may establish | **none** |
| Implementation date | § 435.559(b) | Jan 1 2027 or earlier | **Jan 1, 2027** |
| Good faith effort exemption | § 435.560 | request / not; ≤ Dec 31 2028 | **not exempt** |
| Documentation posture | § 435.557(b)(2)(i) | through 2027: may require docs or accept other info | **accept other info**, but prepare for the 2028 hardening |
| Reconsideration period | § 435.916(a)(3)(iii) | ≥ 90 days | **90 days** |
| Federal minimum wage *(statutory, not an election)* | § 435.552(f) | currently $7.25 | **$7.25 → threshold $580** |

### Additional State options (added on validation)

| Parameter | CFR | Options | Note |
|---|---|---|---|
| **"Unable to verify" at renewal** | § 435.558(b)(2) | **Option 1** (notice concurrent with renewal form) or **Option 2** (notice after form period) | Documented in the State plan. Changes whether the user gets one window or two |
| **"Unable to verify" at more frequent verification** | § 435.558(b)(3) | same binary | |
| **Election not to seek further information on an attested mandatory exception** | § 435.557(g)(1) | may / may not | CMS **encourages States not to use it**. Does not apply where reliable information is *inconsistent* with what the individual reported |
| **Which activities qualify as community service** | § 435.552(b) | State determines | Material per-State variable for a volunteering tracker |
| **What non-documentary information is "sufficient"** | § 435.557(b)(2)(iii)(B) | State determines | |
| **Reconsideration period for non-MAGI enrollees** | § 435.916 | State option | The 90-day figure is a MAGI floor, not universal |
| **Presumptive eligibility for the adult group / HPE for § 1115** | §§ 435.1103(b), 435.1110(c)(2) | elect / decline | PE determinations **must** rest on attested information |
| **Medical-frailty reverification frequency** | § 435.557(f) | ≥ every 12 months; State may go more often | e.g. at each renewal |

---

## 11. Implementation landscape (Tier 3 — context only)

- **44 jurisdictions (43 States + DC)** must implement — see § 1 above. An earlier version of this document
  said 43 and omitted Tennessee; that came from a KFF brief predating CMS's June 2026 § 1115 list.
  ([KFF tracker](https://www.kff.org/medicaid/medicaid-work-requirements-tracker-overview/))
- **Eight States will require medical-frailty documentation from January 2027, not January 2028**:
  Arkansas, Idaho, Indiana, Iowa, North Carolina, North Dakota, Ohio, Utah. Idaho allows new enrollees to
  attest for six months, then requires documentation. North Carolina statute bars self-attestation as sole
  evidence. **So the documentation-hardening date is a per-State value, not a national constant.**
- **CMS's own burden estimate:** of the ~20 million in the adult group, about **56% will be verified ex
  parte**, leaving roughly **8.8 million** who must submit information, at an estimated **2 hours each**.
  That is the addressable population.
- **Active litigation.** *Commonwealth of Massachusetts et al. v. Oz et al.*, No. 1:26-cv-12962 (D. Mass.),
  filed June 29, 2026, 26 plaintiffs, targeting the **medically frail** functional-impairment gate and the
  narrowing of self-attestation. **Preliminary injunction denied July 29–30, 2026. Summary judgment hearing
  October 20, 2026** — before the implementation deadline. No injunction is in effect; the rule is fully
  operative. Build medically-frail logic expecting it to move.
  ([Georgetown Litigation Tracker](https://litigationtracker.law.georgetown.edu/litigation/commonwealth-of-massachusetts-et-al-v-oz-et-al/))
- **Georgia's scope is unsettled.** The IFC forces Georgia to add exclusions Pathways never had; DCH
  projects enrollment rising by ~100,000 against ~20,000 currently covered and is seeking a higher federal
  match. Pathways' extension **expires December 31, 2026**.
- **CMS ships a tool that produces a comparable artifact — but treat it as prior art, not a dependency.**
  **Emmy App** ([cms.gov](https://www.cms.gov/medicaid-chip/community-engagement-support/eligibility-made-easy),
  repo [DSACMS/iv-cbv-payroll](https://github.com/DSACMS/iv-cbv-payroll)) is open source and federal, and
  generates a standardized evidence package for the State. **Emmy API** (`CMSgov/emmy-api`) connects States
  to VA Lighthouse and the National Student Clearinghouse; folded into the Federal Data Services Hub in July
  2026.

  **Verified directly 2026-08-16.** CMS's own repo description calls Emmy App **"a prototype… currently being
  piloted for testing and validation purposes"** — weaker than the "numerous States have successfully
  piloted" framing in the first research pass. Development is genuinely active (27 commits in the most recent
  week, v0.2.0 released 2026-08-12, current work on sending CE documents to agencies over HTTP and S3;
  `emmy-api` last pushed 2026-08-03). **But there are credible reports it may be discontinued**, and active
  development right up to cancellation is the normal shape of a cancelled pilot. Read its schema; do not
  build on it. See ADR-0006.
- **Outreach notices: most States send September 2026.** § 435.561(b) requires 3 months plus the
  application lookback, so 1-month States (about 36 of them) send in **September**, 2-month in August,
  3-month in July. Only Idaho and Indiana were on the July schedule. **And the IFC requires notices to all
  adult-group enrollees, not just those subject** — so receiving one carries almost no signal about whether
  the requirement applies to you.
- **What States accept, and it includes fax.** Missouri: portal upload, mail, **fax**, or in person. No
  State publishes MIME types or size limits. Design the export to survive print and fax.
- **What States will already have:** existing SNAP/TANF (31 States), quarterly wage data (25), Equifax Work
  Number (25), State unemployment (23), BENDEX/SDX (22), plus newer connections to the National Student
  Clearinghouse (10), VA (11), and corrections data (10). State focus groups estimated matching resolves
  only **60–80%** of enrollees. **W-2 payroll income is largely solved. Community service, family
  caregiving, in-kind work, unpaid work, and self-employment are not.**
- About **20 million people** were in the expansion group as of June 2025 — roughly 30% of enrollment
  in expansion States. (KFF)
- **Iowa, Montana, and Nebraska** intend to implement **before** January 1, 2027. **Arkansas** plans a
  July soft launch with no disenrollment until January 2027. (KFF)
- **Most States** plan to verify at renewal every six months and to look back **one month** at both
  application and renewal — the least restrictive configuration. (KFF)
- **Idaho, Indiana, and New Hampshire** have enacted legislation requiring **more than one month** of
  lookback at application and/or renewal, with **quarterly** compliance checks in Indiana and New
  Hampshire. Arkansas will also look back more than one month at renewal. (KFF)
- Seven States overall reported early implementation or more restrictive verification than required.
  (KFF)
- CMS announced that Medicaid technology vendors pledged **over $600 million** in no-cost or
  discounted products to support implementation.
  ([CMS](https://www.cms.gov/newsroom/press-releases/medicaid-technology-companies-pledge-600m-savings-support-community-engagement-related-state))
- Relevant analyses: [CBPP vendor landscape](https://www.cbpp.org/research/health/assessing-the-medicaid-work-requirement-vendor-landscape)
  and [Code for America, *Implementing Medicaid Work Requirements: A Guide for States* (July 2026)](https://files.codeforamerica.org/2025/08/20162845/Implementing-Medicaid-Work-Requirements%E2%80%93A-Guide-for-States.pdf).

*Content in this section was rephrased for compliance with licensing restrictions.*

---

## 12. Open questions to track

1. **Final rule.** 79,718 comments were filed. Expect a final rule that may revise IFC
   interpretations. Treat every interpretation here as versioned.
2. **§ 435.916 reconciliation.** The IFC text says 12-month MAGI renewals while the preamble
   references a statutory 6-month renewal for the adult group under § 1902(e)(14)(L). A separate
   rulemaking is presumably pending.
3. **State medically frail lists.** Each State must publish an auditable condition list. None are
   catalogued here yet; they materially affect who qualifies.
4. **Emmy / Hub data sources.** National Student Clearinghouse and VA connections are described as
   forthcoming. Availability dates unknown.
5. **State plan / SPA templates.** CMS says the election material is "currently under development."
6. **Per-State elections.** The consolidated parameter list in § 10 needs per-State values; only
   partial data exists today via KFF.
