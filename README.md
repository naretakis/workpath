# HourKeep

**Keep Your Hours, Keep Your Coverage**

A Progressive Web App (PWA) that helps you track work, volunteer, and education hours to maintain your Medicaid benefits.

Start using HourKeep today: https://naretakis.github.io/hourkeep

[Here's our development roadmap](ROADMAP.md) - HourKeep's current and future features

## What It Does

HourKeep is a simple, privacy-focused app that helps you:

- **Check exemptions** - Find out if you're exempt from work requirements (you might not need to track at all!)
- **Track hours OR income** - Choose to log activities (80 hours/month) or track income ($580/month)
- **Flexible tracking** - Switch between hours and income modes anytime
- **Capture documents** - Photograph or upload pay stubs, volunteer letters, and other verification documents
- **Monitor compliance** - See your monthly total and compliance status in real-time
- **Seasonal worker support** - 6-month income averaging for variable income
- **Stay organized** - Visual calendar shows all your logged activities with document indicators
- **Export data** - Generate comprehensive reports for agency submission
- **Work offline** - All data stored locally on your device, no internet required

## Key Features

### Privacy & Profile
- ✅ **Privacy notice** - Clear explanation of data handling before you start
- ✅ **Extended profile** - Name, state, date of birth, and optional contact info
- ✅ **Secure encryption** - Sensitive data encrypted at rest
- ✅ **Profile management** - View and edit your information anytime

### Exemption Screening
- ✅ **Exemption screening** - Find out if you're exempt from work requirements
- ✅ **Plain language questionnaire** - Simple questions covering all 5 exemption categories
- ✅ **Smart question flow** - Dynamic questions that adapt to your answers
- ✅ **Exemption history** - Track your status over time

### Hours Tracking
- ✅ **Activity logging** - Log work, volunteer, and education activities daily
- ✅ **Visual calendar** - See all logged activities with indicators
- ✅ **80-hour compliance** - Automatic monthly compliance calculations
- ✅ **Activity definitions** - Clear explanations of what counts for each activity type
- ✅ **Edge case examples** - 20+ scenarios showing what counts and what doesn't
- ✅ **Duplicate activities** - Replicate entries across multiple dates

### Income Tracking (NEW!)
- ✅ **Income entry logging** - Record income with dates, amounts, and sources
- ✅ **Pay period conversion** - Automatic monthly equivalent (daily, weekly, bi-weekly, monthly)
- ✅ **$580 threshold tracking** - Real-time progress toward income requirement
- ✅ **Multiple income sources** - Track multiple jobs or income streams
- ✅ **Seasonal worker support** - 6-month income averaging for variable income
- ✅ **Compliance mode switching** - Choose hours or income tracking each month
- ✅ **Duplicate income entries** - Replicate entries across multiple dates

### Document Management
- ✅ **Document capture** - Photograph or upload verification documents
- ✅ **Smart image compression** - Automatic compression for large images
- ✅ **Document viewer** - Full-size viewing with pinch-to-zoom
- ✅ **Storage monitoring** - Track usage and get low-storage warnings
- ✅ **Income documents** - Pay stubs, bank statements, gig work screenshots

### Help & Guidance
- ✅ **Contextual help system** - Get guidance right where you need it
- ✅ **Income guidance** - Understand the $580/month threshold and seasonal worker rules
- ✅ **Activity combinations** - Learn how to mix activities to reach 80 hours

### Export & Offline
- ✅ **Data export** - JSON or text format with activities and income
- 🚧 **Comprehensive export** - Full package with profile, exemptions, documents (coming soon)
- ✅ **100% offline functionality** - No internet required
- ✅ **Installable PWA** - Add to home screen as native app
- ✅ **Privacy-first** - All data stays on your device

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

### Logging Activities (Hours Mode)

1. Go to the tracking page
2. Ensure you're in "Track Hours" mode
3. Click the "+" button (floating action button)
4. Select a date
5. Select activity type (work, volunteer, or education)
6. Enter hours worked
7. Optionally add organization name
8. Optionally capture or upload verification documents
9. Save

### Logging Income (Income Mode)

1. Go to the tracking page
2. Switch to "Track Income" mode
3. Click "Add Income" + button
4. Enter amount and select date
5. Choose pay period (daily, weekly, bi-weekly, monthly)
6. Optionally add source/employer name
7. Optionally capture or upload pay stubs or other income documents
8. See automatic monthly equivalent calculation
9. Save

### Seasonal Worker Income

1. Switch to "Track Income" mode
2. Toggle "Seasonal Worker" for the current month
3. Add income entries for the month
4. View 6-month income history and rolling average
5. Compliance determined by 6-month average instead of single month

### Viewing Progress

**Hours Mode:**
- Your monthly total is displayed at the top of the tracking page
- Green "Compliant" badge shows when you've met the 80-hour requirement
- Calendar shows visual indicators for dates with logged activities
- Document icons show which activities have attached verification documents

**Income Mode:**
- Your total monthly income is displayed with progress toward $580
- Green "Compliant" badge shows when you've met the income threshold
- Income breakdown by source shows where your income comes from
- Seasonal worker view shows 6-month history and average (if enabled)

### Exporting Data

1. Go to Settings
2. Click "Export Data"
3. Choose format (JSON or Text)
4. Save the file to submit to your agency

## Privacy & Data

- **All data stays on your device** - Nothing is sent to any server
- **No account required** - No sign-up, no login
- **Anonymous usage analytics** - We collect anonymous usage statistics (page views, device types, states) to understand where this tool is needed most. This does NOT include any personal information, activity logs, or documents. Respects "Do Not Track" browser settings.
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

- ✅ **Now** - What's available today (exemption screening, document management, activity tracking)
- 🚧 **Next** - Coming soon (income tracking, hardship reporting, exemption documents, export overhaul)
- 💭 **Later** - Future considerations (SNAP support, state integration, compliance alerts)
- ❌ **Not Planned** - What we're explicitly not building (and why)

## Support

For questions or issues, please open an issue on GitHub.
