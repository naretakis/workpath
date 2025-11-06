# Implementation Plan: Exemption Screener Terminology Realignment

## Overview

This implementation plan converts the design into discrete coding tasks. Each task builds on previous tasks and focuses on implementing the three-tier information architecture (HR1 terminology → plain language translation → detailed definitions).

---

## Tasks

- [x] 1. Comprehensive review of HR1 Section 71119 exemption coverage
  - Read HR1 Section 71119(9)(A)(ii) in full (docs/domain/hr1/119hr1enr-title7-part3.md)
  - Create checklist of all "specified excluded individual" categories from HR1:
    - (I) Non-MAGI Medicaid eligibility
    - (II) Indian/Urban Indian/California Indian/IHS-eligible
    - (III) Parent/guardian/caretaker relative/family caregiver of dependent child 13 or under or disabled individual
    - (IV) Veteran with disability rated as total
    - (V) Medically frail or special medical needs (with 5 sub-categories)
    - (VI) SNAP/TANF work requirement compliance
    - (VII) Drug/alcohol rehabilitation participation
    - (VIII) Inmate of public institution
    - (IX) Pregnant or postpartum
  - Review current questions in src/lib/exemptions/questions.ts
  - Verify each HR1 exemption category has a corresponding question
  - Identify any missing exemption categories
  - Identify any questions that don't map to HR1 exemptions
  - Review age-based exemptions (not in "specified excluded individual" but in "applicable individual" definition)
  - Document findings in code comments or design doc
  - If gaps found, create additional tasks to add missing questions
  - _Requirements: 5.1, 5.2, 7.4_

- [ ] 2. Update age-based questions with three-tier structure
  - Reference Task 1 findings to ensure all age-based exemptions are covered
  - Review commit 0adec5c for original age question text
  - Update `ageQuestions` array in `src/lib/exemptions/questions.ts`
  - Verify question text uses HR1 terminology from Task 1 analysis (Tier 1)
  - Adapt current help text as plain language translation (Tier 2)
  - Add code comments documenting three-tier structure
  - Verify age exemptions align with HR1 "applicable individual" definition (age 18 or younger, 65 or older)
  - If Task 1 identified missing age-related questions, add them using commit 0adec5c as template
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 7.1, 7.2_

- [ ] 3. Update family/caregiving questions with three-tier structure
  - Reference Task 1 findings to ensure all family/caregiving exemptions from HR1 Section 71119(9)(A)(ii)(III) and (IX) are covered
  - [ ] 3.1 Update family-pregnant question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(IX) requirements
    - Restore "pregnant or postpartum" terminology from commit 0adec5c (Tier 1)
    - Adapt help text: "Are you currently pregnant or gave birth within the last 60 days?" (Tier 2)
    - Verify `postpartum` definition callout exists in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(IX)
    - _Requirements: 1.1, 2.4, 3.2, 5.3, 7.2_

  - [ ] 3.2 Update family-child question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(III) requirements
    - Restore "dependent child 13 years of age and under" from commit 0adec5c (Tier 1)
    - Adapt help text: "Do you live with a child age 13 or younger?" (Tier 2)
    - Verify `dependentChild13OrYounger` and `dependent` definitions in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(III)
    - _Requirements: 1.2, 2.8, 3.3, 5.9, 7.2_

  - [ ] 3.3 Update family-disabled-dependent question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(III) requirements
    - Restore "parent, guardian, caretaker relative, or family caregiver" from commit 0adec5c (Tier 1)
    - Adapt help text: "Are you a parent or guardian of someone with a disability?" (Tier 2)
    - Verify `caretakerRelative` and `dependent` definitions in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(III)
    - If Task 1 identified that this should be split into separate questions (child vs adult), create additional questions
    - _Requirements: 1.2, 2.8, 3.3, 5.9, 7.2_

