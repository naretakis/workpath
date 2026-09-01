"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Paper, CircularProgress } from "@mui/material";
import { UserProfile, OnboardingContext } from "@/types";
import { AssessmentResponses, Recommendation } from "@/types/assessment";
import { saveProfile } from "@/lib/storage/profile";
import { PrivacyNotice } from "@/components/onboarding/PrivacyNotice";
import { ProfileForm } from "@/components/onboarding/ProfileForm";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";

import {
  setComplianceMode,
  setSeasonalWorkerStatus,
} from "@/lib/storage/income";
import { format } from "date-fns";

type OnboardingStep = "privacy" | "profile" | "assessment";

interface ProfileData {
  profileId: string;
  profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">;
  createdAt: Date;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("privacy");
  const [privacyAcknowledgedAt, setPrivacyAcknowledgedAt] =
    useState<Date | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [initialResponses, setInitialResponses] = useState<
    Partial<AssessmentResponses>
  >({ exemption: {} });

  const handlePrivacyAcknowledge = () => {
    setPrivacyAcknowledgedAt(new Date());
    setStep("profile");
  };

  const handleProfileSave = async (
    profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const now = new Date();
      const profileId = crypto.randomUUID();

      // Store profile data temporarily (we'll save it after assessment)
      setProfileData({ profileId, profile, createdAt: now });

      // Pre-fill date of birth in exemption responses if provided
      if (profile.dateOfBirth) {
        const dob = new Date(profile.dateOfBirth);
        setInitialResponses({
          exemption: { dateOfBirth: dob },
        });
      }

      // Move to assessment flow
      setStep("assessment");
    } catch (error) {
      console.error("Error processing profile:", error);
      throw error;
    }
  };

  const handleAssessmentComplete = async (
    responses: AssessmentResponses,
    recommendation: Recommendation,
    noticeContext: {
      hasNotice: boolean;
      monthsRequired?: number;
      deadline?: string;
    },
  ) => {
    if (!profileData) return;

    try {
      setRedirecting(true);
      const { profileId, profile, createdAt } = profileData;
      const now = new Date();

      // Build onboarding context
      const onboardingContext: OnboardingContext = {
        hasNotice: noticeContext.hasNotice,
        monthsRequired: noticeContext.monthsRequired,
        deadline: noticeContext.deadline
          ? new Date(noticeContext.deadline)
          : undefined,
        completedAt: now,
      };

      const fullProfile: UserProfile = {
        id: profileId,
        ...profile,
        onboardingContext,
        createdAt,
        updatedAt: now,
      };

      await saveProfile(fullProfile);

      // The assessment result is NOT saved here. W0 § 0.3.4.
      //
      // `AssessmentFlow.completeAssessment` already saved it, with the merged
      // responses that include `noticeContext`. This function used to call
      // `saveAssessmentResult` a second time, and because that function archives
      // any existing result before inserting, the second call moved the good row
      // into `assessmentHistory` and replaced it with one missing `noticeContext`
      // — the field holding the response deadline and the months the state named
      // (42 CFR 435.556, 435.558).
      //
      // Safe to omit rather than reorder: `advanceStep("gettingStarted")` is the
      // only way to reach the step whose button calls `onComplete`, and it runs
      // only after `saveAssessmentResult` has already succeeded. This also makes
      // the two AssessmentFlow consumers symmetric — `how-to-hourkeep`'s
      // `handleComplete` never wrote one either.

      // Configure dashboard based on recommendation
      const currentMonth = format(new Date(), "yyyy-MM");
      const { primaryMethod } = recommendation;

      if (primaryMethod === "income-tracking") {
        await setComplianceMode(profileId, currentMonth, "income");
        await setSeasonalWorkerStatus(profileId, currentMonth, false);
      } else if (primaryMethod === "seasonal-income-tracking") {
        await setComplianceMode(profileId, currentMonth, "income");
        await setSeasonalWorkerStatus(profileId, currentMonth, true);
      } else if (primaryMethod === "hour-tracking") {
        await setComplianceMode(profileId, currentMonth, "hours");
      }

      // Dispatch event to notify dashboard
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("assessment-completed"));
      }

      router.push("/tracking");
    } catch (error) {
      console.error("Error saving profile and assessment:", error);
      setRedirecting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, width: "100%" }}>
          {redirecting ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                gap: 2,
              }}
            >
              <CircularProgress size={48} />
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                Setting up your profile...
              </Box>
            </Box>
          ) : (
            <>
              {step === "privacy" && (
                <PrivacyNotice onAcknowledge={handlePrivacyAcknowledge} />
              )}

              {step === "profile" && privacyAcknowledgedAt && (
                <ProfileForm
                  onSave={handleProfileSave}
                  privacyAcknowledgedAt={privacyAcknowledgedAt}
                  showDeadlineField={false}
                  showIntroduction={true}
                />
              )}

              {step === "assessment" && profileData && (
                <AssessmentFlow
                  userId={profileData.profileId}
                  initialResponses={initialResponses}
                  showIntro={false}
                  onComplete={handleAssessmentComplete}
                  saveProgress={false}
                />
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
