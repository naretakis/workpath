"use client";

import {
  Box,
  Typography,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { DefinitionsAccordion } from "./DefinitionsAccordion";
import { getDefinitionsForQuestion } from "@/lib/exemptions/definitions";

export interface Question {
  id: string;
  category: string;
  text: string;
  type: "boolean" | "date" | "multipleChoice";
  helpText?: string;
  options?: { value: string; label: string }[];
}

interface ExemptionQuestionProps {
  question: Question;
  value: string | Date | boolean | null;
  onChange: (value: string | Date | boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  isFirst: boolean;
}

export function ExemptionQuestion({
  question,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
}: ExemptionQuestionProps) {
  const isAnswered = value !== null && value !== undefined && value !== "";

  // Get definitions for this question
  const definitions = getDefinitionsForQuestion(question.id);

  const handleBooleanChange = (newValue: string) => {
    onChange(newValue === "true");
  };

  const handleDateChange = (newValue: string) => {
    if (newValue) {
      onChange(new Date(newValue));
    }
  };

  const handleMultipleChoiceChange = (newValue: string) => {
    onChange(newValue);
  };

  // Format date for input field
  const getDateValue = () => {
    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }
    return "";
  };

  // Check if this is the DOB question and it's pre-filled
  const isPrefilledDOB = question.id === "age-dob" && value instanceof Date;

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
          {question.text}
        </Typography>
        {question.helpText && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {question.helpText}
          </Alert>
        )}

        {/* Definitions Accordion */}
        {definitions.length > 0 && (
          <DefinitionsAccordion
            definitions={definitions}
            summaryText="What do these terms mean?"
          />
        )}
      </Box>

      {/* Answer Input */}
      <Box sx={{ flex: 1 }}>
        {question.type === "boolean" && (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={value === null ? "" : value.toString()}
              onChange={(e) => handleBooleanChange(e.target.value)}
            >
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="Yes"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  mx: 0,
                  px: 2,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="No"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mx: 0,
                  px: 2,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              />
            </RadioGroup>
          </FormControl>
        )}

        {question.type === "date" && (
          <>
            {isPrefilledDOB && (
              <Alert severity="info" sx={{ mb: 2 }}>
                We&apos;ve pre-filled your date of birth from your profile. You
                can change it if needed.
              </Alert>
            )}
            <TextField
              type="date"
              label="Select your date of birth"
              placeholder="MM/DD/YYYY"
              value={getDateValue()}
              onChange={(e) => handleDateChange(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: new Date().toISOString().split("T")[0], // Can't select future dates
              }}
              helperText={
                isPrefilledDOB
                  ? "From your profile - you can change this if needed"
                  : "Tap the field to open the date picker"
              }
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: 56,
                },
              }}
            />
          </>
        )}

        {question.type === "multipleChoice" && question.options && (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={value || ""}
              onChange={(e) => handleMultipleChoiceChange(e.target.value)}
            >
              {question.options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    mx: 0,
                    px: 2,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}
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
        {!isFirst && onBack && (
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
          onClick={onNext}
          disabled={!isAnswered}
          fullWidth={isFirst}
          sx={{ minHeight: 48 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
