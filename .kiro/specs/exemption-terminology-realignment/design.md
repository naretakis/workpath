# Design Document: Exemption Screener Terminology Realignment

## Overview

This design implements a three-tier information architecture for the exemption screening questions, balancing legal accuracy with accessibility. Each question presents information in three layers:

1. **Tier 1 - Question Text**: Authoritative HR1 terminology for legal compliance
2. **Tier 2 - Help Text**: Plain language translation (8th grade reading level)
3. **Tier 3 - Definition Callouts**: Detailed definitions with examples (expandable)

The implementation will restore original question text from commit 0adec5c (which used proper HR1 terminology), adapt current simplified language as help text, and ensure definition callouts align with the question terms.

## Architecture

### Component Structure

The existing component structure remains unchanged:

```
src/lib/exemptions/
├── questions.ts          # Question definitions (MODIFIED)
├── definitions.ts        # Term definitions (MODIFIED)
├── questionFlow.ts       # Flow logic (NO CHANGES)
└── calculator.ts         # Exemption calculation (NO CHANGES)

src/components/exemptions/
├── ExemptionQuestion.tsx      # Question display (NO CHANGES)
├── DefinitionTooltip.tsx      # Definition callouts (NO CHANGES)
└── QuestionFlow.tsx           # Flow container (NO CHANGES)
```

### Data Model

The `ExemptionQuestion` interface already supports the three-tier structure:

```typescript
export interface ExemptionQuestion {
  id: string;
  category: ExemptionCategory;
  text: string; // Tier 1: HR1 terminology
  type: QuestionType;
  helpText?: string; // Tier 2: Plain language translation
  options?: QuestionOption[];
  required: boolean;
}
```

The `questionDefinitionMap` in `definitions.ts` links questions to relevant definitions (Tier 3).

## Question-by-Question Design

### Age-Based Questions

#### Question: age-dob

**Tier 1 - Question Text (HR1 terminology):**

```
What is your date of birth?
```

**Tier 2 - Help Text (Plain language):**

```
We use this to check if you're exempt based on age. People 18 or younger and 65 or older are exempt from work requirements.
```

**Tier 3 - Definition Callouts:**

- None needed (straightforward question)

**Source:** Original from commit 0adec5c (no changes needed)

---

### Family/Caregiving Questions

#### Question: family-pregnant

**Tier 1 - Question Text (HR1 terminology):**

```
Are you currently pregnant or postpartum?
```

**Tier 2 - Help Text (Plain language):**

```
Are you currently pregnant or gave birth within the last 60 days? If yes, you're exempt from work requirements.
```

**Tier 3 - Definition Callouts:**

- `postpartum`: "The period after giving birth. For Medicaid, this typically means within 60 days after you have a baby..."

**Source:** Restore "postpartum" from commit 0adec5c, adapt current help text

**HR1 Reference:** Section 71119(9)(A)(ii)(IX) - "who is pregnant or entitled to postpartum medical assistance"

---

#### Question: family-child

**Tier 1 - Question Text (HR1 terminology):**

```
Do you live in a household with a dependent child 13 years of age and under?
```

**Tier 2 - Help Text (Plain language):**

```
Do you live with a child age 13 or younger? This includes your own children, stepchildren, or children you care for. If yes, you're exempt from work requirements.
```

**Tier 3 - Definition Callouts:**

- `dependentChild13OrYounger`: "A child age 13 or under who lives in your household..."
- `dependent`: "A child or person you take care of..."

**Source:** Restore "dependent child 13 years of age and under" from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(III) - "dependent child 13 years of age and under"

---

#### Question: family-disabled-dependent

**Tier 1 - Question Text (HR1 terminology):**

```
Are you a parent, guardian, caretaker relative, or family caregiver of a disabled individual?
```

**Tier 2 - Help Text (Plain language):**

```
Are you a parent or guardian of someone with a disability? This includes caring for a child or adult with a disability. If yes, you're exempt from work requirements.
```

**Tier 3 - Definition Callouts:**

- `caretakerRelative`: "A family member who takes care of a child..."
- `dependent`: "A child or person you take care of..."

**Source:** Restore full terminology from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(III) - "parent, guardian, caretaker relative, or family caregiver"

---

### Health/Disability Questions

#### Question: health-medicare

**Tier 1 - Question Text (HR1 terminology):**

```
Are you entitled to or enrolled for Medicare?
```

**Tier 2 - Help Text (Plain language):**

```
Do you have Medicare? Medicare is federal health insurance, usually for people 65 or older or with certain disabilities. This is different from Medicaid.
```

**Tier 3 - Definition Callouts:**

- `medicare`: "Federal health insurance for people 65 or older, or people under 65 with certain disabilities..."

**Source:** Restore "entitled to or enrolled for" from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(II)(bb) - "entitled to, or enrolled for, benefits under part A of title XVIII, or enrolled for benefits under part B of title XVIII"

---

#### Question: health-non-magi

