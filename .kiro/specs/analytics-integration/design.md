# Design Document: Analytics Integration

## Overview

This design implements privacy-first analytics for HourKeep using Plausible Analytics. The implementation adds a single script tag to collect anonymous usage data while maintaining the app's core privacy principles. The design prioritizes simplicity, transparency, and state-level geographic insights.

**Key Design Principles:**

- Minimal code changes (single script tag)
- Zero impact on existing functionality
- Complete transparency with users
- Respect for Do Not Track settings
- State-level geographic data to understand where tool is needed most

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              HourKeep PWA (Static)                  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Root Layout (layout.tsx)             │  │    │
│  │  │                                               │  │    │
│  │  │  • Material-UI Theme                         │  │    │
│  │  │  • Offline Indicator                         │  │    │
│  │  │  • Storage Warning                           │  │    │
│  │  │  • Plausible Analytics Script (NEW)          │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │      Privacy Notice Component (UPDATED)      │  │    │
│  │  │                                               │  │    │
│  │  │  • Local data storage explanation            │  │    │
│  │  │  • Anonymous analytics disclosure (NEW)      │  │    │
│  │  │  • Do Not Track support (NEW)                │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│                          │                                   │
│                          │ Anonymous page views             │
│                          │ (if DNT not enabled)             │
│                          ▼                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      Plausible Analytics CDN         │
        │                                       │
        │  • Lightweight (< 1KB script)         │
        │  • GDPR compliant                     │
        │  • No cookies                         │
        │  • Respects DNT                       │
        └──────────────────────────────────────┘
                           │
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │    Plausible Analytics Dashboard     │
        │                                       │
        │  • Page views                         │
        │  • Device types                       │
        │  • Browsers/OS                        │
        │  • Regions/States (US states)         │
        │  • Referrers                          │
        └──────────────────────────────────────┘
```

### Data Flow

**What Gets Tracked (Anonymous):**

1. Page URL (e.g., `/hourkeep/tracking`, `/hourkeep/settings`)
2. Referrer (where user came from)
3. Device type (mobile, desktop, tablet)
4. Screen size
5. Browser and OS
6. Region/State (e.g., "California", "Texas", "Florida")
7. Country
8. Timestamp

**What Does NOT Get Tracked:**

- ❌ User profile data (name, state, DOB, Medicaid ID)
- ❌ Activity logs (hours, organizations)
- ❌ Documents or images
- ❌ Exemption screening results
- ❌ Any data stored in IndexedDB
- ❌ Form inputs or user interactions
- ❌ IP addresses (not stored by Plausible)
- ❌ Cookies or persistent identifiers
- ❌ City-level or more granular location data

## Components and Interfaces

### 1. Root Layout Component (Modified)

**File:** `src/app/layout.tsx`

**Changes:**

- Add Plausible Analytics script tag in `<head>`
- Add comment explaining analytics implementation

**Implementation Approach:**

```typescript
// Pseudocode structure
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Existing meta tags */}

        {/* Plausible Analytics - Privacy-first, lightweight analytics */}
        {/* Respects Do Not Track browser setting */}
        {/* Only tracks anonymous page views, device types, and regions/states */}
        {/* Does NOT track personal data, activities, or documents */}
        <script
          defer
          data-domain="naretakis.github.io"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>
        {/* Existing content */}
      </body>
    </html>
  );
}
```

**Do Not Track Handling:**

Plausible Analytics automatically respects the DNT header. No additional code needed. The script checks `navigator.doNotTrack` and will not send data if DNT is enabled.

### 2. Privacy Notice and Privacy Policy Components (Modified)

**Files:** 
- `src/components/onboarding/PrivacyNotice.tsx`
- `src/components/settings/PrivacyPolicy.tsx`

**Changes:**

- Update "No tracking or analytics" bullet point in BOTH components
- Add new section explaining anonymous analytics
- Maintain plain language and clear structure
- Add Do Not Track information
- Mention state-level geographic data
- **Important:** Both components must have IDENTICAL wording for consistency

**Content Structure:**

```
Welcome to HourKeep
├── How We Handle Your Data
│   ├── ✓ All data stays on your device
│   ├── ✓ You control all exports
│   ├── ✓ You can delete everything
│   ├── ✓ Anonymous usage analytics (UPDATED)
│   ├── ✓ Works completely offline
│   └── ✓ Sensitive data is encrypted
│
├── What We Store Locally
│   ├── Profile information
│   ├── Activity logs
│   ├── Documents
│   └── Exemption results
│
├── Anonymous Usage Analytics (NEW SECTION)
│   ├── What we collect (page views, device types, states)
│   ├── What we DON'T collect (no personal data)
│   ├── Why we collect it (improve app, understand where it's needed)
│   └── How to opt out (Do Not Track)
│
├── Your Rights
│   └── (existing content)
│
└── [I Understand and Accept] button
```

**Specific Wording Changes:**

**OLD:**

```
"No tracking or analytics"
"We don't collect any information about how you use the app.
No cookies, no tracking, no analytics."
```

**NEW:**

```
"Anonymous usage analytics"
"We collect anonymous usage statistics (page views, device types,
states) to understand where this tool is needed most and improve
the app. This does NOT include any personal information, activity
logs, or documents. Respects 'Do Not Track' browser settings."
```

### 3. README Documentation (Modified)

**File:** `README.md`

**Changes:**

- Update "Privacy & Data" section
- Add "Analytics" subsection
- Link to Plausible's privacy policy
- Maintain consistency with Privacy Notice

**New Section:**

```markdown
## Privacy & Data

