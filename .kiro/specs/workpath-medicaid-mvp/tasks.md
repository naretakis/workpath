# Implementation Plan: WorkPath (MVP)

**Your Work Requirements Assistant**

*Track your work, volunteer, and education hours to maintain your Medicaid and SNAP benefits*

---

This implementation plan breaks down the development of WorkPath into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring continuous integration and no orphaned code.

## Task Organization

Tasks are organized following industry best practices for greenfield project development:
1. **Project scaffolding and infrastructure** - Set up foundation, CI/CD, and documentation early
2. **Core data layer** - Build the persistence and state management
3. **UI foundation** - Create reusable components and layouts
4. **Feature implementation** - Build features incrementally with immediate integration
5. **Polish and optimization** - Enhance UX, accessibility, and performance
6. **Testing and deployment** - Validate and ship

Each task produces working, integrated code. No orphaned implementations.

**Total: 25 sections, 116 tasks (6 optional testing tasks)**

---

- [ ] 1. Project Scaffolding and Infrastructure
- [ ] 1.1 Initialize Next.js project with TypeScript
  - Create Next.js 14+ project with App Router and TypeScript strict mode
  - Configure tsconfig.json with strict mode enabled
  - Set up ESLint and Prettier for code quality
  - Install and configure Husky for git hooks
  - Set up lint-staged for pre-commit checks
  - Create basic .gitignore and project structure
  - Initialize git repository
  - _Requirements: 12.8, Code quality_

- [ ] 1.2 Install and configure core dependencies
  - Install Material-UI v5+ (@mui/material, @emotion/react, @emotion/styled)
  - Install Dexie.js for IndexedDB
  - Install React Hook Form and Zod for form validation
  - Install date-fns for date handling
  - Install next-pwa for PWA capabilities
  - Document all dependencies in package.json
  - _Requirements: 11.1, 11.2_

- [ ] 1.3 Configure build and deployment setup
  - Configure next.config.js for static export (GitHub Pages)
  - Set up next-pwa plugin with basic service worker
  - Configure basePath for GitHub Pages deployment (use environment variable)
  - Set up environment variables (.env.local, .env.production)
  - Configure different settings for development vs production (service worker, logging)
  - Test local build and export
  - _Requirements: 11.1, 11.2, 11.7, 14.6_

- [ ] 1.4 Set up GitHub Actions CI/CD pipeline
  - Create .github/workflows/deploy.yml with build and deploy jobs
  - Add automated linting and type checking to CI
  - Configure GitHub Pages deployment
  - Add build caching for faster deployments
  - Test deployment pipeline with initial commit
  - _Requirements: Deployment, CI/CD_

- [ ] 1.5 Create initial project documentation
  - Write README.md with project overview and setup instructions
  - Create CHANGELOG.md with initial version
  - Add LICENSE file if applicable
  - Create .gitignore with appropriate exclusions
  - Document development workflow and commands
  - _Requirements: Documentation_

- [ ] 1.6 Create project directory structure
  - Create all directories per design document (src/app, src/components, src/lib, src/hooks, src/types, src/theme, tests)
  - Create .kiro/steering directory for Kiro AI steering documents
  - Create docs directory structure (docs/domain, docs/design, docs/testing, docs/development, docs/tasks)
  - Set up path aliases in tsconfig.json (@/ for src/)
  - Create placeholder index files to establish structure
  - _Requirements: Project organization, PWA Bootstrap Guide_

- [x] 1.7 Create Kiro steering documents for development standards
  - Create .kiro/steering/development-standards.md with TypeScript strict mode, code quality standards, component patterns
  - Create .kiro/steering/material-ui-guidelines.md with MUI component usage, theming patterns, responsive design approach
  - Create .kiro/steering/git-workflow.md with branch strategy, commit conventions, PR process
  - Create .kiro/steering/medicaid-domain-knowledge.md with HR1 legislation context, exemption categories, compliance requirements, and information from the medicaid-work-requirements-cfa-service-blueprint.md file
  - Include references to requirements and design documents
  - _Requirements: Development standards, domain knowledge_

---

- [ ] 2. Core Data Layer and Type Definitions
- [ ] 2.1 Define TypeScript interfaces for all data models
  - Create types/profile.ts with UserProfile interface
  - Create types/exemptions.ts with ExemptionScreening, ExemptionResponse, and ExemptionCategory types
  - Create types/activities.ts with WorkActivity interface
  - Create types/documents.ts with Document and DocumentType
  - Create types/compliance.ts with MonthlyCompliance interface
  - Create types/config.ts for state configuration (StateConfig, ExemptionRules, WorkRequirements)
  - Create types/errors.ts for custom error classes
  - _Requirements: 2.4, 3.7, 4.7, 6.5_

- [ ] 2.2 Set up IndexedDB schema with Dexie
  - Create lib/storage/db.ts with MedicaidComplianceDB class
  - Define all tables (profiles, exemptions, activities, documents, documentBlobs, compliance)
  - Set up indexes for efficient querying
  - Implement database initialization and version management
  - Test database creation in browser
  - _Requirements: 2.4, 3.7, 4.7, 6.5, 6.6_

- [ ] 2.3 Create basic storage operations
  - Create lib/storage/profile.ts with profile CRUD operations
  - Create lib/storage/activities.ts with activity CRUD operations
  - Create lib/storage/documents.ts with document CRUD operations
  - Implement error handling for all database operations
  - _Requirements: 2.4, 4.7, 6.5_

