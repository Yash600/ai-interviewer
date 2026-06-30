import { NextRequest, NextResponse } from "next/server";
import { getSessionById, updateSessionState, insertMessage } from "@/lib/db/queries";
import { runInterviewTurn } from "@/lib/langgraph/interview-graph";
import type { InterviewState, Message } from "@/lib/langgraph/state";

export const runtime = "nodejs";

// VAPI Custom LLM endpoint — supports both streaming and non-streaming
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const isStream = body.stream === true;

    // VAPI passes sessionId in different metadata locations
    const sessionId: string =
      body.call?.metadata?.sessionId ??
      body.call?.assistantOverrides?.metadata?.sessionId ??
      body.metadata?.sessionId;

    console.log("[vapi/chat] sessionId:", sessionId, "stream:", isStream, "call_id:", body.call?.id);
    console.log("[vapi/chat] call.metadata:", JSON.stringify(body.call?.metadata));
    console.log("[vapi/chat] messages count:", body.messages?.length);

    if (!sessionId) {
      const demo = "Hello! I'm Alex. This is a test call — please start a real interview from the app.";
      return isStream ? streamResponse(body.model, demo) : openAIResponse(body.model, demo);
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      const msg = "Session not found. Please start a new interview.";
      return isStream ? streamResponse(body.model, msg) : openAIResponse(body.model, msg);
    }

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
    const responseText = updatedState.aiResponse ?? "Could you repeat that?";

    if (updatedState.aiResponse) {
      await insertMessage({ sessionId: session.id, role: "assistant", content: updatedState.aiResponse });
    }

    await updateSessionState(session.id, {
      messages: updatedState.messages,
      stage: updatedState.stage,
      topicsCovered: updatedState.topicsCovered,
      questionCount: updatedState.questionCount,
    });

    console.log("[vapi/chat] response:", responseText.slice(0, 120));
    return isStream ? streamResponse(body.model, responseText) : openAIResponse(body.model, responseText);

  } catch (err) {
    console.error("[vapi/chat] ERROR:", err);
    const msg = "I'm sorry, could you repeat that?";
    // Default to streaming since that's what VAPI uses
    return streamResponse("interview-ai", msg);
  }
}

// ── Non-streaming (JSON) ──────────────────────────────────────
function openAIResponse(model: string, content: string) {
  return NextResponse.json({
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: model ?? "interview-ai",
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  });
}

// ── Streaming (SSE) ───────────────────────────────────────────
function streamResponse(model: string, content: string) {
  const encoder = new TextEncoder();
  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);
  const m = model ?? "interview-ai";

  const chunks = [
    // role chunk
    { id, object: "chat.completion.chunk", created, model: m, choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }] },
    // content chunk (single chunk with full text — VAPI handles this fine)
    { id, object: "chat.completion.chunk", created, model: m, choices: [{ index: 0, delta: { content }, finish_reason: null }] },
    // finish chunk
    { id, object: "chat.completion.chunk", created, model: m, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] },
  ];

  const readable = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