**Tier 1 - Question Text (HR1 terminology):**

```
Are you eligible for non-MAGI Medicaid?
```

**Tier 2 - Help Text (Plain language):**

```
Do you get Medicaid because of a disability or long-term care needs? This is a special type of Medicaid for people with disabilities or in nursing homes. If you're not sure, select 'No'.
```

**Tier 3 - Definition Callouts:**

- `nonMAGIMedicaid`: "Medicaid for people with disabilities or elderly people who need long-term care..."

**Source:** Restore "non-MAGI Medicaid" from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(I) - "described in subsection (a)(10)(A)(i)(IX)" (non-MAGI Medicaid)

---

#### Question: health-disabled-veteran

**Tier 1 - Question Text (HR1 terminology):**

```
Are you a veteran with a disability rated as total?
```

**Tier 2 - Help Text (Plain language):**

```
Are you a veteran with a 100% disability rating from the VA? This means the VA determined you have a total service-connected disability. If you're not sure of your rating, select 'No'.
```

**Tier 3 - Definition Callouts:**

- `disabledVeteran`: "A veteran who has a total disability rating from the VA (Veterans Affairs)..."

**Source:** Restore "disability rated as total" from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(IV) - "veteran with a disability rated as total under section 1155 of title 38, United States Code"

---

#### Question: health-medically-frail

**Tier 1 - Question Text (HR1 terminology):**

```
Are you medically frail or otherwise have special medical needs?
```

**Tier 2 - Help Text (Plain language):**

```
Do you have a serious health condition or disability? This includes being blind, disabled, having substance use disorder, mental health conditions, or chronic illnesses. Tap the info icons below for detailed examples.
```

**Tier 3 - Definition Callouts:**

- `medicallyFrail`: "Having a serious health condition or disability that makes it hard to work..."
- `substanceUseDisorder`: "A medical condition where someone has trouble controlling their use of drugs or alcohol..."
- `disablingMentalDisorder`: "A mental health condition that makes it hard to do daily activities..."
- `physicalIntellectualDevelopmentalDisability`: "A condition that significantly limits your ability to do everyday activities..."
- `seriousComplexMedicalCondition`: "An ongoing health problem that requires regular medical care..."

**Source:** Restore "medically frail or otherwise have special medical needs" from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(V) - "medically frail or otherwise has special medical needs (as defined by the Secretary)"

---

### Program Participation Questions

#### Question: program-snap-tanf

**Tier 1 - Question Text (HR1 terminology):**

```
Are you in compliance with SNAP or TANF work requirements?
```

**Tier 2 - Help Text (Plain language):**

```
Are you on food stamps (SNAP) or cash assistance (TANF) and meeting their work requirements? Important: You must be actively meeting their work requirements (not exempt from them). If you're exempt from SNAP/TANF work requirements, select 'No'.
```

**Tier 3 - Definition Callouts:**

- `snap`: "The Supplemental Nutrition Assistance Program, also called food stamps..."
- `tanf`: "Temporary Assistance for Needy Families. It's cash assistance for families with children..."
- `communityEngagement`: "Activities that count toward the 80 hours per month requirement..."

**Source:** Restore "in compliance with" from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(VI) - "in compliance with any requirements imposed by the State pursuant to section 407" or "is a member of a household that receives supplemental nutrition assistance program benefits"

---

#### Question: program-rehab

**Tier 1 - Question Text (HR1 terminology):**

```
Are you participating in a drug addiction or alcoholic treatment and rehabilitation program?
```

**Tier 2 - Help Text (Plain language):**

```
Are you currently in a drug or alcohol treatment program? This includes inpatient programs (where you stay at a facility) or outpatient programs (where you go for treatment but live at home).
```

**Tier 3 - Definition Callouts:**

- `drugAlcoholRehabProgram`: "A treatment program for people with drug or alcohol addiction..."

**Source:** Restore full terminology from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(VII) - "participating in a drug addiction or alcoholic treatment and rehabilitation program"

---

### Other Exemptions Questions

#### Question: other-incarcerated

**Tier 1 - Question Text (HR1 terminology):**

```
Are you an inmate of a public institution or within 3 months of release?
```

**Tier 2 - Help Text (Plain language):**

```
Are you currently in jail or prison, or were you released in the last 3 months? If yes, you're exempt during this time. After 3 months, you'll need to re-screen.
```

**Tier 3 - Definition Callouts:**

- `inmate`: "A person who is in jail or prison..."

**Source:** Restore "inmate of a public institution" from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(VIII) and (3)(A)(ii) - "inmate of a public institution" and "within last 3 months of release"

---

#### Question: other-tribal

**Tier 1 - Question Text (HR1 terminology):**

```
Are you an Indian, Urban Indian, California Indian, or IHS-eligible Indian?
```

**Tier 2 - Help Text (Plain language):**

```
Are you a member of a Native American tribe or eligible for Indian Health Service? This includes being enrolled in a federally recognized tribe, being an Urban Indian, California Indian, or eligible for IHS services.
```

