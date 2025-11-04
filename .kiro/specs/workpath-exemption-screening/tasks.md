# Implementation Tasks: HourKeep - Exemption Screening

**Help Users Determine if They're Exempt from Work Requirements**

---

## Task Overview

This task list breaks down the exemption screening feature into discrete, manageable steps. Each task builds on previous work and produces working, integrated code.

**Total: 7 sections, 24 tasks**

---

- [x] 1. Database Schema and Data Models

- [x] 1.1 Define TypeScript interfaces for exemptions
  - Create `src/types/exemptions.ts`
  - Define `ExemptionScreening` interface
  - Define `ExemptionResponses` interface
  - Define `ExemptionResult` interface
  - Define `ExemptionCategory` type
  - Define `ExemptionHistory` interface
  - Export all types

- [x] 1.2 Update IndexedDB schema with exemption tables
  - Modify `src/lib/storage/db.ts`
  - Add `exemptions` table with indexes (++id, userId, screeningDate)
  - Add `exemptionHistory` table with indexes (++id, userId, screeningDate)
  - Increment database version to 3
  - Add upgrade function (no data migration needed)
  - Test database creation in browser DevTools

- [x] 1.3 Create exemption storage operations
  - Create `src/lib/storage/exemptions.ts`
  - Implement `saveScreening(userId, responses, result)` function
  - Implement `getLatestScreening(userId)` function
  - Implement `getScreeningHistory(userId)` function
  - Implement `archiveScreening(screeningId)` function
  - Add error handling for all operations

---

- [ ] 2. Question Flow Logic

- [ ] 2.1 Define exemption questions
  - Create `src/lib/exemptions/questions.ts`
  - Define age-based questions
  - Define family/caregiving questions
  - Define health/disability questions
  - Define program participation questions
  - Define other exemptions questions
  - Add plain-language text for each question
  - Add help text where needed
  - Export question definitions

- [ ] 2.2 Implement exemption calculator
  - Create `src/lib/exemptions/calculator.ts`
  - Implement `calculateExemption(responses)` function
  - Add logic for age-based exemptions
  - Add logic for family/caregiving exemptions
  - Add logic for health/disability exemptions
  - Add logic for program participation exemptions
  - Add logic for other exemptions
  - Return `ExemptionResult` with category and explanation
  - Add plain-language explanations for each result

- [ ] 2.3 Implement question flow logic
  - Create `src/lib/exemptions/questionFlow.ts`
  - Implement `getNextQuestion(responses)` function
  - Add conditional logic (skip questions if already exempt)
  - Implement short-circuit logic (stop at first exemption)
  - Track question progress
  - Return null when screening complete

---

- [ ] 3. Screening UI Components

- [ ] 3.1 Build ExemptionQuestion component
  - Create `src/components/exemptions/ExemptionQuestion.tsx`
  - Display question text
  - Display help text (if provided)
  - Render appropriate input type (date, boolean, multiple choice)
  - Add Back button (except on first question)
  - Add Next button (enabled when answered)
  - Style for mobile-first
  - Ensure 44px+ touch targets

- [ ] 3.2 Build QuestionFlow component
  - Create `src/components/exemptions/QuestionFlow.tsx`
  - Manage current question state
  - Store responses as user answers
  - Handle Back button (return to previous question)
  - Handle Next button (advance to next question)
  - Check for exemption after each answer
  - Navigate to results when complete
  - Add progress indicator

- [ ] 3.3 Build progress indicator
  - Show current category being screened
  - Show approximate progress (e.g., "2 of 5 categories")
  - Update as user progresses
  - Style to be unobtrusive

---

- [ ] 4. Results Display

- [ ] 4.1 Build ExemptionResults component
  - Create `src/components/exemptions/ExemptionResults.tsx`
  - Display exempt or not exempt status
  - Show exemption category (if exempt)
  - Display plain-language explanation
  - Show next steps guidance
  - Display screening date
  - Add "Done" button (returns to settings)
  - Add "Re-screen" button
  - Style for mobile-first

