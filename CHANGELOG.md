# Changelog

All notable changes to HourKeep will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.1.0] - 2025-11-18

### Changed - UX Language Refinement & UI Simplification

Refined user-facing language throughout the app to avoid making definitive legal claims about exemption and compliance status, and simplified the interface by removing goal tracking components.

#### Language Softening

- **Exemption language** - Changed "You're exempt" to "You may be exempt" throughout exemption calculator to avoid making definitive legal determinations
- **Compliance language** - Changed "stay compliant" to "document compliance" in recommendation engine to emphasize documentation over legal status
- **Recommendation wording** - Updated income and hour tracking recommendations to use "could meet" instead of "meets" requirements

#### UI Simplification

- **Removed Goal Progress component** - Eliminated goal tracking UI from tracking and settings pages to simplify the interface
- **Removed compliance status chip** - Removed "Currently Compliant" / "Needs More Activities" chip from assessment results page
- **Streamlined settings** - Removed goal configuration section from settings page

#### Onboarding Improvements

- **Updated icon styling** - Improved visual consistency in ProfileForm and GettingStartedContextual with circular backgrounds for add icon
- **Better icon sizing** - Consistent 32px sizing for icons in onboarding lists
- **Improved spacing** - Better padding and alignment in list items

#### Dashboard Guidance Updates

- **Simplified guidance** - Updated dashboard help text to be more direct and actionable
- **Removed assessment-first flow** - Guidance now focuses on core actions (add hours/income, export data)
- **Added "add" icon** - New circular icon for the "add" action in guidance

### Technical Details

- Updated 10 files across exemption calculator, recommendation engine, and UI components
- Softened language in 13 exemption scenarios and 5 recommendation scenarios
- Removed GoalProgress component usage from 2 pages
- Improved icon styling in 3 onboarding components
- Updated dashboard guidance content and icon rendering

---

## [7.0.0] - 2025-11-18

### Added - Context-Aware Onboarding & Assessment Flow Alignment 🎯

Two major features that transform how users start with HourKeep and ensure consistent experience across assessment flows.

#### Context-Aware Onboarding Flow

A personalized onboarding experience that adapts to each user's situation - whether they received a notice, are applying for Medicaid, preparing for renewal, or tracking proactively.

**Notice Context Capture:**

- **Notice details question** - Capture months required (1-6) and deadline date when user has received agency notice
- **Smart routing** - Different follow-up questions based on whether user has notice
- **Goal tracking** - Store user's compliance goal (months needed, deadline) in profile
- **Deadline awareness** - System knows when user needs to respond and can show countdown

**Personalized Getting Started:**

- **Contextual guidance** - Different next steps based on user's situation (notice vs. proactive)
- **Notice users** - See deadline, required months, and action steps (document, add documents, export)
- **Proactive users** - See continuous tracking benefits and renewal timeline
- **Recommendation display** - Shows assessment recommendation (exemption, income, hours)
- **Dashboard configuration** - Automatically sets compliance mode based on recommendation

**Enhanced Components:**

- **ProfileForm** - Added skip option and optional deadline field
- **NoticeQuestion** - Redesigned with radio button interface for better UX
- **IntroductionScreen** - Supports onboarding variant with updated copy
- **QuestionWrapper** - Consistent navigation with back/continue buttons

**Goal Progress Tracking:**

- **Dashboard integration** - Shows progress toward compliance goal if user has one
- **Month-by-month view** - Visual indicators for each required month (✓ compliant, incomplete)
- **Deadline countdown** - Shows days remaining to respond to notice
- **Add month button** - Easily extend tracking to additional months
- **Completion detection** - Recognizes when goal is met

**Goal Configuration:**

- **Settings management** - Edit months required and deadline anytime
- **Mode switching** - Toggle between goal-based and continuous tracking
- **Profile updates** - Changes save to onboarding context in profile

**Completion Messaging:**

- **Goal completion detection** - Automatic recognition when all required months are compliant
- **Next steps guidance** - Prompts to export report and submit to agency
- **Renewal reminders** - Reminds about future 6-month renewals
- **Continue tracking option** - Encourages ongoing use for future renewals

#### Assessment Flow Alignment

Brings "How to HourKeep" assessment into alignment with the modern onboarding flow, ensuring consistent UX patterns and shared components.

**Notice Details in Assessment:**

- **Notice details step** - Added to How to HourKeep flow (previously only in onboarding)
- **Months and deadline capture** - Same questions as onboarding for consistency
- **Notice context storage** - Saved in assessment responses for future reference
- **Pre-population support** - Notice details load from previous assessment

**Getting Started Screen:**

- **Replaces immediate redirect** - Users see contextual guidance before returning to dashboard
- **Shows recommendation** - Displays assessment result (exemption, income, hours)
- **Contextual content** - Different guidance for notice vs. proactive users
- **Dashboard configuration** - Sets compliance mode and seasonal worker status
- **Profile integration** - Updates onboarding context with notice details

**Component Pattern Consistency:**

- **Box wrappers** - Replaced QuestionWrapper with consistent Box (py: 2) pattern
- **Standalone components** - NoticeQuestion, NoticeFollowUp used without wrappers
- **Visual consistency** - Same padding, spacing, and layout across both flows
- **Navigation patterns** - Consistent back/continue button placement

**Progress Calculation Updates:**

- **Notice section** - 15-25% progress (notice, noticeDetails, noticeFollowUpWithNotice)
- **Exemption section** - 25-60% progress (12 questions)
- **Work section** - 60-95% progress (work and activity questions)
- **Getting started** - 95% progress (final screen)

**Visual Consistency Fixes:**