- [ ] 4. Update health/disability questions with three-tier structure
  - Reference Task 1 findings to ensure all health/disability exemptions from HR1 Section 71119(9)(A)(ii)(I), (II)(bb), (IV), and (V) are covered
  - [ ] 4.1 Update health-medicare question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(II)(bb) requirements
    - Restore "entitled to or enrolled for Medicare" from commit 0adec5c (Tier 1)
    - Adapt help text: "Do you have Medicare? Medicare is federal health insurance..." (Tier 2)
    - Verify `medicare` definition in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(II)(bb)
    - _Requirements: 1.3, 2.9, 3.2, 5.6, 7.2_

  - [ ] 4.2 Update health-non-magi question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(I) requirements
    - Restore "eligible for non-MAGI Medicaid" from commit 0adec5c (Tier 1)
    - Adapt help text: "Do you get Medicaid because of a disability or long-term care needs?" (Tier 2)
    - Verify `nonMAGIMedicaid` definition in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(I)
    - _Requirements: 1.4, 2.5, 3.2, 5.6, 7.2_

  - [ ] 4.3 Update health-disabled-veteran question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(IV) requirements
    - Restore "veteran with a disability rated as total" from commit 0adec5c (Tier 1)
    - Adapt help text: "Are you a veteran with a 100% disability rating from the VA?" (Tier 2)
    - Verify `disabledVeteran` definition in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(IV)
    - _Requirements: 1.5, 2.7, 3.2, 5.5, 7.2_

  - [ ] 4.4 Update health-medically-frail question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(V) requirements and all 5 sub-categories
    - Restore "medically frail or otherwise have special medical needs" from commit 0adec5c (Tier 1)
    - Adapt help text: "Do you have a serious health condition or disability? Tap the info icons below..." (Tier 2)
    - Verify all medically frail sub-category definitions in `questionDefinitionMap`:
      - `medicallyFrail`
      - `substanceUseDisorder`
      - `disablingMentalDisorder`
      - `physicalIntellectualDevelopmentalDisability`
      - `seriousComplexMedicalCondition`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(V)
    - If Task 1 identified missing sub-categories, add corresponding definitions
    - _Requirements: 1.6, 2.6, 3.4, 3.9, 5.4, 7.2_

- [ ] 5. Update program participation questions with three-tier structure
  - Reference Task 1 findings to ensure all program participation exemptions from HR1 Section 71119(9)(A)(ii)(VI) and (VII) are covered
  - [ ] 5.1 Update program-snap-tanf question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(VI) requirements
    - Restore "in compliance with SNAP or TANF work requirements" from commit 0adec5c (Tier 1)
    - Adapt help text: "Are you on food stamps (SNAP) or cash assistance (TANF) and meeting their work requirements?" (Tier 2)
    - Verify `snap`, `tanf`, and `communityEngagement` definitions in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(VI)
    - _Requirements: 1.7, 2.10, 3.2, 5.7, 7.2_

  - [ ] 5.2 Update program-rehab question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(VII) requirements
    - Restore "participating in a drug addiction or alcoholic treatment and rehabilitation program" from commit 0adec5c (Tier 1)
    - Adapt help text: "Are you currently in a drug or alcohol treatment program?" (Tier 2)
    - Verify `drugAlcoholRehabProgram` definition in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(VII)
    - _Requirements: 1.8, 2.10, 3.2, 5.7, 7.2_

- [ ] 6. Update other exemptions questions with three-tier structure
  - Reference Task 1 findings to ensure all other exemptions from HR1 Section 71119(9)(A)(ii)(II) and (VIII) are covered
  - [ ] 6.1 Update other-incarcerated question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(VIII) and (3)(A)(ii) requirements
    - Restore "inmate of a public institution or within 3 months of release" from commit 0adec5c (Tier 1)
    - Adapt help text: "Are you currently in jail or prison, or were you released in the last 3 months?" (Tier 2)
    - Verify `inmate` definition in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(VIII) and (3)(A)(ii)
    - _Requirements: 1.9, 2.10, 3.2, 5.10, 7.2_

  - [ ] 6.2 Update other-tribal question
    - Reference Task 1 analysis for HR1 Section 71119(9)(A)(ii)(II) requirements
    - Restore "Indian, Urban Indian, California Indian, or IHS-eligible Indian" from commit 0adec5c (Tier 1)
    - Adapt help text: "Are you a member of a Native American tribe or eligible for Indian Health Service?" (Tier 2)
    - Verify `indianUrbanIndianCaliforniaIndian` and `ihsEligible` definitions in `questionDefinitionMap`
    - Add HR1 reference comment: Section 71119(9)(A)(ii)(II)
    - _Requirements: 1.10, 2.10, 3.2, 5.8, 7.2_

- [ ] 7. Review and update definitions.ts
  - Reference Task 1 findings to ensure all HR1 exemption categories have corresponding definitions
  - Review commit 0adec5c to see if any definitions were removed during simplification
  - Review all definitions in `termDefinitions` object
  - Verify each definition is written at 8th grade reading level
  - Verify each definition includes 2-3 concrete examples
  - Verify each definition includes HR1 source reference from Task 1 analysis
  - Remove any definitions not referenced in `questionDefinitionMap`
  - Ensure `questionDefinitionMap` only includes definitions for terms in question text (as updated in Tasks 2-6)
  - If Task 1 identified missing exemption categories, add corresponding definitions
  - _Requirements: 3.1, 3.7, 3.8, 3.10, 4.3, 4.4, 7.2_