- [ ] 4.2 Create result variations
  - Design exempt result layout (green, checkmark)
  - Design not exempt result layout (informational, not negative)
  - Add appropriate icons
  - Ensure text is clear and actionable

---

- [ ] 5. Screening Page

- [ ] 5.1 Build ExemptionScreeningPage
  - Create `src/app/exemptions/page.tsx`
  - Add welcome screen (first-time users)
  - Integrate QuestionFlow component
  - Integrate ExemptionResults component
  - Handle navigation between screens
  - Save screening results on completion
  - Archive previous screening if exists

- [ ] 5.2 Add welcome screen
  - Explain what exemption screening is
  - Explain it's optional and informational
  - Add disclaimer about unofficial determination
  - Add "Start Screening" button
  - Add "Cancel" button (returns to settings)

---

- [ ] 6. Dashboard Integration

- [ ] 6.1 Build ExemptionBadge component
  - Create `src/components/exemptions/ExemptionBadge.tsx`
  - Display "Exempt" badge if user is exempt
  - Show exemption category
  - Display "Must Track Hours" if not exempt
  - Display "Check if You're Exempt" if not screened
  - Make badge tappable (links to screening details)
  - Style with appropriate colors (green for exempt, neutral for not exempt)

- [ ] 6.2 Integrate badge into Dashboard
  - Modify `src/components/tracking/Dashboard.tsx`
  - Add ExemptionBadge at top of dashboard
  - Load latest screening result
  - Adjust dashboard messaging based on exemption status
  - If exempt, make hour tracking optional
  - If not exempt, emphasize hour tracking requirement

---

- [ ] 7. Settings Integration

- [ ] 7.1 Add exemption screening to settings
  - Modify `src/app/settings/page.tsx`
  - Add "Exemption Screening" section
  - Show current status (Not Screened, Exempt, Must Track Hours)
  - Show screening date if completed
  - Add "Start Screening" button (if not screened)
  - Add "View Results" button (if screened)
  - Add "Re-screen" button (if screened)

- [ ] 7.2 Build ExemptionHistory component
  - Create `src/components/exemptions/ExemptionHistory.tsx`
  - Display list of previous screenings
  - Show date and result for each
  - Format dates clearly
  - Add empty state (no history)

- [ ] 7.3 Add history to settings
  - Add "Screening History" section in settings
  - Integrate ExemptionHistory component
  - Show last 5 screenings
  - Add "View All" option if more than 5

---

- [ ] 8. Re-screening Functionality

- [ ] 8.1 Build RescreenDialog component
  - Create `src/components/exemptions/RescreenDialog.tsx`
  - Display confirmation dialog
  - Explain that previous results will be replaced
  - Explain that old results will be saved in history
  - Add "Continue" button
  - Add "Cancel" button

- [ ] 8.2 Implement re-screening flow
  - Show RescreenDialog when user taps "Re-screen"
  - On confirm, archive current screening to history
  - Delete current screening from exemptions table
  - Navigate to screening page
  - Start fresh screening

---

- [ ] 9. Plain Language Review

- [ ] 9.1 Review all question text
  - Ensure all questions use plain language
  - Remove jargon and legal terms
  - Test readability (aim for 8th grade level)
  - Get feedback from non-technical users if possible

- [ ] 9.2 Review all explanation text
  - Ensure results are clear and actionable
  - Avoid negative language
  - Provide specific next steps
  - Test with sample users

- [ ] 9.3 Add help text where needed
  - Identify questions that may be confusing
  - Add clarifying help text
  - Use examples where helpful
  - Keep help text concise

---

- [ ] 10. Testing and Polish

- [ ] 10.1 Test all exemption paths
  - Test age-based exemption (≤18)
  - Test age-based exemption (≥65)
  - Test family/caregiving exemptions
  - Test health/disability exemptions
  - Test program participation exemptions
  - Test other exemptions
  - Test not exempt path (all "no" answers)