- [ ] 2.4 Implement validation schemas with Zod
  - Create lib/validation/profile.ts with profileSchema
  - Create lib/validation/activities.ts with activitySchema
  - Create lib/validation/documents.ts with documentSchema
  - Create lib/validation/exemptions.ts with exemption validation
  - _Requirements: 2.3, 4.6, 6.4_

---

## 3. Theme, Layout, and UI Foundation

- [ ] 3.1 Configure Material-UI theme with mobile-first approach
  - Create theme/theme.ts with mobile-first breakpoints (320px, 768px, 1024px)
  - Define theme/colors.ts with WCAG AA compliant color palette (4.5:1 contrast for text, 3:1 for interactive)
  - Create theme/typography.ts with responsive typography system
  - Configure touch target sizing (44px minimum for all interactive elements)
  - Set up responsive design utilities
  - Test theme on mobile device (320px width)
  - _Requirements: 12.1, 12.2, 13.4, 13.5_

- [ ] 3.2 Create root layout and error handling
  - Implement src/app/layout.tsx with theme provider
  - Create components/common/ErrorBoundary.tsx
  - Build custom error classes in types/errors.ts
  - Implement global error handler in lib/utils/errorHandler.ts
  - Create components/common/SnackbarNotification.tsx
  - Wire up error handling throughout the app
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.10_

- [ ] 3.3 Build core layout components (mobile-first)
  - Create components/layout/PageContainer.tsx for consistent page layout (mobile-first)
  - Create components/layout/Section.tsx for content sections
  - Build components/common/AppBar.tsx with title and offline indicator (fixed top on mobile)
  - Create components/common/BottomNav.tsx for mobile navigation (fixed bottom, 44px+ touch targets)
  - Implement responsive behavior for all layout components
  - Test on mobile device (320px width) before desktop
  - _Requirements: 11.8, 12.1, 12.2, 15.8_

- [ ] 3.4 Create reusable form and display components (mobile-optimized)
  - Build components/forms/FormField.tsx with mobile input types (number, date, tel)
  - Create components/forms/DatePicker.tsx with touch-friendly date-fns integration
  - Build components/forms/DateRangePicker.tsx with mobile-optimized UI
  - Create components/common/LoadingSpinner.tsx
  - Build components/common/ConfirmDialog.tsx with large touch targets
  - Create components/common/ResponsiveTable.tsx for mobile-friendly data tables
  - Ensure all form inputs have 44px+ touch targets
  - _Requirements: 12.2, 12.3, 12.6, 15.5_

- [ ] 3.5 Set up routing and navigation
  - Create src/app/page.tsx (home/landing page) with routing logic
  - Create placeholder pages for all routes (onboarding, exemptions, tracking, documents, export, import, settings)
  - Implement navigation between pages
  - Add routing logic: new users → onboarding, existing users → tracking
  - Test routing and navigation flow
  - _Requirements: Navigation structure, 2.5_

- [ ] 3.6 Create PWA manifest and icons
  - Create public/manifest.json with app metadata (name, short_name, description, start_url, display, orientation)
  - Generate app icons for all required sizes (72px to 512px) with maskable support
  - Configure splash screen and theme colors
  - Add app screenshots for manifest (home, calendar views)
  - Configure app categories (health, productivity, utilities)
  - Test PWA installation on mobile device
  - Verify standalone mode works correctly
  - _Requirements: 11.5, 11.6, PWA Bootstrap Guide_

- [ ] 3.7 Implement PWA install prompt
  - Create components/common/InstallPrompt.tsx for add-to-homescreen prompt
  - Listen for beforeinstallprompt event
  - Display custom install banner with app benefits
  - Implement "Install App" button that triggers native install prompt
  - Store user's install decision (installed, dismissed, not-now) in localStorage
  - Don't show prompt again if user dismissed or already installed
  - Test install flow on iOS Safari and Android Chrome
  - _Requirements: 11.5, 11.6, PWA best practices_

- [ ] 3.8 Implement service worker update notification
  - Create components/common/UpdateNotification.tsx for app update alerts
  - Listen for service worker update events (waiting, controlling)
  - Display snackbar notification when new version is available
  - Implement "Update Now" button that triggers skipWaiting and reloads
  - Add "Update Later" option that dismisses notification
  - Show update notification on app launch if update is pending
  - Test update flow in production build
  - _Requirements: 11.7, 11.10, PWA best practices_

---

## 4. State Management and Configuration

- [ ] 4.1 Create state configuration system
  - Define configuration interfaces in types/config.ts (StateConfig, ExemptionRules, WorkRequirements, IncomeThresholds, AgencyContact)
  - Create public/config/federal-baseline.json with default rules:
    - Work hour requirement: 80 hours/month
    - Income threshold: $580/month
    - Exemption categories and criteria
    - State name and agency contact information (name, phone, email, website, address)
    - Reporting deadlines and submission methods
  - Implement lib/config/loader.ts for configuration loading with fallback to federal baseline
  - Build configuration validation logic using Zod
  - Add support for state-specific configuration overrides
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4.2 Implement React Context for global state
  - Create contexts/AppContext.tsx for user profile, config, and offline status
  - Build contexts/ComplianceContext.tsx for tracking state
  - Create contexts/DocumentContext.tsx for document management
  - Implement context providers with TypeScript typing
  - Wire up contexts in root layout
  - _Requirements: 2.5, 11.4_

