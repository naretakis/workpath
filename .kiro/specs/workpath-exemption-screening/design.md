# Design Document: HourKeep - Exemption Screening

**Help Users Determine if They're Exempt from Work Requirements**

---

## Overview

This design adds a self-service exemption screening questionnaire to HourKeep, allowing users to determine if they qualify for an exemption from Medicaid work requirements. The screening follows HR1 Section 71119 criteria and covers all 5 exemption categories. It's accessible from settings and doesn't block the main app functionality.

**Key Design Principles:**

- **Optional**: Never blocks access to the main app
- **Informational**: Results are for user reference, not official determinations
- **Plain Language**: All questions and results in simple, clear language
- **Conditional Logic**: Questions adapt based on previous answers
- **Re-screenable**: Users can retake when circumstances change

---

## Architecture

### High-Level Flow

```
Settings → Start Screening → Questions (5 categories) → Results → Dashboard Badge
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Screening Flow                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ExemptionScreeningPage                                 │
│  ├─ Welcome screen (if first time)                     │
│  ├─ Question flow                                       │
│  └─ Results screen                                      │
│                                                          │
│  QuestionFlow                                           │
│  ├─ Age questions                                       │
│  ├─ Family/caregiving questions                        │
│  ├─ Health/disability questions                        │
│  ├─ Program participation questions                    │
│  └─ Other exemptions questions                         │
│                                                          │
│  ExemptionQuestion                                      │
│  ├─ Question text (plain language)                     │
│  ├─ Help text (if needed)                              │
│  ├─ Answer options (Yes/No or multiple choice)        │
│  └─ Navigation (Back/Next)                             │
│                                                          │
│  ExemptionResults                                       │
│  ├─ Exempt or Not Exempt status                        │
│  ├─ Exemption category (if exempt)                     │
│  ├─ Plain language explanation                         │
│  └─ Next steps guidance                                │
│                                                          │
│  ExemptionCalculator (logic)                           │
│  ├─ Evaluate responses                                  │
│  ├─ Determine exemption status                         │
│  └─ Identify exemption category                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Data Models

### Exemption Screening

```typescript
interface ExemptionScreening {
  id?: number; // Auto-increment ID
  userId: string; // Link to user profile
  screeningDate: Date; // When screening was completed
  responses: ExemptionResponses; // All question responses
  result: ExemptionResult; // Screening outcome
  version: number; // Screening logic version (for future updates)
}

interface ExemptionResponses {
  // Age-based
  dateOfBirth?: Date;
  age?: number; // Calculated

  // Family/caregiving
  isPregnantOrPostpartum?: boolean;
  hasDependentChild13OrYounger?: boolean;
  isParentGuardianOfDisabled?: boolean;

  // Health/disability
  isOnMedicare?: boolean;
  isEligibleForNonMAGI?: boolean;
  isDisabledVeteran?: boolean;
  isMedicallyFrail?: boolean;
  medicallyFrailDetails?: string[]; // Which conditions apply

  // Program participation
  isOnSNAPOrTANFMeetingRequirements?: boolean;
  isInRehabProgram?: boolean;

  // Other
  isIncarceratedOrRecentlyReleased?: boolean;
  hasTribalStatus?: boolean;
}

interface ExemptionResult {
  isExempt: boolean; // Overall result
  exemptionCategory?: ExemptionCategory; // Which category exempts them
  exemptionReason?: string; // Specific reason within category
  explanation: string; // Plain language explanation
  nextSteps: string; // What user should do next
}

type ExemptionCategory =
  | "age"
  | "family-caregiving"
  | "health-disability"
  | "program-participation"
  | "other";
```

### Exemption History

```typescript
interface ExemptionHistory {
  id?: number;
  userId: string;
  screeningDate: Date;
  isExempt: boolean;
  exemptionCategory?: ExemptionCategory;
}
```

---

## Database Schema (IndexedDB)

```typescript
class HourKeepDB extends Dexie {
  profiles!: Table<UserProfile>;
  activities!: Table<Activity>;
  documents!: Table<Document>;
  documentBlobs!: Table<DocumentBlob>;
  exemptions!: Table<ExemptionScreening>; // NEW
  exemptionHistory!: Table<ExemptionHistory>; // NEW

