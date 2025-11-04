# Design Document: HourKeep - Enhanced Onboarding

**Improved First-Time User Experience with Privacy Notice**

---

## Overview

This design enhances the initial onboarding experience by adding a clear privacy notice and collecting additional profile information (date of birth, Medicaid ID, contact information). The privacy notice is shown first to establish trust, followed by a streamlined profile setup form.

**Key Design Principles:**

- **Privacy First**: Show privacy notice before collecting any data
- **Minimal Friction**: Keep form simple and fast to complete
- **Optional Fields**: Only name, state, and DOB are required
- **Secure Storage**: Encrypt sensitive fields (DOB, Medicaid ID)
- **Existing User Friendly**: Migrate existing users smoothly

---

## Architecture

### High-Level Flow

```
First Visit → Privacy Notice → Profile Form → Main App
Existing User → Profile Update Prompt (optional) → Main App
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Onboarding Flow                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  OnboardingPage                                         │
│  ├─ Privacy Notice (step 1)                            │
│  └─ Profile Form (step 2)                              │
│                                                          │
│  PrivacyNotice                                          │
│  ├─ Privacy statement                                   │
│  ├─ Key points (bullet list)                           │
│  └─ "I Understand" button                              │
│                                                          │
│  ProfileForm                                            │
│  ├─ Required fields                                     │
│  │   ├─ Full name                                       │
│  │   ├─ State (dropdown)                               │
│  │   └─ Date of birth                                   │
│  ├─ Optional fields                                     │
│  │   ├─ Medicaid ID                                     │
│  │   ├─ Phone number                                    │
│  │   └─ Email address                                   │
│  └─ Submit button                                       │
│                                                          │
│  ProfileEncryption                                      │
│  ├─ Encrypt DOB                                         │
│  ├─ Encrypt Medicaid ID                                │
│  └─ Store in IndexedDB                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Data Models

### Updated User Profile

```typescript
interface UserProfile {
  id: string; // UUID
  name: string; // Full name (required)
  state: string; // State abbreviation (required)
  dateOfBirth: string; // Encrypted, ISO date string (required)
  medicaidId?: string; // Encrypted, optional
  phoneNumber?: string; // Optional, formatted
  email?: string; // Optional
  createdAt: Date; // When profile was created
  updatedAt: Date; // When profile was last updated
  privacyNoticeAcknowledged: boolean; // Must be true
  privacyNoticeAcknowledgedAt: Date; // When acknowledged
  version: number; // Profile schema version (for migrations)
}
```

### Privacy Notice Acknowledgment

```typescript
interface PrivacyAcknowledgment {
  acknowledged: boolean;
  acknowledgedAt: Date;
  version: string; // Privacy notice version (e.g., "1.0")
}
```

---

## Database Schema (IndexedDB)

```typescript
class HourKeepDB extends Dexie {
  profiles!: Table<UserProfile>;
  // ... other tables

  constructor() {
    super("HourKeepDB");

    // Version 4: Update profile schema
    this.version(4)
      .stores({
        profiles: "id", // Same index
        // ... other tables unchanged
      })
      .upgrade(async (tx) => {
        // Migrate existing profiles
        const profiles = await tx.table("profiles").toArray();

        for (const profile of profiles) {
          // Add new fields with defaults
          await tx.table("profiles").update(profile.id, {
            dateOfBirth: "", // Will prompt user to complete
            privacyNoticeAcknowledged: false, // Will prompt
            privacyNoticeAcknowledgedAt: new Date(),
            version: 2,
            updatedAt: new Date(),
          });
        }
      });
  }
}
```

---

## Key Features Implementation

### 1. Privacy Notice Display

**Code Location:**

- Component: `src/components/onboarding/PrivacyNotice.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│  Welcome to HourKeep                │
├─────────────────────────────────────┤
│                                     │
│  Before you start, here's how we    │
│  handle your data:                  │
│                                     │
│  ✓ All data stays on your device   │
│    Nothing is sent to any server    │
│                                     │
│  ✓ You control all exports          │
│    Only you decide when to share    │
│                                     │
│  ✓ You can delete everything        │
│    Remove all data anytime          │
│                                     │
│  ✓ No tracking or analytics         │
│    We don't collect any info        │
│                                     │
│  ✓ Works completely offline         │
│    No internet connection needed    │
│                                     │
│  Your privacy is our priority.      │
│                                     │
│  [I Understand]                     │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**

