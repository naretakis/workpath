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
 * Work out which community engagement categories may apply to someone.
 *
 * Authority: 42 CFR 435.551 (who is an applicable individual), 435.553 (mandatory
 * exceptions), 435.554 (specified excluded individuals). CMS-2454-IFC,
 * 91 FR 33348 (June 3, 2026).
 *
 * ADR-0003: this returns what MAY apply and what to bring the agency. It does not
 * determine status — states do, after exhausting their own records
 * (42 CFR 435.557(a)-(b)), and their determinations are appealable
 * (42 CFR 431.220(a)(1)).
 *
 * Two known model gaps, owned by later waves and NOT fixed here:
 *  - `isExempt: boolean` flattens three legally distinct tiers into one flag.
 *    Specified exclusion (435.554) means the state is PROHIBITED from assessing
 *    the person at all (435.556(c)); a mandatory exception (435.553) means they
 *    are deemed to have demonstrated engagement for that month; short-term
 *    hardship (435.555) is a state election. W3 models the tiers, W7b removes the
 *    boolean. The copy below names the right mechanism even though the type
 *    cannot yet carry it.
 *  - The questions feeding this are narrower than the rule in several places
 *    (TDIU veterans, the SNAP "subject to" test, the caregiver cluster). W4
 *    rebuilds them. The copy hedges accordingly rather than repeating the
 *    narrower reading as fact.
 */
