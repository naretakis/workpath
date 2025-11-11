# Implementation Plan: Income Tracking Feature

## Overview

This implementation plan breaks down the income tracking feature into discrete, manageable coding tasks. Each task builds incrementally on previous tasks, with all code integrated into the application. Tasks are organized by implementation phase, with optional testing tasks marked with `*`.

---

## Phase 1: Core Data Layer

- [x] 1. Set up database schema and TypeScript interfaces
  - Create new database version (Version 5) in `src/lib/db.ts` with tables: `incomeEntries`, `incomeDocuments`, `incomeDocumentBlobs`, `complianceModes`
  - Create `src/types/income.ts` with interfaces: `IncomeEntry`, `IncomeDocument`, `IncomeDocumentBlob`, `ComplianceMode`, `MonthlyIncomeSummary`
  - Add database upgrade logic for Version 5
  - _Requirements: 9_

- [x] 2. Implement pay period conversion utilities
  - Create `src/lib/utils/payPeriodConversion.ts` with conversion multipliers and `calculateMonthlyEquivalent()` function
  - Implement rounding logic to 2 decimal places
  - Export constants: `PAY_PERIOD_MULTIPLIERS`, `INCOME_THRESHOLD`, `FEDERAL_MINIMUM_WAGE`, `REQUIRED_HOURS`
  - Make income threshold configurable for future minimum wage changes
  - _Requirements: 3, 13_

- [x] 3. Create income storage functions
  - Create `src/lib/storage/income.ts` with functions: `saveIncomeEntry()`, `updateIncomeEntry()`, `deleteIncomeEntry()`, `getIncomeEntriesByMonth()`, `getIncomeEntryById()`
  - Implement `getMonthlyIncomeSummary()` function with compliance calculation and income breakdown by source
  - Implement duplicate detection logic to prevent double-counting entries
  - Implement `setComplianceMode()` and `getComplianceMode()` functions
  - _Requirements: 9, 1, 2, 11_

- [x] 4. Create income document storage functions
  - Create `src/lib/storage/incomeDocuments.ts` with functions: `saveIncomeDocument()`, `getDocumentsByIncomeEntry()`, `getIncomeDocumentBlob()`, `deleteIncomeDocument()`
  - Reuse document compression logic from activity documents
  - _Requirements: 4, 9_

- [x] 5. Implement seasonal worker calculation logic
  - Add `calculateSeasonalAverage()` function to `src/lib/storage/income.ts`
  - Implement `getLast6Months()` helper function
  - Update `getMonthlyIncomeSummary()` to include seasonal worker data when applicable
  - _Requirements: 7, 8_

---

## Phase 2: Basic UI Components

- [x] 6. Create ComplianceModeSelector component
  - Create `src/components/compliance/ComplianceModeSelector.tsx` with ToggleButtonGroup for Hours/Income selection
  - Implement mode switching warning dialog
  - Connect to `setComplianceMode()` storage function
  - Add help icon with explanation of mode switching
  - _Requirements: 1, 12_

- [x] 7. Create IncomeStatusIndicator component
  - Create `src/components/income/IncomeStatusIndicator.tsx` mirroring Dashboard component structure
  - Display compliance status (compliant/not compliant) with icons and colors
  - Show progress bar for income ($X / $INCOME_THRESHOLD)
  - Display warning when income is close to threshold (within $30)
  - Show entry count, total income, and breakdown by source
  - _Requirements: 6, 11_

- [x] 8. Create IncomeEntryList component
  - Create `src/components/income/IncomeEntryList.tsx` with card-based layout
  - Display each income entry with: date, amount, pay period, monthly equivalent, source, document count
  - Implement edit and delete actions
  - Handle empty state (no entries yet)
  - _Requirements: 2, 11_

- [x] 9. Create IncomeEntryForm component (basic version)
  - Create `src/components/income/IncomeEntryForm.tsx` as a Dialog form
  - Implement form fields: amount (required), date (required), pay period selector (required), source (optional), income type (optional: wages, self-employment, gig-work, tips, other)
  - Add pay period selector using ToggleButtonGroup (Daily/Weekly/Bi-weekly/Monthly)
  - Display calculated monthly equivalent in real-time
  - Implement form validation (amount > 0, date required, pay period required, duplicate detection)
  - _Requirements: 2, 3_

- [x] 10. Integrate document capture into IncomeEntryForm
  - Reuse `DocumentCapture` component from `src/components/documents/DocumentCapture.tsx`
  - Add document attachment section to IncomeEntryForm
  - Display attached document thumbnails
  - Implement document save logic using `saveIncomeDocument()`
  - Handle multiple documents per income entry
  - _Requirements: 4_

- [x] 11. Create income tracking dashboard view
  - Create `src/components/income/IncomeDashboard.tsx` combining IncomeStatusIndicator and IncomeEntryList
  - Add "Add Income" floating action button
  - Integrate IncomeEntryForm dialog
  - Handle form submission and list refresh
  - _Requirements: 2, 6, 11_

- [x] 12. Update main Dashboard to support mode switching
  - Update `src/components/Dashboard.tsx` to include ComplianceModeSelector
  - Conditionally render hours tracking UI or income tracking UI based on mode
  - Preserve both data sets when switching modes
  - Load compliance mode from storage on mount
  - _Requirements: 1, 12_

---

## Phase 3: Seasonal Worker Feature

