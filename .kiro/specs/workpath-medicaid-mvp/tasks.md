# Implementation Plan: HourKeep MVP (Simplified)

**Your Work Requirements Assistant**

---

## Overview

This is a **realistic task list for a new developer** learning to build PWAs. The goal is to get a working app in 4-8 weeks part-time.

**Total: 7 phases, ~25 tasks**

---

- [x] Phase 1: Project Setup (Week 1)

- [x] 1.1 Create Next.js project
  - Run: `npx create-next-app@latest hourkeep --typescript --app`
  - Test: `npm run dev` and see it running
  - _Requirements: Setup_

- [x] 1.2 Install core dependencies
  - Install Material-UI: `npm install @mui/material @emotion/react @emotion/styled`
  - Install Dexie: `npm install dexie`
  - Install date-fns: `npm install date-fns`
  - _Requirements: Setup_

- [x] 1.3 Create basic file structure
  - Create folders: `src/components`, `src/lib`, `src/types`, `src/theme`
  - Create `.github/workflows` folder for GitHub Actions (will use in Phase 7)
  - Create `src/theme/theme.ts` with basic MUI theme
  - Create `src/types/index.ts` for TypeScript types
  - _Requirements: Setup_

- [x] 1.4 Set up IndexedDB with Dexie
  - Create `src/lib/db.ts`
  - Define database with `profiles` and `activities` tables
  - _Requirements: 2, 3_

---

- [x] Phase 2: Profile Setup (Week 1-2)

- [x] 2.1 Create TypeScript types
  - Define `UserProfile` and `Activity` interfaces
  - _Requirements: 1_

- [x] 2.2 Create onboarding page
  - Create `app/onboarding/page.tsx`
  - Build form with name and state inputs
  - _Requirements: 1_

- [x] 2.3 Save profile to IndexedDB
  - Save profile on form submit
  - Redirect to `/tracking`
  - _Requirements: 1_

- [x] 2.4 Add profile check on home page
  - Check if profile exists
  - Redirect accordingly
  - _Requirements: 1_

---

- [x] Phase 3: Activity Tracking (Week 2-4)

- [x] 3.1 Create tracking page
  - Create `app/tracking/page.tsx`
  - _Requirements: 2, 3_

- [x] 3.2 Build calendar component
  - Create `src/components/Calendar.tsx`
  - Show current month
  - _Requirements: 2_

- [x] 3.3 Create activity form
  - Create `src/components/ActivityForm.tsx`
  - Add type, hours, organization fields
  - _Requirements: 2_

- [x] 3.4 Connect calendar to form
  - Open form when date clicked
  - _Requirements: 2_

- [x] 3.5 Save activities
  - Save to IndexedDB
  - _Requirements: 2_

- [x] 3.6 Show indicators on calendar
  - Mark dates with activities
  - _Requirements: 2_

- [x] 3.7 Add edit/delete
  - Edit and delete activities
  - _Requirements: 4_

---

- [x] Phase 4: Monthly Dashboard (Week 4-5)

- [x] 4.1 Create calculations utility
  - Calculate monthly totals
  - _Requirements: 3_

- [x] 4.2 Build dashboard component
  - Show total hours and compliance status
  - _Requirements: 3_

- [x] 4.3 Add dashboard to page
  - Display above calendar
  - _Requirements: 3_

- [x] 4.4 Create activity list
  - List all activities
  - _Requirements: 2, 4_

---

- [x] Phase 5: Settings & Export (Week 5-6)

- [x] 5.1 Create settings page
  - Show profile and export button
  - _Requirements: 5_

- [x] 5.2 Implement export
  - Export data as JSON
  - _Requirements: 5_

- [x] 5.3 Add navigation
  - Add nav between pages
  - _Requirements: Navigation_

---

- [x] Phase 6: PWA Features (Week 6-8)

- [x] 6.1 Configure next-pwa
  - Install and configure
  - _Requirements: 6, 7_

- [x] 6.2 Create manifest
  - Add PWA manifest
  - _Requirements: 7_

- [x] 6.3 Create icons
  - Generate app icons
  - _Requirements: 7_

- [x] 6.4 Add offline indicator
  - Show when offline
  - _Requirements: 6_

- [x] 6.5 Test offline
  - Verify offline functionality
  - _Requirements: 6_

- [x] 6.6 Test installation
  - Test on mobile device
  - _Requirements: 7_

---

- [x] Phase 7: Polish & Deploy (Week 8)

- [x] 7.1 Improve mobile styling
  - Test and fix mobile issues
  - _Requirements: Mobile_

- [x] 7.2 Add loading states
  - Show loading indicators
  - _Requirements: UX_

- [x] 7.3 Add error handling
  - Handle errors gracefully
  - _Requirements: UX_

- [x] 7.4 Set up GitHub Actions deployment
  - Create `.github/workflows/deploy.yml` with build and deploy jobs
  - Configure Next.js for static export in `next.config.js`
  - Set up GitHub Pages in repository settings (Settings → Pages → Source: GitHub Actions)
  - Push to main branch to trigger first deployment
  - Verify app works at your GitHub Pages URL (https://[username].github.io/hourkeep)
  - _Requirements: Deployment_

---

## Estimated Time: 42-58 hours (4-8 weeks at 10 hours/week)

## Success: You have a working app you understand!
