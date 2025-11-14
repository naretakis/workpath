# Requirements Document: Find Your Path

**Guide Users to the Easiest Viable Compliance Method**

---

## Introduction

This feature creates a unified assessment flow that helps Medicaid beneficiaries understand the easiest way to maintain their coverage. Users are often confused about which compliance method to use (exemption, hour tracking, income tracking, or seasonal income tracking). Find Your Path combines exemption screening with work situation assessment to provide personalized recommendations, reducing decision paralysis and helping users choose the most appropriate and least burdensome compliance method.

The assessment integrates and expands the existing exemption screening functionality, adding questions about work situation, income, and activities to intelligently route users to their optimal compliance path. The feature is designed to be suggestive rather than directive, allowing users to explore alternatives while providing clear guidance.

## Glossary

- **Find Your Path**: The unified assessment flow that determines exemption status and recommends the easiest compliance method
- **Assessment**: The complete questionnaire including exemption screening and work situation questions
- **Compliance Method**: One of four ways to maintain Medicaid eligibility (exemption, hour tracking, income tracking, seasonal income tracking)
- **Recommendation**: The system's suggestion for which compliance method is easiest for the user's situation
- **Re-assessment**: The ability to retake the assessment when circumstances change, with previous answers prepopulated
- **Work Situation**: The user's employment status, income level, and activity participation
- **Estimation Tool**: Simple calculators that help users convert weekly to monthly values
- **Progress State**: Saved answers that allow users to resume an incomplete assessment
- **Notice**: Official communication from Medicaid agency informing user they must track work requirements
- **Assessment Badge**: Dashboard element showing exemption status and recommended method

---

## Requirements

### Requirement 1: Present Assessment After Onboarding

**User Story:** As a new user, I want to be guided to the assessment after onboarding, so I can quickly understand how to use the app.

#### Acceptance Criteria

1. WHEN I complete initial onboarding THEN THE System SHALL display the Find Your Path introduction screen
2. WHEN I view the introduction screen THEN THE System SHALL display a clear explanation of what the assessment will help me determine
3. WHEN I view the introduction screen THEN THE System SHALL display "Get Started" and "Skip for Now" buttons
4. WHEN I tap "Get Started" THEN THE System SHALL begin the assessment
5. WHEN I tap "Skip for Now" THEN THE System SHALL navigate to the income tracking dashboard
6. WHEN I skip the assessment THEN THE System SHALL display an assessment badge on the dashboard prompting me to complete it

---

### Requirement 2: Screen for Agency Notice

**User Story:** As a user who received a notice from my Medicaid agency, I want to indicate this upfront, so I can skip to compliance methods if I know I'm not exempt.

#### Acceptance Criteria

1. WHEN I start the assessment THEN THE System SHALL ask if I have received a notice from my Medicaid agency about work requirements
2. WHEN I view the notice question THEN THE System SHALL display helper text explaining what the notice might mention
3. WHEN I answer "Yes" to the notice question THEN THE System SHALL display a message explaining that my agency has determined I need to track work requirements
4. WHEN I answer "Yes" to the notice question THEN THE System SHALL offer two options: "Check if I'm exempt anyway" or "Skip to finding my compliance method"
5. WHEN I choose "Check if I'm exempt anyway" THEN THE System SHALL continue to exemption screening questions
6. WHEN I choose "Skip to finding my compliance method" THEN THE System SHALL skip to work situation questions
7. WHEN I answer "No" or "I'm not sure" to the notice question THEN THE System SHALL continue to exemption screening questions

---

### Requirement 3: Conduct Exemption Screening

**User Story:** As a user, I want to be screened for exemptions, so I know if I qualify to avoid tracking requirements.

#### Acceptance Criteria

