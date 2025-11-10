# HourKeep v4.5.0 Release Notes

**Release Date:** November 10, 2025  
**Release Name:** Activity Definitions Help System

---

## Overview

Version 4.5.0 introduces a comprehensive contextual help system that explains Medicaid work requirements in plain language, right where users need it. This release helps users understand what activities count toward their 80-hour requirement, how income thresholds work, and provides 20+ edge case examples to clarify confusing scenarios.

**Key Achievement:** Users now have clear, accessible guidance throughout the app, reducing confusion about what counts as qualifying activities and helping them track with confidence.

---

## What's New

### 💡 Contextual Help System

Get guidance exactly where you need it, with help icons and tooltips throughout the app.

**Where You'll See Help:**

- **Activity form** - Help icons next to each activity type (work, volunteer, education, work programs)
- **Income tracking** - Guidance on the $580/month threshold and seasonal worker rules
- **Dashboard** - First-time user onboarding card with 4 key steps
- **Document sections** - Guidance on what documents to capture and why

**Mobile-Responsive:**

- Desktop: Hover tooltips with detailed information
- Mobile: Bottom sheet modals that slide up from the bottom
- Touch-friendly: All interactive elements 44px minimum

---

### 📚 Comprehensive Activity Definitions

Clear explanations for each activity type, sourced directly from HR1 Section 71119.

**Work Activities:**

- What counts: Paid employment, including hourly, salaried, self-employment
- Examples: Full-time job, part-time job, gig work (Uber, DoorDash), freelancing
- Critical clarification: **Job searching does NOT count** as a qualifying activity

**Volunteer Activities:**

- What counts: Unpaid community service for non-profit organizations
- Examples: Food bank, animal shelter, community center, religious organization service projects
- What doesn't count: Helping family/friends, religious worship attendance

**Education Activities:**

- What counts: Enrolled half-time or more in school, college, vocational training
- Examples: Community college (6+ credits), vocational school, GED program
- What doesn't count: Online courses not part of formal program, study time alone

**Work Programs:**

- What counts: Job training, workforce development, employment services programs
- Examples: State workforce programs, vocational rehabilitation, job corps
- What doesn't count: Informal mentoring, self-directed learning

---

### 🎯 Edge Case Examples (20+ Scenarios)

Real-world scenarios with clear visual indicators showing what counts and what doesn't.

**Visual Indicators:**

- ✅ Green checkmark - Counts toward 80 hours
- ❌ Red X - Does not count
- ⚠️ Warning icon - Varies based on circumstances

**Example Scenarios:**

