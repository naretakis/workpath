# HR1 Impact Summary - HHS Programs

## Executive Summary

HR1 is a comprehensive reconciliation bill that significantly impacts multiple HHS programs, particularly SNAP (Supplemental Nutrition Assistance Program), Medicaid, and health insurance marketplaces. The bill introduces substantial changes to eligibility requirements, work requirements, cost-sharing arrangements, and program administration that will require significant technology and system modifications.

This bill creates technology modernization demands across state HHS programs, requiring system upgrades within compressed timelines. This presents significant AWS opportunities to support state and local government customers facing complex implementation challenges.

**Overall Impact**: States must simultaneously implement new tracking systems, enhance verification capabilities, and manage dual program structures—all while losing federal administrative support and facing new compliance requirements.

---

## SNAP (Supplemental Nutrition Assistance Program) Changes

### Key Changes

#### 1. Work Requirements for Able-Bodied Adults (Section 10102)

The bill significantly tightens work requirements by amending Section 6(o) of the Food and Nutrition Act. The legislation standardizes enforcement across states by eliminating much of the flexibility states previously had in waiving work requirements.

**Specific Bill Language Changes:**

- Adds new exception categories in paragraph (3)(F) and (3)(G) for "an Indian or an Urban Indian" and "a California Indian described in section 809(a) of the Indian Health Care Improvement Act"
- Modifies the area-based waiver criteria in paragraph (4)(A)(ii) to restrict waivers to areas that "is in a noncontiguous State and has an unemployment rate that is at or above 1.5 times the national unemployment rate"
- Explicitly defines "noncontiguous State" to exclude Guam and Virgin Islands, limiting this flexibility to Alaska and Hawaii only

**New Waiver Process for Noncontiguous States:**
The bill creates a complex "good faith effort" exemption process in new paragraph (7) that allows Alaska and Hawaii to request temporary exemptions through December 31, 2028, if they can demonstrate:

- Actions taken toward compliance
- Significant barriers including "funding, design, development, procurement, or installation of necessary systems"
- Detailed compliance timeline with milestones
- Quarterly progress reporting requirements

**Technology Impact:** This change will require states to implement more rigorous work verification systems and eliminate the flexibility many states currently use to waive requirements in high-unemployment areas. The "good faith effort" process will require enhanced reporting and milestone tracking systems.

#### 2. Thrifty Food Plan Changes (Section 10101)

This section fundamentally restructures how SNAP benefit levels are calculated by replacing the existing thrifty food plan framework with a more restrictive approach that limits future benefit increases.

**Specific Bill Provisions:**
The bill replaces subsection (u) entirely, establishing that the thrifty food plan "means the diet required to feed a family of 4 persons" based on the 2021 USDA report, with three critical restrictions:

- Paragraph (4)(A): Market baskets "may" be re-evaluated "not earlier than October 1, 2027" (emphasis on discretionary language)
- Paragraph (4)(B): Any re-evaluation "shall not increase the cost of the thrifty food plan" - requiring absolute cost neutrality
- Paragraph (3)(C): Limits adjustments to Consumer Price Index changes only, starting October 1, 2025

**Fixed Household Ratios:**
The bill codifies specific household size percentages that cannot be adjusted:

- 1-person: 30%, 2-person: 55%, 3-person: 79%, 4-person: 100%, etc.
- These ratios are locked in and cannot be modified through the re-evaluation process

**Technology Impact:** SNAP benefit calculation systems will need to be updated to implement the fixed ratios and CPI-only adjustments. The cost-neutrality requirement for any future re-evaluations will require sophisticated cost modeling capabilities to ensure no net increase in benefit levels.

#### 3. Utility Allowances Restrictions (Section 10103)

This provision significantly restricts which households can receive standard utility allowances, a change that will reduce SNAP benefits for many working families.

**Specific Bill Language:**
The bill amends Section 5(e)(6)(C)(iv)(I) by inserting "with an elderly or disabled member" after "households," and similarly modifies Section 5(k)(4) to distinguish between households "without an elderly or disabled member" and those "with an elderly or disabled member."

**Practical Impact:**
Currently, households can receive standard utility allowances if they receive energy assistance or have utility expenses. Under this change, only households containing someone who is:

- Age 60 or older, or
- Receiving disability benefits
  would be eligible for these allowances.

**Technology Impact:** SNAP eligibility systems will need to be modified to check household composition for elderly or disabled members before applying utility allowances. This will require integration with disability determination systems and age verification processes.