- **Primary color branding** - Changed AssessmentBadge and DashboardGuidance from info to primary color
- **GoalProgress styling** - Improved chip styling with explicit colors and better contrast
- **Deadline chip** - White text on primary/warning background for better visibility

**Dashboard Integration:**

- **Event dispatching** - Assessment completion triggers dashboard refresh
- **Compliance mode** - Automatically set based on recommendation (income vs. hours)
- **Seasonal worker** - Configured if seasonal income tracking recommended
- **Profile updates** - Onboarding context updated with assessment results
- **GoalProgress display** - Shows on income tracking view when user has notice context

### Changed

- **Onboarding flow** - Now captures notice details and provides contextual getting started screen
- **How to HourKeep flow** - Added notice details, getting started screen, and consistent component patterns
- **Dashboard** - Shows goal progress when user has compliance goal
- **Settings** - Added goal configuration section
- **Tracking page** - Shows GoalProgress component for income mode when user has onboarding context
- **Assessment responses** - Extended with noticeContext field (months required, deadline)
- **User profile** - Extended with onboardingContext field (hasNotice, months, deadline, completedAt)

### Technical Details

**New Components:**

- `GettingStartedContextual` - Contextual final screen with personalized guidance
- `NoticeDetailsQuestion` - Capture months required and deadline
- `GoalProgress` - Dashboard component showing progress toward compliance goal
- `CompletionMessage` - Celebration and next steps when goal is met

**Enhanced Components:**

- `ProfileForm` - Skip option, deadline field, improved validation
- `NoticeQuestion` - Radio button interface, better mobile UX
- `IntroductionScreen` - Onboarding variant support
- `QuestionWrapper` - Consistent navigation patterns
- `AssessmentBadge` - Primary color branding
- `DashboardGuidance` - Primary color branding

**Data Model Extensions:**

- `OnboardingContext` - hasNotice, monthsRequired, deadline, completedAt
- `AssessmentResponses.noticeContext` - monthsRequired, deadline
- Both stored in IndexedDB, backward compatible

**Assessment Flow Updates:**

- Added noticeDetails, noticeFollowUpWithNotice, gettingStarted steps
- Updated progress calculation for new steps
- Replaced QuestionWrapper with Box wrappers throughout
- Added event dispatching for dashboard refresh

**Implementation Stats:**

- 2 comprehensive specs created (onboarding-redesign, assessment-flow-alignment)
- 14 files changed in onboarding implementation
- 11 files changed in assessment alignment
- 90% component reuse achieved (only 3 new components)
- All 19 tasks completed from onboarding spec
- All 14 tasks completed from assessment alignment spec

### Developer Experience

- Created comprehensive onboarding redesign spec in `.kiro/specs/onboarding-redesign/`
- Created assessment flow alignment spec in `.kiro/specs/assessment-flow-alignment/`
- Component reuse analysis documented in `reuse-analysis.md`
- Time savings analysis: 44 hours vs. 98 hours (55% reduction)
- Clear migration path with backward compatibility
- No breaking changes to existing data structures

---

## [6.1.0] - 2025-11-17

### Changed - "How to HourKeep" Rebrand 🎨

Renamed the "Find Your Path" assessment feature to "How to HourKeep" throughout the entire application to better align with the app's core value proposition and create a more cohesive brand identity.

#### Route Changes

- **Assessment route** - Renamed `/find-your-path` to `/how-to-hourkeep`
- **Results route** - Renamed `/find-your-path/results` to `/how-to-hourkeep/results`
- **Exemptions redirect** - Updated to point to new assessment route

#### Branding Updates

- **Feature name** - "Find Your Path" → "How to HourKeep" throughout UI
- **Tagline** - Added "Keep your hours, keep your coverage" messaging
- **Assessment badge** - Updated title, description, and button text
- **Introduction screen** - Updated title and description
- **Dashboard guidance** - Updated step descriptions and action links
- **Help text** - Updated references throughout content

#### Visual Identity

- **App icons** - Redesigned SVG and PNG icons (192x192, 512x512)
- **Favicon** - Updated with new design
- **Manifest** - Changed background color to #FAF9F7 (warm off-white)
- **Tracking page header** - Added HourKeep logo with clock icon
- **Icon link tags** - Added proper icon declarations in layout

#### Documentation

- **README** - Updated feature description
- **ROADMAP** - Updated feature name and descriptions

### Technical Details

- Renamed directory: `src/app/find-your-path/` → `src/app/how-to-hourkeep/`
- Updated 10 component files with new branding
- Updated 3 documentation files
- Redesigned 5 icon files
- No breaking changes to data structures or APIs
- All existing user data remains compatible

---

## [6.0.0] - 2025-11-14

### Added - Find Your Path Assessment 🧭

A comprehensive guided assessment that helps Medicaid beneficiaries discover the easiest way to maintain their coverage. Instead of forcing users to figure out which compliance method to use, Find Your Path combines exemption screening with work situation analysis to provide personalized recommendations, reducing decision paralysis and helping users choose the most appropriate and least burdensome path.

#### Assessment Flow

- **Introduction screen** - Clear explanation of what the assessment determines
- **Notice screening** - Upfront question about receiving agency notice
- **Smart routing** - Skip to compliance methods if user received notice and wants to skip exemption check
- **Exemption screening** - Complete 5-category exemption questionnaire integrated into flow
- **Work situation questions** - Employment status, income level, seasonal work, activity participation
- **Progress saving** - Resume incomplete assessments where you left off
- **Estimation tools** - Simple calculators to convert weekly to monthly values
- **Results page** - Personalized recommendation with clear reasoning and alternatives