- [ ] 8. Add documentation comments to questions.ts
  - Add file-level comment explaining three-tier structure
  - Add comment before each question array explaining the approach:
    - Tier 1: Question text uses HR1 terminology
    - Tier 2: Help text provides plain language translation
    - Tier 3: Definition callouts (via questionDefinitionMap) provide detailed definitions
  - Document which questions were restored from commit 0adec5c
  - Add HR1 section references for each question
  - _Requirements: 4.7, 7.1, 7.2, 7.6, 7.7, 8.1, 8.2, 8.6, 8.7_

- [ ] 9. Update DEFINITIONS_README.md
  - Add section explaining three-tier information architecture
  - Update examples to show the three-tier structure
  - Add guidance on when to use each tier
  - Document the relationship between question text, help text, and definitions
  - _Requirements: 4.7, 8.3_

- [ ] 10. Manual testing of all questions
  - [ ] 10.1 Test age-based questions
    - Verify question text uses HR1 terminology
    - Verify help text is immediately visible and uses plain language
    - Verify no definition callouts (none needed for age question)
    - Test on mobile device
    - Test with screen reader
    - _Requirements: 4.1, 4.5, 4.10, 6.1, 6.7_

  - [ ] 10.2 Test family/caregiving questions
    - Verify question text uses HR1 terminology for all 3 questions
    - Verify help text is immediately visible and uses plain language
    - Verify definition callouts match terms in question text
    - Tap each definition callout and verify it expands
    - Verify definitions include examples and HR1 references
    - Test on mobile device
    - Test with screen reader
    - _Requirements: 3.1, 3.6, 4.1, 4.5, 4.6, 4.10, 6.1, 6.7_

  - [ ] 10.3 Test health/disability questions
    - Verify question text uses HR1 terminology for all 4 questions
    - Verify help text is immediately visible and uses plain language
    - Verify definition callouts match terms in question text
    - Tap each definition callout and verify it expands
    - For medically-frail question, verify all 5 sub-category definitions display
    - Verify definitions include examples and HR1 references
    - Test on mobile device
    - Test with screen reader
    - _Requirements: 3.1, 3.5, 3.6, 4.1, 4.5, 4.6, 4.10, 6.1, 6.7_

  - [ ] 10.4 Test program participation questions
    - Verify question text uses HR1 terminology for both questions
    - Verify help text is immediately visible and uses plain language
    - Verify definition callouts match terms in question text
    - Tap each definition callout and verify it expands
    - Verify definitions include examples and HR1 references
    - Test on mobile device
    - Test with screen reader
    - _Requirements: 3.1, 3.6, 4.1, 4.5, 4.6, 4.10, 6.1, 6.7_

  - [ ] 10.5 Test other exemptions questions
    - Verify question text uses HR1 terminology for both questions
    - Verify help text is immediately visible and uses plain language
    - Verify definition callouts match terms in question text
    - Tap each definition callout and verify it expands
    - Verify definitions include examples and HR1 references
    - Test on mobile device
    - Test with screen reader
    - _Requirements: 3.1, 3.6, 4.1, 4.5, 4.6, 4.10, 6.1, 6.7_

- [ ] 11. Verify no regressions in existing functionality
  - Complete full exemption screening flow
  - Verify question flow logic still works (next/back navigation)
  - Verify progress indicator updates correctly
  - Verify exemption calculation produces correct results
  - Verify exemption results display correctly
  - Verify exemption history tracking still works
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 12. Create git commit with proper documentation
  - Stage all changes to questions.ts, definitions.ts, and DEFINITIONS_README.md
  - Write commit message:
    - Title: "Realign exemption screener terminology with HR1 Section 71119"
    - Body: Explain three-tier structure (HR1 terminology → plain language → detailed definitions)
    - List which questions were restored from commit 0adec5c
    - Reference HR1 Section 71119 as authoritative source
    - Note that this fixes terminology misalignment between questions and definitions
  - _Requirements: 8.1, 8.2, 8.6_

---

## Notes

- All tasks focus on text content changes only - no UI component modifications needed
- Existing `ExemptionQuestion`, `DefinitionTooltip`, and `QuestionFlow` components already support the three-tier structure
- No database migrations needed - only text content changes
- No new dependencies required
- Testing should focus on terminology clarity and alignment, not functional changes

## Success Criteria

Implementation is complete when:

- [ ] All question text uses authoritative HR1 terminology
- [ ] All help text provides plain language translation
- [ ] All definition callouts match terms used in question text
- [ ] All definitions include examples and HR1 references
- [ ] Reading level is 8th grade or below for help text and definitions
- [ ] Manual testing shows no terminology confusion
- [ ] No regressions in existing functionality
- [ ] Documentation is updated
- [ ] Git commit properly documents changes
