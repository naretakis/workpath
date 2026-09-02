"use client";

import { Box, Paper, Typography, LinearProgress, Chip } from "@mui/material";
import {
  FactCheck as FactCheckIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { MonthlyIncomeSummary } from "@/types/income";
import {
  formatCurrency,
  INCOME_THRESHOLD,
} from "@/lib/utils/payPeriodConversion";
import { IncomeTrackingHelpIcon } from "@/components/help/IncomeTrackingHelp";

interface IncomeStatusIndicatorProps {
  summary: MonthlyIncomeSummary;
}

export function IncomeStatusIndicator({ summary }: IncomeStatusIndicatorProps) {
  const {
    totalIncome,
    isCompliant,
    amountNeeded,
    isSeasonalWorker,
    seasonalAverage,
    incomeBySource,
    entryCount,
  } = summary;

  // Use seasonal average if applicable, otherwise use total income
  const effectiveIncome =
    isSeasonalWorker && seasonalAverage !== undefined
      ? seasonalAverage
      : totalIncome;

  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min(
    (effectiveIncome / INCOME_THRESHOLD) * 100,
    100,
  );

  // Check if close to threshold ($550-$579)
  const isCloseToThreshold =
    !isCompliant && effectiveIncome >= INCOME_THRESHOLD - 30;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header with Help Icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          Income Tracking
        </Typography>
        <IncomeTrackingHelpIcon />
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
        {isCompliant ? (
          <>
            {/*
              W5: was "Compliant" over "You've met the $580 requirement!". Same
              verdict as Dashboard.tsx, same reason W2a's guard missed it — the
              banned-phrase list matched `COMPLIANT` case-sensitively to spare the
              `isCompliant` identifier, which also spared title case. Found by
              looking at the built app rather than by reading code.

              The income pathway needs a stronger hedge than the hours pathway, not
              a weaker one. 42 CFR 435.552(f)(2) measures MAGI-based income for the
              MAGI-BASED HOUSEHOLD, and HourKeep stores one person's records — so
              this figure is not even the number the state will compare. Saying a
              threshold was met on this surface was the least defensible verdict in
              the app. W7a corrects the arithmetic; W5 stops it announcing a result.
            */}
            <FactCheckIcon sx={{ fontSize: 40, color: "success.main" }} />
            <Box>
              <Typography variant="h6" color="success.main">
                {formatCurrency(effectiveIncome)} recorded
              </Typography>
              <Typography variant="body2" color="text.secondary">
                That&apos;s at or over {formatCurrency(INCOME_THRESHOLD)} for
                this month. Your state counts your whole household&apos;s income
                here, not just yours — ask them what they have on file.
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <WarningIcon sx={{ fontSize: 40, color: "warning.main" }} />
            <Box>
              <Typography variant="h6" color="warning.main">
                {formatCurrency(amountNeeded)} needed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep logging to reach {formatCurrency(INCOME_THRESHOLD)}
              </Typography>
              {/*
                THE HOUSEHOLD DISCLOSURE BELONGS HERE MOST OF ALL, and until review
                it appeared only on the at-or-over branch.

                42 CFR 435.552(f)(2) measures MAGI-based income for the MAGI-BASED
                HOUSEHOLD, and HourKeep stores one person's records — so the figure
                above is not the figure the state compares. On the at-or-over branch
                that fact is a caution. On THIS branch it is the single most valuable
                thing the app can say: compliance-copy-standards.md names the married
                user whose spouse works as "the case that matters", because telling
                them they are failing "sends them looking for 80 hours of
                volunteering they don't need."

                Stated so it cannot be read as a spouse's income being a problem —
                more household income helps this pathway, and the point at which it
                stops helping is a different conversation about eligibility limits,
                not a community-engagement failure.
              */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                This is only your own income. Your state counts your whole
                household&apos;s income here, which is often more — so you may
                already be over this without doing anything else. Ask them what
                they have on file.
              </Typography>
              {isCloseToThreshold && (
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  {formatCurrency(INCOME_THRESHOLD - effectiveIncome)} to go on
                  your own income alone.
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Seasonal Worker Badge */}
      {isSeasonalWorker && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label="Seasonal Worker - 6-Month Average"
            color="info"
            size="small"
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Your income is averaged over the past 6 months
          </Typography>
        </Box>
      )}

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
            {isSeasonalWorker ? "Average Monthly Income" : "Total Income"}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatCurrency(effectiveIncome)} /{" "}
            {formatCurrency(INCOME_THRESHOLD)}
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
              backgroundColor: isCompliant ? "success.main" : "primary.main",
            },
          }}
        />
      </Box>

      {/* Income Breakdown */}
      {incomeBySource && incomeBySource.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Income Sources: {entryCount}{" "}
            {entryCount === 1 ? "entry" : "entries"}
          </Typography>
          <Box sx={{ pl: 2 }}>
            {incomeBySource.map((source, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  • {source.source}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(source.monthlyEquivalent)}/month
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
