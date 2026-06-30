"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Vapi from "@vapi-ai/web";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type CallStatus = "idle" | "connecting" | "active" | "ai_speaking" | "ended";

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!;

export default function InterviewRoomPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Set up VAPI client once
  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setStatus("active");
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    });

    vapi.on("call-end", () => {
      setStatus("ended");
      if (timerRef.current) clearInterval(timerRef.current);
    });

    vapi.on("speech-start", () => setStatus("ai_speaking"));
    vapi.on("speech-end",   () => setStatus("active"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setTranscript(msg.transcript);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on("error", (err: any) => {
      console.error("[vapi error]", err);
      setStatus("idle");
    });

    return () => {
      vapi.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start call — must be triggered by user click (user gesture unlocks audio)
  async function handleStart() {
    const vapi = vapiRef.current;
    if (!vapi) return;
    setStatus("connecting");
    try {
      await vapi.start(VAPI_ASSISTANT_ID, {
        // Pass sessionId so our webhook can look up the session
        metadata: { sessionId },
      } as Parameters<typeof vapi.start>[1]);
    } catch (err) {
      console.error("[vapi start error]", err);
      setStatus("idle");
    }
  }

  async function handleEnd() {
    if (ending) return;
    setEnding(true);
    vapiRef.current?.stop();
    setStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    // Wait for VAPI end-of-call webhook to generate feedback
    await new Promise(r => setTimeout(r, 4000));
    router.push(`/report/${sessionId}`);
  }

  const statusLabel: Record<CallStatus, string> = {
    idle:        "Ready to begin",
    connecting:  "Connecting...",
    active:      "Listening to you",
    ai_speaking: "AI Interviewer Speaking",
    ended:       "Session Ended",
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #2d1b69 0%, #0d0d1a 60%)" }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", backdropFilter: "blur(10px)" }}>
          🧠 AI Interview
        </div>
        <div className="text-sm font-bold px-4 py-2 rounded-full font-mono"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a78bfa", backdropFilter: "blur(10px)" }}>
          ⏱ {formatTime(elapsed)}
        </div>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
        <div className="relative mb-6">
          {status === "ai_speaking" && (
            <>
              <div className="absolute rounded-full border orb-ring"
                style={{ inset: "-20px", borderColor: "rgba(167,139,250,0.2)" }} />
              <div className="absolute rounded-full border orb-ring-2"
                style={{ inset: "-38px", borderColor: "rgba(167,139,250,0.1)" }} />
            </>
          )}
          <motion.div
            animate={{ scale: status === "ai_speaking" ? [1, 1.03, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-40 h-40 rounded-full flex items-center justify-center text-5xl"
            style={{
              background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), rgba(124,58,237,0.7) 45%, rgba(88,28,220,0.9))",
              boxShadow: "0 0 60px rgba(124,58,237,0.5), 0 0 120px rgba(124,58,237,0.2), inset 0 2px 0 rgba(255,255,255,0.25)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
            🎙
          </motion.div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full"
            style={{
              background: status === "ai_speaking" ? "#a3e635" : status === "active" ? "#a78bfa" : "#6b7280",
              boxShadow: status === "ai_speaking" ? "0 0 8px #a3e635" : "none",
            }} />
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
            {statusLabel[status]}
          </span>
        </div>

        <div className="flex items-center gap-1 h-8 mb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`w-1 rounded-full wave-bar ${status === "ai_speaking" ? "" : "opacity-20"}`}
              style={{ height: `${16 + (i % 4) * 6}px`, background: "linear-gradient(180deg, #a78bfa, #7c3aed)" }} />
          ))}
        </div>

        {transcript && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl p-4 mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Just said</p>
            <p className="text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.7)" }}>{transcript}</p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 px-6 pb-8 flex gap-3 max-w-sm mx-auto w-full">
        {status === "idle" ? (
          <button onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)", border: "1px solid rgba(167,139,250,0.3)", color: "white", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
            🎙 Start Interview
          </button>
        ) : (
          <>
            <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
              🎤 {status === "active" ? "Listening..." : status === "connecting" ? "Connecting..." : status === "ai_speaking" ? "AI Speaking" : "Mic"}
            </div>
            <button onClick={handleEnd} disabled={ending || status === "ended"}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
              {ending ? "Ending..." : "⬛ End Interview"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
