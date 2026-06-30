import { NextRequest, NextResponse } from "next/server";
import { getSessionById, updateSessionState, insertMessage } from "@/lib/db/queries";
import { runInterviewTurn } from "@/lib/langgraph/interview-graph";
import type { InterviewState, Message } from "@/lib/langgraph/state";

export const runtime = "nodejs";

// VAPI Custom LLM endpoint — receives OpenAI-format chat completions requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // VAPI passes metadata via different paths depending on how start() is called
    const sessionId: string =
      body.call?.metadata?.sessionId ??
      body.call?.assistantOverrides?.metadata?.sessionId ??
      body.metadata?.sessionId;
    console.log("[vapi/chat] sessionId:", sessionId, "call_id:", body.call?.id);
    // Full dump so we can see exactly where VAPI puts metadata
    console.log("[vapi/chat] call.metadata:", JSON.stringify(body.call?.metadata));
    console.log("[vapi/chat] call.assistantOverrides:", JSON.stringify(body.call?.assistantOverrides));
    console.log("[vapi/chat] messages count:", body.messages?.length);

    if (!sessionId) {
      // Simulation / test call with no session — return a demo response
      return openAIResponse(body.model, "Hello! I'm Alex, your AI interviewer. This is a test — start a real interview from the app to begin.");
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      console.log("[vapi/chat] session not found:", sessionId);
      return openAIResponse(body.model, "Session not found. Please start a new interview.");
    }

    // Extract last user message from the messages array VAPI sends
    const messages: { role: string; content: string }[] = body.messages ?? [];
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");

    const storedState = session.state_json ?? {};
    const currentState: InterviewState = {
      sessionId: session.id,
      interviewType: session.interview_type,
      candidateProfile: {
        name: session.name,
        jobRole: session.job_role,
        experienceLevel: session.experience_level,
      },
      messages: storedState.messages ?? [],
      answerQuality: undefined,
      nextAction: undefined,
      stage: storedState.stage ?? "opening",
      topicsCovered: storedState.topicsCovered ?? [],
      questionCount: storedState.questionCount ?? 0,
      aiResponse: "",
    };

    if (lastUserMsg?.content?.trim()) {
      currentState.messages = [
        ...currentState.messages,
        { role: "user", content: lastUserMsg.content.trim() } as Message,
      ];
      await insertMessage({ sessionId: session.id, role: "user", content: lastUserMsg.content.trim() });
    }

    const updatedState = await runInterviewTurn(currentState);

    if (updatedState.aiResponse) {
      await insertMessage({ sessionId: session.id, role: "assistant", content: updatedState.aiResponse });
    }

    await updateSessionState(session.id, {
      messages: updatedState.messages,
      stage: updatedState.stage,
      topicsCovered: updatedState.topicsCovered,
      questionCount: updatedState.questionCount,
    });

    console.log("[vapi/chat] response:", updatedState.aiResponse?.slice(0, 100));
    return openAIResponse(body.model, updatedState.aiResponse ?? "Could you repeat that?");

  } catch (err) {
    console.error("[vapi/chat] ERROR:", err);
    return openAIResponse("interview-ai", "I'm sorry, could you repeat that?");
  }
}

function openAIResponse(model: string, content: string) {
  return NextResponse.json({
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: model ?? "interview-ai",
    choices: [{
      index: 0,
      message: { role: "assistant", content },
      finish_reason: "stop",
    }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  });
}
