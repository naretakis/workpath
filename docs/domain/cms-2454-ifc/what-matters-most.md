# What Matters Most in CMS-2454-IFC

**A prioritized, cited reference to the provisions that change outcomes for a real person.**

**Authority:** CMS-2454-IFC, **91 FR 33348** (June 3, 2026), corrected at **91 FR 39028** (June 29, 2026).
Effective **July 31, 2026**. Implements SSA § 1902(xx) as added by § 71119 of Public Law 119-21, which CMS
calls the **Working Families Tax Cut (WFTC)** legislation. Codified at **42 CFR 435.550–435.563**.

**Last verified:** 2026-08-17, against the regulatory text and preamble in
[`2026-11094.txt`](2026-11094.txt) and the raw eCFR extract in
[`../supporting-regs/42cfr-supporting-sections.txt`](../supporting-regs/42cfr-supporting-sections.txt).

> **How this file was checked.** Every `42 CFR 435.x` citation in it was extracted mechanically and looked
> up in the primary text — **72** distinct citations. 13 came back "absent" on the first pass and each was then
> read individually in the regulatory-text block; all 13 were false alarms from grep matching inline
> references but not bare paragraph labels. **Two real errors were found and fixed in the process:** the
> hardship request requirement is in the opening clause of § 435.555(d), not § 435.555(e); and the
> "44 jurisdictions" figure is primary — it is CMS's own words in the burden analysis — not the inference
> this file originally called it.
>
> Section anchors, verified: applicable individuals **91 FR 33353** · demonstrating engagement **33354** ·
> income and seasonal **33360** · mandatory exceptions **33363** · specified excluded **33364** · medically
> frail **33373** · hardship **33379** · assessing compliance **33388** · ex parte **33392** ·
> noncompliance **33410** · implementation timing **33415** · good-faith exemption **33417** ·
> burden analysis **33435** · regulatory text **33465 ff.**

---

## How to use this, and how it relates to the other domain docs

This project already has a full extract. **This document does not replace it and is not the authority.**

| Document | Role |
|---|---|
| [`rule-extract.md`](rule-extract.md) | **The authority.** Full cited extract of the IFC, section by section |
| [`../supporting-regs/README.md`](../supporting-regs/README.md) and `42cfr-supporting-sections.txt` | **The authority for § 435.603** — household income. Raw eCFR text. Cite this, never the extract's characterization of it |
| [`state-options.md`](state-options.md) | Every State election, with ranges and defaults |
| **This file** | A **priority layer.** What matters most, why it is counterintuitive, and what a builder or advocate gets wrong. Cites into the two authorities above |

Three overlapping domain docs is how this project once shipped 43 wrong citations. So: **if this file and
`rule-extract.md` disagree, `rule-extract.md` wins and this file is the bug.** For household income, the raw
§ 435.603 text wins over both.

**Source tiers are labelled throughout.** Regulatory text beats preamble beats secondary source. A claim
sourced only to preamble is marked *(preamble)*; a claim sourced outside the IFC is marked
*(outside the IFC)*.

---

## 1. The dates, and why the cliff is softer than it looks

| Date | What happens | Cite |
|---|---|---|
| **July 31, 2026** | IFC effective. Already in force | 91 FR 33348 |
| July–Sept 2026 | States send initial outreach notices, 4–6 months before implementation | § 435.561 |
| **January 1, 2027** | **States must implement.** Some are earlier | § 435.559(a), (b) |
| **January 1, 2028** | **Documentation hardening.** States must require documentation whenever reasonably available | § 435.557(b)(2)(ii) |
| **December 31, 2028** | Last possible expiry of a good-faith-effort exemption. **Cannot be renewed beyond it** | § 435.560(c) |

### The three provisions that push most people later than January 2027

**Pending applications are grandfathered.** § 435.915. An application filed before the implementation date
is adjudicated under the rules in effect on the filing date. CMS's own worked example, quoted from the
preamble at **91 FR 33415–33416**:

> An application … submitted on December 15, 2026, must be adjudicated based on the eligibility rules in
> place on December 15, 2026, even if an eligibility determination is not made until January 15, 2027 …
> the State **must not** evaluate whether the individual is an applicable individual and whether the
> individual demonstrated community engagement in November 2026.

**Existing enrollees wait for their first *initiated* renewal.** § 435.559(c). For someone enrolled as of
the implementation date, the State verifies compliance at their **first renewal initiated on or after** that
date. "Initiated" is defined: the renewal is initiated when the State *begins reviewing reliable information
available to it* to complete the renewal ex parte under § 435.916(a)(2).

CMS **considered and rejected** an end-date trigger, and said why (91 FR 33416): many States take 60–90 days
to run a renewal, so an end-date rule would have forced them to ask about community engagement **before**
their own implementation date. **Consequence:** someone whose renewal is due January or February 2027 may
not face community engagement until mid-2027.

**So the population actually exposed in early 2027 is narrow:** new applicants — assessed on the months
immediately preceding application, so December 2026 for a January filing — and anyone in an
early-implementing State.

### Documentation hardening is per-State, not national

