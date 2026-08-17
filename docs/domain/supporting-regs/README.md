# Supporting Regulations Extract

**Retrieved:** August 16, 2026 from the eCFR API, snapshot date **2026-08-13** (the most recent title issue
date available).
**Why this exists:** CMS-2454-IFC repeatedly incorporates pre-existing regulation by reference. The most
load-bearing is **42 CFR 435.603**, on which the entire income pathway rests. Before this extract, PRD goal
G1 ("every user-facing claim traces to a citation") was unsatisfiable for the income claims — they traced
only to the IFC's *characterization* of § 435.603, which is how "the total income of everyone in the
household" got into the steering doc.

**Raw text:** `42cfr-supporting-sections.txt` (§§ 435.603, 435.4, 435.907, 435.916, 435.1010, 435.119,
435.110) · `other-supporting-sections.txt` (28 CFR 35.108, 42 CFR 447.51)

> **Caution on §§ 435.907, 435.911(c), 435.912, 435.916.** HR1 § 71102 suspended the 2024 Eligibility &
> Enrollment rule's amendments to these sections, and CMS-2454-IFC **restores their pre-2024 text through
> October 1, 2034.** The IFC prints them in full. Where the IFC's printed text and eCFR disagree, **the IFC
> governs.**

---

## 1. § 435.603 — MAGI methodology · the income pathway

### 1.1 Household income — (d)

**(d)(1) General rule.** Household income is the **sum of the MAGI-based income of every individual included
in the individual's household**, except as provided in (d)(2)–(d)(4).

**(d)(2) The exclusion that corrects our earlier error.** Income is **not** included in household income
where the individual:

- **(i)** is included in the household of their natural, adopted, or step **parent** and **is not expected to
  be required to file a tax return** under IRC § 6012(a)(1) for the taxable year — *whether or not they
  actually file*; or
- **(ii)** is a tax dependent described in (f)(2)(i) who is not expected to be required to file.

