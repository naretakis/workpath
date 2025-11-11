"use client";

import { Box, Paper, Typography, LinearProgress, Chip } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { MonthlySummary } from "@/types";
import { format, parseISO } from "date-fns";
import { HourTrackingHelpIcon } from "@/components/help/HourTrackingHelp";

interface DashboardProps {
  summary: MonthlySummary;
}

export function Dashboard({ summary }: DashboardProps) {
  const {
    totalHours,
    workHours,
    volunteerHours,
    educationHours,
    isCompliant,
    hoursNeeded,
  } = summary;

  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min((totalHours / 80) * 100, 100);

  // Format month for display
  const monthDate = parseISO(summary.month + "-01");
  const monthDisplay = format(monthDate, "MMMM yyyy");

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
        <Typography
          variant="h5"
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
        {isCompliant ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
            <Box>
              <Typography variant="h6" color="success.main">
                Compliant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You&apos;ve met the 80-hour requirement!
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
                Keep logging to reach 80 hours
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
            {totalHours} / 80 hours
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
