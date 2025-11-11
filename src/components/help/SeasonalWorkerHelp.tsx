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
import { Info as InfoIcon } from "@mui/icons-material";
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { incomeDefinitions } from "@/content/helpText";

/**
 * SeasonalWorkerHelpIcon Component
 *
 * Displays help information about seasonal worker income averaging,
 * including IRS definition, 6-month calculation, and examples.
 */
export function SeasonalWorkerHelpIcon() {
  const renderContent = () => (
    <Box>
      {/* Definition Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {incomeDefinitions.seasonalWorker.title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {incomeDefinitions.seasonalWorker.definition}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {incomeDefinitions.seasonalWorker.whoQualifies}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* IRS Definition */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
        >
          IRS Definition (Section 45R(d)(5)(B))
        </Typography>
        <Typography variant="caption">
          A seasonal worker is someone who works in an industry where work is
          typically available for 6 months or less per year. Examples include
          farm work, holiday retail, summer tourism, ski resorts, and the
          fishing industry.
        </Typography>
      </Alert>

      {/* How to Calculate Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <InfoIcon sx={{ fontSize: 18, color: "info.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            How 6-Month Averaging Works
          </Typography>
        </Box>
        <List dense sx={{ py: 0, pl: 2 }}>
          {incomeDefinitions.seasonalWorker.howToCalculate?.map(
            (step, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary={`${index + 1}. ${step}`}
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

      {/* Example Calculation */}
      {incomeDefinitions.seasonalWorker.example && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 1,
            backgroundColor: "success.lighter",
            border: "1px solid",
            borderColor: "success.light",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Example Calculation
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Scenario:</strong>{" "}
            {incomeDefinitions.seasonalWorker.example.scenario}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Calculation:</strong>{" "}
            {incomeDefinitions.seasonalWorker.example.calculation}
          </Typography>
          <Typography variant="body2" color="success.dark">
            <strong>Result:</strong>{" "}
            {incomeDefinitions.seasonalWorker.example.result}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Edge Cases Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Common Seasonal Worker Scenarios
        </Typography>
        {incomeDefinitions.seasonalWorker.edgeCases?.map((edgeCase, index) => (
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
          backgroundColor: "warning.lighter",
          border: "1px solid",
          borderColor: "warning.light",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
        >
          Important
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your 6-month average is recalculated each month. Make sure to mark all
          your income entries as seasonal worker income to use this calculation
          method.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <HelpTooltip
      title="Seasonal Worker Help"
      content={renderContent()}
      ariaLabel="Help for seasonal workers"
      size="small"
      color="primary"
    />
  );
}
