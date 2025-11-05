# Requirements Document: HourKeep - Enhanced Onboarding

**Improved First-Time User Experience with Privacy Notice**

---

## Introduction

This feature enhances the initial onboarding experience by collecting additional profile information (date of birth, Medicaid ID, contact information) and presenting a clear privacy notice that users must acknowledge before using the app.

## Glossary

- **Onboarding**: The first-time user experience when setting up the app
- **Profile**: User's personal information stored locally
- **Privacy Notice**: A clear statement explaining how user data is handled
- **Acknowledgment**: User's confirmation that they have read and understood the privacy notice
- **Medicaid ID**: State-issued identification number for Medicaid beneficiaries (optional, varies by state)
- **Sensitive Data**: Information that requires special handling (DOB, Medicaid ID)

---

## Requirements

### Requirement 1: Display Privacy Notice First

**User Story:** As a user, I want to understand how my data will be handled before I start using the app, so I can make an informed decision.

#### Acceptance Criteria

1. WHEN I open the app for the first time THEN THE System SHALL display a privacy notice before any other content
2. WHEN I view the privacy notice THEN THE System SHALL explain that all data stays on my device
3. WHEN I view the privacy notice THEN THE System SHALL explain that no data is sent to any server
4. WHEN I view the privacy notice THEN THE System SHALL explain that I control all data exports
5. WHEN I view the privacy notice THEN THE System SHALL explain that I can delete all data at any time
6. WHEN I view the privacy notice THEN THE System SHALL provide an "I Understand" button to acknowledge
7. WHEN I tap "I Understand" THEN THE System SHALL record my acknowledgment with timestamp
8. WHEN I tap "I Understand" THEN THE System SHALL proceed to the profile setup form

---

### Requirement 2: Collect Basic Profile Information

**User Story:** As a user, I want to enter my basic information once, so the app can personalize my experience.

#### Acceptance Criteria

1. WHEN I acknowledge the privacy notice THEN THE System SHALL display a profile setup form
2. WHEN I view the form THEN THE System SHALL request my full name (required)
3. WHEN I view the form THEN THE System SHALL request my state (required, dropdown selector)
4. WHEN I enter my name THEN THE System SHALL validate it is not empty
5. WHEN I select my state THEN THE System SHALL validate a state is selected
6. WHEN I complete basic information THEN THE System SHALL enable the "Next" button

---

### Requirement 3: Collect Date of Birth

**User Story:** As a user, I want to enter my date of birth, so the app can determine if I might be age-exempt from work requirements.

#### Acceptance Criteria

1. WHEN I view the profile form THEN THE System SHALL request my date of birth (required)
2. WHEN I enter my date of birth THEN THE System SHALL use a mobile-optimized date picker
3. WHEN I enter my date of birth THEN THE System SHALL validate it is a valid date
4. WHEN I enter my date of birth THEN THE System SHALL validate I am at least 16 years old (reasonable minimum)
5. WHEN I enter my date of birth THEN THE System SHALL validate I am not more than 120 years old (reasonable maximum)
6. WHEN my date of birth indicates I may be age-exempt THEN THE System SHALL display a hint suggesting I check the exemption screening

---

### Requirement 4: Collect Medicaid ID

**User Story:** As a user, I want to optionally enter my Medicaid ID, so I can include it in my exports if needed.

#### Acceptance Criteria

1. WHEN I view the profile form THEN THE System SHALL request my Medicaid ID (optional)
2. WHEN I view the Medicaid ID field THEN THE System SHALL display help text explaining it's optional and varies by state
3. WHEN I enter a Medicaid ID THEN THE System SHALL accept alphanumeric characters
4. WHEN I leave the Medicaid ID blank THEN THE System SHALL allow me to proceed
5. WHEN I enter a Medicaid ID THEN THE System SHALL store it securely with basic encryption

---

### Requirement 5: Collect Contact Information

**User Story:** As a user, I want to optionally enter my contact information, so I can include it in my exports for agency submission.

#### Acceptance Criteria

1. WHEN I view the profile form THEN THE System SHALL request my phone number (optional)
2. WHEN I enter a phone number THEN THE System SHALL validate it is a valid US phone format
3. WHEN I view the profile form THEN THE System SHALL request my email address (optional)
4. WHEN I enter an email address THEN THE System SHALL validate it is a valid email format
5. WHEN I leave contact fields blank THEN THE System SHALL allow me to proceed

---

### Requirement 6: Save Profile Securely

**User Story:** As a user, I want my profile information stored securely on my device, so my personal information is protected.

#### Acceptance Criteria

1. WHEN I complete the profile form THEN THE System SHALL validate all required fields
2. WHEN validation passes THEN THE System SHALL store the profile in IndexedDB
3. WHEN storing sensitive fields (DOB, Medicaid ID) THEN THE System SHALL apply basic encryption
4. WHEN storing the profile THEN THE System SHALL record the creation timestamp
5. WHEN the profile is saved THEN THE System SHALL redirect to the main tracking page
6. WHEN the profile is saved THEN THE System SHALL not show onboarding again on subsequent visits

---

### Requirement 7: Display Profile in Settings

**User Story:** As a user, I want to view my profile information in settings, so I can verify what I've entered.

#### Acceptance Criteria

1. WHEN I open settings THEN THE System SHALL display my profile information
2. WHEN I view my profile THEN THE System SHALL show my name, state, date of birth
3. WHEN I view my profile THEN THE System SHALL show my Medicaid ID (if entered)
4. WHEN I view my profile THEN THE System SHALL show my contact information (if entered)
5. WHEN I view my profile THEN THE System SHALL display the date I created my profile
6. WHEN I view my profile THEN THE System SHALL provide an "Edit Profile" button