Federally it is January 1, 2028 (§ 435.557(b)(2)(ii)). But several States require medical-frailty
documentation from January 2027. *(outside the IFC — State legislation and plan amendments; see
`rule-extract.md` § 10 and `validation-findings-2026-08.md`.)* Treat the 2028 date as a federal floor and the
per-State date as a policy-profile value.

**Even after hardening, documentation that does not exist cannot sink a claim.** § 435.557 requires the State
to accept other information where documentation is not reasonably available, and prohibits denial or
termination **solely** because someone cannot produce a document that does not exist.

### Early implementers

Nebraska went live **May 1, 2026** and has already disenrolled people. Montana and Arkansas July 1, 2026 —
Arkansas a soft launch with no disenrollment before January 2027. Iowa December 1, 2026.
*(outside the IFC — State tracking. Verify before relying on it.)*

---

## 2. Who it applies to — three tiers with different legal effects

This is the single most important structural fact, and collapsing it into "exempt / not exempt" loses
information that changes what a State is permitted to do.

| Tier | Provision | Effect |
|---|---|---|
| **Specified excluded individual** | **§ 435.554(c)(1)–(10)** | **Not an applicable individual at all.** Community engagement is not a condition of eligibility, and § 435.556(c) **prohibits** the State from assessing compliance |
| **Mandatory exception** | **§ 435.553(a)(1)–(4), (b)** | Still an applicable individual, but **deemed to have demonstrated** community engagement for the month. Triggered by **part or all** of a month |
| **Optional short-term hardship** | **§ 435.555** | Same deeming effect, but **only if the State elected it** |
| **Outside § 435.551 entirely** | § 435.551 with § 435.119 | Not in the group the requirement attaches to. Age 65+ is here — **not** an exclusion within it |

> ### Watch the paragraph structure of § 435.554
>
> **(a)** holds the six supporting **definitions** — caretaker relative, dependent child, disabled
> individual, family caregiver, guardian, parent — alphabetical and unnumbered. **(b)** is the operative
> exclusion sentence. **(c)(1)–(c)(10)** are the ten categories.
>
> Confirmed in the preamble at 91 FR 33364 ff.: *"We define the terms caretaker relative, dependent child,
> disabled individual, family caregiver, guardian and parent at § 435.554(a)"*; former foster care
> *"implemented at new § 435.554(c)(1)"*; American Indians at *"the new § 435.554(c)(2)"*; caregivers at
> § 435.554(c)(3); inmates at § 435.554(c)(9).
>
> **Citing the categories as (a)(1)–(a)(10) is wrong** and lands on unrelated provisions. This project made
> that error in 43 places, because the numbering was inferred from an unnumbered list in a summary rather
> than read from the rule.

### The ten exclusion categories — § 435.554(c)

| # | Category | Notes that change outcomes |
|---|---|---|
| **(c)(1)** | **Former foster care children** | Under 26; in foster care under **any** State's responsibility at 18 (or higher State-elected age); enrolled in Medicaid in **any** State while in care. CMS applies the SUPPORT Act criteria **regardless of when the person turned 18** (91 FR 33365). Frequently has no screening question at all |
| **(c)(2)** | **American Indians** | Uses the existing definition at **42 CFR 447.51** — Indian, Urban Indian, California Indian, IHS-eligible. **States must not, and may not, reverify this status** (91 FR 33366). Say so once |
| **(c)(3)** | **Parent, guardian, caretaker relative, or family caregiver** of a dependent child 13 or under, or of a disabled individual | The largest and most misunderstood category. See § 3 below |
| **(c)(4)** | **Veteran with a disability rated as total** | **Temporary or permanent**, under 38 U.S.C. 1155. Preamble is explicit that **TDIU** veterans — paid at the 100% rate because their disabilities prevent them working — *"must be treated by States in the same manner"* as those with a combined 100% rating (91 FR 33372). A question asking only about a "100% rating" silently excludes them |
| **(c)(5)** | **Medically frail or otherwise has special medical needs** | Two-part test with a **functional** gate. See § 4 below |
| **(c)(6)** | **Compliant with TANF work requirements** | SSA § 407. The test **is** compliance. States define compliance differently; CMS says States *should not rely on or require reporting from the individual* (91 FR 33385) |
| **(c)(7)** | **Member of a household receiving SNAP who is not exempt from a SNAP work requirement** | **Read the construction.** The test is being **subject to** SNAP work requirements — *not* complying with them — and it keys on **household** receipt, not the individual's own |
| **(c)(8)** | **Participating in a drug addiction or alcoholic treatment and rehabilitation program** | 7 U.S.C. 2012(h). States **may** set a minimum time commitment — a State election |
| **(c)(9)** | **Inmate of a public institution** | Uses the long-standing definition at **§ 435.1010**. States are expected to use correctional data they already receive |
| **(c)(10)** | **Pregnant or entitled to postpartum coverage** | SSA § 1902(e)(5) or **(e)(16)**. Most States now run **12-month** postpartum coverage under (e)(16), so "60 days" understates it badly |

### The mandatory exceptions — § 435.553

