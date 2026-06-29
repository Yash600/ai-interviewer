import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { endSession, getSessionById, getSessionMessages, createFeedback } from "@/lib/db/queries";
import { generateFeedback } from "@/lib/langgraph/nodes/feedback";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const session = await getSessionById(sessionId);
    if (!session || session.user_id !== payload.userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Mark session as completed
    await endSession(sessionId);

    // Fetch full transcript
    const messages = await getSessionMessages(sessionId);
    if (messages.length < 2) {
      // Too short to generate feedback
      return NextResponse.json({ sessionId, feedbackGenerated: false });
    }

    // Generate feedback with LangGraph feedback node
    const feedback = await generateFeedback(
      session.interview_type,
      { name: session.name, jobRole: session.job_role, experienceLevel: session.experience_level },
      messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
    );

    // Save feedback to DB
    await createFeedback({ sessionId, ...feedback });

    return NextResponse.json({ sessionId, feedbackGenerated: true });
  } catch (err) {
    console.error("[interview/end]", err);
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
  }
}
