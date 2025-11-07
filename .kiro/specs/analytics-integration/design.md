# Design Document: Analytics Integration

## Overview

This design implements privacy-first analytics for HourKeep using Cloudflare Web Analytics. The implementation adds a single script tag to collect anonymous usage data while maintaining the app's core privacy principles. The design prioritizes simplicity, transparency, and future extensibility.

**Key Design Principles:**

- Minimal code changes (single script tag)
- Zero impact on existing functionality
- Complete transparency with users
- Respect for Do Not Track settings
- Future-proof for state-level tracking

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
│  │  │  • Cloudflare Analytics Script (NEW)         │  │    │
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
        │   Cloudflare Web Analytics CDN       │
        │                                       │
        │  • Cookieless tracking                │
        │  • GDPR compliant                     │
        │  • No personal data                   │
        │  • Respects DNT                       │
        └──────────────────────────────────────┘
                           │
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │    Cloudflare Analytics Dashboard    │
        │                                       │
        │  • Page views                         │
        │  • Device types                       │
        │  • Browsers/OS                        │
        │  • Countries (not states)             │
        └──────────────────────────────────────┘
```

### Data Flow

**What Gets Tracked (Anonymous):**

1. Page URL (e.g., `/hourkeep/tracking`, `/hourkeep/settings`)
2. Referrer (where user came from)
3. Device type (mobile, desktop, tablet)
4. Screen resolution
5. Browser and OS
6. Country (derived from IP, not stored)
7. Timestamp

**What Does NOT Get Tracked:**

- ❌ User profile data (name, state, DOB, Medicaid ID)
- ❌ Activity logs (hours, organizations)
- ❌ Documents or images
- ❌ Exemption screening results
- ❌ Any data stored in IndexedDB
- ❌ Form inputs or user interactions
- ❌ IP addresses (not stored by Cloudflare)
- ❌ Cookies or persistent identifiers

## Components and Interfaces

### 1. Root Layout Component (Modified)

**File:** `src/app/layout.tsx`

**Changes:**

- Add Cloudflare Web Analytics script tag in `<head>`
- Add conditional logic to respect Do Not Track
- Add comment explaining analytics implementation

**Implementation Approach:**

```typescript
// Pseudocode structure
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Existing meta tags */}

        {/* Cloudflare Web Analytics - Privacy-first, cookieless analytics */}
        {/* Respects Do Not Track browser setting */}
        {/* Only tracks anonymous page views, device types, and countries */}
        {/* Does NOT track personal data, activities, or documents */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "CLOUDFLARE_TOKEN_HERE"}'
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

Cloudflare Web Analytics automatically respects the DNT header. No additional code needed. The script checks `navigator.doNotTrack` and will not send data if DNT is enabled.

### 2. Privacy Notice Component (Modified)

**File:** `src/components/onboarding/PrivacyNotice.tsx`

**Changes:**

- Update "No tracking or analytics" bullet point
- Add new section explaining anonymous analytics
- Maintain plain language and clear structure
- Add Do Not Track information

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
│   ├── What we collect (page views, device types, countries)
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
countries) to understand where this tool is needed most and improve
the app. This does NOT include any personal information, activity
logs, or documents. Respects 'Do Not Track' browser settings."
```

### 3. README Documentation (Modified)

**File:** `README.md`

**Changes:**

- Update "Privacy & Data" section
- Add "Analytics" subsection
- Link to Cloudflare's privacy policy
- Maintain consistency with Privacy Notice

**New Section:**

```markdown
## Privacy & Data

- **All data stays on your device** - Nothing is sent to any server
- **No account required** - No sign-up, no login
- **Anonymous usage analytics** - We collect anonymous page views, device types,
  and countries (not states) to understand where this tool is needed most.
  No personal data, activity logs, or documents are tracked.
  Respects "Do Not Track" browser settings.
- **You control exports** - Only you decide when to share your data

### What Analytics We Collect

We use [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)
(privacy-first, cookieless) to collect:

- ✅ Page views (which pages you visit)
- ✅ Device type (mobile, desktop, tablet)
- ✅ Browser and operating system
- ✅ Country (not city or state)
- ✅ Screen resolution

We do NOT collect:

- ❌ Your profile information (name, state, DOB, Medicaid ID)
- ❌ Your activity logs (hours worked, organizations)
- ❌ Your documents (pay stubs, verification letters)
- ❌ Your exemption screening results
- ❌ IP addresses or persistent identifiers
- ❌ Cookies or tracking across websites

**Opt Out:** Enable "Do Not Track" in your browser settings to opt out of analytics.