- **(a)(1)** under age 19
- **(a)(2)** entitled to or enrolled for Medicare Part A, or enrolled for Part B
- **(a)(3)** described in a mandatory coverage group at SSA § 1902(a)(10)(A)(i)(I)–(VII)
- **(a)(4)** **was a specified excluded individual**
- **(b)** was an **inmate of a public institution at any point in the 3-month period ending on the first day
  of that month** — note this is **(b)**, not (a)(5). Preamble: *"New § 435.553(b) implements section
  1902(xx)(3)(A)(ii) of the Act, which establishes an exception for incarcerated individuals"* (91 FR 33363)

> **§ 435.553(a)(4) is the transition protection, and it is easy to miss.** Because *prior exclusion* is
> itself a mandatory exception, someone who **loses** exclusion status is deemed compliant for every month in
> the review period during which they were excluded. A parent whose child turns 14 mid-period is protected
> for the earlier months. Nobody will volunteer this on your behalf — ask for it.

---

## 3. The caregiver cluster — six definitions, not one question

§ 435.554(a) defines six terms; § 435.554(c)(3) is the operative exclusion. Collapsing them into "do you care
for someone?" loses qualifying people.

- **Dependent child** — a child **13 or under** who relies on another individual for care.
- **Disabled individual** — the **ADA definition at 28 CFR 35.108**. Explicitly **need not** be
  Medicaid-eligible on the basis of disability. Any of three prongs qualifies: an impairment that
  substantially limits a major life activity, a **record** of one, or being **regarded as** having one.
- **Parent** — legal mother or father, including by adoption, **who provides some level of care**.
- **Guardian** — an adult **appointed by a court**.
- **Caretaker relative** — a relative by blood, adoption, or marriage **living with** the person and
  **assuming primary responsibility** for their care, from an enumerated list. States **may** extend the list
  — a State election (§ 435.554(a), and see `state-options.md`).
- **Family caregiver** — an adult family member **or other individual** with a significant relationship who
  provides a broad range of assistance. Built on the RAISE Family Caregivers Act (PL 115-119).

**Family caregivers must additionally meet one of three criteria at § 435.554(c)(3)(i)(A)–(C):**

| | Resides with? | Related? | Requirement |
|---|---|---|---|
| (A) | Yes | — | Assistance on a **regular basis**, not solely incidental |
| (B) | No | Yes | Assistance on a **regular basis**, not solely incidental |
| (C) | No | No | **≥ 80 hours per month** of non-incidental assistance |

**Two consequences worth stating out loud:**

**Multiple adults in one residence may each qualify.** § 435.554(c)(3)(ii). CMS aligned this with existing
SNAP policy (91 FR 33369). It is commonly assumed only one person can be counted.

**Failing (C) does not waste the hours.** A family caregiver who provides fewer than 80 hours to an unrelated
person they do not live with **still counts those hours as unpaid work** under § 435.552(b). The preamble says
so directly (91 FR 33355): caregiving hours below the 80-hour threshold in § 435.554(c)(3)(i)(C)
*"would count toward demonstrating community engagement."* CMS's example: 55 caregiving hours + 25 other
hours = compliant.

---

## 4. Medically frail — the gate is functional, not diagnostic

§ 435.554(c)(5). **Two parts, and both are required.**

**The gate**, from the regulatory text: the individual's physical, mental, or other behavioral health
condition **significantly impairs their ability to comply with the community engagement requirement**.
CMS is explicit that diagnosis alone is insufficient — someone who can perform 80 hours a month despite their
condition does not qualify on this basis.

**And one of five**, at § 435.554(c)(5)(i)(A)–(E):

- **(A)** blind or disabled per SSA § 1614
- **(B)** **substance use disorder**, excluding individuals in **stable recovery**, which the rule sets at
  **5 or more years**. Applies whether or not the person is in active treatment, and covers early (< 1 yr)
  and sustained (1–5 yr) recovery. States must allow self-identification **including after a relapse**
- **(C)** disabling mental disorder
- **(D)** physical, intellectual, or developmental disability significantly impairing **one or more**
  activities of daily living — **one is enough**
- **(E)** serious or complex medical condition, with an extensive qualifier list

**Two State obligations that are the most actionable thing here.** § 435.554(c)(5)(ii): the State **must**
maintain an auditable, regularly revised list of qualifying conditions, **and** a process for someone whose
condition is not on the list to **request consideration**. Someone whose condition is absent from the list
still qualifies if they meet the gate and one of (A)–(E). **Ask for the list, and ask how to request
consideration.**

**Do not conflate** with the Alternative Benefit Plan medically-frail definition at **42 CFR 440.315(f)**.

**Handling this data engages HIPAA and 42 CFR part 2** (substance use disorder records).

> **Contested.** *Commonwealth of Massachusetts et al. v. Oz et al.*, No. 1:26-cv-12962 (D. Mass.), filed
> June 29, 2026, 26 plaintiffs, targets this functional gate and the narrowing of attestation. Preliminary
> injunction **denied** July 2026; summary judgment hearing **October 20, 2026**. **No injunction is in
> effect — the rule is operative** — but expect movement. *(outside the IFC.)*

---

## 5. How the requirement is satisfied — seven pathways, § 435.552(a)

