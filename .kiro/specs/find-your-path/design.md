# Design Document: Find Your Path

**Unified Assessment Flow for Compliance Method Recommendation**

---

## Overview

Find Your Path is a comprehensive assessment system that guides Medicaid beneficiaries to the easiest viable compliance method. It addresses the core user problem of decision paralysis by combining exemption screening with work situation analysis to provide personalized, actionable recommendations.

### Problem Statement

User testing revealed that beneficiaries are confused about which compliance method to use. They face questions like:
- Should I do exemption screening?
- Should I track hours or income?
- What if I can do both?
- Is income tracking easier?
- Should I do seasonal income tracking?

This confusion leads to:
- Delayed engagement with the app
- Suboptimal method selection
- Increased burden on users
- Lower compliance rates

### Solution Approach

Create a unified assessment flow that:
1. Checks exemption status first (easiest path)
2. Assesses work situation if not exempt
3. Calculates which compliance method is easiest
4. Provides clear recommendation with reasoning
5. Allows flexibility to switch methods anytime

### Key Design Principles

- **Compliance-first**: Guide users to whatever actually works
- **Suggestive, not directive**: Recommend but don't force
- **No data loss**: Switching methods preserves all data
- **Resumable**: Save progress automatically
- **Plain language**: Conversational, not legal
- **Mobile-optimized**: One question per screen
- **Flexible**: Re-assess anytime circumstances change

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Find Your Path System                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Assessment  │  │ Recommendation│  │   Dashboard  │      │
│  │     Flow     │─▶│    Engine     │─▶│  Integration │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                   │             │
│         ▼                  ▼                   ▼             │
│  ┌──────────────────────────────────────────────────┐      │
│  │           IndexedDB Storage Layer                 │      │
│  │  - Assessment Progress                            │      │
│  │  - Assessment Results                             │      │
│  │  - Assessment History                             │      │
│  └──────────────────────────────────────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User → Entry Point → Assessment Flow → Recommendation Engine → Results Display
                           ↓                      ↓                    ↓
                    Progress Storage      Result Storage      Dashboard Update
```

---

## Components and Interfaces

### 1. Assessment Flow Component

**Purpose**: Multi-step wizard that guides users through questions

**Key Features**:
- Progress indicator with visual bar
- Back/forward navigation
- Auto-save on every answer
- Conditional branching logic
- Prepopulation for re-assessment

**Component Structure**:

```typescript
interface AssessmentFlowProps {
  onComplete: (responses: AssessmentResponses, recommendation: Recommendation) => void;
  initialResponses?: AssessmentResponses; // For re-assessment
  userId: string;
}

interface AssessmentFlowState {
  currentStep: number;
  totalSteps: number;
  responses: AssessmentResponses;
  progressPercentage: number;
}
```

**Question Types**:
- Single choice (radio buttons)
- Multiple choice (checkboxes)
- Number input (hours, income)
- Date input (date of birth)
- Yes/No/Not Sure

**Navigation Logic**:
- Linear progression with conditional skips
- Back button available on all questions except first
- Progress saved on every answer
- Auto-advance on answer selection (except last question)

### 2. Recommendation Engine

**Purpose**: Calculates optimal compliance method based on responses

**Input**: Complete AssessmentResponses object

**Output**: Recommendation object with method, reasoning, and alternatives

**Recommendation Logic**:

```typescript
interface RecommendationEngine {
  calculate(responses: AssessmentResponses): Recommendation;
}

interface Recommendation {
  primaryMethod: ComplianceMethod;
  reasoning: string;
  alternativeMethods: ComplianceMethod[];
  complianceStatus: 'compliant' | 'needs-increase' | 'unknown';
  estimatedEffort: 'low' | 'medium' | 'high';
}

type ComplianceMethod = 
  | 'exemption'
  | 'income-tracking'
  | 'seasonal-income-tracking'
  | 'hour-tracking';
```

**Decision Tree**:

```
1. Check exemption status
   └─ If exempt → Recommend exemption (done)

2. If not exempt, calculate compliance paths:
   a. Income path viable? (monthly income ≥ $580)
      └─ Yes → Recommend income tracking
   
   b. Seasonal income path viable? (6-month avg ≥ $580)
      └─ Yes → Recommend seasonal income tracking
   
   c. Hour path viable? (total monthly hours ≥ 80)
      └─ Yes → Recommend hour tracking
   
   d. None viable?
      └─ Recommend hour tracking + explain need to increase activities

