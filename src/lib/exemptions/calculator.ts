import { ExemptionResponses, ExemptionResult } from "@/types/exemptions";

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Calculate exemption status based on user responses
 * Follows HR1 Section 71119 exemption criteria
 */
export function calculateExemption(
  responses: ExemptionResponses,
): ExemptionResult {
  // 1. Check age-based exemptions
  if (responses.dateOfBirth) {
    const age = calculateAge(responses.dateOfBirth);

    if (age <= 18) {
      return {
        isExempt: true,
        exemptionCategory: "age",
        exemptionReason: "18 years old or younger",
        explanation:
          "You are exempt from work requirements because you are 18 or younger.",
        nextSteps:
          "You do not need to track hours. You can still use this app if you want to track your activities.",
      };
    }

    if (age >= 65) {
      return {
        isExempt: true,
        exemptionCategory: "age",
        exemptionReason: "65 years old or older",
        explanation:
          "You are exempt from work requirements because you are 65 or older.",
        nextSteps:
          "You do not need to track hours. You can still use this app if you want to track your activities.",
      };
    }
  }

  // 2. Check family/caregiving exemptions
  if (responses.isPregnantOrPostpartum) {
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Pregnant or postpartum",
      explanation:
        "You are exempt from work requirements because you are pregnant or postpartum (within 60 days after giving birth).",
      nextSteps:
        "You do not need to track hours during this time. You may need to re-screen after your postpartum period ends.",
    };
  }

  if (responses.hasDependentChild13OrYounger) {
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Has dependent child 13 or younger",
      explanation:
        "You are exempt from work requirements because you live in a household with a child age 13 or younger.",
      nextSteps:
        "You do not need to track hours. If your child turns 14 or your household situation changes, you may need to re-screen.",
    };
  }

  if (responses.isParentGuardianOfDisabled) {
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Parent or guardian of someone with a disability",
      explanation:
        "You are exempt from work requirements because you are a parent or guardian of someone with a disability.",
      nextSteps:
        "You do not need to track hours. You can still use this app if you want to track your activities.",
    };
  }

  // 3. Check health/disability exemptions
  if (responses.isOnMedicare) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "On Medicare or entitled to Medicare",
      explanation:
        "You are exempt from work requirements because you are on Medicare or entitled to Medicare.",
      nextSteps:
        "You do not need to track hours. You can still use this app if you want to track your activities.",
    };
  }

  if (responses.isEligibleForNonMAGI) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Eligible for non-MAGI Medicaid",
      explanation:
        "You are exempt from work requirements because you are eligible for non-MAGI Medicaid (for people with disabilities or who are elderly).",
      nextSteps:
        "You do not need to track hours. You can still use this app if you want to track your activities.",
    };
  }

  if (responses.isDisabledVeteran) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Disabled veteran",
      explanation:
        "You are exempt from work requirements because you are a disabled veteran.",
      nextSteps:
        "You do not need to track hours. You can still use this app if you want to track your activities.",
    };
  }

  if (responses.isMedicallyFrail) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Medically frail or has special needs",
      explanation:
        "You are exempt from work requirements because you are medically frail or have special needs.",
      nextSteps:
        "You do not need to track hours. You can still use this app if you want to track your activities.",
    };
  }

  // 4. Check program participation exemptions
  if (responses.isOnSNAPOrTANFMeetingRequirements) {
    return {
      isExempt: true,
      exemptionCategory: "program-participation",
      exemptionReason: "On SNAP or TANF and meeting work requirements",
      explanation:
        "You are exempt from Medicaid work requirements because you are already meeting work requirements for SNAP or TANF.",
      nextSteps:
        "You do not need to track hours for Medicaid. Continue meeting your SNAP or TANF requirements.",
    };
  }

  if (responses.isInRehabProgram) {
    return {
      isExempt: true,
      exemptionCategory: "program-participation",
      exemptionReason: "Participating in drug or alcohol rehabilitation",
      explanation:
        "You are exempt from work requirements because you are participating in a drug or alcohol rehabilitation program.",
      nextSteps:
        "You do not need to track hours during your treatment. Focus on your recovery.",
    };
  }

  // 5. Check other exemptions
  if (responses.isIncarceratedOrRecentlyReleased) {
    return {
      isExempt: true,
      exemptionCategory: "other",
      exemptionReason: "Currently incarcerated or within 3 months of release",
      explanation:
        "You are exempt from work requirements because you are currently incarcerated or were released within the last 3 months.",
      nextSteps:
        "You do not need to track hours during this time. You may need to re-screen after 3 months from your release date.",
    };
  }

  if (responses.hasTribalStatus) {
    return {
      isExempt: true,
      exemptionCategory: "other",
      exemptionReason:
        "Indian, Urban Indian, California Indian, or IHS-eligible",
      explanation:
        "You are exempt from work requirements because you are Indian, Urban Indian, California Indian, or eligible for Indian Health Service.",
      nextSteps:
        "You do not need to track hours. You can still use this app if you want to track your activities.",
    };
  }

  // 6. No exemptions found - must track hours
  return {
    isExempt: false,
    explanation:
      "Based on your responses, you do not qualify for an exemption from work requirements.",
    nextSteps:
      "You need to track 80 hours per month of work, volunteer, or education activities. Use this app to log your hours and stay compliant.",
  };
}