#### 4. Internet Expense Exclusion (Section 10104)

This brief but significant provision explicitly excludes internet costs from SNAP shelter deduction calculations, reflecting a policy view that internet access is not a necessary shelter expense.

**Specific Bill Language:**
Adds new paragraph (E) to Section 5(e)(6): "Any service fee associated with internet connection shall not be used in computing the excess shelter expense deduction under this paragraph."

**Practical Impact:**
Many low-income households currently include internet costs in their shelter expense calculations, which can increase their SNAP benefits through the excess shelter deduction. This change will reduce benefits for households that:

- Pay for internet service
- Have total shelter costs (rent/mortgage + utilities + internet) that exceed 50% of their income
- Currently receive the excess shelter deduction

**Technology Impact:** SNAP benefit calculation systems will need to be updated to identify and exclude internet service fees from shelter expense calculations. This may require additional data collection about the types of utility and service expenses households report.

#### 5. State Cost-Sharing Requirements (Section 10105)

This represents the most significant structural change to SNAP financing since the program's creation, introducing state matching requirements tied to payment accuracy performance.

**Detailed Matching Structure:**
The bill adds new paragraph (2) to Section 4(a), creating a "State Quality Control Incentive" with specific federal/state cost-sharing ratios:

- Less than 6% error rate: 100% Federal, 0% State
- 6% to under 8%: 95% Federal, 5% State
- 8% to under 10%: 90% Federal, 10% State
- 10% or higher: 85% Federal, 15% State

**Implementation Timeline and Flexibility:**

- Begins in FY 2028 for most states
- States can elect to use FY 2025 or 2026 error rates for FY 2028 calculations
- FY 2029 and beyond use "third fiscal year preceding" error rates
- **Delayed Implementation:** States with error rates of 30% or higher (error rate × 1.5 ≥ 20%) get additional time:
  - FY 2025 high-error states: Implementation delayed to FY 2029
  - FY 2026 high-error states: Implementation delayed to FY 2030

**New Federal Payment Limitation:**
Paragraph (3) establishes that "The Secretary may not pay towards the cost of an allotment...an amount that is greater than the applicable Federal share," creating a hard cap on federal contributions.

**Technology Impact:** This change requires comprehensive payment accuracy monitoring systems, automated error rate calculations, and sophisticated payment allocation mechanisms. States will need enhanced quality control systems and real-time error tracking to manage their financial exposure.

#### 6. Administrative Cost Reduction (Section 10106)

This provision cuts federal administrative support in half, representing a major cost shift to states for SNAP program operations.

**Specific Bill Language:**
Amends Section 16(a) by changing the federal reimbursement from "50 per centum" to "through fiscal year 2026, 50 percent, and for fiscal year 2027 and each fiscal year thereafter, 25 percent."

**Financial Impact Analysis:**
Currently, the federal government reimburses states for 50% of SNAP administrative costs, including:

- Eligibility determination and case management
- Quality control activities
- Systems operations and maintenance
- Fraud investigation and prevention
- Outreach and customer service

Starting in FY 2027, states will bear 75% of these costs instead of 50%, effectively doubling their administrative burden.

**Technology Impact:** States may be forced to reduce administrative investments, potentially affecting system modernization efforts, customer service capabilities, and fraud prevention activities. This could paradoxically worsen payment error rates just as the cost-sharing requirements in Section 10105 take effect.

#### 7. Alien Eligibility Restrictions (Section 10108)

This section completely rewrites alien eligibility for SNAP, replacing the current complex framework with a much more restrictive approach.

**Complete Replacement of Section 6(f):**
The bill replaces the entire subsection with new language requiring individuals to be both:

1. "A resident of the United States," AND
2. One of four specific categories:
   - "A citizen or national of the United States"
   - "An alien lawfully admitted for permanent residence as an immigrant as defined by sections 101(a)(15) and 101(a)(20) of the Immigration and Nationality Act, excluding, among others, alien visitors, tourists, diplomats, and students"
   - "An alien who has been granted the status of Cuban and Haitian entrant, as defined in section 501(e) of the Refugee Education Assistance Act of 1980"
   - "An individual who lawfully resides in the United States in accordance with a Compact of Free Association"

**Eliminated Categories:**
The bill eliminates SNAP eligibility for numerous categories currently eligible, including:

- Refugees and asylees (after their initial eligibility period)
- Victims of trafficking
- Certain military families
- Various humanitarian categories

**Income Counting Provision:**
The bill retains the provision that income and resources of ineligible household members are still counted in determining benefits for eligible members, potentially reducing benefits for mixed-status families.

**Technology Impact:** SNAP eligibility systems will require comprehensive immigration status verification capabilities, including integration with DHS databases for permanent resident status verification and Cuban/Haitian entrant documentation. The system will need to distinguish between the four eligible categories and all other immigration statuses.

### Key Implementation Dates

- **Immediate**: Work requirement changes, utility allowance restrictions, internet expense exclusions, alien eligibility restrictions
- **October 1, 2025**: Annual CPI adjustments begin
- **FY 2027**: Administrative cost sharing reduction begins
- **FY 2028**: State matching requirements begin
- **October 1, 2027**: Earliest date for thrifty food plan re-evaluation

### Technology Impacts

- Enhanced error rate monitoring and reporting systems
- Immigration status verification integration
- Payment allocation systems for state cost-sharing
- Utility allowance calculation modifications
- Shelter expense deduction system updates

---

## Medicaid Program Changes

### Subchapter A: Reducing Fraud and Improving Enrollment Processes

#### 1. Enrollment System Moratoriums (Sections 71101-71102)

- **Impact**: Blocks implementation of CMS streamlining rules until September 30, 2034
- **Technology Impact**: Prevents modernization of eligibility and enrollment systems
- **Implementation Funding**: $1M for FY 2026

#### 2. Duplicate Enrollment Prevention (Section 71103)

This section creates the most significant new federal data system in Medicaid since the program's inception, establishing a national database to prevent individuals from being enrolled in multiple state Medicaid programs simultaneously.

**New Federal System Requirements:**
The bill adds new subsection (uu) requiring the Secretary to "establish a system to be utilized by the Secretary and States to prevent an individual from being simultaneously enrolled under the State plans (or waivers of such plans) of multiple States" by October 1, 2029.

**State Data Submission Requirements:**
New paragraph (88)(B) mandates states submit "not less frequently than once each month":

- Social security numbers of enrollees (when available and required)
- "Such other information with respect to such individual as determined necessary by the Secretary for purposes of preventing individuals from simultaneously being enrolled under State plans"

**Address Verification Process:**
New subsection (vv) requires states to implement address verification by January 1, 2027, using "reliable data sources":

- Mail returned by USPS with forwarding addresses
- National Change of Address Database
- Managed care entity address information
- Other Secretary-approved data sources

**Managed Care Integration:**
New Section 1932(j) requires managed care contracts to "promptly transmit to the State any address information for an individual enrolled with such entity or plan that is provided to such entity or plan directly from, or verified by such entity or plan directly with, such individual."

**Technology Impact:** This represents a massive federal IT undertaking requiring:

- New federal database infrastructure with monthly data ingestion from all states
- Real-time query capabilities for enrollment verification
- Integration with existing PARIS (Public Assistance Reporting Information System)
- State system modifications for monthly data transmission
- Address verification automation across multiple data sources

#### 3. Deceased Individual Screening (Section 71104)

- **Requirement**: Quarterly Death Master File screening starting January 1, 2027
- **Technology Impact**: Automated death verification systems required
- **Process**: Automatic disenrollment with reinstatement procedures for errors

#### 4. Provider Death Screening (Section 71105)

- **Requirement**: Death Master File checks for providers starting January 1, 2028
- **Frequency**: At enrollment and quarterly thereafter
- **Technology Impact**: Provider enrollment system enhancements

#### 5. Payment Error Reductions (Section 71106)

- **Enhanced Auditing**: Expands erroneous payment definitions
- **Effective Date**: FY 2030
- **Technology Impact**: Enhanced payment accuracy monitoring systems

#### 6. Eligibility Redeterminations (Section 71107)

- **Major Change**: 6-month redetermination cycle for expansion adults starting after December 31, 2026
- **Exception**: Excludes certain vulnerable populations
- **Technology Impact**: Automated redetermination scheduling systems
- **Implementation Funding**: $75M for FY 2026

#### 7. Home Equity Limits (Section 71108)

- **Changes**: Modifies asset limits for long-term care eligibility
- **Agricultural Homes**: Maintains current limits
- **Non-Agricultural Homes**: States may set limits up to $1M
- **Effective Date**: January 1, 2028

