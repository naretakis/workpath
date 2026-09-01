"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { IntroductionScreen } from "@/components/assessment/IntroductionScreen";
import { ProgressIndicator } from "@/components/assessment/ProgressIndicator";
import {
  NoticeQuestion,
  NoticeFollowUp,
  NoticeFollowUpWithNotice,
} from "@/components/assessment/NoticeQuestion";
import { NoticeDetailsQuestion } from "@/components/onboarding/NoticeDetailsQuestion";
import { GettingStartedContextual } from "@/components/onboarding/GettingStartedContextual";
import { ExemptionQuestion as ExemptionQuestionComponent } from "@/components/exemptions/ExemptionQuestion";
import { SingleChoiceQuestion } from "@/components/assessment/SingleChoiceQuestion";
import { MultipleChoiceQuestion } from "@/components/assessment/MultipleChoiceQuestion";
import { NumberInputQuestion } from "@/components/assessment/NumberInputQuestion";
import {
  HoursConverter,
  IncomeConverter,
} from "@/components/assessment/EstimationTools";
import { AssessmentResponses, Recommendation } from "@/types/assessment";
import { ExemptionResponses } from "@/types/exemptions";
import { allQuestions as exemptionQuestions } from "@/lib/exemptions/questions";
import { calculateExemption } from "@/lib/exemptions/calculator";
import { calculateRecommendation } from "@/lib/assessment/recommendationEngine";
import {
  saveAssessmentProgress,
  getAssessmentProgress,
  saveAssessmentResult,
  completeAssessmentProgress,
} from "@/lib/storage/assessment";

export type AssessmentStep =
  | "intro"
  | "notice"
  | "noticeDetails"
  | "notice-followup"
  | "noticeFollowUpWithNotice"
  | "exemption"
  | "work-job"
  | "work-income"
  | "work-income-seasonal"
  | "work-hours"
  | "activities"
  | "activities-volunteer"
  | "activities-school"
  | "activities-workprogram"
  | "gettingStarted";

export interface AssessmentFlowProps {
  userId: string;
  initialResponses?: Partial<AssessmentResponses>;
  initialNoticeContext?: {
    hasNotice?: boolean;
    monthsRequired?: number;
    deadline?: string;
  };
  showIntro?: boolean;
  onComplete: (
    responses: AssessmentResponses,
    recommendation: Recommendation,
    noticeContext: {
      hasNotice: boolean;
      monthsRequired?: number;
      deadline?: string;
    },
  ) => void;
  onSkip?: () => void;
  saveProgress?: boolean;
}

// Helper to compute initial job status from responses
function getInitialJobStatus(
  responses?: Partial<AssessmentResponses>,
): "yes" | "yes-gig" | "yes-seasonal" | "no" | undefined {
  if (responses?.hasJob === undefined) return undefined;
  if (!responses.hasJob) return "no";
  if (responses.isSeasonalWork) return "yes-seasonal";
  return "yes";
}

