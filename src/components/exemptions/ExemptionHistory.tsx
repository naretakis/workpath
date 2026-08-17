"use client";

import { Box, Typography, Paper, Chip } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { ExemptionHistory as ExemptionHistoryType } from "@/types/exemptions";
import { format } from "date-fns";

interface ExemptionHistoryProps {
  history: ExemptionHistoryType[];
}

export function ExemptionHistory({ history }: ExemptionHistoryProps) {
  if (history.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: "center",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No screening history yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {history.map((item) => (
        <Paper
          key={item.id}
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {item.isExempt ? (
            <CheckCircleIcon sx={{ color: "success.main", fontSize: 32 }} />
          ) : (
            <CancelIcon sx={{ color: "warning.main", fontSize: 32 }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {format(new Date(item.screeningDate), "MMMM d, yyyy")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {/*
                ADR-0003: was "Exempt" / "Must Track Hours".
                This surface was MISSING from wave-2 § 2.5's table, which listed
                the dead components/assessment/AssessmentHistory.tsx instead.
                This one is live — rendered from app/settings/page.tsx.
                See wave-2a-truth-in-copy.md finding [F1].
              */}
              {item.isExempt
                ? "Answers suggested this may not apply"
                : "Answers didn't match a set-aside category"}
            </Typography>
          </Box>
          {item.exemptionCategory && (
            <Chip
              label={getCategoryLabel(item.exemptionCategory)}
              size="small"
              color={item.isExempt ? "success" : "default"}
            />
          )}
        </Paper>
      ))}
    </Box>
  );
}

// Helper function to get category label
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    age: "Age",
    "family-caregiving": "Family",
    "health-disability": "Health",
    "program-participation": "Programs",
    other: "Other",
  };
  return labels[category] || category;
}
