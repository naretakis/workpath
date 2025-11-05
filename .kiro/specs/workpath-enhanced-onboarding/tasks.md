# Implementation Tasks: HourKeep - Enhanced Onboarding

**Improved First-Time User Experience with Privacy Notice**

---

## Task Overview

This task list breaks down the enhanced onboarding feature into discrete, manageable steps. Each task builds on previous work and produces working, integrated code.

**Total: 7 sections, 22 tasks**

---

- [x] 1. Database Schema and Data Models

- [x] 1.1 Update UserProfile interface
  - Modify `src/types/profile.ts`
  - Add `dateOfBirth` field (string, encrypted)
  - Add `medicaidId` field (string, optional, encrypted)
  - Add `phoneNumber` field (string, optional)
  - Add `email` field (string, optional)
  - Add `privacyNoticeAcknowledged` field (boolean)
  - Add `privacyNoticeAcknowledgedAt` field (Date)
  - Add `version` field (number)
  - Add `updatedAt` field (Date)
  - Export updated interface

- [x] 1.2 Update IndexedDB schema
  - Modify `src/lib/storage/db.ts`
  - Increment database version to 4
  - Add upgrade function to migrate existing profiles
  - Add default values for new fields
  - Set `version: 2` for migrated profiles
  - Test migration with existing data

- [x] 1.3 Update profile storage operations
  - Modify `src/lib/storage/profile.ts`
  - Update `saveProfile()` to handle new fields
  - Update `getProfile()` to decrypt sensitive fields
  - Add `updateProfile()` function
  - Add error handling for encryption/decryption

---

- [x] 2. Encryption Utilities

- [x] 2.1 Implement encryption functions
  - Create `src/lib/utils/encryption.ts`
  - Implement `getEncryptionKey()` function
  - Implement `encryptString(plaintext)` function using Web Crypto API
  - Implement `decryptString(ciphertext)` function
  - Add key storage in IndexedDB
  - Add error handling

- [x] 2.2 Test encryption
  - Test encryption with various strings
  - Test decryption returns original value
  - Test key persistence across sessions
  - Verify encrypted data is not readable

---

- [x] 3. Validation Schemas

- [x] 3.1 Update profile validation schema
  - Modify `src/lib/validation/profile.ts`
  - Add validation for `name` (required, 1-100 chars)
  - Add validation for `state` (required, 2-char code)
  - Add validation for `dateOfBirth` (required, valid date, age 16-120)
  - Add validation for `medicaidId` (optional, max 50 chars)
  - Add validation for `phoneNumber` (optional, valid US format)
  - Add validation for `email` (optional, valid email format)
  - Export updated schema

- [x] 3.2 Add helper validation functions
  - Add `calculateAge(dateOfBirth)` function
  - Add `formatPhoneNumber(phone)` function
  - Add `validatePhoneNumber(phone)` function
  - Export helper functions

---

- [x] 4. Privacy Notice Component

- [x] 4.1 Build PrivacyNotice component
  - Create `src/components/onboarding/PrivacyNotice.tsx`
  - Add welcome heading
  - Add privacy statement text
  - Add bullet list of key points:
    - All data stays on device
    - You control exports
    - You can delete everything
    - No tracking or analytics
    - Works offline
  - Add "I Understand" button
  - Style for mobile-first
  - Ensure 44px+ touch target for button

- [x] 4.2 Add privacy notice acknowledgment logic
  - Handle "I Understand" button click
  - Create acknowledgment object with timestamp
  - Pass acknowledgment to parent component
  - Proceed to profile form

---

- [x] 5. Profile Form Component

- [x] 5.1 Build ProfileForm component
  - Create `src/components/onboarding/ProfileForm.tsx`
  - Add form heading
  - Add "Required Information" section
  - Add "Optional Information" section
  - Integrate React Hook Form
  - Integrate Zod validation
  - Style for mobile-first

- [x] 5.2 Add required fields
  - Add full name text input
  - Add state dropdown (all 50 states + DC)
  - Add date of birth date picker (mobile-optimized)
  - Mark fields as required with asterisk
  - Add validation error display

- [x] 5.3 Add optional fields
  - Add Medicaid ID text input with help text
  - Add phone number input with formatting
  - Add email input
  - Add help text explaining fields are optional
  - Add "Why do you need this?" help text for each field