export function AssessmentFlow({
  userId,
  initialResponses,
  initialNoticeContext,
  showIntro = false,
  onComplete,
  onSkip,
  saveProgress = true,
}: AssessmentFlowProps) {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(
    showIntro ? "intro" : "notice",
  );
  const [stepHistory, setStepHistory] = useState<AssessmentStep[]>([]);
  const [responses, setResponses] = useState<Partial<AssessmentResponses>>(
    initialResponses || { exemption: {} },
  );
  const [exemptionQuestionIndex, setExemptionQuestionIndex] = useState(0);
  const [sixMonthTotal, setSixMonthTotal] = useState<number | undefined>(
    initialResponses?.isSeasonalWork && initialResponses?.monthlyIncome
      ? initialResponses.monthlyIncome * 6
      : undefined,
  );
  const [jobStatus, setJobStatus] = useState<
    "yes" | "yes-gig" | "yes-seasonal" | "no" | undefined
  >(getInitialJobStatus(initialResponses));
  // seasonalStatus is only used internally for UI, derived from jobStatus
  const [hasNotice, setHasNotice] = useState(
    initialNoticeContext?.hasNotice || false,
  );
  const [monthsRequired, setMonthsRequired] = useState<number | undefined>(
    initialNoticeContext?.monthsRequired,
  );
  const [deadline, setDeadline] = useState<string | undefined>(
    initialNoticeContext?.deadline,
  );
  const [recommendation, setRecommendation] = useState<
    Recommendation | undefined
  >(undefined);

  const getStepNumber = useCallback((): number => {
    let progress = 0;
    if (currentStep === "notice") progress = 15;
    else if (currentStep === "noticeDetails") progress = 20;
    else if (currentStep === "noticeFollowUpWithNotice") progress = 25;
    else if (currentStep === "notice-followup") progress = 25;
    else if (currentStep === "exemption") {
      const exemptionProgress = (exemptionQuestionIndex / 12) * 35;
      progress = 25 + exemptionProgress;
    } else if (
      currentStep.startsWith("work") ||
      currentStep.startsWith("activities")
    ) {
      const workSteps = stepHistory.filter(
        (s) => s.startsWith("work") || s.startsWith("activities"),
      ).length;
      progress = 60 + Math.min(workSteps * 5, 35);
    } else if (currentStep === "gettingStarted") progress = 95;
    return progress;
  }, [currentStep, exemptionQuestionIndex, stepHistory]);

  // Auto-save progress
  useEffect(() => {
    if (
      !saveProgress ||
      !userId ||
      currentStep === "intro" ||
      currentStep === "gettingStarted"
    )
      return;
    const doSave = async () => {
      try {
        const stepNumber = getStepNumber();
        await saveAssessmentProgress(userId, stepNumber, responses);
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };
    doSave();
  }, [userId, currentStep, responses, saveProgress, getStepNumber]);

  const handleBack = () => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory(stepHistory.slice(0, -1));
      setCurrentStep(previousStep);
    }
  };

  const advanceStep = (nextStep: AssessmentStep) => {
    setStepHistory([...stepHistory, currentStep]);
    setCurrentStep(nextStep);
  };

  const handleIntroGetStarted = () => advanceStep("notice");
  const handleIntroSkip = () => onSkip?.();

  const handleNoticeAnswer = (receivedNotice: boolean) => {
    setHasNotice(receivedNotice);
    setResponses({ ...responses, receivedAgencyNotice: receivedNotice });
    if (receivedNotice) {
      advanceStep("noticeDetails");
    } else {
      advanceStep("notice-followup");
    }
  };

  const handleNoticeDetailsComplete = () =>
    advanceStep("noticeFollowUpWithNotice");
  const handleMonthsChange = (months: number) => setMonthsRequired(months);
  const handleDeadlineChange = (deadlineValue: string) =>
    setDeadline(deadlineValue);

  const handleNoticeFollowUp = (checkExemption: boolean) => {
    if (checkExemption) {
      advanceStep("exemption");
    } else {
      advanceStep("work-job");
    }
  };

  const handleExemptionAnswer = (
    questionId: string,
    answer: boolean | Date,
  ) => {
    const updatedExemption = { ...responses.exemption };
    switch (questionId) {
      case "age-dob":
        updatedExemption.dateOfBirth = answer as Date;
        break;
      case "family-pregnant":
        updatedExemption.isPregnantOrPostpartum = answer as boolean;
        break;
      case "family-child":
        updatedExemption.hasDependentChild13OrYounger = answer as boolean;
        break;
      case "family-disabled-dependent":
        updatedExemption.isParentGuardianOfDisabled = answer as boolean;
        break;
      case "health-medicare":
        updatedExemption.isOnMedicare = answer as boolean;
        break;
      case "health-non-magi":
        updatedExemption.isEligibleForNonMAGI = answer as boolean;
        break;
      case "health-disabled-veteran":
        updatedExemption.isDisabledVeteran = answer as boolean;
        break;
      case "health-medically-frail":
        updatedExemption.isMedicallyFrail = answer as boolean;
        break;
      case "program-snap-tanf":
        updatedExemption.isOnSNAPOrTANFMeetingRequirements = answer as boolean;
        break;
      case "program-rehab":
        updatedExemption.isInRehabProgram = answer as boolean;
        break;
      case "other-incarcerated":
        updatedExemption.isIncarceratedOrRecentlyReleased = answer as boolean;
        break;
      case "other-tribal":
        updatedExemption.hasTribalStatus = answer as boolean;
        break;
    }
    setResponses({ ...responses, exemption: updatedExemption });
  };

  const handleExemptionBack = () => {
    if (exemptionQuestionIndex > 0) {
      setExemptionQuestionIndex(exemptionQuestionIndex - 1);
    } else {
      handleBack();
    }
  };

  const handleExemptionContinue = () => {
    if (!responses.exemption) return;
    const answeredQuestions: Partial<ExemptionResponses> = {};
    for (let i = 0; i <= exemptionQuestionIndex; i++) {
      const questionId = exemptionQuestions[i].id;
      switch (questionId) {
        case "age-dob":
          if (responses.exemption.dateOfBirth)
            answeredQuestions.dateOfBirth = responses.exemption.dateOfBirth;
          break;
        case "family-pregnant":
          if (responses.exemption.isPregnantOrPostpartum !== undefined)
            answeredQuestions.isPregnantOrPostpartum =
              responses.exemption.isPregnantOrPostpartum;
          break;
        case "family-child":
          if (responses.exemption.hasDependentChild13OrYounger !== undefined)
            answeredQuestions.hasDependentChild13OrYounger =
              responses.exemption.hasDependentChild13OrYounger;
          break;
        case "family-disabled-dependent":
          if (responses.exemption.isParentGuardianOfDisabled !== undefined)
            answeredQuestions.isParentGuardianOfDisabled =
              responses.exemption.isParentGuardianOfDisabled;
          break;
        case "health-medicare":
          if (responses.exemption.isOnMedicare !== undefined)
            answeredQuestions.isOnMedicare = responses.exemption.isOnMedicare;
          break;
        case "health-non-magi":
          if (responses.exemption.isEligibleForNonMAGI !== undefined)
            answeredQuestions.isEligibleForNonMAGI =
              responses.exemption.isEligibleForNonMAGI;
          break;
        case "health-disabled-veteran":
          if (responses.exemption.isDisabledVeteran !== undefined)
            answeredQuestions.isDisabledVeteran =
              responses.exemption.isDisabledVeteran;
          break;
        case "health-medically-frail":
          if (responses.exemption.isMedicallyFrail !== undefined)
            answeredQuestions.isMedicallyFrail =
              responses.exemption.isMedicallyFrail;
          break;
        case "program-snap-tanf":
          if (
            responses.exemption.isOnSNAPOrTANFMeetingRequirements !== undefined
          )
            answeredQuestions.isOnSNAPOrTANFMeetingRequirements =
              responses.exemption.isOnSNAPOrTANFMeetingRequirements;
          break;
        case "program-rehab":
          if (responses.exemption.isInRehabProgram !== undefined)
            answeredQuestions.isInRehabProgram =
              responses.exemption.isInRehabProgram;
          break;
        case "other-incarcerated":
          if (
            responses.exemption.isIncarceratedOrRecentlyReleased !== undefined
          )
            answeredQuestions.isIncarceratedOrRecentlyReleased =
              responses.exemption.isIncarceratedOrRecentlyReleased;
          break;
        case "other-tribal":
          if (responses.exemption.hasTribalStatus !== undefined)
            answeredQuestions.hasTribalStatus =
              responses.exemption.hasTribalStatus;
          break;
      }
    }
    const exemptionResult = calculateExemption(
      answeredQuestions as ExemptionResponses,
    );
    if (exemptionResult.isExempt) {
      completeAssessment(responses.exemption);
      return;
    }
    if (exemptionQuestionIndex < exemptionQuestions.length - 1) {
      setExemptionQuestionIndex(exemptionQuestionIndex + 1);
    } else {
      advanceStep("work-job");
    }
  };

  const completeAssessment = async (exemptionResponses: ExemptionResponses) => {
    const finalResponses: AssessmentResponses = {
      ...responses,
      exemption: exemptionResponses,
      noticeContext:
        hasNotice && (monthsRequired || deadline)
          ? {
              monthsRequired,
              deadline: deadline ? new Date(deadline) : undefined,
            }
          : undefined,
    } as AssessmentResponses;

    // Commit the merged responses to state. W0 § 0.3.4.
    //
    // `finalResponses` was previously a local that only `saveAssessmentResult`
    // below ever saw, so `noticeContext` existed in the stored row but never in
    // component state — and `handleStartTracking` hands `responses` to
    // `onComplete`. Any consumer that persisted that payload wrote a strictly
    // worse record than the one saved here, which is exactly what onboarding did.
    setResponses(finalResponses);

    const calculatedRecommendation = calculateRecommendation(finalResponses);
    setRecommendation(calculatedRecommendation);

    try {
      await saveAssessmentResult(
        userId,
        finalResponses,
        calculatedRecommendation,
      );
      if (saveProgress) {
        const progress = await getAssessmentProgress(userId);
        if (progress?.id) {
          await completeAssessmentProgress(progress.id);
        }
      }
      advanceStep("gettingStarted");
    } catch (error) {
      console.error("Error saving assessment result:", error);
    }
  };

  const handleStartTracking = () => {
    if (!recommendation) return;
    // `responses` now carries `noticeContext`, because `completeAssessment`
    // commits its merged result to state. The third argument stays for the
    // consumers that build `profile.onboardingContext` from it — note it uses a
    // different shape from the stored one (`deadline` is still a string here,
    // and `hasNotice` is only present in this shape). W0 § 0.3.4.
    const noticeContext = { hasNotice, monthsRequired, deadline };
    onComplete(responses as AssessmentResponses, recommendation, noticeContext);
  };

  const getExemptionValue = () => {
    const questionId = exemptionQuestions[exemptionQuestionIndex].id;
    const exemption = responses.exemption;
    switch (questionId) {
      case "age-dob":
        return exemption?.dateOfBirth ?? null;
      case "family-pregnant":
        return exemption?.isPregnantOrPostpartum ?? null;
      case "family-child":
        return exemption?.hasDependentChild13OrYounger ?? null;
      case "family-disabled-dependent":
        return exemption?.isParentGuardianOfDisabled ?? null;
      case "health-medicare":
        return exemption?.isOnMedicare ?? null;
      case "health-non-magi":
        return exemption?.isEligibleForNonMAGI ?? null;
      case "health-disabled-veteran":
        return exemption?.isDisabledVeteran ?? null;
      case "health-medically-frail":
        return exemption?.isMedicallyFrail ?? null;
      case "program-snap-tanf":
        return exemption?.isOnSNAPOrTANFMeetingRequirements ?? null;
      case "program-rehab":
        return exemption?.isInRehabProgram ?? null;
      case "other-incarcerated":
        return exemption?.isIncarceratedOrRecentlyReleased ?? null;
      case "other-tribal":
        return exemption?.hasTribalStatus ?? null;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Progress indicator */}
      {currentStep !== "intro" && currentStep !== "gettingStarted" && (
        <ProgressIndicator currentStep={getStepNumber()} totalSteps={100} />
      )}

      {/* Introduction */}
      {currentStep === "intro" && (
        <IntroductionScreen
          onGetStarted={handleIntroGetStarted}
          onSkip={handleIntroSkip}
        />
      )}

      {/* Notice Question */}
      {currentStep === "notice" && (
        <Box sx={{ py: 2 }}>
          <NoticeQuestion
            onAnswer={handleNoticeAnswer}
            onBack={stepHistory.length > 0 ? handleBack : undefined}
          />
        </Box>
      )}

      {/* Notice Details */}
      {currentStep === "noticeDetails" && (
        <Box sx={{ py: 2 }}>
          <NoticeDetailsQuestion
            monthsRequired={monthsRequired}
            deadline={deadline}
            onMonthsChange={handleMonthsChange}
            onDeadlineChange={handleDeadlineChange}
            onBack={handleBack}
            onContinue={handleNoticeDetailsComplete}
          />
        </Box>
      )}

      {/* Notice Follow-up With Notice */}
      {currentStep === "noticeFollowUpWithNotice" && (
        <Box sx={{ py: 2 }}>
          <NoticeFollowUpWithNotice
            onCheckExemption={() => handleNoticeFollowUp(true)}
            onSkipToWork={() => handleNoticeFollowUp(false)}
            onBack={handleBack}
          />
        </Box>
      )}

      {/* Notice Follow-up */}
      {currentStep === "notice-followup" && (
        <Box sx={{ py: 2 }}>
          <NoticeFollowUp
            onCheckExemption={() => handleNoticeFollowUp(true)}
            onSkipToWork={() => handleNoticeFollowUp(false)}
            onBack={handleBack}
          />
        </Box>
      )}

      {/* Exemption Questions */}
      {currentStep === "exemption" && (
        <Box sx={{ py: 2 }}>
          <ExemptionQuestionComponent
            question={exemptionQuestions[exemptionQuestionIndex]}
            value={getExemptionValue()}
            onChange={(answer) =>
              handleExemptionAnswer(
                exemptionQuestions[exemptionQuestionIndex].id,
                answer as boolean | Date,
              )
            }
            onNext={handleExemptionContinue}
            onBack={
              exemptionQuestionIndex > 0 || stepHistory.length > 0
                ? handleExemptionBack
                : undefined
            }
            isFirst={exemptionQuestionIndex === 0 && stepHistory.length === 0}
          />
        </Box>
      )}

      {/* Work Questions - Job Status */}
      {currentStep === "work-job" && (
        <Box sx={{ py: 2 }}>
          <SingleChoiceQuestion
            question="Do you currently have a job?"
            helperText="This includes full-time, part-time, gig work, or self-employment"
            options={[
              { value: "yes", label: "Yes, year-round" },
              {
                value: "yes-gig",
                label:
                  "Yes, but my hours/income vary (gig work, freelance, etc.)",
              },
              {
                value: "yes-seasonal",
                label:
                  "Yes, seasonal work (construction, agriculture, tourism, etc.)",
              },
              { value: "no", label: "No" },
            ]}
            value={jobStatus}
            onChange={(value) => {
              const status = value as "yes" | "yes-gig" | "yes-seasonal" | "no";
              setJobStatus(status);
              setResponses({
                ...responses,
                hasJob: status !== "no",
                isSeasonalWork: status === "yes-seasonal",
              });
            }}
            onNext={() => {
              if (jobStatus === "no") advanceStep("activities");
              else if (jobStatus === "yes-seasonal")
                advanceStep("work-income-seasonal");
              else advanceStep("work-income");
            }}
            onBack={stepHistory.length > 0 ? handleBack : undefined}
            isFirst={stepHistory.length === 0}
          />
        </Box>
      )}

      {/* Work Questions - Seasonal Income */}
      {currentStep === "work-income-seasonal" && (
        <Box sx={{ py: 2 }}>
          <Box>
            <NumberInputQuestion
              question="About how much have you earned in the last 6 months?"
              helperText="Add up all your income from the past 6 months. We'll calculate your monthly average."
              value={sixMonthTotal}
              onChange={(value) => {
                setSixMonthTotal(value);
                setResponses({
                  ...responses,
                  monthlyIncome: value ? Math.round(value / 6) : undefined,
                });
              }}
              label="Total 6-Month Income"
              prefix="$"
              min={0}
              step={1}
              allowNotSure={true}
              notSureChecked={responses.monthlyIncome === 0}
              onNotSureChange={(checked) => {
                setSixMonthTotal(undefined);
                setResponses({
                  ...responses,
                  monthlyIncome: checked ? 0 : undefined,
                });
              }}
              onNext={() => advanceStep("work-hours")}
              onBack={handleBack}
            />
            {responses.monthlyIncome !== undefined &&
              responses.monthlyIncome > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "info.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "info.200",
                  }}
                >
                  <Typography variant="body2" color="info.main">
                    <strong>Monthly average:</strong> ${responses.monthlyIncome}
                    /month
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Calculated: ${sixMonthTotal} ÷ 6 months
                  </Typography>
                </Box>
              )}
          </Box>
        </Box>
      )}

      {/* Work Questions - Monthly Income */}
      {currentStep === "work-income" && (
        <Box sx={{ py: 2 }}>
          <Box>
            <NumberInputQuestion
              question="About how much do you earn per month?"
              helperText="Enter your average monthly income from work"
              value={responses.monthlyIncome}
              onChange={(value) =>
                setResponses({ ...responses, monthlyIncome: value })
              }
              label="Monthly Income"
              prefix="$"
              min={0}
              step={1}
              allowNotSure={true}
              notSureChecked={responses.monthlyIncome === 0}
              onNotSureChange={(checked) =>
                setResponses({
                  ...responses,
                  monthlyIncome: checked ? 0 : undefined,
                })
              }
              onNext={() => advanceStep("work-hours")}
              onBack={handleBack}
            />
            <IncomeConverter
              onUseValue={(value) =>
                setResponses({ ...responses, monthlyIncome: value })
              }
            />
          </Box>
        </Box>
      )}

      {/* Work Questions - Monthly Hours */}
      {currentStep === "work-hours" && (
        <Box sx={{ py: 2 }}>
          <Box>
            <NumberInputQuestion
              question="About how many hours per month do you work?"
              helperText="Enter your average monthly work hours"
              value={responses.monthlyWorkHours}
              onChange={(value) =>
                setResponses({ ...responses, monthlyWorkHours: value })
              }
              label="Monthly Hours"
              suffix="hours"
              min={0}
              step={1}
              allowNotSure={true}
              notSureChecked={responses.monthlyWorkHours === 0}
              onNotSureChange={(checked) =>
                setResponses({
                  ...responses,
                  monthlyWorkHours: checked ? 0 : undefined,
                })
              }
              onNext={() => advanceStep("activities")}
              onBack={handleBack}
            />
            <HoursConverter
              onUseValue={(value) =>
                setResponses({ ...responses, monthlyWorkHours: value })
              }
            />
          </Box>
        </Box>
      )}

      {/* Activities Question */}
      {currentStep === "activities" && (
        <Box sx={{ py: 2 }}>
          <MultipleChoiceQuestion
            question="Do you do any of these activities?"
            helperText="Select all that apply"
            options={[
              { value: "volunteer", label: "Volunteer work" },
              { value: "school", label: "Attending school" },
              { value: "workProgram", label: "Work program" },
            ]}
            values={responses.otherActivities || {}}
            onChange={(value, checked) => {
              setResponses({
                ...responses,
                otherActivities: {
                  ...responses.otherActivities,
                  [value]: checked,
                },
              });
            }}
            onNext={() => {
              const hasActivities = Object.values(
                responses.otherActivities || {},
              ).some((v) => v === true);
              if (hasActivities) {
                if (responses.otherActivities?.volunteer)
                  advanceStep("activities-volunteer");
                else if (responses.otherActivities?.school)
                  advanceStep("activities-school");
                else if (responses.otherActivities?.workProgram)
                  advanceStep("activities-workprogram");
              } else {
                completeAssessment(responses.exemption as ExemptionResponses);
              }
            }}
            onBack={handleBack}
          />
        </Box>
      )}

      {/* Activity Hours - Volunteer */}
      {currentStep === "activities-volunteer" && (
        <Box sx={{ py: 2 }}>
          <Box>
            <NumberInputQuestion
              question="How many hours per month do you volunteer?"
              value={responses.volunteerHoursPerMonth}
              onChange={(value) =>
                setResponses({ ...responses, volunteerHoursPerMonth: value })
              }
              label="Monthly Volunteer Hours"
              suffix="hours"
              min={0}
              step={1}
              allowNotSure={true}
              notSureChecked={responses.volunteerHoursPerMonth === 0}
              onNotSureChange={(checked) =>
                setResponses({
                  ...responses,
                  volunteerHoursPerMonth: checked ? 0 : undefined,
                })
              }
              onNext={() => {
                if (responses.otherActivities?.school)
                  advanceStep("activities-school");
                else if (responses.otherActivities?.workProgram)
                  advanceStep("activities-workprogram");
                else
                  completeAssessment(responses.exemption as ExemptionResponses);
              }}
              onBack={handleBack}
            />
            <HoursConverter
              onUseValue={(value) =>
                setResponses({ ...responses, volunteerHoursPerMonth: value })
              }
            />
          </Box>
        </Box>
      )}

      {/* Activity Hours - School */}
      {currentStep === "activities-school" && (
        <Box sx={{ py: 2 }}>
          <Box>
            <NumberInputQuestion
              question="How many hours per month do you attend school?"
              value={responses.schoolHoursPerMonth}
              onChange={(value) =>
                setResponses({ ...responses, schoolHoursPerMonth: value })
              }
              label="Monthly School Hours"
              suffix="hours"
              min={0}
              step={1}
              allowNotSure={true}
              notSureChecked={responses.schoolHoursPerMonth === 0}
              onNotSureChange={(checked) =>
                setResponses({
                  ...responses,
                  schoolHoursPerMonth: checked ? 0 : undefined,
                })
              }
              onNext={() => {
                if (responses.otherActivities?.workProgram)
                  advanceStep("activities-workprogram");
                else
                  completeAssessment(responses.exemption as ExemptionResponses);
              }}
              onBack={handleBack}
            />
            <HoursConverter
              onUseValue={(value) =>
                setResponses({ ...responses, schoolHoursPerMonth: value })
              }
            />
          </Box>
        </Box>
      )}

      {/* Activity Hours - Work Program */}
      {currentStep === "activities-workprogram" && (
        <Box sx={{ py: 2 }}>
          <Box>
            <NumberInputQuestion
              question="How many hours per month do you participate in work programs?"
              value={responses.workProgramHoursPerMonth}
              onChange={(value) =>
                setResponses({ ...responses, workProgramHoursPerMonth: value })
              }
              label="Monthly Work Program Hours"
              suffix="hours"
              min={0}
              step={1}
              allowNotSure={true}
              notSureChecked={responses.workProgramHoursPerMonth === 0}
              onNotSureChange={(checked) =>
                setResponses({
                  ...responses,
                  workProgramHoursPerMonth: checked ? 0 : undefined,
                })
              }
              onNext={() =>
                completeAssessment(responses.exemption as ExemptionResponses)
              }
              onBack={handleBack}
            />
            <HoursConverter
              onUseValue={(value) =>
                setResponses({ ...responses, workProgramHoursPerMonth: value })
              }
            />
          </Box>
        </Box>
      )}

      {/* Getting Started */}
      {currentStep === "gettingStarted" && (
        <GettingStartedContextual
          hasNotice={hasNotice}
          monthsRequired={monthsRequired}
          deadline={deadline ? new Date(deadline) : undefined}
          recommendation={recommendation}
          responses={responses}
          onStartTracking={handleStartTracking}
        />
      )}
    </Box>
  );
}
