"use client";

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider,
} from "@mui/material";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { incomeDefinitions } from "@/content/helpText";

/**
 * IncomeTrackingHelpIcon Component
 *
 * Displays comprehensive help information about income tracking,
 * including threshold definition, earned vs unearned income,
 * gig economy guidance, and edge cases.
 */
export function IncomeTrackingHelpIcon() {
  const renderContent = () => (
    <Box>
      {/* Income Threshold Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {incomeDefinitions.threshold.title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {incomeDefinitions.threshold.definition}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          {incomeDefinitions.threshold.calculation}
        </Typography>
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="caption">
            Note: This threshold is based on the federal minimum wage ($7.25)
            and may change if the federal minimum wage changes.
          </Typography>
        </Alert>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* What Counts Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 18, color: "success.main" }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {incomeDefinitions.threshold.whatCounts?.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {incomeDefinitions.threshold.whatCounts?.description}
        </Typography>
        <List dense sx={{ py: 0, pl: 2 }}>
          {incomeDefinitions.threshold.whatCounts?.examples.map(
            (example, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary={`• ${example}`}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontSize: "0.875rem" },
                  }}
                />
              </ListItem>
            ),
          )}
        </List>
      </Box>

      {/* What Does NOT Count Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <CancelIcon sx={{ fontSize: 18, color: "error.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {incomeDefinitions.threshold.whatDoesNotCount?.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {incomeDefinitions.threshold.whatDoesNotCount?.description}
        </Typography>
        <List dense sx={{ py: 0, pl: 2 }}>
          {incomeDefinitions.threshold.whatDoesNotCount?.examples.map(
            (example, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary={`• ${example}`}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontSize: "0.875rem" },
                  }}
                />
              </ListItem>
            ),
          )}
        </List>
        <Alert severity="warning" sx={{ mt: 1 }}>
          <Typography variant="caption">
            Disclaimer: The distinction between earned and unearned income for
            Medicaid work requirements is subject to final CMS regulatory
            clarification.
          </Typography>
        </Alert>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Gig Economy Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <InfoIcon sx={{ fontSize: 18, color: "info.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {incomeDefinitions.gigEconomy.title}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {incomeDefinitions.gigEconomy.definition}
        </Typography>
        <List dense sx={{ py: 0, pl: 2 }}>
          {incomeDefinitions.gigEconomy.whatCounts?.examples.map(
            (example, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary={`• ${example}`}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontSize: "0.875rem" },
                  }}
                />
              </ListItem>
            ),
          )}
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Edge Cases Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Common Questions
        </Typography>
        {incomeDefinitions.threshold.edgeCases?.map((edgeCase, index) => (
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

      {/* Income vs Hours Choice */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          backgroundColor: "info.lighter",
          border: "1px solid",
          borderColor: "info.light",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {incomeDefinitions.incomeVsHours.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {incomeDefinitions.incomeVsHours.definition}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {incomeDefinitions.incomeVsHours.note}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <HelpTooltip
      title="Income Tracking Help"
      content={renderContent()}
      ariaLabel="Help for income tracking"
      size="small"
      color="primary"
    />
  );
}
