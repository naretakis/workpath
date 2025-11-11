"use client";

import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { documentVerificationHelp } from "@/content/helpText";

export interface DocumentVerificationHelpIconProps {
  activityType?: "work" | "volunteer" | "education";
  context?: "income" | "gig-work";
}

/**
 * DocumentVerificationHelpIcon Component
 *
 * Displays a help icon that shows information about verification documents
 * for different activity types or income contexts. Explains why documents
 * are helpful and provides examples of acceptable documents.
 */
export function DocumentVerificationHelpIcon({
  activityType,
  context,
}: DocumentVerificationHelpIconProps) {
  // Get examples based on activity type or context
  const getExamples = () => {
    if (context === "income") {
      return documentVerificationHelp.incomeExamples;
    }
    if (context === "gig-work") {
      return documentVerificationHelp.gigWorkExamples;
    }
    switch (activityType) {
      case "work":
        return documentVerificationHelp.workExamples;
      case "volunteer":
        return documentVerificationHelp.volunteerExamples;
      case "education":
        return documentVerificationHelp.educationExamples;
      default:
        return [];
    }
  };

  const getTips = () => {
    if (context === "gig-work") {
      return documentVerificationHelp.gigWorkTips;
    }
    return documentVerificationHelp.tips;
  };

  const getContextLabel = () => {
    if (context === "income") return "income";
    if (context === "gig-work") return "gig work";
    return activityType;
  };

  const examples = getExamples();
  const tips = getTips();
  const contextLabel = getContextLabel();

  // Render full content for the tooltip/modal
  const renderContent = () => (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {documentVerificationHelp.definition}
      </Typography>

      {/* Why section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Why add documents?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {documentVerificationHelp.why}
        </Typography>
      </Box>

      {/* Examples for this activity type or context */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 18, color: "success.main" }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Examples for {contextLabel}:
          </Typography>
        </Box>
        <List dense sx={{ py: 0, pl: 2 }}>
          {examples.map((example, index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={`• ${example}`}
                primaryTypographyProps={{
                  variant: "body2",
                  sx: { fontSize: "0.875rem" },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Tips */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <LightbulbOutlinedIcon sx={{ fontSize: 18, color: "warning.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Tips:
          </Typography>
        </Box>
        <List dense sx={{ py: 0, pl: 2 }}>
          {tips.map((tip, index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={`• ${tip}`}
                primaryTypographyProps={{
                  variant: "body2",
                  sx: { fontSize: "0.875rem" },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Note */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          backgroundColor: "info.lighter",
          border: "1px solid",
          borderColor: "info.light",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {documentVerificationHelp.note}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <HelpTooltip
      title={documentVerificationHelp.title}
      content={renderContent()}
      ariaLabel="Help for verification documents"
      size="small"
      color="primary"
    />
  );
}
