"use client";

import { useState } from "react";
import { Box, Typography, Paper, Button, Chip } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ExemptionScreening } from "@/types/exemptions";
import { RescreenDialog } from "./RescreenDialog";
import { ExemptionDetailsDialog } from "./ExemptionDetailsDialog";

interface ExemptionBadgeProps {
  screening: ExemptionScreening | null;
}

export function ExemptionBadge({ screening }: ExemptionBadgeProps) {
  const router = useRouter();
  const [rescreenDialogOpen, setRescreenDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleClick = () => {
    if (screening) {
      // If there's an existing screening, show details dialog
      setDetailsDialogOpen(true);
    } else {
      // If no screening, go directly to exemptions page
      router.push("/exemptions");
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailsDialogOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
  };

  const handleRescreenFromDetails = () => {
    setDetailsDialogOpen(false);
    setRescreenDialogOpen(true);
  };

  const handleRescreenConfirm = () => {
    setRescreenDialogOpen(false);
    router.push("/exemptions");
  };

  const handleRescreenCancel = () => {
    setRescreenDialogOpen(false);
  };

  // Not screened yet
  if (!screening) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          backgroundColor: "info.50",
          border: "1px solid",
          borderColor: "info.100",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "info.100",
          },
        }}
        onClick={handleClick}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <HelpOutlineIcon
            sx={{ color: "info.main", fontSize: { xs: 28, sm: 32 } }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Find Out if You Need to Track Hours
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Take a quick 5-minute screening
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Exempt
  if (screening.result.isExempt) {
    return (
      <>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            backgroundColor: "success.50",
            border: "1px solid",
            borderColor: "success.main",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "success.100",
            },
          }}
          onClick={handleClick}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <CheckCircleIcon
              sx={{ color: "success.main", fontSize: { xs: 28, sm: 32 } }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "success.dark",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                You Are Exempt
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                You don&apos;t need to track hours (but you can if you like)
              </Typography>
            </Box>
            {screening.result.exemptionCategory && (
              <Chip
                label={getCategoryLabel(screening.result.exemptionCategory)}
                size="small"
                sx={{
                  backgroundColor: "success.main",
                  color: "white",
                  fontWeight: 600,
                  height: 24,
                  fontSize: "0.75rem",
                }}
              />
            )}
            <Button
              size="small"
              sx={{
                color: "success.dark",
                textTransform: "none",
                fontSize: "0.8125rem",
                minWidth: "auto",
                px: 1,
              }}
              onClick={handleViewDetails}
            >
              Details
            </Button>
          </Box>
        </Paper>

        {/* Details Dialog */}
        {screening && (
          <ExemptionDetailsDialog
            open={detailsDialogOpen}
            onClose={handleDetailsClose}
            screening={screening}
            onRescreen={handleRescreenFromDetails}
          />
        )}

        {/* Rescreen Confirmation Dialog */}
        <RescreenDialog
          open={rescreenDialogOpen}
          onClose={handleRescreenCancel}
          onConfirm={handleRescreenConfirm}
        />
      </>
    );
  }

  // Not exempt - must track hours
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          backgroundColor: "warning.50",
          border: "1px solid",
          borderColor: "warning.main",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "warning.100",
          },
        }}
        onClick={handleClick}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <InfoIcon
            sx={{ color: "warning.main", fontSize: { xs: 28, sm: 32 } }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Must Track Hours
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Track 80 hours/month or earn $580/month
            </Typography>
          </Box>
          <Button
            size="small"
            sx={{
              color: "warning.dark",
              textTransform: "none",
              fontSize: "0.8125rem",
              minWidth: "auto",
              px: 1,
            }}
            onClick={handleViewDetails}
          >
            Details
          </Button>
        </Box>
      </Paper>

      {/* Details Dialog */}
      {screening && (
        <ExemptionDetailsDialog
          open={detailsDialogOpen}
          onClose={handleDetailsClose}
          screening={screening}
          onRescreen={handleRescreenFromDetails}
        />
      )}

      {/* Rescreen Confirmation Dialog */}
      <RescreenDialog
        open={rescreenDialogOpen}
        onClose={handleRescreenCancel}
        onConfirm={handleRescreenConfirm}
      />
    </>
  );
}

// Helper function to get category label
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    age: "Age-Based",
    "family-caregiving": "Family & Caregiving",
    "health-disability": "Health & Disability",
    "program-participation": "Program Participation",
    other: "Other",
  };
  return labels[category] || category;
}