```typescript
function PrivacyNotice({ onAcknowledge }: Props) {
  const handleAcknowledge = () => {
    const acknowledgment: PrivacyAcknowledgment = {
      acknowledged: true,
      acknowledgedAt: new Date(),
      version: "1.0",
    };
    onAcknowledge(acknowledgment);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Welcome to HourKeep
      </Typography>

      <Typography variant="body1" paragraph>
        Before you start, here's how we handle your data:
      </Typography>

      <List>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="All data stays on your device"
            secondary="Nothing is sent to any server"
          />
        </ListItem>
        {/* ... more items */}
      </List>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleAcknowledge}
        sx={{ mt: 3 }}
      >
        I Understand
      </Button>
    </Box>
  );
}
```

---

### 2. Profile Form

**Code Location:**

- Component: `src/components/onboarding/ProfileForm.tsx`
- Validation: `src/lib/validation/profile.ts`

**UI Design:**

```
┌─────────────────────────────────────┐
│  Set Up Your Profile                │
├─────────────────────────────────────┤
│                                     │
│  Required Information               │
│                                     │
│  Full Name *                        │
│  ┌─────────────────────────────┐   │
│  │ John Doe                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  State *                            │
│  ┌─────────────────────────────┐   │
│  │ California              ▼   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Date of Birth *                    │
│  ┌─────────────────────────────┐   │
│  │ 01/15/1985              📅  │   │
│  └─────────────────────────────┘   │
│  ℹ️ Used to check age exemptions    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Optional Information               │
│                                     │
│  Medicaid ID                        │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  ℹ️ Optional, varies by state       │
│                                     │
│  Phone Number                       │
│  ┌─────────────────────────────┐   │
│  │ (555) 123-4567              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Email Address                      │
│  ┌─────────────────────────────┐   │
│  │ john@example.com            │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Complete Setup]                   │
│                                     │
└─────────────────────────────────────┘
```

**Validation Schema:**

```typescript
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),

  state: z
    .string()
    .length(2, "Please select a state")
    .regex(/^[A-Z]{2}$/, "Invalid state code"),

  dateOfBirth: z.date().refine(
    (date) => {
      const age = calculateAge(date);
      return age >= 16 && age <= 120;
    },
    { message: "Please enter a valid date of birth" },
  ),

  medicaidId: z
    .string()
    .max(50, "Medicaid ID is too long")
    .optional()
    .or(z.literal("")),

  phoneNumber: z
    .string()
    .regex(
      /^(\+1)?[\s.-]?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/,
      "Invalid phone number",
    )
    .optional()
    .or(z.literal("")),

  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});
```

---

### 3. Data Encryption

**Code Location:**

- Utility: `src/lib/utils/encryption.ts`

**Implementation:**

```typescript
// Simple encryption using Web Crypto API
// Note: This is basic encryption for local storage protection
// Not meant for transmission or high-security scenarios

const ENCRYPTION_KEY_NAME = "hourkeep-encryption-key";

async function getEncryptionKey(): Promise<CryptoKey> {
  // Try to get existing key from IndexedDB
  let keyData = await getStoredKey();

  if (!keyData) {
    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    // Store key
    keyData = await crypto.subtle.exportKey("raw", key);
    await storeKey(keyData);

    return key;
  }

  // Import stored key
  return crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptString(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

export async function decryptString(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();

  // Convert from base64
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted,
  );

  return new TextDecoder().decode(decrypted);
}
```

**Usage:**

```typescript
// When saving profile
const encryptedDOB = await encryptString(profile.dateOfBirth.toISOString());
const encryptedMedicaidId = profile.medicaidId
  ? await encryptString(profile.medicaidId)
  : undefined;

await db.profiles.put({
  ...profile,
  dateOfBirth: encryptedDOB,
  medicaidId: encryptedMedicaidId,
});

// When loading profile
const profile = await db.profiles.get(userId);
const decryptedDOB = await decryptString(profile.dateOfBirth);
const decryptedMedicaidId = profile.medicaidId
  ? await decryptString(profile.medicaidId)
  : undefined;
```

---

### 4. Profile Display in Settings

**Code Location:**

