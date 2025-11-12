# Release Notes - HourKeep v5.0.0

**Release Date:** November 11, 2025

## Income Tracking - A Major Milestone 💰

This is a major release that adds comprehensive income tracking to HourKeep, providing an alternative way to meet Medicaid work requirements. Under HR1 Section 71119, beneficiaries can meet requirements by either completing 80 hours per month of community engagement activities OR earning at least $580 per month in income. This release implements the income path with full feature parity to hours tracking.

---

## What's New

### Income Tracking as Alternative Compliance Method

Users can now choose to track income instead of hours to meet the $580/month threshold required by HR1 legislation.

**Key Features:**

- 💰 **Income entry logging** - Record income with dates, amounts, and sources
- 🔄 **Pay period conversion** - Automatic monthly equivalent calculation for daily, weekly, bi-weekly, and monthly pay periods
- 📊 **Compliance status** - Real-time tracking of progress toward $580 threshold
- 📸 **Document capture** - Attach pay stubs, bank statements, and gig work screenshots
- 🌾 **Seasonal worker support** - 6-month income averaging for variable income
- 🔀 **Flexible mode switching** - Choose hours or income tracking each month
- 📦 **Enhanced export** - Income data included in compliance reports

### Compliance Mode Selector

Choose between hours-based and income-based compliance tracking for each month.

**What You Can Do:**

- Toggle between "Track Hours" and "Track Income" modes
- Switch modes at any time with data preservation
- See clear warnings before switching modes
- Both datasets preserved when switching
- Mode choice tracked per month

**Why This Matters:**

- Different work situations require different tracking methods
- Flexibility to use the method that works best for you
- No data loss when exploring different options

### Income Entry & Management

Log income entries with comprehensive details and automatic calculations.

**What You Can Do:**

- Add income entries with amount, date, and source
- Select pay period (daily, weekly, bi-weekly, monthly)
- See automatic monthly equivalent calculation
- Track multiple income sources per month
- Edit and delete income entries
- View income breakdown by source
- Attach verification documents to each entry

**Pay Period Conversion:**

- Daily: Amount × 30 = Monthly equivalent
- Weekly: Amount × 4.33 = Monthly equivalent
- Bi-weekly: Amount × 2.17 = Monthly equivalent
- Monthly: Amount = Monthly equivalent (no conversion)

**Example:**

- $400 bi-weekly paycheck → $868/month equivalent
- $150 weekly gig work → $649.50/month equivalent
- $650 monthly salary → $650/month equivalent

### Income Compliance Status

Real-time tracking of income progress with visual indicators.

**What You Can See:**

- Total monthly income vs. $580 threshold
- Progress bar showing percentage complete
- Compliance status (compliant/not compliant)
- Amount remaining to reach threshold
- Income breakdown by source
- Number of income entries
- Warning when close to threshold ($550-$579)

**Visual Design:**

- Green checkmark when compliant (≥ $580)
- Warning icon when not compliant (< $580)
- Progress bar with percentage
- Consistent with hours tracking status design

### Seasonal Worker Income Averaging

Support for workers with variable income across seasons.

**What You Can Do:**

- Enable seasonal worker mode for any month
- View 6-month income history
- See rolling average calculation
- Track compliance based on 6-month average
- Understand seasonal income patterns

**How It Works:**

1. Toggle "Seasonal Worker" for the current month
2. System calculates average of current month + previous 5 months
3. Compliance determined by 6-month average (not single month)
4. Visual display shows all 6 months and average

**Who Benefits:**

- Farm workers
- Holiday retail workers
- Summer tourism workers
- Ski resort workers
- Fishing industry workers
- Any worker with seasonal income patterns

**Example:**

```
Oct 2026: $400
Nov 2026: $0
Dec 2026: $800
Jan 2027: $400
Feb 2027: $0
Mar 2027: $880
─────────────────
Total: $2,480
Average: $413/month
Status: Below $580 threshold
```

### Income Document Capture

Attach verification documents to income entries using the same system as activity tracking.

**What You Can Do:**