export function calculateExemption(
  responses: ExemptionResponses,
): ExemptionResult {
  // 1. Age
  if (responses.dateOfBirth) {
    const age = calculateAge(responses.dateOfBirth);

    if (age <= 18) {
      // 42 CFR 435.553(a)(1) — being under 19 is a MANDATORY EXCEPTION, not a
      // specified exclusion. The person is still an applicable individual; they
      // are deemed to have demonstrated community engagement for any month in
      // which they were under 19 for part or all of the month.
      return {
        isExempt: true,
        exemptionCategory: "age",
        exemptionReason: "18 years old or younger",
        explanation:
          "Because you're 18 or younger, your state should treat this requirement as already met for any month you're under 19. That's written into the rule.",
        nextSteps:
          "Check that your state has your date of birth on file — that's usually all it needs. Nothing to track in the meantime, though you can log activities here if it's useful for something else.",
      };
    }

    if (age >= 65) {
      // Gap 15.21. 42 CFR 435.551 defines applicable individuals by reference to
      // the 435.119 adult group, which is ages 19-64. Someone 65 or over is not
      // an applicable individual who happens to be excluded — the requirement
      // does not reach them at all. 435.603(j) is the adjacent point: MAGI methods
      // are not used where being 65 or older is a condition of eligibility.
      // This is a different mechanism from an exception or an exclusion, so it
      // gets a different sentence. Same error was in ProfileForm.tsx:198.
      return {
        isExempt: true,
        exemptionCategory: "age",
        exemptionReason: "65 years old or older",
        explanation:
          "This requirement applies to adults aged 19 to 64. At 65 or older you're outside that group, so it isn't a condition of your coverage — it's not that an exception applies to you, it's that the rule doesn't reach you.",
        nextSteps:
          "Ask your state to confirm which coverage group you're in, since that's what settles it. Nothing to track.",
      };
    }
  }

  // 2. Family and caregiving — 42 CFR 435.554(a)
  if (responses.isPregnantOrPostpartum) {
    // 42 CFR 435.554(c)(10) — pregnant, or entitled to postpartum coverage under
    // SSA 1902(e)(5) or (e)(16). A specified excluded individual: the state is
    // prohibited from assessing compliance at all, 435.556(c).
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Pregnant or recently gave birth",
      explanation:
        "Being pregnant, or covered after giving birth, is one of the categories the rule sets aside. Your state isn't allowed to assess this requirement for someone in that group.",
      nextSteps:
        "Tell your state you're pregnant or recently gave birth, and ask them to record it. Postpartum coverage runs longer than many people expect, so ask how long yours lasts before assuming it has ended.",
    };
  }

  if (responses.hasDependentChild13OrYounger) {
    // 42 CFR 435.554(c)(3) with (c) — parent, guardian, caretaker relative, or
    // family caregiver of a "dependent child", defined as a child 13 or UNDER who
    // relies on another for care. Note the transition protection at 435.553(a)(4):
    // prior exclusion is itself a mandatory exception, so a parent whose child
    // turns 14 mid-review-period is deemed compliant for the months they held the
    // exclusion. That is the rule's main transition safeguard and worth saying.
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Has dependent child 13 or younger",
      explanation:
        "Caring for a child aged 13 or under is one of the categories the rule sets aside. Your state isn't allowed to assess this requirement for someone in that group.",
      nextSteps:
        "Tell your state who you care for. If your child turns 14 partway through a period your state is reviewing, ask them to count the months before that — the rule protects those months, and it's easy for it to be missed.",
    };
  }

  if (responses.isParentGuardianOfDisabled) {
    // 42 CFR 435.554(c)(3), with "disabled individual" defined at (a) — caring for a "disabled individual", defined
    // by the ADA standard at 28 CFR 35.108, which is BROADER than HourKeep's
    // question. The person cared for need not be Medicaid-eligible on the basis of
    // disability, and any one of three prongs qualifies: an impairment that
    // substantially limits a major life activity, a RECORD of one, or being
    // REGARDED AS having one. 435.554(c)(3)(ii) also allows multiple adults in one
    // residence each to qualify. W4 widens the question; the copy widens now.
    return {
      isExempt: true,
      exemptionCategory: "family-caregiving",
      exemptionReason: "Parent or guardian of someone with a disability",
      explanation:
        "Caring for someone with a disability is one of the categories the rule sets aside. The definition is broad — the person you care for doesn't need to be on Medicaid for their disability, and it can include a past condition or one they're treated as having.",
      nextSteps:
        "Tell your state who you care for and what you do for them. If more than one adult in your home provides care, each of you can be counted — ask about that, because it's often assumed only one person can be.",
    };
  }

  // 3. Health and disability
  if (responses.isOnMedicare) {
    // 42 CFR 435.553(a)(2) — entitled to or enrolled for Medicare Part A, or
    // enrolled for Part B. A MANDATORY EXCEPTION: deemed to have demonstrated
    // community engagement for any month it applies to, for part or all of the
    // month.
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Has Medicare",
      explanation:
        "Having Medicare means your state should treat this requirement as already met for any month you have it. Part A or Part B both count.",
      nextSteps:
        "Ask your state to confirm it has your Medicare enrolment on record. That is normally something it can look up itself rather than something you have to prove.",
    };
  }

  if (responses.isEligibleForNonMAGI) {
    // 42 CFR 435.553(a)(3) — described in a mandatory coverage group at
    // SSA 1902(a)(10)(A)(i)(I)-(VII). Also relevant: 435.551 limits applicable
    // individuals to the 435.119 adult group and certain 1115 populations, and
    // 435.603(j) lists where MAGI methods do not apply at all — eligibility based
    // on being blind or disabled, long-term services and supports, and so on.
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason:
        "Gets Medicaid for disability or long-term care (non-MAGI Medicaid)",
      explanation:
        "This requirement is attached to one particular Medicaid group. If you have Medicaid because of a disability or a long-term care need, you're likely in a different group, and the requirement may not be a condition of your coverage.",
      nextSteps:
        "Ask your state which coverage group you're in and whether this requirement applies to it. That one question settles it, and it's a question they can answer from their own records.",
    };
  }

  if (responses.isDisabledVeteran) {
    // 42 CFR 435.554(c)(4) — a veteran with a disability rated as TOTAL under
    // 38 U.S.C. 1155, temporary OR permanent.
    //
    // Gap 10: this includes veterans on TDIU (total disability based on individual
    // unemployability), who are compensated at the 100% rate even when their
    // COMBINED SCHEDULAR rating is below 100%. HourKeep's question asks about a
    // "100% rating", which silently excludes them. W4 fixes the question; the copy
    // stops repeating the narrow reading now.
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Disabled veteran",
      explanation:
        "Veterans whose disability the VA rates as total are one of the categories the rule sets aside. That includes a temporary total rating, and it includes being paid at the total rate because your disabilities prevent you from working, even if the percentages add up to less than 100.",
      nextSteps:
        "Get your VA rating decision letter or a benefits summary and show it to your state. If you're paid at the total rate but your combined rating reads under 100 percent, say so explicitly — that situation is easy for a caseworker to misread.",
    };
  }

  if (responses.isMedicallyFrail) {
    // 42 CFR 435.554(c)(5), (c)(5) — a TWO-PART test, and the gate is FUNCTIONAL,
    // not diagnostic: the condition must significantly impair the person's ability
    // to comply. Diagnosis alone is insufficient. States must maintain an
    // auditable list of qualifying conditions AND a process to request
    // consideration for a condition not on it (435.554(c)(5)(ii)) — telling users
    // that request path exists is the single most actionable thing here.
    //
    // Distinct from the Alternative Benefit Plan definition at 42 CFR 440.315(f).
    // Handling this data engages HIPAA and 42 CFR part 2 for substance use records.
    // Under litigation: Massachusetts v. Oz challenges the functional gate.
    return {
      isExempt: true,
      exemptionCategory: "health-disability",
      exemptionReason: "Has a serious health condition or disability",
      explanation:
        "Serious health conditions and disabilities are one of the categories the rule sets aside. Two things decide it: whether your condition is on the list your state keeps, and whether it genuinely gets in the way of working or volunteering 80 hours a month.",
      nextSteps:
        "Ask your state for its list of qualifying conditions. If yours isn't on it, ask how to request that it be considered anyway — states have to offer that route. A letter from your clinician describing what you can't manage, not just your diagnosis, is the useful document.",
    };
  }

  // 4. Programme participation
  if (responses.isOnSNAPOrTANFMeetingRequirements) {
    // TWO DIFFERENT TESTS, which this single question conflates. W4 splits them.
    //  - TANF, 42 CFR 435.554(c)(6): the individual must be COMPLYING with TANF
    //    work requirements under SSA 407.
    //  - SNAP, 42 CFR 435.554(c)(7): a member of a HOUSEHOLD receiving SNAP who is
    //    NOT EXEMPT from a SNAP work requirement. Note the construction — the test
    //    is being SUBJECT TO SNAP work requirements, not complying with them, and
    //    it keys on household receipt rather than the individual's own.
    // The old copy said "meeting work requirements" for both, which is wrong for
    // SNAP and in the user-unfavourable direction: it invites someone who is
    // subject but struggling to answer no.
    return {
      isExempt: true,
      exemptionCategory: "program-participation",
      // Was "Meeting work requirements for food stamps (SNAP) or cash assistance
      // (TANF)". Wrong for SNAP, where 435.554(c)(7) asks only whether the
      // household receives SNAP and its work rules apply. This label is the string
      // most likely to be printed in a summary or export, so it mattered more than
      // its length suggests.
      exemptionReason: "On SNAP or TANF",
      explanation:
        "SNAP and TANF are both routes into the categories the rule sets aside, and they work differently. For TANF, it's about keeping up with its work rules. For SNAP, it's about your household getting SNAP and you being subject to its work rules — you don't have to be meeting them.",
      nextSteps:
        "Tell your state you're in SNAP or TANF and ask it to check with those programmes. Your approval notice is the document to bring. If you're on SNAP and behind on its work rules, say so anyway — for SNAP the question is whether the rules apply to you, not whether you're keeping up.",
    };
  }

  if (responses.isInRehabProgram) {
    // 42 CFR 435.554(c)(8) — participating in a drug addiction or alcoholic
    // treatment and rehabilitation programme as defined at 7 U.S.C. 2012(h).
    // States may set a minimum time commitment, which is a state election.
    return {
      isExempt: true,
      exemptionCategory: "program-participation",
      exemptionReason: "In drug or alcohol treatment program",
      explanation:
        "Taking part in a drug or alcohol treatment and rehabilitation programme is one of the categories the rule sets aside. Some states expect a minimum number of hours or weeks, so the detail varies.",
      nextSteps:
        "Ask your programme for a letter confirming you're enrolled and how often you attend, and ask your state whether it sets a minimum time commitment. Keep the letter — this is rarely something a state can verify from its own records.",
    };
  }

  // 5. Other
  if (responses.isIncarceratedOrRecentlyReleased) {
    // TWO DIFFERENT MECHANISMS, again flattened by one question.
    //  - Currently an inmate of a public institution: a specified EXCLUSION,
    //    42 CFR 435.554(c)(9) with 435.1010.
    //  - Recently released: a mandatory EXCEPTION, 42 CFR 435.553(b) — an inmate
    //    at any point in the 3-month period ENDING ON THE FIRST DAY of the month.
    return {
      isExempt: true,
      exemptionCategory: "other",
      exemptionReason: "In jail/prison or recently released",
      explanation:
        "Being in jail or prison is one of the categories the rule sets aside. After release there's a further window: any month that falls within three months of your release should be treated as already met.",
      nextSteps:
        "Tell your state your release date and ask it to apply the three-month window from there. States are required to get incarceration data from correctional facilities, so ask what they already hold before gathering anything yourself.",
    };
  }

  if (responses.hasTribalStatus) {
    // 42 CFR 435.554(c)(2) — American Indians, per the definition at 42 CFR 447.51
    // (Indian, Urban Indian, California Indian, IHS-eligible). STATES MUST NOT
    // REVERIFY this status once established, which is a protection worth naming.
    return {
      isExempt: true,
      exemptionCategory: "other",
      exemptionReason: "Native American tribal member or IHS-eligible",
      explanation:
        "American Indians and Alaska Natives are one of the categories the rule sets aside. The definition is wider than tribal enrolment alone — it also covers Urban Indians, California Indians, and people eligible for Indian Health Service care.",
      nextSteps:
        "Tell your state once and ask it to record your status permanently. It isn't allowed to make you prove this again at later renewals, so if you're asked a second time, point that out.",
    };
  }

  // 6. Nothing in the screening matched. That is not a finding that the
  // requirement applies — 42 CFR 435.557(a)-(b) requires the state to exhaust its
  // own records first, and 435.559(c) delays assessment for existing enrollees to
  // their first renewal initiated on or after the implementation date. It only
  // means this screening found nothing, which is different.
  //
  // The 80 and $580 literals move to the policy profile in W2b.
  return {
    isExempt: false,
    explanation:
      "Nothing in your answers matched one of the categories that are set aside, so this requirement may apply to you. That isn't settled, though — your state has to check its own records first, and there are categories this screening doesn't ask about.",
    nextSteps:
      "Ask your state what it already has on file for you, and when your next renewal is due. In the meantime, record what you do: work, volunteering, school, or job training, 80 hours a month in total, or household income of at least $580. Both count, and they add together.",
  };
}
