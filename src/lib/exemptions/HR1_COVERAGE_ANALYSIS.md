# HR1 Section 71119 Exemption Coverage Analysis

**Date:** Task 1 Implementation - Exemption Terminology Realignment Spec  
**Purpose:** Comprehensive review of HR1 Section 71119(9)(A)(ii) exemption categories vs. current implementation

---

## HR1 Section 71119(9)(A)(ii) - "Specified Excluded Individual" Categories

The following are ALL exemption categories defined in HR1 Section 71119(9)(A)(ii):

### (I) Non-MAGI Medicaid Eligibility

**HR1 Text:** "who is described in subsection (a)(10)(A)(i)(IX)"  
**Meaning:** Individuals eligible for non-MAGI Medicaid (disability-based or long-term care Medicaid)

### (II) Indian/Tribal Status

**HR1 Text:** "who—

- (aa) is an Indian or an Urban Indian (as such terms are defined in paragraphs (13) and (28) of section 4 of the Indian Health Care Improvement Act);
- (bb) is a California Indian described in section 809(a) of such Act; or
- (cc) has otherwise been determined eligible as an Indian for the Indian Health Service under regulations promulgated by the Secretary"

**Meaning:** Indian, Urban Indian, California Indian, or IHS-eligible Indian

### (III) Parent/Guardian/Caretaker of Dependent Child or Disabled Individual

**HR1 Text:** "who is the parent, guardian, caretaker relative, or family caregiver (as defined in section 2 of the RAISE Family Caregivers Act) of a dependent child 13 years of age and under or a disabled individual"

**Meaning:** Parent, guardian, caretaker relative, or family caregiver of:

- A dependent child 13 years of age and under, OR
- A disabled individual (any age)

### (IV) Disabled Veteran

**HR1 Text:** "who is a veteran with a disability rated as total under section 1155 of title 38, United States Code"

**Meaning:** Veteran with a disability rated as total (100% disability rating)

### (V) Medically Frail or Special Medical Needs

**HR1 Text:** "who is medically frail or otherwise has special medical needs (as defined by the Secretary), including an individual—

- (aa) who is blind or disabled (as defined in section 1614);
- (bb) with a substance use disorder;
- (cc) with a disabling mental disorder;
- (dd) with a physical, intellectual or developmental disability that significantly impairs their ability to perform 1 or more activities of daily living; or
- (ee) with a serious or complex medical condition"

**Meaning:** Medically frail or special medical needs, with 5 specific sub-categories

### (VI) SNAP/TANF Work Requirement Compliance

**HR1 Text:** "who—

- (aa) is in compliance with any requirements imposed by the State pursuant to section 407; or
- (bb) is a member of a household that receives supplemental nutrition assistance program benefits under the Food and Nutrition Act of 2008 and is not exempt from a work requirement under such Act"

**Meaning:** In compliance with SNAP or TANF work requirements (NOT exempt from them)

### (VII) Drug/Alcohol Rehabilitation Participation

**HR1 Text:** "who is participating in a drug addiction or alcoholic treatment and rehabilitation program (as defined in section 3(h) of the Food and Nutrition Act of 2008)"

**Meaning:** Participating in drug addiction or alcoholic treatment and rehabilitation program

### (VIII) Inmate of Public Institution

**HR1 Text:** "who is an inmate of a public institution"

**Meaning:** Currently incarcerated in jail or prison

**ALSO SEE:** Section 71119(3)(A)(ii) - "at any point during the 3-month period ending on the first day of such month, the individual was an inmate of a public institution"

**Combined Meaning:** Inmate of a public institution OR within 3 months of release

### (IX) Pregnant or Postpartum

**HR1 Text:** "who is pregnant or entitled to postpartum medical assistance under paragraph (5) or (16) of subsection (e)"

**Meaning:** Pregnant or postpartum (entitled to postpartum medical assistance)

---

## Age-Based Exemptions (NOT in "Specified Excluded Individual")

**Source:** Section 71119(3)(A)(i)(II) - Mandatory exception for certain individuals

**HR1 Text:** "(aa) under the age of 19"

**Also see:** Section 71119(9)(A)(i)(II)(bb) - Definition of "applicable individual" excludes those "under 65 years of age"

**Combined Meaning:**

- Age 18 or younger (under 19)
- Age 65 or older

---

## Medicare Exemption (NOT in "Specified Excluded Individual")

**Source:** Section 71119(3)(A)(i)(II) - Mandatory exception for certain individuals

