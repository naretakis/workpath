# Requirements Document: HourKeep - Exemption Screening

**Help Users Determine if They're Exempt from Work Requirements**

---

## Introduction

This feature adds a self-service exemption screening tool to HourKeep, allowing users to determine if they qualify for an exemption from Medicaid work requirements based on HR1 Section 71119 criteria. The screening is optional and accessible from settings, not blocking the main app functionality.

## Glossary

- **Exemption**: A qualification that exempts an individual from Medicaid work requirements
- **Exemption Category**: One of five main categories (age, family/caregiving, health/disability, program participation, other)
- **Exemption Screening**: A questionnaire that determines if a user qualifies for any exemptions
- **Screening Result**: The outcome indicating whether the user is exempt or must track hours
- **Re-screening**: The ability to retake the exemption questionnaire when circumstances change
- **Applicable Individual**: Person subject to work requirements (age 19-64, Medicaid expansion enrollee, not exempt)
- **Specified Excluded Individual**: Person exempt from work requirements

---

## Requirements

### Requirement 1: Access Exemption Screening

**User Story:** As a user, I want to access the exemption screening from settings, so I can check if I need to track hours.

#### Acceptance Criteria

1. WHEN I open settings THEN THE System SHALL display an "Exemption Screening" option
2. WHEN I tap "Exemption Screening" THEN THE System SHALL navigate to the screening page
3. WHEN I have not completed screening THEN THE System SHALL display "Not Screened" status in settings
4. WHEN I have completed screening THEN THE System SHALL display my exemption status (Exempt or Must Track Hours) in settings
5. WHEN I have completed screening THEN THE System SHALL display the date of last screening

---

### Requirement 2: Screen for Age-Based Exemptions

**User Story:** As a user, I want to be screened for age-based exemptions, so I know if I'm exempt due to my age.

#### Acceptance Criteria

1. WHEN I start the screening THEN THE System SHALL ask for my date of birth
2. WHEN I enter my date of birth THEN THE System SHALL calculate my current age
3. WHEN I am 18 years old or younger THEN THE System SHALL determine I am exempt (age-based)
4. WHEN I am 65 years old or older THEN THE System SHALL determine I am exempt (age-based)
5. WHEN I am between 19-64 years old THEN THE System SHALL continue to the next exemption category

---

### Requirement 3: Screen for Family/Caregiving Exemptions

**User Story:** As a user, I want to be screened for family/caregiving exemptions, so I know if I'm exempt due to my family situation.

#### Acceptance Criteria

1. WHEN age screening does not exempt me THEN THE System SHALL ask if I am currently pregnant or postpartum
2. WHEN I indicate I am pregnant or postpartum THEN THE System SHALL determine I am exempt (family/caregiving)
3. WHEN I am not pregnant/postpartum THEN THE System SHALL ask if I live in a household with a dependent child age 13 or younger
4. WHEN I indicate I have a dependent child 13 or younger THEN THE System SHALL determine I am exempt (family/caregiving)
5. WHEN I do not have young children THEN THE System SHALL ask if I am a parent or guardian of someone with a disability
6. WHEN I indicate I am a parent/guardian of someone with a disability THEN THE System SHALL determine I am exempt (family/caregiving)
7. WHEN none of the family/caregiving criteria apply THEN THE System SHALL continue to the next exemption category

---

### Requirement 4: Screen for Health/Disability Exemptions

**User Story:** As a user, I want to be screened for health/disability exemptions, so I know if I'm exempt due to my health status.

#### Acceptance Criteria

1. WHEN family/caregiving screening does not exempt me THEN THE System SHALL ask if I am on Medicare or entitled to Medicare
2. WHEN I indicate I am on Medicare THEN THE System SHALL determine I am exempt (health/disability)
3. WHEN I am not on Medicare THEN THE System SHALL ask if I am eligible for non-MAGI Medicaid
4. WHEN I indicate I am eligible for non-MAGI Medicaid THEN THE System SHALL determine I am exempt (health/disability)
5. WHEN I am not eligible for non-MAGI Medicaid THEN THE System SHALL ask if I am a disabled veteran
6. WHEN I indicate I am a disabled veteran THEN THE System SHALL determine I am exempt (health/disability)
7. WHEN I am not a disabled veteran THEN THE System SHALL ask if I am medically frail or have special needs
8. WHEN I indicate I am medically frail THEN THE System SHALL provide examples (blind, disabled, substance use disorder, disabling mental disorder, physical/intellectual/developmental disability, serious/complex medical condition)
9. WHEN I confirm I am medically frail THEN THE System SHALL determine I am exempt (health/disability)
10. WHEN none of the health/disability criteria apply THEN THE System SHALL continue to the next exemption category

