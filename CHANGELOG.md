# Changelog

All notable changes to HourKeep will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[4.3.0]: https://github.com/naretakis/hourkeep/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/naretakis/hourkeep/compare/v4.0.0...v4.2.0
[4.0.0]: https://github.com/naretakis/hourkeep/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/naretakis/hourkeep/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/naretakis/hourkeep/compare/v0.1.0...v2.0.0
[0.1.0]: https://github.com/naretakis/hourkeep/releases/tag/v0.1.0