- [ ] 4.3 Create custom hooks for common operations
  - Implement hooks/useDatabase.ts for IndexedDB operations
  - Build hooks/useOfflineStatus.ts for network monitoring
  - Create hooks/useStorageQuota.ts for storage monitoring
  - Build hooks/useExemptions.ts for exemption logic
  - Create hooks/useCompliance.ts for compliance calculations
  - Create hooks/useDocuments.ts for document operations
  - _Requirements: 11.3, 11.4, 6.10_

---

## 5. User Onboarding and Profile Management

- [ ] 5.1 Build onboarding flow UI (mobile-first)
  - Create src/app/onboarding/page.tsx with multi-step form
  - Implement profile data collection form (name, DOB, state, Medicaid status)
  - Integrate React Hook Form with Zod validation
  - Create components/common/PrivacyNotice.tsx with comprehensive privacy information
  - Display privacy notice on first app use with "I Understand" acknowledgment
  - Store privacy notice acknowledgment in user profile
  - Style with Material-UI components (mobile-first, 320px+ width)
  - Use mobile-optimized input types (date, tel)
  - Test on mobile device before desktop
  - _Requirements: 2.1, 2.2, 2.3, 12.3, 14.8_

- [ ] 5.2 Implement profile data persistence
  - Wire up onboarding form to save profile to IndexedDB
  - Implement lib/storage/encryption.ts for sensitive fields
  - Build profile loading logic on app initialization
  - Add redirect logic (onboarding → exemptions → tracking)
  - _Requirements: 2.4, 2.5, 2.6, 14.1_

- [ ] 5.3 Create settings page with profile editor
  - Build src/app/settings/page.tsx with sections
  - Create components/settings/ProfileEditor.tsx with edit form
  - Implement validation and save functionality
  - Add success/error feedback with snackbar
  - _Requirements: 2.6, 2.7_

- [ ] 5.4 Add data management and privacy components
  - Create components/settings/DataManagement.tsx with export/import/delete options
  - Build components/settings/StorageInfo.tsx with usage visualization
  - Create components/settings/PrivacyPolicy.tsx with policy text
  - Build components/settings/AboutApp.tsx with version and credits
  - _Requirements: 14.9_

---

## 6. Exemption Screening System

- [ ] 6.1 Create exemption screening data structures and logic
  - Define complete exemption question flow in lib/exemptions/questions.ts based on HR1 Section 71119
  - Create exemption category definitions (age, family-caregiving, health-disability, program-participation, other)
  - Build exemption determination algorithm in lib/exemptions/calculator.ts
  - Implement plain-language explanations for each category and exemption criteria
  - Create question branching logic (conditional questions based on previous answers)
  - Define data structure for storing user responses and exemption results
  - _Requirements: 3.1, 3.2_

- [ ] 6.2 Build exemption screening UI components
  - Create src/app/exemptions/page.tsx with screening flow
  - Build components/exemptions/ExemptionQuestion.tsx with dynamic rendering
  - Create components/exemptions/ExemptionCard.tsx for displaying exemption categories
  - Implement conditional question display based on responses
  - Add progress indicator and navigation controls (back, next)
  - Style with Material-UI for mobile-first experience
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6.3 Implement exemption determination and results
  - Wire up exemption calculation logic to UI
  - Create components/exemptions/ExemptionSummary.tsx for results
  - Implement clear explanations for exempt/non-exempt status
  - Add next steps guidance based on exemption status
  - Save exemption screening results to IndexedDB
  - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [ ] 6.4 Create exemption re-screening functionality
  - Add re-screening option in settings page
  - Create src/app/exemptions/rescreen/page.tsx
  - Build components/exemptions/ExemptionComparison.tsx for before/after comparison
  - Implement keep new results or revert to previous functionality
  - Maintain screening history in database
  - _Requirements: 3.8_

---

## 7. Compliance Calculations and Utilities

- [ ] 7.1 Implement compliance calculation logic
  - Create lib/utils/calculations.ts with calculateMonthlyCompliance function
  - Build hour summation across activity types
  - Implement income calculation with pay period conversion (hourly, daily, weekly, monthly)
  - Add compliance status determination (80 hours, $580 income threshold)
  - Write utility functions for date handling in lib/utils/date.ts
  - _Requirements: 5.1, 5.2, 5.6, 5.7, 5.8_

- [ ] 7.2 Create formatting and storage utilities
  - Build lib/utils/formatting.ts for currency, hours, dates
  - Implement number formatting for display
  - Create date formatting functions
  - Build lib/utils/storage.ts with helper functions for storage operations
  - Add utilities for calculating storage size, formatting bytes to MB/GB
  - _Requirements: Display formatting, 6.10_

---

## 8. Monthly Compliance Tracking - Calendar and Activities

- [ ] 8.1 Build calendar component for activity tracking (mobile-first, touch-optimized)
  - Create components/tracking/Calendar.tsx with touch-optimized UI (44px+ touch targets)
  - Implement month navigation with swipe gestures for mobile
  - Add visual indicators for dates with logged hours
  - Build date selection functionality with large touch targets
  - Style for mobile-first experience (320px+ width)
  - Test swipe gestures on real mobile device
  - _Requirements: 4.1, 4.2, 4.8, 12.2, 12.4_

