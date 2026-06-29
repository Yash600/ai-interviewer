import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { createSession, updateSessionCallId, getUserById } from "@/lib/db/queries";
import { retell } from "@/lib/retell/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { interviewType } = await req.json();
    const validTypes = ["behavioral", "technical", "system_design", "hr"];
    if (!validTypes.includes(interviewType)) {
      return NextResponse.json({ error: "Invalid interview type" }, { status: 400 });
    }

    // Create session in DB
    const session = await createSession({ userId: payload.userId, interviewType });

    // Create Retell web call
    const webCallResponse = await retell.call.createWebCall({
      agent_id: process.env.NEXT_PUBLIC_RETELL_AGENT_ID!,
      metadata: { sessionId: session.id },
    });

    // Store Retell call ID in session
    await updateSessionCallId(session.id, webCallResponse.call_id);

    return NextResponse.json({
      sessionId: session.id,
      accessToken: webCallResponse.access_token,
    });
  } catch (err) {
    console.error("[interview/create]", err);
    return NextResponse.json({ error: "Failed to create interview session" }, { status: 500 });
  }
}