> **The test is the tax-filing requirement, not age.** Our earlier phrasing ("a teenager's part-time wages
> generally don't count") was directionally right but imprecise. A 16-year-old earning above the filing
> threshold **is** counted; a 30-year-old dependent below it is not.

**(d)(3) — STATE OPTION.** Household income **may, at State option, also include actually available cash
support, exceeding nominal amounts,** provided by the person claiming the individual as a tax dependent.

**(d)(4)** The **5 percentage point FPL disregard** applies only when determining eligibility for the group
with the **highest income standard** using MAGI methods — not for a particular group. This is the mechanism
behind "133% effectively 138%."

### 1.2 What counts as income — (e)

MAGI-based income means income calculated using **the same financial methodologies as modified adjusted gross
income under IRC § 36B(d)(2)(B)**, with three exceptions:

1. **Lump sums** are counted as income **only in the month received**.
2. **Scholarships, awards, and fellowship grants used for education** and not for living expenses are
   **excluded**.
3. **Six categories of American Indian / Alaska Native income are excluded**: Alaska Native Corporation and
   Settlement Trust distributions; distributions from restricted trust property; rents, leases, rights of
   way, royalties, usage rights, and natural-resource extraction from such lands or federally protected
   off-reservation rights; distributions from real property ownership interests related to natural resources
   near a reservation; payments from ownership or usage rights in items of religious, spiritual, traditional,
   or cultural significance, or rights supporting subsistence or a traditional lifestyle; and BIA student
   financial assistance.

> **§ 36B(d)(2)(B) is the ACA premium-tax-credit MAGI definition:** adjusted gross income increased by
> excluded foreign earned income, tax-exempt interest, and **the portion of Social Security benefits not
> included in gross income.** That last clause is why **SSDI generally counts** — including the non-taxable
> portion. **SSI is Title XVI, is not a Social Security benefit under Title II, and is not counted.**

### 1.3 Household composition — (f) · asymmetric and per-person

| Situation | Household is |
|---|---|
| **(f)(1)** Files a return, not claimed as anyone's dependent | The taxpayer **plus everyone they expect to claim as a tax dependent** |
| **(f)(2)** Claimed as a tax dependent | **The household of the taxpayer claiming them** — with three exceptions routed to (f)(3) |
| **(f)(3)** Neither files nor is claimed (or falls in an (f)(2) exception) | The individual, **plus if living with them**: spouse; children under the State-specified age; and if the individual is under that age, their parents and siblings under that age |

**(f)(2) exceptions that fall back to (f)(3):** anyone **other than a spouse or child** claimed as a
dependent; someone under the State age claimed by one parent but **living with both parents** who don't file
jointly; and someone under the State age claimed by a **non-custodial parent** (physical custody per court
order, or otherwise the parent the child spends most nights with).

**(f)(3)(iv) — STATE OPTION.** The specified age is either **19**, or **19 with full-time students counted to
21**.

**(f)(4) Married couples living together:** each spouse is in the other's household **regardless of whether
they file jointly** and regardless of whether one claims the other as a dependent.

**(f)(5)** If a taxpayer cannot reasonably establish that someone is their tax dependent, that person's
inclusion is determined under (f)(3).

> **This is what makes composition asymmetric.** Two adults sharing a dwelling can have different MAGI
> households, because composition follows tax filing relationships rather than residence. There is no "the
> household" — only *this individual's* household. It is also why HourKeep must not attempt to compute a
> figure: you would have to correctly elicit the user's entire tax filing structure first.

### 1.4 No asset test — (g)

The agency **must not** apply any assets or resources test, and **must not** apply income or expense
disregards except the 5% FPL disregard.

> **Product constraint: HourKeep should never ask about assets or savings.** It is not part of this
> determination and collecting it would be both useless and invasive.

### 1.5 Budget period — (h) · two more State options, and a real opportunity

**(h)(1) Applicants and new enrollees — mandatory.** Financial eligibility **must** be based on **current
monthly household income and family size**.

**(h)(2) Current beneficiaries — STATE OPTION.** The State may elect either current monthly income **or
projected annual household income for the remainder of the current calendar year.**

**(h)(3) Reasonably predictable changes — STATE OPTION.** The agency **may** adopt a reasonable method to
include a prorated portion of reasonably predictable future income, accounting for a predictable increase, a
decrease, or both — **as evidenced by**:

- a **signed contract for employment**;
- a **clear history of predictable fluctuations in income**; or
- **other clear indicia** of such future changes.

And it "must be verified in the same manner as other income… **including by self-attestation if reasonably
compatible with other electronic data** obtained by the agency."

> ### This is the most actionable finding in this extract
>
> **"A clear history of predictable fluctuations in income" is exactly what a HourKeep income record is.**
>
> Per CMS's own worked example in the IFC, the same seasonal worker — employed April through September at
> $1,500/month — comes out at **$750/month (clears $580, compliant)** under a reasonably-predictable-changes
> methodology, and **$500/month (fails)** under the plain six-month preceding average. Same facts, opposite
> answer, turning purely on the State's election **and on whether the fluctuation history can be evidenced.**
>
> A user who has recorded six or more months of variable income in HourKeep is holding one of the three named
> evidence bases. That reframes seasonal-worker support from "we compute an average for you" to **"you have
> built the record that may qualify you for a more favorable method — here it is, ask your agency about
> reasonably predictable changes."** Consistent with ADR-0003: we present evidence, they decide.
>
> Fold into W7a (seasonal corrections) and W8a (the export should be able to present a fluctuation history
> explicitly).

### 1.6 Where MAGI does not apply — (j)

MAGI methods are **not** used for: individuals whose eligibility requires no income determination (including
**SSI recipients**); individuals **age 65 or older** where age is a condition of eligibility; individuals
whose eligibility is determined **on the basis of being blind or disabled**; individuals requesting
**long-term services and supports** or being evaluated for an institutional or HCBS group; **Medicare
cost-sharing** assistance; and **medically needy** coverage.

> **This is "non-MAGI Medicaid"** — the thing HourKeep's `health-non-magi` question gestures at. The list is
> concrete and can be asked about far better than "Are you eligible for non-MAGI Medicaid?"

### 1.7 Other State options in this section

- **(b) Family size and pregnancy.** When determining the family size of *others* who have a pregnant woman
  in their household, she is counted **at State option** as either 1 or 2 persons, or as herself plus the
  number of children she is expected to deliver.

---

## 2. 28 CFR 35.108 — ADA "disability" · the `disabled individual` definition

§ 435.554(a) defines a **disabled individual** by reference to this section, and adds that the person **need
not** be Medicaid-eligible on the basis of disability.

**(a)(1) Three independent prongs.** Disability means, with respect to an individual:

1. a **physical or mental impairment that substantially limits** one or more **major life activities**;
2. a **record of** such an impairment; **or**
3. **being regarded as having** such an impairment.

**(a)(2) Rules of construction — these matter for how we ask.**

- The definition "shall be construed **broadly in favor of expansive coverage, to the maximum extent
  permitted** by the terms of the ADA."
- An individual **may establish coverage under any one or more** of the three prongs.

> **HourKeep's current question — "someone with a disability" — is far narrower than the standard.** The
> caregiver screening should be permissive and should surface all three prongs, because a "record of" or
> "regarded as" impairment qualifies without any showing that a major life activity is substantially limited.
> Fold into W4.

---

## 3. 42 CFR 447.51 — "Indian" · the exclusion at § 435.554(c)(2)

Defined as any individual described at **25 U.S.C. 1603(13), 1603(28), or 1679(a)**, or determined eligible
as an Indian under **42 CFR 136.12**. Four routes:

1. **Member of a federally-recognized Indian tribe**;
2. **Resides in an urban center** and meets one or more of: member of a tribe, band, or other organized group
   including those terminated since 1940 and those recognized now or in future by the State of residence, **or
   a first- or second-degree descendant** of such a member; is an **Eskimo, Aleut, or other Alaska Native**;
   is considered an Indian by the Secretary of the Interior for any purpose; or is determined to be an Indian
   under the Secretary's regulations;
3. Is **considered by the Secretary of the Interior** to be an Indian for any purpose; **or**
4. Is **considered by HHS** to be an Indian for IHS eligibility purposes, **including as a California Indian,
   Eskimo, Aleut, or other Alaska Native.**

> HourKeep's current question ("Indian, Urban Indian, California Indian, or IHS-eligible Indian") tracks the
> statute but misses that **Alaska Natives are explicitly included**, that **descendants to the second degree**
> can qualify through the urban-center route, and that **State-recognized** tribes count. Recall also that
> States **may not reverify** this status. Fold into W4.

---

## 4. New State options for the policy profile

Found in § 435.603 and not previously in `state-options.md`:

| Parameter | Citation | Options |
|---|---|---|
| Cash support from a claiming taxpayer counted in household income | § 435.603(d)(3) | include / not |
| Household age threshold | § 435.603(f)(3)(iv) | 19, or 19 with full-time students to 21 |
| Budget period for current beneficiaries | § 435.603(h)(2) | current monthly / projected annual |
| Reasonably predictable changes methodology | § 435.603(h)(3) | increases / decreases / both / none, and the window |
| Pregnant-woman counting in others' family size | § 435.603(b) | 1 / 2 / herself + expected children |

That brings the tracked State-configurable parameter count to **29**.

---

## 5. What this changes in the plan

1. **PRD goal G1 is now satisfiable for the income claims.** They trace to § 435.603, extracted here.
2. **The steering doc's dependent-income correction is confirmed and made precise** — the test is the tax
   filing requirement, not age.
3. **Never ask about assets** (§ 435.603(g)).
4. **The reasonably-predictable-changes opportunity** is the most valuable single finding: HourKeep's income
   record may itself be the evidence that unlocks a more favorable methodology for seasonal and variable-income
   workers. W7a and W8a.
5. **The `disabled individual` question needs widening to the ADA's three prongs** with its
   construe-broadly instruction. W4.
6. **The `non-MAGI Medicaid` question can be replaced** with concrete circumstances from § 435.603(j).  W4.
7. **The Indian definition needs Alaska Natives, second-degree descendants, and State-recognized tribes.** W4.
8. **Five more State options** for the policy profile schema.
