import "server-only";
import type { InterviewState } from "../state";

// Full interview: 6 questions (~7-8 min)
// Fast interview: 3 questions (~2-3 min)
function limits(mode: string) {
  return mode === "fast"
    ? { max: 3, minBeforeClose: 2 }
    : { max: 6, minBeforeClose: 4 };
}

export function routerNode(state: InterviewState): Partial<InterviewState> {
  // Opening — go straight to generate
  if (state.stage === "opening") {
    return { nextAction: undefined, stage: "in_progress" };
  }

  const { max, minBeforeClose } = limits(state.mode ?? "full");

  // Hard cap
  if (state.questionCount >= max) {
    return { nextAction: "close", stage: "closing" };
  }

  const { answerQuality, questionCount } = state;

  // Fast mode: minimal follow-ups — only follow up on genuinely incomplete answers
  if (state.mode === "fast") {
    if (answerQuality === "incomplete") return { nextAction: "followup" };
    if (questionCount >= minBeforeClose)  return { nextAction: "close", stage: "closing" };
    return { nextAction: "next_question" };
  }

  // Full mode: intelligent routing
  if (answerQuality === "weak" || answerQuality === "incomplete") {
    return { nextAction: "followup" };
  }
  if (answerQuality === "interesting") {
    return { nextAction: "followup" };
  }
  if (answerQuality === "strong" && questionCount >= minBeforeClose) {
    if (Math.random() < 0.3) return { nextAction: "close", stage: "closing" };
  }

  return { nextAction: "next_question" };
}

export function routerEdge(state: InterviewState): string {
  return state.nextAction ?? "null";
}
