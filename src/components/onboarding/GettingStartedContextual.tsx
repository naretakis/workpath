"use client";

import {
  Box,
  Typography,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Recommendation, AssessmentResponses } from "@/types/assessment";
import {
  getComplianceMethodLabel,
  getComplianceMethodDescription,
} from "@/lib/assessment/recommendationEngine";

interface GettingStartedContextualProps {
  hasNotice: boolean;
  monthsRequired?: number;
  deadline?: Date;
  recommendation?: Recommendation;
  responses?: Partial<AssessmentResponses>;
  onStartTracking: () => void;
}

export function GettingStartedContextual({
  hasNotice,
  deadline,
  recommendation,
  responses,
  onStartTracking,
}: GettingStartedContextualProps) {
  const calculateDaysRemaining = () => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();
  const isExempt = recommendation?.primaryMethod === "exemption";

  // A near-copy of getNonExemptMethodMessage in
  // app/how-to-hourkeep/results/page.tsx, and it carried the same ranking claims:
  // "this easier method", "income tracking is easier", "a simpler option", and
  // "which already meets the threshold". 42 CFR 435.552(a) requires states to make
  // all seven pathways available and forbids offering a subset, so ranking them
  // asserts a fit HourKeep can't assess; under 435.552(e) they combine rather than
  // competing, so "instead" is the wrong frame as well.
  //
  // The duplication itself is real (codebase-audit-2026-08.md § 6) and outlives
  // W2a — de-duplicating it needs the unified compliance model in W7b. Both copies
  // are corrected here so neither states something false in the meantime.
  //
  // The 80 and $580 literals move to the policy profile in W2b.
  const getMethodMessage = (method: string, isAlternative: boolean): string => {
    if (method === "income-tracking") {
      if (isAlternative) {
        return "This route is open to you as well. Recording income means keeping pay stubs rather than logging time.";
      }
      const income = responses?.monthlyIncome || 0;
      const needed = 580 - income;
      if (needed <= 0) {
        return `Recorded: $${income} a month. Threshold: $580. Your state counts your whole household here, so its figure may be higher than yours.`;
      } else if (income > 0 && needed <= 100) {
        return `Recorded: $${income} a month. Threshold: $580. Difference: $${needed}. Household income counts toward this, not just yours, so you may be closer than this looks.`;
      } else if (income > 0) {
        return `Recorded: $${income} a month. Threshold: $580. Difference: $${needed}. Income under the threshold may still be credited as hours, so it isn't wasted.`;
      }
      return "No income recorded. This route uses household income against a $580 threshold, so a spouse's earnings count too.";
    }
    if (method === "seasonal-income-tracking") {
      if (isAlternative) {
        return "This route is open to you as well, if your work comes and goes with the season.";
      }
      return "This route averages your income over the 6 months before the month being reviewed, against a $580 threshold.";
    }
    if (method === "hour-tracking") {
      if (isAlternative) {
        return "This route is open to you as well. Hours from work, volunteering, school, and job training all count toward one monthly total.";
      }
      const totalHours =
        (responses?.monthlyWorkHours || 0) +
        (responses?.volunteerHoursPerMonth || 0) +
        (responses?.schoolHoursPerMonth || 0) +
        (responses?.workProgramHoursPerMonth || 0);
      const needed = 80 - totalHours;
      if (needed <= 0) {
        return `Recorded: ${totalHours} hours a month. Threshold: 80 hours. Keep recording as you go.`;
      } else if (totalHours > 0 && needed <= 20) {
        return `Recorded: ${totalHours} hours a month. Threshold: 80 hours. Difference: ${needed}. Work, volunteering, school, and job training all count toward the same total.`;
      } else if (totalHours > 0) {
        return `Recorded: ${totalHours} hours a month. Threshold: 80 hours. Difference: ${needed}. Anything counts toward the total, and income may be credited as hours too.`;
      }
      return "No hours recorded. Work, volunteering, school, and job training all count toward one monthly total of 80, and income can be counted alongside them.";
    }
    return "";
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        py: 2,
      }}
    >
      {/* Success Header */}
      <Box sx={{ textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Assessment Complete
        </Typography>
      </Box>

      {/* Recommendation Display */}
      {recommendation && (
        <Alert severity={isExempt ? "success" : "info"} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {isExempt
              ? "Good news! You may be exempt"
              : `We recommend: ${getComplianceMethodLabel(recommendation.primaryMethod)}`}
          </Typography>
          <Typography variant="body2">{recommendation.reasoning}</Typography>
          {!isExempt && (
            <Typography variant="body2" sx={{ mt: 1, fontSize: "0.875rem" }}>
              {getComplianceMethodDescription(recommendation.primaryMethod)}
            </Typography>
          )}
        </Alert>
      )}

      {/* Deadline Alert (for notice users) */}
      {hasNotice && deadline && daysRemaining !== null && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Deadline: {deadline.toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            You have {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} to
            respond
          </Typography>
        </Alert>
      )}

      {/* Unified Content - Clean Layout */}
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Here&apos;s how HourKeep works:
        </Typography>

        <List sx={{ py: 0 }}>
          <ListItem sx={{ py: 2, alignItems: "flex-start" }}>
            <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AddIcon sx={{ fontSize: 20, color: "white" }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="Log your hours or income"
              secondary="Track work, volunteer, school, and training hours"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>

          <ListItem sx={{ py: 2, alignItems: "flex-start" }}>
            <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
              <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
            </ListItemIcon>
            <ListItemText
              primary="See your progress"
              secondary="Know if you're meeting your requirements"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>

          <ListItem sx={{ py: 2, alignItems: "flex-start" }}>
            <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
              <FileDownloadIcon color="primary" sx={{ fontSize: 32 }} />
            </ListItemIcon>
            <ListItemText
              primary="Export when needed"
              secondary="Generate reports to submit to your state"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
        </List>
      </Box>

      {/* Info Alert */}
      {!hasNotice && (
        <Alert severity="info">
          <Typography variant="body2">
            You&apos;ll need to show proof every 6 months for renewal. Keeping
            HourKeep updated makes renewals easy!
          </Typography>
        </Alert>
      )}

      {/* Alternative Methods - Show if we have a recommendation and not exempt */}
      {recommendation && !isExempt && (
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
            <Typography variant="body2" fontWeight={600}>
              See all compliance methods
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              {/*
                42 CFR 435.552(a) requires states to make all seven pathways
                available and forbids offering a subset, so none of them is "the
                easiest" in a way HourKeep can know — that depends on what the
                state can already see under 435.557(a) and on elections we
                don't know. And under 435.552(e) they combine rather than
                competing.
              */}
              Here are the ways this can be met. We&apos;ve put{" "}
              {getComplianceMethodLabel(recommendation.primaryMethod)} first
              based on what you told us, but any of them can work, and they can
              be combined.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(
                [
                  "income-tracking",
                  "seasonal-income-tracking",
                  "hour-tracking",
                ] as const
              ).map((method) => {
                const isRecommended = method === recommendation.primaryMethod;
                const isAlternative =
                  recommendation.alternativeMethods.includes(method);
                const isAvailable = isRecommended || isAlternative;

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
                        variant="subtitle2"
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
                      {!isAvailable && (
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

                    <Typography variant="body2" color="text.secondary">
                      {getComplianceMethodDescription(method)}
                    </Typography>

                    {!isRecommended && (
                      <Alert
                        severity={isAlternative ? "info" : "warning"}
                        sx={{ mt: 1 }}
                      >
                        <Typography variant="caption">
                          {getMethodMessage(method, isAlternative)}
                        </Typography>
                      </Alert>
                    )}
                  </Paper>
                );
              })}
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                You can switch methods anytime without losing data. All tracking
                methods remain accessible.
              </Typography>
            </Alert>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Help Link */}
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Need help? Tap the ? icon anytime for guidance
        </Typography>
      </Box>

      {/* Action Button */}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={onStartTracking}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Start Using HourKeep
        </Button>
      </Box>
    </Box>
  );
}