#### 8. Alien Eligibility Restrictions (Section 71109)

- **Major Change**: Restricts Medicaid to same categories as SNAP (Section 10108)
- **Effective Date**: October 1, 2026
- **Technology Impact**: Immigration status verification systems
- **Implementation Funding**: $15M for FY 2026

### Subchapter B: Preventing Wasteful Spending

#### 9. Nursing Home Staffing Standards Moratorium (Section 71111)

- **Impact**: Blocks CMS staffing standards until September 30, 2034

#### 10. Retroactive Coverage Reduction (Section 71112)

- **Major Change**: Reduces retroactive coverage period
- **Expansion Adults**: From 3 months to 1 month prior to application
- **Other Beneficiaries**: From 3 months to 2 months prior to application
- **Effective Date**: After December 31, 2026
- **Implementation Funding**: $10M for FY 2026

#### 11. Prohibited Entity Payments (Section 71113)

- **Impact**: 1-year prohibition on payments to certain family planning organizations
- **Criteria**: Organizations providing abortions (with exceptions) receiving >$800K in FY 2023
- **Implementation Funding**: $1M for FY 2026

### Subchapter C: Stopping Abusive Financing Practices

#### 12. Enhanced FMAP Sunset (Section 71114)

- **Impact**: States must begin expansion coverage before January 1, 2026 to receive enhanced federal matching

#### 13. Provider Tax Restrictions (Section 71115)

This section fundamentally restructures Medicaid provider tax policy by creating different rules for expansion and non-expansion states, with the goal of reducing federal costs while maintaining state financing flexibility for non-expansion states.

**Complex Dual-Track System:**
The bill adds new subparagraph (D) to Section 1903(w)(4), creating "applicable percent" thresholds that vary by state expansion status and provider class:

**Non-Expansion State Rules:**

- States that haven't expanded Medicaid maintain their current provider tax levels if "enacted" and "within the hold harmless threshold" as of the bill's enactment
- If no tax existed on enactment date: 0% threshold (no new taxes allowed)
- Applies to provider classes "described in section 433.56(a) of title 42, Code of Federal Regulations (as in effect on May 1, 2025)"

**Expansion State Restrictions:**
For states that expanded Medicaid, the bill creates a gradual reduction schedule:

- FY 2028: 5.5% threshold
- FY 2029: 5.0% threshold
- FY 2030: 4.5% threshold
- FY 2031: 4.0% threshold
- FY 2032+: 3.5% threshold

**Special Grandfathering Provision:**
Clause (iv) provides that expansion states with existing taxes on "class of health care items or services that is described in paragraph (3) or (4) of section 433.56(a)" (nursing facilities and ICF/IID) that were "within the hold harmless threshold" on enactment can maintain their current levels instead of following the reduction schedule.

**Territorial Exclusion:**
Subsection (b) explicitly states "The amendments made by this section shall only apply with respect to a State that is 1 of the 50 States or the District of Columbia," excluding territories from these restrictions.

**Technology Impact:** This change requires sophisticated provider tax tracking systems that can:

- Distinguish between expansion and non-expansion states
- Track historical tax enactment dates and levels
- Apply different thresholds by provider class and state status
- Monitor compliance with the gradual reduction schedule
- Handle grandfathering exceptions for specific provider classes

#### 14. State Directed Payment Limits (Section 71116)

This section imposes the most significant restrictions on state directed payments in Medicaid managed care since these arrangements became widespread, creating different caps based on state Medicaid expansion status.

**Regulatory Revision Requirement:**
The bill requires the Secretary to "revise section 438.6(c)(2)(iii) of title 42, Code of Federal Regulations (or a successor regulation)" to limit total payment rates for services to specific percentages of Medicare rates.

**Differential Rate Caps:**

- **Expansion States**: Limited to "100 percent of the specified total published Medicare payment rate"
- **Non-Expansion States**: Limited to "110 percent of the specified total published Medicare payment rate"
- **Fallback**: When no Medicare rate exists, payments limited to "the payment rate under a Medicaid State plan (or under a waiver of such plan)"

**Complex Grandfathering Provisions:**
Subsection (b) creates multiple grandfathering categories:

1. **Standard Grandfathering**: Payments with "written prior approval (or a good faith effort to receive such approval)" made before May 1, 2025
2. **Rural Hospital Grandfathering**: Rural hospital payments with approval efforts by the bill's enactment date
3. **Completed Preprint Grandfathering**: Payments with "completed preprint" submitted before enactment

