# GitHub Release Guide - v3.0.0

**Quick reference for creating the GitHub release after you approve the changes.**

---

## Step-by-Step Process

### Step 1: Review Changes
✅ Review all modified files (see `REVIEW_v3.0.0_CHANGES.md`)

### Step 2: Commit Changes
```bash
git add .
git commit -m "Release v3.0.0 - Exemption Screening"
```

### Step 3: Create Git Tag
```bash
git tag -a v3.0.0 -m "Release v3.0.0 - Exemption Screening

Major new feature: Comprehensive exemption screening system covering all 5 HR1 exemption categories with plain language questionnaire, smart question flow, and dashboard integration.

See RELEASE_NOTES_v3.0.0.md for full details."
```

### Step 4: Push Everything
```bash
# Push the commit
git push origin main

# Push the tag
git push origin v3.0.0
```

### Step 5: Create GitHub Release

1. **Go to releases page:**
   - Navigate to: https://github.com/naretakis/hourkeep/releases/new
   - Or click "Releases" → "Draft a new release"

2. **Fill in the form:**
   - **Choose a tag:** Select `v3.0.0` from dropdown (or type it if not listed)
   - **Target:** `main` branch
   - **Release title:** `v3.0.0 - Exemption Screening`
   - **Description:** Copy the content below

3. **Click "Publish release"**

---

## GitHub Release Description

Copy this into the GitHub release description field:

```markdown
# HourKeep v3.0.0 - Exemption Screening

**Release Date:** November 5, 2025

## 🎯 What's New

Version 3.0.0 introduces comprehensive exemption screening to HourKeep. Find out if you're exempt from Medicaid work requirements before you start tracking hours!

### Exemption Screening System

A complete questionnaire covering all five exemption categories from HR1 legislation:

- **Age-based** - 18 or younger, 65 or older
- **Family/caregiving** - Pregnant, postpartum, caring for children under 13, caring for disabled dependents
- **Health/disability** - Medicare, medically frail, disabled veteran, substance use disorder, mental health conditions, disabilities
- **Program participation** - SNAP/TANF work requirements, drug/alcohol rehabilitation
- **Other** - Recent incarceration, tribal status

### Key Features

✅ **Smart question flow** - Questions adapt based on your answers  
✅ **Plain language** - No legal jargon, simple explanations  
✅ **Definition tooltips** - Tap any underlined term to see what it means  
✅ **Immediate results** - Know right away if you're exempt  
✅ **Dashboard integration** - See your exemption status prominently  
✅ **Screening history** - Track your status over time  
✅ **Rescreen workflow** - Update when circumstances change  

### Why This Matters

- **Save time** - Find out if you don't need to track hours at all
- **Reduce stress** - Understand your exemption status clearly
- **Stay informed** - Know which exemption applies and why
- **Track changes** - Rescreen when life circumstances change

## 📦 What's Included

- 9 new React components for exemption screening
- 6 new library modules for exemption logic
- 30+ plain language definitions
- Complete screening history tracking
- Dashboard and settings integration
- Comprehensive documentation

## 🚀 Upgrade Instructions

### For Users

1. Refresh the app (or it will auto-update)
2. Look for "Check Exemptions" on the dashboard
3. Complete the questionnaire if desired
4. Continue using HourKeep as normal

**No action required** - all existing data remains intact.

### For Developers

```bash
git pull origin main
npm install
npm run dev
```

## 💥 Breaking Changes

**None.** This is a purely additive release.

## 📚 Documentation

- [Full Release Notes](RELEASE_NOTES_v3.0.0.md)
- [Changelog](CHANGELOG.md)
- [Roadmap](ROADMAP.md)
- [README](README.md)

## 🔗 Links

- **Live App:** https://naretakis.github.io/hourkeep
- **Source Code:** https://github.com/naretakis/hourkeep
- **Issues:** https://github.com/naretakis/hourkeep/issues

## 🎉 What's Next

See our [Roadmap](ROADMAP.md) for upcoming features:
- **v4.0** - Enhanced onboarding with privacy notice and extended profile
- **v5.0+** - Income tracking, hardship reporting, compliance alerts

---

**Thank you for using HourKeep!**

*Keep Your Hours, Keep Your Coverage* 💙
```

---

## Verification Steps

After creating the release:

1. **Check the release page:**
   - Visit: https://github.com/naretakis/hourkeep/releases
   - Verify v3.0.0 appears at the top
   - Verify description is formatted correctly

2. **Check the tags page:**
   - Visit: https://github.com/naretakis/hourkeep/tags
   - Verify v3.0.0 tag exists

3. **Check the main branch:**
   - Verify commit appears in history
   - Verify package.json shows 3.0.0

4. **Test the live app:**
   - Visit: https://naretakis.github.io/hourkeep
   - Wait for deployment (may take a few minutes)
   - Verify exemption screening features work

---

## Troubleshooting

### Tag already exists
```bash
# Delete local tag
git tag -d v3.0.0

# Delete remote tag
git push origin :refs/tags/v3.0.0

# Recreate tag
git tag -a v3.0.0 -m "..."
git push origin v3.0.0
```

### Need to update release
- Go to the release page
- Click "Edit release"
- Make changes
- Click "Update release"

### Deployment not working
- Check GitHub Actions tab
- Verify workflow ran successfully
- Check for any error messages

---

## Quick Commands Reference

```bash
# Review changes
git status
git diff

# Commit
git add .
git commit -m "Release v3.0.0 - Exemption Screening"

# Tag
git tag -a v3.0.0 -m "Release v3.0.0 - Exemption Screening"

# Push
git push origin main
git push origin v3.0.0

# View tags
git tag -l

# View tag details
git show v3.0.0
```

---

**Ready to proceed?** Follow the steps above after reviewing the changes!