3. If multiple paths viable:
   └─ Priority: income > seasonal income > hours
   └─ Reasoning: Ease of documentation
```

**Effort Estimation**:
- **Low**: Exemption, income tracking with steady job
- **Medium**: Seasonal income, hour tracking with single activity
- **High**: Hour tracking with multiple activities

### 3. Dashboard Integration

**Purpose**: Display assessment status and results prominently

**Badge Types**:

```typescript
interface AssessmentBadge {
  type: 'not-started' | 'exempt' | 'recommended-method';
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onClick: () => void;
}
```

**Badge States**:

1. **Not Started**:
   - Title: "Find Your Path"
   - Subtitle: "Discover the easiest way to stay compliant"
   - Action: Navigate to assessment

2. **Exempt**:
   - Title: "You're Exempt"
   - Subtitle: "{exemption category}"
   - Action: View exemption details

3. **Recommended Method**:
   - Title: "Recommended: {method}"
   - Subtitle: "Based on your assessment"
   - Action: View recommendation details

**Dashboard Layout**:

```
┌─────────────────────────────────────┐
│  Assessment Badge (prominent)       │
│  ┌───────────────────────────────┐ │
│  │ [Icon] Find Your Path         │ │
│  │ Discover the easiest way...   │ │
│  └───────────────────────────────┘ │
│                                     │
│  Current Compliance Status          │
│  (existing bar graphs)              │
│                                     │
│  Quick Actions                      │
│  (existing buttons)                 │
└─────────────────────────────────────┘
```

### 4. Progress Storage System

**Purpose**: Save assessment progress for resumption

**Storage Strategy**:
- Save to IndexedDB on every answer
- Separate table for in-progress vs completed assessments
- Timestamp for staleness detection

```typescript
interface AssessmentProgress {
  id?: number;
  userId: string;
  startedAt: Date;
  lastUpdatedAt: Date;
  currentStep: number;
  responses: Partial<AssessmentResponses>;
  isComplete: boolean;
}
```

**Resume Logic**:
- If incomplete progress exists and < 24 hours old → Resume
- If incomplete progress exists and > 24 hours old → Offer to resume or restart
- If complete assessment exists → Show results, offer re-assessment

### 5. Estimation Tools

**Purpose**: Help users convert weekly to monthly values

**Tool Types**:

1. **Hours Converter**:
   ```typescript
   function weeklyToMonthlyHours(weeklyHours: number): number {
     return Math.round(weeklyHours * 4.33);
   }
   ```

2. **Income Converter**:
   ```typescript
   function paycheckToMonthlyIncome(
     paycheckAmount: number,
     frequency: PayFrequency
   ): number {
     const multipliers = {
       weekly: 4.33,
       biweekly: 2.17,
       monthly: 1,
     };
     return Math.round(paycheckAmount * multipliers[frequency]);
   }
   ```

**UI Pattern**:
- Link below input: "I only know my weekly hours"
- Expands inline calculator
- Auto-fills main input with result
- User can still manually edit

---

## Data Models

### Assessment Responses

```typescript
interface AssessmentResponses {
  // Notice question
  receivedAgencyNotice?: boolean;
  
  // Exemption responses (from existing ExemptionResponses)
  exemption: ExemptionResponses;
  
  // Work situation
  hasJob?: boolean;
  paymentFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'varies' | 'not-sure';
  monthlyIncome?: number;
  monthlyWorkHours?: number;
  isSeasonalWork?: boolean;
  
  // Other activities
  otherActivities?: {
    volunteer?: boolean;
    school?: boolean;
    workProgram?: boolean;
  };
  volunteerHoursPerMonth?: number;
  schoolHoursPerMonth?: number;
  workProgramHoursPerMonth?: number;
}
```

### Assessment Result

```typescript
interface AssessmentResult {
  id?: number;
  userId: string;
  completedAt: Date;
  responses: AssessmentResponses;
  recommendation: Recommendation;
  version: number; // Logic version for future updates
}
```

### Assessment History Entry

```typescript
interface AssessmentHistoryEntry {
  id?: number;
  userId: string;
  completedAt: Date;
  exemptionStatus: boolean;
  recommendedMethod: ComplianceMethod;
  // Simplified for history view
}
```

---

## Database Schema

### New Tables

```typescript
// In db.ts
class HourKeepDB extends Dexie {
  // ... existing tables ...
  