**Phase-Down Schedule:**
Grandfathered arrangements must reduce by "10 percentage points each year" starting with rating periods on or after January 1, 2028, "until the total payment rate for such service is equal to the rate for such service specified in subsection (a)."

**Expansion State Treatment:**
Subsection (c) specifies that states beginning expansion "on or after the date of the enactment" immediately get the 100% Medicare rate limitation.

**Rural Hospital Definition:**
Subsection (d)(2) provides an extensive definition including:

- Rural subsection (d) hospitals
- Critical access hospitals
- Sole community hospitals
- Medicare-dependent small rural hospitals
- Low-volume hospitals
- Rural emergency hospitals

**Technology Impact:** This change requires sophisticated payment rate monitoring systems that can:

- Track Medicare payment rates by service and geographic area
- Apply different percentage caps based on state expansion status
- Manage grandfathering timelines and phase-down schedules
- Identify rural hospital classifications
- Monitor compliance across multiple rating periods

#### 15. Provider Tax Waiver Requirements (Section 71117)

- **Impact**: Tightens requirements for provider tax waivers
- **Effective Date**: Upon enactment (up to 3-year transition)

#### 16. Section 1115 Waiver Budget Neutrality (Section 71118)

- **Requirement**: All Medicaid waivers must be budget neutral starting January 1, 2027
- **Technology Impact**: Enhanced actuarial analysis systems
- **Implementation Funding**: $5M each for FY 2026-2027

### Subchapter D: Increasing Personal Accountability

#### 17. Community Engagement Requirements (Section 71119)

This section creates the most comprehensive work requirement system ever implemented in Medicaid, establishing detailed verification, exemption, and enforcement procedures that will require extensive new technology infrastructure.

**Detailed Work Requirement Structure:**
New subsection (xx) establishes that "applicable individuals" must demonstrate community engagement through:

- Working "not less than 80 hours" per month
- Completing "not less than 80 hours of community service"
- Participating in work programs for "not less than 80 hours"
- Being enrolled in educational programs "at least half-time"
- Having monthly income equivalent to 80 hours at minimum wage
- Being a seasonal worker with 6-month average income meeting the threshold

**Complex Exemption Framework:**
Paragraph (9)(A)(ii) defines "specified excluded individuals" with detailed criteria including:

- Parents/caregivers of children under 14 or disabled individuals
- Veterans with total disability ratings
- Individuals who are "medically frail or otherwise have special medical needs," including those with:
  - Substance use disorders
  - Disabling mental disorders
  - Physical, intellectual, or developmental disabilities
  - "Serious or complex medical conditions"
- Individuals complying with TANF work requirements
- SNAP recipients not exempt from SNAP work requirements
- Participants in drug/alcohol treatment programs

**Verification and Enforcement Process:**
Paragraph (5) requires states to use "reliable information available to the State (such as payroll data or payments or encounter data under this title)" for "ex parte verifications" without requiring additional individual submissions where possible.

Paragraph (6) establishes a detailed noncompliance procedure:

- 30-day notice and opportunity to demonstrate compliance
- Continued coverage during the 30-day period
- Determination of other eligibility bases before disenrollment
- Written notice and fair hearing rights

**Good Faith Effort Exemption:**
Paragraph (11) allows states to request exemptions through December 31, 2028, if they demonstrate "good faith effort" including:

- Actions taken toward compliance
- Significant barriers related to "funding, design, development, procurement, or installation of necessary systems"
- Detailed compliance timeline with milestones
- Quarterly progress reporting

**Technology Impact:** This provision requires the most complex eligibility verification system in Medicaid history, including:

- Work hour tracking and verification systems
- Integration with employer payroll systems
- Educational enrollment verification
- Income verification for seasonal workers
- Medical condition and disability determination integration
- TANF and SNAP work requirement coordination
- Automated exemption determination
- 30-day notice and tracking systems
- Fair hearing integration

#### 18. Cost-Sharing for Expansion Adults (Section 71120)

- **Requirement**: Cost-sharing for expansion adults above poverty line starting October 1, 2028
- **Limits**: $35 per service, 5% of family income annually
- **Exclusions**: Primary care, mental health, substance abuse, FQHC services
- **Implementation Funding**: $15M for FY 2026

### Subchapter E: Expanding Access to Care

#### 19. HCBS Waiver Expansion (Section 71121)

