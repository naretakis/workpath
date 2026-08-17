# Plain Language Definitions - Implementation Summary

**Task**: 9.2 Create plain language definitions for ambiguous terms  
**Date**: November 5, 2025  
**Status**: Complete

## What Was Implemented

### 1. Definitions File (`definitions.ts`)

Created a comprehensive definitions file with **21 plain language definitions** covering all ambiguous terms used in the exemption screening:

#### Health Insurance & Programs (5 definitions)

- Medicare
- Non-MAGI Medicaid
- SNAP
- TANF
- IHS-eligible

#### Work & Activities (3 definitions)

- Community Engagement
- Work Program
- Educational Program - Half-Time

#### Family & Caregiving (4 definitions)

- Postpartum
- Dependent
- Dependent Child 13 or Younger
- Caretaker Relative

#### Health & Disability (6 definitions)

- Disabled Veteran
- Medically Frail
- Substance Use Disorder
- Disabling Mental Disorder
- Physical/Intellectual/Developmental Disability
- Serious or Complex Medical Condition

#### Programs & Rehabilitation (1 definition)

- Drug/Alcohol Rehabilitation Program

#### Other Circumstances (2 definitions)

- Inmate
- Indian/Urban Indian/California Indian

### 2. UI Components

#### DefinitionTooltip Component

- Displays definitions in accessible tooltips
- 44px+ touch targets for mobile
- Screen reader compatible with ARIA labels
- Keyboard navigable
- Shows term, definition, and examples

#### Updated ExemptionQuestion Component

- Automatically displays definition tooltips for relevant questions
- Integrates seamlessly with existing question flow
- Mobile-first design

### 3. Question-Definition Mapping

Created mappings linking each question to relevant definitions:

- `family-pregnant` → postpartum
- `family-child` → dependentChild13OrYounger, dependent
- `health-medicare` → medicare
- `health-medically-frail` → 5 related definitions
- And more...

### 4. Documentation

- **DEFINITIONS_README.md**: Complete guide for using and maintaining the definitions system
- **DEFINITIONS_SUMMARY.md**: This file - implementation summary

## Plain Language Quality

All definitions follow these standards:

✅ **8th grade reading level**  
✅ **Conversational tone** (uses "you" and "your")  
✅ **1-3 sentences** per definition  
✅ **Concrete examples** included  
✅ **No legal jargon**  
✅ **Active voice**  
✅ **Source documented** for each definition

## Source Attribution

Each definition includes:

- **Source**: HR1 Section 71119, Service Blueprint, Domain Knowledge, or Common knowledge
- **Source Reference**: Specific section numbers where applicable

Example sources:

- Medicare: HR1 Section 71119, Section 1902(xx)(9)(A)(ii)(II)(bb)
- SNAP: HR1 Section 71119, Section 1902(xx)(9)(A)(ii)(VI)(bb)
- Postpartum: HR1 Section 71119, Section 1902(xx)(9)(A)(ii)(IX)

## Accessibility Features

The implementation includes:

✅ **Mobile-first design** - Works on 320px screens  
✅ **Touch targets** - 44px+ for easy tapping  
✅ **Screen reader support** - ARIA labels on all interactive elements  
✅ **Keyboard navigation** - All tooltips accessible via keyboard  
✅ **High contrast** - Readable text and icons

## Integration with Existing Code

The definitions system integrates with:

1. **questions.ts** - Updated help text to reference definitions
2. **ExemptionQuestion.tsx** - Displays definition tooltips automatically
3. **Type system** - Uses existing ExemptionCategory types

No breaking changes to existing code.

## Testing

✅ **Build test**: `npm run build` - Passed  
✅ **TypeScript**: No type errors  
✅ **Diagnostics**: No linting issues

## Examples of Definitions in Use

### Example 1: Medicare Question

**Question**: "Are you on Medicare or entitled to Medicare?"

**Definition shown**:

> **Medicare**  
> Federal health insurance for people 65 or older, or people under 65 with certain disabilities. Part A or Part B both matter here: for any month you have Medicare, your state should treat this requirement as already met. Ask your state to confirm it has your Medicare enrolment on file — that's normally something it can look up itself.
>
> Examples:
>
> - You turned 65 and enrolled in Medicare
> - You receive Social Security disability benefits and have Medicare

### Example 2: Medically Frail Question

**Question**: "Are you medically frail or have special needs?"

**Definitions shown** (5 tooltips):

1. Medically Frail
2. Substance Use Disorder
3. Disabling Mental Disorder
4. Physical/Intellectual/Developmental Disability
5. Serious or Complex Medical Condition

Each with plain language explanation and examples.

## Files Created/Modified

### Created:

- `src/lib/exemptions/definitions.ts` (21 definitions)
- `src/components/exemptions/DefinitionTooltip.tsx` (UI component)
- `src/lib/exemptions/DEFINITIONS_README.md` (documentation)
- `src/lib/exemptions/DEFINITIONS_SUMMARY.md` (this file)

### Modified:

- `src/components/exemptions/ExemptionQuestion.tsx` (added definition display)
- `src/lib/exemptions/questions.ts` (updated help text)

## Next Steps (Optional Enhancements)

The following were identified as potential future improvements but are NOT part of this task:

- [ ] Create a standalone glossary page
- [ ] Add search functionality for definitions
- [ ] Track which definitions users view most
- [ ] Add "Was this helpful?" feedback
- [ ] Support multiple languages
- [ ] Add audio pronunciations

## Compliance with Task Requirements

This implementation fulfills all requirements from task 9.2:

✅ **Identified all terms requiring definitions** - 21 terms from legislation and context  
✅ **Defined source priority** - HR1 first, then Service Blueprint, then Domain Knowledge  
✅ **Created plain language definitions** - All at 8th grade level with examples  
✅ **Documented definition sources** - Every definition includes source and reference  
✅ **Designed UI/UX for definitions** - Mobile-first tooltips with 44px+ touch targets  
✅ **Implemented definition components** - DefinitionTooltip with accessibility features  
✅ **Added definitions to questions** - Integrated via questionDefinitionMap  
✅ **Reviewed and refined** - All definitions use conversational tone, no jargon

## Verification

To verify the implementation:

1. **Run the app**: `npm run dev`
2. **Navigate to**: `/exemptions`
3. **Start screening**: Click "Start Screening"
4. **Check definitions**: Look for info icons next to terms
5. **Tap icons**: Verify tooltips show clear definitions with examples

All definitions should be:

- Easy to understand
- Relevant to the question
- Helpful for decision-making
- Accessible on mobile devices