---

### Requirement 5: Screen for Program Participation Exemptions

**User Story:** As a user, I want to be screened for program participation exemptions, so I know if I'm exempt due to other programs I'm in.

#### Acceptance Criteria

1. WHEN health/disability screening does not exempt me THEN THE System SHALL ask if I am on SNAP or TANF and meeting (not exempt from) those work requirements
2. WHEN I indicate I am on SNAP/TANF and meeting work requirements THEN THE System SHALL determine I am exempt (program participation)
3. WHEN I am not on SNAP/TANF THEN THE System SHALL ask if I am participating in drug or alcohol rehabilitation
4. WHEN I indicate I am in rehabilitation THEN THE System SHALL determine I am exempt (program participation)
5. WHEN none of the program participation criteria apply THEN THE System SHALL continue to the next exemption category

---

### Requirement 6: Screen for Other Exemptions

**User Story:** As a user, I want to be screened for other exemptions, so I know if I'm exempt due to incarceration or tribal status.

#### Acceptance Criteria

1. WHEN program participation screening does not exempt me THEN THE System SHALL ask if I am currently incarcerated or within 3 months of release
2. WHEN I indicate I am incarcerated or recently released THEN THE System SHALL determine I am exempt (other)
3. WHEN I am not incarcerated THEN THE System SHALL ask if I am Indian, Urban Indian, California Indian, or IHS-eligible Indian
4. WHEN I indicate I have tribal status THEN THE System SHALL determine I am exempt (other)
5. WHEN none of the other criteria apply THEN THE System SHALL determine I am NOT exempt and must track hours

---

### Requirement 7: Display Screening Results

**User Story:** As a user, I want to see clear results from my screening, so I understand whether I need to track hours.

#### Acceptance Criteria

1. WHEN screening is complete THEN THE System SHALL display a results page
2. WHEN I am exempt THEN THE System SHALL display "You Are Exempt" with a green checkmark
3. WHEN I am exempt THEN THE System SHALL display which exemption category applies (age, family/caregiving, health/disability, program participation, other)
4. WHEN I am exempt THEN THE System SHALL display a plain-language explanation of why I'm exempt
5. WHEN I am exempt THEN THE System SHALL explain that I do not need to track hours
6. WHEN I am NOT exempt THEN THE System SHALL display "You Must Track Hours" with clear messaging
7. WHEN I am NOT exempt THEN THE System SHALL explain the 80 hours/month or $580/month requirement
8. WHEN viewing results THEN THE System SHALL provide a "Done" button to return to settings

---

### Requirement 8: Store Screening Results

**User Story:** As a user, I want my screening results saved, so I don't have to retake the screening every time I open the app.

#### Acceptance Criteria

1. WHEN screening is complete THEN THE System SHALL store the screening responses in IndexedDB
2. WHEN screening is complete THEN THE System SHALL store the exemption determination (exempt or not exempt) in IndexedDB
3. WHEN screening is complete THEN THE System SHALL store the exemption category (if exempt) in IndexedDB
4. WHEN screening is complete THEN THE System SHALL store the screening date/timestamp in IndexedDB
5. WHEN I return to the app THEN THE System SHALL load my previous screening results
6. WHEN I have screening results THEN THE System SHALL not require me to screen again unless I choose to

---

### Requirement 9: Display Exemption Status on Dashboard

**User Story:** As a user, I want to see my exemption status on the dashboard, so I'm reminded whether I need to track hours.

#### Acceptance Criteria