  assessmentProgress!: Table<AssessmentProgress>;
  assessmentResults!: Table<AssessmentResult>;
  assessmentHistory!: Table<AssessmentHistoryEntry>;
}

// Schema definition
this.version(6).stores({
  // ... existing stores ...
  assessmentProgress: '++id, userId, lastUpdatedAt, isComplete',
  assessmentResults: '++id, userId, completedAt',
  assessmentHistory: '++id, userId, completedAt',
});
```

### Data Relationships

```
User Profile (1) ─── (0..1) Assessment Progress (in-progress)
                 └── (0..1) Assessment Result (current)
                 └── (0..*) Assessment History (historical)
```

### Migration Strategy

- Version 6 adds new tables
- Existing exemption data remains in place
- No migration of existing exemption screenings to new format
- Users with existing exemptions will see prompt to complete full assessment

---

## User Interface Design

### Assessment Flow Screens

#### 1. Introduction Screen

```
┌─────────────────────────────────────┐
│ ← Back to Home                      │
│                                     │
│ Find Your Path                      │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Let's find the easiest way for  ││
│ │ you to stay compliant with      ││
│ │ Medicaid work requirements.     ││
│ │                                 ││
│ │ This will take about 5 minutes. ││
│ └─────────────────────────────────┘│
│                                     │
│ [Get Started]  [Skip for Now]      │
└─────────────────────────────────────┘
```

#### 2. Question Screen (Example: Job Status)

```
┌─────────────────────────────────────┐
│ ← Back                              │
│                                     │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 40%          │
│ Step 4 of 10                        │
│                                     │
│ Do you currently have a job?        │
│                                     │
│ ○ Yes                               │
│ ○ No                                │
│ ○ Sometimes                         │
│                                     │
│ [Continue]                          │
└─────────────────────────────────────┘
```

#### 2b. Question Screen (Example: Activity Hours)

```
┌─────────────────────────────────────┐
│ ← Back                              │
│                                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 85%          │
│ Step 9 of 10                        │
│                                     │
│ How many hours per month do you     │
│ volunteer?                          │
│                                     │
│ [_______] hours                     │
│                                     │
│ ▼ I only know my weekly hours       │
│                                     │
│ ○ Not sure                          │
│                                     │
│ [Continue]                          │
└─────────────────────────────────────┘
```

#### 3. Estimation Tool (Expanded)

```
┌─────────────────────────────────────┐
│ About how much do you earn per      │
│ month?                              │
│                                     │
│ $ [_______]                         │
│                                     │
│ ▼ I only know my paycheck amount   │
│ ┌─────────────────────────────────┐│
│ │ Paycheck amount: $ [_____]      ││
│ │ How often paid: [Biweekly ▼]    ││
│ │                                 ││
│ │ Monthly income: $1,300          ││
│ │ [Use This Amount]               ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### 4. Recommendation Screen

```
┌─────────────────────────────────────┐
│ Your Recommended Path               │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 💰 Income Tracking              ││
│ │                                 ││
│ │ Based on your answers, income   ││
│ │ tracking is your easiest path.  ││
│ │                                 ││
│ │ Why? You earn $650/month, so    ││
│ │ you can submit one paystub to   ││
│ │ show compliance instead of      ││
│ │ tracking hours daily.           ││
│ └─────────────────────────────────┘│
│                                     │
│ Other methods available:            │
│ • Hour tracking                     │
│                                     │
│ ℹ️ You can switch methods anytime   │
│    without losing data              │
│                                     │
│ [Start Income Tracking]             │
│ [See All Methods]                   │
└─────────────────────────────────────┘
```

### Dashboard Badge Designs

#### Not Started Badge

```
┌─────────────────────────────────────┐
│ 🧭 Find Your Path                   │
│ Discover the easiest way to stay    │
│ compliant                           │
│                                     │
│ [Take Assessment →]                 │
└─────────────────────────────────────┘
```

#### Exempt Badge