- Component: `src/components/settings/ProfileDisplay.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│  Your Profile                       │
├─────────────────────────────────────┤
│                                     │
│  Name                               │
│  John Doe                           │
│                                     │
│  State                              │
│  California                         │
│                                     │
│  Date of Birth                      │
│  January 15, 1985 (39 years old)    │
│                                     │
│  Medicaid ID                        │
│  ABC123456                          │
│                                     │
│  Phone Number                       │
│  (555) 123-4567                     │
│                                     │
│  Email                              │
│  john@example.com                   │
│                                     │
│  Profile created: March 1, 2024     │
│  Last updated: March 15, 2024       │
│                                     │
│  [Edit Profile]                     │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. Profile Editing

**Code Location:**

- Component: `src/components/settings/ProfileEditor.tsx`

**Flow:**

1. User taps "Edit Profile"
2. Show form with current values pre-filled
3. User makes changes
4. Validate on submit
5. Encrypt sensitive fields
6. Update in IndexedDB
7. Show success message

**Implementation:**

```typescript
async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  const db = getDatabase();

  // Encrypt sensitive fields if changed
  if (updates.dateOfBirth) {
    updates.dateOfBirth = await encryptString(updates.dateOfBirth);
  }

  if (updates.medicaidId) {
    updates.medicaidId = await encryptString(updates.medicaidId);
  }

  // Update profile
  await db.profiles.update(userId, {
    ...updates,
    updatedAt: new Date(),
  });
}
```

---

### 6. Existing User Migration

**Code Location:**

- Component: `src/components/onboarding/ProfileUpdatePrompt.tsx`
- Logic: `src/lib/migration/profileMigration.ts`

**Flow:**

1. App detects existing profile missing new fields
2. Show prompt: "Complete Your Profile"
3. User can complete now or skip
4. If completed, merge with existing data
5. If skipped, allow continued use (prompt again later)

**UI Design:**

```
┌─────────────────────────────────────┐
│  Complete Your Profile              │
├─────────────────────────────────────┤
│                                     │
│  We've added new profile fields     │
│  to help you better track your      │
│  work requirements.                 │
│                                     │
│  Would you like to add:             │
│  • Date of birth                    │
│  • Medicaid ID (optional)           │
│  • Contact information (optional)   │
│                                     │
│  This will only take a minute.      │
│                                     │
│  [Complete Now]  [Skip for Now]     │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**

```typescript
async function checkProfileComplete(userId: string): Promise<boolean> {
  const db = getDatabase();
  const profile = await db.profiles.get(userId);

  if (!profile) return false;

  // Check if new fields are present
  return (
    profile.version >= 2 &&
    profile.dateOfBirth !== undefined &&
    profile.privacyNoticeAcknowledged === true
  );
}

async function promptProfileUpdate(userId: string) {
  const shouldPrompt = !(await checkProfileComplete(userId));

  if (shouldPrompt) {
    // Show prompt
    const result = await showDialog({
      title: "Complete Your Profile",
      message: "We've added new profile fields...",
      actions: ["Complete Now", "Skip for Now"],
    });

    if (result === "Complete Now") {
      // Navigate to profile update form
      router.push("/onboarding/update");
    } else {
      // Set flag to prompt again later
      await setProfileUpdateDismissed(userId, new Date());
    }
  }
}
```

---

### 7. Export Integration

**Code Location:**

- Utility: `src/lib/export/json.ts`
- Utility: `src/lib/export/markdown.ts`

**JSON Export (with profile):**

```json
{
  "exportDate": "2024-03-15T10:30:00Z",
  "appVersion": "2.0.0",
  "profile": {
    "name": "John Doe",
    "state": "CA",
    "dateOfBirth": "1985-01-15",
    "medicaidId": "ABC123456",
    "phoneNumber": "(555) 123-4567",
    "email": "john@example.com"
  },
  "activities": [
    // ... activities
  ]
}
```

**Markdown Export (with profile):**

```markdown
# HourKeep Export

**Generated:** March 15, 2024

## Profile

- **Name:** John Doe
- **State:** California
- **Date of Birth:** January 15, 1985
- **Medicaid ID:** ABC123456
- **Phone:** (555) 123-4567
- **Email:** john@example.com

## Activities

...
```

---

## User Interface Components

### New Components

1. **PrivacyNotice.tsx**
   - Privacy statement display
   - Acknowledgment button
   - Key points list

2. **ProfileForm.tsx**
   - Multi-field form
   - Validation
   - Required/optional field sections

3. **ProfileDisplay.tsx**
   - Read-only profile view
   - Formatted display
   - Edit button

4. **ProfileEditor.tsx**
   - Editable profile form
   - Pre-filled values
   - Save/cancel actions

5. **ProfileUpdatePrompt.tsx**
   - Migration prompt for existing users
   - Complete now/skip options

### Modified Components

1. **OnboardingPage.tsx**
   - Add privacy notice step
   - Update profile form

2. **Settings.tsx**
   - Add profile display section
   - Add privacy policy link