**HR1 Text:** "(bb) entitled to, or enrolled for, benefits under part A of title XVIII, or enrolled for benefits under part B of title XVIII"

**Meaning:** Entitled to or enrolled for Medicare (Part A or Part B)

---

## Current Implementation Review

### Current Questions in `src/lib/exemptions/questions.ts`

#### ✅ Age-Based Questions (1 question)

1. **age-dob** - "What is your date of birth?"
   - **HR1 Coverage:** Age 18 or younger, 65 or older
   - **Status:** ✅ COVERED - Correctly implements age-based exemptions

#### ✅ Family/Caregiving Questions (3 questions)

1. **family-pregnant** - "Are you currently pregnant or recently gave birth?"
   - **HR1 Coverage:** (IX) Pregnant or postpartum
   - **Status:** ✅ COVERED - But needs terminology update to "pregnant or postpartum"

2. **family-child** - "Do you live with a child age 13 or younger?"
   - **HR1 Coverage:** (III) Parent/guardian/caretaker of dependent child 13 or under
   - **Status:** ✅ COVERED - But needs terminology update to "dependent child 13 years of age and under"

3. **family-disabled-dependent** - "Are you a parent or guardian of someone with a disability?"
   - **HR1 Coverage:** (III) Parent/guardian/caretaker of disabled individual
   - **Status:** ✅ COVERED - But needs terminology update to "parent, guardian, caretaker relative, or family caregiver of a disabled individual"

#### ✅ Health/Disability Questions (4 questions)

1. **health-medicare** - "Do you have Medicare?"
   - **HR1 Coverage:** Entitled to or enrolled for Medicare
   - **Status:** ✅ COVERED - But needs terminology update to "entitled to or enrolled for Medicare"

2. **health-non-magi** - "Do you get Medicaid because of a disability or long-term care needs (non-MAGI Medicaid)?"
   - **HR1 Coverage:** (I) Non-MAGI Medicaid eligibility
   - **Status:** ✅ COVERED - But needs terminology update to "eligible for non-MAGI Medicaid"

3. **health-disabled-veteran** - "Are you a veteran with a 100% disability rating from the VA?"
   - **HR1 Coverage:** (IV) Veteran with disability rated as total
   - **Status:** ✅ COVERED - But needs terminology update to "veteran with a disability rated as total"

4. **health-medically-frail** - "Do you have a serious health condition or disability (defined as medically frail or special needs)?"
   - **HR1 Coverage:** (V) Medically frail or special medical needs (with 5 sub-categories)
   - **Status:** ✅ COVERED - But needs terminology update to "medically frail or otherwise have special medical needs"

#### ✅ Program Participation Questions (2 questions)

1. **program-snap-tanf** - "Are you on food stamps (SNAP) or cash assistance (TANF) and meeting their work requirements?"
   - **HR1 Coverage:** (VI) SNAP/TANF work requirement compliance
   - **Status:** ✅ COVERED - But needs terminology update to "in compliance with SNAP or TANF work requirements"

2. **program-rehab** - "Are you currently in a drug or alcohol treatment program?"
   - **HR1 Coverage:** (VII) Drug/alcohol rehabilitation participation
   - **Status:** ✅ COVERED - But needs terminology update to "participating in a drug addiction or alcoholic treatment and rehabilitation program"

#### ✅ Other Exemptions Questions (2 questions)

1. **other-incarcerated** - "Are you currently in jail or prison, or were you released in the last 3 months?"
   - **HR1 Coverage:** (VIII) Inmate of public institution + 3-month post-release period
   - **Status:** ✅ COVERED - But needs terminology update to "inmate of a public institution or within 3 months of release"

2. **other-tribal** - "Are you a member of a Native American tribe or eligible for Indian Health Service?"
   - **HR1 Coverage:** (II) Indian/Urban Indian/California Indian/IHS-eligible
   - **Status:** ✅ COVERED - But needs terminology update to "Indian, Urban Indian, California Indian, or IHS-eligible Indian"

---

## Gap Analysis

### ✅ All HR1 Exemption Categories Are Covered

**Summary:** All 9 "specified excluded individual" categories from HR1 Section 71119(9)(A)(ii) have corresponding questions:

