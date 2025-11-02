# Requirements Document: WorkPath MVP (Simplified)

**Your Work Requirements Assistant**

*Track your work hours to maintain your Medicaid benefits*

---

## Introduction

WorkPath is a simple Progressive Web Application (PWA) that helps you track work, volunteer, and education hours to meet Medicaid work requirements (80 hours/month or $580/month income).

**Core Principles:**
- **Simple first**: Get it working, then make it better
- **Local storage**: All data stays on your device
- **Mobile-friendly**: Works on your phone
- **Offline-capable**: Works without internet

**What This MVP Does:**
- Track daily work/volunteer/education hours
- Calculate monthly totals
- Show if you're meeting the 80-hour requirement
- Export your data
- Work offline

**What This MVP Doesn't Do (Yet):**
- Exemption screening (future)
- Document management (future)
- Complex reporting (future)
- Multi-user support (future)

---

## Requirements

### Requirement 1: Basic Profile Setup

**User Story:** As a user, I want to enter my basic information once, so the app knows who I am.

#### Acceptance Criteria

1. WHEN I first open the app THEN I SHALL see a simple form asking for my name and state
2. WHEN I submit the form THEN my information SHALL be saved locally
3. WHEN I return to the app THEN I SHALL go straight to the tracking page

---

### Requirement 2: Log Daily Activities

**User Story:** As a user, I want to log my work hours for each day, so I can track my monthly total.

#### Acceptance Criteria

1. WHEN I open the tracking page THEN I SHALL see the current month
2. WHEN I tap a date THEN I SHALL see a form to log hours
3. WHEN I enter hours THEN I SHALL select activity type (work, volunteer, or education)
4. WHEN I enter hours THEN I SHALL enter the number of hours (0-24)
5. WHEN I enter hours THEN I SHALL optionally enter where I worked
6. WHEN I save THEN my entry SHALL be stored locally
7. WHEN I view the calendar THEN dates with hours SHALL show a visual indicator

---

### Requirement 3: View Monthly Progress

**User Story:** As a user, I want to see my monthly total at a glance, so I know if I'm meeting the requirement.

#### Acceptance Criteria

1. WHEN I view the tracking page THEN I SHALL see my total hours for the current month
2. WHEN I have 80+ hours THEN I SHALL see a "Compliant" status in green
3. WHEN I have less than 80 hours THEN I SHALL see how many hours I still need
4. WHEN I view my progress THEN I SHALL see hours broken down by type (work/volunteer/education)

---

### Requirement 4: Edit and Delete Entries

**User Story:** As a user, I want to fix mistakes in my entries, so my records are accurate.

#### Acceptance Criteria

1. WHEN I tap a date with existing hours THEN I SHALL see my logged entry
2. WHEN viewing an entry THEN I SHALL be able to edit the hours, type, or organization
3. WHEN viewing an entry THEN I SHALL be able to delete it
4. WHEN I delete an entry THEN I SHALL be asked to confirm

---

### Requirement 5: Export My Data

**User Story:** As a user, I want to export my data, so I can submit it to the agency or keep a backup.

#### Acceptance Criteria

1. WHEN I go to settings THEN I SHALL see an "Export Data" option
2. WHEN I export THEN I SHALL get a JSON file with all my data
3. WHEN I export THEN the file SHALL include my profile and all activities
4. WHEN I export THEN the file SHALL be named with the current date

---

### Requirement 6: Work Offline

**User Story:** As a user, I want the app to work without internet, so I can track hours anywhere.

#### Acceptance Criteria

1. WHEN I open the app offline THEN it SHALL load and work normally
2. WHEN I log hours offline THEN they SHALL be saved locally
3. WHEN I'm offline THEN I SHALL see an indicator showing I'm offline
4. WHEN the app updates THEN I SHALL be notified

---

### Requirement 7: Install as App

**User Story:** As a user, I want to install the app on my phone, so I can access it quickly.

#### Acceptance Criteria

1. WHEN I visit the app THEN I SHALL be able to add it to my home screen
2. WHEN I open from home screen THEN it SHALL open like a native app
3. WHEN installed THEN it SHALL have an app icon and name

---

## Out of Scope for MVP

These features are documented in the full spec (archived) but NOT included in this simplified MVP:

- ❌ Exemption screening questionnaire
- ❌ Document photo capture and management
- ❌ Income tracking with pay periods
- ❌ Hardship reporting
- ❌ Data import functionality
- ❌ Markdown report generation
- ❌ Batch entry for multiple days
- ❌ Document-activity linking
- ❌ Storage quota management
- ❌ Compliance predictions and alerts

**These can be added later once the core app is working!**

---

## Success Criteria

The MVP is successful when:
- ✅ You can log hours for any day
- ✅ You can see your monthly total
- ✅ You can tell if you're meeting the 80-hour requirement
- ✅ You can edit/delete entries
- ✅ You can export your data
- ✅ It works offline
- ✅ You can install it on your phone

---

## Technical Constraints

- **Framework**: Next.js 14+ with TypeScript
- **UI Library**: Material-UI v5
- **Storage**: IndexedDB (via Dexie.js)
- **PWA**: next-pwa plugin
- **Deployment**: GitHub Pages (static export)

---

## Notes for Future Phases

The archived full spec contains detailed requirements for:
- 15 comprehensive requirements
- Complete exemption screening system
- Document management with camera
- Advanced reporting and analytics
- Multi-user support

**Refer to `.kiro/specs/workpath-medicaid-mvp/archive-full-version/` for the complete vision.**
