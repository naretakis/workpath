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
          "You may be exempt from work requirements because you're 18 or younger.",
        nextSteps:
          "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
      };
    }

    if (age >= 65) {
      return {
        isExempt: true,
        exemptionCategory: "age",
        exemptionReason: "65 years old or older",
        explanation:
          "You may be exempt from work requirements because you're 65 or older.",
        nextSteps:
          "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
      };
    }
  }

  // 2. Check family/caregiving exemptions
  if (responses.isPregnantOrPostpartum) {
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Pregnant or recently gave birth",
      explanation:
        "You may be exempt from work requirements because you're pregnant or recently gave birth.",
      nextSteps:
        "You don't need to track hours for Medicaid during this time. If your situation changes after 60 days from giving birth, you can re-screen to check your status.",
    };
  }

  if (responses.hasDependentChild13OrYounger) {
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Has dependent child 13 or younger",
      explanation:
        "You may be exempt from work requirements because you live with a child age 13 or younger.",
      nextSteps:
        "You don't need to track hours for Medicaid. If your child turns 14 or your living situation changes, you can re-screen to check your status.",
    };
  }

  if (responses.isParentGuardianOfDisabled) {
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Parent or guardian of someone with a disability",
      explanation:
        "You may be exempt from work requirements because you're a parent or guardian of someone with a disability.",
      nextSteps:
        "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
    };
  }

  // 3. Check health/disability exemptions
  if (responses.isOnMedicare) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Has Medicare",
      explanation:
        "You may be exempt from work requirements because you have Medicare.",
      nextSteps:
        "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
    };
  }

  if (responses.isEligibleForNonMAGI) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason:
        "Gets Medicaid for disability or long-term care (non-MAGI Medicaid)",
      explanation:
        "You may be exempt from work requirements because you get Medicaid for a disability or long-term care needs (non-MAGI Medicaid).",
      nextSteps:
        "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
    };
  }

  if (responses.isDisabledVeteran) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Disabled veteran",
      explanation:
        "You may be exempt from work requirements because you're a veteran with a 100% disability rating from the VA.",
      nextSteps:
        "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
    };
  }

  if (responses.isMedicallyFrail) {
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Has a serious health condition or disability",
      explanation:
        "You may be exempt from work requirements because you have a serious health condition or disability (defined as medically frail or special needs).",
      nextSteps:
        "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
    };
  }

  // 4. Check program participation exemptions
  if (responses.isOnSNAPOrTANFMeetingRequirements) {
    return {
      isExempt: true,
      exemptionCategory: "program-participation",
      exemptionReason:
        "Meeting work requirements for food stamps (SNAP) or cash assistance (TANF)",
      explanation:
        "You're already meeting work requirements through food stamps (SNAP) or cash assistance (TANF), so you may be exempt from Medicaid work requirements.",
      nextSteps:
        "You don't need to track hours for Medicaid. Just keep meeting your food stamps or cash assistance requirements, and you're all set.",
    };
  }

  if (responses.isInRehabProgram) {
    return {
      isExempt: true,
      exemptionCategory: "program-participation",
      exemptionReason: "In drug or alcohol treatment program",
      explanation:
        "While you focus on your recovery, you may be exempt from work requirements.",
      nextSteps:
        "You don't need to track hours for Medicaid during treatment. Focus on your recovery—that's what matters most right now.",
    };
  }

  // 5. Check other exemptions
  if (responses.isIncarceratedOrRecentlyReleased) {
    return {
      isExempt: true,
      exemptionCategory: "other",
      exemptionReason: "In jail/prison or recently released",
      explanation:
        "During this time, you may be exempt from work requirements.",
      nextSteps:
        "You don't need to track hours for Medicaid during this time. If your situation changes after 3 months from your release date, you can re-screen to check your status.",
    };
  }

  if (responses.hasTribalStatus) {
    return {
      isExempt: true,
      exemptionCategory: "other",
      exemptionReason: "Native American tribal member or IHS-eligible",
      explanation:
        "You may be exempt from work requirements because you're a member of a Native American tribe or eligible for Indian Health Service.",
      nextSteps:
        "You don't need to track hours for Medicaid. Feel free to use this app if you'd like to keep track of your activities for other reasons.",
    };
  }

  // 6. No exemptions found - must track hours
  return {
    isExempt: false,
    explanation:
      "Based on your answers, you'll need to meet work requirements to keep your Medicaid coverage.",
    nextSteps:
      "Track 80 hours per month of work, volunteering, or school (or earn $580 per month). This app makes it easy to log your hours and stay on track each month.",
  };
}