1. WHEN exemption screening begins THEN THE System SHALL ask age-based exemption questions
2. WHEN I qualify for an age-based exemption THEN THE System SHALL determine I am exempt and skip to results
3. WHEN I do not qualify for age-based exemption THEN THE System SHALL ask family/caregiving exemption questions
4. WHEN I qualify for a family/caregiving exemption THEN THE System SHALL determine I am exempt and skip to results
5. WHEN I do not qualify for family/caregiving exemption THEN THE System SHALL ask health/disability exemption questions
6. WHEN I qualify for a health/disability exemption THEN THE System SHALL determine I am exempt and skip to results
7. WHEN I do not qualify for health/disability exemption THEN THE System SHALL ask program participation exemption questions
8. WHEN I qualify for a program participation exemption THEN THE System SHALL determine I am exempt and skip to results
9. WHEN I do not qualify for program participation exemption THEN THE System SHALL ask other exemption questions
10. WHEN I qualify for other exemptions THEN THE System SHALL determine I am exempt and skip to results
11. WHEN I do not qualify for any exemptions THEN THE System SHALL continue to work situation questions

---

### Requirement 4: Assess Work Situation

**User Story:** As a user who is not exempt, I want to answer questions about my work situation, so the system can recommend the easiest compliance method.

#### Acceptance Criteria

1. WHEN I am not exempt THEN THE System SHALL ask if I currently have a job
2. WHEN I answer "Yes" or "Sometimes" to having a job THEN THE System SHALL ask how often I get paid
3. WHEN I view the payment frequency question THEN THE System SHALL offer options: Weekly, Biweekly, Monthly, Varies, Not sure
4. WHEN I answer the payment frequency question THEN THE System SHALL ask about my average monthly income
5. WHEN I view the monthly income question THEN THE System SHALL provide an input field for dollar amount and a "Not sure" option
6. WHEN I answer the monthly income question THEN THE System SHALL ask about my average monthly work hours
7. WHEN I view the monthly work hours question THEN THE System SHALL provide an input field for hours and a "Not sure" option
8. WHEN I answer the monthly work hours question THEN THE System SHALL ask if my work is seasonal
9. WHEN I answer "No" to having a job THEN THE System SHALL skip payment and income questions and proceed to activities questions

---

### Requirement 5: Assess Other Activities

**User Story:** As a user who is not exempt, I want to indicate other qualifying activities, so the system can factor them into the recommendation.

#### Acceptance Criteria

1. WHEN work situation questions are complete THEN THE System SHALL ask if I do any other qualifying activities
2. WHEN I view the activities question THEN THE System SHALL display checkboxes for: Volunteer work, Attending school, Work program
3. WHEN I select one or more activities THEN THE System SHALL ask for average monthly hours for each selected activity
4. WHEN I view the activity hours question THEN THE System SHALL provide an input field for hours and a "Not sure" option for each activity
5. WHEN I complete activity questions THEN THE System SHALL proceed to calculate recommendation

---

### Requirement 6: Provide Estimation Tools

**User Story:** As a user who only knows my weekly hours or income, I want help converting to monthly values, so I can answer the questions accurately.

#### Acceptance Criteria

1. WHEN I view a monthly hours question THEN THE System SHALL display a link "I only know my weekly hours"
2. WHEN I tap the weekly hours link THEN THE System SHALL display a simple calculator
3. WHEN I enter weekly hours in the calculator THEN THE System SHALL multiply by 4.33 and display the monthly equivalent
4. WHEN I view a monthly income question THEN THE System SHALL display a link "I only know my paycheck amount"
5. WHEN I tap the paycheck link THEN THE System SHALL display a calculator based on payment frequency
6. WHEN I enter paycheck amount and frequency THEN THE System SHALL calculate and display monthly income equivalent

---

### Requirement 7: Calculate Compliance Method Recommendation

**User Story:** As a user who completed the assessment, I want to receive a personalized recommendation, so I know the easiest way to maintain compliance.

#### Acceptance Criteria

1. WHEN I am exempt THEN THE System SHALL recommend exemption status as the compliance method
2. WHEN I am not exempt and my monthly income is $580 or more THEN THE System SHALL recommend income tracking
3. WHEN I am not exempt and my work is seasonal and my 6-month average income is $580 or more THEN THE System SHALL recommend seasonal income tracking
4. WHEN I am not exempt and my total monthly hours across all activities is 80 or more THEN THE System SHALL recommend hour tracking
5. WHEN I am not exempt and multiple methods are viable THEN THE System SHALL prioritize: income tracking > seasonal income tracking > hour tracking
6. WHEN I am not exempt and no method shows current compliance THEN THE System SHALL recommend hour tracking with explanation that activities need to increase
7. WHEN I answered "Not sure" to key questions THEN THE System SHALL provide a general recommendation with explanation that more information would help

