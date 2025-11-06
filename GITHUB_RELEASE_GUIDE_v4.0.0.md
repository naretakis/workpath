# GitHub Release Guide - v4.0.0

**Quick reference for creating the GitHub release.**

---

## GitHub Release Description

Copy this into the GitHub release description field when creating the release at:
https://github.com/naretakis/hourkeep/releases/new

---

````markdown
# HourKeep v4.0.0 - Enhanced Onboarding

**Release Date:** November 5, 2025

## 🔐 What's New

Version 4.0.0 introduces a comprehensive onboarding experience that builds trust through transparency and collects essential profile information for better exports and exemption screening.

### Privacy Notice First

Before you enter any data, HourKeep now explains exactly how your information is handled:

✅ **Clear privacy statement** - Plain language explanation of data handling  
✅ **Key privacy points** - All data stays on device, you control exports, no tracking  
✅ **Acknowledgment required** - Confirm understanding before proceeding  
✅ **Always accessible** - Review privacy policy anytime from settings

### Extended Profile Information

HourKeep now collects additional profile information to improve your experience:

**Required Information:**

- Full name - Personalize your experience
- State - Understand state-specific requirements
- Date of birth - Determine age-based exemptions automatically

**Optional Information:**

- Medicaid ID - Include in exports for agency submission
- Phone number - Provide contact information in reports
- Email address - Alternative contact method for agencies

### Secure Data Encryption

Sensitive profile information is now encrypted at rest:

✅ **Date of birth** - Encrypted using Web Crypto API  
✅ **Medicaid ID** - Encrypted for additional security  
✅ **Automatic decryption** - Seamlessly decrypted when you view or export  
✅ **Device-only storage** - Encryption keys never leave your device

### Profile Management

View and update your profile information anytime:

✅ **Profile display** - See all your information at a glance  
✅ **Edit profile** - Update any field when circumstances change  
✅ **Age calculation** - Automatically shows your current age  
✅ **Formatted display** - Phone numbers and dates formatted for readability

### Polished User Experience

Refined UI/UX throughout the onboarding and settings flows:

✅ **Mobile-optimized forms** - Touch-friendly inputs with proper spacing  
✅ **Clear validation** - Helpful error messages in plain language  
✅ **Smart date picker** - Mobile-optimized date selection  
✅ **Phone formatting** - Automatic formatting as you type  
✅ **Smooth transitions** - Polished animations and loading states

## 📦 What's Included

- Privacy notice component with acknowledgment tracking
- Extended profile form with required and optional fields
- Encryption layer using Web Crypto API
- Profile display and editor in settings
- Privacy policy viewer
- Database schema v4 with automatic migration
- Comprehensive validation with helpful error messages

## 🚀 Upgrade Instructions

### For New Users

1. Open HourKeep
2. Read and acknowledge the privacy notice
3. Complete the profile form (all required fields)
4. Optionally add Medicaid ID and contact information
5. Start tracking hours or check exemptions

### For Existing Users

1. Open HourKeep (automatic database migration)
2. Continue using the app normally
3. Optionally complete your profile in Settings → Your Profile
4. Add date of birth to enable age-based exemption screening
5. Add Medicaid ID and contact info for better exports

**Note:** Existing users are not forced to complete new fields immediately.

### For Developers

```bash
git pull origin main
npm install
npm run dev
```

## 💥 Breaking Changes

**None for existing users.** All existing data is preserved. New users will see the enhanced onboarding flow.

## 📚 Documentation

- [Full Release Notes](RELEASE_NOTES_v4.0.0.md)
- [Changelog](CHANGELOG.md)
- [Roadmap](ROADMAP.md)
- [README](README.md)

## 🔗 Links

- **Live App:** https://naretakis.github.io/hourkeep
- **Source Code:** https://github.com/naretakis/hourkeep
- **Issues:** https://github.com/naretakis/hourkeep/issues

## 🎉 What's Next

See our [Roadmap](ROADMAP.md) for upcoming features:

- **v4.1** - Export improvements (include profile in exports)
- **v5.0+** - Income tracking, hardship reporting, compliance alerts

---

**Thank you for using HourKeep!**

_Keep Your Hours, Keep Your Coverage_ 💙
````

---

## Steps to Create Release

1. **Go to releases page:**
   - Navigate to: https://github.com/naretakis/hourkeep/releases/new
   - Or click "Releases" → "Draft a new release"

2. **Fill in the form:**
   - **Choose a tag:** Select `v4.0.0` from dropdown
   - **Target:** `main` branch
   - **Release title:** `v4.0.0 - Enhanced Onboarding`
   - **Description:** Copy the markdown content above

3. **Click "Publish release"**

---

## Verification Steps

After creating the release:

1. **Check the release page:**
   - Visit: https://github.com/naretakis/hourkeep/releases
   - Verify v4.0.0 appears at the top
   - Verify description is formatted correctly

2. **Check the tags page:**
   - Visit: https://github.com/naretakis/hourkeep/tags
   - Verify v4.0.0 tag exists

3. **Check the main branch:**
   - Verify commit appears in history
   - Verify package.json shows 4.0.0

4. **Test the live app:**
   - Visit: https://naretakis.github.io/hourkeep
   - Wait for deployment (may take a few minutes)
   - Verify enhanced onboarding features work

---

## Status

✅ Branch merged to main  
✅ Version bumped to 4.0.0  
✅ Documentation updated (README, CHANGELOG, ROADMAP)  
✅ Release notes created  
✅ Git tag created (v4.0.0)  
✅ Changes pushed to origin  
⏳ GitHub release (ready to create)

---

**Ready to create the GitHub release!** Follow the steps above.