- [ ] 8.2 Create activity entry form component
  - Build components/tracking/ActivityEntry.tsx with form fields
  - Implement form validation with Zod schema (0-24 hours, required fields)
  - Add activity type selector (work, volunteer, education)
  - Create income tracking fields with pay period selector
  - Integrate React Hook Form
  - _Requirements: 4.3, 4.4, 4.5, 4.6, 5.6_

- [ ] 8.3 Build tracking page and integrate calendar with activity entry
  - Create src/app/tracking/page.tsx
  - Wire up calendar to open activity entry on date click
  - Implement save activity functionality with IndexedDB
  - Add edit existing activity feature
  - Implement delete activity with confirmation dialog
  - Add duplicate entry warning
  - _Requirements: 4.7, 4.9_

- [ ] 8.4 Create activity list view
  - Build components/tracking/ActivityList.tsx with date grouping
  - Display activity details (type, hours, organization, income)
  - Add edit/delete actions for each activity
  - Implement empty state for no activities
  - _Requirements: 4.9_

- [ ] 8.5 Build batch activity entry component
  - Create components/forms/MultiDatePicker.tsx with checkbox selection
  - Build components/tracking/BatchActivityEntry.tsx form
  - Create src/app/tracking/batch/page.tsx
  - Implement preview of entries to be created
  - Add bulk save functionality
  - _Requirements: 4.10_

---

## 9. Compliance Dashboard and Visualization

- [ ] 9.1 Build compliance dashboard UI
  - Create components/tracking/ComplianceDashboard.tsx with status display
  - Implement progress indicators for hours and income using MUI components
  - Build visual compliance status (green/red, compliant/non-compliant)
  - Add hours remaining calculation and display
  - Integrate with compliance calculation utilities
  - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [ ] 9.2 Create month summary component
  - Build components/tracking/MonthSummary.tsx with breakdown by activity type
  - Display work hours, volunteer hours, education hours separately
  - Show total hours and compliance status
  - Add visual charts/graphs for data visualization
  - _Requirements: 5.9_

- [ ] 9.3 Implement month navigation and history
  - Add month navigation controls to tracking page
  - Implement month-to-month navigation
  - Update dashboard when month changes
  - Add compliance history view
  - _Requirements: 5.10_

- [ ] 9.4 Build income tracking component
  - Create components/tracking/IncomeTracker.tsx with monthly total display
  - Build threshold indicator ($580/month) with progress bar
  - Add income breakdown by pay period
  - Implement income compliance status badge
  - Integrate into compliance dashboard
  - _Requirements: 5.6, 5.7, 5.8_

---

## 10. Hardship and Good Cause Reporting

- [ ] 10.1 Create hardship event data model and storage
  - Define HardshipEvent interface in types/hardship.ts (id, userId, eventType, description, startDate, endDate, status)
  - Add hardship event types based on HR1 Section 71119 (medical emergency, family crisis, natural disaster, transportation failure, other)
  - Create hardship table in IndexedDB schema
  - Implement CRUD operations in lib/storage/hardship.ts
  - _Requirements: PWA spec - Hardship and Good Cause Reporting_

- [ ] 10.2 Build hardship reporting UI
  - Create src/app/hardship/page.tsx for reporting hardship events
  - Build components/hardship/HardshipForm.tsx with guided form
  - Implement event type selector with plain-language descriptions
  - Add date range picker for hardship period
  - Create description field with character limit and guidance
  - Add document attachment option (link to existing documents)
  - _Requirements: PWA spec - Hardship and Good Cause Reporting_

- [ ] 10.3 Create hardship history and status tracking
  - Build components/hardship/HardshipList.tsx to display reported events
  - Show hardship status (pending, approved, denied)
  - Add edit/delete functionality for pending hardships
  - Display hardship periods on compliance calendar with visual indicator
  - Integrate hardship periods into compliance calculations (exempt during hardship)
  - _Requirements: PWA spec - Hardship and Good Cause Reporting_

- [ ] 10.4 Add hardship reporting to navigation and dashboard
  - Add "Report Hardship" option to bottom navigation or settings
  - Display active hardship banner on compliance dashboard
  - Add hardship count to settings page
  - Include hardship events in export (JSON and Markdown)
  - _Requirements: PWA spec - Hardship and Good Cause Reporting_

---

## 11. Document Management - Capture and Storage

- [ ] 11.1 Create file upload component with image processing
  - Build components/forms/FileUpload.tsx with drag-and-drop zone
  - Implement file type validation (JPEG, PNG, HEIC)
  - Add file size validation (10MB max)
  - Create image preview functionality
  - Implement image compression utility in lib/utils/imageCompression.ts for files >5MB using canvas API
  - Add automatic compression trigger with quality adjustment (0.8 quality for >5MB files)
  - Display compression progress and final file size to user
  - Add image cropping capability (optional enhancement)
  - _Requirements: 7.8, 7.9_

- [ ] 11.2 Build document metadata form
  - Create components/documents/DocumentForm.tsx for metadata entry
  - Implement document type selector (pay-stub, volunteer-verification, school-enrollment, medical-documentation, other)
  - Add description and date fields
  - Build form validation with Zod
  - _Requirements: 6.4_

- [ ] 11.3 Implement document storage operations
  - Create document save functionality (metadata + blob) in lib/storage/documents.ts
  - Build document retrieval operations
  - Implement document deletion (metadata + blob)
  - Add storage quota checking before save
  - _Requirements: 6.5, 6.6, 6.9, 6.10_

