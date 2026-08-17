"use client";

import { Box, Typography, Button, Paper } from "@mui/material";
import {
  Explore as ExploreIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

interface IntroductionScreenProps {
  onGetStarted: () => void;
  onSkip: () => void;
  variant?: "assessment" | "onboarding"; // New prop to control content
}

export function IntroductionScreen({
  onGetStarted,
  onSkip,
  variant = "assessment", // Default to assessment for backward compatibility
}: IntroductionScreenProps) {
  const isOnboarding = variant === "onboarding";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "primary.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <ExploreIcon sx={{ fontSize: 40, color: "primary.main" }} />
      </Box>

      {/* Title */}
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{
          fontSize: { xs: "1.5rem", sm: "2rem" },
          fontWeight: 600,
          mb: 2,
        }}
      >
        {isOnboarding ? "Welcome to HourKeep" : "How to HourKeep"}
      </Typography>

      {/* Description */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "grey.50",
          border: "1px solid",
          borderColor: "divider",
          maxWidth: 500,
        }}
      >
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          paragraph
        >
          {isOnboarding
            ? "Track your work hours to maintain your Medicaid coverage."
            : // ADR-0003: was "Discover the easiest way to keep your hours".
              // 42 CFR 435.552(a) makes all seven pathways equally available and
              // forbids states offering a subset, so which one is easiest depends
              // on facts HourKeep doesn't hold.
              "Work out what counts for you, and what your state may already have on file."}
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          {isOnboarding
            ? "This will take about 2 minutes."
            : "This will take about 5 minutes."}
        </Typography>
      </Paper>

      {/* Features */}
      <Box sx={{ mb: 4, maxWidth: 500, width: "100%" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <CheckCircleIcon sx={{ color: "success.main", flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">
            {/*
              ADR-0003: was "Check if you're exempt from work requirements".
              The screening finds out what may apply; the state decides.
            */}
            {isOnboarding
              ? "Understand what you need to do"
              : "Find out whether this even applies to you"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <CheckCircleIcon sx={{ color: "success.main", flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">
            Get personalized recommendations based on your situation
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <CheckCircleIcon sx={{ color: "success.main", flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">
            Your answers stay on your device—we don&apos;t share your
            information
          </Typography>
        </Box>
      </Box>

      {/* Time estimate */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 4,
          p: 2,
          bgcolor: "info.50",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "info.200",
        }}
      >
        <AccessTimeIcon sx={{ color: "info.main", fontSize: 20 }} />
        <Typography variant="body2" color="info.main">
          {isOnboarding ? "Takes about 2 minutes" : "Takes about 5 minutes"}
        </Typography>
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={onGetStarted}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Get Started
        </Button>
        <Button
          variant="text"
          size="large"
          onClick={onSkip}
          fullWidth
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          Skip for Now
        </Button>
      </Box>
    </Box>
  );
}
