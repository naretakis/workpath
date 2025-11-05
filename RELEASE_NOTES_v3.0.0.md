# Release Notes - HourKeep v3.0.0

**Release Date:** November 5, 2025  
**Release Name:** Exemption Screening

---

## Overview

Version 3.0.0 introduces comprehensive exemption screening to HourKeep. This major feature helps users determine if they're exempt from Medicaid work requirements before they start tracking hours. Many people don't realize they qualify for exemptions - this release makes it easy to find out.

---

## What's New

### 🎯 Exemption Screening System

A complete questionnaire system that covers all five exemption categories from HR1 legislation:

1. **Age-based exemptions** - 18 or younger, 65 or older
2. **Family/caregiving exemptions** - Pregnant, postpartum, caring for children under 13, caring for disabled dependents
3. **Health/disability exemptions** - Medicare, medically frail, disabled veteran, substance use disorder, mental health conditions, disabilities
4. **Program participation exemptions** - SNAP/TANF work requirements, drug/alcohol rehabilitation
5. **Other exemptions** - Recent incarceration, tribal status

### Key Features

- **Smart question flow** - Questions adapt based on your answers
- **Plain language** - No legal jargon, simple explanations
- **Definition tooltips** - Tap any underlined term to see what it means
- **Immediate results** - Know right away if you're exempt
- **Dashboard integration** - See your exemption status prominently
- **Screening history** - Track your status over time
- **Rescreen workflow** - Update when circumstances change

### User Benefits

- **Save time** - Find out if you don't need to track hours at all
- **Reduce stress** - Understand your exemption status clearly
- **Stay informed** - Know which exemption applies and why
- **Track changes** - Rescreen when life circumstances change

---

## Technical Changes

### New Components (9)

- `ExemptionBadge.tsx` - Status display component
- `ExemptionHistory.tsx` - Historical screening view
- `ExemptionQuestion.tsx` - Individual question component
- `ExemptionResults.tsx` - Results display
- `QuestionFlow.tsx` - Main questionnaire orchestrator
- `RescreenDialog.tsx` - Confirmation dialog
- `DefinitionTooltip.tsx` - Contextual help tooltips
- `DefinitionsAccordion.tsx` - Full definitions list

### New Libraries (6)

- `calculator.ts` - Exemption determination logic
- `definitions.ts` - 30+ plain language definitions
- `questionFlow.ts` - Question flow engine
- `questions.ts` - Question definitions
- `storage/exemptions.ts` - Database operations
- `types/exemptions.ts` - TypeScript type definitions

### New Routes

- `/exemptions` - Dedicated exemption screening page

### Database Changes

- Added `exemptions` table for screening history
- Schema version remains compatible (no migration needed)

### Files Changed

- 26 files changed
- 4,914 additions
- Comprehensive test coverage

---

## Upgrade Instructions

### For Users

1. Refresh the app (or it will auto-update)
2. Look for "Check Exemptions" on the dashboard
3. Complete the questionnaire if desired
4. Continue using HourKeep as normal

**No action required** - all existing data remains intact.

### For Developers

```bash
# Pull latest changes
git pull origin main

# Install dependencies (if any new ones)
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

**Database migration:** Automatic - no manual steps needed.

---

## Breaking Changes

**None.** This is a purely additive release. All existing functionality continues to work exactly as before.

---

## Known Issues

None at this time.

---

## Documentation Updates

- Updated `README.md` with exemption screening features
- Updated `CHANGELOG.md` with v3.0.0 entry
- Updated `ROADMAP.md` to reflect shipped features
- Added comprehensive inline documentation

---

## What's Next

See [ROADMAP.md](ROADMAP.md) for upcoming features:

- **v4.0** - Enhanced onboarding with privacy notice and extended profile
- **v5.0+** - Income tracking, hardship reporting, compliance alerts

---

## Credits

This release implements the exemption screening specification from `.kiro/specs/workpath-exemption-screening/` with careful attention to:

- HR1 legislation requirements
- Plain language principles
- Mobile-first design
- Offline-first architecture
- Privacy-first approach

---

## Feedback

We'd love to hear from you:

- Is the questionnaire clear and easy to understand?
- Did you find out you're exempt?
- Are the definitions helpful?
- What would make this feature better?

Open an issue on GitHub or reach out through your preferred channel.

---

## Release Assets

- **Source code:** https://github.com/naretakis/hourkeep
- **Live app:** https://naretakis.github.io/hourkeep
- **Git tag:** v3.0.0
- **Commit:** [will be added after tagging]

---

**Thank you for using HourKeep!** 🎉
