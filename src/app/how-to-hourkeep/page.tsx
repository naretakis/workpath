"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Box, CircularProgress } from "@mui/material";
import { db } from "@/lib/db";
import { getProfile, updateProfile } from "@/lib/storage/profile";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";
import { AssessmentResponses, Recommendation } from "@/types/assessment";
import { getLatestAssessmentResult } from "@/lib/storage/assessment";
import {
  setComplianceMode,
  setSeasonalWorkerStatus,
} from "@/lib/storage/income";
import { currentMonth } from "@/lib/month";
import { OnboardingContext } from "@/types";

export default function HowToHourKeepPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [initialResponses, setInitialResponses] = useState<
    Partial<AssessmentResponses>
  >({ exemption: {} });
  const [initialNoticeContext, setInitialNoticeContext] = useState<{
    hasNotice?: boolean;
    monthsRequired?: number;
    deadline?: string;
  }>({});

  // Load user and any existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const profiles = await db.profiles.toArray();
        if (profiles.length === 0) {
          router.push("/onboarding");
          return;
        }

        const profileId = profiles[0].id;
        setUserId(profileId);

        // Get decrypted profile to access date of birth
        const profile = await getProfile(profileId);

        // Initialize responses with date of birth from profile if available
        const responses: Partial<AssessmentResponses> = { exemption: {} };
        if (profile?.dateOfBirth) {
          try {
            const dob = new Date(profile.dateOfBirth);
            if (!isNaN(dob.getTime())) {
              responses.exemption = { dateOfBirth: dob };
            }
          } catch (error) {
            console.error("Error parsing date of birth:", error);
          }
        }

        // Check for previous completed assessment to pre-populate
        const latestResult = await getLatestAssessmentResult(profileId);
        if (latestResult) {
          // Merge with DOB from profile
          setInitialResponses({
            ...responses,
            ...latestResult.responses,
            exemption: {
              ...responses.exemption,
              ...latestResult.responses.exemption,
            },
          });

          // Pre-populate notice context if available
          if (latestResult.responses.noticeContext) {
            setInitialNoticeContext({
              hasNotice: true,
              monthsRequired:
                latestResult.responses.noticeContext.monthsRequired,
              deadline: latestResult.responses.noticeContext.deadline
                ?.toISOString()
                .split("T")[0],
            });
          }
        } else {
          setInitialResponses(responses);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading assessment data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleComplete = async (
    responses: AssessmentResponses,
    recommendation: Recommendation,
    noticeContext: {
      hasNotice: boolean;
      monthsRequired?: number;
      deadline?: string;
    },
  ) => {
    try {
      // Configure dashboard based on recommendation.
      //
      // A genuine "current month" use — the assessment sets up tracking for the month
      // the user is in — so it goes through `currentMonth()` rather than formatting
      // the clock here. W5: one helper, one mechanism, one answer.
      const month = currentMonth();
      const { primaryMethod } = recommendation;

      if (primaryMethod === "income-tracking") {
        await setComplianceMode(userId, month, "income");
        await setSeasonalWorkerStatus(userId, month, false);
      } else if (primaryMethod === "seasonal-income-tracking") {
        await setComplianceMode(userId, month, "income");
        await setSeasonalWorkerStatus(userId, month, true);
      } else if (primaryMethod === "hour-tracking") {
        await setComplianceMode(userId, month, "hours");
      }

      // Update profile's onboarding context with notice details
      const profile = await getProfile(userId);
      if (profile) {
        const updatedOnboardingContext: OnboardingContext =
          noticeContext.hasNotice
            ? {
                hasNotice: noticeContext.hasNotice,
                monthsRequired: noticeContext.monthsRequired,
                deadline: noticeContext.deadline
                  ? new Date(noticeContext.deadline)
                  : undefined,
                completedAt: new Date(),
              }
            : {
                hasNotice: false,
                monthsRequired: profile.onboardingContext?.monthsRequired,
                deadline: profile.onboardingContext?.deadline,
                completedAt: new Date(),
              };

        await updateProfile(userId, {
          onboardingContext: updatedOnboardingContext,
        });
      }

      // Dispatch event to notify dashboard of assessment completion
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("assessment-completed"));
      }

      router.push("/tracking");
    } catch (error) {
      console.error("Error configuring dashboard:", error);
      router.push("/tracking");
    }
  };

  const handleSkip = () => router.push("/tracking");

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        <AssessmentFlow
          userId={userId}
          initialResponses={initialResponses}
          initialNoticeContext={initialNoticeContext}
          showIntro={true}
          onComplete={handleComplete}
          onSkip={handleSkip}
          saveProgress={true}
        />
      </Box>
    </Container>
  );
}