Learn more: [Cloudflare Web Analytics Privacy](https://www.cloudflare.com/privacypolicy/)
```

## Data Models

No new data models required. Analytics data is collected and stored entirely by Cloudflare, not in the app's IndexedDB.

## Error Handling

### Analytics Script Loading Failures

**Scenario:** Cloudflare CDN is unreachable or script fails to load

**Handling:**

- Script has `defer` attribute - won't block page rendering
- If script fails, app continues to function normally
- No error handling needed - silent failure is acceptable
- User experience is unaffected

### Do Not Track Detection

**Scenario:** Browser doesn't support DNT or has non-standard implementation

**Handling:**

- Cloudflare's script handles DNT detection automatically
- Falls back to not tracking if DNT status is ambiguous
- No custom code needed

## Testing Strategy

### Manual Testing

**Test Case 1: Analytics Script Loads**

1. Open HourKeep in browser
2. Open DevTools → Network tab
3. Verify `beacon.min.js` loads from Cloudflare CDN
4. Verify no console errors

**Test Case 2: Do Not Track Respected**

1. Enable "Do Not Track" in browser settings
   - Chrome: Settings → Privacy → Send "Do Not Track"
   - Firefox: Settings → Privacy → Send "Do Not Track"
   - Safari: Preferences → Privacy → Ask websites not to track me
2. Open HourKeep
3. Open DevTools → Network tab
4. Verify `beacon.min.js` loads but sends no tracking requests
5. Check Cloudflare dashboard - no new page views recorded

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
3. Check Cloudflare dashboard
4. Verify page views are recorded with correct paths

### Verification in Cloudflare Dashboard

After deployment, verify:

- Page views are being recorded
- Device types are showing (mobile vs desktop)
- Browser/OS data is accurate
- Country data is showing (should see "United States")
- No personal data is visible in any reports

### Documentation Review

1. Compare Privacy Notice to README
2. Compare README to actual implementation
3. Verify all three are consistent
4. Check for any misleading or inaccurate statements

## Implementation Notes

### Cloudflare Web Analytics Setup

**Prerequisites:**

1. Cloudflare account (free tier is sufficient)
2. Add site to Cloudflare Web Analytics
3. Get analytics token

**Setup Steps:**

1. Log in to Cloudflare dashboard
2. Navigate to Web Analytics
3. Click "Add a site"
4. Enter site URL: `https://naretakis.github.io/hourkeep`
5. Copy the provided token
6. Add script tag to `layout.tsx` with token

**Token Management:**

- Token is public (safe to commit to GitHub)
- Token only allows sending data, not reading it
- No environment variable needed

### Deployment Considerations

**GitHub Pages:**

- Static site - no server-side configuration needed
- Script loads from Cloudflare CDN
- No CORS issues (script is designed for static sites)

**Build Process:**

- No changes to build process
- Script tag is included in HTML output
- Works with Next.js static export

### Future Extensibility: State Tracking

**When state-level tracking is needed:**

1. **Create Cloudflare Worker:**

   ```javascript
   // worker.js
   export default {
     async fetch(request, env) {
       const { state } = await request.json();
       const key = `state:${state}`;
       const count = (await env.KV.get(key)) || 0;
       await env.KV.put(key, count + 1);
       return new Response("OK");
     },
   };
   ```

2. **Call from HourKeep:**

   ```typescript
   // After onboarding completion
   if (userProfile.state) {
     fetch("https://analytics.yourworker.workers.dev/state", {
       method: "POST",
       body: JSON.stringify({ state: userProfile.state }),
     }).catch(() => {
       // Silent failure - analytics shouldn't break app
     });
   }
   ```

3. **Update Privacy Notice:**
   - Add bullet point about state-level tracking
   - Explain it's anonymous (just state abbreviation)
   - Maintain transparency

**This design allows adding state tracking without:**

- Changing the Cloudflare Web Analytics implementation
- Breaking existing analytics
- Requiring major code refactoring

## Security Considerations

### Content Security Policy (CSP)

If CSP is added in the future, allow:

```
script-src 'self' https://static.cloudflareinsights.com;
connect-src 'self' https://cloudflareinsights.com;
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

Cloudflare Web Analytics:

- Retains data for 6 months
- Aggregates older data
- No raw logs stored
- No IP addresses retained

## Alternatives Considered

### Alternative 1: Vercel Analytics

**Pros:** Free, built-in, one line of code
**Cons:** Requires Vercel hosting (we use GitHub Pages)
**Decision:** Not compatible with static GitHub Pages deployment

### Alternative 2: Plausible Analytics

**Pros:** More detailed, better dashboard, state data possible
**Cons:** $9/month, overkill for 50 users
**Decision:** Too expensive for early-stage project

### Alternative 3: No Analytics

**Pros:** Simplest, most private
**Cons:** No visibility into usage, can't improve based on data
**Decision:** Some analytics needed to understand impact

### Alternative 4: Custom Analytics (Cloudflare Worker + KV)

**Pros:** Complete control, can track state data
**Cons:** More complex, requires maintenance, premature optimization
**Decision:** Start simple, add later if needed

## Success Criteria

**Implementation is successful when:**

1. ✅ Cloudflare Web Analytics script loads without errors
2. ✅ Page views appear in Cloudflare dashboard
3. ✅ Do Not Track is respected (verified by testing)
4. ✅ Privacy Notice accurately describes analytics
5. ✅ README documentation is updated and accurate
6. ✅ App functionality is unaffected
7. ✅ No console errors related to analytics
8. ✅ Offline functionality still works
9. ✅ All documentation is consistent
10. ✅ CHANGELOG is updated

## Timeline Estimate

- **Setup Cloudflare account:** 5 minutes
- **Add script to layout.tsx:** 2 minutes
- **Update Privacy Notice:** 15 minutes
- **Update README:** 10 minutes
- **Update CHANGELOG:** 5 minutes
- **Testing:** 15 minutes
- **Total:** ~1 hour

## Open Questions

None - design is straightforward and well-defined.

## References

- [Cloudflare Web Analytics Documentation](https://developers.cloudflare.com/analytics/web-analytics/)
- [Cloudflare Privacy Policy](https://www.cloudflare.com/privacypolicy/)
- [Do Not Track Specification](https://www.w3.org/TR/tracking-dnt/)
- [GDPR Compliance for Analytics](https://gdpr.eu/cookies/)
