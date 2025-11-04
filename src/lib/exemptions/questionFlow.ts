import {
  ExemptionResponses,
  ExemptionResult,
  ExemptionCategory,
} from "@/types/exemptions";
import {
  ExemptionQuestion,
  allQuestions,
  categoryOrder,
  getQuestionsByCategory,
} from "./questions";
import { calculateExemption } from "./calculator";

export interface QuestionFlowState {
  currentQuestionId: string | null;
  responses: ExemptionResponses;
  questionHistory: string[]; // Track question IDs for back navigation
  isComplete: boolean;
  result?: ExemptionResult;
}

/**
 * Initialize a new question flow
 */
export function initializeQuestionFlow(): QuestionFlowState {
  return {
    currentQuestionId: allQuestions[0].id,
    responses: {},
    questionHistory: [],
    isComplete: false,
  };
}

/**
 * Get the next question based on current responses
 * Returns null if screening is complete (either exempt or all questions answered)
 */
export function getNextQuestion(
  responses: ExemptionResponses,
  currentQuestionId?: string,
): ExemptionQuestion | null {
  // Check if user is already exempt (short-circuit logic)
  const result = calculateExemption(responses);
  if (result.isExempt) {
    return null; // Stop asking questions
  }

  // Find current question index
  let startIndex = 0;
  if (currentQuestionId) {
    const currentIndex = allQuestions.findIndex(
      (q) => q.id === currentQuestionId,
    );
    startIndex = currentIndex + 1;
  }

  // Find next unanswered question
  for (let i = startIndex; i < allQuestions.length; i++) {
    const question = allQuestions[i];

    // Check if this question has been answered
    if (!isQuestionAnswered(question, responses)) {
      return question;
    }
  }

  // All questions answered and not exempt
  return null;
}

/**
 * Get the previous question for back navigation
 */
export function getPreviousQuestion(
  questionHistory: string[],
): ExemptionQuestion | null {
  if (questionHistory.length === 0) {
    return null;
  }

  const previousQuestionId = questionHistory[questionHistory.length - 1];
  return allQuestions.find((q) => q.id === previousQuestionId) || null;
}

/**
 * Check if a question has been answered
 */
function isQuestionAnswered(
  question: ExemptionQuestion,
  responses: ExemptionResponses,
): boolean {
  switch (question.id) {
    case "age-dob":
      return responses.dateOfBirth !== undefined;
    case "family-pregnant":
      return responses.isPregnantOrPostpartum !== undefined;
    case "family-child":
      return responses.hasDependentChild13OrYounger !== undefined;
    case "family-disabled-dependent":
      return responses.isParentGuardianOfDisabled !== undefined;
    case "health-medicare":
      return responses.isOnMedicare !== undefined;
    case "health-non-magi":
      return responses.isEligibleForNonMAGI !== undefined;
    case "health-disabled-veteran":
      return responses.isDisabledVeteran !== undefined;
    case "health-medically-frail":
      return responses.isMedicallyFrail !== undefined;
    case "program-snap-tanf":
      return responses.isOnSNAPOrTANFMeetingRequirements !== undefined;
    case "program-rehab":
      return responses.isInRehabProgram !== undefined;
    case "other-incarcerated":
      return responses.isIncarceratedOrRecentlyReleased !== undefined;
    case "other-tribal":
      return responses.hasTribalStatus !== undefined;
    default:
      return false;
  }
}

/**
 * Update responses with a new answer
 */
export function updateResponses(
  responses: ExemptionResponses,
  questionId: string,
  answer: boolean | Date | string,
): ExemptionResponses {
  const updatedResponses = { ...responses };

  switch (questionId) {
    case "age-dob":
      updatedResponses.dateOfBirth = answer as Date;
      break;
    case "family-pregnant":
      updatedResponses.isPregnantOrPostpartum = answer as boolean;
      break;
    case "family-child":
      updatedResponses.hasDependentChild13OrYounger = answer as boolean;
      break;
    case "family-disabled-dependent":
      updatedResponses.isParentGuardianOfDisabled = answer as boolean;
      break;
    case "health-medicare":
      updatedResponses.isOnMedicare = answer as boolean;
      break;
    case "health-non-magi":
      updatedResponses.isEligibleForNonMAGI = answer as boolean;
      break;
    case "health-disabled-veteran":
      updatedResponses.isDisabledVeteran = answer as boolean;
      break;
    case "health-medically-frail":
      updatedResponses.isMedicallyFrail = answer as boolean;
      break;
    case "program-snap-tanf":
      updatedResponses.isOnSNAPOrTANFMeetingRequirements = answer as boolean;
      break;
    case "program-rehab":
      updatedResponses.isInRehabProgram = answer as boolean;
      break;
    case "other-incarcerated":
      updatedResponses.isIncarceratedOrRecentlyReleased = answer as boolean;
      break;
    case "other-tribal":
      updatedResponses.hasTribalStatus = answer as boolean;
      break;
  }

  return updatedResponses;
}