- Photograph pay stubs with device camera
- Upload existing document images
- Attach multiple documents per income entry
- View document thumbnails in entry list
- Open full-size documents with zoom
- Delete documents with confirmation
- Track document metadata (type, size, capture method)

**Document Types:**

- Pay stubs (traditional employment)
- Bank statements (showing deposits)
- Gig work app screenshots (Uber, DoorDash, Instacart)
- 1099 forms (self-employment)
- Self-employment records (invoices, receipts)
- Payment platform screenshots (PayPal, Venmo, Cash App)

### Comprehensive Help Content

Extensive help system explaining income tracking, thresholds, and edge cases.

**New Help Components:**

- **Income Tracking Help** - Threshold explanation, earned vs. unearned income, gig economy examples
- **Seasonal Worker Help** - IRS definition, 6-month averaging, step-by-step calculation
- **Hour Tracking Help** - Activity definitions, combinations, edge cases
- **Enhanced Document Help** - Income document examples and guidance

**Key Topics Covered:**

- $580 threshold calculation (80 hours × $7.25 federal minimum wage)
- Earned income (wages, self-employment, gig work, tips)
- Unearned income (SSI, SSDI, unemployment, gifts)
- Seasonal worker definition (IRS section 45R(d)(5)(B))
- Income vs. hours comparison
- Gig economy specific guidance
- 20+ edge case examples

### Enhanced Export Functionality

Export now includes income data alongside hours and exemptions.

**What's Included:**

- Income entries with dates, amounts, and sources
- Monthly income summary and compliance status
- Seasonal worker data (if applicable)
- Income documents and metadata
- Compliance mode per month
- Combined with existing hours, exemptions, and profile data

**Export Version:**

- Bumped to v2.0 to reflect income tracking addition
- Backward compatible with existing exports
- Clear labeling of compliance method per month

### Activity Tracking Enhancements

Improvements to hours tracking based on user feedback.

**What's New:**

- **Duplicate to multiple dates** - Replicate activities across multiple days
- **Redesigned activity list** - Card layout with month grouping
- **Improved document management** - Better UI in activity form
- **Next.js Image optimization** - Replaced img tags for better performance

**Duplicate Feature:**

- Select an activity and choose "Duplicate"
- Pick multiple dates from calendar
- Activity replicated to all selected dates
- Saves time for recurring activities

**Example Use Cases:**

- Log same work shift across multiple days
- Add recurring volunteer hours for the week
- Backfill missed entries quickly

### UI/UX Improvements

Polish and refinements throughout the app.

**Changes:**

- Redesigned exemption badge for better mobile responsiveness
- Added exemption details dialog for quick reference
- Improved form field ordering in income entry
- Enhanced document metadata form
- Better touch targets and spacing
- Consistent visual design across modes

---

## Technical Details

### Database Changes

**New Tables (Version 5):**

- `incomeEntries` - Income entry records with pay period conversion
- `incomeDocuments` - Income document metadata
- `incomeDocumentBlobs` - Income document image storage
- `complianceModes` - User's compliance mode choice per month
- `seasonalWorkerStatus` - Seasonal worker designation per user-month

**Automatic Migration:**

- Database automatically upgrades from v4 to v5
- No data loss or manual migration required
- Existing activities, documents, and exemptions preserved

### New Components

**Income Tracking (9 components):**

- `ComplianceModeSelector` - Toggle between hours and income modes
- `IncomeDashboard` - Main income tracking interface
- `IncomeEntryForm` - Add/edit income entries with documents
- `IncomeEntryList` - Display income entries with grouping
- `IncomeStatusIndicator` - Compliance status display
- `SeasonalWorkerToggle` - Enable seasonal worker mode
- `SeasonalWorkerView` - 6-month history and average
- `DuplicateIncomeDialog` - Duplicate entries to multiple dates
- `ExemptionDetailsDialog` - Quick exemption reference

**Help System (3 components):**

- `HourTrackingHelp` - Activity definitions and combinations
- `IncomeTrackingHelp` - Income threshold and earned income guidance
- `SeasonalWorkerHelp` - 6-month averaging explanation

### New Utilities

**Storage Layer:**

