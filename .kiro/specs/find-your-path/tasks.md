# Implementation Plan: Find Your Path

This plan breaks down the Find Your Path feature into discrete, manageable coding tasks. Each task builds incrementally on previous work, with no orphaned code. The focus is on core functionality only, following the MVP approach.

---

## Task List

- [ ] 1. Set up database schema and types
  - Create new database tables for assessment data
  - Define TypeScript types for assessment responses and results
  - Add database migration to version 6
  - _Requirements: 10, 11, 15_

- [ ] 2. Create assessment data storage functions
  - Write functions to save/load assessment progress
  - Write functions to save/load assessment results
  - Write functions to save/load assessment history
  - Implement auto-save with debouncing
  - _Requirements: 10, 11, 14_

- [ ] 3. Build recommendation engine
  - Implement exemption status checking logic
  - Implement compliance path calculation (income, seasonal, hours)
  - Implement recommendation prioritization logic
  - Create reasoning text generation
  - _Requirements: 7_

- [ ] 4. Create assessment flow components
  - Build progress indicator component with visual bar
  - Build question wrapper component with back/forward navigation
  - Build question type components (single choice, multiple choice, number input)
  - Implement conditional navigation logic
  - _Requirements: 9, 10_

- [ ] 5. Implement estimation tools
  - Build weekly-to-monthly hours converter
  - Build paycheck-to-monthly income converter
  - Create inline calculator UI components
  - _Requirements: 6_

- [ ] 6. Create assessment introduction screen
  - Build welcome screen with explanation
  - Add "Get Started" and "Skip for Now" buttons
  - Implement skip logic to navigate to income tracking dashboard
  - _Requirements: 1_

- [ ] 7. Implement notice question
  - Create notice question screen
  - Add helper text explaining what notice might mention
  - Implement branching logic (skip to work questions or continue to exemptions)
  - _Requirements: 2_

- [ ] 8. Implement exemption screening questions
  - Reuse existing exemption question content and logic from current exemption screening
  - Integrate age-based exemption questions into assessment flow
  - Integrate family/caregiving exemption questions into assessment flow
  - Integrate health/disability exemption questions into assessment flow
  - Integrate program participation exemption questions into assessment flow
  - Integrate other exemption questions into assessment flow
  - Implement early exit when exempt
  - _Requirements: 3_

- [ ] 9. Implement work situation questions
  - Create job status question
  - Create payment frequency question
  - Create monthly income question with estimation tool
  - Create monthly work hours question with estimation tool
  - Create seasonal work question
  - Implement skip logic when no job
  - _Requirements: 4_

- [ ] 10. Implement activities questions
  - Create other activities checkbox question
  - Create individual activity hours questions (volunteer, school, work program)
  - Implement skip logic when no activities selected
  - _Requirements: 5_

- [ ] 11. Create recommendation results screen
  - Build results display with primary recommendation
  - Display reasoning and explanation
  - Show alternative methods
  - Add "Start [Method]" and "See All Methods" buttons
  - Display message about method switching flexibility
  - _Requirements: 8, 16_

- [ ] 12. Implement assessment page and routing
  - Create `/find-your-path` route and page
  - Wire up all question screens in sequence
  - Implement state management for responses
  - Connect to storage functions for auto-save
  - Connect to recommendation engine
  - _Requirements: 1, 9, 10_

- [ ] 13. Create dashboard assessment badges
  - Build "Not Started" badge component
  - Build "Exempt" badge component
  - Build "Recommended Method" badge component
  - Integrate badges into dashboard layout
  - Implement navigation to assessment from badges
  - _Requirements: 12_

- [ ] 14. Implement re-assessment functionality
  - Add "Retake Assessment" button to dashboard
  - Prepopulate assessment with previous answers
  - Save new results and update history
  - _Requirements: 13_

- [ ] 15. Create assessment history view
  - Build history list component
  - Display date and results for each assessment
  - Allow viewing full details of historical assessments
  - _Requirements: 14_

- [ ] 16. Remove old exemption screening system
  - Remove `/exemptions` route and page
  - Remove exemption screening components
  - Remove exemption screening entry points from settings/navigation
  - Update any links to point to Find Your Path
  - _Requirements: 19_

- [ ] 17. Structure assessment data for future export
  - Ensure assessment data is stored in exportable format
  - Add assessment data to existing data structures
  - Document export data structure
  - _Requirements: 15_

- [ ] 18. Implement mobile optimizations
  - Ensure one question per screen on mobile
  - Verify touch targets are adequate size (44x44px minimum)
  - Test progress bar visibility
  - Optimize keyboard behavior for inputs
  - _Requirements: 20_

- [ ] 19. Add plain language content
  - Write all question text in plain, conversational language
  - Write all explanation and reasoning text
  - Add helper text where needed
  - Avoid acronyms and legal jargon
  - _Requirements: 18_

- [ ] 20. Manual testing and polish
  - Test complete assessment flow end-to-end
  - Test all branching paths (exempt, not exempt, various work situations)
  - Test back/forward navigation preserves answers
  - Test skip functionality
  - Test re-assessment with prepopulation
  - Test dashboard badge display and navigation
  - Test method switching preserves data
  - Test on mobile devices
  - Fix any bugs found
  - _Requirements: All_

---

## Notes

- Each task should be completed fully before moving to the next
- Tasks build incrementally - no orphaned code
- Focus on core functionality only (MVP approach)
- No unit tests or integration tests (manual testing in task 20)
- Plain language and mobile optimization are integrated throughout
- Assessment data structure supports future export system
- Old exemption screening system is completely replaced

---

## Task Dependencies

```
1 (Database) → 2 (Storage) → 3 (Recommendation Engine)
                                      ↓
4 (Flow Components) → 5 (Estimation Tools)
                                      ↓
6 (Intro) → 7 (Notice) → 8 (Exemptions) → 9 (Work) → 10 (Activities) → 11 (Results)
                                                                              ↓
                                                                         12 (Page)
                                                                              ↓
                                                                    13 (Dashboard Badges)
                                                                              ↓
                                                                    14 (Re-assessment)
                                                                              ↓
                                                                    15 (History)
                                                                              ↓
                                                            16 (Remove Old System)
                                                                              ↓
                                                            17 (Export Structure)
                                                                              ↓
                                                            18 (Mobile Optimization)
                                                                              ↓
                                                            19 (Plain Language)
                                                                              ↓
                                                            20 (Testing & Polish)
```

---

## Estimated Effort

- **Total tasks**: 20
- **Estimated time**: 3-4 weeks for experienced developer
- **Complexity**: Medium-High (conditional logic, state management, UI/UX)
- **Risk areas**: Recommendation logic accuracy, mobile UX, navigation state management

---

## Success Criteria

Implementation is complete when:

- ✅ Users can complete full assessment from introduction to results
- ✅ Recommendation engine provides accurate suggestions based on responses
- ✅ Progress is auto-saved and can be resumed
- ✅ Dashboard displays appropriate badge based on assessment status
- ✅ Users can retake assessment with prepopulated answers
- ✅ Assessment history is viewable
- ✅ Old exemption screening system is removed
- ✅ All questions use plain language
- ✅ Mobile experience is smooth and intuitive
- ✅ Method switching preserves all data
- ✅ Assessment data is structured for future export