**Tier 3 - Definition Callouts:**

- `indianUrbanIndianCaliforniaIndian`: "A person who is a member of a federally recognized Native American tribe..."
- `ihsEligible`: "Eligible for the Indian Health Service..."

**Source:** Restore exact terminology from commit 0adec5c

**HR1 Reference:** Section 71119(9)(A)(ii)(II) - "Indian or an Urban Indian", "California Indian", "IHS-eligible Indian"

---

## Implementation Strategy

### Phase 1: Update questions.ts

1. Review commit 0adec5c for original question text
2. For each question:
   - Restore original question text as `text` field (Tier 1)
   - Adapt current simplified language as `helpText` field (Tier 2)
   - Verify HR1 section reference in code comments
3. Add code comments documenting the three-tier structure

### Phase 2: Update definitions.ts

1. Review `questionDefinitionMap` to ensure it maps questions to relevant definitions
2. For each question, verify that:
   - Definition callouts match terms used in question text
   - Definitions are written at 8th grade reading level
   - Definitions include examples and HR1 references
3. Remove any definitions that don't match question terminology
4. Add any missing definitions for terms in question text

### Phase 3: Verify UI Display

1. Test each question in the exemption screener
2. Verify three-tier display:
   - Question text uses HR1 terminology
   - Help text is immediately visible and uses plain language
   - Definition callouts are expandable and provide detail
3. Verify mobile responsiveness
4. Verify accessibility (screen readers, keyboard navigation)

### Phase 4: Update Documentation

1. Update DEFINITIONS_README.md to explain three-tier structure
2. Add code comments in questions.ts explaining the approach
3. Document which questions were restored from commit 0adec5c
4. Update git commit message with references to HR1 sections

## Data Flow

```
User views question
    ↓
ExemptionQuestion component renders
    ↓
Displays question.text (Tier 1: HR1 terminology)
    ↓
Displays question.helpText (Tier 2: Plain language)
    ↓
Renders DefinitionTooltip for each term in questionDefinitionMap
    ↓
User taps info icon
    ↓
DefinitionTooltip expands (Tier 3: Detailed definition)
```

## Error Handling

No new error handling needed - existing validation and flow logic remain unchanged.

## Testing Strategy

### Unit Tests

No new unit tests needed - existing tests for `questions.ts` and `definitions.ts` should pass with updated content.

### Manual Testing Checklist

For each question:

- [ ] Question text uses HR1 terminology
- [ ] Help text provides plain language translation
- [ ] Help text is immediately visible
- [ ] Definition callouts match terms in question text
- [ ] Definition callouts expand on tap/click
- [ ] Definitions include examples and HR1 references
- [ ] Reading level is 8th grade or below for help text and definitions
- [ ] Mobile display is correct
- [ ] Touch targets are 44px minimum
- [ ] Screen reader announces all three tiers correctly

### User Acceptance Testing

Test with actual users to verify:

- Users understand what the question is asking
- Users can find definitions when needed
- Users are not confused by terminology mismatches
- Users can complete the screening without assistance

## Migration Plan

### Backward Compatibility

No database migration needed - only text content changes.

Existing exemption screening data remains valid.

### Rollout Strategy

1. Deploy changes to staging environment
2. Conduct user testing with 5-10 users
3. Gather feedback on terminology clarity
4. Make adjustments if needed
5. Deploy to production
6. Monitor for user confusion or support requests

## Performance Considerations

No performance impact - only text content changes.

Definition callouts remain lazy-loaded (only rendered when expanded).

## Accessibility

The three-tier structure enhances accessibility:

- **Tier 1** provides legal accuracy for caseworkers and reviewers
- **Tier 2** provides immediate plain language translation for all users
- **Tier 3** provides optional deep dives for users who want more information

Screen readers will announce:

1. Question text (with HR1 terminology)
2. Help text (with plain language translation)
3. "Info button" for each definition callout
4. Definition content when expanded

## Security Considerations

No security implications - only text content changes.

## Future Enhancements

Potential improvements for future iterations:

1. **Audio Pronunciations**: Add audio for complex terms like "postpartum" or "caretaker relative"
2. **Glossary Page**: Create a standalone glossary showing all definitions
3. **Search Functionality**: Allow users to search definitions
4. **Multi-language Support**: Translate all three tiers to Spanish, etc.
5. **Analytics**: Track which definitions users expand most frequently
6. **Contextual Help**: Show relevant definitions based on user's previous answers

## References

- **HR1 Section 71119**: docs/domain/hr1/119hr1enr-title7-part3.md
- **Original Questions**: `git show 0adec5c:src/lib/exemptions/questions.ts`
- **Current Questions**: src/lib/exemptions/questions.ts
- **Current Definitions**: src/lib/exemptions/definitions.ts
- **Domain Knowledge**: .kiro/steering/medicaid-domain-knowledge.md
- **Plain Language Guidelines**: src/lib/exemptions/DEFINITIONS_README.md