1. WHEN I have completed screening and am exempt THEN THE System SHALL display an "Exempt" badge on the dashboard
2. WHEN I view the exempt badge THEN THE System SHALL show which exemption category applies
3. WHEN I tap the exempt badge THEN THE System SHALL navigate to my screening results
4. WHEN I have completed screening and am NOT exempt THEN THE System SHALL display "Must Track Hours" on the dashboard
5. WHEN I have not completed screening THEN THE System SHALL display a prompt to "Check if You're Exempt" on the dashboard

---

### Requirement 10: Re-screen When Circumstances Change

**User Story:** As a user, I want to retake the screening when my circumstances change, so my exemption status stays current.

#### Acceptance Criteria

1. WHEN I view my screening results in settings THEN THE System SHALL display a "Re-screen" button
2. WHEN I tap "Re-screen" THEN THE System SHALL display a confirmation dialog explaining that previous results will be replaced
3. WHEN I confirm re-screening THEN THE System SHALL start a new screening questionnaire
4. WHEN I complete re-screening THEN THE System SHALL store the new results with a new timestamp
5. WHEN I complete re-screening THEN THE System SHALL maintain a history of previous screenings (date and result only)
6. WHEN I view screening history THEN THE System SHALL show the date and result (exempt/not exempt) of previous screenings

---

### Requirement 11: Use Plain Language Throughout

**User Story:** As a user, I want the screening questions in plain language, so I can understand what's being asked without legal jargon.

#### Acceptance Criteria

1. WHEN I view any screening question THEN THE System SHALL use plain, conversational language
2. WHEN technical terms are necessary THEN THE System SHALL provide simple explanations
3. WHEN I view exemption categories THEN THE System SHALL use plain language labels (not legal terminology)
4. WHEN I view results THEN THE System SHALL explain my status in simple, clear terms
5. WHEN I view help text THEN THE System SHALL avoid acronyms and legal references

---

### Requirement 12: Provide Question Navigation

**User Story:** As a user, I want to navigate through screening questions easily, so I can review or change my answers.

#### Acceptance Criteria

1. WHEN I am answering questions THEN THE System SHALL display a progress indicator showing how many questions remain
2. WHEN I answer a question THEN THE System SHALL automatically advance to the next question
3. WHEN I am on any question except the first THEN THE System SHALL display a "Back" button
4. WHEN I tap "Back" THEN THE System SHALL return to the previous question with my previous answer pre-selected
5. WHEN I reach the end of screening THEN THE System SHALL display the results page

---

## Out of Scope

The following features are NOT included in this specification:

- ❌ Verification of exemption claims (user self-reports)
- ❌ Document upload for exemption proof
- ❌ Exemption expiration dates or renewal reminders
- ❌ State-specific exemption variations
- ❌ Integration with state Medicaid systems
- ❌ Exemption appeals or disputes
- ❌ Household-level exemption screening
- ❌ Automatic exemption determination based on profile data

---

## Success Criteria

This feature is successful when:

- ✅ Users can complete the full 5-category exemption screening
- ✅ Screening results are stored and displayed on the dashboard
- ✅ Users can re-screen when circumstances change
- ✅ All questions use plain, understandable language
- ✅ Users understand whether they need to track hours based on results
- ✅ Screening is optional and doesn't block access to the main app
- ✅ Screening history is maintained for user reference

---

## Technical Constraints

- **Storage**: IndexedDB for screening responses and results
- **Question Flow**: Conditional logic based on previous answers
- **Mobile-First**: Touch-optimized UI with large buttons
- **Accessibility**: Screen reader compatible, keyboard navigable
- **Privacy**: All data stored locally, no transmission

---

## Privacy & Security

- **Self-Reported**: All exemption information is self-reported by the user
- **Local Storage Only**: Screening data never leaves the device
- **No Verification**: App does not verify exemption claims with external systems
- **User Control**: Users can re-screen or delete screening data at any time
- **Transparency**: Users are informed that screening is for their own reference

---

## Dependencies

This feature depends on:

- Existing settings page (to access screening)
- Existing dashboard (to display exemption status)
- IndexedDB schema (will need to add exemptions table)

---

## Notes

- Exemption criteria based on HR1 Section 71119
- Screening is informational only; users should verify with their state Medicaid agency
- Some exemption categories (e.g., medically frail) may require professional determination
- Consider adding a disclaimer that screening results are not official determinations
- Future iterations could add state-specific variations or exemption documentation
