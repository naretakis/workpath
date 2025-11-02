# Service Blueprint: Medicaid Work Requirements

**Last updated:** September 10, 2025

## Overview

This service blueprint documents the complete process flow for implementing Medicaid work requirements, including eligibility determination, verification processes, renewal procedures, and reporting changes.

## Part 1: Initial Eligibility and Application Process

### Medicaid Work Requirements Policy Foundation

**Effective Date:** January 1st, 2027 (or earlier if state chooses)

**Scope:** Medicaid expansion adults will have work requirements. The policy carves out exemptions so that only adults who receive Medicaid as a result of Medicaid expansion after the Affordable Care Act have to meet work requirements.

> **Note:** Work requirements are irrelevant for the 10 states that chose not to expand Medicaid: TX, WY, KS, WI, TN, MS, AL, GA, SC, FL.

### Work Requirement Criteria

To be eligible for Medicaid, clients must be either exempt or already complying with work requirements for at least 1 month (up to 3 months) before applying.

**Compliance Requirements:**

- At least 80 hours per month of "community engagement", OR
- Earning more than $580 per month

**Community Engagement Activities Include:**

- Working
- Volunteering
- Participating in a work program
- Enrolled in school half-time or more

**Income Requirements:**

- Monthly income of at least 80x the federal minimum wage (currently $580), OR
- $580 per month averaged across previous 6 months (for seasonal workers)

> ⚠️ **Pain Point:** Searching for jobs is NOT a qualifying activity for complying with work requirements. People newly applying to Medicaid because of job loss will need to start qualifying activities (e.g., volunteering) to get Medicaid.

### Exemption Categories

People are exempt from work requirements if they are:

1. **Age-based:**
   - 18 or younger
   - 65 or older

2. **Family/Caregiving:**
   - Pregnant or postpartum
   - Living in a household with a dependent 13 or younger
   - Parent or guardian of someone with a disability

3. **Health/Disability:**
   - On (or entitled to) Medicare
   - Eligible for non-MAGI Medicaid
   - Disabled veteran
   - Medically frail/special needs as defined by the Secretary of HHS, including:
     - Blind
     - Disabled
     - Substance use disorder
     - Disabling mental disorder
     - Physical/intellectual/developmental disability
     - Serious or complex medical condition

4. **Program Participation:**
   - On SNAP or TANF and meeting (not exempt from) those work requirements
   - Participating in drug or alcohol rehabilitation

5. **Other:**
   - Current inmate (or within last 3 months)
   - Indian, Urban Indian, California Indian, or IHS-eligible Indian

### Application Process Flow

#### 1. Client Applies for Medicaid

**Client Action:** Application can be submitted:

- Online
- Paper
- Phone

> ⚠️ **Pain Point:** Because Medicaid work requirements are new, existing applications do not screen for exemptions or if the client has been compliant with work requirements. For example, questions do not ask about all categories of "community engagement."

> 💡 **Opportunity:** Re-design Medicaid application forms to take work requirements screening into account. Many states have integrated benefits applications with SNAP. There is an opportunity to improve how and where to integrate relevant work requirement questions to effectively screen for exemptions or compliance.

#### 2. Process Application

**Staff Action:** For paper or phone applications, staff manually register the application.

**System:** In some states, the eligibility system performs a real-time eligibility check. The system determines automatically if someone is eligible for Medicaid or not, depending on data entered from their application.

> ⚠️ **Pain Point:** States with real-time eligibility systems will need to modify system logic to incorporate work requirements checks. The system should attempt to screen for and verify exemptions. If no exemption could be found and verified, it should attempt to verify compliance with "community engagement."

#### 3. Determine Exemptions

**Staff Action:** Staff use application information to see if each member of the household qualifies for any exemptions.

Age and household member exemptions can often be assessed just from the application:

- 18 or younger or 65 or older
- Living in a household with someone 13 or younger
- Parent or guardian of someone with a disability
- Pregnant or postpartum