- **Gig work (Uber, DoorDash)** - ✅ Counts if you're paid
- **On-call shifts** - ⚠️ Only hours actually worked count
- **Training at new job** - ✅ Counts if you're paid for training time
- **Commute time** - ❌ Does not count
- **Helping at church** - ⚠️ Service projects count, worship attendance doesn't
- **Caring for family member** - ❌ Does not count (unless you're paid as caregiver)
- **Online classes** - ⚠️ Only if part of formal program with enrollment
- **Tips and bonuses** - ✅ Count toward $580/month income threshold
- **Reimbursements** - ❌ Do not count as income

---

### 💰 Income Threshold Guidance

Clear explanation of the $580/month alternative to the 80-hour requirement.

**Key Information:**

- **Threshold:** $580 per month (80 hours × $7.25 federal minimum wage)
- **What counts:** Wages, salaries, tips, commissions, self-employment income
- **What doesn't count:** Benefits (SNAP, TANF), gifts, loans, reimbursements
- **Seasonal workers:** Can average income over previous 6 months

**Example Calculation for Seasonal Workers:**

```
Month 1: $1,200
Month 2: $1,100
Month 3: $800
Month 4: $200
Month 5: $150
Month 6: $150

Total: $3,600 ÷ 6 months = $600/month average
Result: ✅ Meets $580 threshold
```

---

### 🔄 Activity Combination Rules

Understand how to mix different activities to reach 80 hours.

**Key Points:**

- Activities can be combined to reach 80 hours total
- Example: 40 hours work + 40 hours volunteer = 80 hours (compliant)
- Example: 50 hours work + 20 hours education + 10 hours volunteer = 80 hours (compliant)
- Minimum: Must reach 80 hours total across all activities

---

### 🎓 Dashboard Onboarding

First-time users see a helpful guidance card with 4 key steps.

**Guidance Steps:**

1. **Check if you're exempt** - You might not need to track at all
2. **Use the calendar** - Log activities daily for best results
3. **Review your progress** - Check your monthly total regularly
4. **Export when ready** - Generate reports for agency submission

**Features:**

- Dismissible card - Hide once you're familiar with the app
- Restore anytime - Click help button in header to bring it back
- Action links - Direct links to exemptions, tracking, and export

---

### 📱 Plain Language & Mobile-First

All content written in plain language and optimized for mobile devices.

**Plain Language:**

- 8th grade reading level (verified with Hemingway Editor)
- Short sentences (average 15 words)
- Active voice with "you" language
- No jargon - technical terms explained simply
- HR1 source references for accuracy

**Mobile Optimization:**

- Touch-friendly targets (44px minimum)
- Bottom sheet modals on mobile
- Readable text (13px minimum font size)
- Smooth animations (250ms slide-up, 300ms expand/collapse)
- Tested at 320px width (smallest mobile screens)

---

## Technical Improvements

### New Components

- **HelpTooltip** - Responsive help with desktop tooltips and mobile bottom sheets
- **EdgeCaseExamples** - Visual display of edge case scenarios with indicators
- **ActivityFormHelp** - Inline help for activity form fields
- **IncomeHelp** - Income threshold and seasonal worker guidance
- **DashboardGuidance** - First-time user onboarding card
- **HelpSection** - Reusable collapsible section component
- **DocumentVerificationHelp** - Document upload guidance

### Content Structure

- **Centralized help content** - All definitions in `src/content/helpText.ts`
- **Type-safe** - Full TypeScript coverage for help content
- **Sourced from HR1** - All definitions cite Section 71119
- **Reusable patterns** - Components can be used throughout app

### Accessibility

- Keyboard navigation support (Enter/Space to open, Escape to close)
- Proper ARIA labels and roles
- Focus management
- Screen reader friendly

---

## What This Means for Users

### Before v4.5.0

- Users had to guess what activities counted
- Confusion about edge cases (does commute time count?)
- No guidance on income threshold
- Unclear if job searching counted (it doesn't!)
- No onboarding for first-time users

### After v4.5.0

- Clear definitions for each activity type
- 20+ edge case examples with visual indicators
- Income threshold explained with calculations
- Critical clarification: job searching does NOT count
- First-time users get helpful onboarding guidance
- Help available right where you need it

---

## Upgrade Notes

### For Users

- **No action required** - Help system is automatically available
- **Look for help icons** - Tap/click to see guidance
- **Dashboard guidance** - New users see onboarding card on first load
- **Dismiss when ready** - Hide guidance card once you're familiar

### For Developers

- **No breaking changes** - All existing functionality preserved
- **New components** - Available for reuse in future features
- **Centralized content** - Easy to update help text in one place
- **Type-safe** - TypeScript ensures correct usage

---

## What's Next

### Coming in v4.6

**Export Improvements:**

- Include profile information in exports
- Professional formatting with profile section
- Export warnings about personal information

### Future Considerations

- Income tracking feature
- Hardship reporting
- Compliance alerts and predictions
- Multi-language support

See [ROADMAP.md](ROADMAP.md) for full details.

---

## Resources

- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Documentation:** [README.md](README.md)
- **Spec:** `.kiro/specs/activity-definitions-help/`

---

## Feedback

We'd love to hear from you:

- Is the help content clear and useful?
- Are there edge cases we should add?
- What other guidance would be helpful?

Open an issue on GitHub or reach out through the repository.

---

**Thank you for using HourKeep!** 🎉

Keep your hours, keep your coverage.
