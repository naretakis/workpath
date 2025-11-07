# Implementation Plan: Analytics Integration

## Overview

This implementation plan breaks down the analytics integration into discrete, manageable tasks. Each task builds on the previous ones and focuses on a specific aspect of the integration. The plan follows a logical sequence: setup → implementation → documentation → testing.

---

## Tasks

- [x] 1. Set up Plausible Analytics account and add site
  - Go to https://plausible.io/register
  - Create account (30-day free trial, no credit card required)
  - Click "Add a website"
  - Enter domain: `naretakis.github.io`
  - Note the domain name for use in script tag
  - Familiarize yourself with the Plausible dashboard
  - _Requirements: 1.1, 3.1_

- [x] 2. Add Plausible Analytics script to root layout
  - [x] 2.1 Add analytics script tag to layout.tsx head section
    - Open `src/app/layout.tsx`
    - Add Plausible Analytics script tag in the `<head>` section
    - Use `defer` attribute to prevent blocking page load
    - Set `data-domain` attribute to `naretakis.github.io`
    - Set `src` attribute to `https://plausible.io/js/script.js`
    - Add descriptive comments explaining what the script does and what it tracks
    - Add comment noting that script automatically respects Do Not Track
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.4, 3.5_

  - [x] 2.2 Verify script loads correctly in development
    - Run `npm run dev`
    - Open browser DevTools → Network tab
    - Verify `script.js` loads from plausible.io
    - Check console for any errors
    - Verify app functionality is unaffected
    - _Requirements: 1.1, 3.4_

- [x] 3. Update Privacy Notice and Privacy Policy components
  - [x] 3.1 Modify the "No tracking" bullet point in PrivacyNotice.tsx
    - Open `src/components/onboarding/PrivacyNotice.tsx`
    - Find the ListItem with "No tracking or analytics" text
    - Update primary text to "Anonymous usage analytics"
    - Update secondary text to explain what is collected (page views, device types, states)
    - Update secondary text to explain what is NOT collected (no personal data, activities, documents)
    - Mention Do Not Track support
    - Maintain plain language and clear structure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.2 Modify the "No tracking" bullet point in PrivacyPolicy.tsx
    - Open `src/components/settings/PrivacyPolicy.tsx`
    - Find the ListItem with "No tracking or analytics" text
    - Update with IDENTICAL wording to PrivacyNotice.tsx (keep both consistent)
    - Update primary text to "Anonymous usage analytics"
    - Update secondary text to match the onboarding version exactly
    - Mention Do Not Track support
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.3 Add new "What We Track" section (optional enhancement)
    - Consider adding a collapsible section with more details about analytics
    - Include specific examples of what is tracked vs not tracked
    - Add link to Plausible's privacy policy (https://plausible.io/privacy)
    - Keep it concise and scannable
    - If added to one component, add to both for consistency
    - _Requirements: 2.2, 2.3, 2.6_

  - [x] 3.4 Review both components for accuracy and consistency
    - Read through entire PrivacyNotice.tsx
    - Read through entire PrivacyPolicy.tsx
    - Verify both components have identical privacy statements
    - Verify all statements are accurate
    - Check for any contradictions
    - Ensure plain language throughout
    - Test on mobile device for readability
    - _Requirements: 2.5, 2.6_

- [x] 4. Update README documentation
  - [x] 4.1 Update "Privacy & Data" section
    - Open `README.md`
    - Find the "Privacy & Data" section
    - Update the "No tracking" bullet point to match Privacy Notice wording
    - Add new "What Analytics We Collect" subsection
    - List what is collected (page views, device types, states)
    - List what is NOT collected (personal data, activities, documents, cities)
    - Explain how to opt out (Do Not Track)
    - Add link to Plausible's privacy policy (https://plausible.io/privacy)
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 4.2 Verify consistency between Privacy Notice and README
    - Compare Privacy Notice wording to README wording
    - Ensure both documents say the same thing
    - Check that technical details match actual implementation
    - Fix any inconsistencies
    - _Requirements: 5.5_

- [x] 5. Update CHANGELOG
  - Open `CHANGELOG.md`
  - Add new entry for analytics integration under appropriate version
  - Describe what was added (Plausible Analytics)
  - Explain why (understand usage patterns, identify which states need tool most)
  - Note privacy-first approach and Do Not Track support
  - Mention state-level geographic data collection
  - Mention Privacy Notice and README updates
  - _Requirements: 5.4_

