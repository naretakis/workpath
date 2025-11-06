# Release Notes: HourKeep v4.0.0

**Enhanced Onboarding with Privacy Notice and Extended Profile**

---

## Overview

Version 4.0.0 introduces a comprehensive onboarding experience that builds trust through transparency and collects essential profile information to improve data exports and exemption screening. This release focuses on privacy-first design, secure data handling, and a polished user experience.

---

## What's New

### 🔐 Privacy Notice First

Before you enter any data, HourKeep now explains exactly how your information is handled:

- **Clear privacy statement** - Plain language explanation of data handling
- **Key privacy points** - All data stays on your device, you control exports, no tracking
- **Acknowledgment required** - Confirm you understand before proceeding
- **Always accessible** - Review the privacy policy anytime from settings

**Why this matters:** Trust starts with transparency. You deserve to know how your personal information is handled before you share it.

---

### 📋 Extended Profile Information

HourKeep now collects additional profile information to improve your experience:

#### Required Information

- **Full name** - Personalize your experience
- **State** - Understand state-specific requirements
- **Date of birth** - Determine age-based exemptions automatically

#### Optional Information

- **Medicaid ID** - Include in exports for agency submission
- **Phone number** - Provide contact information in reports
- **Email address** - Alternative contact method for agencies

**Why this matters:** More complete profile information means better exports and automatic exemption screening based on your age.

---

### 🔒 Secure Data Encryption

Sensitive profile information is now encrypted at rest:

- **Date of birth** - Encrypted using Web Crypto API
- **Medicaid ID** - Encrypted for additional security
- **Automatic decryption** - Seamlessly decrypted when you view or export
- **Device-only storage** - Encryption keys never leave your device

**Why this matters:** Even though all data stays on your device, encryption adds an extra layer of protection for your most sensitive information.

---

### ⚙️ Profile Management in Settings

View and update your profile information anytime:

- **Profile display** - See all your information at a glance
- **Edit profile** - Update any field when circumstances change
- **Age calculation** - Automatically shows your current age
- **Formatted display** - Phone numbers and dates formatted for readability
- **Timestamps** - See when you created and last updated your profile

**Why this matters:** Your information changes over time. Easy profile editing keeps your data current.

---

### 📊 Improved Data Exports

Profile information is now included in all data exports:

- **Complete exports** - Name, contact info, and Medicaid ID included
- **Professional formatting** - Profile section at the top of exports
- **Decrypted data** - Sensitive fields automatically decrypted for export
- **Export warning** - Clear notice that exports contain personal information

**Why this matters:** Agencies need your contact information. Including it in exports makes submission easier and more professional.

---

### 🎨 Polished User Experience

Refined UI/UX throughout the onboarding and settings flows:

- **Mobile-optimized forms** - Touch-friendly inputs with proper spacing
- **Clear validation** - Helpful error messages in plain language
- **Smart date picker** - Mobile-optimized date selection
- **Phone formatting** - Automatic formatting as you type
- **Help text** - Explanations for each field
- **Smooth transitions** - Polished animations and loading states

**Why this matters:** A great user experience reduces friction and makes the app a pleasure to use.

---

## Technical Improvements

### Database Schema v4

- Added new profile fields: `dateOfBirth`, `medicaidId`, `phoneNumber`, `email`
- Added privacy acknowledgment tracking: `privacyNoticeAcknowledged`, `privacyNoticeAcknowledgedAt`
- Added profile versioning: `version`, `updatedAt`
- Automatic migration for existing users

### Encryption Layer

- Implemented Web Crypto API encryption for sensitive fields
- Secure key generation and storage in IndexedDB
- Automatic encryption/decryption in storage layer
- Error handling for encryption failures

### Validation

- Comprehensive Zod schemas for all profile fields
- Age validation (16-120 years)
- Phone number validation (US formats)
- Email validation
- Helper functions for formatting and validation

### New Components

- `PrivacyNotice` - Privacy statement with acknowledgment
- `ProfileForm` - Complete profile data collection form
- `ProfileDisplay` - Read-only profile view in settings
- `ProfileEditor` - Profile editing interface
- `PrivacyPolicy` - Full privacy policy viewer

---

## Breaking Changes

### For New Users

- **Privacy notice required** - Must acknowledge privacy notice before using app
- **Extended onboarding** - Additional profile fields to complete
- **Date of birth required** - Now a required field (was not collected before)

### For Existing Users

- **No breaking changes** - Existing data preserved
- **Automatic migration** - Database automatically upgrades to v4
- **Optional fields** - New fields are optional for existing users
- **Gradual adoption** - Can continue using app without completing new fields

---

## Migration Guide

### New Users

1. Open HourKeep
2. Read and acknowledge the privacy notice
3. Complete the profile form (all required fields)
4. Optionally add Medicaid ID and contact information
5. Start tracking hours or check exemptions

### Existing Users

1. Open HourKeep (automatic database migration)
2. Continue using the app normally
3. Optionally complete your profile in Settings → Your Profile
4. Add date of birth to enable age-based exemption screening
5. Add Medicaid ID and contact info for better exports

**Note:** Existing users are not forced to complete new fields immediately. You can continue using HourKeep with your existing profile and add new information when convenient.

---

## What's Next

With enhanced onboarding complete, we're focusing on:

- **Export improvements** - Include profile information in exports (v4.1)
- **Income tracking** - Track income alongside hours (v5.0)
- **Hardship reporting** - Report temporary hardships (v5.0)
- **Compliance alerts** - Proactive notifications to stay on track (v5.0)

See [ROADMAP.md](ROADMAP.md) for the full product roadmap.

---

## Upgrade Instructions

### For Users

HourKeep automatically updates when you visit the app. No action required!

### For Developers

```bash
# Pull latest changes
git pull origin main

# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Known Issues

None at this time. Report issues on [GitHub](https://github.com/naretakis/hourkeep/issues).

---

## Credits

This release represents the completion of the Enhanced Onboarding spec, including:

- Privacy notice design and implementation
- Extended profile data collection
- Encryption layer for sensitive data
- Profile management in settings
- Database migration for existing users
- Comprehensive validation and error handling
- UI/UX polish throughout

---

## Feedback

We'd love to hear from you:

- What do you think of the new onboarding experience?
- Is the privacy notice clear and helpful?
- Are the profile fields useful for your needs?
- What would make HourKeep even better?

Open an issue on GitHub or reach out with your thoughts!

---

## Thank You

Thank you for using HourKeep. We're committed to building a tool that helps you maintain your Medicaid benefits with confidence and ease.

**Keep Your Hours, Keep Your Coverage** 💙

---

**Release Date:** November 5, 2025  
**Version:** 4.0.0  
**Previous Version:** 3.0.1  
**Database Version:** 4  
**License:** GPL-3.0-or-later