**Staff Action:** Staff use databases to see if any exemptions apply to each person in the household.

Databases can demonstrate exemptions such as:

- Enrolled in Medicare/non-MAGI Medicaid
- Current/recently released inmate (if connected to state department of corrections)
- Currently enrolled in SNAP and not exempt from those work requirements
- Currently enrolled in SNAP E&T
- State Department of Education for student status
- Drug/alcohol rehab participant (based on state's behavioral health agency data)
- "Medically frail" as determined by certain Current Procedural Terminology (CPT) codes

> 💡 **Opportunity:** Identify, validate, and promote adoption of high-quality data sources for exemptions.

**System:** In some states, database checks are done automatically. Some of these may be automatically run and pulled into the case.

> ⚠️ **Pain Point:** Medicaid eligibility systems will need to be changed to represent exemptions from work requirements. States will need a way in their system to indicate that the individual is exempt from work requirements and why.

#### 4. Determine Work Requirement Compliance (If Not Exempt)

**Staff Action:** If the client has listed they are working on their application, databases can verify if each household member is meeting the income or hourly requirements.

Common databases showing employment and income information include:

- Quarterly Wage Data (if allowable via policy)
- The Work Number
- Other income data sources

> ⚠️ **Pain Point:** Quarterly Wage Data (QWD) is likely not fully usable to determine work requirement compliance. QWD aggregates wages every 3 months, meaning it is insufficient to demonstrate if a client is meeting work requirements for shorter (1 or 2 month) lookback periods.

> 💡 **Opportunity:** Improve use of income verification services to automatically determine if someone is already compliant. A report from the Urban Institute found that 52% of adults on Medicaid could be deemed exempt or compliant for Medicaid work requirements using ONLY data matches.

> ❓ **Question:** How will states approach situations where self-attested information and information from data sources differ? Will states require verification of discrepancies between self-attested income and income found from data sources, if the difference doesn't impact eligibility or whether a client is meeting work requirements? What Payment Error Rate Measurement (PERM) implications will impact state choices on this?

> ❓ **Question:** How will regulation define "income" for Medicaid work requirements? If a person has income above a certain level (currently $580/month), they are exempt from Medicaid work requirements. Will SSI, Unemployment Insurance, gifts, or other forms of unearned income qualify as "income" for someone to be exempt from work requirements?

> ❓ **Question:** What will suffice as verification for volunteering? A client will qualify as meeting work requirements if they are volunteering for 80 hours a month. Note: Meeting work requirements via volunteering will likely apply to a small minority of clients.

> ⚠️ **Pain Point:** Medicaid eligibility systems will need to be changed to represent compliance with work requirements. States will need a way in their system to indicate the reasons why someone who doesn't have an exemption is also meeting the work requirements.

#### 5. Hardship Determination (If Not Meeting Requirements)

**Policy:** States can choose to allow "short-term hardship" to count as meeting work requirements. Not all states will implement this.

Qualifying short-term hardship events include:

- Receiving inpatient hospital or nursing services, or services of similar acuity
- Must travel outside of their community for an extended period of time for medical services for a serious or complex medical condition

**Client Action:** A client can request short-term hardship. Hardship (outside of disaster and unemployment) must be requested in order to be granted. Ideally this comes through on the application. If not, the client should be told that they can report this during the request for verifications or at eligibility determination.

> ⚠️ **Pain Point:** States will need to implement hardship request methods. States will need multiple methods of requesting hardship, including some or all of:
>
> - Mail
> - Fax
> - In person
> - Email
> - Online portal
> - Phone

> 💡 **Opportunity:** Make the process of requesting hardship human-centered. Make it:
>
> 1. Easy to understand which life events qualify as hardship
> 2. Clear what options are available to report hardship
> 3. Easy to actually report hardship

**Staff Action:** Staff process hardship request - review the hardship request and determine if it is valid.

> ❓ **Question:** What will suffice as verification for hardship? For some reasons (e.g., disaster, regional unemployment), no verification will be needed. For others, CMS may require additional verification depending on regulation that has yet to be written.

**Policy:** A state can preemptively grant short-term hardship to all Medicaid applicants in a region for disaster + unemployment rates. This is an option states can choose to take on, and would temporarily exempt everyone in that region from work requirements.

Qualifying events include:

- Living in a county with a federally declared disaster
- Living in a county with an unemployment rate of 8% or 1.5 times the national average

> ⚠️ **Pain Point:** States will need to implement blanket hardship definitions in their systems, and ensure that it's coded at the county level. Many eligibility systems are not county-based already.

> ⚠️ **Pain Point:** States will need to implement hardship indication in their eligibility systems, including the time limit for how long short-term hardship can be granted before additional verification is needed.

### Verification Process

#### Request for Verification

**Staff Action:** If needed, staff will request verifications. The request should be sent to the household, but should list each individual and their required verification, as well as examples of potential documents that could be used. The request should also detail how a client can claim short-term hardship if they can't meet the requirements.

Some exemptions likely require the client to submit verification documents, such as:

- Medically frail
- Drug/alcohol rehab participant

> ❓ **Question:** Will caseworkers be allowed to use collateral contacts as acceptable verification? Documents are the current standard for Medicaid. Will regulations allow caseworkers to, like SNAP, use collateral contacts?

> ❓ **Question:** Do Medicaid eligibility staff have a "duty to assist" clients with obtaining verification? In SNAP, the caseworker has a responsibility to track down information. Does this exist in Medicaid?

> ❓ **Question:** Could states use medical information provided from the care orgs/plans to determine someone is medically frail? HR1 includes a clause preventing Managed Care Organizations (MCOs) or other medical contractors from determining beneficiaries' "compliance" with work requirements. Can the state use data from these organizations in the process of determining compliance, if the MCO does not determine it themselves? Can the state use MCO data to determine exemptions? Hardship? How does HIPAA play a role here?

> 💡 **Opportunity:** Improve notices and communications. States will have to modify their request for verification notices to explain the verification needed to either prove exemptions or to show that the client is already meeting work requirements. There is an opportunity to re-design the notices to be more simple to understand and take action on.

> 💡 **Opportunity:** Eligibility systems with real-time eligibility checks could automate generating a verification request based off of the application data. Expedite the process of requesting verification documents by determining which verifications will likely be needed from the client to demonstrate possible work requirement exemptions or compliance.

#### Client Submission of Verification

**Client Action:** Client gets notice of verifications requested.

**Client Action:** Client submits verification to the agency. States must accept paper copies of verifications, and may optionally accept documents online or faxed.

> ⚠️ **Pain Point:** Verification submission is a known challenge for benefits access. Some known issues include:
>
> - The notice may be unclear, or the client doesn't get the notice
> - Clients may submit verification insufficient to prove exemption or work status
> - The way that clients can submit verification may not be very usable
> - Clients working in informal or gig economy may have limited documentation of work

> 💡 **Opportunity:** Ease document submission. Ideas include:
>
> - Chatbots or checklists to ensure clients are providing the correct documents
> - Functionality to take a photo with one's phone to submit documents

#### Processing Verifications

**System:** Connect verification documents with relevant case. Process could be manual or automated, depending on system design.

**Staff Action:** Staff process verifications submitted by the client. If needed, request additional verifications or clarify if a verification was insufficient.

> 💡 **Opportunity:** Automate parts of document validation. Ideas include tools that:
>
> - Screen for common errors with document uploads
> - Validate documents being uploaded
> - Extract data, such as for tagging document types or entering data into eligibility systems that caseworkers can easily review

### Eligibility Determination

**Staff Action:** Staff manually mark in the eligibility system for each member of the household if any exemptions apply. Based off of information from the application, database checks, and submitted verification documents.

> ⚠️ **Pain Point:** Some states have incorrectly determined Medicaid eligibility at the household level, not individual level, meaning some people did not get Medicaid coverage when they should be eligible. In the past, CMS has issued warnings to states to correct this in their eligibility systems.

> ✅ **Best Practice:** For Medicaid, data should be stored in eligibility systems at the individual-level, not household-level. Otherwise states run the risk of an eligibility error where either the income or work status of one person affects whether the entire household receives Medicaid. This particularly affects children who would be eligible for Medicaid but their parents are not eligible due to the amount of income the parent makes.

**Staff Action:** In some states and cases, staff must take action to process the eligibility determination.

**System:** Some states have automated eligibility determination for Medicaid. Some systems may have the ability to automatically mark a person eligible or ineligible once all verifications are in place.

> ⚠️ **Pain Point:** States will need to implement changes to the logic of how eligibility is determined in Medicaid. Eligibility determination logic will need to add a condition to ensure that before approving someone's Medicaid, they are either exempt from work requirements or have been meeting them (for the past 1-3 months for new applicants; for the past 1 month in the last 6 months for renewals).

#### Client Notification

**Client Action:** Client gets notified of their eligibility determination and if they have work requirements.

> 💡 **Opportunity:** Improve the eligibility determination notice to help set expectations for work requirements to recertify. The eligibility determination notice is a critical opportunity to communicate the expectations for work requirement compliance. Make it easy to understand:
>
> 1. Which members of the household have to meet Medicaid work requirements for eligibility
> 2. The changed certification period for those individuals
> 3. What the lookback period will be when they renew benefits
> 4. What the client has to do when the lookback period will be assessed

#### Marketplace Transition (If Ineligible)

**System:** If a person is ineligible for Medicaid, they should be sent to the Marketplace.

> ❓ **Question:** How does work verification happen with respect to the Marketplace? If someone is ineligible for Medicaid and handed to the Marketplace, how does work verification information get transferred? The Marketplace systems should not attempt to re-verify this information.

> ⚠️ **Pain Point:** If you have to meet Medicaid work requirements and aren't meeting them, you cannot buy subsidized health insurance from the Marketplace. The person would have to purchase full-price health insurance from the Marketplace.

## Part 2: Maintaining Benefits and Renewals

### Certification Period Changes

**Policy:** The certification period for Medicaid expansion adults has changed from 12 months to 6 months. Other groups of clients receiving MAGI or non-MAGI Medicaid keep their 12-month certification period. This will take into effect by January 1st, 2027.

> ⚠️ **Pain Point:** Clients who have to manually renew will need to submit forms twice as often as they used to in order to keep getting their Medicaid coverage.

> ⚠️ **Pain Point:** Clients will likely need to submit verifications that demonstrate either their continued exemption status or that they are meeting the work requirements.

> ⚠️ **Pain Point:** Many clients will be in households where people have different renewal timelines, adding complexity for families to maintain health care coverage.

### Reporting Changes

**Client Action:** Clients must report changes in work status that could make them ineligible for Medicaid. Specifically if they are doing less than 80 hours a month of "community engagement," or no longer meeting the income requirements to meet work requirements or eligibility.

> ⚠️ **Pain Point:** States will need to change systems to enable clients to report changes to their work status.

**Policy:** Agencies must check electronic sources to verify the change before requesting verification from the client. Under existing regulations, if the agency receives new information that may impact eligibility, the agency must attempt to contact the individual for additional information, but they must check electronic data sources first.

### Notice of Non-Compliance

**Staff Action:** If a client's work status cannot be verified with databases, the staff sends a client a notice of "non-compliance." The notice of non-compliance is essentially a request for more information from the client to either prove that they:

1. Have been meeting the work requirements
2. Have an exemption
3. Have a valid hardship reason why they could not meet the requirements

> 💡 **Opportunity:** Design the "notice of non-compliance" so that it is clear and actionable. The notice of non-compliance will be a new notice states will be creating from scratch. Additionally, consider other more real-time outreach methods (i.e., texting).

**Client Action:** Clients receive the "notice of noncompliance" and have to respond to the notice within 30 days, or they will lose coverage.

Clients may respond with:

- Evidence of work activity
- Evidence of an exemption
- Hardship request

**Staff Action:** The client's response will be received and processed.

**Staff Action:** If the client does not show they have been meeting the work requirements by the deadline on the "notice of non-compliance," the state terminates their coverage by the end of the next month.

### Renewal Process

#### Ex Parte Renewals

**System:** At least 30 days prior to the renewal date, states check electronic data sources to attempt an ex parte renewal.

**Policy:** In order to renew Medicaid, clients must have been meeting work requirements for at least one month since their last certification. Clients who need to meet Medicaid work requirements need to prove that they have been meeting them for at least one month since they last certified. States can choose how the lookback period is structured. For example, they can choose to require the client to verify more months, such as monthly for the past 6 months.

**Staff Action:** If a client's eligibility and work status, exemption, or hardship can be verified, they are renewed and their coverage is extended.

> ✅ **Best Practice:** Ideally, the state is able to use ex parte (or automated) renewals so that minimal work is required from clients.

> 💡 **Opportunity:** Support states with ex parte renewals that accounts for new work requirements. Ex parte renewals must attempt to verify BOTH work status AND exemptions, even if someone was not exempt for their prior certification period. Ex parte logic is a large opportunity space for optimization and improvement.

> ⚠️ **Pain Point:** Running ex parte more than 30 days early could result in early termination of coverage. If a state chooses to run ex parte more than 30 days early, and the client cannot be verified compliant for work requirements, the state must send a notice of noncompliance and a renewal packet. If the "notice of non-compliance" is not returned within 30 days, the state is required to terminate coverage early.

#### Manual Renewals

**Staff Action:** If a client cannot be renewed ex parte, they will be mailed a renewal form to complete manually. Some states provide this form up to 90 days in advance of the end of coverage.

**Client Action:** Clients must return the renewal form.

Clients will need to return their renewal form with either:

- Evidence of work activity
- Evidence of an exemption
- Hardship request

**System:** If the state cannot verify if a client is complying with work requirements, it will send the client a "notice of non-compliance." This could be the case if the client doesn't return the renewal form, or doesn't provide sufficient needed verification to show they are meeting work requirements. The client has 30 calendar days, beginning on the date the notice is received, to provide information to show compliance. The individual continues to receive coverage during the 30-day period.

## Key Implementation Considerations

### System Requirements

1. **Individual-Level Data Storage:** Medicaid data must be stored at the individual level, not household level
2. **Work Requirements Tracking:** Systems need capability to track exemptions, compliance status, and hardship requests
3. **County-Level Hardship:** Systems must support county-level blanket hardship designations
4. **Integration Needs:** Systems should integrate with multiple data sources for verification

### Policy Decisions States Must Make

1. **Lookback Period:** Choose between 1-3 months for initial applications
2. **Verification Standards:** Decide whether to accept self-attestation or require additional proof
3. **Short-Term Hardship:** Whether to implement short-term hardship provisions
4. **Document Submission Methods:** Which channels to accept (online, fax, mail, in-person)
5. **Ex Parte Renewal Timing:** When to run ex parte renewals (must consider 30-day rule)

### Outstanding Questions Requiring Regulatory Clarification

1. Income definition for work requirements exemption
2. Verification requirements for volunteering
3. Use of collateral contacts for verification
4. Verification requirements for hardship requests
5. Use of MCO data for determining compliance
6. Duty to assist requirements for Medicaid staff
7. Work verification transfer to Marketplace systems
8. PERM implications for verification discrepancies

---

_This document represents the complete service blueprint for implementing Medicaid work requirements as of September 10, 2025. States should consult with CMS for the most current regulatory guidance and implementation requirements._
