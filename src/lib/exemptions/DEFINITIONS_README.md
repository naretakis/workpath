# Plain Language Definitions System

This directory contains a plain language definitions system for the exemption screening feature. The system helps users understand complex legal and technical terms without jargon.

## Three-Tier Information Architecture

The exemption screening uses a three-tier approach to balance legal accuracy with accessibility:

### Tier 1: Question Text (HR1 Terminology)

The main question uses authoritative terminology from HR1 Section 71119 for legal compliance.

**Example:** "Are you currently pregnant or postpartum?"

**Purpose:** Legal accuracy and compliance with HR1 legislation

### Tier 2: Help Text (Plain Language Translation)

Immediately visible text that translates the legal question into everyday language.

**Example:** "Are you currently pregnant or gave birth within the last 60 days? If yes, you're exempt from work requirements."

**Purpose:** Immediate understanding for all users (8th grade reading level)

### Tier 3: Definition Callouts (Detailed Definitions)

Expandable info icons that provide detailed definitions with examples for users who want to learn more.

**Example:** Tapping the "postpartum" info icon shows: "The period after giving birth. For Medicaid, this typically means within 60 days after you have a baby..."

**Purpose:** Optional deep dive for users who want more information

## Files

- **definitions.ts** - Contains all term definitions with plain language explanations (Tier 3)
- **DefinitionTooltip.tsx** - React component for displaying definitions in tooltips
- **questions.ts** - Question definitions with HR1 terminology (Tier 1) and help text (Tier 2)

## How It Works

### 1. Definitions File (`definitions.ts`)

Each definition includes:

- **term**: The technical term being defined
- **definition**: Plain language explanation (8th grade reading level)
- **examples**: Real-world examples to clarify the term
- **source**: Where the definition comes from (HR1 legislation, Service Blueprint, etc.)
- **sourceReference**: Specific section reference for traceability

Example:

```typescript
medicare: {
  term: "Medicare",
  definition: "Federal health insurance for people 65 or older, or people under 65 with certain disabilities.",
  examples: [
    "You turned 65 and enrolled in Medicare",
    "You receive Social Security disability benefits and have Medicare",
  ],
  source: "HR1 Section 71119",
  sourceReference: "Section 1902(xx)(9)(A)(ii)(II)(bb)",
}
```

### 2. Question-Definition Mapping

The `questionDefinitionMap` links each question to relevant definitions. **Important:** Only include definitions for terms that appear in the question text (Tier 1), not terms only in the help text (Tier 2).

```typescript
export const questionDefinitionMap: Record<string, string[]> = {
  "health-medicare": ["medicare"], // "Medicare" appears in question text
  "health-medically-frail": [
    "medicallyFrail", // "medically frail" appears in question text
    "substanceUseDisorder",
    "disablingMentalDisorder",
    // ... all 5 sub-categories
  ],
  // ...
};
```

**Why this matters:** Definition callouts should define terms used in the question text, creating alignment between what's asked and what's defined. This prevents confusion where a question uses one term but the definition explains a different term.

### 3. UI Integration

The `ExemptionQuestion` component automatically displays definition tooltips for any question that has associated definitions:

```typescript
const definitions = getDefinitionsForQuestion(question.id);
// Renders info icons with tooltips for each definition
```

The three tiers work together:

1. User sees question with HR1 terminology (Tier 1)
2. User reads help text for plain language translation (Tier 2)
3. User can tap info icons for detailed definitions (Tier 3)

## Adding New Definitions

To add a new definition:

1. **Verify the term appears in question text** (Tier 1):
   - Check `questions.ts` to see if the term is used in the `text` field
   - Only create definitions for terms in question text, not help text
   - This ensures alignment between questions and definitions

2. **Add to `definitions.ts`**:

```typescript
export const termDefinitions: Record<string, TermDefinition> = {
  // ... existing definitions

  newTerm: {
    term: "New Term", // Use exact term from question text
    definition: "Plain language explanation in 1-3 sentences.",
    examples: ["Example 1", "Example 2", "Example 3"], // 2-3 concrete examples
    source: "HR1 Section 71119", // or other source
    sourceReference: "Section 1902(xx)(9)(A)(ii)(X)", // Specific HR1 reference
  },
};
```