/**
 * Calculate progress through the screening
 * Returns current category and approximate progress percentage
 */
export function calculateProgress(
  responses: ExemptionResponses,
  currentQuestionId?: string,
): {
  currentCategory: ExemptionCategory | null;
  categoriesCompleted: number;
  totalCategories: number;
  progressPercentage: number;
} {
  if (!currentQuestionId) {
    return {
      currentCategory: null,
      categoriesCompleted: 0,
      totalCategories: categoryOrder.length,
      progressPercentage: 0,
    };
  }

  const currentQuestion = allQuestions.find((q) => q.id === currentQuestionId);
  if (!currentQuestion) {
    return {
      currentCategory: null,
      categoriesCompleted: 0,
      totalCategories: categoryOrder.length,
      progressPercentage: 0,
    };
  }

  const currentCategory = currentQuestion.category;
  const currentCategoryIndex = categoryOrder.indexOf(currentCategory);

  // Count how many categories have been completed
  let categoriesCompleted = 0;
  for (let i = 0; i < currentCategoryIndex; i++) {
    const categoryQuestions = getQuestionsByCategory(categoryOrder[i]);
    const allAnswered = categoryQuestions.every((q) =>
      isQuestionAnswered(q, responses),
    );
    if (allAnswered) {
      categoriesCompleted++;
    }
  }

  const progressPercentage = Math.round(
    (categoriesCompleted / categoryOrder.length) * 100,
  );

  return {
    currentCategory,
    categoriesCompleted,
    totalCategories: categoryOrder.length,
    progressPercentage,
  };
}

/**
 * Navigate to the next question and update flow state
 */
export function advanceToNextQuestion(
  state: QuestionFlowState,
  answer: boolean | Date | string,
): QuestionFlowState {
  if (!state.currentQuestionId) {
    return state;
  }

  // Update responses
  const updatedResponses = updateResponses(
    state.responses,
    state.currentQuestionId,
    answer,
  );

  // Add current question to history
  const updatedHistory = [...state.questionHistory, state.currentQuestionId];

  // Get next question (with short-circuit check)
  const nextQuestion = getNextQuestion(
    updatedResponses,
    state.currentQuestionId,
  );

  // If no next question, screening is complete
  if (!nextQuestion) {
    const result = calculateExemption(updatedResponses);
    return {
      currentQuestionId: null,
      responses: updatedResponses,
      questionHistory: updatedHistory,
      isComplete: true,
      result,
    };
  }

  return {
    currentQuestionId: nextQuestion.id,
    responses: updatedResponses,
    questionHistory: updatedHistory,
    isComplete: false,
  };
}

/**
 * Navigate back to the previous question
 */
export function goToPreviousQuestion(
  state: QuestionFlowState,
): QuestionFlowState {
  if (state.questionHistory.length === 0) {
    return state; // Already at first question
  }

  // Remove last question from history
  const updatedHistory = state.questionHistory.slice(0, -1);

  // Get previous question ID
  const previousQuestionId =
    updatedHistory.length > 0
      ? updatedHistory[updatedHistory.length - 1]
      : allQuestions[0].id;

  return {
    ...state,
    currentQuestionId: previousQuestionId,
    questionHistory: updatedHistory,
    isComplete: false,
    result: undefined,
  };
}

/**
 * Get category display name for UI
 */
export function getCategoryDisplayName(category: ExemptionCategory): string {
  switch (category) {
    case "age":
      return "Age";
    case "family-caregiving":
      return "Family & Caregiving";
    case "health-disability":
      return "Health & Disability";
    case "program-participation":
      return "Program Participation";
    case "other":
      return "Other Exemptions";
  }
}