---

### Requirement 8: Display Recommendation Results

**User Story:** As a user who completed the assessment, I want to see clear results with reasoning, so I understand why a method is recommended.

#### Acceptance Criteria

1. WHEN the assessment is complete THEN THE System SHALL display a recommendation screen
2. WHEN I view the recommendation screen THEN THE System SHALL display the recommended compliance method prominently
3. WHEN I view the recommendation screen THEN THE System SHALL display a clear explanation of why this method is recommended for my situation
4. WHEN I view the recommendation screen THEN THE System SHALL mention alternative methods if applicable
5. WHEN I view the recommendation screen THEN THE System SHALL display a primary action button for the recommended method
6. WHEN I view the recommendation screen THEN THE System SHALL display a secondary link to "See All Methods"
7. WHEN I tap the primary action button THEN THE System SHALL navigate to the dashboard with the recommended method active
8. WHEN I tap "See All Methods" THEN THE System SHALL display all available compliance methods with brief descriptions

---

### Requirement 9: Implement Multi-Step Wizard Navigation

**User Story:** As a user taking the assessment, I want to navigate through questions easily, so I can review or change my answers.

#### Acceptance Criteria

1. WHEN I am in the assessment THEN THE System SHALL display a progress indicator showing my position in the flow
2. WHEN I view the progress indicator THEN THE System SHALL show a visual progress bar
3. WHEN I answer a question THEN THE System SHALL automatically advance to the next question
4. WHEN I am on any question except the first THEN THE System SHALL display a "Back" button
5. WHEN I tap "Back" THEN THE System SHALL return to the previous question with my previous answer pre-selected
6. WHEN I navigate backward and forward THEN THE System SHALL retain all my answers
7. WHEN I am on the last question THEN THE System SHALL display a "See Results" button instead of auto-advancing

---

### Requirement 10: Save Assessment Progress

**User Story:** As a user taking the assessment, I want my progress saved automatically, so I can resume if I exit the app.

#### Acceptance Criteria

1. WHEN I answer any question THEN THE System SHALL save my answer to IndexedDB immediately
2. WHEN I exit the assessment before completion THEN THE System SHALL save my progress state
3. WHEN I return to the assessment THEN THE System SHALL resume from where I left off with all previous answers intact
4. WHEN I complete the assessment THEN THE System SHALL mark the progress state as complete
5. WHEN I start a re-assessment THEN THE System SHALL create a new progress state while preserving the completed assessment

---

### Requirement 11: Store Assessment Results

**User Story:** As a user who completed the assessment, I want my results saved, so I don't have to retake it every time I open the app.

#### Acceptance Criteria

1. WHEN the assessment is complete THEN THE System SHALL store all assessment answers in IndexedDB
2. WHEN the assessment is complete THEN THE System SHALL store the exemption determination in IndexedDB
3. WHEN the assessment is complete THEN THE System SHALL store the recommended compliance method in IndexedDB
4. WHEN the assessment is complete THEN THE System SHALL store the recommendation reasoning in IndexedDB
5. WHEN the assessment is complete THEN THE System SHALL store the assessment completion date in IndexedDB
6. WHEN I return to the app THEN THE System SHALL load my previous assessment results

---

### Requirement 12: Display Assessment Status on Dashboard

**User Story:** As a user, I want to see my assessment results on the dashboard, so I'm reminded of my exemption status and recommended method.

#### Acceptance Criteria

1. WHEN I have not completed the assessment THEN THE System SHALL display a prominent badge prompting "Find Your Path"
2. WHEN I tap the "Find Your Path" badge THEN THE System SHALL navigate to the assessment
3. WHEN I have completed the assessment and am exempt THEN THE System SHALL display an "Exempt" badge on the dashboard
4. WHEN I view the exempt badge THEN THE System SHALL show which exemption category applies
5. WHEN I have completed the assessment and am not exempt THEN THE System SHALL display a "Recommended Method" badge on the dashboard
6. WHEN I view the recommended method badge THEN THE System SHALL show the recommended compliance method
7. WHEN I tap any assessment badge THEN THE System SHALL navigate to my assessment results

---

