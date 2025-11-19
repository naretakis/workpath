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
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Recommendation } from "@/types/assessment";
import {
  getComplianceMethodLabel,
  getComplianceMethodDescription,
} from "@/lib/assessment/recommendationEngine";

interface GettingStartedContextualProps {
  hasNotice: boolean;
  monthsRequired?: number;
  deadline?: Date;
  recommendation?: Recommendation;
  onStartTracking: () => void;
}

export function GettingStartedContextual({
  hasNotice,
  monthsRequired,
  deadline,
  recommendation,
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
            ⏰ Deadline: {deadline.toLocaleDateString()}
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
            💡 You&apos;ll need to show proof every 6 months for renewal.
            Keeping HourKeep updated makes renewals easy!
          </Typography>
        </Alert>
      )}

      {/* Alternative Methods - Show if we have a recommendation */}
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
            sx={{
              bgcolor: "grey.50",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              See all compliance methods
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Here are all the ways you can stay compliant. We recommended{" "}
              {getComplianceMethodLabel(recommendation.primaryMethod)} because
              it&apos;s the easiest for your situation, but you can choose any
              method that works for you.
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

                    {/* Explain why this method is or isn't the easiest */}
                    {!isRecommended && (
                      <Alert
                        severity={isAlternative ? "info" : "warning"}
                        sx={{ mt: 1 }}
                      >
                        <Typography variant="caption">
                          {method === "income-tracking" &&
                            !isAvailable &&
                            "You're not currently earning $580/month. If your income increases, you can switch to this easier method."}
                          {method === "income-tracking" &&
                            isAlternative &&
                            "This also works for you, but we recommended hour tracking based on your situation."}
                          {method === "seasonal-income-tracking" &&
                            !isAvailable &&
                            "This method is for people with seasonal work that averages $580/month over 6 months."}
                          {method === "seasonal-income-tracking" &&
                            isAlternative &&
                            "This also works for you, but we recommended a simpler option."}
                          {method === "hour-tracking" &&
                            !isAvailable &&
                            "You're not currently at 80 hours/month. If you add more activities, you can use this method."}
                          {method === "hour-tracking" &&
                            isAlternative &&
                            recommendation.primaryMethod ===
                              "income-tracking" &&
                            "This also works, but income tracking is easier—just submit one paystub each month."}
                          {method === "hour-tracking" &&
                            isAlternative &&
                            recommendation.primaryMethod ===
                              "seasonal-income-tracking" &&
                            "This also works, but seasonal income tracking might be easier for your situation."}
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
          💡 Need help? Tap the ? icon anytime for guidance
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
