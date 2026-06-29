import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserSessions } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await getUserSessions(payload.userId);
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