- [ ] 11.4 Build document capture page
  - Create src/app/documents/page.tsx
  - Integrate FileUpload component
  - Wire up DocumentForm for metadata
  - Implement save flow (upload → metadata → save to IndexedDB)
  - Add success/error feedback
  - _Requirements: 6.1, 6.3, 6.4_

- [ ] 11.5 Implement camera integration (enhancement)
  - Create components/documents/CameraCapture.tsx with camera API
  - Build camera permission request handling
  - Implement photo preview with confirmation
  - Add image capture and blob creation
  - Integrate as alternative to file upload
  - _Requirements: 6.1, 6.2, 6.3_

---

## 12. Document Management - Organization and Viewing

- [ ] 12.1 Create document list and viewer components
  - Build components/documents/DocumentList.tsx with thumbnail gallery
  - Create components/documents/DocumentCard.tsx with metadata display
  - Build components/documents/DocumentViewer.tsx for full-size image display
  - Create src/app/documents/[id]/page.tsx for document detail view
  - Add submission status indicators
  - Implement empty state for no documents
  - _Requirements: 6.7, 6.8, 7.1, 7.2, 7.7_

- [ ] 12.2 Implement document filtering
  - Create components/documents/DocumentFilter.tsx with type and date range filters
  - Build filter UI (drawer on mobile, popover on desktop)
  - Implement filter application logic
  - Add active filter chips display
  - Wire up filtering to document list
  - _Requirements: 7.3_

- [ ] 12.3 Implement document submission tracking
  - Add mark as submitted functionality to document viewer
  - Create submission date recording in IndexedDB
  - Build submission status display in document list
  - Add filter by submission status
  - _Requirements: 7.6, 7.7_

- [ ] 12.4 Build document-activity linking functionality
  - Create components/documents/DocumentActivityLinker.tsx modal
  - Implement link from document view to activities
  - Build link from activity view to documents
  - Add visual indicators for linked items (badges, thumbnails)
  - Create unlink functionality
  - Update activity list to show document thumbnails
  - _Requirements: 7.4, 7.5_

---

## 13. Storage Management and Monitoring

- [ ] 13.1 Implement storage quota monitoring
  - Enhance hooks/useStorageQuota.ts with periodic checking (every minute)
  - Build storage usage calculation using navigator.storage.estimate()
  - Implement 80% threshold warning logic
  - _Requirements: 6.10_

- [ ] 13.2 Create storage warning and management UI
  - Build components/settings/StorageWarning.tsx banner component
  - Add storage warning to app layout when threshold exceeded
  - Create storage management section in settings page
  - Implement document size display and sorting (largest first)
  - Add bulk delete functionality for old documents (>6 months)
  - Show storage breakdown by type (documents, activities, profile)
  - _Requirements: 6.10_

---

## 14. Data Export Functionality

- [ ] 14.1 Implement JSON export utility
  - Create lib/export/json.ts with complete data serialization
  - Build export data structure with clear schema
  - Add export timestamp and application version metadata
  - Implement ISO 8601 date formatting
  - Create file download trigger function
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 14.2 Implement Markdown export utility
  - Create lib/export/markdown.ts with formatted report generation
  - Build report sections (profile summary, exemption status, monthly compliance, activity log, document list)
  - Implement proper Markdown formatting (headers, tables, lists)
  - Add date range filtering capability
  - Create file download trigger
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 14.3 Build export page and options UI
  - Create src/app/export/page.tsx
  - Build components/export/ExportOptions.tsx with format selection (JSON/Markdown)
  - Add date range filter controls
  - Implement privacy warning before export
  - Add export button with loading state
  - _Requirements: 8.7, 9.9_

- [ ] 14.4 Create export preview component
  - Build components/export/ExportPreview.tsx modal with tabs
  - Implement JSON preview with syntax highlighting
  - Add rendered Markdown preview
  - Create copy to clipboard functionality
  - Add download button in preview
  - _Requirements: 9.10_

- [ ] 14.5 Implement export history tracking
  - Create export history storage in IndexedDB
  - Build components/export/ExportHistory.tsx
  - Display last export date in settings
  - Add export history list with format and date
  - _Requirements: 7.10_

---

## 15. Data Import Functionality

- [ ] 15.1 Implement import file validation utility
  - Create lib/export/import.ts with JSON validation
  - Build schema validation for imported data structure using Zod
  - Validate data types, required fields, and data integrity
  - Check for valid date formats (ISO 8601)
  - Validate enum values (activity types, document types, etc.)
  - Implement error handling for invalid files with specific error messages
  - Add data preview generation (record counts by type)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 15.2 Build import upload UI
  - Create src/app/import/page.tsx
  - Build components/import/ImportUpload.tsx with file selection (drag-and-drop)
  - Implement file validation on upload
  - Display validation errors clearly
  - _Requirements: 10.1_

- [ ] 15.3 Create import preview component
  - Build components/import/ImportPreview.tsx with record counts
  - Display preview of data to be imported (activities, documents, exemptions, profile)
  - Show warning about document images not included
  - Add "Next" button to proceed to merge strategy
  - _Requirements: 10.4, 10.10_

