"use client";

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { activityDefinitions, combinationRules } from "@/content/helpText";

/**
 * HourTrackingHelpIcon Component
 *
 * Displays comprehensive help information about hour tracking,
 * including activity definitions, combination rules, and edge cases.
 */
export function HourTrackingHelpIcon() {
  const renderContent = () => (
    <Box>
      {/* 80 Hours Requirement */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          80 Hours Per Month Requirement
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          To meet Medicaid work requirements, you need to complete 80 hours per
          month of qualifying activities. You can combine different activity
          types to reach 80 hours.
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Activity Types */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 18, color: "success.main" }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            What Activities Count?
          </Typography>
        </Box>

        {/* Work */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {activityDefinitions.work.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {activityDefinitions.work.definition}
          </Typography>
          <List dense sx={{ py: 0, pl: 2 }}>
            {activityDefinitions.work.examples
              .slice(0, 3)
              .map((example, index) => (
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

        {/* Volunteer */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {activityDefinitions.volunteer.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {activityDefinitions.volunteer.definition}
          </Typography>
          <List dense sx={{ py: 0, pl: 2 }}>
            {activityDefinitions.volunteer.examples
              .slice(0, 3)
              .map((example, index) => (
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

        {/* Education */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {activityDefinitions.education.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {activityDefinitions.education.definition}
          </Typography>
          <List dense sx={{ py: 0, pl: 2 }}>
            {activityDefinitions.education.examples
              .slice(0, 3)
              .map((example, index) => (
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

        {/* Work Program */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {activityDefinitions.workProgram.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {activityDefinitions.workProgram.definition}
          </Typography>
          <List dense sx={{ py: 0, pl: 2 }}>
            {activityDefinitions.workProgram.examples
              .slice(0, 3)
              .map((example, index) => (
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
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Combining Activities */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <InfoIcon sx={{ fontSize: 18, color: "info.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {combinationRules.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {combinationRules.definition}
        </Typography>
        <List dense sx={{ py: 0, pl: 2 }}>
          {combinationRules.examples.map((example, index) => (
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

      <Divider sx={{ my: 2 }} />

      {/* Common Questions */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Common Questions
        </Typography>

        {/* Work edge case */}
        {activityDefinitions.work.edgeCases
          .slice(0, 2)
          .map((edgeCase, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor:
                  edgeCase.counts === true
                    ? "success.lighter"
                    : edgeCase.counts === false
                      ? "error.lighter"
                      : "warning.lighter",
                border: "1px solid",
                borderColor:
                  edgeCase.counts === true
                    ? "success.light"
                    : edgeCase.counts === false
                      ? "error.light"
                      : "warning.light",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {edgeCase.scenario}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edgeCase.explanation}
              </Typography>
            </Box>
          ))}
      </Box>

      {/* Important Note */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          backgroundColor: "info.lighter",
          border: "1px solid",
          borderColor: "info.light",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
        >
          Remember
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Job searching does NOT count as a qualifying activity. If you lose
          your job, you need to volunteer, go to school, or join a work program
          to meet the 80-hour requirement.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <HelpTooltip
      title="Hour Tracking Help"
      content={renderContent()}
      ariaLabel="Help for hour tracking"
      size="small"
      color="primary"
    />
  );
}
