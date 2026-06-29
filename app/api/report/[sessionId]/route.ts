import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { getSessionById, getFeedbackBySessionId, getSessionMessages } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await params;
    const session = await getSessionById(sessionId);
    if (!session || session.user_id !== payload.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [feedback, messages] = await Promise.all([
      getFeedbackBySessionId(sessionId),
      getSessionMessages(sessionId),
    ]);

    return NextResponse.json({ session, feedback, messages });
  } catch (err) {
    console.error("[report]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