#### Recommendation Engine

- **Intelligent analysis** - Evaluates exemption status, income, hours, and activities
- **Primary recommendation** - Suggests the easiest compliance method for your situation
- **Alternative methods** - Shows other viable options you can explore
- **Effort estimation** - Indicates expected effort level (low, medium, high)
- **Compliance status** - Shows if you're already compliant based on current situation
- **Plain language reasoning** - Clear explanation of why each method was recommended

#### Compliance Methods

The assessment recommends one of four paths:

1. **Exemption** - You qualify for an exemption and don't need to track anything
2. **Income Tracking** - Easiest if you earn $580+ per month consistently
3. **Seasonal Income Tracking** - Best for variable income that averages $580+ over 6 months
4. **Hour Tracking** - Best if income is below threshold but you work/volunteer 80+ hours

#### Dashboard Integration

- **Assessment badge** - Prominent dashboard element showing status and recommendation
- **Take assessment prompt** - Clear call-to-action for users who haven't completed it
- **View details** - Quick access to full results and reasoning
- **Retake assessment** - Easy re-assessment when circumstances change
- **Status indicators** - Visual display of exemption status and recommended method

#### Assessment History

- **Track over time** - See how your situation and recommendations have changed
- **Previous results** - Access past assessment results
- **Comparison view** - Understand what changed between assessments
- **Date tracking** - Know when each assessment was completed

#### Technical Implementation

- **3 new database tables** - assessmentProgress, assessmentResults, assessmentHistory
- **12 new components** - IntroductionScreen, ProgressIndicator, QuestionWrapper, various question types, EstimationTools, AssessmentBadge, AssessmentHistory
- **Recommendation engine** - Smart logic analyzing all factors to suggest optimal path
- **Progress persistence** - Save and resume incomplete assessments
- **Unified exemption flow** - Replaces standalone exemption screening with integrated approach

#### User Experience Improvements

- **Reduced decision paralysis** - System guides users instead of overwhelming them with choices
- **Personalized guidance** - Recommendations based on individual circumstances
- **Exploration encouraged** - Users can view alternatives and make informed choices
- **Mobile-optimized** - Touch-friendly interface with clear navigation
- **Accessible** - Screen reader support and keyboard navigation
- **Plain language** - No jargon, clear explanations throughout

### Changed

- **Exemption screening page** - Now redirects to Find Your Path assessment
- **Dashboard exemption badge** - Replaced with comprehensive assessment badge
- **Onboarding flow** - Assessment presented after initial profile setup (can be skipped)

### Technical Notes

- Database schema version bumped to v6
- Assessment data stored at individual level with full history
- Recommendation engine uses deterministic logic for consistent results
- Progress state allows users to resume multi-step assessment
- All assessment data encrypted and stored locally

---

## [5.0.0] - 2025-11-11

### Added - Income Tracking 💰

A comprehensive income tracking system that provides an alternative way to meet Medicaid work requirements. Users can now track earned income ($580/month threshold) instead of hours, with full feature parity including document capture, compliance status, and seasonal worker support.

#### Income Tracking Core Features

- **Compliance mode selector** - Toggle between hours and income tracking for each month
- **Income entry logging** - Record income with dates, amounts, sources, and pay periods
- **Pay period conversion** - Automatic monthly equivalent calculation (daily, weekly, bi-weekly, monthly)
- **Multiple income sources** - Track multiple jobs or income streams per month
- **Income compliance status** - Real-time progress toward $580 threshold with visual indicators
- **Income breakdown** - See total income split by source/employer

#### Pay Period Conversion

- **Daily pay** - Amount × 30 = Monthly equivalent
- **Weekly pay** - Amount × 4.33 = Monthly equivalent
- **Bi-weekly pay** - Amount × 2.17 = Monthly equivalent
- **Monthly pay** - Amount = Monthly equivalent (no conversion)
- **Real-time calculation** - See monthly equivalent as you type
- **Configurable threshold** - $580 based on federal minimum wage ($7.25 × 80 hours)

#### Seasonal Worker Support

- **6-month income averaging** - For workers with variable seasonal income
- **Seasonal worker toggle** - Enable at user-month level (not per entry)
- **6-month history view** - Visual display of income across 6 months
- **Rolling average calculation** - Automatic calculation of average monthly income
- **Compliance based on average** - Meet requirements via 6-month average instead of single month
- **IRS definition** - Based on section 45R(d)(5)(B) for seasonal workers

#### Income Document Capture

- **Reuse existing system** - Same document capture as activity tracking
- **Pay stub capture** - Photograph or upload pay stubs
- **Gig work screenshots** - Uber, DoorDash, Instacart earnings
- **Bank statements** - Upload statements showing deposits
- **1099 forms** - Self-employment income documentation
- **Payment platforms** - PayPal, Venmo, Cash App screenshots
- **Document viewer** - Full-size viewing with pinch-to-zoom

#### Comprehensive Help System

- **Income tracking help** - Threshold explanation, earned vs. unearned income, gig economy examples
- **Seasonal worker help** - IRS definition, 6-month averaging, step-by-step calculation
- **Hour tracking help** - Activity definitions, combinations, edge cases (for comparison)
- **Enhanced document help** - Income document examples and guidance
- **Contextual help icons** - Help available throughout income tracking UI
- **Plain language** - 8th grade reading level, no jargon

#### Mode Switching & Data Preservation

- **Flexible switching** - Change between hours and income modes anytime
- **Data preservation** - Both datasets preserved when switching modes
- **Warning dialogs** - Clear explanation before mode changes
- **Per-month tracking** - Compliance mode tracked separately for each month
- **No data loss** - Switch modes without losing any information

