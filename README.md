# HourKeep

**Keep Your Hours, Keep Your Coverage**

A Progressive Web App (PWA) that helps you track work, volunteer, and education hours to maintain your Medicaid benefits.

Start using HourKeep today: https://naretakis.github.io/hourkeep

[Here's our development roadmap](ROADMAP.md) - HourKeep's current and future features

## What It Does

HourKeep is a simple, privacy-focused app that helps you:

- **Check exemptions** - Find out if you're exempt from work requirements (you might not need to track at all!)
- **Track hours** - Log work, volunteer, and education activities daily
- **Capture documents** - Photograph or upload pay stubs, volunteer letters, and other verification documents
- **Monitor compliance** - See your monthly total and compliance status (80-hour requirement)
- **Stay organized** - Visual calendar shows all your logged activities with document indicators
- **Export data** - Generate reports for agency submission with attached documents
- **Work offline** - All data stored locally on your device, no internet required

## Key Features

- ✅ **Privacy notice** - Clear explanation of data handling before you start
- ✅ **Extended profile** - Name, state, date of birth, and optional contact info
- ✅ **Secure encryption** - Sensitive data encrypted at rest
- ✅ **Profile management** - View and edit your information anytime
- ✅ **Exemption screening** - Find out if you're exempt from work requirements
- ✅ **Plain language questionnaire** - Simple questions covering all 5 exemption categories
- ✅ **Smart question flow** - Dynamic questions that adapt to your answers
- ✅ **Exemption history** - Track your status over time
- ✅ **Contextual help system** - Get guidance right where you need it
- ✅ **Activity definitions** - Clear explanations of what counts for each activity type
- ✅ **Edge case examples** - 20+ scenarios showing what counts and what doesn't
- ✅ **Income guidance** - Understand the $580/month threshold and seasonal worker rules
- ✅ Simple daily activity logging
- ✅ Visual calendar with activity indicators
- ✅ Automatic monthly compliance calculations
- ✅ Edit and delete entries
- ✅ **Document capture and management** - Photograph or upload verification documents
- ✅ **Smart image compression** - Automatic compression for large images
- ✅ **Document viewer** - Full-size viewing with pinch-to-zoom
- ✅ **Storage monitoring** - Track usage and get low-storage warnings
- ✅ Export data as JSON or readable text
- ✅ 100% offline functionality
- ✅ Installable as a native app on mobile devices
- ✅ Privacy-first: all data stays on your device

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material-UI v5** - Component library
- **Dexie.js** - IndexedDB wrapper for local storage
- **next-pwa** - Progressive Web App capabilities
- **date-fns** - Date manipulation

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/naretakis/hourkeep.git
cd hourkeep

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Configuration

If you fork this repository, update the GitHub repository URLs in two places:

1. **package.json** - Update the `repository`, `bugs`, and `homepage` fields:

   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/YOUR_USERNAME/hourkeep.git"
   },
   "bugs": {
     "url": "https://github.com/YOUR_USERNAME/hourkeep/issues"
   },
   "homepage": "https://github.com/YOUR_USERNAME/hourkeep#readme"
   ```

2. **src/config/app.ts** - Update the repository URLs:
   ```typescript
   repository: {
     url: "https://github.com/YOUR_USERNAME/hourkeep",
     issuesUrl: "https://github.com/YOUR_USERNAME/hourkeep/issues",
   }
   ```

The app version is automatically read from `package.json` and displayed in the Settings page.

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Deploying to GitHub Pages

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
hourkeep/
├── src/
│   ├── app/              # Next.js app routes
│   │   ├── onboarding/   # Initial profile setup
│   │   ├── tracking/     # Main activity tracking page
│   │   ├── exemptions/   # Exemption screening
│   │   └── settings/     # Settings and export
│   ├── components/       # React components
│   │   ├── exemptions/   # Exemption screening components
│   │   ├── documents/    # Document management components
│   │   ├── Calendar.tsx
│   │   ├── ActivityForm.tsx
│   │   ├── Dashboard.tsx
│   │   └── ...
│   ├── lib/              # Utilities and database
│   │   ├── exemptions/   # Exemption logic and definitions
│   │   ├── storage/      # Database operations
│   │   ├── db.ts         # Dexie database setup
│   │   └── calculations.ts
│   ├── types/            # TypeScript type definitions
│   └── theme/            # Material-UI theme
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── icons/            # App icons
└── .github/workflows/    # GitHub Actions for deployment
```

