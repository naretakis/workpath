"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { formatCurrency } from "@/lib/utils/payPeriodConversion";
import { INCOME_THRESHOLD } from "@/lib/utils/payPeriodConversion";
import { SeasonalWorkerHelpIcon } from "@/components/help/SeasonalWorkerHelp";

export interface SeasonalWorkerViewProps {
  history: Array<{ month: string; total: number }>;
  average: number;
  isCompliant: boolean;
}

/**
 * SeasonalWorkerView Component
 *
 * Displays 6-month income history and rolling average for seasonal workers.
 * Uses a simple list view for mobile-friendliness and accessibility.
 *
 * Features:
 * - Shows income for each of the past 6 months
 * - Displays calculated 6-month average
 * - Shows compliance status based on average
 * - Help text explaining 6-month averaging
 * - Mobile-optimized layout
 */
export function SeasonalWorkerView({
  history,
  average,
  isCompliant,
}: SeasonalWorkerViewProps) {
  // Calculate total income across 6 months
  const totalIncome = history.reduce((sum, month) => sum + month.total, 0);

  // Format month string (YYYY-MM) to readable format (e.g., "October 2026")
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card
      sx={{
        mt: 3,
        border: "1px solid",
        borderColor: isCompliant ? "success.light" : "warning.light",
        boxShadow: 1,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" component="h3">
              6-Month Income History
            </Typography>
            <SeasonalWorkerHelpIcon />
          </Box>
        </Box>

        {/* Monthly Income List */}
        <Box sx={{ mb: 2 }}>
          {history.map((monthData, index) => (
            <Box key={monthData.month}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {formatMonth(monthData.month)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: monthData.total > 0 ? 600 : 400,
                    color:
                      monthData.total > 0 ? "text.primary" : "text.disabled",
                  }}
                >
                  {formatCurrency(monthData.total)}
                </Typography>
              </Box>
              {index < history.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

        {/* Summary Section */}
        <Divider sx={{ my: 2, borderStyle: "dashed" }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total (6 months)
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatCurrency(totalIncome)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Average/Month
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: isCompliant ? "success.main" : "warning.main",
              }}
            >
              {formatCurrency(average)}
            </Typography>
          </Box>
        </Box>

        {/* Compliance Status Alert */}
        <Box sx={{ mt: 2 }}>
          {isCompliant ? (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ alignItems: "center" }}
            >
              <Typography variant="body2">
                <strong>Meets $580 threshold</strong>
                <br />
                Your 6-month average meets work requirements.
              </Typography>
            </Alert>
          ) : (
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              sx={{ alignItems: "center" }}
            >
              <Typography variant="body2">
                <strong>Below $580 threshold</strong>
                <br />
                Your 6-month average is{" "}
                {formatCurrency(INCOME_THRESHOLD - average)} below the
                requirement. You may need to track hours or increase your
                income.
              </Typography>
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