- [ ] 13. Add seasonal worker toggle to IncomeEntryForm
  - Add checkbox/toggle for "Mark as seasonal worker income" in IncomeEntryForm
  - Update form submission to include `isSeasonalWorker` flag
  - Add help icon with explanation of seasonal worker calculation including IRS definition (section 45R(d)(5)(B))
  - Provide examples of seasonal work (farm work, holiday retail, summer tourism, ski resorts, fishing industry)
  - _Requirements: 7, 13_

- [ ] 14. Create SeasonalWorkerView component
  - Create `src/components/income/SeasonalWorkerView.tsx` with 6-month history display
  - Implement list view showing each month's income total
  - Display calculated 6-month average
  - Show compliance status based on average
  - Add help text explaining 6-month averaging
  - _Requirements: 8_

- [ ] 15. Integrate SeasonalWorkerView into IncomeDashboard
  - Conditionally display SeasonalWorkerView when any income entry is marked as seasonal
  - Fetch seasonal data using `calculateSeasonalAverage()`
  - Update IncomeStatusIndicator to show seasonal average when applicable
  - _Requirements: 7, 8_

---

## Phase 4: Help Content & Polish

- [ ] 16. Create income tracking help content components
  - Create `src/components/help/IncomeTrackingHelp.tsx` using content from `src/content/helpText.ts`
  - Display income threshold definition with note about federal minimum wage basis and potential changes
  - Display earned vs unearned income examples with disclaimer about pending regulatory clarification
  - Include specific gig economy examples (Uber, DoorDash, Instacart) and edge cases
  - Create `src/components/help/SeasonalWorkerHelp.tsx` with IRS definition and 6-month averaging explanation
  - Add help dialogs/expandable sections to relevant components
  - _Requirements: 5, 13_

- [ ] 17. Update DocumentVerificationHelp for income documents
  - Update `src/components/help/DocumentVerificationHelp.tsx` to include income document examples
  - Add examples: pay stubs, bank statements, gig work app screenshots (Uber earnings, DoorDash weekly summary, Instacart payment history), 1099 forms, self-employment records, payment platform screenshots (PayPal, Venmo, Cash App for business)
  - Provide guidance on what makes good income documentation for different income types
  - Include specific guidance for gig economy workers
  - _Requirements: 4, 5, 13_

- [ ] 18. Implement form validation and error handling
  - Add comprehensive validation to IncomeEntryForm (amount range, date validation, unusual amounts warning)
  - Implement error messages for failed saves
  - Add success notifications after saving
  - Handle edge cases (duplicate entries, invalid dates)
  - _Requirements: 2, 3_

- [ ] 19. Add mobile responsiveness and accessibility
  - Test all income components on mobile viewport sizes
  - Ensure touch targets are at least 44x44px
  - Add proper ARIA labels and keyboard navigation
  - Test with screen reader
  - Verify color contrast meets WCAG 2.1 AA standards
  - _Requirements: All UI components_

---

## Phase 5: Export & Integration

- [ ] 20. Update export functionality for income data
  - Update `src/lib/export/exportData.ts` to include income data structure
  - Implement `exportIncomeData()` function to gather entries, summary, and documents
  - Update `exportComplianceData()` to conditionally export hours or income based on mode
  - Ensure income documents are included in export
  - _Requirements: 10_

- [ ] 21. Update exemption flow integration
  - Ensure ComplianceModeSelector only shows for non-exempt users
  - Update onboarding flow to direct to exemption screener first
  - For exempt users, signify/note that compliance tracking is not required (but they can still do it if they like)
  - Update dashboard to show exemption status prominently
  - _Requirements: 14_

- [ ] 22. Add income tracking to existing navigation/routing
  - Ensure income tracking is accessible from main navigation
  - Update any breadcrumbs or navigation indicators
  - Add deep linking support for income entry editing
  - _Requirements: 1, 11_

- [ ] 23. End-to-end testing and bug fixes
  - Manual testing on iOS and Android devices
  - Test offline functionality (add entries without internet)
  - Test data persistence across app restarts
  - Verify export format is readable by caseworkers
  - Fix any bugs discovered during testing
  - _Requirements: All_

---

## Phase 6: Documentation & Deployment

- [ ] 24. Update user documentation
  - Update app help content with income tracking instructions
  - Create user guide for seasonal workers
  - Document pay period conversion calculations
  - Add FAQ section for common income tracking questions
  - _Requirements: 13_

- [ ] 25. Code cleanup and final review
  - Remove any console.log statements
  - Ensure all TypeScript types are properly defined
  - Run linter and fix any issues
  - Review code for consistency with existing patterns
  - Add JSDoc comments to public functions
  - _Requirements: All_

---

## Summary

This implementation plan consists of **23 main tasks** organized into 6 phases:

1. **Phase 1: Core Data Layer** (5 tasks) - Database schema, storage functions, calculations
2. **Phase 2: Basic UI Components** (7 tasks) - Forms, lists, status indicators, mode switching
3. **Phase 3: Seasonal Worker Feature** (3 tasks) - 6-month averaging and display
4. **Phase 4: Help Content & Polish** (4 tasks) - Help text, validation, accessibility
5. **Phase 5: Export & Integration** (3 tasks) - Export updates, exemption flow, navigation
6. **Phase 6: Documentation & Deployment** (2 tasks) - User docs, cleanup

Each task includes:

- Clear implementation objectives
- Specific file paths and function names
- References to requirements document
- Incremental progress that builds on previous tasks

All code is integrated into the application with no orphaned or hanging implementations.
