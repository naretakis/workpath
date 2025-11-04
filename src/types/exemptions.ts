// Exemption Types for Medicaid Work Requirements

/**
 * Exemption category based on HR1 Section 71119
 */
export type ExemptionCategory =
  | "age"
  | "family-caregiving"
  | "health-disability"
  | "program-participation"
  | "other";

/**
 * User responses to exemption screening questions
 */
export interface ExemptionResponses {
  // Age-based
  dateOfBirth?: Date;
  age?: number; // Calculated from dateOfBirth

  // Family/caregiving
  isPregnantOrPostpartum?: boolean;
  hasDependentChild13OrYounger?: boolean;
  isParentGuardianOfDisabled?: boolean;

  // Health/disability
  isOnMedicare?: boolean;
  isEligibleForNonMAGI?: boolean;
  isDisabledVeteran?: boolean;
  isMedicallyFrail?: boolean;
  medicallyFrailDetails?: string[]; // Which conditions apply

  // Program participation
  isOnSNAPOrTANFMeetingRequirements?: boolean;
  isInRehabProgram?: boolean;

  // Other
  isIncarceratedOrRecentlyReleased?: boolean;
  hasTribalStatus?: boolean;
}

/**
 * Result of exemption screening
 */
export interface ExemptionResult {
  isExempt: boolean; // Overall result
  exemptionCategory?: ExemptionCategory; // Which category exempts them
  exemptionReason?: string; // Specific reason within category
  explanation: string; // Plain language explanation
  nextSteps: string; // What user should do next
}

/**
 * Complete exemption screening record
 */
export interface ExemptionScreening {
  id?: number; // Auto-increment ID
  userId: string; // Link to user profile
  screeningDate: Date; // When screening was completed
  responses: ExemptionResponses; // All question responses
  result: ExemptionResult; // Screening outcome
  version: number; // Screening logic version (for future updates)
}

/**
 * Historical exemption screening record (simplified)
 */
export interface ExemptionHistory {
  id?: number; // Auto-increment ID
  userId: string; // Link to user profile
  screeningDate: Date; // When screening was completed
  isExempt: boolean; // Overall result
  exemptionCategory?: ExemptionCategory; // Which category exempted them
}