**States must make all seven available and may not offer a subset.**

| # | Pathway | Threshold | Cite |
|---|---|---|---|
| 1 | Work | ≥ 80 hours | § 435.552(a)(1) |
| 2 | Community service | ≥ 80 hours | § 435.552(a)(2) |
| 3 | Work program participation | ≥ 80 hours | § 435.552(a)(3) |
| 4 | Educational program **at least half-time** | **no hours required** | § 435.552(a)(4) |
| 5 | Any combination of 1–4 | ≥ 80 hours total | § 435.552(a)(5) |
| 6 | Monthly income | ≥ federal minimum wage × 80 | § 435.552(a)(6), (f) |
| 7 | Seasonal worker average monthly income over the preceding 6 months | ≥ federal minimum wage × 80 | § 435.552(a)(7), (g) |

### Work is far broader than a paycheck — § 435.552(b)

Three components, in any combination: **work for money**; **in-kind work** (compensation in goods or
services); and **unpaid work** other than community service.

Explicitly included, per the regulatory text and the preamble at 91 FR 33354–33355: self-employment,
business ownership, independent contracting; in-kind compensation such as reduced rent for a property
manager; **unpaid internships**; **unpaid trial periods when applying for a job**; and sub-threshold family
caregiving hours.

### Community service has a record schema — § 435.552(b)

Unpaid work, **voluntary or court-ordered** — both count — through a **structured program**, for the direct
benefit of the community, under public or nonprofit auspices. Embedded skill-building counts.

**States may not restrict this to § 501(c)(3) organizations.** The regulatory text includes 501(c)(3)
organizations *"and other organizations"*; local government agencies, religious nonprofits, and small social
service providers all qualify.

The organization must provide oversight, must not serve a partisan purpose, and must have a process to track:

> **the type of community service activity, dates and hours** … and a **point of contact who can confirm the
> hours completed**

**That is the capture schema.** Without a contact who can confirm the hours, the evidence may not be
accepted. CMS's verification guidance adds the organization's name and address and the contact's phone or
email.

**Does not count:** helping one specific person outside a broader community effort; attending your own
child's school events; recreational clubs; partisan campaigning. *(the partisan bar is regulatory text; the
others are preamble.)*

### Work program is a closed list of five — § 435.552(b)

1. Title I of WIOA (29 U.S.C. 3111 et seq.)
2. § 236 of the Trade Act of 1974
3. A State or local employment and training program meeting Governor-approved standards, **including SNAP
   E&T**
4. A DOL or VA veterans employment/training program
5. SNAP workforce partnerships

**Standalone supervised job search or job search training does not qualify** — but may be a **subsidiary**
activity if under half the program's required hours. Unemployment-insurance job search can count where
conducted consistently with work program requirements.

**The trap:** health-provider-operated programs and Medicaid § 1915(c)/(i) **supported employment do not
qualify** — which are exactly the programs a Medicaid beneficiary is most likely to already be in.

### Education: half-time is a cliff, not a slope — § 435.552(a)(4), (c), (d)

- **At least half-time → satisfied, zero hours required, and it may NOT be combined** with other activities
  (§ 435.552(a)(5)).
- **Less than half-time → convert to hours and combine.**

**Enrollment status is determined by the school** (§ 435.552(c)) — not the State, not the individual. It
begins the first day of term, **continues through vacation and recess at the pre-break status**, and ends at
the end of the month of expulsion, withdrawal, non-registration, or graduation.

Credit-hour conversion for less-than-half-time, § 435.552(d)(1) — the Carnegie Unit:

```
monthlyHours = creditHours × 3 × 4.33
```

1 credit = 12.99 hrs · 3 credits = 38.97 hrs · **6 credits = 77.94 hrs — below 80.** Non-credit-hour programs
count actual class and activity hours 1:1.

Qualifying: institutions of higher education; career and technical education; **high school**; and
**State-approved high school equivalency (GED)** programs. Independent self-study outside a State-approved
program does not qualify.

### Combination, and the income-to-hours proxy — § 435.552(e)

Work, community service, and work program hours are determined **separately** for the month, then **added
together**. Education combines **only** if enrolled less than half-time.

**§ 435.552(e)(2) is the provision most likely to help someone and least likely to be mentioned.** When
monthly income is **below** the threshold **and** the agency lacks hours documentation, the agency **may**
credit:

```
workHours = monthlyIncome ÷ federalMinimumWage
```

and combine that with other activities. CMS's worked example: **$380 ÷ $7.25 = 52 hours**, needing 28 more.

Three qualifications that matter:

1. It is a **State option** — "may", not "must".
2. § 435.552(e)(2)(i) requires the State to use a **reasonable method to allocate work hours between members
   of the household**, so any figure you compute for one person is an **upper bound**. Say "up to", never
   "about".
3. It applies **only** when income is below the threshold and hours are unknown.

**So hours and income are not mutually exclusive.** Any design or explanation that forces an either/or choice
is stricter than the rule and against the person's interest.

---

## 6. Income is MAGI-based *household* income — the most misunderstood provision

