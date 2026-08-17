# Wave 10 — Accessibility and Privacy Hardening

**Depends on:** W1 (MUI 9's accessibility work lands first, reducing scope)
**Detail level:** goals and scope. Task breakdown when the wave starts.

## Goal

Make the app usable by the population it serves, and make its privacy claims true.

## Why this is not polish

Several exclusion categories are disability-based — blind or disabled, disabling mental disorder,
physical/intellectual/developmental disability impairing activities of daily living. The app's own domain
doc notes many beneficiaries have disabilities. For this audience, an inaccessible control is a functional
barrier to keeping health coverage, not a rough edge.

## Scope

### Accessibility

- **The calendar is mouse-only.** `DayCell` is a `Box` with `onClick` and no `role="button"`, no `tabIndex`,
  no keyboard handler, and no `aria-label`. Rebuild it as a proper grid with arrow-key navigation, Enter and
  Space activation, and labels announcing the date, hours logged, and entry count. MUI 9 will not fix this —
  it's our markup.
- **Contrast.** `warning.main` (#D97D54) with white text is roughly 2.9:1 and used for the
  `OfflineIndicator` background — likely failing WCAG AA. Only `primary` declares `contrastText`; add it for
  secondary, success, warning, and error, and verify each against AA. Also check the many `variant="caption"`
  uses of `text.secondary` (#6B6B6B on #FAF9F7, around 5.3:1) at small sizes.
- **Touch targets** are applied ad hoc per component via `sx={{ minHeight: 44 }}`. Move to theme-level
  defaults so nothing is missed — the export page's primary buttons currently omit them entirely.
- **Motion.** `DashboardGuidance` animates `transform: scale(1.02)` with no `prefers-reduced-motion` guard.
- **Focus visibility.** No `focus-visible` customization; verify every interactive element shows a visible
  focus ring against the warm palette.
- **Forms.** Validation errors are set but never focused or scrolled to — with an invalid phone or email the
  submit handler silently returns. Associate errors with inputs, announce them, and move focus.
- **Screen reader pass** on the primary flows: onboarding, screening, logging an activity, and export.
- **Consider `responsiveFontSizes`** and verify layout holds at 200% zoom.

### Privacy and data integrity

- **Resolve the encryption posture honestly.** Today AES-GCM-256 is implemented correctly but the extractable
  key sits base64-encoded in `localStorage` beside the ciphertext in IndexedDB — same origin, no access
  control. Two options: (a) derive the key from a user passphrase via PBKDF2 or Argon2, making it real
  protection at the cost of a lockout risk and a recovery story; or (b) keep it as-is and **relabel it
  accurately** in the privacy notice, dropping "encrypted" language that implies protection it doesn't
  provide. Either is defensible; the current state — strong claim, weak mechanism — is not. Decide and record
  as an ADR.
- **Fix silent corruption.** If `localStorage` is evicted independently of IndexedDB (Safari ITP, partial
  "clear site data"), a new key is generated and old ciphertext becomes undecryptable. `getProfile` currently
  keeps the ciphertext with only a `console.error`, so the UI can render base64 as a date of birth — and
  `dateOfBirth` feeds age determination. Detect, surface, and offer re-entry.
- **Stop double-encrypting.** `updateProfile` encrypts unconditionally, so a passthrough ciphertext gets
  wrapped again.
- **Call `navigator.storage.persist()`.** Nothing does today, so all evidence is evictable under storage
  pressure — poor for an app whose value proposition is a durable local record.
- **Orphan blob cleanup.** `cleanupOrphanedDocuments` only finds documents whose `activityId` is gone; it
  never scans for blobs with no metadata row, and has no income equivalent. Cover both.
- **`StorageInfo` never queries `incomeDocumentBlobs`**, so income document images are invisible in the
  storage breakdown despite often being the largest thing stored. Also replace the
  `activityCount * 200` bytes guess.
- **Analytics consent.** Plausible loads unconditionally in `layout.tsx`, so it fires on `/onboarding`
  **before** the user accepts the privacy notice. Either defer loading until acknowledgement or stop
  describing the disclosure as happening first.

## Acceptance criteria

- [ ] The calendar is fully keyboard-operable with appropriate roles and labels
- [ ] All palette colors declare `contrastText`, and every combination passes WCAG AA 4.5:1
- [ ] Touch-target minimums are theme-level, including the export page
- [ ] `prefers-reduced-motion` is respected
- [ ] Every interactive element has a visible focus indicator
- [ ] Validation errors are announced and receive focus
- [ ] Screen reader pass completed on the four primary flows, with findings recorded
- [ ] Encryption posture decided, implemented, and documented in an ADR; privacy copy matches the mechanism
- [ ] Key loss is detected and surfaced rather than rendering ciphertext
- [ ] `storage.persist()` is requested
- [ ] Orphan cleanup covers blobs and income documents
- [ ] `StorageInfo` includes income document blobs
- [ ] Analytics either loads after consent, or the copy stops implying otherwise

## Risks

| Risk | Mitigation |
|---|---|
| Passphrase-derived keys create a lockout with no recovery | If chosen, require an export before enabling, and be explicit that loss is unrecoverable. This is why (b) is defensible |
| Contrast fixes alter the visual identity | Adjust lightness while preserving hue; `BRANDING.md` documents the intent to check against |
| Full WCAG conformance can't be verified by automation | Automated checks plus a manual assistive-technology pass; state plainly what was and wasn't verified |
