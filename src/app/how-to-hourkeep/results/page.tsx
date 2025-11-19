"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { db } from "@/lib/db";
import { getLatestAssessmentResult } from "@/lib/storage/assessment";
import { AssessmentResult } from "@/types/assessment";
import {
  getComplianceMethodLabel,
  getComplianceMethodDescription,
} from "@/lib/assessment/recommendationEngine";

export default function AssessmentResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const profiles = await db.profiles.toArray();
        if (profiles.length === 0) {
          router.push("/onboarding");
          return;
        }

        const latestResult = await getLatestAssessmentResult(profiles[0].id);
        if (!latestResult) {
          router.push("/how-to-hourkeep");
          return;
        }

        setResult(latestResult);
        setLoading(false);
      } catch (error) {
        console.error("Error loading assessment result:", error);
        setLoading(false);
      }
    };

    loadResult();
  }, [router]);

  const handleStartMethod = async () => {
    if (!result) return;

    // Set the appropriate compliance mode based on recommendation
    try {
      const profiles = await db.profiles.toArray();
      if (profiles.length > 0) {
        const { setComplianceMode, setSeasonalWorkerStatus } = await import(
          "@/lib/storage/income"
        );
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

        // Set compliance mode based on recommendation
        if (result.recommendation.primaryMethod === "income-tracking") {
          await setComplianceMode(profiles[0].id, currentMonth, "income");
          await setSeasonalWorkerStatus(profiles[0].id, currentMonth, false);
        } else if (
          result.recommendation.primaryMethod === "seasonal-income-tracking"
        ) {
          await setComplianceMode(profiles[0].id, currentMonth, "income");
          await setSeasonalWorkerStatus(profiles[0].id, currentMonth, true);
        } else if (result.recommendation.primaryMethod === "hour-tracking") {
          await setComplianceMode(profiles[0].id, currentMonth, "hours");
        }
        // For exemption, default to hours mode but user doesn't need to track
      }
    } catch (error) {
      console.error("Error setting compliance mode:", error);
    }

    // Navigate to tracking dashboard
    router.push("/tracking");
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

  if (!result) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            No assessment results found. Please complete the assessment first.
          </Alert>
          <Button
            variant="contained"
            onClick={() => router.push("/how-to-hourkeep")}
            sx={{ mt: 2 }}
          >
            Start Assessment
          </Button>
        </Box>
      </Container>
    );
  }

  const { recommendation } = result;
  const isExempt = recommendation.primaryMethod === "exemption";

  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        {/* Success Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: isExempt ? "success.50" : "primary.50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 50,
                color: isExempt ? "success.main" : "primary.main",
              }}
            />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 600,
            mb: 1,
          }}
        >
          Your Recommended Path
        </Typography>

        {/* Primary Recommendation */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: isExempt ? "success.50" : "primary.50",
            border: "2px solid",
            borderColor: isExempt ? "success.main" : "primary.main",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: isExempt ? "success.main" : "primary.main",
              fontWeight: 600,
              mb: 2,
            }}
          >
            {getComplianceMethodLabel(recommendation.primaryMethod)}
          </Typography>

          <Typography variant="body1" paragraph>
            {recommendation.reasoning}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {getComplianceMethodDescription(recommendation.primaryMethod)}
          </Typography>
        </Paper>

        {/* All Methods - Expandable */}
        <Box id="alternatives" sx={{ mb: 3 }}>
          <Accordion
            sx={{
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "grey.50",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              <Typography variant="h6">See all compliance methods</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Here are all the ways you can stay compliant. We recommended{" "}
                {getComplianceMethodLabel(recommendation.primaryMethod)} because
                it&apos;s the easiest for your situation, but you can choose any
                method that works for you.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Show all methods including the recommended one */}
                {(
                  [
                    "exemption",
                    "income-tracking",
                    "seasonal-income-tracking",
                    "hour-tracking",
                  ] as const
                ).map((method) => {
                  const isRecommended = method === recommendation.primaryMethod;
                  const isAlternative =
                    recommendation.alternativeMethods.includes(method);
                  const isAvailable = isRecommended || isAlternative;

                  // Skip exemption if not exempt
                  if (method === "exemption" && !isRecommended) {
                    return null;
                  }

                  return (
                    <Paper
                      key={method}
                      sx={{
                        p: 2,
                        border: "2px solid",
                        borderColor: isRecommended ? "primary.main" : "divider",
                        bgcolor: isRecommended ? "primary.50" : "transparent",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{
                            color: isRecommended
                              ? "primary.main"
                              : "text.primary",
                          }}
                        >
                          {getComplianceMethodLabel(method)}
                        </Typography>
                        {isRecommended && (
                          <Chip
                            label="Easiest for you"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                        {isAlternative && (
                          <Chip
                            label="Also works"
                            size="small"
                            sx={{
                              bgcolor: "success.50",
                              color: "success.main",
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {!isAvailable && method !== "exemption" && (
                          <Chip
                            label="Not an option right now"
                            size="small"
                            sx={{
                              bgcolor: "grey.100",
                              color: "text.secondary",
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {getComplianceMethodDescription(method)}
                      </Typography>

                      {/* Explain why this method is or isn't the easiest */}
                      {!isRecommended && method !== "exemption" && (
                        <Alert
                          severity={isAlternative ? "info" : "warning"}
                          sx={{ mt: 1 }}
                        >
                          <Typography variant="body2">
                            {method === "income-tracking" &&
                              !isAvailable &&
                              "You're not currently earning $580/month. If your income increases to $580 or more, you can switch to this easier method—just submit one paystub each month instead of tracking hours."}
                            {method === "income-tracking" &&
                              isAlternative &&
                              "This also works for you, but we recommended hour tracking because it might be simpler given your current situation."}
                            {method === "seasonal-income-tracking" &&
                              !isAvailable &&
                              "This method is for people with seasonal work that averages $580/month over 6 months. If your work becomes seasonal, you can switch to this method."}
                            {method === "seasonal-income-tracking" &&
                              isAlternative &&
                              "This also works for you, but we recommended a simpler option based on your situation."}
                            {method === "hour-tracking" &&
                              !isAvailable &&
                              "You're not currently at 80 hours/month. If you add more work, volunteering, or school hours to reach 80/month, you can use this method."}
                            {method === "hour-tracking" &&
                              isAlternative &&
                              recommendation.primaryMethod ===
                                "income-tracking" &&
                              "This also works for you, but income tracking is easier—just submit one paystub each month instead of tracking hours daily."}
                            {method === "hour-tracking" &&
                              isAlternative &&
                              recommendation.primaryMethod ===
                                "seasonal-income-tracking" &&
                              "This also works for you, but seasonal income tracking might be easier for your situation."}
                          </Typography>
                        </Alert>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Method Switching Info */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          You can switch methods anytime without losing data. All tracking
          methods remain accessible, and your previous data is preserved.
        </Alert>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleStartMethod}
            endIcon={<ArrowForwardIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {isExempt
              ? "Go to Dashboard"
              : `Start ${getComplianceMethodLabel(recommendation.primaryMethod)}`}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={async () => {
              // Delete the current result so user can modify their answers
              if (result?.id) {
                try {
                  await db.assessmentResults.delete(result.id);
                } catch (error) {
                  console.error("Error deleting result:", error);
                }
              }
              router.push("/how-to-hourkeep");
            }}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Back to Assessment
          </Button>

          <Button
            variant="text"
            size="large"
            onClick={() => router.push("/how-to-hourkeep")}
            fullWidth
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            Start Fresh
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
