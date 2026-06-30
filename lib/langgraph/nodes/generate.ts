import "server-only";
import { ChatGroq } from "@langchain/groq";
import { buildSystemPrompt } from "../prompts";
import type { InterviewState } from "../state";

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.7,
  maxTokens: 200,
});

export async function generateResponseNode(
  state: InterviewState
): Promise<Partial<InterviewState>> {
  const systemPrompt = buildSystemPrompt(
    state.interviewType,
    state.candidateProfile,
    state.nextAction ?? null,
    state.questionCount,
    state.mode ?? "full"
  );

  // Build conversation history for the LLM (last 12 messages max for context window)
  const history = state.messages.slice(-12).map(m => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    ...history,
  ]);

  const aiResponse = (response.content as string).trim();
  const isClose = state.nextAction === "close";

  return {
    messages: [{ role: "assistant", content: aiResponse }],
    aiResponse,
    questionCount: isClose ? state.questionCount : state.questionCount + 1,
    stage: isClose ? "done" : state.stage,
  };
}
