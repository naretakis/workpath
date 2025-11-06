# Requirements Document: Exemption Screener Terminology Realignment

## Introduction

This spec addresses a terminology alignment issue in the exemption screening feature. Through previous simplification efforts, the question text was simplified to remove technical terms, but the expandable definition callouts still reference those technical terms, creating confusion for users. For example, a question asks "Are you currently pregnant or recently gave birth?" but the expandable callout defines "postpartum" - a term not used in the question itself.

The goal is to implement a three-tier information architecture:

1. **Question Text**: Uses authoritative HR1 terminology for legal accuracy
2. **Help Text**: Provides plain language (8th grade reading level) translation of the question
3. **Definition Callouts**: Offers detailed definitions for users who want to learn more

This approach balances legal accuracy with accessibility, ensuring users understand what's being asked while maintaining alignment with HR1 Section 71119 (docs/domain/hr1/119hr1enr-title7-part3.md).

## Glossary

- **Exemption Screener**: The questionnaire that determines if a user is exempt from Medicaid work requirements
- **Question Text**: The main question displayed to the user
- **Help Text**: The explanatory text below the question
- **Definition Callout**: The expandable info icon that shows plain language definitions of technical terms
- **HR1 Section 71119**: The authoritative legislation defining exemption categories and terminology
- **Specified Excluded Individual**: Legal term from HR1 for individuals exempt from work requirements
- **Postpartum**: The period after giving birth (legally defined in HR1)
- **Non-MAGI Medicaid**: Medicaid for people with disabilities or elderly people needing long-term care
- **Medically Frail**: Legal term for individuals with serious health conditions or disabilities

## Requirements

### Requirement 1: Use Authoritative HR1 Terminology in Question Text

**User Story:** As a Medicaid caseworker or legal reviewer, I want the screening questions to use the exact terminology from HR1 Section 71119, so that the app accurately reflects the legal requirements and can be verified for compliance.

#### Acceptance Criteria

1. WHEN the System displays the family-pregnant question, THE System SHALL use the term "pregnant or postpartum" to match HR1 Section 71119(9)(A)(ii)(IX)
2. WHEN the System displays the family-disabled-dependent question, THE System SHALL use the terms "parent, guardian, caretaker relative, or family caregiver" to match HR1 Section 71119(9)(A)(ii)(III)
3. WHEN the System displays the health-medicare question, THE System SHALL use the phrase "entitled to or enrolled for Medicare" to match HR1 Section 71119(9)(A)(ii)(II)(bb)
4. WHEN the System displays the health-non-magi question, THE System SHALL use the term "eligible for non-MAGI Medicaid" to match HR1 Section 71119(9)(A)(ii)(I)
5. WHEN the System displays the health-disabled-veteran question, THE System SHALL use the phrase "veteran with a disability rated as total" to match HR1 Section 71119(9)(A)(ii)(IV)
6. WHEN the System displays the health-medically-frail question, THE System SHALL use the term "medically frail or otherwise has special medical needs" to match HR1 Section 71119(9)(A)(ii)(V)
7. WHEN the System displays the program-snap-tanf question, THE System SHALL use the phrase "in compliance with SNAP or TANF work requirements" to match HR1 Section 71119(9)(A)(ii)(VI)
8. WHEN the System displays the program-rehab question, THE System SHALL use the term "participating in drug addiction or alcoholic treatment and rehabilitation program" to match HR1 Section 71119(9)(A)(ii)(VII)
9. WHEN the System displays the other-incarcerated question, THE System SHALL use the term "inmate of a public institution" to match HR1 Section 71119(9)(A)(ii)(VIII)
10. WHEN the System displays the other-tribal question, THE System SHALL use the exact terminology from HR1 Section 71119(9)(A)(ii)(II): "Indian, Urban Indian, California Indian, or IHS-eligible Indian"

### Requirement 2: Provide Plain Language Translation in Help Text

**User Story:** As a Medicaid beneficiary with limited education, I want the help text to translate the legal question into plain language, so that I immediately understand what's being asked without needing legal expertise.

#### Acceptance Criteria