  constructor() {
    super("HourKeepDB");

    // Version 3: Add exemption tables
    this.version(3).stores({
      profiles: "id",
      activities: "++id, date, type",
      documents: "++id, activityId, type, createdAt",
      documentBlobs: "++id",
      exemptions: "++id, userId, screeningDate", // NEW
      exemptionHistory: "++id, userId, screeningDate", // NEW
    });
  }
}
```

---

## Question Flow Logic

### Question Tree

```
START
  │
  ├─ Age Questions
  │   ├─ What is your date of birth?
  │   │   ├─ If ≤18 → EXEMPT (age)
  │   │   ├─ If ≥65 → EXEMPT (age)
  │   │   └─ If 19-64 → Continue
  │
  ├─ Family/Caregiving Questions
  │   ├─ Are you currently pregnant or postpartum?
  │   │   └─ If Yes → EXEMPT (family-caregiving)
  │   ├─ Do you live with a child age 13 or younger?
  │   │   └─ If Yes → EXEMPT (family-caregiving)
  │   ├─ Are you a parent/guardian of someone with a disability?
  │   │   └─ If Yes → EXEMPT (family-caregiving)
  │   └─ If all No → Continue
  │
  ├─ Health/Disability Questions
  │   ├─ Are you on Medicare?
  │   │   └─ If Yes → EXEMPT (health-disability)
  │   ├─ Are you eligible for non-MAGI Medicaid?
  │   │   └─ If Yes → EXEMPT (health-disability)
  │   ├─ Are you a disabled veteran?
  │   │   └─ If Yes → EXEMPT (health-disability)
  │   ├─ Are you medically frail or have special needs?
  │   │   └─ If Yes → EXEMPT (health-disability)
  │   └─ If all No → Continue
  │
  ├─ Program Participation Questions
  │   ├─ Are you on SNAP/TANF and meeting work requirements?
  │   │   └─ If Yes → EXEMPT (program-participation)
  │   ├─ Are you in drug/alcohol rehabilitation?
  │   │   └─ If Yes → EXEMPT (program-participation)
  │   └─ If all No → Continue
  │
  ├─ Other Exemptions Questions
  │   ├─ Are you currently incarcerated or recently released?
  │   │   └─ If Yes → EXEMPT (other)
  │   ├─ Do you have tribal status (Indian, Urban Indian, etc.)?
  │   │   └─ If Yes → EXEMPT (other)
  │   └─ If all No → NOT EXEMPT
  │
