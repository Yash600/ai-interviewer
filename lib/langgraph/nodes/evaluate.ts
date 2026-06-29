import "server-only";
import { ChatGroq } from "@langchain/groq";
import type { InterviewState } from "../state";

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0,
  maxTokens: 10,
});

export async function evaluateAnswerNode(
  state: InterviewState
): Promise<Partial<InterviewState>> {
  // Skip evaluation for the opening (first AI message, no user answer yet)
  if (state.stage === "opening" || state.messages.length < 2) {
    return { answerQuality: undefined, nextAction: undefined };
  }

  const lastUserMsg = [...state.messages].reverse().find(m => m.role === "user");
  if (!lastUserMsg) return { answerQuality: undefined, nextAction: undefined };

  const response = await llm.invoke([
    {
      role: "system",
      content: `You are evaluating a job interview answer for a ${state.interviewType} interview.
Classify the answer as exactly one word:
- "strong": clear, specific, well-structured, includes concrete details or results
- "weak": vague, generic, lacks specifics, no concrete outcome
- "incomplete": started a good answer but missed key elements (situation, action, OR result)
- "interesting": raises a compelling point worth exploring further

Reply with exactly one word only.`,
    },
    {
      role: "user",
      content: `Candidate answer: "${lastUserMsg.content}"`,
    },
  ]);

  const raw = (response.content as string).trim().toLowerCase();
  const valid = ["strong", "weak", "incomplete", "interesting"];
  const quality = valid.includes(raw) ? raw : "weak";

  return { answerQuality: quality as InterviewState["answerQuality"] };
}