1. WHEN the System displays help text for any question, THE System SHALL rewrite the question in plain language at an 8th grade reading level or below
2. WHEN the System displays help text, THE System SHALL use conversational tone with "you" and "your"
3. WHEN the System displays help text, THE System SHALL explain what the question means in everyday terms
4. WHEN the System displays help text for the postpartum question, THE System SHALL translate it as "Are you currently pregnant or gave birth within the last 60 days?"
5. WHEN the System displays help text for the non-MAGI question, THE System SHALL translate it as "Do you get Medicaid because of a disability or long-term care needs?"
6. WHEN the System displays help text for the medically frail question, THE System SHALL translate it as "Do you have a serious health condition or disability?"
7. WHEN the System displays help text for the disabled veteran question, THE System SHALL translate it as "Are you a veteran with a 100% disability rating from the VA?"
8. WHEN the System displays help text for the caretaker question, THE System SHALL translate it as "Are you a parent or guardian of a child age 13 or younger, or someone with a disability?"
9. WHEN the System displays help text for the Medicare question, THE System SHALL translate it as "Do you have Medicare (health insurance for people 65+ or with disabilities)?"
10. WHEN the System displays help text, THE System SHALL direct users to tap definition callouts for more detailed information

### Requirement 3: Provide Detailed Definitions in Expandable Callouts

**User Story:** As a Medicaid beneficiary who wants to learn more, I want expandable definition callouts that explain technical terms in detail, so that I can understand the legal requirements and see examples.

#### Acceptance Criteria

1. WHEN the System displays definition callouts for a question, THE System SHALL show definitions for all technical terms used in the question text
2. WHEN the System displays the postpartum definition, THE System SHALL show it for questions that use the term "postpartum" in the question text
3. WHEN the System displays the caretaker relative definition, THE System SHALL show it for questions that use the term "caretaker relative" in the question text
4. WHEN the System displays the medically frail definition, THE System SHALL show it for questions that use the term "medically frail" in the question text
5. WHEN the System displays multiple definitions for a question, THE System SHALL order them by relevance to the question text
6. WHEN the System displays a definition callout, THE System SHALL use the exact term from the question as the definition title
7. WHEN the System displays a definition, THE System SHALL include plain language explanation, concrete examples, and HR1 source reference
8. WHEN the System displays a definition, THE System SHALL write it at an 8th grade reading level or below
9. WHEN the System displays a definition for medically frail, THE System SHALL include all sub-categories from HR1 Section 71119(9)(A)(ii)(V)
10. WHEN the System displays a definition, THE System SHALL provide 2-3 concrete examples to clarify the term

### Requirement 4: Implement Three-Tier Information Architecture

**User Story:** As a Medicaid beneficiary, I want information presented in layers (legal question, plain translation, detailed definitions), so that I can quickly understand what's being asked and dive deeper if needed.

#### Acceptance Criteria

1. WHEN the System displays any question, THE System SHALL present information in three distinct tiers: question text, help text, and definition callouts
2. WHEN the System displays question text (Tier 1), THE System SHALL use authoritative HR1 terminology for legal accuracy
3. WHEN the System displays help text (Tier 2), THE System SHALL provide plain language translation at 8th grade reading level
4. WHEN the System displays definition callouts (Tier 3), THE System SHALL provide detailed explanations with examples and source references
5. WHEN the System displays help text, THE System SHALL be immediately visible without user interaction
6. WHEN the System displays definition callouts, THE System SHALL require user interaction (tap/click) to expand
7. WHEN the System displays all three tiers, THE System SHALL maintain visual hierarchy (question largest, help text medium, definitions expandable)
8. WHEN the System displays help text, THE System SHALL reference definition callouts for users who want more detail (e.g., "Tap the info icons below for more details")
9. WHEN the System displays question text, THE System SHALL maintain conversational tone by using "you" and "your" even with legal terminology
10. WHEN the System displays any tier, THE System SHALL ensure mobile-friendly formatting and touch targets

### Requirement 5: Source All Terminology from HR1 Section 71119

**User Story:** As a developer, I want all exemption terminology to come from the authoritative HR1 legislation, so that the app accurately reflects the legal requirements.

#### Acceptance Criteria

1. WHEN the System defines exemption categories, THE System SHALL use the categories specified in HR1 Section 71119(9)(A)(ii)
2. WHEN the System uses legal terms, THE System SHALL match the exact terminology from HR1 Section 71119
3. WHEN the System defines "postpartum", THE System SHALL reference HR1 Section 71119(9)(A)(ii)(IX)
4. WHEN the System defines "medically frail", THE System SHALL reference HR1 Section 71119(9)(A)(ii)(V)
5. WHEN the System defines "disabled veteran", THE System SHALL reference HR1 Section 71119(9)(A)(ii)(IV) and title 38 USC 1155
6. WHEN the System defines "non-MAGI Medicaid", THE System SHALL reference HR1 Section 71119(9)(A)(ii)(I)
7. WHEN the System defines program participation exemptions, THE System SHALL reference HR1 Section 71119(9)(A)(ii)(VI) and (VII)
8. WHEN the System defines tribal exemptions, THE System SHALL reference HR1 Section 71119(9)(A)(ii)(II)
9. WHEN the System defines caretaker exemptions, THE System SHALL reference HR1 Section 71119(9)(A)(ii)(III)
10. WHEN the System defines inmate exemptions, THE System SHALL reference HR1 Section 71119(9)(A)(ii)(VIII) and (3)(A)(ii)

