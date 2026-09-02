"use client";

import { Box, Paper, Typography, LinearProgress, Chip } from "@mui/material";
import {
  FactCheck as FactCheckIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { MonthlySummary } from "@/types";
import { formatMonthLong } from "@/lib/month";
import { HourTrackingHelpIcon } from "@/components/help/HourTrackingHelp";

/**
 * A month's logged hours against the threshold.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * COPY REWRITTEN IN W5, and it was not on the wave's list. Found by opening the
 * built app in a browser at 375px, which is the only reason it was found at all.
 *
 * This component rendered **"Compliant"** in green beside a tick, over "You've met
 * the 80-hour requirement!" — a verdict on eligibility, which is the state's to
 * reach and not HourKeep's (ADR-0003, and row 2 of the banned table in
 * `compliance-copy-standards.md`).
 *
 * W2a's no-verdict guard missed it for a specific and instructive reason: the guard
 * lists `COMPLIANT` **case-sensitively**, to spare the `isCompliant` identifier from
 * matching. That carve-out also spared a bare title-case `Compliant`. Every other
 * banned phrase carries a pronoun, so nothing in the list came close. The guard has
 * since been given `Compliant` and `you've met` as separate case-sensitive entries,
 * which is the more valuable half of this fix.
 *
 * W5 is what made it urgent rather than merely wrong. Before, this could only show
 * the wall-clock month; now it shows whichever month the user pages to, so the
 * verdict was about to be asserted over arbitrary months a state may be assessing.
 *
 * The threshold also became a prop. The old code wrote `80` three times — the
 * progress percentage, the "/ 80 hours" label, and the sentence above — and the
 * replacement copy has to state the threshold, so passing it in was cheaper than
 * adding a fourth. The page derives it from the calculation module rather than
 * restating it, so W2b's policy profile will reach here with no further edit
 * (ADR-0001).
 * ───────────────────────────────────────────────────────────────────────────────
 */
interface DashboardProps {
  summary: MonthlySummary;
  /**
   * The monthly hours total for this month. Required, so no call site can quietly
   * fall back to a hardcoded figure.
   */
  threshold: number;
}

export function Dashboard({ summary, threshold }: DashboardProps) {
  const { totalHours, workHours, volunteerHours, educationHours, hoursNeeded } =
    summary;

  const meetsThreshold = totalHours >= threshold;

  // Calculate progress percentage (capped at 100%)
  const progressPercentage =
    threshold > 0 ? Math.min((totalHours / threshold) * 100, 100) : 100;

  // Was `parseISO(summary.month + "-01")` — a hand-rolled parse of a month string.
  // W5 routes month formatting through @/lib/month so there is one implementation.
  const monthDisplay = formatMonthLong(summary.month);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header with Help Icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 3 },
        }}
      >
        {/* `component="h3"` because MUI maps variant h5 to an <h5> element by
            default, which skipped from the page's h2s straight to h5.
            component-standards.md: heading LEVELS must nest correctly regardless of
            visual size. This is a section heading beside the calendar's h3. */}
        <Typography
          variant="h5"
          component="h3"
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          Monthly Progress - {monthDisplay}
        </Typography>
        <HourTrackingHelpIcon />
      </Box>

      {/* Compliance Status */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        {meetsThreshold ? (
          <>
            {/* The icon still says "good news", because reaching the threshold IS
                good news. What changed is that the words report the record rather
                than announcing an outcome. */}
            <FactCheckIcon sx={{ fontSize: 40, color: "success.main" }} />
            <Box>
              <Typography variant="h6" color="success.main">
                {totalHours} hours logged
              </Typography>
              <Typography variant="body2" color="text.secondary">
                That&apos;s at or over the {threshold}-hour total for this
                month. Your state decides what counts.
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <WarningIcon sx={{ fontSize: 40, color: "warning.main" }} />
            <Box>
              <Typography variant="h6" color="warning.main">
                {hoursNeeded} hours needed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep logging to reach {threshold} hours
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Total Hours
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {totalHours} / {threshold} hours
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "grey.200",
            "& .MuiLinearProgress-bar": {
              backgroundColor: meetsThreshold ? "success.main" : "primary.main",
            },
          }}
        />
      </Box>

      {/* Hours Breakdown */}
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Hours by Activity Type
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            justifyContent: "space-around",
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              minWidth: { xs: "80px", sm: "auto" },
            }}
          >
            <Chip label="Work" color="primary" size="small" sx={{ mb: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              {workHours}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              hours
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              minWidth: { xs: "80px", sm: "auto" },
            }}
          >
            <Chip
              label="Volunteer"
              color="success"
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              {volunteerHours}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              hours
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              minWidth: { xs: "80px", sm: "auto" },
            }}
          >
            <Chip label="Education" color="info" size="small" sx={{ mb: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              {educationHours}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              hours
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