---

### Requirement 8: Edit Profile Information

**User Story:** As a user, I want to update my profile information, so I can keep it current when things change.

#### Acceptance Criteria

1. WHEN I tap "Edit Profile" THEN THE System SHALL display the profile form with current values pre-filled
2. WHEN I edit any field THEN THE System SHALL validate the new value
3. WHEN I save changes THEN THE System SHALL update the profile in IndexedDB
4. WHEN I save changes THEN THE System SHALL record the update timestamp
5. WHEN I save changes THEN THE System SHALL display a success message
6. WHEN I cancel editing THEN THE System SHALL discard changes and return to settings

---

### Requirement 9: Handle Profile Data in Exports

**User Story:** As a user, I want my profile information included in data exports, so agencies have my contact information.

#### Acceptance Criteria

1. WHEN I export my data THEN THE System SHALL include my profile information in the export
2. WHEN I export as JSON THEN THE System SHALL include all profile fields (including optional ones if filled)
3. WHEN I export as text/markdown THEN THE System SHALL format profile information clearly at the top
4. WHEN exporting sensitive fields THEN THE System SHALL decrypt them for the export
5. WHEN I view the export THEN THE System SHALL display a warning that it contains personal information

---

### Requirement 10: Migrate Existing Users

**User Story:** As an existing user, I want to add the new profile fields without losing my existing data, so I can continue using the app seamlessly.

#### Acceptance Criteria

1. WHEN an existing user opens the updated app THEN THE System SHALL detect the profile is missing new fields
2. WHEN new fields are missing THEN THE System SHALL display a "Complete Your Profile" prompt
3. WHEN the user completes their profile THEN THE System SHALL merge new fields with existing data
4. WHEN the user completes their profile THEN THE System SHALL preserve all existing activities and documents
5. WHEN the user dismisses the prompt THEN THE System SHALL allow continued use with optional fields left blank

---

### Requirement 11: Display Privacy Notice in Settings

**User Story:** As a user, I want to review the privacy notice anytime, so I can remind myself how my data is handled.

#### Acceptance Criteria

1. WHEN I open settings THEN THE System SHALL display a "Privacy Policy" option
2. WHEN I tap "Privacy Policy" THEN THE System SHALL display the full privacy notice
3. WHEN I view the privacy notice THEN THE System SHALL display the date I originally acknowledged it
4. WHEN I view the privacy notice THEN THE System SHALL provide a "Close" button to return to settings

---

### Requirement 12: Validate Form Fields with Clear Feedback

**User Story:** As a user, I want clear feedback when I make a mistake in the form, so I can correct it easily.

#### Acceptance Criteria

1. WHEN I enter invalid data in any field THEN THE System SHALL display an error message below the field
2. WHEN I view an error message THEN THE System SHALL explain what's wrong in plain language
3. WHEN I correct an error THEN THE System SHALL remove the error message immediately
4. WHEN I try to submit with errors THEN THE System SHALL prevent submission and highlight all error fields
5. WHEN all fields are valid THEN THE System SHALL enable the submit button

---

## Out of Scope

The following features are NOT included in this specification:

- ❌ Multi-user profiles or household management
- ❌ Profile photos or avatars
- ❌ Address collection (beyond state)
- ❌ Social Security Number collection
- ❌ Integration with state Medicaid systems for verification
- ❌ Password protection or authentication
- ❌ Profile backup or sync across devices
- ❌ Detailed privacy settings or preferences
- ❌ Terms of service or legal agreements

---

## Success Criteria

This feature is successful when:

- ✅ New users see and acknowledge the privacy notice before using the app
- ✅ Users can enter all required and optional profile information
- ✅ Sensitive data (DOB, Medicaid ID) is encrypted in storage
- ✅ Users can view and edit their profile in settings
- ✅ Profile information is included in data exports
- ✅ Existing users can add new profile fields without data loss
- ✅ Form validation provides clear, helpful feedback
- ✅ Privacy notice is accessible from settings anytime

---

## Technical Constraints

- **Storage**: IndexedDB for profile data
- **Encryption**: Basic encryption for DOB and Medicaid ID using Web Crypto API
- **Validation**: Client-side validation with Zod schemas
- **Mobile-First**: Touch-optimized form inputs
- **Privacy**: All data stored locally, no transmission

---

## Privacy & Security

- **Encryption**: Sensitive fields (DOB, Medicaid ID) encrypted at rest
- **Local Storage Only**: All profile data stored in IndexedDB on device
- **No Transmission**: Profile data never sent to any server
- **User Control**: Users can edit or delete profile data at any time
- **Clear Notice**: Privacy notice explains data handling before collection
- **Export Warning**: Users warned that exports contain personal information

---

## Dependencies

This feature depends on:

- Existing settings page (to display and edit profile)
- Existing export functionality (to include profile in exports)
- IndexedDB schema (will need to update profiles table with new fields)

---

## Notes

- DOB is sensitive data and should be encrypted even though stored locally
- Medicaid ID format varies by state; accept any alphanumeric format
- Phone number validation should accept various formats (with/without dashes, parentheses)
- Consider adding a "Why do you need this?" help text for each field
- Privacy notice should be written in plain language, not legal jargon
- Existing users should not be forced to complete new fields immediately
- Consider adding a "Skip for now" option for optional fields during onboarding
