"use client";

import { Box, Paper, Typography, LinearProgress, Chip } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { MonthlyIncomeSummary } from "@/types/income";
import {
  formatCurrency,
  INCOME_THRESHOLD,
} from "@/lib/utils/payPeriodConversion";

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
            <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
            <Box>
              <Typography variant="h6" color="success.main">
                Compliant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You&apos;ve met the $580 requirement!
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
                Keep logging to reach $580
              </Typography>
              {isCloseToThreshold && (
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  You&apos;re close! Just a bit more to go.
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