- [x] 5.4 Implement form submission
  - Validate all fields on submit
  - Show validation errors inline
  - Encrypt sensitive fields (DOB, Medicaid ID)
  - Save profile to IndexedDB
  - Handle save errors
  - Redirect to main app on success

---

- [x] 6. Onboarding Page

- [x] 6.1 Update OnboardingPage
  - Modify `src/app/onboarding/page.tsx`
  - Add two-step flow (privacy notice → profile form)
  - Show PrivacyNotice first
  - Show ProfileForm after acknowledgment
  - Handle navigation between steps
  - Save complete profile on form submission

- [x] 6.2 Add routing logic
  - Check if profile exists on app load
  - Redirect to onboarding if no profile
  - Redirect to main app if profile complete
  - Handle existing users with incomplete profiles

---

- [x] 7. Settings Integration

- [x] 7.1 Build ProfileDisplay component
  - Create `src/components/settings/ProfileDisplay.tsx`
  - Display all profile fields (read-only)
  - Decrypt sensitive fields for display
  - Format date of birth (show age)
  - Format phone number
  - Show profile created and updated dates
  - Add "Edit Profile" button

- [x] 7.2 Build ProfileEditor component
  - Create `src/components/settings/ProfileEditor.tsx`
  - Pre-fill form with current values
  - Allow editing all fields
  - Validate on submit
  - Encrypt sensitive fields if changed
  - Update profile in IndexedDB
  - Show success message
  - Return to profile display

- [x] 7.3 Add profile section to settings
  - Modify `src/app/settings/page.tsx`
  - Add "Your Profile" section
  - Integrate ProfileDisplay component
  - Add navigation to ProfileEditor

- [x] 7.4 Build PrivacyPolicy component
  - Create `src/components/settings/PrivacyPolicy.tsx`
  - Display full privacy notice text
  - Show acknowledgment date
  - Add "Close" button
  - Style for readability

- [x] 7.5 Add privacy policy to settings
  - Add "Privacy Policy" option in settings
  - Link to PrivacyPolicy component
  - Make easily accessible

---

- [ ] 8. Existing User Migration

- [ ] 8.1 Build ProfileUpdatePrompt component
  - Create `src/components/onboarding/ProfileUpdatePrompt.tsx`
  - Display explanation of new fields
  - List what will be added
  - Add "Complete Now" button
  - Add "Skip for Now" button
  - Style as modal or banner

- [ ] 8.2 Implement migration detection
  - Create `src/lib/migration/profileMigration.ts`
  - Implement `checkProfileComplete(userId)` function
  - Check if profile has new fields
  - Check if profile version >= 2
  - Return boolean

- [ ] 8.3 Add migration prompt to app
  - Check profile completeness on app load
  - Show ProfileUpdatePrompt if incomplete
  - Handle "Complete Now" (navigate to update form)
  - Handle "Skip for Now" (dismiss, show again in 7 days)
  - Store dismissal timestamp

- [ ] 8.4 Create profile update page
  - Create `src/app/onboarding/update/page.tsx`
  - Show ProfileForm with only new fields
  - Pre-fill existing fields (read-only)
  - Merge new fields with existing profile
  - Preserve all existing data
  - Update profile version to 2

---

- [ ] 9. Export Integration SKIP THIS - WE'LL DO A SEPARATE SPEC FOR THIS

- [ ] 9.1 Update JSON export
  - Modify `src/lib/export/json.ts`
  - Include all profile fields in export
  - Decrypt sensitive fields for export
  - Add profile section to export structure
  - Test export with new fields

- [ ] 9.2 Update Markdown export
  - Modify `src/lib/export/markdown.ts`
  - Add profile section at top of export
  - Format profile fields clearly
  - Include all fields (including optional if filled)
  - Test export with new fields

- [ ] 9.3 Add export warning
  - Show warning before export that it contains personal information
  - List what personal information is included
  - Require confirmation before download
  - Make warning clear and prominent

---

- [ ] 10. Testing and Polish

- [ ] 10.1 Test new user flow
  - Open app as new user
  - Verify privacy notice displays first
  - Complete privacy notice
  - Complete profile form
  - Verify redirect to main app
  - Verify profile saved correctly
  - Verify sensitive fields encrypted