## Usage

### First Time Setup

1. Open the app
2. Read and acknowledge the privacy notice
3. Enter your profile information (name, state, date of birth)
4. Optionally add Medicaid ID and contact information
5. Check if you're exempt (recommended - you might not need to track!)
6. Start tracking your hours (if not exempt)!

### Checking Exemptions

1. Go to the dashboard or settings
2. Click "Check Exemptions" or "Start Screening"
3. Answer simple questions about your situation
4. Get immediate results - exempt or need to track
5. See which exemption applies to you
6. Rescreen anytime your circumstances change

### Logging Activities

1. Go to the tracking page
2. Click on any date in the calendar
3. Select activity type (work, volunteer, or education)
4. Enter hours worked
5. Optionally add organization name
6. Optionally capture or upload verification documents
7. Save

### Viewing Progress

- Your monthly total is displayed at the top of the tracking page
- Green "Compliant" badge shows when you've met the 80-hour requirement
- Calendar shows visual indicators for dates with logged activities
- Document icons show which activities have attached verification documents

### Exporting Data

1. Go to Settings
2. Click "Export Data"
3. Choose format (JSON or Text)
4. Save the file to submit to your agency

## Privacy & Data

- **All data stays on your device** - Nothing is sent to any server
- **No account required** - No sign-up, no login
- **Anonymous usage analytics** - We collect anonymous usage statistics (page views, device types, states) to understand where this tool is needed most and improve the app. This does NOT include any personal information, activity logs, or documents. Respects "Do Not Track" browser settings.
- **You control exports** - Only you decide when to share your data

### What Analytics We Collect

We use [Plausible Analytics](https://plausible.io/) (privacy-first, open-source, lightweight) to collect:

- ✅ Page views (which pages you visit)
- ✅ Device type (mobile, desktop, tablet)
- ✅ Browser and operating system
- ✅ State/region (e.g., "California", "Texas")
- ✅ Screen size

We do NOT collect:

- ❌ Your profile information (name, state, DOB, Medicaid ID)
- ❌ Your activity logs (hours worked, organizations)
- ❌ Your documents (pay stubs, verification letters)
- ❌ Your exemption screening results
- ❌ IP addresses or persistent identifiers
- ❌ Cookies or tracking across websites
- ❌ City-level or more granular location data

**Opt Out:** Enable "Do Not Track" in your browser settings to opt out of analytics.

Learn more: [Plausible Privacy Policy](https://plausible.io/privacy)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (limited PWA support)

## Contributing

This is a learning project and personal tool. Feel free to fork and customize for your needs!

## License

GNU General Public License v3.0 - See LICENSE file for details

Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.

## Acknowledgments

Built as an MVP learning project to understand:

- Progressive Web Apps
- Next.js App Router
- IndexedDB and offline-first architecture
- Material-UI component library

## Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history and release notes
- [ROADMAP.md](ROADMAP.md) - Product roadmap and future features
- [DEPLOYMENT.md](DEPLOYMENT.md) - How to deploy to GitHub Pages
- [PWA-TESTING.md](PWA-TESTING.md) - Testing PWA features
- [BRANDING.md](BRANDING.md) - Brand guidelines and messaging

## What's Next?

HourKeep is actively evolving. See our [ROADMAP.md](ROADMAP.md) to learn about:

- ✅ Recently shipped (v4.4: Warm Neutral theme for a friendlier look)
- � Future sconsiderations (income tracking, hardship reporting, compliance alerts)
- ❌ What we're explicitly not building (and why)

## Support

For questions or issues, please open an issue on GitHub.
