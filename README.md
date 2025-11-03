# WorkPath

**Your Work Requirements Assistant**

A Progressive Web App (PWA) that helps you track work, volunteer, and education hours to maintain your Medicaid benefits.

## What It Does

WorkPath is a simple, privacy-focused app that helps you:

- **Track hours** - Log work, volunteer, and education activities daily
- **Monitor compliance** - See your monthly total and compliance status (80-hour requirement)
- **Stay organized** - Visual calendar shows all your logged activities
- **Export data** - Generate reports for agency submission
- **Work offline** - All data stored locally on your device, no internet required

## Key Features

- ✅ Simple daily activity logging
- ✅ Visual calendar with activity indicators
- ✅ Automatic monthly compliance calculations
- ✅ Edit and delete entries
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
git clone https://github.com/[username]/workpath.git
cd workpath

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

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
workpath/
├── src/
│   ├── app/              # Next.js app routes
│   │   ├── onboarding/   # Initial profile setup
│   │   ├── tracking/     # Main activity tracking page
│   │   └── settings/     # Settings and export
│   ├── components/       # React components
│   │   ├── Calendar.tsx
│   │   ├── ActivityForm.tsx
│   │   ├── Dashboard.tsx
│   │   └── ...
│   ├── lib/              # Utilities and database
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
2. Enter your name and state
3. Start tracking your hours!

### Logging Activities

1. Go to the tracking page
2. Click on any date in the calendar
3. Select activity type (work, volunteer, or education)
4. Enter hours worked
5. Optionally add organization name
6. Save

### Viewing Progress

- Your monthly total is displayed at the top of the tracking page
- Green "Compliant" badge shows when you've met the 80-hour requirement
- Calendar shows visual indicators for dates with logged activities

### Exporting Data

1. Go to Settings
2. Click "Export Data"
3. Choose format (JSON or Text)
4. Save the file to submit to your agency

## Privacy & Data

- **All data stays on your device** - Nothing is sent to any server
- **No account required** - No sign-up, no login
- **No tracking** - We don't collect any analytics or personal information
- **You control exports** - Only you decide when to share your data

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (limited PWA support)

## Contributing

This is a learning project and personal tool. Feel free to fork and customize for your needs!

## License

MIT License - See LICENSE file for details

## Acknowledgments

Built as an MVP learning project to understand:

- Progressive Web Apps
- Next.js App Router
- IndexedDB and offline-first architecture
- Material-UI component library

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - How to deploy to GitHub Pages
- [PWA-TESTING.md](PWA-TESTING.md) - Testing PWA features
- [BRANDING.md](BRANDING.md) - Brand guidelines and messaging

## Support

For questions or issues, please open an issue on GitHub.
