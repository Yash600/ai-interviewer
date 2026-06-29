import "server-only";
import { ChatGroq } from "@langchain/groq";
import type { Message } from "../state";

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.3,
  maxTokens: 1200,
});

export interface FeedbackResult {
  overallScore: number;
  communication: string;
  structure: string;
  strengths: string[];
  improvements: string[];
  topicsCovered: string[];
  summary: string;
}

export async function generateFeedback(
  interviewType: string,
  candidateProfile: { name: string; jobRole: string; experienceLevel: string },
  messages: Message[]
): Promise<FeedbackResult> {
  const transcript = messages
    .map(m => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
    .join("\n\n");

  const response = await llm.invoke([
    {
      role: "system",
      content: `You are an expert interview coach. Analyze this ${interviewType} interview transcript and provide detailed, specific feedback.

Return a JSON object with EXACTLY this structure:
{
  "overallScore": <number 0-100>,
  "communication": <grade: "A+"|"A"|"A-"|"B+"|"B"|"B-"|"C+"|"C"|"C-">,
  "structure": <grade: "A+"|"A"|"A-"|"B+"|"B"|"B-"|"C+"|"C"|"C-">,
  "strengths": [<3-4 specific strengths referencing what they actually said>],
  "improvements": [<2-3 specific improvements with actionable advice>],
  "topicsCovered": [<list of topics that were discussed>],
  "summary": <2 sentence overall assessment>
}

Be specific. Reference actual things the candidate said. Do not be generic.`,
    },
    {
      role: "user",
      content: `CANDIDATE: ${candidateProfile.name} | ROLE: ${candidateProfile.jobRole} | EXPERIENCE: ${candidateProfile.experienceLevel}\n\nTRANSCRIPT:\n${transcript}`,
    },
  ]);

  const raw = response.content as string;
  // Extract JSON block from the response (Groq sometimes wraps in markdown)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse feedback JSON — no JSON block found");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // Groq occasionally produces malformed JSON — strip control chars and retry
    const cleaned = jsonMatch[0]
      .replace(/[\x00-\x1F\x7F]/g, " ") // strip control characters
      .replace(/,\s*}/g, "}")            // trailing commas
      .replace(/,\s*]/g, "]");
    parsed = JSON.parse(cleaned);
  }
  return {
    overallScore: parsed.overallScore ?? 70,
    communication: parsed.communication ?? "B",
    structure: parsed.structure ?? "B",
    strengths: parsed.strengths ?? [],
    improvements: parsed.improvements ?? [],
    topicsCovered: parsed.topicsCovered ?? [],
    summary: parsed.summary ?? "",
  };
}