- [ ] 15.4 Implement import merge strategies
  - Create components/import/ImportMergeDialog.tsx with strategy selection
  - Build "Replace All Data" option with DELETE confirmation
  - Implement "Merge with Existing" option with duplicate handling
  - Add detailed explanations for each strategy
  - _Requirements: 10.5, 10.6_

- [ ] 15.5 Complete import execution workflow
  - Implement import execution with progress indicator
  - Add transaction/rollback on failure
  - Build success messaging with imported record counts
  - Implement failure messaging with retry option
  - Redirect to appropriate page after successful import
  - _Requirements: 10.7, 10.8, 10.9_

---

## 16. Compliance Alerts and Proactive Features

- [ ] 16.1 Implement compliance prediction logic
  - Create lib/utils/predictions.ts with compliance forecasting
  - Calculate projected hours for current month based on historical patterns
  - Identify risk of non-compliance (< 60 hours with < 1 week remaining)
  - Generate recommendations for meeting requirements
  - _Requirements: PWA spec - Enhanced Analytics_

- [ ] 16.2 Build proactive alert system
  - Create components/tracking/ComplianceAlerts.tsx for displaying alerts
  - Implement alert types: approaching deadline, at-risk, missing documentation
  - Display alerts on compliance dashboard with priority indicators
  - Add dismissible alerts with "Don't show again" option
  - Store alert preferences in user profile
  - _Requirements: PWA spec - Enhanced Analytics_

- [ ] 16.3 Add deadline tracking and reminders
  - Calculate days remaining in current month
  - Display countdown on compliance dashboard
  - Show "X hours needed in Y days" messaging
  - Add visual urgency indicators (green/yellow/red based on risk)
  - _Requirements: PWA spec - Enhanced Analytics_

---

## 17. Agency Reporting and Verification Response

- [ ] 17.1 Create verification request data model
  - Define VerificationRequest interface in types/verification.ts (id, userId, requestDate, dueDate, requestedItems, status)
  - Add verification requests table to IndexedDB
  - Implement CRUD operations in lib/storage/verification.ts
  - _Requirements: PWA spec - Verification Responses_

- [ ] 17.2 Build verification response generator
  - Create lib/export/verificationResponse.ts for generating formatted responses
  - Implement response templates for common verification requests
  - Generate response with relevant activities, documents, and compliance summary
  - Format response as printable document (Markdown or PDF-ready HTML)
  - _Requirements: PWA spec - Verification Responses_

- [ ] 17.3 Create verification request tracking UI
  - Build src/app/verification/page.tsx for managing verification requests
  - Create components/verification/VerificationForm.tsx for logging requests
  - Implement components/verification/VerificationList.tsx for tracking requests
  - Add "Generate Response" button that creates formatted response document
  - Link verification requests to relevant documents and activities
  - _Requirements: PWA spec - Verification Responses_

- [ ] 17.4 Add agency contact information display
  - Create components/settings/AgencyContact.tsx to display state agency info
  - Show agency name, phone, email, website, address from state config
  - Add "Copy Contact Info" functionality
  - Display reporting deadlines and submission methods
  - Include in settings page and help section
  - _Requirements: State configuration, PWA spec_

---

## 18. Help System and User Guidance

- [ ] 18.1 Create help content and FAQ
  - Create components/help/HelpCenter.tsx with searchable help topics
  - Write help content for each major feature (onboarding, exemptions, tracking, documents, export)
  - Create FAQ section with common questions and answers
  - Add contextual help tooltips throughout the app using MUI Tooltip
  - Include links to relevant help topics from each page
  - _Requirements: User experience, PWA spec_

- [ ] 18.2 Build guided tours for first-time users
  - Create components/help/GuidedTour.tsx using a tour library (e.g., react-joyride)
  - Implement tours for: first activity entry, first document capture, first export
  - Store tour completion status in user profile
  - Add "Show Tour Again" option in settings
  - Make tours dismissible and resumable
  - _Requirements: User experience enhancement_

- [ ] 18.3 Add help page and support resources
  - Create src/app/help/page.tsx with help center
  - Organize help topics by category (Getting Started, Tracking Hours, Documents, Exemptions, Troubleshooting)
  - Add search functionality for help topics
  - Include video tutorials or animated GIFs for complex workflows
  - Add "Contact Support" section with agency contact info
  - _Requirements: User experience, PWA spec_

---

## 19. Internationalization Preparation (i18n)

- [ ] 19.1 Set up i18n infrastructure
  - Install next-intl or react-i18next for internationalization
  - Create locales directory structure (locales/en, locales/es)
  - Define translation keys for all UI text
  - Create English (en) translation file as baseline
  - Implement language detection and switching mechanism
  - _Requirements: Future consideration - Multi-language support_

- [ ] 19.2 Prepare Spanish translation structure
  - Create Spanish (es) translation file with placeholder translations
  - Document translation keys that need professional translation
  - Ensure all user-facing text uses translation keys
  - Test language switching functionality
  - Add language selector to settings page
  - _Requirements: Future consideration - Multi-language support_

---

## 20. Polish - Loading States and Empty States

- [ ] 20.1 Enhance loading states across the application
  - Ensure LoadingSpinner is used consistently with appropriate messages
  - Add skeleton screens using MUI Skeleton for lists and cards
  - Implement progress indicators for operations >2 seconds (import, export)
  - Review all async operations for loading feedback
  - _Requirements: 15.5, 15.6_