> **Cite the raw text for anything in this section:**
> [`../supporting-regs/42cfr-supporting-sections.txt`](../supporting-regs/42cfr-supporting-sections.txt).
> The IFC's *characterization* of § 435.603 is not § 435.603, and this project has shipped three separate
> errors in this area, all in the direction unfavourable to the person.

**§ 435.552(f)(2)** requires **MAGI-based income (§ 435.603(e))** for the **MAGI-based household
(§ 435.603(d) and (f))**.

**§ 435.603(e)**, raw: MAGI-based income means income calculated using the same financial methodologies used
to determine modified adjusted gross income **as defined in section 36B(d)(2)(B) of the Code**, with three
exceptions.

**26 U.S.C. § 36B(d)(2)(B)** is adjusted gross income **increased by** excluded foreign earned income,
**tax-exempt interest**, and the portion of **Social Security benefits not included in gross income**.

### What that means concretely

**Counts** — earned **and** unearned:

- Wages, tips, commissions
- Self-employment, freelance, contract, gig work
- **Unemployment compensation** (in gross income under IRC § 85)
- **Interest and dividends, including tax-exempt interest** — added back by § 36B(d)(2)(B)
- **Rental income**, whether or not it is a business
- **Social Security benefits including the non-taxable portion** — so **SSDI**

**Does not count:**

- **SSI** — Title XVI, not a Title II Social Security benefit, never in gross income. § 435.603(j)(1) puts
  SSI recipients outside MAGI methods entirely
- **Child support received**
- **Gifts and loans**, generally — but see the narrow election below
- Three exclusions in § 435.603(e) itself: **(e)(1)** a lump sum counts **only in the month received**;
  **(e)(2)** scholarships, awards, and fellowship grants **used for education** and not living expenses;
  **(e)(3)** six categories of **American Indian / Alaska Native** income

**CMS considered and rejected counting only earned income.**

### The household is a tax household, and it is not everyone in the house

**§ 435.603(d)(1):** household income is the **sum** of the MAGI-based income of every individual in the
individual's household — *except* as provided in (d)(2) through (d)(4).

**§ 435.603(d)(2) excludes** the MAGI-based income of a child or tax dependent who is **not expected to be
required to file a tax return** under IRC § 6012(a)(1) — *whether or not they actually file*. **The test is
the filing threshold, not age.** A 16-year-old earning above it **is** counted; a 30-year-old dependent below
it is not.

**§ 435.603(d)(3)** is a narrow **State option**, quoted in full because it is routinely overstated:

> In the case of individuals described in paragraph (f)(2)(i) of this section, household income **may, at
> State option**, also include **actually available cash support, exceeding nominal amounts**, provided by
> **the person claiming such individual as a tax dependent**.

And **§ 435.603(f)(2)(i)** limits it to *"Individuals **other than a spouse or child** who expect to be
claimed as a tax dependent by another taxpayer."* **A gift from a friend is not in it.**

**§ 435.603(f)** composition follows **tax filing relationships**, not residence, and is **asymmetric and
per-person** — there is no single "the household", only *the applicant's* household. Two adults in one
dwelling can have different MAGI households.

**Evaluated for each month of the review period**, not the month of application.

### Two consequences

**A married person whose spouse works may already satisfy the income pathway without working a single
hour.** Telling that person to find 80 hours of volunteering is a harmful false negative.

**And the message is two-sided.** More household income helps this pathway. Separately, enough household
income ends eligibility for the adult group entirely — 133% FPL plus the 5 percentage point disregard at
§ 435.603(d)(4). That is a **different** question that points at Marketplace coverage and premium tax
credits, not a community-engagement failure. Never imply a spouse's income is disqualifying.

### The threshold

`federalMinimumWage × 80`. In 2026: **$7.25 × 80 = $580**. § 435.552(f).

The minimum wage is the one **in effect when the State applies the threshold**, so the value is dynamic if
the FLSA is amended. States **may not** use the tipped wage, the **$4.25 youth** wage, or a **State** minimum
wage even if higher — only 29 U.S.C. 206(a)(1)(C).

### Seasonal workers — § 435.552(g)

**"Seasonal worker" is defined by 26 U.S.C. 45R(d)(5)(B):** labor performed on a seasonal basis **as defined
by the Secretary of Labor** — *including* work that by its nature pertains to certain seasons and may not be
continuous (29 CFR 500.20(s)(1)) — **and** retail workers employed exclusively during holiday seasons.

> **Those two categories are inclusive examples, not a closed test, and the IFC provides no verification rule
> for seasonal-worker status anywhere.** Do not invent a months-per-year threshold; there isn't one. An
> earlier version of this project's own steering called it "an objective legal test… not self-declaration",
> which was **unsupported** and restrictive against the person.

Two computation paths:

1. **State elects a "reasonably predictable changes" methodology** (§ 435.603(h)(3)) — income prorated across
   up to 12 months. This is the more favourable path and goes unmentioned almost everywhere.
2. **State does not** — average the **6 months preceding the month being assessed**. **The assessed month is
   excluded.**

CMS's example: apply in July with a 1-month review period → the review month is June → average **December
through May**.

---

## 7. Which months get assessed — § 435.556