#### Enhanced Export

- **Income data included** - All income entries, summaries, and documents
- **Seasonal worker data** - 6-month history and averages when applicable
- **Compliance mode tracking** - Shows which method used per month
- **Export version 2.0** - Updated format to include income tracking
- **Backward compatible** - Works with existing export consumers

### Added - Activity Tracking Enhancements

#### Duplicate Functionality

- **Duplicate to multiple dates** - Replicate activities across multiple days
- **Multi-date selection** - Pick multiple dates from calendar dialog
- **Time saver** - Quickly log recurring activities (same shift, regular volunteer hours)
- **Works for income too** - Duplicate income entries to multiple dates
- **Preserves all data** - Documents, metadata, and details copied to each date

#### Redesigned Activity List

- **Card-based layout** - Modern card design for each activity
- **Month grouping** - Activities grouped by month with headers
- **Better document indicators** - Clear display of attached documents
- **Improved actions** - Edit, delete, and duplicate buttons
- **Mobile-optimized** - Better touch targets and spacing

#### UI Improvements

- **Next.js Image optimization** - Replaced img tags for better performance
- **Enhanced document management** - Improved UI in activity form
- **Better form layouts** - Reordered fields for better UX
- **Exemption badge mobile** - Improved responsiveness on small screens
- **Exemption details dialog** - Quick reference for exemption status

### Changed

- **Database schema** - Upgraded to v5 with 5 new tables for income tracking
- **Tracking page** - Now supports both hours and income modes with mode selector
- **Dashboard** - Shows compliance status for active mode (hours or income)
- **Export page** - Updated to include income data and compliance modes
- **Settings page** - Exemption section clarifies voluntary tracking for exempt users
- **Activity form** - Enhanced document management UI
- **Activity list** - Complete redesign with card layout and grouping

### Technical Details

- Created comprehensive income tracking spec (design, requirements, tasks)
- Added 12 new components in `src/components/income/` and `src/components/compliance/`
- Added 3 new help components in `src/components/help/`
- Implemented income storage layer in `src/lib/storage/income.ts`
- Implemented income document storage in `src/lib/storage/incomeDocuments.ts`
- Created pay period conversion utilities in `src/lib/utils/payPeriodConversion.ts`
- Added complete TypeScript interfaces in `src/types/income.ts`
- Database version 5 with automatic migration from v4
- Enhanced export functionality to include income data
- Updated ROADMAP with 15 detailed future features
- 31 files changed, 6,505 insertions, 855 deletions

### Developer Experience

- Completed all 21 tasks across 5 phases of income-tracking spec
- Comprehensive documentation in `.kiro/specs/income-tracking/`
- Clear migration path with no breaking changes
- Full TypeScript coverage for income types
- Reusable component patterns for future features

---

## [4.5.0] - 2025-11-10

### Added - Activity Definitions Help System 💡

A comprehensive contextual help system that explains Medicaid work requirements in plain language, right where users need it. This feature helps users understand what activities count toward their 80-hour requirement, how to combine activities, and provides 20+ edge case examples.

#### Contextual Help Throughout the App

- **Activity form help** - Help icons next to each activity type (work, volunteer, education, work programs)
- **Income threshold guidance** - Clear explanation of the $580/month alternative requirement
- **Dashboard guidance card** - First-time user onboarding with 4 key steps
- **Document verification help** - Guidance on what documents to capture and why
- **Mobile-responsive tooltips** - Desktop tooltips convert to bottom sheets on mobile

#### Comprehensive Activity Definitions

- **Work activities** - What counts as paid employment, including edge cases
- **Volunteer activities** - Unpaid community service requirements and examples
- **Education activities** - School enrollment requirements (half-time or more)
- **Work programs** - Job training and workforce development programs
- **Job searching doesn't count** - Critical clarification that job searching is NOT a qualifying activity

#### Edge Case Examples (20+ Scenarios)