- [ ] 20.2 Create and implement empty state components
  - Build reusable components/common/EmptyState.tsx with icon, title, description, and action button props
  - Implement empty state for no activities logged (in ActivityList)
  - Add empty state for no documents captured (in DocumentList)
  - Create empty state for no exemptions found (in ExemptionSummary)
  - Add empty state for no export history
  - Add helpful guidance and call-to-action buttons for each
  - _Requirements: User experience enhancement_

---

## 21. Accessibility and Mobile Optimization (Final Polish)

- [ ] 21.1 Comprehensive accessibility audit and fixes
  - Audit all interactive elements and add ARIA labels where missing
  - Verify full keyboard navigation support with proper tab order
  - Ensure visible focus indicators for all focusable elements
  - Verify ARIA live regions for dynamic content updates (snackbars, loading states)
  - Confirm proper heading hierarchy (h1 → h2 → h3) and semantic HTML throughout
  - Add skip navigation links if missing
  - _Requirements: 13.1, 13.2, 13.3, 13.6, 13.7_

- [ ] 21.2 Mobile device testing and optimization
  - Review all touch targets confirm 44px minimum size
  - Test swipe gestures work smoothly (calendar navigation)
  - Verify form inputs use correct mobile types (number, date, tel)
  - Test scrolling performance on real devices (60fps target)
  - Test device orientation changes (portrait/landscape) and layout adaptation
  - Verify responsive data tables work on small screens
  - Test on iOS Safari 14+, Android Chrome 90+, Samsung Internet
  - Fix any mobile-specific issues discovered
  - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.10_

- [ ] 21.3 Visual accessibility verification
  - Verify 4.5:1 contrast ratio for all normal text
  - Ensure 3:1 contrast ratio for interactive elements
  - Confirm descriptive alt text for all images and icons
  - Test 200% zoom without loss of functionality
  - Verify color is not the only means of conveying information
  - _Requirements: 13.4, 13.5, 13.8, 13.9_

---

## 22. Privacy, Security, and Data Management

- [ ] 22.1 Implement data encryption for sensitive fields
  - Enhance lib/storage/encryption.ts with encryption/decryption functions
  - Implement encryption on save for sensitive profile data (name, DOB)
  - Implement decryption on load
  - Ensure no sensitive data logged to console in production mode
  - _Requirements: 14.1, 14.6_

- [ ] 22.2 Implement comprehensive data deletion
  - Create delete all data functionality in settings with confirmation dialog
  - Build permanent data deletion from all IndexedDB tables
  - Add confirmation requiring typing "DELETE"
  - Test data cleanup thoroughly
  - _Requirements: 2.7, 14.4, 14.5_

- [ ] 22.3 Add privacy warnings and comprehensive policy
  - Implement privacy warning before export (modal dialog)
  - Create comprehensive privacy policy text in PrivacyPolicy component
  - Add data handling explanations (what's stored, how it's used)
  - Ensure privacy policy is accessible and easy to understand
  - Add privacy notice on first app use
  - _Requirements: 8.7, 14.3, 14.9, 14.8_

---

## 23. Testing Infrastructure (Optional)

- [ ]* 23.1 Set up Jest and React Testing Library
  - Configure Jest with TypeScript support in jest.config.js
  - Set up React Testing Library
  - Create tests/setup.ts with test utilities
  - Create mocks for IndexedDB in tests/__mocks__
  - Configure coverage reporting (80% threshold)
  - Add test scripts to package.json
  - _Requirements: Testing strategy_

- [ ]* 23.2 Write unit tests for core utilities
  - Test compliance calculation functions in lib/utils/calculations.test.ts
  - Test income conversion utilities
  - Test date formatting and manipulation
  - Test validation schemas (Zod)
  - Test encryption/decryption utilities
  - _Requirements: Testing strategy_

- [ ]* 23.3 Write component unit tests
  - Test major components for rendering (ComplianceDashboard, Calendar, ActivityEntry)
  - Test user interactions and form submissions
  - Test validation logic and error states
  - Test accessibility with @axe-core/react
  - Aim for 80% code coverage
  - _Requirements: Testing strategy_

- [ ]* 23.4 Set up Playwright for E2E testing
  - Configure Playwright with TypeScript in playwright.config.ts
  - Create E2E test utilities in tests/e2e/utils
  - Set up test data fixtures
  - Configure test browsers (Chromium, WebKit)
  - _Requirements: Testing strategy_

- [ ]* 23.5 Write integration and E2E tests
  - Test complete onboarding flow (profile creation → exemption screening)
  - Test activity entry and compliance calculation workflow
  - Test document capture, viewing, and linking
  - Test export/import workflows
  - Test offline functionality
  - _Requirements: Testing strategy_

---

## 24. Performance Optimization and PWA Enhancement

- [ ] 24.1 Optimize build for production
  - Implement code splitting for routes (lazy loading)
  - Optimize bundle size (<5MB target)
  - Configure service worker caching strategies in next.config.js
  - Optimize images and assets
  - Test build output size
  - _Requirements: 11.2, 11.3, 11.7, 11.10_

- [ ] 24.2 Test and enhance offline functionality
  - Test all features work offline
  - Verify service worker caching is working
  - Test offline indicator displays correctly in AppBar
  - Implement error messages for network-only actions when offline
  - Ensure data persists across sessions
  - Test PWA installation and standalone mode
  - Implement service worker update notifications
  - Add service worker cache versioning and cleanup logic
  - _Requirements: 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10_