- **New Option**: Standalone HCBS waivers without institutional level of care requirement
- **Effective Date**: July 1, 2028
- **Requirements**: Needs-based criteria, cost neutrality attestation
- **Implementation Funding**: $50M for FY 2026, $100M for FY 2027

### Key Implementation Dates - Medicaid

- **January 1, 2027**: Address verification, deceased screening, eligibility redeterminations
- **January 1, 2028**: Provider death screening, home equity limits, state directed payment phase-down
- **October 1, 2026**: Alien eligibility restrictions
- **October 1, 2028**: Cost-sharing requirements
- **October 1, 2029**: Multi-state enrollment prevention system
- **July 1, 2028**: HCBS waiver expansion
- **FY 2030**: Enhanced payment error provisions

### Technology Impacts - Medicaid

- Federal multi-state enrollment prevention system
- Death Master File integration for beneficiaries and providers
- Immigration status verification systems
- Work verification and tracking systems
- Enhanced payment accuracy monitoring
- Automated redetermination scheduling
- HCBS needs assessment systems

---

## Qualified Health Plans (Premium Insurance Subsidies) Changes

### Subchapter A: Improving Eligibility Criteria

#### 1. Alien Eligibility Restrictions (Section 71301)

This section creates the most restrictive alien eligibility criteria for premium tax credits since the ACA's enactment, fundamentally changing who can receive federal assistance for health insurance.

**New "Eligible Alien" Definition:**
The bill adds new subparagraph (B) to Section 36B(e)(2), defining "eligible aliens" as those who are "reasonably expected to be for the entire period of enrollment":

- "An alien who is lawfully admitted for permanent residence under the Immigration and Nationality Act"
- "An alien who has been granted the status of Cuban and Haitian entrant, as defined in section 501(e) of the Refugee Education Assistance Act of 1980"
- "An individual who lawfully resides in the United States in accordance with a Compact of Free Association"

**Elimination of Current Categories:**
The change eliminates premium tax credit eligibility for numerous categories currently eligible under "lawfully present" status, including:

- Refugees and asylees
- Victims of trafficking
- Individuals with withholding of removal
- Temporary protected status recipients
- DACA recipients
- Various humanitarian categories

**"Entire Period" Requirement:**
The bill requires individuals to be eligible aliens "for the entire period of enrollment for which the credit under this section is being claimed," creating potential mid-year eligibility loss issues for individuals whose status changes.

**Marketplace Verification Requirements:**
Section 1411 amendments require marketplaces to verify "whether such individual is an eligible alien" and obtain attestations of eligible alien status, with specific verification procedures for:

- Initial eligibility determinations
- Advance payment calculations
- Reconciliation processes

**Technology Impact:** Marketplaces will need comprehensive immigration status verification systems that can:

- Distinguish between the three eligible alien categories and all other statuses
- Verify status for "entire period" requirements
- Handle mid-year status changes
- Integrate with DHS databases for permanent resident verification
- Process Cuban/Haitian entrant documentation
- Manage Compact of Free Association verification

#### 2. Medicaid Ineligibility Coordination (Section 71302)

This section eliminates a key coordination provision that currently allows individuals to receive premium tax credits while they are ineligible for Medicaid due to immigration status, creating potential coverage gaps for lawfully present immigrants.

**Elimination of Current Exception:**
The bill strikes subparagraph (B) from Section 36B(c)(1), which currently provides that individuals are not considered eligible for Medicaid if they are "an alien lawfully present in the United States" who is ineligible for Medicaid "by reason of such alien status."

**Current Law Context:**
Under existing law, this provision allows lawfully present immigrants who are:

- Subject to the 5-year waiting period for Medicaid
- In states that haven't extended Medicaid to lawfully present immigrants
- Otherwise ineligible for Medicaid due to immigration status
  to still receive premium tax credits for marketplace coverage.

**Impact of Elimination:**
By removing this exception, the bill creates a situation where:

- Individuals who are technically eligible for Medicaid (even if they can't actually enroll due to immigration restrictions) would be barred from premium tax credits
- This could create coverage gaps for lawfully present immigrants during waiting periods
- The change works in conjunction with Section 71301's alien eligibility restrictions to further limit marketplace assistance

**Interaction with Other Provisions:**
This change is particularly significant when combined with:

- Section 71301's restriction of premium tax credits to "eligible aliens" only
- Section 71109's similar Medicaid alien eligibility restrictions
- The result is a coordinated approach to limit federal health coverage assistance to the same narrow categories across programs

**Technology Impact:** Marketplace and tax systems will need to:

- Remove the current immigration status exception from Medicaid eligibility determinations
- Coordinate more closely with Medicaid eligibility systems to determine actual (not theoretical) Medicaid eligibility
- Handle cases where individuals may lose premium tax credit eligibility mid-year due to Medicaid eligibility changes
- Process the interaction between this change and the alien eligibility restrictions in Section 71301

### Subchapter B: Preventing Waste, Fraud, and Abuse

#### 3. Enhanced Verification Requirements (Section 71303)

This section creates the most comprehensive verification requirements in marketplace history, establishing both pre-enrollment verification processes and enhanced ongoing verification requirements.

**New "Coverage Month" Restrictions:**
The bill adds new paragraph (5) to Section 36B(c), establishing that months cannot be "coverage months" eligible for premium tax credits unless the Exchange verifies eligibility using "applicable enrollment information that shall be provided or verified by the applicant."

**Required Verification Elements:**
Subparagraph (B) mandates verification of "at least the following information":

- "Household income and family size"
- "Whether the individual is an eligible alien"
- "Any health coverage status or eligibility for coverage"
- "Place of residence"
- "Such other information as may be determined by the Secretary (in consultation with the Secretary of Health and Human Services) as necessary"

**Pre-Enrollment Verification Process:**
New clause (ii) in paragraph (3)(A) requires Exchanges to "provide a process for pre-enrollment verification through which any applicant may, beginning not later than August 1, verify with the Exchange the applicant's household income and eligibility for enrollment in such plan for plan years beginning in the subsequent year."

**Retroactive Verification:**
Subparagraph (C) allows retroactive treatment as coverage months if the Exchange "verifies for such month (using applicable enrollment information that shall be provided or verified by the applicant) such individual's eligibility to have so enrolled and for any such advance payment."

**Third-Party Data Sources:**
Subparagraph (F) permits Exchanges to "use any data available to the Exchange and any reliable third-party sources in collecting information for verification by the applicant."

**Filing Requirement Compliance:**
New paragraph (6) requires Exchanges to meet "the requirements of section 155.305(f)(4)(iii) of title 45, Code of Federal Regulations (as published in the Federal Register on June 25, 2025 (90 Fed. Reg. 27074), applied as though it applied to all plan years after 2025)" for months to qualify as coverage months.

**Technology Impact:** This creates massive new verification infrastructure requirements:

- Real-time eligibility verification systems
- Pre-enrollment verification portals available by August 1 annually
- Integration with multiple third-party data sources
- Retroactive verification capabilities
- Enhanced data collection and storage systems
- Compliance monitoring for filing requirements

#### 4. Special Enrollment Period Restrictions (Section 71304)

- **Impact**: Eliminates premium tax credits for certain income-based special enrollment periods
- **Effective Date**: Plan years beginning after December 31, 2025

#### 5. Unlimited Recapture (Section 71305)

This section eliminates one of the ACA's most significant consumer protections by removing all limits on how much individuals must repay in excess advance premium tax credits.

**Complete Elimination of Recapture Limits:**
The bill strikes subparagraph (B) from Section 36B(f)(2), which currently caps repayment amounts based on income levels. Under current law, repayment is limited to:

- $325-$825 for individuals with income 200-300% of poverty
- $1,325-$2,700 for individuals with income 300-400% of poverty
- No limit only for those above 400% of poverty

**New Unlimited Liability:**
After this change, individuals at all income levels will be required to repay the full amount of any excess advance payments, regardless of their income or financial circumstances. This means:

- A family at 250% of poverty could owe thousands in repayment
- No consideration for ability to pay
- No income-based caps or sliding scale protections

**Conforming Amendment Impact:**
The bill also modifies Section 35(g)(12)(B)(ii) to ensure the unlimited recapture applies to the Health Coverage Tax Credit as well, extending the harsh repayment requirements beyond just premium tax credits.

**Technology Impact:** Tax processing and marketplace systems will need to:

- Remove all recapture limitation calculations
- Process unlimited repayment amounts
- Handle potentially large tax liabilities for low-income individuals
- Modify advance payment reconciliation processes
- Update taxpayer notices and forms to reflect unlimited liability

### Subchapter C: Enhancing Choice for Patients

#### 6. Telehealth HSA Safe Harbor (Section 71306)

- **Change**: Makes telehealth safe harbor permanent for HSA-qualified plans
- **Effective Date**: Plan years beginning after December 31, 2024

#### 7. Bronze/Catastrophic Plan HSA Eligibility (Section 71307)

- **Major Change**: Allows HSAs with bronze and catastrophic marketplace plans
- **Effective Date**: Months beginning after December 31, 2025
- **Technology Impact**: HSA eligibility determination systems

#### 8. Direct Primary Care Arrangements (Section 71308)

- **Change**: Allows direct primary care with HSAs
- **Limit**: $150/month individual, $300/month family
- **Effective Date**: Months beginning after December 31, 2025

### Key Implementation Dates - Health Tax

- **January 1, 2025**: Telehealth HSA safe harbor permanent
- **January 1, 2026**: Medicaid ineligibility coordination, special enrollment restrictions, unlimited recapture, HSA expansions
- **January 1, 2027**: Alien eligibility restrictions
- **January 1, 2028**: Enhanced verification requirements

### Technology Impacts - Health Tax

- Immigration status verification in marketplaces
- Enhanced income and eligibility verification systems
- HSA eligibility determination updates
- Advance payment reconciliation system modifications

---

## Rural Health Transformation Program (Section 71401)

### Major New Program

- **Funding**: $50 billion over 5 years (FY 2026-2030)
- **Eligibility**: 50 states only
- **Application Deadline**: December 31, 2025
- **Activities**: Technology adoption, workforce recruitment, care delivery innovation
- **Implementation Funding**: $200M for FY 2025

### Technology Impacts

- Rural health technology infrastructure
- Telemedicine and remote monitoring systems
- Health information technology advances
- Cybersecurity capability development

---

## Summary of Key Implementation Dates

### Immediate (Upon Enactment)

- SNAP work requirements, utility allowances, alien eligibility
- Medicaid prohibited entity payments
- Provider tax waiver requirements

### 2025

- Rural Health Transformation Program applications due (December 31, 2025)

### 2026

- SNAP administrative cost reduction (FY 2027)
- Medicaid alien eligibility restrictions (October 1, 2026)
- Health insurance alien restrictions and other tax changes (January 1, 2026)

### 2027

- Medicaid address verification, death screening, redeterminations (January 1, 2027)
- Section 1115 budget neutrality requirement (January 1, 2027)
- Health insurance verification requirements (January 1, 2028)

### 2028

- SNAP state matching requirements (FY 2028)
- Medicaid provider death screening, home equity limits (January 1, 2028)
- HCBS waiver expansion (July 1, 2028)
- Cost-sharing for expansion adults (October 1, 2028)

### 2029

- Multi-state enrollment prevention system (October 1, 2029)

### 2030

- Enhanced Medicaid payment error provisions (FY 2030)

---

## Technology System Changes Required

### High Priority Systems

1. **Federal Multi-State Enrollment System** - New federal system for Medicaid/CHIP
2. **Immigration Status Verification** - Integration across SNAP, Medicaid, marketplace systems
3. **Work Verification Systems** - For SNAP and Medicaid community engagement
4. **Death Master File Integration** - For beneficiary and provider screening
5. **Enhanced Payment Accuracy Systems** - For error rate monitoring and state cost-sharing

### Medium Priority Systems

1. **Automated Redetermination Scheduling** - For 6-month Medicaid cycles
2. **HSA Eligibility Determination** - For bronze/catastrophic plan integration
3. **Marketplace Verification Enhancements** - For pre-enrollment processes
4. **Rural Health Technology Infrastructure** - For transformation program

### System Integration Requirements

- Cross-program alien eligibility verification
- Multi-state data sharing capabilities
- Enhanced audit and monitoring systems
- Automated payment allocation systems

---

## Funding Summary

### Implementation Funding Appropriated

- **Total Medicaid Implementation**: ~$500M+ across multiple sections
- **Rural Health Transformation**: $50B over 5 years + $200M implementation
- **SNAP Systems**: Funding embedded in administrative cost changes
- **Health Insurance Systems**: No specific implementation funding identified

### Ongoing Funding Changes

- **SNAP**: Significant state cost increases through matching requirements and administrative cost reduction
- **Medicaid**: Mixed impacts - some savings from restrictions, costs from new requirements
- **Health Insurance**: Reduced federal costs through eligibility restrictions and unlimited recapture