| HR1 Category                                 | Question ID               | Status     |
| -------------------------------------------- | ------------------------- | ---------- |
| (I) Non-MAGI Medicaid                        | health-non-magi           | ✅ Covered |
| (II) Indian/Tribal                           | other-tribal              | ✅ Covered |
| (III) Parent/Caretaker (child 13 or under)   | family-child              | ✅ Covered |
| (III) Parent/Caretaker (disabled individual) | family-disabled-dependent | ✅ Covered |
| (IV) Disabled Veteran                        | health-disabled-veteran   | ✅ Covered |
| (V) Medically Frail                          | health-medically-frail    | ✅ Covered |
| (VI) SNAP/TANF Compliance                    | program-snap-tanf         | ✅ Covered |
| (VII) Drug/Alcohol Rehab                     | program-rehab             | ✅ Covered |
| (VIII) Inmate                                | other-incarcerated        | ✅ Covered |
| (IX) Pregnant/Postpartum                     | family-pregnant           | ✅ Covered |

**Age-based exemptions** (not in "specified excluded individual" but in mandatory exceptions):
| Exemption | Question ID | Status |
|-----------|-------------|--------|
| Age 18 or younger, 65 or older | age-dob | ✅ Covered |

**Medicare exemption** (not in "specified excluded individual" but in mandatory exceptions):
| Exemption | Question ID | Status |
|-----------|-------------|--------|
| Entitled to or enrolled for Medicare | health-medicare | ✅ Covered |

### ❌ No Missing Exemption Categories

**Finding:** The current implementation covers ALL exemption categories from HR1 Section 71119.

### ⚠️ Terminology Misalignment Issues

**Finding:** While all categories are covered, the question text does NOT use the authoritative HR1 terminology. This creates a mismatch between:

- Question text (simplified language)
- Definition callouts (technical terms from HR1)

**Example:**

- Question asks: "Are you currently pregnant or recently gave birth?"
- Definition callout defines: "postpartum" (term not used in question)

**Solution:** Implement three-tier information architecture:

1. **Tier 1 (Question Text):** Use HR1 terminology
2. **Tier 2 (Help Text):** Provide plain language translation
3. **Tier 3 (Definition Callouts):** Provide detailed definitions

---

## Questions That Don't Map to HR1 Exemptions

### ✅ All Questions Map to HR1

**Finding:** All 12 questions in the current implementation map directly to HR1 exemption categories. There are NO questions that don't correspond to an HR1 exemption.

---

## Recommendations

### 1. No New Questions Needed

All HR1 exemption categories are already covered by existing questions. No additional questions need to be created.

### 2. Update Question Terminology (Tasks 2-6)

Proceed with Tasks 2-6 to update question text to use HR1 terminology while maintaining plain language help text.

### 3. Verify Definition Coverage (Task 7)

Ensure all definitions in `definitions.ts` align with the updated question terminology.

### 4. Special Attention: Category (III) Split

HR1 Category (III) covers TWO distinct groups:

- Parent/guardian/caretaker of **dependent child 13 or under**
- Parent/guardian/caretaker of **disabled individual** (any age)

Current implementation correctly splits this into TWO questions:

- `family-child` - for dependent child 13 or under
- `family-disabled-dependent` - for disabled individual

This split is appropriate and should be maintained.

### 5. Special Attention: Category (V) Sub-Categories

HR1 Category (V) includes 5 specific sub-categories:

- (aa) Blind or disabled
- (bb) Substance use disorder
- (cc) Disabling mental disorder
- (dd) Physical/intellectual/developmental disability
- (ee) Serious or complex medical condition

Current implementation has ONE question (`health-medically-frail`) that covers all 5 sub-categories. Verify that all 5 sub-categories have corresponding definitions in `definitions.ts`.

---

## Conclusion

✅ **COMPLETE COVERAGE:** All HR1 Section 71119 exemption categories are covered by existing questions.

✅ **NO GAPS:** No missing exemption categories were identified.

✅ **NO EXTRA QUESTIONS:** All questions map to HR1 exemptions.

⚠️ **TERMINOLOGY ALIGNMENT NEEDED:** Question text needs to be updated to use HR1 terminology (Tasks 2-6).

✅ **READY TO PROCEED:** Can proceed with Tasks 2-6 to implement three-tier information architecture.

---

## References

- **HR1 Section 71119:** `docs/domain/hr1/119hr1enr-title7-part3.md` (lines 558-900)
- **Current Questions:** `src/lib/exemptions/questions.ts`
- **Requirements:** `.kiro/specs/exemption-terminology-realignment/requirements.md`
- **Design:** `.kiro/specs/exemption-terminology-realignment/design.md`
