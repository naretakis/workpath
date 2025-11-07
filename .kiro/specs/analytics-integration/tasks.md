# Implementation Plan: Analytics Integration

## Overview

This implementation plan breaks down the analytics integration into discrete, manageable tasks. Each task builds on the previous ones and focuses on a specific aspect of the integration. The plan follows a logical sequence: setup → implementation → documentation → testing.

---

## Tasks

- [ ] 1. Set up Cloudflare Web Analytics account and get token
  - Create free Cloudflare account (if not already existing)
  - Navigate to Web Analytics section in Cloudflare dashboard
  - Add site: `https://naretakis.github.io/hourkeep`
  - Copy the analytics token provided by Cloudflare
  - Document token in a safe place (it's public but needed for implementation)
  - _Requirements: 1.1, 3.1_

- [ ] 2. Add Cloudflare Web Analytics script to root layout
  - [ ] 2.1 Add analytics script tag to layout.tsx head section
    - Open `src/app/layout.tsx`
    - Add Cloudflare Web Analytics script tag in the `<head>` section
    - Use `defer` attribute to prevent blocking page load
    - Include the token from step 1 in the `data-cf-beacon` attribute
    - Add descriptive comments explaining what the script does and what it tracks
    - Add comment noting that script automatically respects Do Not Track
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.4, 3.5_

  - [ ] 2.2 Verify script loads correctly in development
    - Run `npm run dev`
    - Open browser DevTools → Network tab
    - Verify `beacon.min.js` loads from Cloudflare CDN
    - Check console for any errors
    - Verify app functionality is unaffected
    - _Requirements: 1.1, 3.4_

- [ ] 3. Update Privacy Notice and Privacy Policy components
  - [ ] 3.1 Modify the "No tracking" bullet point in PrivacyNotice.tsx
    - Open `src/components/onboarding/PrivacyNotice.tsx`
    - Find the ListItem with "No tracking or analytics" text
    - Update primary text to "Anonymous usage analytics"
    - Update secondary text to explain what is collected and what is NOT collected
    - Mention Do Not Track support
    - Maintain plain language and clear structure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 3.2 Modify the "No tracking" bullet point in PrivacyPolicy.tsx
    - Open `src/components/settings/PrivacyPolicy.tsx`
    - Find the ListItem with "No tracking or analytics" text
    - Update with IDENTICAL wording to PrivacyNotice.tsx (keep both consistent)
    - Update primary text to "Anonymous usage analytics"
    - Update secondary text to match the onboarding version exactly
    - Mention Do Not Track support
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 3.3 Add new "What We Track" section (optional enhancement)
    - Consider adding a collapsible section with more details about analytics
    - Include specific examples of what is tracked vs not tracked
    - Add link to Cloudflare's privacy policy
    - Keep it concise and scannable
    - If added to one component, add to both for consistency
    - _Requirements: 2.2, 2.3, 2.6_

  - [ ] 3.4 Review both components for accuracy and consistency
    - Read through entire PrivacyNotice.tsx
    - Read through entire PrivacyPolicy.tsx
    - Verify both components have identical privacy statements
    - Verify all statements are accurate
    - Check for any contradictions
    - Ensure plain language throughout
    - Test on mobile device for readability
    - _Requirements: 2.5, 2.6_

- [ ] 4. Update README documentation
  - [ ] 4.1 Update "Privacy & Data" section
    - Open `README.md`
    - Find the "Privacy & Data" section
    - Update the "No tracking" bullet point to match Privacy Notice wording
    - Add new "What Analytics We Collect" subsection
    - List what is collected (page views, device types, countries)
    - List what is NOT collected (personal data, activities, documents)
    - Explain how to opt out (Do Not Track)
    - Add link to Cloudflare's privacy policy
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ] 4.2 Verify consistency between Privacy Notice and README
    - Compare Privacy Notice wording to README wording
    - Ensure both documents say the same thing
    - Check that technical details match actual implementation
    - Fix any inconsistencies
    - _Requirements: 5.5_

- [ ] 5. Update CHANGELOG
  - Open `CHANGELOG.md`
  - Add new entry for analytics integration under appropriate version
  - Describe what was added (Cloudflare Web Analytics)
  - Explain why (understand usage patterns, improve app)
  - Note privacy-first approach and Do Not Track support
  - Mention Privacy Notice and README updates
  - _Requirements: 5.4_

- [ ] 6. Test analytics implementation
  - [ ] 6.1 Test basic analytics functionality
    - Build and deploy to GitHub Pages (or test locally)
    - Open app in browser
    - Navigate to multiple pages (tracking, settings, exemptions, export)
    - Wait 5-10 minutes for data to appear
    - Check Cloudflare Web Analytics dashboard
    - Verify page views are recorded with correct paths
    - Verify device type is detected correctly
    - _Requirements: 1.1, 3.4_

  - [ ] 6.2 Test Do Not Track functionality
    - Enable "Do Not Track" in browser settings
    - Open HourKeep in browser
    - Navigate to several pages
    - Check Cloudflare dashboard after 5-10 minutes
    - Verify NO new page views are recorded
    - Disable DNT and verify tracking resumes
    - Test in multiple browsers (Chrome, Firefox, Safari)
    - _Requirements: 1.2, 1.5, 2.4_

  - [ ] 6.3 Test offline functionality
    - Open HourKeep online
    - Go offline (airplane mode or DevTools offline mode)
    - Navigate between pages
    - Log activities, view calendar, check settings
    - Verify app works normally without analytics
    - Verify no console errors related to analytics script
    - Go back online and verify analytics resume
    - _Requirements: 3.4_

  - [ ] 6.4 Test on mobile devices
    - Open HourKeep on actual mobile device (iOS and Android if possible)
    - Test basic navigation
    - Verify Privacy Notice is readable on mobile
    - Check Cloudflare dashboard for mobile device detection
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
    - Verify no personal data is sent to Cloudflare
    - _Requirements: 1.3, 1.4, 2.6_

  - [ ] 7.3 Create summary of what was implemented
    - Document the Cloudflare token location (for future reference)
    - Note any deviations from the design (if any)
    - Document testing results
    - Note any issues encountered and how they were resolved
    - _Requirements: 4.2, 4.3_

---

## Notes

### Testing Considerations

- Cloudflare Web Analytics has a delay (5-10 minutes) before data appears in dashboard
- Do Not Track behavior varies slightly by browser - test in multiple browsers
- Mobile testing is important since most Medicaid beneficiaries use mobile devices
- Offline testing ensures analytics doesn't break core functionality

### Future Enhancements (Not in This Spec)

If state-level tracking is needed later:

1. Create Cloudflare Worker with KV storage
2. Call Worker from app after onboarding with just state abbreviation
3. Update Privacy Notice to mention state-level tracking
4. Update README with state tracking information

This can be done without modifying the Cloudflare Web Analytics implementation.

### Deployment

After completing all tasks:

1. Commit changes to git
2. Push to GitHub
3. GitHub Actions will automatically deploy to GitHub Pages
4. Wait 5-10 minutes for analytics to start appearing in Cloudflare dashboard
5. Monitor dashboard for first 24 hours to ensure data is flowing correctly

### Success Criteria

Implementation is complete when:

- ✅ Cloudflare Web Analytics script loads without errors
- ✅ Page views appear in Cloudflare dashboard
- ✅ Do Not Track is respected (verified by testing)
- ✅ Privacy Notice accurately describes analytics
- ✅ README is updated and consistent with Privacy Notice
- ✅ CHANGELOG documents the change
- ✅ App works offline without errors
- ✅ Mobile devices work correctly
- ✅ All documentation is accurate and consistent