- [x] 6. Test analytics implementation
  - [x] 6.1 Test basic analytics functionality
    - Build and deploy to GitHub Pages (or test locally)
    - Open app in browser
    - Navigate to multiple pages (tracking, settings, exemptions, export)
    - Wait a few minutes for data to appear
    - Check Plausible Analytics dashboard
    - Verify page views are recorded with correct paths
    - Verify device type is detected correctly
    - _Requirements: 1.1, 3.4_

  - [x] 6.2 Test state-level geographic data
    - Navigate several pages in the app
    - Wait a few minutes for data to appear
    - Check Plausible dashboard → Locations
    - Verify region/state data is showing (e.g., your state)
    - Verify no city-level data is displayed
    - Verify country is showing as "United States"
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 6.3 Test Do Not Track functionality
    - Enable "Do Not Track" in browser settings
    - Open HourKeep in browser
    - Navigate to several pages
    - Check Plausible dashboard after a few minutes
    - Verify NO new page views are recorded
    - Disable DNT and verify tracking resumes
    - Test in multiple browsers (Chrome, Firefox, Safari)
    - _Requirements: 1.2, 1.5, 2.4_

  - [x] 6.4 Test offline functionality
    - Open HourKeep online
    - Go offline (airplane mode or DevTools offline mode)
    - Navigate between pages
    - Log activities, view calendar, check settings
    - Verify app works normally without analytics
    - Verify no console errors related to analytics script
    - Go back online and verify analytics resume
    - _Requirements: 3.4_

  - [x] 6.5 Test on mobile devices
    - Open HourKeep on actual mobile device (iOS and Android if possible)
    - Test basic navigation
    - Verify Privacy Notice is readable on mobile
    - Check Plausible dashboard for mobile device detection
    - Verify no performance issues
    - _Requirements: 1.1, 2.5_

- [ ] 7. Final verification and documentation review
  - [ ] 7.1 Verify all documentation is accurate
    - Re-read Privacy Notice (onboarding)
    - Re-read Privacy Policy (settings)
    - Verify both privacy components have identical wording
    - Re-read README "Privacy & Data" section
    - Re-read CHANGELOG entry
    - Verify all documents are consistent
    - Check for typos or unclear wording
    - _Requirements: 5.5_

  - [ ] 7.2 Verify implementation matches design
    - Review design document
    - Check that all design decisions were implemented
    - Verify no additional tracking was added
    - Confirm Do Not Track is respected
    - Verify no personal data is sent to Plausible
    - Verify state-level (not city-level) data is collected
    - _Requirements: 1.3, 2.6, 4.5_

  - [ ] 7.3 Create summary of what was implemented
    - Document the Plausible domain configuration (for future reference)
    - Note any deviations from the design (if any)
    - Document testing results
    - Note any issues encountered and how they were resolved
    - Document cost ($9/month after 30-day trial)
    - _Requirements: 4.3_

---

## Notes

### Testing Considerations

- Plausible Analytics updates in near real-time (usually within a few minutes)
- Do Not Track behavior varies slightly by browser - test in multiple browsers
- Mobile testing is important since most Medicaid beneficiaries use mobile devices
- Offline testing ensures analytics doesn't break core functionality
- State-level data may take a few page views to appear in dashboard

### Cost Considerations

- **30-day free trial** - No credit card required
- **After trial:** $9/month for up to 10,000 monthly pageviews
- Can cancel anytime from Plausible dashboard
- **Alternative:** Self-host Plausible for free (requires server setup)

### Deployment

After completing all tasks:

1. Commit changes to git
2. Push to GitHub
3. GitHub Actions will automatically deploy to GitHub Pages
4. Wait a few minutes for analytics to start appearing in Plausible dashboard
5. Monitor dashboard for first 24 hours to ensure data is flowing correctly
6. Check state-level geographic data to see where users are located

### Success Criteria

Implementation is complete when:

- ✅ Plausible Analytics script loads without errors
- ✅ Page views appear in Plausible dashboard
- ✅ State/region data appears in Plausible dashboard
- ✅ Do Not Track is respected (verified by testing)
- ✅ Privacy Notice accurately describes analytics
- ✅ README is updated and consistent with Privacy Notice
- ✅ CHANGELOG documents the change
- ✅ App works offline without errors
- ✅ Mobile devices work correctly
- ✅ All documentation is accurate and consistent

### Why Plausible Instead of Cloudflare

- **Cloudflare Web Analytics** requires domain ownership
- Cannot use with GitHub Pages subdomain (`naretakis.github.io`)
- **Plausible** works with any domain, including GitHub Pages
- Provides state-level geographic data (Cloudflare only shows countries)
- Lightweight (< 1KB script)
- Privacy-first, GDPR compliant, no cookies
- Open-source and transparent

### Future Considerations

If the $9/month cost becomes an issue:

1. **Self-host Plausible** - Free, requires server (Vercel, Railway, DigitalOcean)
2. **Switch to Umami** - Similar to Plausible, self-hosted, free
3. **Evaluate usage** - If < 50 users/month, may not need analytics at all

The implementation is designed to be easily swappable - just change the script tag.
