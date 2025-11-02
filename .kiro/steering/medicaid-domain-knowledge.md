---
inclusion: always
---

# Medicaid Work Requirements Domain Knowledge

This document provides essential domain knowledge about Medicaid work requirements based on HR1 legislation and the Code for America Service Blueprint. This knowledge should inform all development decisions for the WorkPath application.

## Legislative Context: HR1 Legislation (Section 71119)

### Effective Date
- **January 1, 2027** (or earlier if state chooses)
- Work requirements apply to Medicaid expansion adults only
- Not applicable in 10 states that did not expand Medicaid: TX, WY, KS, WI, TN, MS, AL, GA, SC, FL
- States may request exemption until December 31, 2028 by demonstrating "good faith effort"

### Scope
Medicaid expansion adults (those who receive Medicaid as a result of Medicaid expansion after the Affordable Care Act) must meet work requirements to maintain eligibility.

**Applicable Individuals** (as defined in HR1 Section 71119):
- Individuals eligible to enroll (or enrolled) under section 1902(a)(10)(A)(i)(VIII)
- OR individuals otherwise eligible under a waiver providing equivalent minimum essential coverage
- Must be age 19-64, not pregnant, not on Medicare, and not otherwise eligible under the state plan

## Work Requirement Criteria

### Compliance Requirements

To maintain Medicaid eligibility, beneficiaries must meet ONE of the following:

1. **80 hours per month** of "community engagement" activities, OR
2. **$580 per month** in earned income (80x federal minimum wage)
   - Can be averaged across previous 6 months for seasonal workers

### Qualifying Community Engagement Activities

- **Working** (paid employment)
- **Volunteering** (unpaid community service)
- **Participating in a work program** (job training, workforce development)
- **Enrolled in school** (half-time or more)

### Important Exclusions

⚠️ **Job searching does NOT count** as a qualifying activity. This is a critical pain point: people newly applying to Medicaid because of job loss will need to start qualifying activities (e.g., volunteering) to get Medicaid.

## Exemption Categories (HR1 Section 71119)

People are exempt from work requirements if they fall into any of these categories:

### 1. Age-Based Exemptions
- **18 or younger**
- **65 or older**

### 2. Family/Caregiving Exemptions
- **Pregnant or postpartum**
- **Living in a household with a dependent 13 or younger**
- **Parent or guardian of someone with a disability**

### 3. Health/Disability Exemptions
- **On (or entitled to) Medicare**
- **Eligible for non-MAGI Medicaid**
- **Disabled veteran**
- **Medically frail/special needs** as defined by HHS Secretary, including:
  - Blind
  - Disabled
  - Substance use disorder
  - Disabling mental disorder
  - Physical/intellectual/developmental disability
  - Serious or complex medical condition

### 4. Program Participation Exemptions
- **On SNAP or TANF** and meeting (not exempt from) those work requirements
- **Participating in drug or alcohol rehabilitation**

### 5. Other Exemptions
- **Current inmate** (or within last 3 months of release)
- **Indian, Urban Indian, California Indian, or IHS-eligible Indian**

## Certification and Renewal Changes (HR1 Section 71107)

### Certification Period
- **Medicaid expansion adults**: 6-month certification period (reduced from 12 months) - **Effective Q1 2027**
- **Other Medicaid groups**: Retain 12-month certification period
- Exemption: Individuals described in subsection (xx)(9)(A)(ii)(II) (specified excluded individuals) are exempt from 6-month redeterminations

### Lookback Period for Renewals
- Must have been meeting work requirements for **at least one month** since last certification
- States can choose to require verification for more months (e.g., monthly for past 6 months)
- States may conduct more frequent compliance verifications (not just at renewal)

### Initial Application Lookback
- Must be compliant for **1-3 months** (state choice) before approval
- State specifies the number of consecutive months required

## Hardship and Good Cause

### Short-Term Hardship Provisions

States can choose to allow "short-term hardship" to count as meeting work requirements. Qualifying events include:

1. **Medical hardship**:
   - Receiving inpatient hospital or nursing services
   - Services of similar acuity
   - Must travel outside community for extended period for medical services for serious/complex condition

2. **Disaster hardship** (automatic, no request needed):
   - Living in a county with a federally declared disaster

3. **Unemployment hardship** (automatic, no request needed):
   - Living in a county with unemployment rate of 8% or 1.5x national average

### Hardship Request Process