**The threshold question comes first:** excluded, or applicable? Determined as of the month of application,
or when the State processes the renewal. **If excluded, § 435.556(c) prohibits the State from assessing any
prior month.**

| Context | Review period | Months required |
|---|---|---|
| **Application** | The **1–3 consecutive months immediately preceding** the month of application, per the State plan | All elected months |
| **Renewal** | The eligibility period | ≥ 1, **not necessarily consecutive** |
| **More frequent verification** (State option) | Between verifications | ≥ 1, **not necessarily consecutive** |
| **Became applicable mid-period** | Last determination → **end of the month before** they enter the subject group | Lesser of elected months or months available |

> **"Whether or not consecutive" is not State discretion.** CMS interprets it to **forbid** States from
> requiring consecutive months at renewal, or from dictating which specific months count. **Any qualifying
> month in the review period counts.** This is favourable and under-communicated.

---

## 8. Verification — ex parte first, and it covers most people

**§ 435.557(a)** defines the reliable information available to the State. **§ 435.557(b)** imposes the duty to
use it **before requesting anything from the individual**. Cite the pair — the June 29, 2026 correction
notice (91 FR 39028) republished § 435.557 and shifted paragraph designations inside it.

The information set includes payroll data, **adjudicated claims from the preceding 12 months — paid, pended,
or denied** — and **encounter data**. States must also require SNAP and TANF information, incarceration data
from correctional facilities, and education information from schools and equivalency programs.
*(the SNAP/TANF, incarceration, and education specifics are preamble at 91 FR 33392 ff.)*

**How much this covers — CMS's own burden estimate:**

> Based on State-reported renewal data from calendar year 2025, we estimate that approximately **56 percent**
> of the approximately **20 million** total applicable individuals that will be due for renewal will have
> their compliance with, or exception or exclusion from, the community engagement requirement verified
> [ex parte]

**That leaves roughly 8.8 million people who must submit something**, at an estimated 2 hours each. They are
defined by what payroll data misses: unpaid and in-kind work, family caregiving, community service, unmatched
gig income, less-than-half-time school. **State focus groups estimated matching resolves only 60–80% of
enrollees.**

**A corollary worth quoting:** the State **must not request** documentation when the hours already visible in
its own data are sufficient.

### Documentation posture

| Period | Rule |
|---|---|
| Through Dec 31, 2027 | The State **may** require documentation **or** accept other information |
| **From Jan 1, 2028** | The State **must require documentation whenever reasonably available** |

**Always:** the State must accept other information where no documentation is reasonably available, and
**may not deny or terminate solely** because someone cannot produce documentation that does not exist.

**Documentation CMS names as reasonably available:** paystubs; a document from a community service
organization; transcripts or class schedules; a VA disability document; SNAP or TANF approval notices.

**Documentation CMS says often does not exist:** family caregiving outside any employment or contractual
relationship; records lost to fire or flood.

**Submission channels — § 435.907(a):** online, telephone, mail, in person, and other commonly available
electronic means. **Who may submit:** the individual; an adult in their household or family; an authorized
representative; or someone acting responsibly if they are incapacitated.

**Medically-frail verification:** claims and encounter data first. A penalty-of-perjury statement may be
accepted each time through 2027, but **only once per period of enrollment** from January 1, 2028. Must be
reverified at least every 12 months.

**Reasonable modifications.** For applicable individuals who meet the definition of a person with a
disability but do **not** qualify for an exclusion or exception, the IFC reminds States they **are required**
to provide reasonable modifications under § 504, § 1557, and the ADA.

---

## 9. If the State cannot verify — § 435.558

This is the section that decides whether someone keeps coverage, and the timing is more generous than it
first appears.

**The clock.** § 435.558(a)(2) gives **30 calendar days** beginning on the date the notice is **received**.
§ 435.558(c)(4) deems the notice **received 5 days after the date on the notice**, unless the person shows
they did not receive it in that window — CMS names hospitalization, mail on hold, and being away from home as
examples. **So roughly 35 days from the notice date.** This mirrors §§ 431.231(c)(2) and 431.232(b).

**Coverage continues.** § 435.558(a)(3): the State must **continue to furnish Medicaid** until the individual
is determined ineligible.

**Two ways to respond, not one.** § 435.558(c)(1): the person may show **either** that they complied or were
deemed to have complied (§§ 435.552, 435.553, or 435.555) **or** that the requirement **does not apply to
them** — because they are not an applicable individual under § 435.551, including by meeting a § 435.554
category.

**What the notice must contain** — § 435.558(c)(1)(i)–(vii): **which months** are being assessed under
§ 435.556(a); how to show compliance; how to show the requirement does not apply; the deadline; how to submit
through any § 435.907(a) modality; the consequences for Medicaid **and for APTC/PTC** on an Exchange; and how
to reapply.

**Before denial, every other basis must be considered.** § 435.558(d)(1).

**Disenrollment timing.** No later than the end of the month following the month the 30-day period ends.

**A 90-day reconsideration period, without a new application.** § 435.558(f), consistent with
§ 435.916(a)(3)(iii): for MAGI enrollees disenrolled for failure to submit, information returned during the
reconsideration period is **treated as an application**, and the return date is the application date.
Optional for non-MAGI enrollees, so the 90 days is a **MAGI floor, not universal**.