```
┌─────────────────────────────────────┐
│ ✓ You're Exempt                     │
│ Family/Caregiving                   │
│                                     │
│ [View Details] [Retake Assessment]  │
└─────────────────────────────────────┘
```

#### Recommended Method Badge

```
┌─────────────────────────────────────┐
│ 💰 Recommended: Income Tracking     │
│ Based on your assessment            │
│                                     │
│ [View Details] [Retake Assessment]  │
└─────────────────────────────────────┘
```

---

## Question Flow Logic

### Complete Question Sequence

```
1. Introduction
   ↓
2. Notice Question
   "Have you received a notice from your Medicaid agency?"
   → Yes → Offer skip to work questions
   → No/Not sure → Continue to exemptions
   ↓
3-7. Exemption Questions (5 categories)
   → If exempt → Skip to results
   → If not exempt → Continue to work questions
   ↓
8. Job Status
   "Do you currently have a job?"
   → No → Skip to activities
   → Yes/Sometimes → Continue
   ↓
9. Payment Frequency
   "How often do you get paid?"
   ↓
10. Monthly Income
    "About how much do you earn per month?"
    (with estimation tool)
    ↓
11. Monthly Work Hours
    "About how many hours per month do you work?"
    (with estimation tool)
    ↓
12. Seasonal Work
    "Is your work seasonal?"
    ↓
13. Other Activities
    "Do you do any of these?" (checkboxes)
    → If none selected → Skip to results
    → If selected → Continue
    ↓
14. Activity Hours (separate question for each selected activity)
    "How many hours per month do you volunteer?"
    "How many hours per month do you attend school?"
    "How many hours per month do you participate in work programs?"
    ↓
15. Results
```

### Conditional Logic

```typescript
function getNextStep(
  currentStep: number,
  responses: Partial<AssessmentResponses>
): number {
  // Notice question branching
  if (currentStep === 2 && responses.receivedAgencyNotice === true) {
    // User can choose to skip exemptions
    return userChoice === 'skip' ? 8 : 3;
  }
  
  // Exemption early exit
  if (currentStep >= 3 && currentStep <= 7) {
    if (isExempt(responses.exemption)) {
      return 15; // Jump to results
    }
  }
  
  // Job status branching
  if (currentStep === 8 && responses.hasJob === false) {
    return 13; // Skip to activities
  }
  
  // Activities branching
  if (currentStep === 13) {
    const hasActivities = Object.values(responses.otherActivities || {})
      .some(v => v === true);
    return hasActivities ? 14 : 15;
  }
  
  // Default: next step
  return currentStep + 1;
}
```

---

## Error Handling

### Validation Rules

```typescript
interface ValidationRule {
  field: keyof AssessmentResponses;
  validate: (value: any) => boolean;
  errorMessage: string;
}

const validationRules: ValidationRule[] = [
  {
    field: 'monthlyIncome',
    validate: (v) => v === undefined || (v >= 0 && v <= 100000),
    errorMessage: 'Please enter a valid income amount',
  },
  {
    field: 'monthlyWorkHours',
    validate: (v) => v === undefined || (v >= 0 && v <= 744), // Max hours in month
    errorMessage: 'Please enter valid hours (0-744)',
  },
  // ... more rules
];
```

### Error States

1. **Invalid Input**: Show inline error message, prevent advancement
2. **Storage Failure**: Show alert, allow retry
3. **Calculation Error**: Log error, show generic message, allow manual method selection
4. **Resume Failure**: Offer to restart assessment

### Recovery Strategies

- **Auto-save failures**: Retry 3 times with exponential backoff
- **Calculation errors**: Fall back to showing all methods without recommendation
- **Missing data**: Use "Not sure" as default, provide general guidance

---

## Testing Strategy

### Manual Testing Focus

Given MVP approach, focus on:

1. **Happy Path Testing**:
   - Complete assessment from start to finish
   - Verify recommendation matches expected logic
   - Confirm data saves correctly

2. **Navigation Testing**:
   - Back button preserves answers
   - Progress indicator updates correctly
   - Skip functionality works

3. **Edge Cases**:
   - All "Not sure" answers
   - Exempt on first question
   - Multiple viable methods
   - No viable methods

4. **Integration Testing**:
   - Dashboard badge displays correctly
   - Re-assessment prepopulates answers
   - Method switching preserves data
   - Export includes assessment data

