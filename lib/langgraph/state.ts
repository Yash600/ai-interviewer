import "server-only";
import { Annotation } from "@langchain/langgraph";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CandidateProfile {
  name: string;
  jobRole: string;
  experienceLevel: string;
}

export const InterviewStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>(),
  interviewType: Annotation<string>(),
  candidateProfile: Annotation<CandidateProfile>(),
  messages: Annotation<Message[]>({
    reducer: (existing, incoming) => existing.concat(incoming),
    default: () => [],
  }),
  answerQuality: Annotation<"strong" | "weak" | "incomplete" | "interesting" | null>({
    default: () => null,
  }),
  nextAction: Annotation<"followup" | "next_question" | "close" | null>({
    default: () => null,
  }),
  stage: Annotation<"opening" | "in_progress" | "closing" | "done">({
    default: () => "opening",
  }),
  topicsCovered: Annotation<string[]>({
    reducer: (existing, incoming) => [...new Set([...existing, ...incoming])],
    default: () => [],
  }),
  questionCount: Annotation<number>({
    default: () => 0,
  }),
  aiResponse: Annotation<string>({
    default: () => "",
  }),
});

export type InterviewState = typeof InterviewStateAnnotation.State;
