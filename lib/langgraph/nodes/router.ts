import "server-only";
import type { InterviewState } from "../state";

const MAX_QUESTIONS = 9;
const MIN_QUESTIONS_BEFORE_CLOSE = 5;

export function routerNode(state: InterviewState): Partial<InterviewState> {
  // Opening — no routing needed, go straight to generate
  if (state.stage === "opening") {
    return { nextAction: null, stage: "in_progress" };
  }

  // Force close if max questions reached
  if (state.questionCount >= MAX_QUESTIONS) {
    return { nextAction: "close", stage: "closing" };
  }

  // Decide based on answer quality
  const { answerQuality, questionCount } = state;

  if (answerQuality === "weak" || answerQuality === "incomplete") {
    return { nextAction: "followup" };
  }

  if (answerQuality === "interesting") {
    return { nextAction: "followup" };
  }

  // Strong answer — move on, unless we should close
  if (answerQuality === "strong" && questionCount >= MIN_QUESTIONS_BEFORE_CLOSE) {
    // 30% chance to wrap up after min questions covered
    const shouldClose = Math.random() < 0.3;
    if (shouldClose) {
      return { nextAction: "close", stage: "closing" };
    }
  }

  return { nextAction: "next_question" };
}

// Conditional edge function — returns the branch name
export function routerEdge(state: InterviewState): string {
  return state.nextAction ?? "next_question";
}