### Requirement 13: Enable Re-Assessment

**User Story:** As a user whose circumstances have changed, I want to retake the assessment, so my recommendation stays current.

#### Acceptance Criteria

1. WHEN I view the dashboard with completed assessment THEN THE System SHALL display a "Retake Assessment" button
2. WHEN I tap "Retake Assessment" THEN THE System SHALL navigate to the assessment with all previous answers prepopulated
3. WHEN I navigate through the prepopulated assessment THEN THE System SHALL allow me to change any answer
4. WHEN I complete the re-assessment THEN THE System SHALL store the new results with a new timestamp
5. WHEN I complete the re-assessment THEN THE System SHALL update the dashboard badges with new results
6. WHEN I complete the re-assessment THEN THE System SHALL maintain a history of previous assessments

---

### Requirement 14: Maintain Assessment History

**User Story:** As a user who has taken the assessment multiple times, I want to see my history, so I can track how my situation has changed.

#### Acceptance Criteria

1. WHEN I complete an assessment THEN THE System SHALL add an entry to my assessment history
2. WHEN I view assessment history THEN THE System SHALL display the date of each assessment
3. WHEN I view assessment history THEN THE System SHALL display the result of each assessment (exempt status and recommended method)
4. WHEN I view assessment history THEN THE System SHALL display assessments in reverse chronological order
5. WHEN I tap a historical assessment THEN THE System SHALL display the full results from that assessment

---

### Requirement 15: Make Assessment Data Exportable

**User Story:** As a user, I want my assessment data to be exportable, so it can be included when I export my compliance records in the future.

#### Acceptance Criteria

1. WHEN assessment data is stored THEN THE System SHALL structure it in a format that can be exported
2. WHEN assessment data is stored THEN THE System SHALL include the assessment date
3. WHEN assessment data is stored THEN THE System SHALL include exemption status and category if applicable
4. WHEN assessment data is stored THEN THE System SHALL include recommended compliance method and reasoning
5. WHEN assessment data is stored THEN THE System SHALL include all work situation and activity details
6. WHEN the future export system is implemented THEN THE System SHALL be able to access and include assessment data

---

### Requirement 16: Communicate Method Switching Capability

**User Story:** As a user, I want to understand that I can switch between compliance methods without losing data, so I feel confident trying the recommended method.

#### Acceptance Criteria

1. WHEN I view the recommendation screen THEN THE System SHALL display a message explaining that I can switch methods at any time
2. WHEN I view the recommendation screen THEN THE System SHALL explain that no data will be lost when switching methods
3. WHEN I view the recommendation screen THEN THE System SHALL explain that all tracking methods remain accessible
4. WHEN I view the dashboard with an active method THEN THE System SHALL provide clear access to switch to other methods
5. WHEN I access method switching THEN THE System SHALL remind me that previous data is preserved

---

### Requirement 17: Support Exempt Users Tracking Compliance

**User Story:** As a user who is exempt, I want the option to still track hours or income, so I can maintain records even though I'm not required to.

#### Acceptance Criteria

1. WHEN I am exempt THEN THE System SHALL not restrict access to any compliance tracking methods
2. WHEN I am exempt and view the dashboard THEN THE System SHALL display the exempt badge prominently
3. WHEN I am exempt THEN THE System SHALL allow me to access hour tracking, income tracking, and seasonal income tracking
4. WHEN I am exempt and track compliance THEN THE System SHALL store the data normally
5. WHEN I am exempt and export data THEN THE System SHALL include both exemption status and any tracked compliance data

---

### Requirement 18: Use Plain Language Throughout

**User Story:** As a user, I want all assessment questions in plain language, so I can understand what's being asked without confusion.

#### Acceptance Criteria

1. WHEN I view any assessment question THEN THE System SHALL use plain, conversational language
2. WHEN technical terms are necessary THEN THE System SHALL provide simple explanations or examples
3. WHEN I view the recommendation THEN THE System SHALL explain my status in simple, clear terms
4. WHEN I view help text THEN THE System SHALL avoid acronyms and legal references
5. WHEN I view button labels THEN THE System SHALL use action-oriented, clear language

---

### Requirement 19: Replace Existing Help Popup