3. **Link to question**:

```typescript
export const questionDefinitionMap: Record<string, string[]> = {
  "question-id": ["newTerm", "otherTerm"],
  // ...
};
```

4. **Test the definition**:
   - Navigate to the exemption screening
   - Find the question that uses the term
   - Verify the term in the question matches the definition title
   - Tap the info icon to see the definition
   - Verify it's clear and helpful

## Relationship Between Question Text, Help Text, and Definitions

### When to Use Each Tier

**Tier 1 (Question Text):**

- Use exact HR1 terminology from Section 71119
- Maintain legal accuracy and compliance
- Use conversational tone with "you" and "your"
- Example: "Are you entitled to or enrolled for Medicare?"

**Tier 2 (Help Text):**

- Translate the legal question into plain language
- Explain what the question means in everyday terms
- Include consequences (e.g., "If yes, you're exempt from work requirements")
- Direct users to definition callouts for more detail
- Example: "Do you have Medicare? Medicare is federal health insurance, usually for people 65 or older..."

**Tier 3 (Definition Callouts):**

- Define technical terms that appear in the question text
- Provide 2-3 concrete examples
- Include HR1 source reference
- Write at 8th grade reading level
- Example: Full definition of "Medicare" with examples and source

### Alignment Rules

1. **Definition callouts must match question text terms** - If the question says "postpartum", the definition should be titled "Postpartum", not "recently gave birth"
2. **Help text can use different language** - Help text translates the question, so it can say "gave birth within the last 60 days" even though the question says "postpartum"
3. **All three tiers work together** - Users see HR1 terminology (Tier 1), get immediate translation (Tier 2), and can dive deeper if needed (Tier 3)

## Plain Language Guidelines

When writing definitions:

### ✅ DO:

- Use "you" and "your" (conversational tone)
- Write at 8th grade reading level
- Keep definitions to 1-3 sentences
- Include concrete examples
- Avoid acronyms (or explain them)
- Use active voice

### ❌ DON'T:

- Use legal jargon
- Reference regulations by number
- Use passive voice
- Make assumptions about user knowledge
- Use complex sentence structures

## Examples

### Good Definition:

```typescript
{
  term: "SNAP",
  definition: "The Supplemental Nutrition Assistance Program, also called food stamps. It helps people buy groceries.",
  examples: ["You get a card each month to buy food at the grocery store"],
}
```

### Bad Definition:

```typescript
{
  term: "SNAP",
  definition: "A federal assistance program pursuant to the Food and Nutrition Act of 2008 providing nutrition assistance to eligible low-income individuals and families.",
  // Too formal, uses legal language, no examples
}
```

## Testing Definitions

To test definitions for readability:

1. **Read aloud** - Does it sound natural?
2. **Hemingway Editor** - Check reading level at http://hemingwayapp.com
3. **User feedback** - Ask someone unfamiliar with the topic if they understand
4. **Mobile test** - Ensure tooltips work well on small screens

## Source Priority

When creating definitions, use sources in this order:

1. **HR1 Section 71119** - Most authoritative (the actual law)
2. **Service Blueprint** - Implementation guidance from CMS
3. **Domain Knowledge** - Consolidated requirements document
4. **Common knowledge/industry best practices** - For general terms

Always document which source you used in the `source` field.

## Accessibility

The definition system is designed for accessibility:

- **Touch targets**: Info icons are 44px+ for easy tapping
- **Screen readers**: ARIA labels describe each definition
- **Keyboard navigation**: All tooltips are keyboard accessible
- **Mobile-first**: Tooltips work well on small screens

## Future Enhancements

Potential improvements:

- [ ] Add search functionality for definitions
- [ ] Create a glossary page showing all definitions
- [ ] Add audio pronunciations for complex terms
- [ ] Support multiple languages
- [ ] Track which definitions users view most
- [ ] Add "Was this helpful?" feedback for definitions

## Questions?

If you have questions about the definitions system, check:

- The task list: `.kiro/specs/workpath-exemption-screening/tasks.md`
- The design doc: `.kiro/specs/workpath-exemption-screening/design.md`
- The requirements: `.kiro/specs/workpath-exemption-screening/requirements.md`