END → Show Results
```

### Short-Circuit Logic

- As soon as an exemption is found, stop asking questions
- Show results immediately
- Store all responses for history/re-screening

---

## Key Features Implementation

### 1. Question Flow Component

**Code Location:**

- Component: `src/components/exemptions/QuestionFlow.tsx`
- Logic: `src/lib/exemptions/questions.ts`

**Implementation:**

```typescript
// questions.ts
export const exemptionQuestions = {
  age: {
    id: "age-dob",
    category: "age",
    text: "What is your date of birth?",
    type: "date",
    helpText: "We use this to check if you're exempt based on age.",
    evaluate: (response: Date) => {
      const age = calculateAge(response);
      if (age <= 18) return { exempt: true, reason: "18 or younger" };
      if (age >= 65) return { exempt: true, reason: "65 or older" };
      return { exempt: false };
    },
  },
  familyCaregiving: [
    {
      id: "family-pregnant",
      category: "family-caregiving",
      text: "Are you currently pregnant or postpartum?",
      type: "boolean",
      helpText: "Postpartum means within 60 days after giving birth.",
      evaluate: (response: boolean) =>
        response
          ? { exempt: true, reason: "Pregnant or postpartum" }
          : { exempt: false },
    },
    {
      id: "family-child",
      category: "family-caregiving",
      text: "Do you live in a household with a child age 13 or younger?",
      type: "boolean",
      helpText: "This includes your own children or other dependents.",
      evaluate: (response: boolean) =>
        response
          ? { exempt: true, reason: "Has dependent child 13 or younger" }
          : { exempt: false },
    },
    // ... more questions
  ],
  // ... other categories
};
```

---

### 2. Exemption Calculator

**Code Location:**

- Logic: `src/lib/exemptions/calculator.ts`

**Implementation:**

```typescript
export function calculateExemption(
  responses: ExemptionResponses,
): ExemptionResult {
  // Check age
  if (responses.age !== undefined) {
    if (responses.age <= 18) {
      return {
        isExempt: true,
        exemptionCategory: "age",
        exemptionReason: "18 years old or younger",
        explanation:
          "You are exempt from work requirements because you are 18 or younger.",
        nextSteps:
          "You do not need to track hours. You can still use this app if you want to track your activities.",
      };
    }
    if (responses.age >= 65) {
      return {
        isExempt: true,
        exemptionCategory: "age",
        exemptionReason: "65 years old or older",
        explanation:
          "You are exempt from work requirements because you are 65 or older.",
        nextSteps:
          "You do not need to track hours. You can still use this app if you want to track your activities.",
      };
    }
  }

  // Check family/caregiving
  if (responses.isPregnantOrPostpartum) {
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Pregnant or postpartum",
      explanation:
        "You are exempt from work requirements because you are pregnant or postpartum.",
      nextSteps:
        "You do not need to track hours during this time. You may need to re-screen after your postpartum period ends.",
    };
  }

  // ... check other categories

  // If no exemptions found
  return {
    isExempt: false,
    explanation:
      "Based on your responses, you do not qualify for an exemption from work requirements.",
    nextSteps:
      "You need to track 80 hours per month of work, volunteer, or education activities. Use this app to log your hours and stay compliant.",
  };
}
```

---

### 3. Results Display

**Code Location:**

- Component: `src/components/exemptions/ExemptionResults.tsx`

**UI Design (Exempt):**

```
┌─────────────────────────────────────┐
│  Screening Results                  │
├─────────────────────────────────────┤
│                                     │
│         ✓ You Are Exempt            │
│                                     │
│  You are exempt from work           │
│  requirements because you have a    │
│  child age 13 or younger living     │
│  in your household.                 │
│                                     │
│  What this means:                   │
│  • You do not need to track hours  │
│  • You can still use this app if   │
│    you want to track activities    │
│  • Your exemption may change if    │
│    your circumstances change       │
│                                     │
│  Category: Family/Caregiving        │
│  Screened: March 15, 2024          │
│                                     │
│  [Done]  [Re-screen]                │
│                                     │
└─────────────────────────────────────┘
```

**UI Design (Not Exempt):**

```
┌─────────────────────────────────────┐
│  Screening Results                  │
├─────────────────────────────────────┤
│                                     │
│      You Must Track Hours           │
│                                     │
│  Based on your responses, you do    │
│  not qualify for an exemption.      │
│                                     │
│  What you need to do:               │
│  • Track 80 hours per month of     │
│    work, volunteer, or education   │
│  • OR earn $580 per month          │
│                                     │
│  Use this app to:                   │
│  • Log your daily activities       │
│  • See your monthly total          │
│  • Export data for your agency     │
│                                     │
│  Screened: March 15, 2024          │
│                                     │
│  [Start Tracking]  [Re-screen]      │
│                                     │
└─────────────────────────────────────┘
```

---

### 4. Dashboard Integration

**Code Location:**

- Component: `src/components/tracking/Dashboard.tsx`
- Component: `src/components/exemptions/ExemptionBadge.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│  March 2024                         │
├─────────────────────────────────────┤
│                                     │
│  ✓ Exempt (Family/Caregiving)       │
│  You don't need to track hours      │
│  [View Details]                     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Optional: Track your activities    │
│  anyway for your own records        │
│                                     │
│  [Log Activity]                     │
│                                     │
└─────────────────────────────────────┘
```

**OR (Not Exempt):**

```
┌─────────────────────────────────────┐
│  March 2024                         │
├─────────────────────────────────────┤
│                                     │
│  Must Track Hours                   │
│  [Check if You're Exempt]           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Total Hours: 45 / 80               │
│  [Progress bar]                     │
│                                     │
│  35 hours needed                    │
│                                     │
│  [Log Activity]                     │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. Re-screening

**Flow:**

1. User taps "Re-screen" in settings or results
2. Show confirmation dialog
3. Start new screening
4. Save new results
5. Archive old results in history
6. Update dashboard badge

**Code Location:**

- Component: `src/components/exemptions/RescreenDialog.tsx`

**Implementation:**

```typescript
async function rescreen(userId: string) {
  const db = getDatabase();

  // Get current screening
  const current = await db.exemptions.where("userId").equals(userId).first();

  if (current) {
    // Archive to history
    await db.exemptionHistory.add({
      userId,
      screeningDate: current.screeningDate,
      isExempt: current.result.isExempt,
      exemptionCategory: current.result.exemptionCategory,
    });

    // Delete current
    await db.exemptions.delete(current.id!);
  }

  // Start new screening
  // (handled by navigation to screening page)
}
```

---

## User Interface Components

### New Components

1. **ExemptionScreeningPage.tsx**
   - Main page for screening
   - Handles navigation between questions
   - Shows results

2. **QuestionFlow.tsx**
   - Manages question progression
   - Handles conditional logic
   - Stores responses

3. **ExemptionQuestion.tsx**
   - Displays single question
   - Handles answer input
   - Shows help text

4. **ExemptionResults.tsx**
   - Shows screening results
   - Displays exemption status
   - Provides next steps

5. **ExemptionBadge.tsx**
   - Dashboard badge showing status
   - Links to screening details

6. **ExemptionHistory.tsx**
   - Shows previous screenings
   - Displays dates and results

7. **RescreenDialog.tsx**
   - Confirmation before re-screening
   - Explains what happens

### Modified Components

1. **Dashboard.tsx**
   - Add exemption badge
   - Adjust messaging based on status

2. **Settings.tsx**
   - Add exemption screening option
   - Show current status
   - Link to re-screen

---

## File Structure

```
src/
├── app/
│   └── exemptions/
│       └── page.tsx                   # NEW
├── components/
│   └── exemptions/
│       ├── QuestionFlow.tsx           # NEW
│       ├── ExemptionQuestion.tsx      # NEW
│       ├── ExemptionResults.tsx       # NEW
│       ├── ExemptionBadge.tsx         # NEW
│       ├── ExemptionHistory.tsx       # NEW
│       └── RescreenDialog.tsx         # NEW
├── lib/
│   ├── exemptions/
│   │   ├── questions.ts               # NEW
│   │   └── calculator.ts              # NEW
│   └── storage/
│       ├── db.ts                      # MODIFIED
│       └── exemptions.ts              # NEW
└── types/
    └── exemptions.ts                  # NEW
```

---

## Plain Language Examples

### Good Question Text

✅ "Do you live in a household with a child age 13 or younger?"

✅ "Are you currently pregnant or within 60 days after giving birth?"

✅ "Do you have a serious medical condition that makes it hard to work?"

### Bad Question Text

❌ "Are you a parent or guardian of a dependent child under the age of 14?"

❌ "Are you in the postpartum period as defined by state regulations?"

❌ "Do you meet the criteria for medically frail status per HR1 Section 71119?"

### Good Explanation Text

✅ "You are exempt because you have a young child at home. You don't need to track hours."

✅ "You need to track 80 hours per month of work, volunteer, or education activities."

### Bad Explanation Text

❌ "You qualify for exemption under the family/caregiving category per federal guidelines."

❌ "You are subject to community engagement requirements as an applicable individual."

---

## Error Handling

### Incomplete Screening

```typescript
// If user closes app mid-screening
if (hasIncompleteScreening(userId)) {
  showDialog({
    title: "Resume Screening?",
    message:
      "You started a screening but didn't finish. Would you like to continue where you left off?",
    actions: ["Resume", "Start Over", "Cancel"],
  });
}
```

### Invalid Responses

```typescript
// Validate date of birth
if (!isValidDate(dob) || dob > new Date()) {
  showError("Please enter a valid date of birth.");
  return;
}

// Validate age range
const age = calculateAge(dob);
if (age < 0 || age > 120) {
  showError("Please check your date of birth.");
  return;
}
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] All 5 exemption categories can be reached
- [ ] Short-circuit logic works (stops at first exemption)
- [ ] Back button works correctly
- [ ] Results display correct exemption category
- [ ] Dashboard badge shows correct status
- [ ] Re-screening works and archives old results
- [ ] History shows previous screenings
- [ ] Plain language is clear and understandable
- [ ] Works offline

### Test Scenarios

1. **Age Exempt (18 or younger)**
   - Enter DOB showing age ≤18
   - Should immediately show exempt result
   - Should not ask further questions

2. **Age Exempt (65 or older)**
   - Enter DOB showing age ≥65
   - Should immediately show exempt result

3. **Family/Caregiving Exempt**
   - Age 19-64
   - Answer "Yes" to having child 13 or younger
   - Should show exempt result

4. **Not Exempt**
   - Age 19-64
   - Answer "No" to all questions
   - Should show not exempt result
   - Should explain 80 hours requirement

5. **Re-screening**
   - Complete initial screening
   - Re-screen with different answers
   - Should update status
   - Should archive old result

---

## Migration Strategy

### Database Migration

```typescript
// In db.ts
this.version(3)
  .stores({
    profiles: "id",
    activities: "++id, date, type",
    documents: "++id, activityId, type, createdAt",
    documentBlobs: "++id",
    exemptions: "++id, userId, screeningDate", // NEW
    exemptionHistory: "++id, userId, screeningDate", // NEW
  })
  .upgrade((tx) => {
    console.log("Added exemption tables");
  });
```

### Existing Users

- No data migration needed
- Screening is optional
- Dashboard shows "Check if You're Exempt" prompt

---

## Future Enhancements

**Phase 2:**

- State-specific exemption variations
- Document upload for exemption proof
- Exemption expiration dates
- Automatic re-screening reminders

**Phase 3:**

- Integration with state Medicaid systems
- Verification of exemption claims
- Exemption appeals process

---

## Success Metrics

This design is successful when:

- ✅ Users can complete screening in < 5 minutes
- ✅ Results are clear and understandable
- ✅ Users know whether they need to track hours
- ✅ Re-screening works smoothly
- ✅ Dashboard badge is visible and helpful
- ✅ No user confusion about exemption status

---

## Notes

- Screening is informational only; not an official determination
- Users should verify with their state Medicaid agency
- Some exemptions (e.g., medically frail) may require professional assessment
- Consider adding disclaimer about unofficial nature of screening
- Plain language is critical for user understanding
- Avoid legal jargon and acronyms
