/**
 * What the review period is anchored on — W5 (ADR-0005).
 *
 * 42 CFR 435.556(a) measures every review period from a specific month, and nothing
 * in HourKeep stored one. `monthsRequired` is a count with no month attached, and
 * `deadline` is when a notice must be answered, which is not a month under review.
 *
 * Deriving the months from `deadline` was considered and rejected: it would mean
 * inferring the notice date, then the assessed months, when § 435.556(a)(2) forbids
 * states from dictating *which* months count and § 435.556(d) and § 435.558 both
 * require the state to name them. That would be invention presented as computation.
 * So the user tells us, or the app says it does not know.
 *
 * STORED HERE ON PURPOSE, AND IT IS NOT A SCHEMA CHANGE. `db.ts:39` declares
 * `profiles: "id"`, so `id` is the only indexed property and `onboardingContext` is
 * unindexed nested data that Dexie stores as part of the row. Adding an optional
 * field needs no `.stores()` change and no version bump — which matters because
 * `.kiro/steering/data-migration-standards.md` assigns v7 to W3. Old profiles simply
 * lack the field, which is the "add the new shape, leave old rows alone" pattern.
 */
export interface ReviewPeriodAnchor {
  /**
   * Which of 42 CFR 435.556(a)'s contexts the user is in.
   *
   * `application` derives exactly — § 435.556(a)(1)'s months immediately preceding.
   * `renewal` derives from an assumed renewal frequency and is much softer; see
   * `renewalReviewPeriodEndingAt` in `@/lib/reviewPeriod`.
   */
  kind: "application" | "renewal";
  /**
   * `YYYY-MM`. The month of application, or the month the renewal is due.
   * In both cases the month the period is measured *from*, not a month inside it —
   * § 435.556(a)(1) excludes the application month.
   */
  month: string;
}

// Onboarding Context
export interface OnboardingContext {
  hasNotice?: boolean; // Whether user received a notice
  monthsRequired?: number; // Number of months user needs to document (1-6)
  deadline?: Date; // Deadline for responding to notice
  completedAt?: Date; // When onboarding was completed
  /** W5: what the review period is measured from, if the user has told us. */
  reviewPeriodAnchor?: ReviewPeriodAnchor;
}

// User Profile
export interface UserProfile {
  id: string; // UUID
  name: string; // User's name
  state: string; // State abbreviation (e.g., "CA")
  dateOfBirth: string; // Encrypted ISO date string (required)
  medicaidId?: string; // Encrypted, optional
  phoneNumber?: string; // Optional, formatted
  email?: string; // Optional
  createdAt: Date; // When profile was created
  updatedAt: Date; // When profile was last updated
  privacyNoticeAcknowledged: boolean; // Must be true
  privacyNoticeAcknowledgedAt: Date; // When acknowledged
  version: number; // Profile schema version (for migrations)
  onboardingContext?: OnboardingContext; // Optional onboarding context
}

// Activity
export interface Activity {
  id?: number; // Auto-increment ID
  date: string; // YYYY-MM-DD format
  type: "work" | "volunteer" | "education";
  hours: number; // 0-24
  organization?: string; // Optional: where they worked
  createdAt: Date; // When entry was created
  updatedAt: Date; // When entry was last modified
}

// Monthly Summary (Calculated, not stored)
export interface MonthlySummary {
  month: string; // YYYY-MM format
  totalHours: number; // Sum of all hours
  workHours: number; // Sum of work hours
  volunteerHours: number; // Sum of volunteer hours
  educationHours: number; // Sum of education hours
  isCompliant: boolean; // totalHours >= 80
  hoursNeeded: number; // 80 - totalHours (if not compliant)
}
