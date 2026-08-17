"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

interface NoticeQuestionProps {
  onAnswer: (receivedNotice: boolean, skipToWork: boolean) => void;
  onBack?: () => void;
}

export function NoticeQuestion({ onAnswer, onBack }: NoticeQuestionProps) {
  const [value, setValue] = useState<string>("");

  const handleNext = () => {
    if (value === "yes") {
      onAnswer(true, false);
    } else if (value === "no") {
      onAnswer(false, false);
    }
  };

  const isAnswered = value !== "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minHeight: "400px",
      }}
    >
      {/* Question Text */}
      <Box>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Have you received a notice from your Medicaid agency about work
          requirements?
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            This notice might mention:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Community engagement requirements</li>
            <li>Work requirements for Medicaid</li>
            <li>Reporting your work hours or income</li>
            <li>80 hours per month or $580 per month</li>
          </Typography>
        </Alert>
      </Box>

      {/* Answer Input */}
      <Box sx={{ flex: 1 }}>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
            <FormControlLabel
              value="yes"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Yes, I received a notice
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your agency has determined you need to track work
                    requirements
                  </Typography>
                </Box>
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                mx: 0,
                px: 2,
                py: 1.5,
                alignItems: "flex-start",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
            <FormControlLabel
              value="no"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    No or I&apos;m not sure
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Let&apos;s check if you might be exempt
                  </Typography>
                </Box>
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                mx: 0,
                px: 2,
                py: 1.5,
                alignItems: "flex-start",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ minHeight: 48 }}
          >
            Back
          </Button>
        )}
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNext}
          disabled={!isAnswered}
          fullWidth={!onBack}
          sx={{ minHeight: 48 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

// For users who received a notice (after notice details)
interface NoticeFollowUpWithNoticeProps {
  onCheckExemption: () => void;
  onSkipToWork: () => void;
  onBack?: () => void;
}

export function NoticeFollowUpWithNotice({
  onCheckExemption,
  onSkipToWork,
  onBack,
}: NoticeFollowUpWithNoticeProps) {
  const [value, setValue] = useState<string>("");

  const handleNext = () => {
    if (value === "check") {
      onCheckExemption();
    } else if (value === "skip") {
      onSkipToWork();
    }
  };

  const isAnswered = value !== "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minHeight: "400px",
      }}
    >
      {/* Question Text */}
      <Box>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          What would you like to do?
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Your Medicaid agency has determined that you need to track work
          requirements. However, you might still qualify for an exemption.
        </Alert>
      </Box>

      {/* Answer Input */}
      <Box sx={{ flex: 1 }}>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
            <FormControlLabel
              value="check"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Check if I&apos;m exempt anyway
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recommended—takes 2 minutes
                  </Typography>
                </Box>
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                mx: 0,
                px: 2,
                py: 1.5,
                alignItems: "flex-start",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
            <FormControlLabel
              value="skip"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Skip to finding my compliance method
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Go straight to work situation questions
                  </Typography>
                </Box>
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                mx: 0,
                px: 2,
                py: 1.5,
                alignItems: "flex-start",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ minHeight: 48 }}
          >
            Back
          </Button>
        )}
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNext}
          disabled={!isAnswered}
          fullWidth={!onBack}
          sx={{ minHeight: 48 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

// For users who did NOT receive a notice
interface NoticeFollowUpProps {
  onCheckExemption: () => void;
  onSkipToWork: () => void;
  onBack?: () => void;
}

export function NoticeFollowUp({
  onCheckExemption,
  onSkipToWork,
  onBack,
}: NoticeFollowUpProps) {
  const [value, setValue] = useState<string>("");

  const handleNext = () => {
    if (value === "check") {
      onCheckExemption();
    } else if (value === "skip") {
      onSkipToWork();
    }
  };

  const isAnswered = value !== "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minHeight: "400px",
      }}
    >
      {/* Question Text */}
      <Box>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          What would you like to do?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {/*
            ADR-0003. Also gap 15.20: a self-reported "no, I'm not meeting it"
            can be accepted at face value and support a denial, so the screening
            genuinely should come first — the reason is protective, not just
            time-saving.
          */}
          It&apos;s worth checking what may already apply to you before
          answering anything else. It takes about 2 minutes, and some people
          find the requirement doesn&apos;t reach them at all.
        </Typography>
      </Box>

      {/* Answer Input */}
      <Box sx={{ flex: 1 }}>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
            <FormControlLabel
              value="check"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Check if I&apos;m exempt
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recommended—takes 2 minutes
                  </Typography>
                </Box>
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                mx: 0,
                px: 2,
                py: 1.5,
                alignItems: "flex-start",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
            <FormControlLabel
              value="skip"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Skip to finding my compliance method
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Go straight to work situation questions
                  </Typography>
                </Box>
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                mx: 0,
                px: 2,
                py: 1.5,
                alignItems: "flex-start",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ minHeight: 48 }}
          >
            Back
          </Button>
        )}
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNext}
          disabled={!isAnswered}
          fullWidth={!onBack}
          sx={{ minHeight: 48 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