- Client must request hardship (except for disaster and unemployment)
- States must provide multiple request methods: mail, fax, in-person, email, online portal, phone
- Verification requirements vary by hardship type (some require documentation, others don't)

## Outreach Requirements (HR1 Section 71119)

### Mandatory State Outreach

States must notify applicable individuals of work requirements:
- **Timing**: Beginning 3+ months before implementation date, and periodically thereafter
- **Content must include**:
  - How to comply with requirements
  - Explanation of exceptions and exemptions
  - Definition of "applicable individual"
  - Consequences of noncompliance
  - How to report status changes

### Delivery Methods (Multi-channel required)

Notice must be delivered by:
1. **Regular mail** (or electronic format if elected by individual)
2. **One or more additional forms**, which may include:
   - Telephone
   - Text message
   - Internet website
   - Other commonly available electronic means
   - Other forms determined appropriate by Secretary

## Reporting and Verification

### Client Reporting Obligations

Clients must report changes in work status that could make them ineligible:
- Doing less than 80 hours/month of community engagement
- No longer meeting income requirements
- Changes that affect exemption status

### Verification Methods

**For Employment/Income:**
- Quarterly Wage Data (QWD) - limited usefulness due to 3-month aggregation
- The Work Number database
- Other income data sources
- Pay stubs (client-submitted)

**For Volunteering:**
- Verification letter from organization
- Documentation requirements still being defined by regulation

**For Exemptions:**
- Age: Application data, birth certificate
- Household composition: Application data
- Medicare/non-MAGI: Database checks
- Disability: Medical documentation
- Program participation: SNAP/TANF enrollment data
- Incarceration: Department of Corrections data (if connected)

### Notice of Non-Compliance (HR1 Section 71119)

If work status cannot be verified through databases:
- State sends "notice of non-compliance" with specific information requirements
- Client has **30 calendar days** (beginning on date notice is received) to respond with:
  - Evidence of work activity, OR
  - Evidence of exemption, OR
  - Hardship request, OR
  - Showing that they don't meet the definition of "applicable individual"
- Client continues to receive coverage during 30-day period
- If no satisfactory showing is made:
  - State must first determine if there's any other basis for eligibility
  - Individual must be provided written notice and opportunity for fair hearing
  - Denial/disenrollment occurs not later than end of month following the 30-day period

## Key Pain Points and Opportunities

### Pain Points

1. **Application forms** don't currently screen for exemptions or compliance
2. **Eligibility systems** need major modifications to track work requirements
3. **Verification burden** on clients is significant
4. **Quarterly Wage Data** insufficient for monthly compliance verification
5. **Document submission** is challenging (unclear notices, limited submission methods)
6. **Twice-yearly renewals** increase administrative burden
7. **Mixed household renewal timelines** add complexity for families

### Opportunities

1. **Improve application design** to screen for exemptions and compliance
2. **Leverage data sources** for automatic verification (52% could be verified automatically)
3. **Human-centered hardship process** - make it easy to understand and report
4. **Better notices** - clear, actionable, plain language
5. **Digital document submission** - photo upload, online portals
6. **Automated document validation** - screen for errors, extract data
7. **Ex parte renewals** - maximize automatic renewals to reduce client burden

## System Requirements

### Individual-Level Data Storage

⚠️ **CRITICAL**: Medicaid data MUST be stored at the individual level, not household level. Past errors have occurred when states stored data at household level, causing eligibility errors where one person's income or work status affected the entire household's eligibility.

### County-Level Hardship Support

Systems must support county-level blanket hardship designations for disaster and unemployment hardships.

### Integration Requirements

Systems should integrate with:
- Quarterly Wage Data (QWD)
- The Work Number
- Medicare enrollment data
- SNAP/TANF enrollment data
- State Department of Education (student status)
- Department of Corrections (incarceration status)
- Behavioral health agency data (rehab participation)

## Application Design Implications

### For WorkPath MVP

1. **Exemption Screening**:
   - Implement all 5 exemption categories with specific sub-categories per HR1
   - Use plain-language explanations
   - Dynamic questionnaire based on responses
   - Store exemption determination with reasoning
   - Support re-screening when status changes
   - Track exemption history

2. **Activity Tracking**:
   - Support work, volunteer, education, work program activities
   - Track hours per month (80-hour threshold)
   - Track income per month ($580 threshold)
   - Support multiple pay periods (hourly, daily, weekly, monthly)
   - Calculate monthly equivalents for income
   - Support seasonal worker income averaging (6-month average)
   - Track combination of activities totaling 80+ hours

3. **Document Management**:
   - Support pay stub capture and storage
   - Support volunteer verification letters
   - Support school enrollment documentation
   - Support medical documentation
   - Link documents to activities
   - Track submission status to agency

4. **Hardship Reporting**:
   - Allow reporting of medical hardships (inpatient, travel for treatment)
   - Track disaster hardships (automatic based on county)
   - Track unemployment hardships (automatic based on county unemployment rate)
   - Link hardship to compliance calculations
   - Store hardship documentation
   - Support hardship request workflow

5. **Compliance Calculations**:
   - Calculate monthly hours across all activity types
   - Calculate monthly income with pay period conversion
   - Determine compliance status (80 hours OR $580 income)
   - Account for exemptions and hardships
   - Support lookback periods (1-6 months, state-configurable)
   - Track compliance history for renewals

6. **Data Export**:
   - Generate reports for agency submission
   - Include all activities, documents, exemptions, hardships
   - Format for easy review by caseworkers
   - Include compliance summary with lookback period
   - Support response to notice of non-compliance
   - Include 30-day response timeline tracking

7. **Notification System**:
   - Track important dates (renewal, verification deadlines)
   - Support multi-channel notifications (in-app, email, SMS if available)
   - Provide clear guidance on next steps
   - Track notice of non-compliance receipt and response
   - 30-day countdown for response deadlines

## Plain Language Guidelines

When writing user-facing content, use plain language:

### ✅ Good Examples
- "Work, volunteer, or go to school for 80 hours per month"
- "You may be exempt if you have a child under 13"
- "Upload a photo of your pay stub"
- "You're on track - 65 hours logged this month"

### ❌ Bad Examples
- "Engage in community engagement activities for 80 hours monthly"
- "Exemption criteria per HR1 Section 71119(a)(2)(B)"
- "Submit verification documentation"
- "Non-compliant status - 15 hours deficit"

## References

### Primary Sources
- **HR1 Legislation**: `docs/domain/hr1/119hr1enr.md`
- **HR1 HHS Sections**: `docs/domain/hr1/119hr1enr-hhs-sections.md`
- **Service Blueprint**: `docs/domain/medicaid-work-requirements-cfa-service-blueprint.md`

### Project Documents
- **Requirements**: `.kiro/specs/medicaid-compliance-mvp/requirements.md`
- **Design**: `.kiro/specs/medicaid-compliance-mvp/design.md`
- **Tasks**: `.kiro/specs/medicaid-compliance-mvp/tasks.md`

### Related Steering Documents
- **Development Standards**: `.kiro/steering/development-standards.md`
- **Material-UI Guidelines**: `.kiro/steering/material-ui-guidelines.md`
- **Git Workflow**: `.kiro/steering/git-workflow.md`

## Key Takeaways for Developers

1. **80 hours/month OR $580/month** - these are the two ways to comply
2. **5 exemption categories** - age, family, health, programs, other
3. **Individual-level data** - never aggregate at household level
4. **Plain language** - beneficiaries are not policy experts
5. **Privacy-first** - all data stays local, no external transmission
6. **Mobile-first** - beneficiaries primarily use smartphones
7. **Offline-capable** - internet access may be limited
8. **Document everything** - verification is critical for compliance
9. **Hardship matters** - life happens, system should accommodate
10. **Accessibility required** - many beneficiaries have disabilities
11. **Ex parte verification** - states must use available data sources without requiring additional info from beneficiaries where possible
12. **30-day response period** - critical timeline for notice of non-compliance
13. **Outreach required** - states must notify beneficiaries of requirements with multiple delivery methods
14. **No waiver allowed** - community engagement requirements cannot be waived under Section 1115

## Glossary

- **MAGI**: Modified Adjusted Gross Income (income calculation method)
- **Non-MAGI Medicaid**: Medicaid for people with disabilities, elderly
- **Ex parte renewal**: Automatic renewal using existing data sources
- **Ex parte verification**: Verification using available data without requiring beneficiary to submit additional information
- **QWD**: Quarterly Wage Data (employment verification database)
- **SNAP**: Supplemental Nutrition Assistance Program (food stamps)
- **TANF**: Temporary Assistance for Needy Families (cash assistance)
- **MCO**: Managed Care Organization (health insurance plan)
- **PERM**: Payment Error Rate Measurement (federal audit program)
- **IHS**: Indian Health Service
- **CPT codes**: Current Procedural Terminology (medical billing codes)
- **Applicable individual**: Individual subject to work requirements (age 19-64, Medicaid expansion enrollee, not exempt)
- **Specified excluded individual**: Individual exempt from work requirements (see exemption categories)
- **Community engagement**: Activities that count toward 80-hour requirement (work, volunteer, education, work program)
- **Notice of non-compliance**: Official notice sent when state cannot verify work requirement compliance
- **Good faith effort**: Basis for state exemption from requirements until December 31, 2028
