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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { getFirstProfile } from "@/lib/storage/profile";
import {
  getLatestAssessmentResult,
  archiveAssessmentResult,
} from "@/lib/storage/assessment";
import { AssessmentResult } from "@/types/assessment";
import {
  getComplianceMethodLabel,
  getComplianceMethodDescription,
} from "@/lib/assessment/recommendationEngine";
import { currentMonth } from "@/lib/month";

export default function AssessmentResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  // Start-over confirmation. W0 § 0.3.3.
  const [startOverOpen, setStartOverOpen] = useState(false);
  const [startingOver, setStartingOver] = useState(false);
  const [startOverError, setStartOverError] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const profile = await getFirstProfile();
        if (!profile) {
          router.push("/onboarding");
          return;
        }

        const latestResult = await getLatestAssessmentResult(profile.id);
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

  /**
   * Discard the current result and go back to a blank assessment. W0 § 0.3.3.
   *
   * Routes through `archiveAssessmentResult` rather than
   * `db.assessmentResults.delete`, which is what this page used to call. The
   * archive writes an `assessmentHistory` row before removing the current result,
   * so the fact that a screening happened survives.
   *
   * That archive is itself lossy — it keeps `userId`, `completedAt`,
   * `exemptionStatus` and `recommendedMethod`, and discards `responses` and the
   * full `recommendation`. Strictly better than a hard delete, which keeps
   * nothing, but not a true archive. Widening the history record is a schema
   * change and belongs to W3's consolidated v7 (ADR-0002).
   */
  const handleConfirmStartOver = async () => {
    if (!result?.id) return;

    setStartingOver(true);
    setStartOverError(null);
    try {
      await archiveAssessmentResult(result.id);
      router.push("/how-to-hourkeep");
    } catch (error) {
      console.error("Error archiving assessment result:", error);
      setStartOverError(
        "We couldn't clear your answers. Nothing was removed — they're still here. Try again, or just choose \u201cReview my answers\u201d to change them instead.",
      );
    } finally {
      setStartingOver(false);
    }
  };

  const handleStartMethod = async () => {
    if (!result) return;

    try {
      const profile = await getFirstProfile();
      if (profile) {
        const { setComplianceMode, setSeasonalWorkerStatus } = await import(
          "@/lib/storage/income"
        );
        // W5: was `new Date().toISOString().slice(0, 7)` — UTC, while the nine other
        // month derivations in the app were local. That is a live defect, not just an
        // inconsistency: UTC runs ahead of any negative-offset zone, so late on the
        // last day of a month this wrote the tracking mode into the FOLLOWING month's
        // row while the tracking page read the current one. To the user their choice
        // simply had not saved, with nothing on screen to explain it. No test could
        // have caught it either — the app held two mechanisms and only one was wrong.
        const month = currentMonth();

        if (result.recommendation.primaryMethod === "income-tracking") {
          await setComplianceMode(profile.id, month, "income");
          await setSeasonalWorkerStatus(profile.id, month, false);
        } else if (
          result.recommendation.primaryMethod === "seasonal-income-tracking"
        ) {
          await setComplianceMode(profile.id, month, "income");
          await setSeasonalWorkerStatus(profile.id, month, true);
        } else if (result.recommendation.primaryMethod === "hour-tracking") {
          await setComplianceMode(profile.id, month, "hours");
        }
      }
    } catch (error) {
      console.error("Error setting compliance mode:", error);
    }

    router.push("/tracking");
  };

  // Five verdict strings lived in this function and wave-2 § 2.5's table listed
  // only line 349. ADR-0003: "Since you're exempt, you don't need to track this"
  // asserts both an exclusion and a consequence, neither of which HourKeep
  // determines — 42 CFR 435.556 makes the applicable-individual question the
  // state's, and it must exhaust its own records first under 435.557(a)-(b).
  //
  // The 80 and $580 literals here move to the policy profile in W2b.
  const getExemptMethodMessage = (method: string): string => {
    if (method === "income-tracking") {
      const income = result?.responses.monthlyIncome || 0;
      if (income >= 580) {
        return `Recorded: $${income} a month. Threshold: $580. Your answers also suggest a set-aside category may apply, which would mean your state doesn't assess this at all — worth confirming with them either way.`;
      }
      return "If a set-aside category applies to you, your state doesn't assess this. Keep income in mind as a route if that changes.";
    }
    if (method === "seasonal-income-tracking") {
      return "If a set-aside category applies to you, your state doesn't assess this. Seasonal averaging stays available as a route if that changes.";
    }
    if (method === "hour-tracking") {
      const totalHours =
        (result?.responses.monthlyWorkHours || 0) +
        (result?.responses.volunteerHoursPerMonth || 0) +
        (result?.responses.schoolHoursPerMonth || 0) +
        (result?.responses.workProgramHoursPerMonth || 0);
      if (totalHours >= 80) {
        return `Recorded: ${totalHours} hours a month. Threshold: 80 hours. Your answers also suggest a set-aside category may apply, which would mean your state doesn't assess this at all — worth confirming with them either way.`;
      }
      return "If a set-aside category applies to you, your state doesn't assess this. Recording hours stays useful if that changes.";
    }
    return "";
  };

  const getNonExemptMethodMessage = (
    method: string,
    isAlternative: boolean,
  ): string => {
    // Ranking claims removed throughout: "this easier method", "income tracking
    // is easier", "might be simpler", "a simpler option", and "which already
    // meets the threshold". 42 CFR 435.552(a) requires states to make all seven
    // pathways available and forbids offering a subset, so which one costs least
    // effort depends on what the state can already see under 435.557(a) and on
    // elections we don't know. And under 435.552(e) pathways combine rather than
    // competing, so "instead" is the wrong frame too.
    //
    // The 80 and $580 literals here move to the policy profile in W2b.
    if (method === "income-tracking") {
      if (isAlternative) {
        return "This route is open to you as well. Recording income means keeping pay stubs rather than logging time.";
      }
      const income = result?.responses.monthlyIncome || 0;
      const needed = 580 - income;
      if (needed <= 0) {
        return `Recorded: $${income} a month. Threshold: $580. Your state counts your whole household here, so its figure may be higher than yours — ask what it has on file.`;
      } else if (income > 0 && needed <= 100) {
        return `Recorded: $${income} a month. Threshold: $580. Difference: $${needed}. Household income counts toward this, not just yours, so you may be closer than this looks.`;
      } else if (income > 0) {
        return `Recorded: $${income} a month. Threshold: $580. Difference: $${needed}. Household income counts toward this, and income under the threshold may still be credited as hours, so it isn't wasted.`;
      }
      return "No income recorded. This route uses household income against a $580 threshold, so a spouse's earnings count too. Recording it means keeping pay stubs rather than logging time.";
    }
    if (method === "seasonal-income-tracking") {
      if (isAlternative) {
        return "This route is open to you as well, if your work comes and goes with the season.";
      }
      return "This route averages your income over the 6 months before the month being reviewed, against a $580 threshold. It's for work that comes and goes with the season.";
    }
    if (method === "hour-tracking") {
      if (isAlternative) {
        return "This route is open to you as well. Hours from work, volunteering, school, and job training all count toward one monthly total.";
      }
      const totalHours =
        (result?.responses.monthlyWorkHours || 0) +
        (result?.responses.volunteerHoursPerMonth || 0) +
        (result?.responses.schoolHoursPerMonth || 0) +
        (result?.responses.workProgramHoursPerMonth || 0);
      const needed = 80 - totalHours;
      if (needed <= 0) {
        return `Recorded: ${totalHours} hours a month. Threshold: 80 hours. Keep recording as you go.`;
      } else if (totalHours > 0 && needed <= 20) {
        return `Recorded: ${totalHours} hours a month. Threshold: 80 hours. Difference: ${needed}. Work, volunteering, school, and job training all count toward the same total, and income can be counted alongside them.`;
      } else if (totalHours > 0) {
        return `Recorded: ${totalHours} hours a month. Threshold: 80 hours. Difference: ${needed}. Anything counts toward the total — work, volunteering, school, job training — and income may be credited as hours too.`;
      }
      return "No hours recorded. Work, volunteering, school, and job training all count toward one monthly total of 80, and income can be counted alongside them.";
    }
    return "";
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
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
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
              sx={{ bgcolor: "grey.50", "&:hover": { bgcolor: "grey.100" } }}
            >
              <Typography variant="h6">See all compliance methods</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                {/*
                  42 CFR 435.552(a): states must make all seven pathways
                  available and may not offer a subset, so ranking one as
                  "easiest" asserts a fit HourKeep can't assess. Under
                  435.552(e) they combine rather than competing.
                */}
                Here are the ways this can be met. We&apos;ve put{" "}
                {getComplianceMethodLabel(recommendation.primaryMethod)} first
                based on what you told us, but any of them can work, and they
                can be combined.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                            // ADR-0003: was "Easiest for you".
                            label="Closest to what you told us"
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
                            label={
                              isExempt
                                ? "Not needed"
                                : "Not an option right now"
                            }
                            size="small"
                            sx={{
                              bgcolor: isExempt ? "success.50" : "grey.100",
                              color: isExempt
                                ? "success.main"
                                : "text.secondary",
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
                      {!isRecommended && method !== "exemption" && (
                        <Alert
                          severity={
                            isExempt
                              ? "success"
                              : isAlternative
                                ? "info"
                                : "warning"
                          }
                          sx={{ mt: 1 }}
                        >
                          <Typography variant="body2">
                            {isExempt
                              ? getExemptMethodMessage(method)
                              : getNonExemptMethodMessage(
                                  method,
                                  isAlternative,
                                )}
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

        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          You can switch methods anytime without losing data. All tracking
          methods remain accessible, and your previous data is preserved.
        </Alert>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
          {/*
            W0 § 0.3.3. These two buttons used to do the opposite of what they
            said: "Back to Assessment" called db.assessmentResults.delete()
            directly — a hard delete, no history row, straight into Dexie from a
            component — while "Start Fresh" deleted nothing and only navigated.

            They now differ in a way that matches their labels, and the difference
            is real rather than cosmetic: /how-to-hourkeep prefills the assessment
            from getLatestAssessmentResult, so keeping the result preserves the
            prefill and archiving it clears it.
          */}
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/how-to-hourkeep")}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Review my answers
          </Button>
          <Button
            variant="text"
            size="large"
            onClick={() => setStartOverOpen(true)}
            fullWidth
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Start over
          </Button>
        </Box>
      </Box>

      {/* Start-over confirmation. W0 § 0.3.3. */}
      <Dialog
        open={startOverOpen}
        onClose={
          startingOver
            ? undefined
            : () => {
                setStartOverOpen(false);
                setStartOverError(null);
              }
        }
        aria-labelledby="start-over-title"
        aria-describedby="start-over-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="start-over-title">
          Start over with a blank assessment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="start-over-description">
            Your answers won&apos;t be filled in next time, so you&apos;ll go
            through the questions again. Anything you&apos;ve recorded on the
            tracking or income pages stays where it is.
          </DialogContentText>
          {startOverError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {startOverError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setStartOverOpen(false);
              setStartOverError(null);
            }}
            disabled={startingOver}
          >
            Keep my answers
          </Button>
          <Button
            onClick={handleConfirmStartOver}
            color="error"
            variant="contained"
            disabled={startingOver}
            startIcon={
              startingOver ? <CircularProgress size={16} /> : undefined
            }
          >
            {startingOver ? "Clearing..." : "Start over"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