**No restriction on reapplying.** And determinations are appealable — § 431.220(a)(1).

> **One carve-out that undercuts the "coverage continues" reassurance.** Under the § 435.558(b) "unable to
> verify" **Option 2**, if the renewal form is not returned **and** other eligibility factors are also
> unverified, the § 435.558(a) protections do not apply. Which option a State picks is documented in its
> State plan and changes whether the person gets one window or two.

---

## 10. Optional short-term hardship — § 435.555

**A State election.** If elected, the State must offer **all four** event types — no subsets — and must not
apply hardship to specified excluded individuals (§ 435.555(f)).

| Event | Request required? |
|---|---|
| Receiving inpatient/institutional or similar-acuity services | **Yes** |
| County with a **Presidentially declared** emergency or disaster (NEA or Stafford Act) | **No — automatic** |
| County unemployment at or above **the lesser of 8% or 1.5× national** | **No — automatic** |
| Travel outside the community for an extended period for a serious or complex condition | **Yes** |

**The request requirement is scoped in the opening clause of § 435.555(d)**, quoted from the regulatory
text:

> A short-term hardship event exists when, for all or part of a month, and **subject to a request in the
> circumstances described in paragraphs (d)(1) and (4)** of this section by an applicable individual or an
> individual acting on behalf of the applicable individual, the criteria for any of the following
> circumstances are met

So a request is required for **(d)(1)** institutional services and **(d)(4)** travel, and **is not required
for (d)(2) emergency/disaster or (d)(3) unemployment** — the State applies those itself.
**§ 435.555(c)** requires notice telling people a hardship exception exists and its anticipated end date.

The travel event covers the individual **or their dependent** (a minor child, for this section —
§ 435.555(b)(1)). If the dependent travels alone, the individual must show they took leave or absented
themselves for related reasons.

**The unemployment event is a second, separate election** on top of electing hardship at all, and requires a
State request plus CMS approval (§ 435.555(d)(3)).

---

## 11. Scope, and hard limits on States

**Who must implement.** § 435.550: these sections apply to the **50 States and the District of Columbia**.
**"These sections do not apply to the territories."** So Puerto Rico, Guam, the U.S. Virgin Islands, American
Samoa, and the Northern Mariana Islands are out entirely.

**44 jurisdictions have a population subject to the requirement.** The figure is CMS's own, in the IFC's
burden analysis: *"all **44 jurisdictions** subject to the community engagement requirement"* — so it is
primary, not inferred. That is **43 States + DC**, including three non-expansion States — **Georgia,
Tennessee, Wisconsin** — plus § 1115 populations inside Hawaii, Massachusetts, New York, Oregon, and Utah.
*(the composition of the 44 — which seven States are out, which five have § 1115 populations — is secondary;
the count is not.)*

Note the two figures are answering different questions and both are correct: § 435.550's "50 States and the
District of Columbia" is about the rule's **reach**; 44 is about which jurisdictions have an **affected
population**.

**The adult group is not "childless adults."** § 435.551 defines applicable individuals by reference to
**§ 435.119** — the ACA expansion group, adults **19–64** at or below 133% FPL not described in a mandatory
group. **It includes parents** whose income exceeds the § 435.110 threshold. A parent whose youngest child is
**14 or older** is an applicable individual, because § 435.554(c)(3) reaches only caregivers of a child 13 or
under.

**Hard limits:**

- **§ 435.563: CMS will not approve any § 1115 waiver** of the community engagement provisions, in whole or
  in part. **There is no waiver path.**
- **§ 438.58(b):** a State may not use an MCO or contractor to determine compliance unless that entity has no
  financial relationship with an MCO serving its enrollees.
- **§ 435.562:** States must report population counts of individuals subject to the requirement **and their
  manner of compliance**.
- **§ 435.560:** the good-faith-effort exemption expires **no later than December 31, 2028 and may not be
  renewed** beyond that date.

---

## 12. The things most often gotten wrong

A checklist, each with the correction and the cite. Every one of these has been gotten wrong in this
project's own documents or code at least once.