- **All data stays on your device** - Nothing is sent to any server
- **No account required** - No sign-up, no login
- **Anonymous usage analytics** - We collect anonymous page views, device types,
  and states (not cities) to understand where this tool is needed most.
  No personal data, activity logs, or documents are tracked.
  Respects "Do Not Track" browser settings.
- **You control exports** - Only you decide when to share your data

### What Analytics We Collect

We use [Plausible Analytics](https://plausible.io/)
(privacy-first, open-source, lightweight) to collect:

- ✅ Page views (which pages you visit)
- ✅ Device type (mobile, desktop, tablet)
- ✅ Browser and operating system
- ✅ Region/State (e.g., "California", "Texas")
- ✅ Country
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
```

## Data Models

No new data models required. Analytics data is collected and stored entirely by Plausible, not in the app's IndexedDB.

## Error Handling

### Analytics Script Loading Failures

**Scenario:** Plausible CDN is unreachable or script fails to load

**Handling:**

- Script has `defer` attribute - won't block page rendering
- If script fails, app continues to function normally
- No error handling needed - silent failure is acceptable
- User experience is unaffected

### Do Not Track Detection

**Scenario:** Browser doesn't support DNT or has non-standard implementation

**Handling:**

- Plausible's script handles DNT detection automatically
- Falls back to not tracking if DNT status is ambiguous
- No custom code needed

## Testing Strategy

### Manual Testing

**Test Case 1: Analytics Script Loads**

1. Open HourKeep in browser
2. Open DevTools → Network tab
3. Verify `script.js` loads from plausible.io
4. Verify no console errors

**Test Case 2: Do Not Track Respected**

1. Enable "Do Not Track" in browser settings
   - Chrome: Settings → Privacy → Send "Do Not Track"
   - Firefox: Settings → Privacy → Send "Do Not Track"
   - Safari: Preferences → Privacy → Ask websites not to track me
2. Open HourKeep
3. Open DevTools → Network tab
4. Verify script loads but sends no tracking requests
5. Check Plausible dashboard - no new page views recorded

**Test Case 3: Privacy Notice Accuracy**

1. Open HourKeep as new user
2. Read Privacy Notice
3. Verify all statements about analytics are accurate
4. Verify plain language and clarity
5. Verify no contradictions with actual implementation

**Test Case 4: Offline Functionality Unaffected**

1. Open HourKeep online
2. Go offline (airplane mode or DevTools offline)
3. Navigate between pages
4. Verify app works normally
5. Verify no errors related to analytics script

**Test Case 5: Page View Tracking**

1. Open HourKeep
2. Navigate to different pages (tracking, settings, exemptions)
3. Check Plausible dashboard (may take a few minutes)
4. Verify page views are recorded with correct paths

**Test Case 6: State-Level Geographic Data**

1. Open HourKeep from different locations (if possible)
2. Navigate several pages
3. Check Plausible dashboard → Locations
4. Verify state/region data is showing (e.g., "California", "Texas")
5. Verify no city-level data is displayed

### Verification in Plausible Dashboard

After deployment, verify:

- Page views are being recorded
- Device types are showing (mobile vs desktop)
- Browser/OS data is accurate
- Region/State data is showing (should see US states)
- No personal data is visible in any reports

### Documentation Review

1. Compare Privacy Notice to README
2. Compare README to actual implementation
3. Verify all three are consistent
4. Check for any misleading or inaccurate statements

## Implementation Notes

### Plausible Analytics Setup

**Prerequisites:**

1. Plausible account (30-day free trial, then $9/month)
2. Add site to Plausible
3. Get domain name for tracking

**Setup Steps:**

1. Go to https://plausible.io/register
2. Create account (30-day free trial)
3. Click "Add a website"
4. Enter domain: `naretakis.github.io`
5. Copy the provided script tag
6. Add script tag to `layout.tsx`

**Domain Configuration:**

- Domain is `naretakis.github.io` (the GitHub Pages domain)
- Script automatically tracks all paths under this domain
- No API key or token needed in the script tag
- Script is public and safe to commit to GitHub

### Deployment Considerations

**GitHub Pages:**

- Static site - no server-side configuration needed
- Script loads from Plausible CDN
- No CORS issues (script is designed for static sites)

**Build Process:**

- No changes to build process
- Script tag is included in HTML output
- Works with Next.js static export

### Cost Considerations

**Plausible Pricing:**

- 30-day free trial (no credit card required)
- After trial: $9/month for up to 10,000 monthly pageviews
- Can cancel anytime
- Open-source alternative: Self-host Plausible for free (requires server)

## Security Considerations

### Content Security Policy (CSP)

If CSP is added in the future, allow:

```
script-src 'self' https://plausible.io;
connect-src 'self' https://plausible.io;
```

### Privacy Compliance

**GDPR Compliance:**

- ✅ No cookies used
- ✅ No personal data collected
- ✅ Respects DNT
- ✅ Transparent disclosure
- ✅ No consent banner needed (anonymous analytics)

**CCPA Compliance:**

- ✅ No sale of personal information
- ✅ No personal information collected
- ✅ Opt-out via DNT

### Data Retention

Plausible Analytics:

- Retains data indefinitely (you control retention)
- Can delete data anytime from dashboard
- No raw logs stored
- No IP addresses retained

## Alternatives Considered

### Alternative 1: Cloudflare Web Analytics

**Pros:** Free, privacy-first, cookieless
**Cons:** Requires domain ownership (doesn't work with GitHub Pages subdomains), no state-level data
**Decision:** Cannot use with `naretakis.github.io` domain

### Alternative 2: Google Analytics 4

**Pros:** Free, state-level data, widely used
**Cons:** Less privacy-focused, uses cookies, owned by Google
**Decision:** Not aligned with privacy-first values

### Alternative 3: Simple Analytics

**Pros:** Similar to Plausible, privacy-first
**Cons:** Same price as Plausible, less popular
**Decision:** Plausible chosen for better documentation and community

### Alternative 4: Umami (Self-hosted)

**Pros:** Free, open-source, complete control
**Cons:** Requires hosting server, more complex setup
**Decision:** Too complex for initial implementation, can migrate later if needed

### Alternative 5: No Analytics

**Pros:** Simplest, most private
**Cons:** No visibility into usage, can't understand which states need tool most
**Decision:** State-level data is valuable for understanding impact

## Success Criteria

**Implementation is successful when:**

1. ✅ Plausible Analytics script loads without errors
2. ✅ Page views appear in Plausible dashboard
3. ✅ State/region data appears in Plausible dashboard
4. ✅ Do Not Track is respected (verified by testing)
5. ✅ Privacy Notice accurately describes analytics
6. ✅ README documentation is updated and accurate
7. ✅ App functionality is unaffected
8. ✅ No console errors related to analytics
9. ✅ Offline functionality still works
10. ✅ All documentation is consistent
11. ✅ CHANGELOG is updated

## Timeline Estimate

- **Setup Plausible account:** 5 minutes
- **Add script to layout.tsx:** 2 minutes
- **Update Privacy Notice:** 15 minutes
- **Update README:** 10 minutes
- **Update CHANGELOG:** 5 minutes
- **Testing:** 15 minutes
- **Total:** ~1 hour

## Open Questions

None - design is straightforward and well-defined.

## References

- [Plausible Analytics Documentation](https://plausible.io/docs)
- [Plausible Privacy Policy](https://plausible.io/privacy)
- [Plausible GitHub Repository](https://github.com/plausible/analytics)
- [Do Not Track Specification](https://www.w3.org/TR/tracking-dnt/)
- [GDPR Compliance for Analytics](https://gdpr.eu/cookies/)