- **Work edge cases** - Gig work, on-call shifts, training time, commute time
- **Volunteer edge cases** - Religious activities, family caregiving, informal help
- **Education edge cases** - Online classes, part-time enrollment, study time
- **Income edge cases** - Tips, bonuses, reimbursements, varying income
- **Clear visual indicators** - Green checkmarks (counts), red X (doesn't count), warning icons (varies)

#### Income Threshold Guidance

- **$580/month threshold** - Clear explanation with calculation (80 hours × $7.25)
- **What counts as income** - Wages, salaries, tips, commissions, self-employment
- **What doesn't count** - Benefits, gifts, loans, reimbursements
- **Seasonal worker rules** - 6-month averaging calculation with step-by-step example
- **Income vs hours comparison** - Understand the two ways to meet requirements

#### Activity Combination Rules

- **80-hour minimum** - Clear explanation that activities can be combined
- **Combination examples** - 40 hours work + 40 hours volunteer = compliant
- **Flexible tracking** - Mix and match activities to reach 80 hours

#### Dashboard Onboarding

- **First-time guidance** - 4-step guide for new users (exemptions, calendar, review, export)
- **Dismissible card** - Hide guidance once you're familiar with the app
- **Restore from help button** - Bring back guidance anytime from header
- **Action links** - Direct links to exemption screening, tracking, and export

#### Plain Language Content

- **8th grade reading level** - All content reviewed with Hemingway Editor
- **Short sentences** - Average 15 words per sentence
- **Active voice** - "You" language throughout
- **No jargon** - Technical terms explained in simple language
- **HR1 source references** - All definitions cite Section 71119 for accuracy

#### Mobile-First Design

- **Touch-friendly targets** - All interactive elements 44px minimum
- **Bottom sheet modals** - Help content slides up from bottom on mobile
- **Readable text** - Increased font sizes (13px minimum)
- **Smooth animations** - 250ms slide-up, 300ms expand/collapse
- **Tested at 320px** - Works on smallest mobile screens

### Changed

- **Activity form** - Added help icons next to activity type selector
- **Dashboard** - Added guidance card for first-time users
- **Tracking page** - Integrated help button in header to restore guidance
- **Help tooltips** - Increased font size from 0.75rem to 0.8125rem for better readability
- **Chip components** - Increased height from 20px to 22px for better touch targets

### Technical Details

- Created comprehensive help content in `src/content/helpText.ts`
- Built 6 new reusable components in `src/components/help/` and `src/components/activities/`
- Added HelpTooltip component with desktop/mobile responsive behavior
- Added EdgeCaseExamples component with visual indicators
- Added ActivityFormHelp component for inline activity guidance
- Added IncomeHelp component for income threshold guidance
- Added DashboardGuidance component for first-time onboarding
- Added HelpSection component for collapsible content sections
- Added DocumentVerificationHelp component for document guidance
- All content sourced from HR1 Section 71119 and CFA Service Blueprint
- Comprehensive plain language review completed
- Mobile optimization tested at 320px, 375px, and 414px widths

### Developer Experience

- Completed all 9 tasks across 5 phases of activity-definitions-help spec
- Plain language review summary documented
- Mobile optimization testing completed
- Reusable component patterns established for future help content

---

## [4.4.0] - 2025-11-10

### Changed - Warm Neutral Theme 🎨

Refreshed HourKeep's visual design with a warm, approachable color palette that moves beyond generic Material-UI while maintaining simplicity and accessibility.

#### New Color Palette

- **Primary color** - Muted purple (#6B4E71) - warm and approachable instead of generic blue
- **Secondary color** - Warm tan/gold (#D4A574) - complements the purple beautifully
- **Success color** - Earthy green (#5C8D5A) - for compliance status indicators
- **Warning color** - Warm orange (#D97D54) - for attention items
- **Background** - Warm off-white (#FAF9F7) - easier on eyes than stark white

#### Design Improvements

- **More rounded corners** - Increased from 12px to 16px for a friendlier feel
- **Pill-shaped chips** - Activity type badges now have 20px border radius
- **Thicker progress bars** - Increased from 10px to 12px for better visibility
- **Softer shadows** - Purple-tinted shadows that match the new color scheme
- **Better button styling** - Removed shouty uppercase text, added hover effects
- **Improved typography** - Tighter letter spacing for a modern look

#### Why This Theme?

- **Distinctive** - Purple/tan palette stands out from typical blue apps
- **Friendly** - Warm colors are psychologically calming for users dealing with stressful benefit requirements
- **Professional** - Still trustworthy and official-feeling
- **Accessible** - Maintains good contrast ratios for readability
- **Supportive** - Feels like a community tool rather than a government form

### Technical Details

- Updated theme configuration in `src/theme/theme.ts`
- Updated meta theme-color in `src/app/layout.tsx` for mobile browser chrome
- Added component-level style overrides for buttons, papers, chips, and progress bars
- No breaking changes - purely visual enhancement

### Developer Experience

- Created theme exploration document in `THEME_OPTIONS.md` with 5 design alternatives
- Created interactive preview page in `theme-preview.html` for visual comparison
- Simple implementation - just color palette and component overrides

---

## [4.3.0] - 2025-11-07

### Added - Privacy-First Analytics Integration 📊

Integrated Plausible Analytics to understand usage patterns and identify which states need HourKeep most, while maintaining our privacy-first values.

#### Anonymous Usage Analytics

- **Plausible Analytics integration** - Lightweight (< 1KB), privacy-first, GDPR-compliant analytics
- **State-level geographic data** - Understand which U.S. states are using HourKeep to identify where Medicaid work requirements have the most impact
- **Do Not Track support** - Automatically respects browser "Do Not Track" settings
- **No cookies** - Zero cookies or persistent identifiers used for tracking
- **No personal data** - Analytics never collect profile information, activity logs, documents, or exemption results

#### What We Track (Anonymous)

- Page views (which pages users visit)
- Device types (mobile, desktop, tablet)
- Browser and operating system
- State/region (e.g., "California", "Texas") - NOT city-level
- Screen size

#### What We DON'T Track

- ❌ Profile information (name, state, DOB, Medicaid ID)
- ❌ Activity logs (hours worked, organizations)
- ❌ Documents (pay stubs, verification letters)
- ❌ Exemption screening results
- ❌ IP addresses or persistent identifiers
- ❌ Cookies or cross-site tracking
- ❌ City-level or more granular location data

#### Transparency Updates

- **Privacy Notice updated** - Clear explanation of anonymous analytics with detailed "What We Track" section
- **Privacy Policy updated** - Consistent wording with Privacy Notice
- **README updated** - New "What Analytics We Collect" section with opt-out instructions
- **Link to Plausible's privacy policy** - Full transparency about analytics provider

### Changed

- **Privacy Notice** - Updated "No tracking" bullet to "Anonymous usage analytics" with detailed explanation
- **Privacy Policy** - Updated to match Privacy Notice wording exactly
- **README** - Updated "Privacy & Data" section with analytics disclosure and opt-out instructions

### Technical Details

- Added Plausible Analytics script tag to root layout (`src/app/layout.tsx`)
- Script uses `defer` attribute to prevent blocking page load
- Configured for domain `naretakis.github.io`
- Automatic Do Not Track detection (no custom code needed)
- Zero impact on existing functionality or offline capabilities

### Why Plausible?

- **Privacy-first** - No cookies, GDPR compliant, respects DNT
- **Lightweight** - < 1KB script, no performance impact
- **State-level data** - Helps understand where tool is needed most
- **Open-source** - Transparent and auditable
- **Works with GitHub Pages** - No domain ownership required

### Developer Experience

- Simple script tag integration (no custom JavaScript)
- No server-side components required
- Works seamlessly with static site deployment
- Comprehensive documentation in analytics-integration spec

---

## [4.2.0] - 2025-11-06

### Added - Settings About Section & Configuration 🔗

Enhanced the Settings page About section with dynamic version display and community contribution links, plus centralized application configuration for easier maintenance and forking.

#### Dynamic Version Management

- **Automatic version display** - Version now reads directly from package.json
- **Single source of truth** - Update version once, appears everywhere
- **Build-time injection** - Version injected via Next.js environment variables
- **No manual updates** - Version bumps automatically propagate to UI

#### Community & Contribution

- **View on GitHub button** - Direct link to repository for transparency
- **Report an Issue button** - Easy access to GitHub Issues for bug reports and feature requests
- **License display** - Shows GPL-3.0 license information
- **Open source emphasis** - Clear messaging about open source nature

#### Centralized Configuration

- **App config file** - New `src/config/app.ts` for app-wide constants
- **Repository URLs** - Centralized GitHub repository and issues URLs
- **Type-safe config** - TypeScript ensures correct usage throughout app
- **Easy forking** - Clear instructions for updating URLs when forking

#### Developer Experience

- **Configuration documentation** - Comprehensive guide in `docs/development/configuration.md`
- **README updates** - Added configuration section with forking instructions
- **Package.json metadata** - Added standard repository, bugs, and homepage fields
- **Forking checklist** - Clear steps for customizing a fork

### Changed

- **Settings page** - Enhanced About section with dynamic content and new buttons
- **Version display** - Changed from hardcoded "Version 2.0" to dynamic "Version 4.2.0"
- **next.config.ts** - Added version injection from package.json
- **package.json** - Added repository metadata fields

### Technical Details

- Created centralized config in `src/config/app.ts`
- Enhanced `next.config.ts` to inject version as `NEXT_PUBLIC_APP_VERSION`
- Added repository, bugs, and homepage fields to `package.json`
- Updated Settings page to use `APP_CONFIG` for all About section content
- Created comprehensive configuration guide in `docs/development/configuration.md`

### Developer Experience

- Clear forking instructions in README.md
- Centralized configuration reduces duplication
- Type-safe config usage prevents errors
- Automatic version propagation simplifies releases

---

## [4.0.0] - 2025-11-05

### Added - Enhanced Onboarding 🔐

A comprehensive onboarding experience that builds trust through transparency and collects essential profile information for better exports and exemption screening. This major feature introduces privacy-first design, secure data encryption, and extended profile management.

#### Privacy Notice

- **Privacy statement first** - Clear explanation of data handling before any data collection
- **Plain language** - No legal jargon, just clear facts about privacy
- **Key privacy points** - All data stays on device, you control exports, no tracking
- **Acknowledgment required** - Users must confirm understanding before proceeding
- **Timestamp tracking** - Records when privacy notice was acknowledged
- **Always accessible** - Privacy policy available anytime from settings

#### Extended Profile Information

- **Required fields** - Full name, state, date of birth
- **Optional fields** - Medicaid ID, phone number, email address
- **Age-based exemption** - Date of birth enables automatic age exemption screening
- **Contact information** - Phone and email for agency reports
- **Medicaid ID** - Optional ID for export inclusion
- **Help text** - Clear explanations for each field

#### Secure Data Encryption

- **Web Crypto API** - Industry-standard encryption for sensitive data
- **Encrypted fields** - Date of birth and Medicaid ID encrypted at rest
- **Automatic decryption** - Seamlessly decrypted when viewing or exporting
- **Key management** - Encryption keys stored securely in IndexedDB
- **Device-only** - Keys never leave your device
- **Error handling** - Graceful handling of encryption failures

#### Profile Management

- **Profile display** - View all profile information in settings
- **Profile editor** - Update any field when circumstances change
- **Age calculation** - Automatically shows current age from date of birth
- **Formatted display** - Phone numbers and dates formatted for readability
- **Timestamps** - Shows profile creation and last update dates
- **Validation** - Real-time validation with helpful error messages

#### Form Experience

- **Mobile-optimized** - Touch-friendly inputs with proper spacing (44px+ targets)
- **Smart date picker** - Mobile-optimized date selection
- **Phone formatting** - Automatic formatting as you type
- **Email validation** - Real-time email format validation
- **Clear errors** - Helpful error messages in plain language
- **Smooth transitions** - Polished animations and loading states

### Changed

- **Onboarding flow** - Now two-step: privacy notice → profile form
- **Settings page** - Added "Your Profile" section with display and edit
- **Database schema** - Upgraded to v4 with new profile fields
- **Profile storage** - Enhanced with encryption for sensitive fields
- **Exemptions page** - Improved date input field UX

### Technical Details

- Added comprehensive profile validation in `src/lib/validation/profile.ts`
- Implemented encryption utilities in `src/lib/utils/encryption.ts`
- Enhanced profile storage layer in `src/lib/storage/profile.ts`
- Created PrivacyNotice component in `src/components/onboarding/PrivacyNotice.tsx`
- Created ProfileForm component in `src/components/onboarding/ProfileForm.tsx`
- Created ProfileDisplay component in `src/components/settings/ProfileDisplay.tsx`
- Created ProfileEditor component in `src/components/settings/ProfileEditor.tsx`
- Created PrivacyPolicy component in `src/components/settings/PrivacyPolicy.tsx`
- Updated database schema to v4 with automatic migration
- Added profile type definitions in `src/types/index.ts`

### Developer Experience

- Comprehensive UI/UX polish summary in `.kiro/specs/workpath-enhanced-onboarding/ui-ux-polish-summary.md`
- Updated task tracking in `.kiro/specs/workpath-enhanced-onboarding/tasks.md`
- Clear migration path for existing users (no data loss)

---

## [3.0.0] - 2025-11-05

### Added - Exemption Screening System 🎯

A comprehensive exemption screening system that helps users determine if they're exempt from Medicaid work requirements before they start tracking hours. This major feature implements all five exemption categories from HR1 legislation with plain language explanations and an intuitive question flow.

#### Exemption Questionnaire

- **Smart question flow** - Dynamic questionnaire that adapts based on your answers
- **5 exemption categories** - Age, family/caregiving, health/disability, program participation, and other
- **Plain language** - Clear, simple questions without legal jargon
- **Immediate results** - Know right away if you're exempt or need to track hours
- **Detailed explanations** - Understand which exemption applies and why
- **Definition tooltips** - Tap any underlined term to see what it means

#### Exemption Categories Covered

- **Age-based** - 18 or younger, 65 or older
- **Family/Caregiving** - Pregnant, postpartum, caring for children under 13, caring for disabled dependents
- **Health/Disability** - Medicare enrollment, medically frail, disabled veteran, substance use disorder, mental health conditions, physical/intellectual/developmental disabilities
- **Program Participation** - SNAP/TANF work requirements, drug/alcohol rehabilitation
- **Other** - Recent incarceration, tribal status (Indian, Urban Indian, California Indian, IHS-eligible)

#### Dashboard Integration

- **Exemption badge** - Prominent display of your current exemption status
- **Quick access** - Start screening from dashboard or settings
- **Status indicators** - Clear visual distinction between exempt and non-exempt
- **Rescreen option** - Update your status when circumstances change

#### Exemption Management

- **Screening history** - View all past screenings with dates and results
- **Rescreen workflow** - Confirmation dialog before starting a new screening
- **Status tracking** - Database stores complete screening history
- **Exemption details** - See which specific exemption applies to you

#### Plain Language Definitions

- **Comprehensive glossary** - 30+ terms defined in simple language
- **Contextual help** - Definitions appear right where you need them
- **Expandable accordion** - Full definitions list available on exemption page
- **Accessible design** - Tooltips work on touch and desktop

#### Technical Implementation

- **Question flow engine** - Sophisticated logic for dynamic questionnaires
- **Exemption calculator** - Determines exemption status based on answers
- **Type-safe** - Full TypeScript coverage for exemption types
- **Offline-first** - All screening works without internet
- **IndexedDB storage** - Exemption history persisted locally

### Changed

- **Dashboard** - Added exemption status badge and screening call-to-action
- **Settings page** - Added exemption screening section with history view
- **Tracking page** - Shows exemption status for context
- **Database schema** - Added exemptions table for screening history
- **Navigation** - New exemptions route at `/exemptions`

### Technical Details

- Added comprehensive exemption type definitions in `src/types/exemptions.ts`
- Implemented question flow engine in `src/lib/exemptions/questionFlow.ts`
- Created exemption calculator in `src/lib/exemptions/calculator.ts`
- Built 30+ plain language definitions in `src/lib/exemptions/definitions.ts`
- Added 9 new React components in `src/components/exemptions/`
- Implemented exemption storage layer in `src/lib/storage/exemptions.ts`
- Created dedicated exemption page at `src/app/exemptions/page.tsx`

### Developer Experience

- Comprehensive documentation in `src/lib/exemptions/DEFINITIONS_README.md`
- Plain language review summary in `PLAIN_LANGUAGE_REVIEW_SUMMARY.md`
- Legislative review findings in `.kiro/specs/workpath-exemption-screening/legislative-review-findings.md`
- Updated task tracking in `.kiro/specs/workpath-exemption-screening/tasks.md`

---

## [2.0.0] - 2025-11-03

### Added - Document Management System 📸

A complete document capture and management system that allows users to photograph or upload verification documents and link them directly to their logged activities.

#### Camera & Upload Capabilities

- **Camera capture** - Take photos of documents directly from your phone using the device camera
- **File upload** - Upload existing photos from your device storage
- **Automatic image compression** - Images over 5MB are automatically compressed to save storage space
- **Smart validation** - File type and size validation with clear error messages
- **Dual capture methods** - Seamlessly switch between camera and file upload

#### Document Organization

- **Activity linking** - Documents are automatically linked to the activity you're logging
- **Document types** - Categorize documents as pay stubs, volunteer letters, school enrollment, or other
- **Custom descriptions** - Add optional notes to each document (up to 200 characters)
- **Document metadata** - Track capture method, file sizes, and timestamps

#### Viewing & Management

- **Document indicators** - See at a glance which activities have attached documents
- **Thumbnail gallery** - View all documents for an activity in a scrollable grid
- **Full-size viewer** - Open documents in a full-screen viewer with pinch-to-zoom support
- **Easy deletion** - Remove documents with confirmation dialog
- **Document counts** - Track how many documents are attached to each activity

#### Storage Management

- **Storage monitoring** - Real-time tracking of storage usage and available space
- **Low storage warnings** - Automatic alerts when storage reaches 80% capacity
- **Storage breakdown** - Detailed view of storage usage by document count and size
- **Quota checking** - Prevents saving documents when storage is full

#### Technical Improvements

- **IndexedDB schema v2** - New `documents` and `documentBlobs` tables for efficient storage
- **Blob separation** - Metadata and image data stored separately for optimal performance
- **Object URL management** - Proper cleanup to prevent memory leaks
- **Offline-first** - All document features work completely offline
- **Mobile-optimized** - Touch-friendly interfaces and responsive layouts

### Changed

- **ActivityForm** - Enhanced with document capture workflow and attached document display
- **ActivityList** - Now shows document indicators with counts for activities that have documents
- **Settings page** - Added storage management section with usage details
- **Database version** - Upgraded from v1 to v2 with new document tables

### Technical Details

- Added `react-zoom-pan-pinch` library for document viewer zoom functionality
- Added `zod` library for document metadata validation
- Implemented canvas-based image compression utility
- Created comprehensive document storage layer with error handling
- Added storage quota monitoring hooks and components

### Developer Experience

- New component library in `src/components/documents/`
- New storage utilities in `src/lib/storage/documents.ts`
- New TypeScript types in `src/types/documents.ts`
- Comprehensive error handling for camera permissions and storage issues

---

## [0.1.0] - 2025-10-XX

### Added - Initial MVP Release

#### Core Features

- **Activity tracking** - Log work, volunteer, and education hours daily
- **Visual calendar** - See all logged activities at a glance with date indicators
- **Monthly compliance** - Automatic calculation of 80-hour requirement
- **Progress dashboard** - Real-time compliance status and monthly totals
- **Activity management** - Edit and delete logged activities
- **Data export** - Export data as JSON or formatted text for agency submission

#### PWA Capabilities

- **Offline-first** - Complete functionality without internet connection
- **Installable** - Add to home screen on mobile devices
- **Service worker** - Automatic caching for offline use
- **App manifest** - Native app-like experience

#### Privacy & Security

- **Local storage only** - All data stays on your device using IndexedDB
- **No accounts** - No sign-up, no login, no authentication required
- **No tracking** - Zero analytics or data collection
- **GPL-3.0 license** - Open source and transparent

#### User Experience

- **Mobile-first design** - Optimized for phone screens and touch interfaces
- **Material-UI components** - Clean, accessible, and familiar interface
- **Simple onboarding** - Quick profile setup to get started
- **Settings management** - Configure profile and export data

#### Technical Foundation

- Next.js 14 with App Router
- TypeScript for type safety
- Dexie.js for IndexedDB management
- Material-UI v5 component library
- date-fns for date manipulation
- next-pwa for Progressive Web App features

---

## Release Notes

### v2.0.0 - Document Management

This is a major release that adds comprehensive document capture and management capabilities to HourKeep. Users can now photograph or upload verification documents (pay stubs, volunteer letters, school enrollment forms) and link them directly to their logged activities.

**Key highlights:**

- 📸 Camera capture with automatic compression
- 📁 File upload with drag-and-drop support
- 🔍 Full-size document viewer with zoom
- 💾 Smart storage management with quota monitoring
- 📱 Fully mobile-optimized and offline-capable

This release represents 10 completed tasks across 8 major implementation areas, including database schema updates, image processing utilities, camera/upload components, metadata forms, activity integration, document display, storage monitoring, and comprehensive error handling.

**Upgrade notes:**

- Database automatically upgrades from v1 to v2
- No data migration required
- Existing activities continue to work normally
- New document features available immediately

### v0.1.0 - Initial MVP

The first release of HourKeep, providing essential activity tracking and compliance monitoring for Medicaid work requirements. This MVP establishes the foundation with offline-first architecture, privacy-focused design, and mobile-optimized user experience.

---

## Release Notes

### v3.0.0 - Exemption Screening

This is a major release that adds comprehensive exemption screening to HourKeep. Many Medicaid beneficiaries don't realize they're exempt from work requirements. This feature helps users quickly determine if they need to track hours at all, saving time and reducing stress.

**Key highlights:**

- 🎯 Complete exemption questionnaire covering all 5 HR1 categories
- 💬 Plain language questions and definitions (no legal jargon)
- 🔄 Smart question flow that adapts to your answers
- 📊 Dashboard integration with prominent status display
- 📜 Screening history to track status changes over time
- 📱 Fully mobile-optimized and offline-capable

This release represents the completion of the exemption screening spec, including question flow logic, exemption calculator, plain language definitions, UI components, dashboard integration, and comprehensive testing.

**Who benefits:**

- People who are exempt but don't know it
- People whose circumstances change (pregnancy, new child, health issues)
- Anyone who wants to understand their exemption status clearly

**Upgrade notes:**

- Database automatically adds exemptions table
- No data migration required
- Existing activities and documents continue to work normally
- New exemption features available immediately

---

[7.0.0]: https://github.com/naretakis/hourkeep/compare/v6.1.0...v7.0.0
[6.1.0]: https://github.com/naretakis/hourkeep/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/naretakis/hourkeep/compare/v5.0.0...v6.0.0
[5.0.0]: https://github.com/naretakis/hourkeep/compare/v4.5.0...v5.0.0
[4.5.0]: https://github.com/naretakis/hourkeep/compare/v4.4.0...v4.5.0
[4.4.0]: https://github.com/naretakis/hourkeep/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/naretakis/hourkeep/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/naretakis/hourkeep/compare/v4.0.0...v4.2.0
[4.0.0]: https://github.com/naretakis/hourkeep/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/naretakis/hourkeep/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/naretakis/hourkeep/compare/v0.1.0...v2.0.0
[0.1.0]: https://github.com/naretakis/hourkeep/releases/tag/v0.1.0
