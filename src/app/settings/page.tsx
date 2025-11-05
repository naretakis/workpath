"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { UserProfile } from "@/types";
import {
  ExemptionScreening,
  ExemptionHistory as ExemptionHistoryType,
} from "@/types/exemptions";
import { StorageInfo } from "@/components/settings/StorageInfo";
import { ProfileDisplay } from "@/components/settings/ProfileDisplay";
import { ProfileEditor } from "@/components/settings/ProfileEditor";
import { PrivacyPolicy } from "@/components/settings/PrivacyPolicy";
import { ExemptionHistory } from "@/components/exemptions/ExemptionHistory";
import { RescreenDialog } from "@/components/exemptions/RescreenDialog";
import {
  getLatestScreening,
  getScreeningHistory,
} from "@/lib/storage/exemptions";
import { format } from "date-fns";

// Helper function to get category label
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    age: "Age-Based",
    "family-caregiving": "Family & Caregiving",
    "health-disability": "Health & Disability",
    "program-participation": "Program Participation",
    other: "Other",
  };
  return labels[category] || category;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [exemptionScreening, setExemptionScreening] =
    useState<ExemptionScreening | null>(null);
  const [exemptionHistory, setExemptionHistory] = useState<
    ExemptionHistoryType[]
  >([]);
  const [rescreenDialogOpen, setRescreenDialogOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  const loadProfile = async () => {
    try {
      // Use getFirstProfile which handles decryption
      const { getFirstProfile } = await import("@/lib/storage/profile");
      const userProfile = await getFirstProfile();

      if (userProfile) {
        setProfile(userProfile);

        // Load exemption screening
        const screening = await getLatestScreening(userProfile.id);
        setExemptionScreening(screening || null);

        // Load exemption history
        const history = await getScreeningHistory(userProfile.id);
        setExemptionHistory(history);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleBackToTracking = () => {
    router.push("/tracking");
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    setEditing(false);
    // Reload profile to get updated data
    await loadProfile();
  };

  const handlePrivacyPolicyOpen = () => {
    setPrivacyPolicyOpen(true);
  };

  const handlePrivacyPolicyClose = () => {
    setPrivacyPolicyOpen(false);
  };

  const handleRescreenClick = () => {
    setRescreenDialogOpen(true);
  };

  const handleRescreenConfirm = () => {
    setRescreenDialogOpen(false);
    router.push("/exemptions");
  };

  const handleRescreenCancel = () => {
    setRescreenDialogOpen(false);
  };

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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToTracking}
          sx={{ mb: 2, minHeight: 44 }}
        >
          Back to Tracking
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
      </Box>

      {/* Profile Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {profile ? (
          editing ? (
            <ProfileEditor
              profile={profile}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <ProfileDisplay profile={profile} onEdit={handleEdit} />
          )
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Your Profile
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No profile found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Exemption Screening Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Exemption Screening
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {exemptionScreening ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                p: 2,
                backgroundColor: exemptionScreening.result.isExempt
                  ? "success.50"
                  : "warning.50",
                borderRadius: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Status:{" "}
                  {exemptionScreening.result.isExempt
                    ? "Exempt"
                    : "Must Track Hours"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Screened:{" "}
                  {format(
                    new Date(exemptionScreening.screeningDate),
                    "MMMM d, yyyy",
                  )}
                </Typography>
                {exemptionScreening.result.exemptionCategory && (
                  <Typography variant="body2" color="text.secondary">
                    Category:{" "}
                    {getCategoryLabel(
                      exemptionScreening.result.exemptionCategory,
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push("/exemptions")}
                fullWidth
                sx={{ minHeight: 44 }}
              >
                View Results
              </Button>
              <Button
                variant="contained"
                onClick={handleRescreenClick}
                fullWidth
                sx={{ minHeight: 44 }}
              >
                Re-screen
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Take a quick screening to see if you qualify for an exemption from
              work requirements.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/exemptions")}
              fullWidth
              sx={{ minHeight: 48 }}
            >
              Start Screening
            </Button>
          </Box>
        )}
      </Paper>

      {/* Screening History Section */}
      {exemptionHistory.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Screening History
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ExemptionHistory history={exemptionHistory.slice(0, 5)} />
          {exemptionHistory.length > 5 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 2 }}
            >
              Showing 5 most recent screenings
            </Typography>
          )}
        </Paper>
      )}

      {/* Storage Management Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Storage Management
        </Typography>
        <StorageInfo />
      </Box>

      {/* Privacy Policy Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Privacy & Data
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          Review how we handle your data and your privacy rights.
        </Typography>
        <Button
          variant="outlined"
          onClick={handlePrivacyPolicyOpen}
          fullWidth
          sx={{ minHeight: 48 }}
        >
          View Privacy Policy
        </Button>
      </Paper>

      {/* About Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About HourKeep
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          HourKeep helps you track work, volunteer, and education hours to meet
          Medicaid work requirements (80 hours/month).
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Keep your hours, keep your coverage.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Version 2.0 - All data is stored locally on your device.
        </Typography>
      </Paper>

      {/* Rescreen Confirmation Dialog */}
      <RescreenDialog
        open={rescreenDialogOpen}
        onClose={handleRescreenCancel}
        onConfirm={handleRescreenConfirm}
      />

      {/* Privacy Policy Dialog */}
      <PrivacyPolicy
        open={privacyPolicyOpen}
        onClose={handlePrivacyPolicyClose}
        acknowledgedAt={profile?.privacyNoticeAcknowledgedAt}
      />
    </Container>
  );
}
