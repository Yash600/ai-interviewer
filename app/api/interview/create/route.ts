import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { createSession } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { interviewType, mode } = await req.json();
    const validTypes = ["behavioral", "technical", "system_design", "hr"];
    if (!validTypes.includes(interviewType)) {
      return NextResponse.json({ error: "Invalid interview type" }, { status: 400 });
    }

    const session = await createSession({
      userId: payload.userId,
      interviewType,
      mode: mode === "fast" ? "fast" : "full",
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("[interview/create]", err);
    return NextResponse.json({ error: "Failed to create interview session" }, { status: 500 });
  }
}
