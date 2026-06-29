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

// Scalar reducer — just replace with incoming value
const replace = <T>(existing: T, incoming: T): T => incoming ?? existing;

export const InterviewStateAnnotation = Annotation.Root({
  sessionId:        Annotation<string>(),
  interviewType:    Annotation<string>(),
  candidateProfile: Annotation<CandidateProfile>(),

  messages: Annotation<Message[]>({
    reducer: (existing, incoming) => existing.concat(incoming),
    default: () => [],
  }),

  answerQuality: Annotation<"strong" | "weak" | "incomplete" | "interesting" | undefined>({
    reducer: replace,
    default: () => undefined,
  }),

  nextAction: Annotation<"followup" | "next_question" | "close" | undefined>({
    reducer: replace,
    default: () => undefined,
  }),

  stage: Annotation<"opening" | "in_progress" | "closing" | "done">({
    reducer: replace,
    default: () => "opening" as const,
  }),

  topicsCovered: Annotation<string[]>({
    reducer: (existing, incoming) => [...new Set([...existing, ...incoming])],
    default: () => [],
  }),

  questionCount: Annotation<number>({
    reducer: replace,
    default: () => 0,
  }),

  aiResponse: Annotation<string>({
    reducer: replace,
    default: () => "",
  }),
});

export type InterviewState = typeof InterviewStateAnnotation.State;