5. **Mobile Testing**:
   - Touch targets adequate size
   - Keyboard behavior correct
   - Progress bar visible
   - Scrolling works properly

### Test Scenarios

```typescript
// Example test scenarios
const testScenarios = [
  {
    name: 'Exempt - Age',
    responses: { exemption: { dateOfBirth: new Date('1950-01-01') } },
    expected: { method: 'exemption', category: 'age' }
  },
  {
    name: 'Income Tracking - Steady Job',
    responses: { 
      hasJob: true,
      monthlyIncome: 650,
      monthlyWorkHours: 90
    },
    expected: { method: 'income-tracking', reasoning: 'steady income' }
  },
  {
    name: 'Hour Tracking - Multiple Activities',
    responses: {
      hasJob: true,
      monthlyIncome: 400,
      monthlyWorkHours: 50,
      otherActivities: { volunteer: true },
      volunteerHoursPerMonth: 35
    },
    expected: { method: 'hour-tracking', reasoning: 'combined activities' }
  },
  // ... more scenarios
];
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**:
   - Load question components on demand
   - Defer non-critical calculations

2. **Debouncing**:
   - Debounce auto-save by 500ms
   - Debounce estimation tool calculations by 300ms

3. **Caching**:
   - Cache recommendation calculation results
   - Cache formatted strings

4. **IndexedDB Performance**:
   - Batch writes where possible
   - Use transactions for related updates
   - Index on userId and completedAt

### Performance Targets

- Question transition: < 100ms
- Auto-save: < 200ms
- Recommendation calculation: < 500ms
- Dashboard badge render: < 50ms

---

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**:
   - All questions keyboard accessible
   - Tab order logical
   - Enter/Space to select options
   - Escape to go back

2. **Screen Reader Support**:
   - Progress announcements
   - Error announcements
   - Clear labels for all inputs
   - ARIA live regions for dynamic content

3. **Visual Design**:
   - Color contrast ratio ≥ 4.5:1
   - Focus indicators visible
   - Touch targets ≥ 44x44px
   - Text resizable to 200%

4. **Content**:
   - Plain language (8th grade reading level)
   - Clear instructions
   - Helpful error messages
   - Alternative text for icons

### Accessibility Testing

- Test with VoiceOver (iOS)
- Test with TalkBack (Android)
- Test keyboard-only navigation
- Test with 200% zoom
- Test with high contrast mode

---

## Security and Privacy

### Data Protection

1. **Local Storage Only**:
   - All assessment data stays on device
   - No transmission to external servers
   - IndexedDB encrypted at rest (OS-level)

2. **Sensitive Data Handling**:
   - Date of birth stored securely
   - Health information never transmitted
   - Income data never shared

3. **User Control**:
   - Users can delete assessment data
   - Users can export their data
   - Clear privacy notices

### Privacy Notices

Display before assessment:
- "Your answers stay on your device"
- "We don't share your information"
- "You can delete your data anytime"

---

## Integration Points

### Replacing Existing Exemption Screening

**Important**: Find Your Path completely replaces the standalone exemption screening feature.

**Migration Strategy**:
1. Remove `/exemptions` route and page
2. Remove exemption screening entry point from settings
3. Redirect any existing links to Find Your Path assessment
4. Preserve existing exemption data in database (for history)
5. Update navigation to remove exemption screening option
6. Remove the old help popup (already planned in requirements)

**Data Preservation**:
- Existing `exemptions` and `exemptionHistory` tables remain in database
- Historical exemption screenings are viewable in assessment history
- No data loss for users who previously completed exemption screening

**User Experience**:
- Users who previously completed exemption screening will see prompt to complete full assessment
- Assessment will show their exemption status if still applicable
- Exemption results are now part of the broader Find Your Path recommendation

### Existing Features

1. **Exemption Logic** (integrated, not separate):
   - Reuse ExemptionResponses type
   - Reuse exemption determination logic
   - Integrate exemption results into recommendation

2. **Hour Tracking**:
   - Link from recommendation
   - No changes to tracking logic
   - Preserve existing data

3. **Income Tracking**:
   - Link from recommendation
   - No changes to tracking logic
   - Preserve existing data

4. **Seasonal Income**:
   - Link from recommendation
   - No changes to tracking logic
   - Preserve existing data

5. **Dashboard**:
   - Add assessment badge component
   - Integrate with existing layout
   - Maintain existing compliance displays

6. **Settings**:
   - Add "Retake Assessment" option
   - Add "View Assessment History"
   - Link to method switching

### Future Export System

Structure assessment data for export:

```typescript
interface AssessmentExportData {
  completedAt: string;
  exemptionStatus: boolean;
  exemptionCategory?: string;
  recommendedMethod: string;
  reasoning: string;
  workSituation: {
    hasJob: boolean;
    monthlyIncome?: number;
    monthlyHours?: number;
    isSeasonalWork?: boolean;
  };
  activities: {
    volunteer?: number;
    school?: number;
    workProgram?: number;
  };
}
```

---

## Deployment Considerations

### Rollout Strategy

1. **Phase 1**: Deploy to test environment
2. **Phase 2**: User testing with 5-10 beneficiaries
3. **Phase 3**: Iterate based on feedback
4. **Phase 4**: Deploy to production
5. **Phase 5**: Monitor usage and errors

### Monitoring

Track (locally, no analytics):
- Assessment completion rate
- Average time to complete
- Most common recommendations
- Re-assessment frequency
- Error occurrences

### Rollback Plan

If critical issues found:
1. Disable assessment entry point
2. Revert to previous help popup
3. Fix issues
4. Redeploy

---

## Future Enhancements

### Not in MVP, Consider Later

1. **Smart Suggestions**:
   - Monitor actual tracking behavior
   - Suggest method switch if current not working
   - "You haven't logged income in 2 weeks, try hour tracking?"

2. **Circumstance Change Detection**:
   - Prompt re-assessment when patterns change
   - "Your hours dropped, check if you're now exempt"

3. **State-Specific Variations**:
   - Adjust thresholds by state
   - State-specific exemptions
   - State-specific language

4. **Document Upload During Assessment**:
   - Upload verification documents
   - Link documents to assessment
   - Pre-populate from documents

5. **Household Assessment**:
   - Assess multiple household members
   - Coordinate compliance strategies
   - Shared activity tracking

6. **Exemption Expiration Tracking**:
   - Track temporary exemptions
   - Remind when exemption expires
   - Prompt re-assessment

---

## Technical Debt and Limitations

### Known Limitations

1. **No Server-Side Validation**:
   - All validation client-side
   - No verification of claims
   - Relies on user honesty

2. **Simple Recommendation Logic**:
   - Doesn't account for all edge cases
   - May not optimize for user preferences
   - No machine learning

3. **No Analytics**:
   - Can't track aggregate patterns
   - Can't identify common pain points
   - Limited improvement insights

4. **Single User Focus**:
   - Doesn't handle household scenarios
   - No coordination between family members

### Technical Debt to Address

1. **Exemption Logic Duplication**:
   - Currently duplicated between old and new systems
   - Should consolidate in future refactor

2. **Hard-Coded Thresholds**:
   - $580 and 80 hours hard-coded
   - Should be configurable for state variations

3. **Limited Internationalization**:
   - English only
   - Should support Spanish in future

---

## Success Metrics

### Qualitative Metrics

- Users report less confusion about which method to use
- Users feel confident in their choice
- Users understand why a method is recommended
- Users successfully complete assessment

### Quantitative Metrics (if tracking added)

- % of users who complete assessment
- % of users who follow recommendation
- % of users who switch methods
- Average time to complete assessment
- Re-assessment frequency

### MVP Success Criteria

- Assessment flow works end-to-end
- Recommendations are accurate for test scenarios
- Dashboard integration is clear and helpful
- Users can re-assess with prepopulated answers
- No data loss when switching methods
- Mobile experience is smooth and intuitive

---

## Conclusion

Find Your Path transforms the user experience from confusing and overwhelming to guided and supportive. By combining exemption screening with work situation analysis, we provide personalized recommendations that help users choose the easiest viable compliance method.

The design prioritizes:
- **User agency**: Suggest, don't force
- **Flexibility**: Switch anytime, no data loss
- **Simplicity**: Plain language, clear reasoning
- **Reliability**: Auto-save, resumable, error-tolerant

This MVP focuses on core functionality that directly addresses user confusion, setting the foundation for future enhancements like smart suggestions and circumstance change detection.
