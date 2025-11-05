"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Paper } from "@mui/material";
import { UserProfile } from "@/types";
import { saveProfile } from "@/lib/storage/profile";
import { PrivacyNotice } from "@/components/onboarding/PrivacyNotice";
import { ProfileForm } from "@/components/onboarding/ProfileForm";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"privacy" | "profile">("privacy");
  const [privacyAcknowledgedAt, setPrivacyAcknowledgedAt] =
    useState<Date | null>(null);

  const handlePrivacyAcknowledge = () => {
    const now = new Date();
    setPrivacyAcknowledgedAt(now);
    setStep("profile");
  };

  const handleProfileSave = async (
    profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const now = new Date();
      const fullProfile: UserProfile = {
        id: crypto.randomUUID(),
        ...profile,
        createdAt: now,
        updatedAt: now,
      };

      await saveProfile(fullProfile);

      // Redirect to tracking page
      router.push("/tracking");
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error; // Let ProfileForm handle the error display
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
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            width: "100%",
          }}
        >
          {step === "privacy" && (
            <PrivacyNotice onAcknowledge={handlePrivacyAcknowledge} />
          )}

          {step === "profile" && privacyAcknowledgedAt && (
            <ProfileForm
              onSave={handleProfileSave}
              privacyAcknowledgedAt={privacyAcknowledgedAt}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}