- [ ] 10.2 Test existing user migration
  - Open app with existing profile
  - Verify update prompt displays
  - Test "Complete Now" flow
  - Test "Skip for Now" flow
  - Verify existing data preserved
  - Verify new fields added

- [ ] 10.3 Test profile editing
  - Open settings
  - View profile
  - Edit profile
  - Change various fields
  - Verify changes saved
  - Verify sensitive fields re-encrypted

- [ ] 10.4 Test validation
  - Test empty required fields
  - Test invalid date of birth
  - Test invalid phone number
  - Test invalid email
  - Verify error messages are clear
  - Verify inline error display

- [ ] 10.5 Test encryption
  - Save profile with sensitive data
  - Check IndexedDB (data should be encrypted)
  - Load profile
  - Verify data decrypts correctly
  - Test across sessions

- [ ] 10.6 Test export integration
  - Export data as JSON
  - Verify profile included
  - Verify sensitive fields decrypted in export
  - Export data as Markdown
  - Verify profile formatted correctly
  - Verify export warning displays

- [ ] 10.7 Test privacy policy access
  - Open settings
  - Tap "Privacy Policy"
  - Verify full text displays
  - Verify acknowledgment date shown
  - Verify can close and return

- [ ] 10.8 Test offline functionality
  - Complete onboarding offline
  - Edit profile offline
  - Verify all works without network
  - Verify data persists

- [x] 10.9 Polish UI and UX
  - Ensure all buttons have proper touch targets (44px+)
  - Add loading states where needed
  - Ensure error messages are clear and helpful

---

- [ ] Spec completed!

## Implementation Notes

### Order of Implementation

1. **Start with data layer** (Task 1.x) - Update database and types
2. **Build encryption** (Task 2.x) - Critical for sensitive data
3. **Update validation** (Task 3.x) - Ensure data quality
4. **Build privacy notice** (Task 4.x) - First step in flow
5. **Build profile form** (Task 5.x) - Main data collection
6. **Update onboarding page** (Task 6.x) - Wire it together
7. **Settings integration** (Task 7.x) - View and edit
8. **Migration** (Task 8.x) - Handle existing users
9. **Export integration** (Task 9.x) - Include in exports
10. **Test and polish** (Task 10.x) - Final QA

### Testing Strategy

- Test with fresh install (new user)
- Test with existing profile (migration)
- Test encryption thoroughly (critical for privacy)
- Test validation with various inputs
- Test on mobile devices (primary use case)
- Verify accessibility

### Encryption Notes

- Use Web Crypto API (built into browsers)
- Store encryption key in IndexedDB
- Encrypt DOB and Medicaid ID
- Decrypt only when needed (display, export)
- Never log decrypted values

### Common Pitfalls

- Don't forget to decrypt before displaying
- Don't forget to encrypt before saving
- Handle encryption errors gracefully
- Don't force existing users to complete immediately
- Test migration thoroughly (easy to lose data)

---

## Success Criteria

This feature is complete when:

- ✅ New users see privacy notice before any data collection
- ✅ Profile form collects all required and optional fields
- ✅ Sensitive fields (DOB, Medicaid ID) are encrypted
- ✅ Profile displays correctly in settings
- ✅ Profile can be edited
- ✅ Existing users can add new fields without data loss
- ✅ Profile included in exports
- ✅ Export warning displays
- ✅ Privacy policy accessible from settings
- ✅ All functionality works offline

---

## Estimated Time

- **Task 1**: 1 day (data layer)
- **Task 2**: 1-2 days (encryption)
- **Task 3**: 1 day (validation)
- **Task 4**: 1 day (privacy notice)
- **Task 5**: 2-3 days (profile form)
- **Task 6**: 1 day (onboarding page)
- **Task 7**: 2-3 days (settings integration)
- **Task 8**: 2-3 days (migration)
- **Task 9**: 1 day (export integration)
- **Task 10**: 2-3 days (testing and polish)

**Total: 14-21 days** (3-4 weeks part-time)

---

## Dependencies

- Existing onboarding page
- Existing settings page
- Existing export functionality
- IndexedDB (Dexie.js)
- Material-UI components
- React Hook Form and Zod
- Web Crypto API

---

## Optional Enhancements (Future)

- Profile photo/avatar
- Address collection
- Emergency contact
- Preferred language
- Multi-user profiles (household)
- Profile backup/restore
- Profile sharing (for caseworkers)
