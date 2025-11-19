"use client";

import { Box, Paper, Typography, Button, Chip } from "@mui/material";
import {
  Explore as ExploreIcon,
  CheckCircle as CheckCircleIcon,
  Recommend as RecommendIcon,
} from "@mui/icons-material";
import { AssessmentResult } from "@/types/assessment";
import { getComplianceMethodLabel } from "@/lib/assessment/recommendationEngine";

interface AssessmentBadgeProps {
  result: AssessmentResult | null;
  onTakeAssessment: () => void;
  onViewDetails: () => void;
  onRetakeAssessment: () => void;
}

export function AssessmentBadge({
  result,
  onTakeAssessment,
  onViewDetails,
  onRetakeAssessment,
}: AssessmentBadgeProps) {
  // Not started state
  if (!result) {
    return (
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "primary.50",
          border: "2px solid",
          borderColor: "primary.main",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "primary.100",
            transform: "translateY(-2px)",
            boxShadow: 2,
          },
        }}
        onClick={onTakeAssessment}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ExploreIcon
              sx={{ color: "white", fontSize: { xs: 24, sm: 28 } }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: "primary.main",
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              How to HourKeep
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
            >
              Discover the easiest way to keep your hours, and keep your
              coverage
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onTakeAssessment();
              }}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              }}
            >
              Take 5 Minute Assessment →
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  }

  const { recommendation } = result;
  const isExempt = recommendation.primaryMethod === "exemption";

  // Exempt state
  if (isExempt) {
    return (
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "success.50",
          border: "2px solid",
          borderColor: "success.main",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: "50%",
              bgcolor: "success.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircleIcon
              sx={{ color: "white", fontSize: { xs: 24, sm: 28 } }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: "success.main",
                fontWeight: 600,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                mb: 1.5,
              }}
            >
              You&apos;re Exempt
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5, fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
            >
              {recommendation.reasoning}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={onViewDetails}
                sx={{
                  borderColor: "success.main",
                  color: "success.main",
                  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  py: { xs: 0.75, sm: 1 },
                  flex: { xs: "1", sm: "0 1 auto" },
                  "&:hover": {
                    borderColor: "success.dark",
                    bgcolor: "success.50",
                  },
                }}
              >
                See Assessment Details
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={onRetakeAssessment}
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  py: { xs: 0.5, sm: 0.75 },
                  flex: { xs: "1", sm: "0 1 auto" },
                }}
              >
                Retake Assessment
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Recommended method state
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: "primary.50",
        border: "2px solid",
        borderColor: "primary.main",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: "50%",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RecommendIcon
            sx={{ color: "white", fontSize: { xs: 24, sm: 28 } }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 1.5 }}>
            <Typography
              component="span"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                mr: 1,
              }}
            >
              Recommended:
            </Typography>
            <Chip
              label={getComplianceMethodLabel(recommendation.primaryMethod)}
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                height: { xs: 20, sm: 24 },
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={onViewDetails}
              sx={{
                bgcolor: "primary.main",
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                py: { xs: 0.75, sm: 1 },
                flex: { xs: "1", sm: "0 1 auto" },
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              View Assessment Details
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={onRetakeAssessment}
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                py: { xs: 0.5, sm: 0.75 },
                flex: { xs: "1", sm: "0 1 auto" },
              }}
            >
              Retake Assessment
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