- [ ] 10.2 Test question flow logic
  - Verify short-circuit works (stops at first exemption)
  - Verify Back button works correctly
  - Verify progress indicator updates
  - Verify conditional questions appear correctly

- [ ] 10.3 Test re-screening
  - Complete initial screening
  - Re-screen with different answers
  - Verify old result archived to history
  - Verify new result saved
  - Verify dashboard badge updates

- [ ] 10.4 Test dashboard integration
  - Verify badge displays correctly
  - Verify badge links to screening details
  - Verify dashboard messaging adjusts based on status
  - Test on mobile and desktop

- [ ] 10.5 Test settings integration
  - Verify screening status displays correctly
  - Verify buttons work (Start, View Results, Re-screen)
  - Verify history displays correctly

- [ ] 10.6 Test offline functionality
  - Verify screening works offline
  - Verify results persist across sessions
  - Verify no network errors

- [ ] 10.7 Polish UI and UX
  - Ensure all buttons have proper touch targets (44px+)
  - Add loading states where needed
  - Add empty states where needed
  - Ensure error messages are clear
  - Test on small screens (320px width)
  - Verify accessibility (keyboard navigation, screen reader)

---

## Implementation Notes

### Order of Implementation

1. **Start with data layer** (Task 1.x) - Get database and types set up first
2. **Build question logic** (Task 2.x) - Define questions and calculator
3. **Build UI components** (Tasks 3.x, 4.x) - Question flow and results
4. **Build screening page** (Task 5.x) - Main page
5. **Integrate with dashboard** (Task 6.x) - Show status
6. **Integrate with settings** (Task 7.x) - Access and history
7. **Add re-screening** (Task 8.x) - Allow updates
8. **Review language** (Task 9.x) - Ensure clarity
9. **Test and polish** (Task 10.x) - Final QA

### Testing Strategy

- Test each exemption category individually
- Test with real-world scenarios
- Get feedback from potential users on language clarity
- Test on mobile devices (primary use case)
- Verify accessibility with keyboard and screen reader

### Plain Language Guidelines

- Use "you" and "your" (conversational)
- Use active voice
- Use short sentences
- Avoid jargon and acronyms
- Provide examples where helpful
- Be specific and concrete

### Common Pitfalls

- Don't make screening mandatory (it's optional)
- Don't use legal language or cite regulations
- Don't make users feel bad if not exempt
- Don't over-complicate the question flow
- Don't forget to handle edge cases (e.g., invalid dates)

---

## Success Criteria

This feature is complete when:

- ✅ Users can complete full 5-category screening
- ✅ All questions use plain, clear language
- ✅ Short-circuit logic works (stops at first exemption)
- ✅ Results are clear and actionable
- ✅ Dashboard badge shows exemption status
- ✅ Users can re-screen when circumstances change
- ✅ Screening history is maintained
- ✅ All functionality works offline
- ✅ Works on mobile devices

---

## Estimated Time

- **Task 1**: 1 day (data layer)
- **Task 2**: 2-3 days (question logic and calculator)
- **Tasks 3-4**: 2-3 days (UI components)
- **Task 5**: 1-2 days (screening page)
- **Task 6**: 1 day (dashboard integration)
- **Task 7**: 1-2 days (settings integration)
- **Task 8**: 1 day (re-screening)
- **Task 9**: 1 day (language review)
- **Task 10**: 2-3 days (testing and polish)

**Total: 12-18 days** (2.5-3.5 weeks part-time)

---

## Dependencies

- Existing settings page
- Existing dashboard
- IndexedDB (Dexie.js)
- Material-UI components
- React Hook Form (for question inputs)

---

## Optional Enhancements (Future)

- State-specific exemption variations
- Document upload for exemption proof
- Exemption expiration dates
- Automatic re-screening reminders
- Integration with state Medicaid systems
- Verification of exemption claims