- [ ] 24.3 Performance testing and optimization
  - Test initial load time on 3G network (<3 seconds target)
  - Optimize initial load time: code splitting, lazy loading, asset optimization
  - Verify component render times (<100ms target)
  - Test scrolling performance (60fps target)
  - Optimize any slow operations (database queries, calculations)
  - Run Lighthouse performance audit (target: 90+ score)
  - Implement performance monitoring for key metrics
  - _Requirements: 12.5, 12.8, 12.9_

---

## 25. Final QA, Documentation, and Deployment

- [ ] 25.1 Run comprehensive accessibility audit
  - Run Lighthouse accessibility audit (target: 100 score)
  - Run axe DevTools audit
  - Test with screen reader (NVDA or VoiceOver)
  - Test keyboard navigation throughout app
  - Fix any accessibility issues found
  - _Requirements: 13.10_

- [ ] 25.2 Cross-browser and device testing
  - Test on iOS Safari 14+
  - Test on Android Chrome 90+
  - Test on Samsung Internet
  - Test on desktop browsers (Chrome, Firefox, Safari, Edge)
  - Test various screen sizes (320px to 1920px)
  - Fix any browser-specific issues
  - _Requirements: 12.10_

- [ ] 25.3 Enhance project documentation
  - Update README.md with complete usage instructions
  - Create user guide with screenshots and workflows
  - Document component interfaces and APIs
  - Update CHANGELOG.md with all changes
  - Create CONTRIBUTING.md if open source
  - _Requirements: Documentation_

- [ ] 25.4 Enhance CI/CD pipeline with testing
  - Add automated testing to .github/workflows/deploy.yml (if tests implemented)
  - Add test coverage reporting
  - Configure deployment gates (tests must pass)
  - Optimize build caching
  - _Requirements: Deployment_

- [ ] 25.5 Final verification and deployment
  - Verify all 15 requirements are met
  - Test complete user workflows end-to-end
  - Fix any remaining bugs or issues
  - Deploy to GitHub Pages
  - Verify production deployment works correctly
  - Create release notes
  - _Requirements: All requirements_

---

## Implementation Notes

### Task Execution Guidelines
- **Complete tasks in order** - Each task builds on previous work
- **Integrate immediately** - All code should be functional and integrated by task completion
- **Test as you go** - Verify each feature works before moving to the next
- **Mobile-first** - Build for mobile screens first, then enhance for larger screens
- **Accessibility from the start** - Don't bolt on accessibility later

### Task Organization Rationale
The tasks follow industry best practices for greenfield development:

1. **Scaffolding (1.x)** - Set up project structure, dependencies, and build pipeline
2. **Data Layer (2.x)** - Define types and database schema before building UI
3. **UI Foundation (3.x-4.x)** - Create reusable components and state management
4. **Core User Workflows (5.x-10.x)** - Build primary user-facing features in order of user journey
   - Onboarding → Exemptions → Tracking → Dashboard → Hardship Reporting
5. **Supporting Features (11.x-15.x)** - Document management, storage, export/import
6. **Enhancements (16.x-19.x)** - Alerts, verification, help, internationalization
7. **Polish (20.x-22.x)** - Loading states, accessibility, privacy
8. **Testing (23.x)** - Optional comprehensive test coverage
9. **Deployment (24.x-25.x)** - Optimize, document, and ship

### Critical Dependencies
- **Must complete in order:**
  - 1.x (Scaffolding) → 2.x (Data Layer) → 3.x (UI Foundation) → 4.x (State Management)
  - 5.x (Onboarding) before 6.x (Exemptions) before 8.x (Tracking)
  - 7.x (Calculations) before 9.x (Dashboard)
  - 9.x (Dashboard) before 10.x (Hardship Reporting) - hardship integrates with compliance
  - 11.x (Document Storage) before 12.x (Document Organization)
  - 14.x (Export) before 15.x (Import)

- **Can be parallelized:**
  - After 4.x is complete, features 5-9 can be worked on in parallel by different developers
  - Sections 10-13 (Hardship, Documents, Storage) can be parallelized after Section 9
  - Enhancement tasks (16-19) can be done in any order after core features are complete

### Testing Approach
- **Optional test tasks (marked with *)** - Focus on comprehensive test coverage
- **Recommended approach:** Write basic tests alongside implementation, comprehensive tests later
- **E2E tests** validate complete user workflows
- **Accessibility tests** ensure WCAG 2.1 AA compliance

### Quality Standards
- **TypeScript strict mode** enforced throughout
- **ESLint and Prettier** for code quality and consistency
- **80% minimum code coverage** (if tests are implemented)
- **WCAG 2.1 AA** accessibility compliance required
- **Performance targets:**
  - <100ms component render times
  - <3 second initial load time on 3G networks
  - 60fps scrolling and animations
  - <5MB total bundle size

### Development Tips
- **Mobile-first is mandatory** - Build for 320px width first, then enhance for larger screens
- **Test on real devices** early and often (iOS Safari, Android Chrome) - don't rely only on browser DevTools
- **44px minimum touch targets** - All interactive elements must be at least 44px for touch
- **Use the design document** as reference for component specifications
- **Reference requirements** to ensure all acceptance criteria are met
- **Check accessibility** with keyboard navigation and screen readers as you build
- **Monitor bundle size** to stay under 5MB target
