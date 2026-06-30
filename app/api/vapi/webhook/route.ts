import { NextRequest, NextResponse } from "next/server";
import { endSession, getSessionById, getSessionMessages, createFeedback } from "@/lib/db/queries";
import { generateFeedback } from "@/lib/langgraph/nodes/feedback";

export const runtime = "nodejs";

// VAPI server webhook — handles call lifecycle events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;
    const type = message?.type ?? body.type;

    console.log("[vapi/webhook] type:", type);

    if (type === "end-of-call-report") {
      const call = message?.call ?? body.call;
      const sessionId =
        call?.metadata?.sessionId ??
        call?.assistantOverrides?.metadata?.sessionId ??
        body.metadata?.sessionId;
      console.log("[vapi/webhook] sessionId:", sessionId);
      if (!sessionId) return NextResponse.json({ ok: true });

      const session = await getSessionById(sessionId);
      if (!session) return NextResponse.json({ ok: true });

      await endSession(sessionId);

      const messages = await getSessionMessages(sessionId);
      if (messages.length >= 2) {
        const feedback = await generateFeedback(
          session.interview_type,
          { name: session.name, jobRole: session.job_role, experienceLevel: session.experience_level },
          messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
        );
        await createFeedback({ sessionId, ...feedback });
        console.log("[vapi/webhook] feedback generated for session:", sessionId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[vapi/webhook] ERROR:", err);
    return NextResponse.json({ ok: true }); // always 200
  }
}
