import { NextRequest, NextResponse } from "next/server";
import { getSessionByCallId, updateSessionState, insertMessage } from "@/lib/db/queries";
import { runInterviewTurn } from "@/lib/langgraph/interview-graph";
import type { InterviewState, Message } from "@/lib/langgraph/state";

export const runtime = "nodejs";

// Retell Custom LLM Webhook
// Called on every user turn during the voice conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[chat] interaction_type:", body.interaction_type, "call_id:", body.call?.call_id);

    // Retell sends interaction_type — handle response_required, reminder_required, call_started
    if (body.interaction_type === "ping_pong") {
      return NextResponse.json({ response_id: body.response_id, content: "", content_complete: true });
    }

    const handled = ["response_required", "reminder_required", "call_started"];
    if (!handled.includes(body.interaction_type)) {
      console.log("[chat] unhandled interaction_type, returning empty");
      return NextResponse.json({ response_id: body.response_id, content: "", content_complete: true });
    }

    const callId: string = body.call?.call_id;
    if (!callId) {
      console.log("[chat] missing call_id, body keys:", Object.keys(body));
      return NextResponse.json({ error: "Missing call_id" }, { status: 400 });
    }

    // Load session from DB
    const session = await getSessionByCallId(callId);
    if (!session) {
      console.log("[chat] session not found for call_id:", callId);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    console.log("[chat] session found:", session.id, "stage:", session.state_json?.stage ?? "opening");

    // Build current state from DB (stored state_json + candidate profile)
    const storedState = session.state_json ?? {};
    const candidateProfile = {
      name: session.name,
      jobRole: session.job_role,
      experienceLevel: session.experience_level,
    };

    // Extract latest user message from Retell transcript
    const transcript: { role: string; content: string }[] = body.transcript ?? [];
    const lastUserMsg = [...transcript].reverse().find(m => m.role === "user");

    // Build state for this turn
    const currentState: InterviewState = {
      sessionId: session.id,
      interviewType: session.interview_type,
      candidateProfile,
      messages: storedState.messages ?? [],
      answerQuality: undefined,
      nextAction: undefined,
      stage: storedState.stage ?? "opening",
      topicsCovered: storedState.topicsCovered ?? [],
      questionCount: storedState.questionCount ?? 0,
      aiResponse: "",
    };

    // Append new user message if present
    if (lastUserMsg && lastUserMsg.content?.trim()) {
      currentState.messages = [
        ...currentState.messages,
        { role: "user", content: lastUserMsg.content.trim() } as Message,
      ];
      // Persist user message to messages table
      await insertMessage({ sessionId: session.id, role: "user", content: lastUserMsg.content.trim() });
    }

    // Run LangGraph
    const updatedState = await runInterviewTurn(currentState);

    // Persist assistant response
    if (updatedState.aiResponse) {
      await insertMessage({ sessionId: session.id, role: "assistant", content: updatedState.aiResponse });
    }

    // Save updated state back to DB
    await updateSessionState(session.id, {
      messages: updatedState.messages,
      stage: updatedState.stage,
      topicsCovered: updatedState.topicsCovered,
      questionCount: updatedState.questionCount,
    });

    const responseContent = updatedState.aiResponse ?? "";
    console.log("[chat] returning content (first 100):", responseContent.slice(0, 100));

    // Return response to Retell — it will speak this text
    return NextResponse.json({
      response_id: body.response_id,
      content: responseContent,
      content_complete: true,
    });
  } catch (err) {
    console.error("[interview/chat] ERROR:", err);
    return NextResponse.json(
      { response_id: 0, content: "I'm sorry, could you repeat that?", content_complete: true },
      { status: 200 } // Always return 200 to Retell
    );
  }
}
