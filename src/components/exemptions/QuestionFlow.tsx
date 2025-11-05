"use client";

import { useState, useEffect } from "react";
import { Box, LinearProgress, Typography, Paper } from "@mui/material";
import { ExemptionQuestion, Question } from "./ExemptionQuestion";
import { getNextQuestion } from "@/lib/exemptions/questionFlow";
import { calculateExemption } from "@/lib/exemptions/calculator";
import { ExemptionResponses, ExemptionResult } from "@/types/exemptions";

interface QuestionFlowProps {
  onComplete: (responses: ExemptionResponses, result: ExemptionResult) => void;
  initialDateOfBirth?: Date | null;
}

export function QuestionFlow({
  onComplete,
  initialDateOfBirth,
}: QuestionFlowProps) {
  const [responses, setResponses] = useState<ExemptionResponses>(() => {
    // Initialize with DOB from profile if available
    if (initialDateOfBirth) {
      return {
        dateOfBirth: initialDateOfBirth,
        age: calculateAge(initialDateOfBirth),
      };
    }
    return {};
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);
  const [progress, setProgress] = useState(0);

  // Load first question on mount
  useEffect(() => {
    // Always start with the first question (DOB question)
    // Don't pass responses to getNextQuestion so it doesn't skip
    const firstQuestion = getNextQuestion({});
    if (firstQuestion) {
      // Using a microtask to avoid synchronous setState in effect
      Promise.resolve().then(() => {
        setCurrentQuestion(firstQuestion);
        setProgress(10); // Always start at 10%
      });
    }
  }, []);

  const handleAnswer = (value: string | Date | boolean) => {
    if (!currentQuestion) return;

    // Map question IDs to response fields
    const newResponses = { ...responses };

    switch (currentQuestion.id) {
      case "age-dob":
        newResponses.dateOfBirth = value as Date;
        newResponses.age = calculateAge(value as Date);
        break;
      case "family-pregnant":
        newResponses.isPregnantOrPostpartum = value as boolean;
        break;
      case "family-child":
        newResponses.hasDependentChild13OrYounger = value as boolean;
        break;
      case "family-disabled-dependent":
        newResponses.isParentGuardianOfDisabled = value as boolean;
        break;
      case "health-medicare":
        newResponses.isOnMedicare = value as boolean;
        break;
      case "health-non-magi":
        newResponses.isEligibleForNonMAGI = value as boolean;
        break;
      case "health-disabled-veteran":
        newResponses.isDisabledVeteran = value as boolean;
        break;
      case "health-medically-frail":
        newResponses.isMedicallyFrail = value as boolean;
        break;
      case "program-snap-tanf":
        newResponses.isOnSNAPOrTANFMeetingRequirements = value as boolean;
        break;
      case "program-rehab":
        newResponses.isInRehabProgram = value as boolean;
        break;
      case "other-incarcerated":
        newResponses.isIncarceratedOrRecentlyReleased = value as boolean;
        break;
      case "other-tribal":
        newResponses.hasTribalStatus = value as boolean;
        break;
    }

    setResponses(newResponses);
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    // Check if user is exempt after this answer
    const result = calculateExemption(responses);
    if (result.isExempt) {
      // User is exempt, show results
      onComplete(responses, result);
      return;
    }

    // Get next question
    const nextQuestion = getNextQuestion(responses);

    if (nextQuestion) {
      // Add current question to history
      setQuestionHistory([...questionHistory, currentQuestion]);
      setCurrentQuestion(nextQuestion);

      // Update progress (rough estimate based on categories)
      const categoryProgress = {
        age: 20,
        "family-caregiving": 40,
        "health-disability": 60,
        "program-participation": 80,
        other: 90,
      };
      setProgress(
        categoryProgress[
          nextQuestion.category as keyof typeof categoryProgress
        ] || 50,
      );
    } else {
      // No more questions, calculate final result
      const finalResult = calculateExemption(responses);
      onComplete(responses, finalResult);
    }
  };

  const handleBack = () => {
    if (questionHistory.length === 0) return;

    // Get previous question
    const previousQuestion = questionHistory[questionHistory.length - 1];
    const newHistory = questionHistory.slice(0, -1);

    setQuestionHistory(newHistory);
    setCurrentQuestion(previousQuestion);

    // Update progress
    setProgress(Math.max(10, progress - 20));
  };

  const getCurrentValue = () => {
    if (!currentQuestion) return null;

    // Map question IDs to response fields
    switch (currentQuestion.id) {
      case "age-dob":
        return responses.dateOfBirth ?? null;
      case "family-pregnant":
        return responses.isPregnantOrPostpartum ?? null;
      case "family-child":
        return responses.hasDependentChild13OrYounger ?? null;
      case "family-disabled-dependent":
        return responses.isParentGuardianOfDisabled ?? null;
      case "health-medicare":
        return responses.isOnMedicare ?? null;
      case "health-non-magi":
        return responses.isEligibleForNonMAGI ?? null;
      case "health-disabled-veteran":
        return responses.isDisabledVeteran ?? null;
      case "health-medically-frail":
        return responses.isMedicallyFrail ?? null;
      case "program-snap-tanf":
        return responses.isOnSNAPOrTANFMeetingRequirements ?? null;
      case "program-rehab":
        return responses.isInRehabProgram ?? null;
      case "other-incarcerated":
        return responses.isIncarceratedOrRecentlyReleased ?? null;
      case "other-tribal":
        return responses.hasTribalStatus ?? null;
      default:
        return null;
    }
  };

  if (!currentQuestion) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Progress Indicator */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: "primary.50",
          border: "1px solid",
          borderColor: "primary.100",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 60 }}>
            {progress}%
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Category: {getCategoryLabel(currentQuestion.category)}
        </Typography>
      </Paper>

      {/* Current Question */}
      <Paper
        elevation={0}
        sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
      >
        <ExemptionQuestion
          question={currentQuestion}
          value={getCurrentValue()}
          onChange={handleAnswer}
          onNext={handleNext}
          onBack={questionHistory.length > 0 ? handleBack : undefined}
          isFirst={questionHistory.length === 0}
        />
      </Paper>
    </Box>
  );
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

// Helper function to get category label
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    age: "Age",
    "family-caregiving": "Family & Caregiving",
    "health-disability": "Health & Disability",
    "program-participation": "Program Participation",
    other: "Other Exemptions",
  };
  return labels[category] || category;
}
