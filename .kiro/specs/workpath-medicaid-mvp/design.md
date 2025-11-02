# Design Document: WorkPath MVP (Simplified)

**Your Work Requirements Assistant**

---

## Overview

This is a **simplified design** for a new developer learning to build PWAs. The focus is on getting a working app with core features, not building enterprise-grade infrastructure.

**Design Philosophy:**

- Start simple, add complexity later
- Learn by building, not by configuring
- Get something working end-to-end first
- Iterate and improve

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser/Phone                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           Next.js App (React)                   │    │
│  │                                                 │    │
│  │  ┌──────────────┐      ┌──────────────┐       │    │
│  │  │   Pages      │      │  Components  │       │    │
│  │  │              │      │              │       │    │
│  │  │ - Home       │      │ - Calendar   │       │    │
│  │  │ - Tracking   │      │ - ActivityForm│      │    │
│  │  │ - Settings   │      │ - Dashboard  │       │    │
│  │  └──────────────┘      └──────────────┘       │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │         IndexedDB (Dexie.js)             │ │    │
│  │  │                                          │ │    │
│  │  │  - profiles table                       │ │    │
│  │  │  - activities table                     │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Service Worker (PWA)                    │    │
│  │  - Cache app files for offline                 │    │
│  │  - Handle updates                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Points:**

- Everything runs in the browser
- No backend server needed
- Data stored locally in IndexedDB
- Service worker enables offline functionality

---

## Data Models

### Profile

```typescript
interface UserProfile {
  id: string; // UUID
  name: string; // User's name
  state: string; // State abbreviation (e.g., "CA")
  createdAt: Date; // When profile was created
}
```

### Activity

```typescript
interface Activity {
  id?: number; // Auto-increment ID
  date: string; // YYYY-MM-DD format
  type: "work" | "volunteer" | "education";
  hours: number; // 0-24
  organization?: string; // Optional: where they worked
  createdAt: Date; // When entry was created
  updatedAt: Date; // When entry was last modified
}
```

### Monthly Summary (Calculated, not stored)

```typescript
interface MonthlySummary {
  month: string; // YYYY-MM format
  totalHours: number; // Sum of all hours
  workHours: number; // Sum of work hours
  volunteerHours: number; // Sum of volunteer hours
  educationHours: number; // Sum of education hours
  isCompliant: boolean; // totalHours >= 80
  hoursNeeded: number; // 80 - totalHours (if not compliant)
}
```

---

## User Interface

### Page Structure

```
/                          → Home/Landing (redirect to /tracking if profile exists)
/onboarding               → One-time profile setup
/tracking                 → Main page: calendar + dashboard
/settings                 → Profile, export, about
```

### Key Components

#### 1. Calendar Component

- Shows current month
- Visual indicators for days with logged hours
- Click a day to add/edit hours
- Simple month navigation (< >)

#### 2. Activity Form

- Activity type selector (work/volunteer/education)
- Hours input (number, 0-24)
- Organization input (optional text)
- Save/Cancel buttons

#### 3. Dashboard Component

- Total hours for current month
- Progress bar (0-80 hours)
- Compliance status (green checkmark or red X)
- Breakdown by activity type

#### 4. Activity List

- List of all entries for current month
- Grouped by date
- Edit/Delete buttons for each entry

---

## Technology Stack

### Core Technologies

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type safety (but keep it simple)
- **Material-UI v5**: Pre-built components
- **Dexie.js**: IndexedDB wrapper (easier than raw IndexedDB)
- **next-pwa**: PWA plugin for Next.js

### Development Tools (Minimal)

- **ESLint**: Catch errors
- **Prettier**: Format code
- **TypeScript**: Type checking

**What We're NOT Using (Yet):**

- ❌ Husky/Git hooks
- ❌ Automated testing
- ❌ CI/CD pipelines
- ❌ Complex state management (Redux, Zustand)
- ❌ Documentation generators

---

## Database Schema (IndexedDB)

```typescript
// Using Dexie.js
class WorkPathDB extends Dexie {
  profiles!: Table<UserProfile>;
  activities!: Table<Activity>;

  constructor() {
    super("WorkPathDB");

    this.version(1).stores({
      profiles: "id",
      activities: "++id, date, type",
    });
  }
}
```

**Indexes:**

- `profiles`: Primary key on `id`
- `activities`: Auto-increment `id`, indexed on `date` and `type`

---

## Key Features Implementation

### 1. Profile Setup (Onboarding)

**Flow:**

1. User opens app for first time
2. Check if profile exists in IndexedDB
3. If no profile → redirect to `/onboarding`
4. Show simple form (name, state)
5. Save to IndexedDB
6. Redirect to `/tracking`

**Code Location:**

- Page: `src/app/onboarding/page.tsx`
- Storage: `src/lib/db.ts`

---

### 2. Activity Tracking

**Flow:**

1. User sees calendar for current month
2. User clicks a date
3. Modal/dialog opens with activity form
4. User enters: type, hours, organization
5. Save to IndexedDB
6. Update calendar to show indicator
7. Recalculate monthly total

**Code Location:**

- Page: `src/app/tracking/page.tsx`
- Components: `src/components/Calendar.tsx`, `src/components/ActivityForm.tsx`
- Storage: `src/lib/db.ts`