3. **Export components**
   - Include profile in exports
   - Add export warning

---

## File Structure

```
src/
├── app/
│   └── onboarding/
│       ├── page.tsx                   # MODIFIED
│       └── update/
│           └── page.tsx               # NEW (for existing users)
├── components/
│   ├── onboarding/
│   │   ├── PrivacyNotice.tsx          # NEW
│   │   ├── ProfileForm.tsx            # MODIFIED
│   │   └── ProfileUpdatePrompt.tsx    # NEW
│   └── settings/
│       ├── ProfileDisplay.tsx         # NEW
│       ├── ProfileEditor.tsx          # NEW
│       └── PrivacyPolicy.tsx          # NEW
├── lib/
│   ├── migration/
│   │   └── profileMigration.ts        # NEW
│   ├── storage/
│   │   ├── db.ts                      # MODIFIED
│   │   └── profile.ts                 # MODIFIED
│   ├── utils/
│   │   └── encryption.ts              # NEW
│   └── validation/
│       └── profile.ts                 # MODIFIED
└── types/
    └── profile.ts                     # MODIFIED
```

---

## State Dropdown Options

```typescript
export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];
```

---

## Error Handling

### Validation Errors

```typescript
// Show inline errors
<TextField
  error={!!errors.name}
  helperText={errors.name?.message}
  // ...
/>

// Show summary errors
if (Object.keys(errors).length > 0) {
  showError(
    "Please fix the errors in the form before continuing."
  );
}
```

### Encryption Errors

```typescript
try {
  const encrypted = await encryptString(value);
} catch (error) {
  console.error("Encryption failed:", error);
  showError("Unable to save profile securely. Please try again.");
}
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Privacy notice displays on first visit
- [ ] Privacy notice can be acknowledged
- [ ] Profile form validates required fields
- [ ] Profile form accepts optional fields
- [ ] DOB validation works (age 16-120)
- [ ] Phone number validation accepts various formats
- [ ] Email validation works
- [ ] State dropdown shows all states
- [ ] Profile saves successfully
- [ ] Sensitive fields are encrypted
- [ ] Profile displays correctly in settings
- [ ] Profile can be edited
- [ ] Existing users see update prompt
- [ ] Profile included in exports
- [ ] Export warning displays

### Test Scenarios

1. **New User**
   - First visit shows privacy notice
   - Complete profile form
   - Redirects to main app
   - Profile visible in settings

2. **Existing User**
   - Sees update prompt
   - Completes new fields
   - Existing data preserved
   - Can skip and continue

3. **Validation**
   - Empty required fields show errors
   - Invalid DOB shows error
   - Invalid phone shows error
   - Invalid email shows error

4. **Encryption**
   - DOB is encrypted in IndexedDB
   - Medicaid ID is encrypted
   - Decryption works on load
   - Export decrypts correctly

---

## Migration Strategy

### Database Migration

```typescript
// Version 4: Update profile schema
this.version(4)
  .stores({
    profiles: "id",
    // ... other tables
  })
  .upgrade(async (tx) => {
    const profiles = await tx.table("profiles").toArray();

    for (const profile of profiles) {
      await tx.table("profiles").update(profile.id, {
        dateOfBirth: "", // Empty, will prompt user
        privacyNoticeAcknowledged: false,
        privacyNoticeAcknowledgedAt: new Date(),
        version: 2,
        updatedAt: new Date(),
      });
    }
  });
```

### Existing User Experience

1. App detects profile version < 2
2. Shows "Complete Your Profile" prompt
3. User completes or skips
4. If skipped, prompt again in 7 days
5. If completed, profile version updated to 2

---

## Future Enhancements

**Phase 2:**

- Profile photo/avatar
- Address collection
- Emergency contact
- Preferred language

**Phase 3:**

- Multi-user profiles (household)
- Profile backup/restore
- Profile sharing (for caseworkers)

---

## Success Metrics

This design is successful when:

- ✅ Privacy notice is clear and builds trust
- ✅ Profile form is quick to complete (< 2 minutes)
- ✅ Validation errors are helpful
- ✅ Sensitive data is encrypted
- ✅ Existing users migrate smoothly
- ✅ Profile data enhances exports

---

## Notes

- Privacy notice should be written in plain language
- Encryption is for local storage protection, not transmission
- DOB is sensitive; handle with care
- Medicaid ID format varies by state; accept any alphanumeric
- Phone validation should be flexible (many formats)
- Consider adding "Why do you need this?" help text for each field
- Existing users should not be forced to complete immediately