- `src/lib/storage/income.ts` - Income entry CRUD operations
- `src/lib/storage/incomeDocuments.ts` - Income document management
- `src/lib/utils/payPeriodConversion.ts` - Pay period calculations

**Type Definitions:**

- `src/types/income.ts` - Complete TypeScript interfaces for income tracking

### Code Statistics

**Changes:**

- 31 files changed
- 6,505 insertions
- 855 deletions
- Net: +5,650 lines

**New Files:**

- 3 spec documents (design, requirements, tasks)
- 12 new components
- 3 new utility modules
- 1 new type definition file

---

## Implementation Summary

This release represents the complete implementation of the income-tracking spec across all phases:

### Phase 1: Core Data Layer ✅

- Database schema with 5 new tables
- TypeScript interfaces for all income types
- Pay period conversion utilities
- Income storage functions with duplicate detection
- Seasonal worker calculation logic

### Phase 2: Basic UI Components ✅

- Compliance mode selector with warnings
- Income status indicator with progress display
- Income entry form with document capture
- Income entry list with edit/delete
- Income dashboard combining all components
- Integration into main tracking page

### Phase 3: Seasonal Worker Feature ✅

- Seasonal worker toggle at user-month level
- 6-month income history display
- Rolling average calculation
- Seasonal worker view component
- Integration into income dashboard

### Phase 4: Help Content & Polish ✅

- Comprehensive income tracking help
- Seasonal worker help with IRS definition
- Hour tracking help for comparison
- Enhanced document verification help
- Form validation and error handling
- Mobile responsiveness and accessibility

### Phase 5: Export & Integration ✅

- Export functionality updated for income data
- Exemption flow integration
- Compliance mode tracking
- Export version bump to 2.0

### Additional Enhancements ✅

- Duplicate functionality for activities and income
- Activity list redesign with card layout
- Improved document management UI
- Next.js Image optimization
- Exemption badge mobile improvements

---

## Breaking Changes

**None.** This is a fully backward-compatible release.

- Existing users see no changes unless they choose income mode
- All existing data (activities, documents, exemptions) preserved
- Database migration is automatic and seamless
- Default mode is "hours" for existing users

---

## Upgrade Notes

### For Existing Users

1. **No action required** - App automatically upgrades database to v5
2. **Default mode** - You'll continue tracking hours by default
3. **Try income mode** - Switch to income tracking anytime from dashboard
4. **Data preserved** - All your existing activities and documents are safe
5. **Export updated** - Exports now include compliance mode information

### For New Users

1. **Choose your method** - Pick hours or income tracking from the start
2. **Switch anytime** - Change modes monthly based on your situation
3. **Both methods work** - Full feature parity between hours and income
4. **Help available** - Comprehensive help content throughout the app

---

## What's Next

See our [ROADMAP.md](ROADMAP.md) for upcoming features:

- **Hardship Reporting** - Report temporary hardships affecting compliance
- **Exemption Document Capture** - Attach documents to exemption responses
- **Historical Tracking** - Log past months for lookback periods
- **Compliance History Dashboard** - 6-month compliance summary view
- **Notice Response Workflow** - Guided response to non-compliance notices

---

## Known Issues

None at this time. Please report any issues on GitHub.

---

## Credits

This release implements the complete income-tracking specification developed in collaboration with domain experts and based on:

- HR1 Section 71119 (Medicaid work requirements legislation)
- Code for America Service Blueprint
- User feedback on flexibility and usability
- Plain language best practices

---

## Feedback

We'd love to hear from you:

- 💬 **Using income tracking?** Tell us how it's working
- 🐛 **Found a bug?** Open an issue on GitHub
- 💡 **Have ideas?** Suggest features for future releases
- 🤝 **Want to contribute?** Check out our development docs

---

## Thank You

Thank you to everyone who provided feedback on the hours tracking system and requested income tracking support. This release makes HourKeep more flexible and useful for a wider range of work situations.

**Keep Your Hours, Keep Your Coverage** 💚

---

**Full Changelog:** [v4.5.0...v5.0.0](https://github.com/naretakis/hourkeep/compare/v4.5.0...v5.0.0)