---

### 3. Monthly Dashboard

**Flow:**

1. Query all activities for current month from IndexedDB
2. Calculate totals by type
3. Calculate overall total
4. Determine compliance (>= 80 hours)
5. Display with progress bar and status

**Code Location:**

- Component: `src/components/Dashboard.tsx`
- Utils: `src/lib/calculations.ts`

---

### 4. Data Export

**Flow:**

1. User clicks "Export" in settings
2. Query all data from IndexedDB
3. Create JSON object with profile + activities
4. Trigger browser download
5. File named: `workpath-export-YYYY-MM-DD.json`

**Code Location:**

- Page: `src/app/settings/page.tsx`
- Utils: `src/lib/export.ts`

---

### 5. PWA Offline Support

**Flow:**

1. Service worker caches app files on first load
2. When offline, serve from cache
3. IndexedDB works offline by default
4. Show offline indicator in UI

**Code Location:**

- Config: `next.config.js` (next-pwa setup)
- Service Worker: Auto-generated by next-pwa
- Offline Indicator: `src/components/OfflineIndicator.tsx`

---

## Styling Approach

### Material-UI Theme

```typescript
// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#dc004e", // Pink
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
```

### Responsive Design

- Use MUI's `sx` prop for styling
- Mobile-first approach (design for phone, then desktop)
- Use MUI breakpoints: `sx={{ padding: { xs: 2, md: 3 } }}`

---

## File Structure

```
workpath/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── onboarding/
│   │   │   └── page.tsx       # Profile setup
│   │   ├── tracking/
│   │   │   └── page.tsx       # Main tracking page
│   │   └── settings/
│   │       └── page.tsx       # Settings page
│   ├── components/
│   │   ├── Calendar.tsx       # Calendar component
│   │   ├── ActivityForm.tsx   # Form to log hours
│   │   ├── Dashboard.tsx      # Monthly summary
│   │   └── OfflineIndicator.tsx
│   ├── lib/
│   │   ├── db.ts              # Dexie database setup
│   │   ├── calculations.ts    # Calculate monthly totals
│   │   └── export.ts          # Export functionality
│   ├── theme/
│   │   └── theme.ts           # MUI theme
│   └── types/
│       └── index.ts           # TypeScript types
├── .gitignore
├── next.config.js             # Next.js + PWA config
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Export static site
npm run export
```

### Adding a Feature

1. Create the component
2. Add the page (if needed)
3. Test in browser
4. Commit when it works

**No complex git workflow, no automated tests (yet)**

---

## Deployment

### GitHub Pages with GitHub Actions

We'll use GitHub Actions to automatically build and deploy when you push to main:

1. **Setup** (Phase 7):
   - Create `.github/workflows/deploy.yml`
   - Configure Next.js for static export
   - Set GitHub Pages source to "GitHub Actions" (not gh-pages branch)

2. **How it works**:
   - Push code to main branch
   - GitHub Actions runs automatically
   - Builds the Next.js app
   - Deploys directly to GitHub Pages
   - Your app is live at `https://[username].github.io/workpath`

3. **Benefits**:
   - No manual deployment steps
   - No gh-pages branch to manage
   - Consistent builds
   - Easy to update (just push code)
   - Modern GitHub Pages approach

---

## What's Different from Full Spec

### Removed Complexity

- ❌ No exemption screening system
- ❌ No document management
- ❌ No camera integration
- ❌ No income tracking with pay periods
- ❌ No hardship reporting
- ❌ No data import
- ❌ No complex state management (Context API)
- ❌ No automated testing setup
- ❌ No CI/CD pipeline
- ❌ No git hooks
- ❌ No documentation automation

### Kept Simple

- ✅ Basic profile (name, state)
- ✅ Activity logging (type, hours, organization)
- ✅ Monthly calculations
- ✅ Simple calendar UI
- ✅ Data export (JSON only)
- ✅ PWA basics (offline, installable)

---

## Future Enhancements

Once the MVP is working, you can add:

**Phase 2:**

- Exemption screening questionnaire
- Income tracking
- Better date navigation

**Phase 3:**

- Document photo capture
- Markdown report export
- Data import

**Phase 4:**

- Hardship reporting
- Compliance predictions
- Multi-user support

**See archived full spec for complete feature set.**

---

## Success Metrics

The design is successful when:

- ✅ You can build it in 4-8 weeks part-time
- ✅ You understand every line of code
- ✅ It works on your phone
- ✅ It works offline
- ✅ You can show it to someone and they can use it

---

## Learning Goals

By building this MVP, you'll learn:

- Next.js App Router
- TypeScript basics
- Material-UI components
- IndexedDB with Dexie
- PWA fundamentals
- Responsive design
- State management (useState, useEffect)

**You won't learn (yet):**

- Complex testing frameworks
- CI/CD pipelines
- Advanced git workflows
- Documentation automation
- Enterprise architecture patterns

**That's okay! Learn those later when you need them.**

---

## Notes

This design intentionally trades "best practices" for "learning by doing". Once you have a working app, you can refactor and add complexity.

**Remember:** A simple app that works is better than a complex app that doesn't.