### Requirement 6: Preserve User Experience Improvements

**User Story:** As a Medicaid beneficiary, I want the screening process to remain easy to use, so that I can complete it quickly on my phone.

#### Acceptance Criteria

1. WHEN the System restores terminology, THE System SHALL maintain the current mobile-friendly UI design
2. WHEN the System restores terminology, THE System SHALL maintain the current question flow logic
3. WHEN the System restores terminology, THE System SHALL maintain the current progress indicator
4. WHEN the System restores terminology, THE System SHALL maintain the current back navigation functionality
5. WHEN the System restores terminology, THE System SHALL maintain the current expandable definition callout UI
6. WHEN the System restores terminology, THE System SHALL maintain the current touch target sizes (44px minimum)
7. WHEN the System restores terminology, THE System SHALL maintain the current accessibility features (ARIA labels, keyboard navigation)

### Requirement 7: Use Original Questions as Starting Point

**User Story:** As a developer, I want to reference the original question text from before simplification (commit 0adec5c), so that I don't have to rewrite everything from scratch and can build on work that was already aligned with HR1.

#### Acceptance Criteria

1. WHEN implementing question text changes, THE System SHALL reference commit 0adec5c as the baseline for question terminology
2. WHEN implementing question text changes, THE System SHALL use the original question text from commit 0adec5c as Tier 1 (question text)
3. WHEN implementing help text changes, THE System SHALL adapt the simplified language from current questions as Tier 2 (help text)
4. WHEN implementing changes, THE System SHALL verify that original question text from commit 0adec5c matches HR1 Section 71119 terminology
5. WHEN implementing changes, THE System SHALL make minimal modifications to original questions, only adjusting for the three-tier structure
6. WHEN implementing changes, THE System SHALL preserve any improvements made in subsequent commits that don't conflict with terminology alignment
7. WHEN implementing changes, THE System SHALL document which elements came from commit 0adec5c vs. current implementation

### Requirement 8: Document Terminology Changes

**User Story:** As a developer, I want clear documentation of what terminology changed and why, so that future changes maintain consistency.

#### Acceptance Criteria

1. WHEN terminology is updated, THE System SHALL document the change in git commit messages
2. WHEN terminology is updated, THE System SHALL reference the specific HR1 section that justifies the change
3. WHEN terminology is updated, THE System SHALL update the DEFINITIONS_README.md file if needed
4. WHEN terminology is updated, THE System SHALL ensure the questionDefinitionMap in definitions.ts is accurate
5. WHEN terminology is updated, THE System SHALL verify that all definition callouts still work correctly
6. WHEN terminology is updated, THE System SHALL note which questions were restored from commit 0adec5c
7. WHEN terminology is updated, THE System SHALL document the three-tier structure in code comments

## Out of Scope

The following are explicitly out of scope for this spec:

- Adding new exemption categories not in HR1
- Changing the exemption calculation logic
- Modifying the database schema
- Adding new UI components
- Changing the overall screening flow
- Translating to other languages
- Adding audio pronunciations
- Creating a glossary page
- Modifying the exemption results display
- Changing the exemption history tracking

## Success Criteria

This spec will be considered successful when:

1. All question text uses terminology that matches the definition callouts
2. All help text explains the terms used in the question text
3. All definition callouts define terms that appear in the question or help text
4. All terminology is sourced from HR1 Section 71119
5. The reading level remains at 8th grade or below
6. User testing shows no confusion about terminology alignment
7. The UI/UX remains unchanged except for text content

## References

- **HR1 Legislation**: docs/domain/hr1/119hr1enr-title7-part3.md (Section 71119) - Authoritative source
- **Current Questions**: src/lib/exemptions/questions.ts - Current implementation with simplified language
- **Current Definitions**: src/lib/exemptions/definitions.ts - Current definition callouts
- **Original Questions** (commit 0adec5c): `git show 0adec5c:src/lib/exemptions/questions.ts` - Questions with proper HR1 terminology before simplification
- **Simplified Questions** (commit 3a2ceb4): `git show 3a2ceb4:src/lib/exemptions/questions.ts` - First simplification pass
- **Further Simplified** (commit 8a1eaef): `git show 8a1eaef:src/lib/exemptions/questions.ts` - Second simplification pass
- **Domain Knowledge**: .kiro/steering/medicaid-domain-knowledge.md - Consolidated requirements and guidance