**User Story:** As a new user, I want comprehensive guidance through the assessment instead of a dismissable help popup, so I understand how to use the app effectively.

#### Acceptance Criteria

1. WHEN I reach the dashboard for the first time THEN THE System SHALL not display the previous limited help popup
2. WHEN I have not completed the assessment THEN THE System SHALL display the Find Your Path badge as the primary guidance mechanism
3. WHEN I complete the assessment THEN THE System SHALL display appropriate badges based on my results instead of generic help text
4. WHEN I dismiss or skip the assessment THEN THE System SHALL maintain the assessment badge as a persistent reminder
5. WHEN I complete the assessment THEN THE System SHALL remove the assessment prompt badge

---

### Requirement 20: Ensure Mobile-First Experience

**User Story:** As a mobile user, I want the assessment optimized for my device, so I can complete it easily on my phone.

#### Acceptance Criteria

1. WHEN I view the assessment on mobile THEN THE System SHALL display one question per screen
2. WHEN I view questions on mobile THEN THE System SHALL use large, touch-friendly buttons and inputs
3. WHEN I view the progress indicator on mobile THEN THE System SHALL be clearly visible but not intrusive
4. WHEN I view the recommendation screen on mobile THEN THE System SHALL format content for easy reading on small screens
5. WHEN I use the estimation tools on mobile THEN THE System SHALL display mobile-optimized number inputs

---

## Out of Scope

The following features are NOT included in this specification:

- ❌ Automated usage monitoring to suggest method switching
- ❌ Verification of work situation claims
- ❌ Document upload during assessment
- ❌ State-specific assessment variations
- ❌ Integration with state Medicaid systems
- ❌ Household-level assessment
- ❌ Automated exemption determination from profile data
- ❌ Exemption expiration tracking
- ❌ Notification when circumstances might have changed
- ❌ Comparison of actual tracking data against assessment answers

---

## Success Criteria

This feature is successful when:

- ✅ Users can complete the full assessment flow from notice question through recommendation
- ✅ Users receive clear, personalized recommendations based on their situation
- ✅ Users can retake the assessment with prepopulated answers
- ✅ Assessment results are displayed prominently on the dashboard
- ✅ Users can switch between compliance methods without losing data
- ✅ Exempt users can still access all tracking methods
- ✅ All questions use plain, understandable language
- ✅ Progress is saved automatically and can be resumed
- ✅ Assessment data can be exported for sharing
- ✅ The existing help popup is replaced with this more comprehensive solution

---

## Technical Constraints

- **Storage**: IndexedDB for assessment answers, results, and history
- **Question Flow**: Conditional logic based on previous answers with branching paths
- **Mobile-First**: Touch-optimized UI with large buttons and inputs
- **Accessibility**: Screen reader compatible, keyboard navigable
- **Privacy**: All data stored locally, no transmission
- **Performance**: Instant navigation between questions, no loading delays
- **Data Preservation**: All tracking data preserved when switching methods

---

## Privacy & Security

- **Self-Reported**: All assessment information is self-reported by the user
- **Local Storage Only**: Assessment data never leaves the device
- **No Verification**: App does not verify claims with external systems
- **User Control**: Users can retake assessment or delete data at any time
- **Transparency**: Users are informed that assessment is for their own guidance
- **No Restrictions**: Assessment results do not restrict app functionality

---

## Dependencies

This feature depends on:

- Existing exemption screening logic (will be integrated into unified flow)
- Existing dashboard (will add assessment badges)
- Existing hour tracking, income tracking, and seasonal income tracking features
- IndexedDB schema (will need to add assessment tables)
- Existing settings page (for method switching and re-assessment access)

---

## Notes

- Assessment combines exemption screening with work situation analysis
- Recommendations are suggestive, not directive - users maintain full control
- Priority order for recommendations: exemption > income > seasonal income > hours
- Income tracking is prioritized because submitting one paystub is easier than tracking hours
- Users can switch methods at any time based on what actually works for them
- Assessment should feel conversational and supportive, not interrogative
- Estimation tools help users who think in weekly terms convert to monthly
- The notice question helps users who already know they're not exempt skip ahead
- Assessment history helps users and caseworkers see how circumstances have changed
- This replaces the limited help popup with comprehensive, personalized guidance