| Common error | Correction | Cite |
|---|---|---|
| "Only earned income counts" | MAGI-based household income counts **earned and unearned** | § 435.552(f)(2), § 435.603(e), 26 U.S.C. 36B(d)(2)(B) |
| "SSDI, unemployment, investment, and rental income don't count" | All generally **do**. **SSI** and **child support** are the ones excluded | § 435.603(e) |
| "Taxable interest and dividends count" | **Tax-exempt interest counts too** — it is added back | 26 U.S.C. 36B(d)(2)(B) |
| "The whole household's income counts" | (d)(2) **excludes** members not required to file, on a **filing-threshold test, not an age test** | § 435.603(d)(2) |
| "Money from family counts" | Only a narrow **State option**: cash support above nominal amounts from the person **claiming you as a tax dependent**, and only for (f)(2)(i) individuals | § 435.603(d)(3), (f)(2)(i) |
| Citing the exclusions as § 435.554(a)(1)–(10) | The categories are **(c)(1)–(c)(10)**; **(a)** is definitions | 91 FR 33364 ff. |
| Citing the post-release exception as § 435.553(a)(5) | It is **§ 435.553(b)** | 91 FR 33363 |
| "Work means paid employment" | Three components: money, **in-kind**, **unpaid** | § 435.552(b) |
| "Unpaid internships don't count" | They **do** | § 435.552(b); 91 FR 33355 |
| "Each activity needs 80 hours" | 80 is a **monthly total across activities** | § 435.552(a)(5), (e)(1) |
| "Half-time school contributes hours toward 80" | It satisfies the requirement **on its own**, needs **zero** hours, and **may not be combined** | § 435.552(a)(4), (a)(5) |
| "6 credit hours is half-time" | The **school** decides. And 6 credits converts to **77.94** hours, below 80 | § 435.552(c), (d)(1) |
| "Community service must be a 501(c)(3)" | States **may not** restrict it that way | § 435.552(b) |
| "Court-ordered service doesn't count" | It **does** | § 435.552(b) |
| "Job training programs generally count" | A **closed list of five**. Health-provider-run and Medicaid supported employment do **not** | § 435.552(b) |
| "The SNAP test is complying with SNAP work rules" | It is being **subject to** them, and it is **household**-based | § 435.554(c)(7) |
| "Veterans need a 100% schedular rating" | **Temporary or permanent** total, and **TDIU** counts | § 435.554(c)(4); 91 FR 33372 |
| "Medically frail means having a listed diagnosis" | Two-part test with a **functional** gate, plus a **request path** for unlisted conditions | § 435.554(c)(5) |
| "Postpartum is 60 days" | Often **12 months** under SSA § 1902(e)(16) | § 435.554(c)(10) |
| "Age 65+ is exempt" | They are **outside the group entirely** — a different mechanism | § 435.551, § 435.119 |
| "Under 19 is an exclusion" | It is a **mandatory exception** | § 435.553(a)(1) |
| "Hours and income are either/or" | They **combine**, and income below the threshold may be credited **as** hours | § 435.552(e) |
| "Seasonal work means ≤ 6 months a year" | **No such test exists.** Inclusive examples only, and no verification rule | 26 U.S.C. 45R(d)(5)(B) |
| "The 6-month seasonal average includes this month" | The assessed month is **excluded** | § 435.552(g) |
| "Renewal months must be consecutive" | CMS **forbids** requiring that | § 435.556 |
| "You get 30 days from the notice" | 30 days from **receipt**, deemed 5 days after the notice date — about **35** | § 435.558(a)(2), (c)(4) |
| "Coverage stops when the notice arrives" | Coverage **continues** until a determination of ineligibility | § 435.558(a)(3) |
| "A State can get an 1115 waiver from this" | **No waiver path exists** | § 435.563 |

---

## 13. Known uncertainty — flagged rather than resolved

**Renewal frequency conflicts with itself.** The IFC revises § 435.916 to say MAGI renewals happen every 12
months and no more often. Its own preamble says the adult group is subject to **6-month** renewals from
January 1, 2027 under SSA § 1902(e)(14)(L) — a **different section of PL 119-21 that this rule does not
implement**, and which does **not** apply to American Indians or most § 1115 enrollees. Treat 6 months as
operative for the adult group, flag it as sourced elsewhere, and watch for the reconciling rulemaking.

**Two internal cross-references in the IFC are broken and uncorrected.** § 435.554(c)(3) points at
"paragraphs (c)(1)(i)(A) through (C)" where (c)(3)(i) is meant, and § 435.554(c)(5)(ii) points at "paragraphs
(a)(5)(i)(A) through (E)" where (c)(5)(i) is meant. The June 29 correction notice republished §§ 435.557 and
435.558, **not** § 435.554, so these stand. Do not "fix" a correct citation to match a broken one.

**Litigation could move the medically-frail gate.** See § 4.

**Not verified in the IFC regulatory text**, and flagged as such rather than asserted: that § 435.557(a)
names SNAP/TANF and school enrollment specifically as opposed to the preamble discussing them; the
post-relapse self-identification right for substance use disorder; the per-State early
medical-documentation dates; and the composition of the 44 jurisdictions. Each is stated somewhere in this
repo's secondary material — none should be relied on for a user-facing claim without a page cite.

---

## Writing for people, not about the rule

The rule is more favourable than it sounds, and the favourable parts are the under-communicated ones. If you
take three things from this document into copy:

1. **Most people will not be asked for anything** — 56% verified ex parte, and States must exhaust their own
   records before asking.
2. **Existing enrollees are not assessed on January 1, 2027** — they are assessed at their first renewal
   *initiated* on or after implementation, which for many is mid-2027.
3. **A person holding a notice has about 35 days, keeps their coverage while they respond, can answer either
   "here is my compliance" or "this doesn't apply to me", and gets a 90-day reconsideration window if they
   miss the deadline.**

And one caution that runs the other way: **a self-reported "no, I'm not meeting it" can be accepted at face
value and support a denial.** Never invite a casual negative self-report. Say what the answer is used for, and
surface the exception, exclusion, and ex parte paths **before** the question.
